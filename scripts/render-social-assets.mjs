import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

// Render the existing ESN artwork without altering the website design.
// PNG previews are needed because major social crawlers, including Discord,
// do not consistently support SVG images in Open Graph cards.
const assets = [
  ['public/esn-social-card.svg', 'public/esn-social-card.png', 1200, 630],
  ...fs.readdirSync('public/social')
    .filter(file => file.endsWith('.svg'))
    .map(file => [
      path.join('public/social', file),
      path.join('public/social', file.replace(/\.svg$/, '.png')),
      1200, 630,
    ]),
]

for (const [source, destination, width, height] of assets) {
  const png = execFileSync('rsvg-convert', [
    '--width', String(width), '--height', String(height), source,
  ], { maxBuffer: 20 * 1024 * 1024 })
  if (png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
    throw new Error('Invalid PNG preview generated: ' + destination)
  }
  fs.writeFileSync(destination, png)
  console.log('Rendered ' + destination + ' (' + width + 'x' + height + ')')
}

// Official ESN Systems shield logo files (public/brand/) are used as-is for the
// favicons, app icons and the default share image.
const brandFiles = [
  ['public/brand/favicon-32x32.png', 'public/favicon-32.png'],
  ['public/brand/apple-touch-icon.png', 'public/apple-touch-icon.png'],
  ['public/brand/android-chrome-192x192.png', 'public/icon-192.png'],
  ['public/brand/android-chrome-512x512.png', 'public/icon-512.png'],
  ['public/brand/favicon.ico', 'public/favicon.ico'],
  ['public/brand/og-image.png', 'public/social/esn-network.png'],
  ['public/brand/og-image.png', 'public/esn-social-card.png'],
]
for (const [source, destination] of brandFiles) {
  fs.copyFileSync(source, destination)
  console.log('Copied ' + source + ' -> ' + destination)
}
