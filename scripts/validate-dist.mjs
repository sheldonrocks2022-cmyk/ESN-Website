import fs from 'node:fs'
import path from 'node:path'
import { SEO_ROUTES, canonicalUrl, robotsContent } from '../src/seo.js'

const failures = []

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

for (const [route, meta] of Object.entries(SEO_ROUTES)) {
  const file = route === '/'
    ? path.join('dist', 'index.html')
    : path.join('dist', route.slice(1), 'index.html')

  if (!fs.existsSync(file)) {
    failures.push(`Missing built route file: ${file}`)
    continue
  }

  const html = fs.readFileSync(file, 'utf8')
  const expectedCanonical = canonicalUrl(route)
  const expectedRobots = robotsContent(route)

  if (!html.includes(`<title>${escapeHtml(meta.title)}</title>`)) failures.push(`Wrong or missing title in ${file}`)
  if (!html.includes(`name="description" content="${escapeHtml(meta.description)}`)) failures.push(`Wrong or missing description in ${file}`)
  if (!html.includes(`rel="canonical" href="${expectedCanonical}"`)) failures.push(`Wrong or missing canonical in ${file}`)
  if (!html.includes(`name="robots" content="${expectedRobots}"`)) failures.push(`Wrong or missing robots policy in ${file}`)
  if (!html.includes(`name="googlebot" content="${expectedRobots}"`)) failures.push(`Wrong or missing Googlebot policy in ${file}`)
  if (!html.includes(`property="og:title" content="`)) failures.push(`Missing Open Graph title in ${file}`)
  if (!html.includes(`property="og:description" content="`)) failures.push(`Missing Open Graph description in ${file}`)
  if (!html.includes(`property="og:url" content="${expectedCanonical}"`)) failures.push(`Wrong or missing Open Graph URL in ${file}`)
  if (!html.includes('property="og:site_name" content="ES Network"')) failures.push(`Missing Open Graph site name in ${file}`)
  if (!html.includes('name="twitter:title"')) failures.push(`Missing Twitter title in ${file}`)
  if (!html.includes('name="twitter:description"')) failures.push(`Missing Twitter description in ${file}`)
  if (!html.includes('id="esn-route-schema"')) failures.push(`Missing JSON-LD route schema in ${file}`)
  if (!html.includes('"@type":"WebPage"')) failures.push(`Missing WebPage structured data in ${file}`)

  if (route === '/faq' && !html.includes('"@type":"FAQPage"')) failures.push('FAQPage structured data missing from /faq')
  if (route === '/serviceshowcase' && !html.includes('"@type":"Service"')) failures.push('Service structured data missing from /serviceshowcase')
  if (route === '/arcade' && !html.includes('"@type":"VideoGame"')) failures.push('Arcade VideoGame structured data missing from /arcade')
}

const notFoundFile = path.join('dist', '404.html')
if (!fs.existsSync(notFoundFile)) {
  failures.push('Missing built 404.html')
} else {
  const notFound = fs.readFileSync(notFoundFile, 'utf8')
  if (!notFound.includes('name="robots" content="noindex, nofollow"')) failures.push('404.html must be noindex, nofollow')
  if (notFound.includes('rel="canonical"')) failures.push('404.html must not claim a canonical production page')
  if (notFound.includes('id="esn-route-schema"')) failures.push('404.html must not include normal route structured data')
}

const sitemapFile = path.join('dist', 'sitemap.xml')
if (!fs.existsSync(sitemapFile)) {
  failures.push('Missing generated dist/sitemap.xml')
} else {
  const sitemap = fs.readFileSync(sitemapFile, 'utf8')
  const expected = [...new Set(
    Object.entries(SEO_ROUTES)
      .filter(([, meta]) => meta.index !== false)
      .map(([route]) => canonicalUrl(route))
  )]

  for (const url of expected) {
    if (!sitemap.includes(`<loc>${url}</loc>`)) failures.push(`Sitemap missing canonical URL: ${url}`)
  }

  for (const [route, meta] of Object.entries(SEO_ROUTES)) {
    if (meta.index === false) {
      const direct = `https://esnoffical.com${route === '/' ? '/' : route}`
      if (sitemap.includes(`<loc>${direct}</loc>`)) failures.push(`Noindex/alias route leaked into sitemap: ${route}`)
    }
  }
}

if (failures.length) {
  console.error('Built route SEO validation failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Built SEO validation passed for ${Object.keys(SEO_ROUTES).length} routes.`)
