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
  ['public/esn-mark.svg', 'public/favicon-32.png', 32, 32],
  ['public/esn-mark.svg', 'public/apple-touch-icon.png', 180, 180],
  ['public/esn-mark.svg', 'public/icon-192.png', 192, 192],
  ['public/esn-mark.svg', 'public/icon-512.png', 512, 512],
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

// Browsers and crawlers request /favicon.ico by default. Wrap the rendered
// 32x32 PNG in a one-image ICO container (PNG-in-ICO is supported everywhere).
const faviconPng = fs.readFileSync('public/favicon-32.png')
const icoHeader = Buffer.alloc(22)
icoHeader.writeUInt16LE(0, 0)
icoHeader.writeUInt16LE(1, 2)
icoHeader.writeUInt16LE(1, 4)
icoHeader.writeUInt8(32, 6)
icoHeader.writeUInt8(32, 7)
icoHeader.writeUInt8(0, 8)
icoHeader.writeUInt8(0, 9)
icoHeader.writeUInt16LE(1, 10)
icoHeader.writeUInt16LE(32, 12)
icoHeader.writeUInt32LE(faviconPng.length, 14)
icoHeader.writeUInt32LE(22, 18)
fs.writeFileSync('public/favicon.ico', Buffer.concat([icoHeader, faviconPng]))
console.log('Rendered public/favicon.ico (32x32 PNG-in-ICO)')
