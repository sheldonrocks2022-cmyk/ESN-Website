import fs from 'node:fs'

const app = fs.readFileSync('src/App.jsx', 'utf8')
const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8')

const requiredRoutes = [
  '/',
  '/home',
  '/serviceshowcase',
  '/storesmp',
  '/store',
  '/store/smp',
  '/smpconnection',
  '/estools',
  '/tools',
  '/arcade',
  '/esclicker',
  '/esfactory',
  '/esmines',
  '/esmoto',
  '/estower',
  '/estowerdefense',
  '/about',
  '/leadership',
  '/testimonials',
  '/faq',
]

const requiredPaymentLinks = [
  'https://buy.stripe.com/4gM14o5pxgaP9Nl2dNdnW00',
  'https://buy.stripe.com/bJe14o8BJbUz4t1dWvdnW01',
  'https://buy.stripe.com/00w3cw6tB7Ej9Nl19JdnW02',
  'https://buy.stripe.com/bJefZi9FN9Mr6B905FdnW03',
]

const missingRoutes = requiredRoutes.filter((route) => {
  if (route === '/') return !app.includes('path="/"')
  return !app.includes(route)
})

const missingPayments = requiredPaymentLinks.filter((url) => !app.includes(url))

const sitemapRoutes = requiredRoutes
  .filter((route) => route !== '/home')
  .filter((route) => !sitemap.includes(`https://esnoffical.com${route === '/' ? '/' : route}`))

const problems = []

if (missingRoutes.length) problems.push(`Missing app routes: ${missingRoutes.join(', ')}`)
if (missingPayments.length) problems.push(`Missing payment links: ${missingPayments.join(', ')}`)
if (sitemapRoutes.length) problems.push(`Missing sitemap routes: ${sitemapRoutes.join(', ')}`)
if (app.includes('mobile-coaching')) problems.push('Removed Mobile Coaching content was reintroduced.')
if (app.includes('example.com')) problems.push('Placeholder example.com URL found.')

if (problems.length) {
  console.error('Site validation failed:')
  for (const problem of problems) console.error(`- ${problem}`)
  process.exit(1)
}

console.log('Site validation passed.')
console.log(`Checked ${requiredRoutes.length} routes and ${requiredPaymentLinks.length} protected payment links.`)
