import fs from 'node:fs'
import path from 'node:path'
import { SEO_ROUTES, SOCIAL_IMAGE_ALT, SOCIAL_IMAGE_URL, canonicalUrl, robotsContent, structuredDataFor } from '../src/seo.js'

const sourcePath = path.join('dist', 'index.html')
if (!fs.existsSync(sourcePath)) {
  console.error('dist/index.html not found. Run Vite build first.')
  process.exit(1)
}

const source = fs.readFileSync(sourcePath, 'utf8')

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
  const schema = JSON.stringify(structuredDataFor(route)).replaceAll('<', '\\u003c')

  html = html.replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(meta.title)}</title>`)
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
    `<meta property="og:image" content="${SOCIAL_IMAGE_URL}" />`,
  )
  html = replaceMeta(
    html,
    /<meta property="og:image:alt" content="[^"]*"\s*\/?>/,
    `<meta property="og:image:alt" content="${escapeHtml(SOCIAL_IMAGE_ALT)}" />`,
  )
  html = replaceMeta(
    html,
    /<meta property="og:image:type" content="[^"]*"\s*\/?>/,
    '<meta property="og:image:type" content="image/svg+xml" />',
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
    `<meta name="twitter:image" content="${SOCIAL_IMAGE_URL}" />`,
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

  const schemaTag = `<script id="esn-route-schema" type="application/ld+json">${schema}</script>`
  if (/<script id="esn-route-schema"[^>]*>.*?<\/script>/s.test(html)) {
    html = html.replace(/<script id="esn-route-schema"[^>]*>.*?<\/script>/s, schemaTag)
  } else {
    html = html.replace('</head>', `  ${schemaTag}\n  </head>`)
  }

  return html
}

for (const route of Object.keys(SEO_ROUTES)) {
  const html = injectSeo(source, route)

  if (route === '/') {
    fs.writeFileSync(sourcePath, html)
    continue
  }

  const routeDirectory = path.join('dist', route.replace(/^\//, ''))
  fs.mkdirSync(routeDirectory, { recursive: true })
  fs.writeFileSync(path.join(routeDirectory, 'index.html'), html)
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
  .replace(/<script id="esn-route-schema"[^>]*>.*?<\/script>\s*/s,'')

fs.writeFileSync(path.join('dist', '404.html'), notFoundHtml)

// Generate the deployed sitemap from the same canonical SEO source.
// Only canonical, indexable production routes are included.
const sitemapUrls = [...new Set(
  Object.entries(SEO_ROUTES)
    .filter(([, meta]) => meta.index !== false)
    .map(([route]) => canonicalUrl(route))
)]
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...sitemapUrls.map((url) => `  <url><loc>${url}</loc></url>`),
  '</urlset>',
  '',
].join('\n')
fs.writeFileSync(path.join('dist', 'sitemap.xml'), sitemap)

console.log(`Generated SEO-ready route HTML for ${Object.keys(SEO_ROUTES).length} routes, noindex 404.html, and ${sitemapUrls.length} canonical sitemap URLs.`)
