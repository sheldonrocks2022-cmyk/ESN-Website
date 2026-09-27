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
  '/smpplugin',
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
  'src/PremiumChrome.jsx',
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
if (!app.includes('https://github.com/sheldonrocks2022-cmyk/ESNSMP/releases/latest/download/ESNSMP.jar')) problems.push('Latest ESNSMP.jar download URL missing.')
if (!app.includes("PLUGIN_VERSION = 'v2.9.4'")) problems.push('Verified ESNSMP v2.9.4 label missing.')
if (!app.includes('4439a6c8bf7ea6b0bf170098eeb1dff3f9f2f7008c06556140a1c1cfd8afd356')) problems.push('Verified v2.9.4 SHA-256 missing.')
if (!app.includes('Add & Start') || !app.includes('Open Bedrock Connect on your phone') || !app.includes('Same Wi-Fi / internet required')) problems.push('Official ESN console connection flow missing.')
if (!app.includes('<ExperienceEffects />')) problems.push('Premium interaction effects are not mounted.')
if (!app.includes("import PremiumChrome from './PremiumChrome'")) problems.push('Premium command center import missing.')
if (!app.includes('<PremiumChrome />')) problems.push('Premium command center is not mounted.')
const premiumChrome = fs.readFileSync('src/PremiumChrome.jsx','utf8')
if (!premiumChrome.includes('Command Center') || !premiumChrome.includes('premium-ticker') || !premiumChrome.includes('CTRL / CMD + K')) problems.push('Premium chrome experience is incomplete.')
if (!premiumChrome.includes('premium-command-search') || !premiumChrome.includes('lux-cursor-field')) problems.push('Ultra Luxury 100000x command/search/light-field experience is incomplete.')
if (!app.includes("scrolled ? 'site-header scrolled' : 'site-header'")) problems.push('Scroll-reactive premium header missing.')
if (!app.includes('route-premium-enter')) problems.push('Cinematic route entrance hook missing.')
const styles = fs.readFileSync('src/styles.css','utf8')
if (!styles.includes('ESN ULTRA LUXURY 100000X') || !styles.includes('.control-main-3d::before')) problems.push('Ultra Luxury 100000x visual layer missing.')
if (!styles.includes('ESN FLAGSHIP LUXURY 1000000X') || !styles.includes('.lux-cursor-ring') || !styles.includes('.lux-route-rail')) problems.push('Flagship Luxury 1000000x visual layer missing.')
if (!styles.includes('ESN FLAGSHIP ARCHITECTURE 2.0') || !app.includes('flagship-core-stage') || !app.includes('flagship-story-stack') || !app.includes('flagship-service-bento') || !app.includes('flagship-smp-stage') || !app.includes('flagship-arcade-rail') || !app.includes('flagship-review-wall') || !app.includes('flagship-final-cta')) problems.push('Flagship architecture 2.0 is incomplete.')
if (!premiumChrome.includes('routeThemes') || !premiumChrome.includes('lux-edge-beam') || !premiumChrome.includes('--mag-x')) problems.push('Flagship route lighting or magnetic interaction system missing.')
if (premiumChrome.includes("location.pathname==='/arcade'||location.pathname.startsWith('/es')")) problems.push('ES Tools is being misclassified as an Arcade route theme.')
const routeInitIndex = premiumChrome.indexOf('const routeKey=')
const routeEffectIndex = premiumChrome.indexOf("root.dataset.luxRoute=routeKey")
if (routeInitIndex < 0 || routeEffectIndex < 0 || routeInitIndex > routeEffectIndex) problems.push('PremiumChrome route initialization order is unsafe and can cause a runtime blank screen.')
const arcadeFrame = fs.readFileSync('src/arcade/OriginalFrame.jsx','utf8')
const clicker = fs.readFileSync('src/arcade/Clicker.jsx','utf8')
const factory = fs.readFileSync('src/arcade/Factory.jsx','utf8')
const tower = fs.readFileSync('src/arcade/Tower.jsx','utf8')
if (!arcadeFrame.includes('oa-game-viewport') || !arcadeFrame.includes('oa-page-')) problems.push('Arcade 29X layout scope missing.')
if (clicker.includes('upgrades.slice(0,18)')) problems.push('Clicker catalog regressed to a partial upgrade list.')
if (factory.includes('zoneNames.slice(0,12)') || factory.includes('.slice(0,18)')) problems.push('Factory regressed to partial zone or machine lists.')
if (tower.includes('floors.slice(0,16)')) problems.push('Tower regressed to a partial floor ladder.')
if (app.includes('Tool logic is intentionally not being invented')) problems.push('Obsolete ES Tools placeholder content returned.')

if (problems.length) {
  console.error('Site validation failed:')
  for (const problem of problems) console.error(`- ${problem}`)
  process.exit(1)
}

console.log('Site validation passed.')
console.log(`Checked ${requiredRoutes.length} routes and ${requiredPaymentLinks.length} protected payment links.`)
