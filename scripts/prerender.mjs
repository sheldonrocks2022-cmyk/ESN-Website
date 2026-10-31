import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { SEO_ROUTES, SOCIAL_IMAGE_ALT, canonicalUrl, robotsContent, socialImageFor, structuredDataFor } from '../src/seo.js'

const I18N_LANGS = ['es', 'pt-BR', 'fr', 'de', 'fil', 'hi', 'id', 'tr']

const sourcePath = path.join('dist', 'index.html')
if (!fs.existsSync(sourcePath)) {
  console.error('dist/index.html not found. Run Vite build first.')
  process.exit(1)
}

const source = fs.readFileSync(sourcePath, 'utf8')

// The Site Builder page loads its own script and styles; start fetching them with the page instead of after the main script runs.
const assetDirectory = path.join('dist', 'assets')
const builderAssets = fs.existsSync(assetDirectory) ? fs.readdirSync(assetDirectory).filter((file) => /^SiteBuilder-[\w-]+\.(js|css)$/.test(file)) : []

function withRoutePreloads(html, route) {
  if (!/^\/site-builder(\/|$)/.test(route) || builderAssets.length === 0) return html
  const tags = builderAssets
    .map((file) => file.endsWith('.js') ? `<link rel="modulepreload" crossorigin href="/assets/${file}" />` : `<link rel="preload" as="style" href="/assets/${file}" />`)
    .join('\n    ')
  return html.replace('</head>', `  ${tags}\n  </head>`)
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function replaceMeta(html, pattern, replacement) {
  if (pattern.test(html)) return html.replace(pattern, replacement)
  return html.replace('</head>', `  ${replacement}\n  </head>`)
}

function injectSeo(html, route) {
  const meta = SEO_ROUTES[route]
  const url = canonicalUrl(route)
  const robots = robotsContent(route)
  const socialImage = socialImageFor(route)
  const schema = JSON.stringify(structuredDataFor(route)).replaceAll('<', '\\u003c')

  html = html.replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(meta.title)}</title>`)
  // Give crawlers without JavaScript a real heading and summary for every route (React replaces #root on load).
  const heading = route === '/' ? 'ESN Hosting & ES Network' : (meta.label || meta.title)
  html = html.replace(
    '<p class="esn-boot-title">Loading ES Network</p>',
    `<h1 class="esn-boot-title">${escapeHtml(heading)}</h1>\n          <p>${escapeHtml(meta.description)}</p>`,
  )
  html = replaceMeta(
    html,
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
  )
  html = replaceMeta(
    html,
    /<meta name="robots" content="[^"]*"\s*\/?>/,
    `<meta name="robots" content="${robots}" />`,
  )
  html = replaceMeta(
    html,
    /<meta name="googlebot" content="[^"]*"\s*\/?>/,
    `<meta name="googlebot" content="${robots}" />`,
  )
  html = replaceMeta(
    html,
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
  )
  html = replaceMeta(
    html,
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
  )
  html = replaceMeta(
    html,
    /<meta property="og:type" content="[^"]*"\s*\/?>/,
    '<meta property="og:type" content="website" />',
  )
  html = replaceMeta(
    html,
    /<meta property="og:site_name" content="[^"]*"\s*\/?>/,
    '<meta property="og:site_name" content="ES Network" />',
  )
  html = replaceMeta(
    html,
    /<meta property="og:locale" content="[^"]*"\s*\/?>/,
    '<meta property="og:locale" content="en_US" />',
  )
  html = replaceMeta(
    html,
    /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${url}" />`,
  )
  html = replaceMeta(
    html,
    /<meta property="og:image" content="[^"]*"\s*\/?>/,
    `<meta property="og:image" content="${socialImage}" />`,
  )
  html = replaceMeta(
    html,
    /<meta property="og:image:secure_url" content="[^"]*"\s*\/?>/,
    `<meta property="og:image:secure_url" content="${socialImage}" />`,
  )
  html = replaceMeta(
    html,
    /<meta property="og:image:alt" content="[^"]*"\s*\/?>/,
    `<meta property="og:image:alt" content="${escapeHtml(SOCIAL_IMAGE_ALT)}" />`,
  )
  html = replaceMeta(
    html,
    /<meta property="og:image:type" content="[^"]*"\s*\/?>/,
    '<meta property="og:image:type" content="image/png" />',
  )
  html = replaceMeta(
    html,
    /<meta property="og:image:width" content="[^"]*"\s*\/?>/,
    '<meta property="og:image:width" content="1200" />',
  )
  html = replaceMeta(
    html,
    /<meta property="og:image:height" content="[^"]*"\s*\/?>/,
    '<meta property="og:image:height" content="630" />',
  )
  html = replaceMeta(
    html,
    /<meta name="twitter:card" content="[^"]*"\s*\/?>/,
    '<meta name="twitter:card" content="summary_large_image" />',
  )
  html = replaceMeta(
    html,
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
  )
  html = replaceMeta(
    html,
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
  )
  html = replaceMeta(
    html,
    /<meta name="twitter:image" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:image" content="${socialImage}" />`,
  )
  html = replaceMeta(
    html,
    /<meta name="twitter:image:alt" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:image:alt" content="${escapeHtml(SOCIAL_IMAGE_ALT)}" />`,
  )
  html = html.replace(
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${url}" />`,
  )

  const languageLink = `<link rel="alternate" hreflang="en-US" href="${url}" />`
  const defaultLink = `<link rel="alternate" hreflang="x-default" href="${url}" />`
  if (/<link rel="alternate" hreflang="en-US"[^>]*\/>/.test(html)) {
    html = html.replace(/<link rel="alternate" hreflang="en-US"[^>]*\/>/, languageLink)
  } else {
    html = html.replace('</head>', `  ${languageLink}\n  </head>`)
  }
  if (/<link rel="alternate" hreflang="x-default"[^>]*\/>/.test(html)) {
    html = html.replace(/<link rel="alternate" hreflang="x-default"[^>]*\/>/, defaultLink)
  } else {
    html = html.replace('</head>', `  ${defaultLink}\n  </head>`)
  }
  // Language versions (translated in the browser by esn-i18n.js from panel.esnoffical.com; ?lang= picks the language).
  html = html.replace(/\s*<link rel="alternate" hreflang="(?:es|pt-BR|fr|de|fil|hi|id|tr)"[^>]*\/>/g, '')
  const langLinks = I18N_LANGS.map((lang) => `<link rel="alternate" hreflang="${lang}" href="${url}?lang=${lang}" />`).join('\n    ')
  html = html.replace(defaultLink, `${defaultLink}\n    ${langLinks}`)

  const schemaTag = `<script id="esn-route-schema" type="application/ld+json">${schema}</script>`
  if (/<script id="esn-route-schema"[^>]*>.*?<\/script>/s.test(html)) {
    html = html.replace(/<script id="esn-route-schema"[^>]*>.*?<\/script>/s, schemaTag)
  } else {
    html = html.replace('</head>', `  ${schemaTag}\n  </head>`)
  }

  return html
}

function safePublishedSegment(value) {
  const segment = String(value || '').trim()
  return /^[a-z0-9][a-z0-9-]{0,79}$/.test(segment) ? segment : ''
}

function publishedSiteShell(html, site, route, page = null) {
  const title = String(
    page?.title
    || site?.seoTitle
    || site?.brand
    || 'Published ESN Site'
  ).slice(0, 120)
  const description = String(
    page?.copy
    || page?.description
    || site?.seoDescription
    || site?.heroCopy
    || site?.description
    || 'Published with the ESN Website Builder.'
  ).replace(/\s+/g, ' ').trim().slice(0, 240)
  const url = 'https://esnoffical.com' + route

  html = html.replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`)
  html = replaceMeta(
    html,
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeHtml(description)}" />`,
  )
  html = replaceMeta(
    html,
    /<meta name="robots" content="[^"]*"\s*\/?>/,
    '<meta name="robots" content="index, follow" />',
  )
  html = replaceMeta(
    html,
    /<meta name="googlebot" content="[^"]*"\s*\/?>/,
    '<meta name="googlebot" content="index, follow" />',
  )
  html = replaceMeta(
    html,
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
  )
  html = replaceMeta(
    html,
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
  )
  html = replaceMeta(
    html,
    /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${url}" />`,
  )
  html = replaceMeta(
    html,
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
  )
  html = replaceMeta(
    html,
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
  )
  html = html.replace(
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${url}" />`,
  )
  return html
}

function generatePublishedSiteRoutes() {
  const manifestPath = path.join('public', 'generated-sites', 'index.json')
  if (!fs.existsSync(manifestPath)) return 0

  let manifest
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  } catch (error) {
    console.warn(`Could not parse published-site manifest: ${error.message}`)
    return 0
  }

  let count = 0
  for (const entry of manifest.sites || []) {
    const slug = safePublishedSegment(entry?.slug)
    if (!slug) continue

    const dataPath = path.join('public', 'generated-sites', `${slug}.json`)
    if (!fs.existsSync(dataPath)) continue

    let site
    try {
      site = { ...entry, ...JSON.parse(fs.readFileSync(dataPath, 'utf8')) }
    } catch (error) {
      console.warn(`Could not parse published site ${slug}: ${error.message}`)
      continue
    }

    const routes = [[`/sites/${slug}`, null]]
    if (site.multiPage && Array.isArray(site.pages)) {
      for (const page of site.pages) {
        const pageSlug = safePublishedSegment(page?.slug)
        if (pageSlug) routes.push([`/sites/${slug}/${pageSlug}`, page])
      }
    }

    for (const [route, page] of routes) {
      const routeDirectory = path.join('dist', route.replace(/^\//, ''))
      fs.mkdirSync(routeDirectory, { recursive: true })
      fs.writeFileSync(path.join(routeDirectory, 'index.html'), publishedSiteShell(source, site, route, page))
      count += 1
    }
  }

  return count
}

for (const route of Object.keys(SEO_ROUTES)) {
  const html = withRoutePreloads(injectSeo(source, route), route)

  if (route === '/') {
    fs.writeFileSync(sourcePath, html)
    continue
  }

  const routeDirectory = path.join('dist', route.replace(/^\//, ''))
  fs.mkdirSync(routeDirectory, { recursive: true })
  fs.writeFileSync(path.join(routeDirectory, 'index.html'), html)
}

const publishedSiteRouteCount = generatePublishedSiteRoutes()

// /terms only redirected client-side, so a direct visit hit GitHub Pages' 404. Ship a static redirect to /rules.
fs.mkdirSync(path.join('dist', 'terms'), { recursive: true })
fs.writeFileSync(path.join('dist', 'terms', 'index.html'), [
  '<!doctype html>',
  '<html lang="en">',
  '<head>',
  '  <meta charset="UTF-8" />',
  '  <title>Rules &amp; Terms | ES Network</title>',
  '  <meta http-equiv="refresh" content="0; url=/rules" />',
  '  <link rel="canonical" href="https://esnoffical.com/rules/" />',
  '  <meta name="robots" content="noindex, follow" />',
  '</head>',
  '<body><p>Our terms are on the <a href="/rules">Rules page</a>.</p></body>',
  '</html>',
  '',
].join('\n'))

// Buyers sometimes type esnoffical.com/checkout, /plans or /pricing. Send them to the real plans and checkout page on the panel.
for (const shortcut of ['checkout', 'plans', 'pricing']) {
  fs.mkdirSync(path.join('dist', shortcut), { recursive: true })
  fs.writeFileSync(path.join('dist', shortcut, 'index.html'), [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="UTF-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1" />',
    '  <title>ESN Hosting Plans &amp; Checkout | ES Network</title>',
    '  <meta http-equiv="refresh" content="0; url=https://panel.esnoffical.com/plans" />',
    '  <link rel="canonical" href="https://esnoffical.com/hosting/vps/" />',
    '  <meta name="robots" content="noindex, follow" />',
    '</head>',
    '<body style="font-family:system-ui,sans-serif;background:#050711;color:#f3f7ff;text-align:center;padding:40px 20px">',
    '  <p>Opening the ESN Hosting plans and checkout…</p>',
    '  <p><a style="color:#62f1ff" href="https://panel.esnoffical.com/plans">Go to the plans page</a> or <a style="color:#62f1ff" href="/hosting/vps/">compare every plan</a>.</p>',
    '</body>',
    '</html>',
    '',
  ].join('\n'))
}

let notFoundHtml = source
  .replace(/<title>.*?<\/title>/s, '<title>Page Not Found | ES Network</title>')
  .replace(
    /<meta name="description" content="[^"]*"\s*\/?>/,
    '<meta name="description" content="The requested ES Network page could not be found." />',
  )

notFoundHtml = replaceMeta(
  notFoundHtml,
  /<meta name="robots" content="[^"]*"\s*\/?>/,
  '<meta name="robots" content="noindex, nofollow" />',
)
notFoundHtml = replaceMeta(
  notFoundHtml,
  /<meta name="googlebot" content="[^"]*"\s*\/?>/,
  '<meta name="googlebot" content="noindex, nofollow" />',
)
notFoundHtml = notFoundHtml
  .replace(/<link rel="canonical" href="[^"]*"\s*\/?>\s*/,'')
  .replace(/<meta property="og:url" content="[^"]*"\s*\/?>\s*/,'')
  .replace(/<link rel="alternate" hreflang="en-US"[^>]*\/?>\s*/,'')
  .replace(/<link rel="alternate" hreflang="x-default"[^>]*\/?>\s*/,'')
  .replace(/<link rel="alternate" hreflang="(?:es|pt-BR|fr|de|fil|hi|id|tr)"[^>]*\/?>\s*/g,'')
  .replace(/<script id="esn-route-schema"[^>]*>.*?<\/script>\s*/s,'')

fs.writeFileSync(path.join('dist', '404.html'), notFoundHtml)

// Generate the deployed sitemap from the same canonical SEO source.
// Only canonical, indexable production routes are included.
const sitemapUrls = [...new Set(
  Object.entries(SEO_ROUTES)
    .filter(([, meta]) => meta.index !== false)
    .map(([route]) => canonicalUrl(route))
)]
const SITEMAP_LASTMOD = Object.fromEntries(['/', '/hosting', '/hosting/vps', '/business/plans'].map((route) => [canonicalUrl(route), '2026-10-30']))
// Every other URL gets the date of the commit being deployed (falls back to the build date), so each sitemap URL carries a lastmod.
const SITEMAP_DEFAULT_LASTMOD = (() => {
  try {
    const day = execSync('git log -1 --format=%cs', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(day)) return day
  } catch {}
  return new Date().toISOString().slice(0, 10)
})()
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...sitemapUrls.map((url) => `  <url><loc>${url}</loc><lastmod>${[SITEMAP_LASTMOD[url] || '', SITEMAP_DEFAULT_LASTMOD].sort().pop()}</lastmod></url>`),
  '</urlset>',
  '',
].join('\n')
fs.writeFileSync(path.join('dist', 'sitemap.xml'), sitemap)

console.log(`Generated SEO-ready route HTML for ${Object.keys(SEO_ROUTES).length} routes, ${publishedSiteRouteCount} published Builder routes, noindex 404.html, and ${sitemapUrls.length} canonical sitemap URLs.`)
