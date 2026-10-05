import fs from 'node:fs'
import path from 'node:path'
import { SEO_ROUTES, SOCIAL_IMAGE_ALT, canonicalUrl, robotsContent, socialImageFor } from '../src/seo.js'

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
  const expectedSocialImage = socialImageFor(route)

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
  if (!html.includes(`property="og:image" content="${expectedSocialImage}"`)) failures.push(`Missing social preview image in ${file}`)
  if (!html.includes(`property="og:image:secure_url" content="${expectedSocialImage}"`)) failures.push(`Missing secure Open Graph image URL in ${file}`)
  if (!html.includes(`property="og:image:alt" content="${escapeHtml(SOCIAL_IMAGE_ALT)}"`)) failures.push(`Missing Open Graph image alt text in ${file}`)
  if (!html.includes('property="og:image:width" content="1200"') || !html.includes('property="og:image:height" content="630"')) failures.push(`Wrong social image dimensions in ${file}`)
  if (!html.includes('name="twitter:card" content="summary_large_image"')) failures.push(`Missing large Twitter/X card in ${file}`)
  if (!html.includes(`name="twitter:image" content="${expectedSocialImage}"`)) failures.push(`Missing Twitter/X image in ${file}`)
  if (!html.includes(`rel="alternate" hreflang="en-US" href="${expectedCanonical}"`)) failures.push(`Missing en-US hreflang in ${file}`)
  if (!html.includes(`rel="alternate" hreflang="x-default" href="${expectedCanonical}"`)) failures.push(`Missing x-default hreflang in ${file}`)
  if (!html.includes('id="esn-route-schema"')) failures.push(`Missing JSON-LD route schema in ${file}`)
  if (!html.includes('"@type":"WebPage"')) failures.push(`Missing WebPage structured data in ${file}`)

  if (route === '/faq' && !html.includes('"@type":"FAQPage"')) failures.push('FAQPage structured data missing from /faq')
  if (route === '/serviceshowcase' && !html.includes('"@type":"Service"')) failures.push('Service structured data missing from /serviceshowcase')
  if (['/fortnite-coaching','/video-editing','/discord-server-setup','/hosting'].includes(route) && !html.includes('"@type":"Service"')) failures.push(`Service structured data missing from ${route}`)
  if (['/website-builder','/site-builder'].includes(route) && !html.includes('"@type":"WebApplication"')) failures.push(`WebApplication structured data missing from ${route}`)
  if (route === '/arcade' && !html.includes('"@type":"VideoGame"')) failures.push('Arcade VideoGame structured data missing from /arcade')
  if (route === '/storesmp' && (!html.includes('"@type":"Product"') || !html.includes('"@type":"Offer"'))) failures.push('Product/Offer structured data missing from /storesmp')
  if (route === '/smpplugin' && !html.includes('"@type":"SoftwareApplication"')) failures.push('SoftwareApplication structured data missing from /smpplugin')
  if (route === '/estools' && !html.includes('"@type":"SoftwareApplication"')) failures.push('ES Tools SoftwareApplication structured data missing from /estools')
  if (route === '/smpconnection' && !html.includes('"@type":"GameServer"')) failures.push('GameServer structured data missing from /smpconnection')
  if (route === '/smpconsole' && !html.includes('"@type":"HowTo"')) failures.push('HowTo structured data missing from /smpconsole')
  if (['/esclicker','/esfactory','/esmines','/esmoto','/estower','/estowerdefense'].includes(route) && !html.includes('"@type":"VideoGame"')) failures.push(`Individual VideoGame structured data missing from ${route}`)
}


function safePublishedSegment(value) {
  const segment = String(value || '').trim()
  return /^[a-z0-9][a-z0-9-]{0,79}$/.test(segment) ? segment : ''
}

const publishedManifestPath = path.join('public', 'generated-sites', 'index.json')
if (fs.existsSync(publishedManifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(publishedManifestPath, 'utf8'))
    for (const entry of manifest.sites || []) {
      const slug = safePublishedSegment(entry?.slug)
      if (!slug) {
        failures.push(`Invalid published site slug: ${entry?.slug || '(missing)'}`)
        continue
      }

      const siteFile = path.join('public', 'generated-sites', `${slug}.json`)
      if (!fs.existsSync(siteFile)) {
        failures.push(`Missing published site data: ${siteFile}`)
        continue
      }

      const site = JSON.parse(fs.readFileSync(siteFile, 'utf8'))
      const rootFile = path.join('dist', 'sites', slug, 'index.html')
      if (!fs.existsSync(rootFile)) failures.push(`Missing published site route: ${rootFile}`)

      if (site.multiPage && Array.isArray(site.pages)) {
        for (const page of site.pages) {
          const pageSlug = safePublishedSegment(page?.slug)
          if (!pageSlug) {
            failures.push(`Invalid published subpage slug for ${slug}: ${page?.slug || '(missing)'}`)
            continue
          }
          const pageFile = path.join('dist', 'sites', slug, pageSlug, 'index.html')
          if (!fs.existsSync(pageFile)) failures.push(`Missing published subpage route: ${pageFile}`)
        }
      }
    }
  } catch (error) {
    failures.push(`Published-site route validation failed: ${error.message}`)
  }
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

const socialImageFile = path.join('dist', 'esn-social-card.svg')
if (!fs.existsSync(socialImageFile)) {
  failures.push('Missing built ES Network social preview asset')
} else {
  const socialImage = fs.readFileSync(socialImageFile, 'utf8')
  if (!socialImage.includes('width="1200"') || !socialImage.includes('height="630"')) failures.push('Social preview asset must remain 1200x630')
  if (!socialImage.includes('BUILD. PLAY. CREATE.')) failures.push('Social preview asset lost ES Network branding')
}

if (failures.length) {
  console.error('Built route SEO validation failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Built SEO validation passed for ${Object.keys(SEO_ROUTES).length} routes.`)
