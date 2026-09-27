import fs from 'node:fs'
import { SEO_ROUTES, canonicalUrl } from '../src/seo.js'

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
  '/vault',
  '/portfolio',
  '/share',
  '/updates',
  '/timeline',
  '/status',
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

const sitemapExcludedAliases = new Set(['/home', '/store', '/store/smp', '/tools', '/vault'])
const sitemapRoutes = requiredRoutes
  .filter((route) => !sitemapExcludedAliases.has(route))
  .filter((route) => !sitemap.includes(`https://esnoffical.com${route === '/' ? '/' : route}`))

const requiredMigrationFiles = [
  'src/Tools.jsx',
  'src/ES3DViewer.jsx',
  'src/PremiumChrome.jsx',
  'src/Global3DLighting.jsx',
  'src/LiveExperience.jsx',
  'src/ShareCenter.jsx',
  'src/seo.js',
  'src/ExperienceLayer.jsx',
  'src/liveNetwork.js',
  'src/StartupIntro.jsx',
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
const liveNetwork = fs.readFileSync('src/liveNetwork.js','utf8')
const liveExperience = fs.readFileSync('src/LiveExperience.jsx','utf8')
const startupIntro = fs.readFileSync('src/StartupIntro.jsx','utf8')
const immersiveLayer = fs.readFileSync('src/ExperienceLayer.jsx','utf8')
const shareCenter = fs.readFileSync('src/ShareCenter.jsx','utf8')
const seo = fs.readFileSync('src/seo.js','utf8')
const prerender = fs.readFileSync('scripts/prerender.mjs','utf8')
const indexHtml = fs.readFileSync('index.html','utf8')
const socialPreview = fs.readFileSync('public/esn-social-card.svg','utf8')

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
if (!app.includes('<ES3DViewer variant="hero"') && !immersiveLayer.includes('<ES3DViewer variant="hero"')) problems.push('3D homepage viewer missing from App or HeroReactor.')
if (!app.includes('https://github.com/sheldonrocks2022-cmyk/ESNSMP/releases/latest/download/ESNSMP.jar')) problems.push('Latest ESNSMP.jar download URL missing.')
if (!app.includes("PLUGIN_VERSION = 'v2.9.4'")) problems.push('Verified ESNSMP v2.9.4 label missing.')
if (!app.includes('4439a6c8bf7ea6b0bf170098eeb1dff3f9f2f7008c06556140a1c1cfd8afd356')) problems.push('Verified v2.9.4 SHA-256 missing.')
if (!app.includes('Add & Start') || !app.includes('Open Bedrock Connect on your phone') || !app.includes('Same Wi-Fi / internet required')) problems.push('Official ESN console connection flow missing.')
if (!app.includes('<ExperienceEffects />')) problems.push('Premium interaction effects are not mounted.')
if (!app.includes("import PremiumChrome from './PremiumChrome'")) problems.push('Premium command center import missing.')
if (!app.includes('<PremiumChrome />')) problems.push('Premium command center is not mounted.')
if (!app.includes('<StartupIntro />')) problems.push('Every-load cinematic startup intro missing.')
if (!app.includes("import ExperienceLayer") || !app.includes('<ExperienceLayer />')) problems.push('Immersive ESN ExperienceLayer is not mounted.')
if (!app.includes('<HeroReactor />')) problems.push('Interactive homepage reactor is not mounted.')
if (!app.includes('<FooterCommandDeck />')) problems.push('Interactive footer command deck is not mounted.')
if (!app.includes('<Route path="/share" element={<ShareCenter />} />')) problems.push('ESN Share Deck route missing.')
if (!app.includes('<WhatsHappeningNow />')) problems.push("What's Happening Now homepage panel missing.")
if (!app.includes('<Route path="/status" element={<StatusCenter />} />')) problems.push('Live Network Status Center route missing.')
if (!app.includes('<Route path="/timeline" element={<TimelinePage />} />')) problems.push('Interactive ESN timeline route missing.')
if (!app.includes('<Route path="/updates" element={<UpdatesPage />} />')) problems.push('Release/update center route missing.')
if (!app.includes('<Route path="/portfolio" element={<PortfolioPage />} />')) problems.push('Before/after portfolio route missing.')
if (!app.includes('<Route path="/vault" element={<VaultPage />} />')) problems.push('Secret ESN Vault route missing.')
if (!app.includes("import Global3DLighting from './Global3DLighting'") || !app.includes('<Global3DLighting />')) problems.push('Global 3D lighting is not mounted across the site.')
if (!liveNetwork.includes('api.mcstatus.io/v2/status/java') || !liveNetwork.includes('players:value.players?.online')) problems.push('Live SMP player count integration missing.')
if (!liveNetwork.includes('api.mcstatus.io/v2/status/bedrock') || !liveNetwork.includes('api.mcsrvstat.us/3/')) problems.push('SMP live status must use multiple independent sources including Java and Bedrock-aware checks.')
if (!liveNetwork.includes('offlineResponses.length>=2')) problems.push('SMP status must not report OFFLINE from a single failed or protocol-mismatched source.')
if (!liveNetwork.includes('SMP_ESN_CONFIRMED_LIVE=true') || !liveNetwork.includes("source:'esn-confirmed'")) problems.push('ESN-confirmed SMP operational override missing.')
if (!liveExperience.includes('ESN confirmed online • player telemetry unavailable') || !liveExperience.includes('ESN confirmed live')) problems.push('SMP telemetry fallback UI must show ESN-confirmed live instead of false OFFLINE.')
if (!liveNetwork.includes("status:'unavailable'") || !liveNetwork.includes('sourceCount')) problems.push('SMP status needs an unavailable fallback when checks are inconclusive.')
if (!liveNetwork.includes('api.github.com/repos/') || !liveNetwork.includes('releases/latest')) problems.push('Live ESNSMP release lookup missing.')
if (!liveNetwork.includes('discord.com/api/v10/invites')) problems.push('Discord link/status lookup missing.')
if (!liveExperience.includes('Historical uptime still requires a separate monitoring service') && !liveExperience.includes('Public Minecraft status providers are currently unable to read reliable telemetry')) problems.push('SMP telemetry and uptime limitations are not explained honestly.')
if (!liveExperience.includes('EP1C Services') || !liveExperience.includes('Current Projects')) problems.push('Interactive ESN timeline content incomplete.')
if (!liveExperience.includes('ILLUSTRATIVE PROCESS DEMO') || !liveExperience.includes('not a claimed customer result')) problems.push('Portfolio demos must remain clearly labeled as illustrative.')
if (!startupIntro.includes('Initializing ESN') || startupIntro.includes('sessionStorage') || startupIntro.includes('localStorage')) problems.push('Startup intro must play on every full site load.')
if (!immersiveLayer.includes('RouteTransition') || !immersiveLayer.includes('route-transition-tunnel')) problems.push('3D route transition system missing.')
if (!immersiveLayer.includes('EnergyTrail') || !immersiveLayer.includes('energy-trail-particle')) problems.push('Cursor/touch energy trail system missing.')
if (!immersiveLayer.includes('HeroReactor') || !immersiveLayer.includes('CORE OVERDRIVE')) problems.push('Interactive ESN hero reactor missing.')
if (!immersiveLayer.includes('NotificationCenter') || !immersiveLayer.includes('Notification Center')) problems.push('ESN notification center missing.')
if (!immersiveLayer.includes('NetworkEvents') || !immersiveLayer.includes('VISUAL EVENT ONLY')) problems.push('Rare visual network event system missing.')
if (!immersiveLayer.includes('FooterCommandDeck') || !immersiveLayer.includes('ESN COMMAND DECK')) problems.push('Interactive footer command deck missing.')
if (!shareCenter.includes('1200') || !shareCenter.includes('630') || !shareCenter.includes('toBlob') || !shareCenter.includes('toDataURL') || !shareCenter.includes('navigator.share')) problems.push('Share Deck must generate real 1200x630 PNG cards and support native sharing.')
if (!seo.includes("export const SEO_ROUTES=") || !seo.includes("export const SEO_LAUNCH_MODE='staging'")) problems.push('Shared SEO route configuration missing or staging launch protection disabled before cutover.')
if (!seo.includes("SOCIAL_IMAGE_URL=SITE_URL+'/esn-social-card.svg'") || !seo.includes('SOCIAL_IMAGE_ALT')) problems.push('Shared ESN social preview metadata missing.')
if (!socialPreview.includes('width="1200"') || !socialPreview.includes('height="630"') || !socialPreview.includes('BUILD. PLAY. CREATE.')) problems.push('ESN 1200x630 social preview asset is missing or malformed.')
if (!app.includes('SOCIAL_IMAGE_URL') || !app.includes("setAlternate('en-US')") || !app.includes("setAlternate('x-default')")) problems.push('Live SEO manager is missing social image or hreflang support.')
if (!prerender.includes('SOCIAL_IMAGE_URL') || !prerender.includes('hreflang="en-US"') || !prerender.includes('hreflang="x-default"')) problems.push('Prerendered SEO is missing social image or hreflang support.')
if (!indexHtml.includes('property="og:image" content="https://esnoffical.com/esn-social-card.svg"') || !indexHtml.includes('name="twitter:card" content="summary_large_image"')) problems.push('Base HTML social preview metadata missing.')
if (!indexHtml.includes('hreflang="en-US"') || !indexHtml.includes('hreflang="x-default"')) problems.push('Base HTML hreflang links missing.')
if (!seo.includes('export const STORE_SCHEMA=') || !seo.includes('export const GAME_SCHEMA_DETAILS=') || !seo.includes('export const TOOL_SCHEMA=') || !seo.includes('export const CONSOLE_HOWTO_STEPS=')) problems.push('Expanded route structured-data definitions missing.')
for (const marker of ["'@type':'Product'","'@type':'SoftwareApplication'","'@type':'GameServer'","'@type':'HowTo'"]) {
  if (!seo.includes(marker)) problems.push(`Structured data type missing: ${marker}.`)
}
for (const relatedTitle of ['Research ESN before you order.','Everything around the ESN SMP.','Continue through the ESN Minecraft network.','Need more SMP information?']) {
  if (!app.includes(relatedTitle)) problems.push(`Contextual internal-link section missing: ${relatedTitle}`)
}

const indexedSeoEntries = Object.entries(SEO_ROUTES).filter(([,meta])=>meta.index!==false)
const seenTitles = new Map()
const seenDescriptions = new Map()
const seenCanonicals = new Map()
for (const [route,meta] of indexedSeoEntries) {
  if (!meta.title || meta.title.length < 20 || meta.title.length > 75) problems.push(`SEO title length is weak for ${route}: ${meta.title?.length??0} characters.`)
  if (!meta.description || meta.description.length < 80 || meta.description.length > 180) problems.push(`SEO description length is weak for ${route}: ${meta.description?.length??0} characters.`)
  if (seenTitles.has(meta.title)) problems.push(`Duplicate indexable SEO title: ${route} and ${seenTitles.get(meta.title)}.`)
  else seenTitles.set(meta.title,route)
  if (seenDescriptions.has(meta.description)) problems.push(`Duplicate indexable SEO description: ${route} and ${seenDescriptions.get(meta.description)}.`)
  else seenDescriptions.set(meta.description,route)
  const canonical=canonicalUrl(route)
  if (seenCanonicals.has(canonical)) problems.push(`Duplicate indexable canonical: ${route} and ${seenCanonicals.get(canonical)}.`)
  else seenCanonicals.set(canonical,route)
}
if (!app.includes("from './seo'") || !app.includes('structuredDataFor(location.pathname)') || !app.includes('robotsContent(location.pathname')) problems.push('Live React SEO manager is not using the shared SEO source.')
if (!prerender.includes("from '../src/seo.js'") || !prerender.includes('structuredDataFor(route)') || !prerender.includes("path.join('dist', 'sitemap.xml')")) problems.push('Prerendered SEO or generated sitemap is not using the shared SEO source.')
if (!indexHtml.includes('name="robots" content="noindex, nofollow"') || !indexHtml.includes('name="googlebot" content="noindex, nofollow"')) problems.push('Staging base HTML must remain statically noindex until the .com cutover.')
if (!seo.includes("'@type':'FAQPage'") || !seo.includes("'@type':'Service'") || !seo.includes("'@type':'VideoGame'")) problems.push('SEO structured-data coverage is incomplete.')
if (!seo.includes("max-image-preview:large") || !seo.includes("max-snippet:-1")) problems.push('Production crawler directives are incomplete.')
if (!seo.includes("'/vault':") || !seo.includes("nofollow:true")) problems.push('Secret Vault must remain excluded from search indexing.')
for (const requiredCard of ['JOIN ESN SMP','PLAY THE ESN ARCADE','BUILD WITH ESN','20 REALM 100 KEYS','RIFTWALKER BUNDLE','IMMORTAL WARDEN BUNDLE','VOID WARRIOR BUNDLE']) {
  if (!shareCenter.includes(requiredCard)) problems.push(`Share Deck template missing: ${requiredCard}.`)
}
if (immersiveLayer.includes('ESN Profiles') || shareCenter.includes('ESN Profiles') || app.includes('ESN Profiles')) problems.push('ESN Profiles were explicitly excluded from this upgrade.')
const globalLighting = fs.readFileSync('src/Global3DLighting.jsx','utf8')
if (!globalLighting.includes('u_colorA') || !globalLighting.includes('lightVolume') || !globalLighting.includes('routePalettes')) problems.push('Global 3D lighting shader or route palette system is incomplete.')
if (globalLighting.includes('fwidth(')) problems.push('Global 3D lighting uses WebGL derivatives that can break mobile compatibility.')
const premiumChrome = fs.readFileSync('src/PremiumChrome.jsx','utf8')
if (!premiumChrome.includes('Command Center') || !premiumChrome.includes('premium-ticker') || !premiumChrome.includes('CTRL / CMD + K')) problems.push('Premium chrome experience is incomplete.')
if (!premiumChrome.includes('premium-command-search') || !premiumChrome.includes('lux-cursor-field')) problems.push('Ultra Luxury 100000x command/search/light-field experience is incomplete.')
for (const theme of ['ESN Blue','Void Purple','SMP Green','Arcade Neon','Warden','Riftwalker']) {
  if (!premiumChrome.includes(theme)) problems.push(`Theme switcher is incomplete: missing ${theme}.`)
}
if (!premiumChrome.includes("lighting==='day'") || !premiumChrome.includes("lighting==='night'")) problems.push('Day/night 3D lighting controls missing.')
if (!premiumChrome.includes('join smp') || !premiumChrome.includes('play tower') || !premiumChrome.includes('download plugin')) problems.push('Command palette action upgrade missing.')
if (!premiumChrome.includes('mobile-bottom-nav')) problems.push('Premium mobile bottom navigation missing.')
if (!premiumChrome.includes('esn-open-command') || !premiumChrome.includes('Share Deck')) problems.push('Footer Command Center event bridge or Share Deck command missing.')
if (!premiumChrome.includes('esn_vault_unlocked') || !premiumChrome.includes('ArrowUp')) problems.push('Secret easter egg unlock system missing.')
if (!app.includes("scrolled ? 'site-header scrolled' : 'site-header'")) problems.push('Scroll-reactive premium header missing.')
if (!app.includes('route-premium-enter')) problems.push('Cinematic route entrance hook missing.')
const styles = fs.readFileSync('src/styles.css','utf8')
if (!styles.includes('ESN ULTRA LUXURY 100000X') || !styles.includes('.control-main-3d::before')) problems.push('Ultra Luxury 100000x visual layer missing.')
if (!styles.includes('ESN FLAGSHIP LUXURY 1000000X') || !styles.includes('.lux-cursor-ring') || !styles.includes('.lux-route-rail')) problems.push('Flagship Luxury 1000000x visual layer missing.')
if (!styles.includes('ESN FLAGSHIP ARCHITECTURE 2.0') || !app.includes('flagship-core-stage') || !app.includes('flagship-story-stack') || !app.includes('flagship-service-bento') || !app.includes('flagship-smp-stage') || !app.includes('flagship-arcade-rail') || !app.includes('flagship-review-wall') || !app.includes('flagship-final-cta')) problems.push('Flagship architecture 2.0 is incomplete.')
if (!styles.includes('ESN LIVE EXPERIENCE 1,000,000,000X') || !styles.includes('.startup-intro') || !styles.includes('.status-center-grid') || !styles.includes('.timeline-layout') || !styles.includes('.before-after-stage')) problems.push('1,000,000,000X premium layer missing or incomplete.')
if (!styles.includes('ESN IMMERSIVE SYSTEMS 7X') || !styles.includes('.route-transition') || !styles.includes('.hero-reactor') || !styles.includes('.notification-panel') || !styles.includes('.network-event') || !styles.includes('.share-center-layout') || !styles.includes('.footer-command-deck')) problems.push('Immersive 7-system visual layer missing or incomplete.')
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
