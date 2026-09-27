import fs from 'node:fs'
import path from 'node:path'
import { SEO_ROUTES, canonicalUrl, robotsContent, structuredDataFor } from '../src/seo.js'

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
    /<meta name="twitter:card" content="[^"]*"\s*\/?>/,
    '<meta name="twitter:card" content="summary" />',
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
  html = html.replace(
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${url}" />`,
  )

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
  .replace(/<script id="esn-route-schema"[^>]*>.*?<\/script>\s*/s,'')

fs.writeFileSync(path.join('dist', '404.html'), notFoundHtml)

console.log(`Generated SEO-ready route HTML for ${Object.keys(SEO_ROUTES).length} routes plus noindex 404.html.`)
