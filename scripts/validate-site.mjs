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
  '/smpconsole',
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

const sitemapExcludedAliases = new Set(['/home', '/store', '/store/smp', '/tools'])
const sitemapRoutes = requiredRoutes
  .filter((route) => !sitemapExcludedAliases.has(route))
  .filter((route) => !sitemap.includes(`https://esnoffical.com${route === '/' ? '/' : route}`))

const requiredMigrationFiles = [
  'src/Tools.jsx',
  'src/ES3DViewer.jsx',
  'src/reviews.js',
  'src/arcade/shared.js',
  'src/arcade/OriginalFrame.jsx',
  'src/arcade/Clicker.jsx',
  'src/arcade/Factory.jsx',
  'src/arcade/Mines.jsx',
  'src/arcade/Moto.jsx',
  'src/arcade/Tower.jsx',
  'src/arcade/TowerDefense.jsx',
]

const problems = []

if (missingRoutes.length) problems.push(`Missing app routes: ${missingRoutes.join(', ')}`)
if (missingPayments.length) problems.push(`Missing payment links: ${missingPayments.join(', ')}`)
if (sitemapRoutes.length) problems.push(`Missing sitemap routes: ${sitemapRoutes.join(', ')}`)
if (app.includes('mobile-coaching')) problems.push('Removed Mobile Coaching content was reintroduced.')
if (app.includes('example.com')) problems.push('Placeholder example.com URL found.')
if (!app.includes("name: 'ESN Riftwalker Bundle'") || !app.includes("price: '$0.50'")) problems.push('Riftwalker price is not restored to $0.50.')
const reviews = fs.readFileSync('src/reviews.js','utf8')
const reviewCount = (reviews.match(/category:'/g) || []).length
if (reviewCount !== 35) problems.push(`Expected 35 verified reviews, found ${reviewCount}.`)
if (!reviews.includes('Verified')) {
  // marker is rendered by ReviewCard, but keep source integrity checks below
}
if (!app.includes('Verified on Discord')) problems.push('Verified on Discord review label missing.')
for (const file of requiredMigrationFiles) {
  if (!fs.existsSync(file)) problems.push(`Missing migrated module: ${file}`)
}
if (app.includes('ESN Arcade 2.0')) problems.push('Inaccurate temporary Arcade 2.0 content returned.')
if (!app.includes('<Route path="/esclicker" element={<ClickerGame />} />')) problems.push('Faithful Arcade game routes are not wired.')
if (app.includes('View migration status →')) problems.push('Arcade placeholder links returned instead of playable game links.')
if (app.includes('!isArcadeGame && <Header />') || app.includes('!isArcadeGame && <Footer />')) problems.push('Arcade pages must keep the global ESN header and footer.')
if (!app.includes('<Header />') || !app.includes('<Footer />')) problems.push('Global ESN shell is not mounted universally.')
if (!app.includes("import ES3DViewer from './ES3DViewer'")) problems.push('3D viewer import missing.')
if (!app.includes('<ES3DViewer variant={product.name} compact')) problems.push('3D store viewer missing.')
if (!app.includes('<ES3DViewer variant="hero"')) problems.push('3D homepage viewer missing.')
if (app.includes('Tool logic is intentionally not being invented')) problems.push('Obsolete ES Tools placeholder content returned.')

if (problems.length) {
  console.error('Site validation failed:')
  for (const problem of problems) console.error(`- ${problem}`)
  process.exit(1)
}

console.log('Site validation passed.')
console.log(`Checked ${requiredRoutes.length} routes and ${requiredPaymentLinks.length} protected payment links.`)
