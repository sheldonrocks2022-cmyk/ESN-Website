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
  '/smpguide',
  '/networkstats',
  '/whatsnew',
  '/explore',
  '/gallery',
  '/settings',
  '/support',
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
  '/store-ai',
  '/hosting',
  '/domains',
  '/site-builder',
  '/operations',
  '/incidents',
  '/changelog',
  '/diagnostics',
  '/smpcheck',
  '/blueprint',
  '/session',
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

const sitemapExcludedAliases = new Set(['/home', '/store', '/store/smp', '/tools', '/vault', '/storesmp', '/smpconnection', '/smpconsole', '/smpplugin', '/smpguide', '/smpcheck', '/domains'])
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
  'src/NetworkEvolution.jsx',
  'src/networkEvolutionConfig.js',
  'src/SiteExpansion.jsx',
  'src/OpsExpansion.jsx',
  'src/opsExpansion.css',
  'src/SMPStaffGate.jsx',
  'src/smpStaffGate.css',
  'src/StoreAI.jsx',
  'src/storeAi.css',
  'src/Domains.jsx',
  'src/domains.css',
  'src/SiteBuilder.jsx',
  'src/siteBuilder.css',
  '.github/workflows/publish-built-site.yml',
  '.github/scripts/publish-built-site.mjs',
  '.github/workflows/free-subdomain.yml',
  '.github/scripts/provision-free-subdomain.mjs',
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
const networkEvolution = fs.readFileSync('src/NetworkEvolution.jsx','utf8')
const evolutionConfig = fs.readFileSync('src/networkEvolutionConfig.js','utf8')
const shareCenter = fs.readFileSync('src/ShareCenter.jsx','utf8')
const seo = fs.readFileSync('src/seo.js','utf8')
const prerender = fs.readFileSync('scripts/prerender.mjs','utf8')
const indexHtml = fs.readFileSync('index.html','utf8')
const socialPreview = fs.readFileSync('public/esn-social-card.svg','utf8')
const storeAi = fs.readFileSync('src/StoreAI.jsx','utf8')
const domainsPortal = fs.readFileSync('src/Domains.jsx','utf8')
const siteBuilder = fs.readFileSync('src/SiteBuilder.jsx','utf8')
const siteBuilderPublisher = fs.readFileSync('.github/scripts/publish-built-site.mjs','utf8')
const siteBuilderWorkflow = fs.readFileSync('.github/workflows/publish-built-site.yml','utf8')

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
if (!app.includes('<NetworkEvolution />') || !app.includes('<NetworkEvolutionSection />')) problems.push('Network Evolution 12X is not mounted globally and on the homepage.')
if (!app.includes('<SiteExpansionLayer />') || !app.includes('<ArcadeProgressCenter />')) problems.push('Expansion 20 global layer or Arcade challenge center is not mounted.')
for (const route of ['/smpguide','/networkstats','/whatsnew','/explore','/gallery','/settings','/support']) {
  if (!app.includes(`path="${route}"`)) problems.push(`Expansion 20 route missing: ${route}`)
}
const siteExpansion = fs.readFileSync('src/SiteExpansion.jsx','utf8')
const opsExpansion = fs.readFileSync('src/OpsExpansion.jsx','utf8')
if (!siteExpansion.includes('SMPEncyclopediaPage') || !siteExpansion.includes('SettingsPage') || !siteExpansion.includes('ArcadeProgressCenter')) problems.push('Expansion 20 SMP, settings, or Arcade systems missing.')
if (!siteExpansion.includes('beforeinstallprompt') || !fs.existsSync('public/site.webmanifest') || !fs.existsSync('public/sw.js')) problems.push('Installable ESN PWA system missing.')
if (!siteExpansion.includes('REPORT PREVIEW') || !siteExpansion.includes('NetworkStatsPage') || !siteExpansion.includes('ExplorePage')) problems.push('Bug report, network stats, or feature discovery system missing.')
for (const marker of ['OperationsMapPage','PublicIncidentsPage','ChangelogTimelinePage','DiagnosticCenterPage','SMPConnectionTesterPage','SystemBlueprintPage','SessionStatsPage','StaffOpsExpansion','GlobalOpsLayer']) { if (!opsExpansion.includes(marker)) problems.push(`Operations expansion missing: ${marker}.`) }
for (const marker of ['OPS_MAINTENANCE_KEY','OPS_COUNTDOWN_KEY','OPS_EMERGENCY_KEY','BROADCAST SIMULATOR','RECOVERY CONSOLE','COMMAND MACROS']) { if (!opsExpansion.includes(marker)) problems.push(`Operations control missing: ${marker}.`) }
if (!networkEvolution.includes('TERMINAL_CAMPAIGN_KEY') || !networkEvolution.includes("protocol alpha") || !networkEvolution.includes("protocol midnight") || !networkEvolution.includes("protocol overdrive") || !networkEvolution.includes("protocol origin")) problems.push('Secret Terminal protocol campaign missing or incomplete.')
if (!app.includes('<GlobalOpsLayer />') || !app.includes('path="/operations"') || !app.includes('path="/diagnostics"') || !app.includes('path="/smpcheck"') || !app.includes('path="/blueprint"') || !app.includes('path="/session"')) problems.push('Operations expansion routes or global layer missing from App.')
if (!app.includes("import StoreAIPage from './StoreAI'") || !app.includes('path="/store-ai" element={<StoreAIPage />}')) problems.push('Store AI route or module is not wired.')
if (!storeAi.includes('ESN STORE AI') || !storeAi.includes('Visitor Mode') || !storeAi.includes('STAFF MODE') || !storeAi.includes('STORE HEALTH')) problems.push('Store AI visitor/staff interface is incomplete.')
if (!storeAi.includes("STAFF_CODE_HASH") || storeAi.includes("052609")) problems.push('Store AI staff gate is missing its hashed check or exposes the raw staff code.')
for (const url of requiredPaymentLinks) { if (!storeAi.includes(url)) problems.push(`Store AI missing verified checkout link: ${url}`) }
if (!storeAi.includes('I will not invent a payment link') || !storeAi.includes('PRICE NOT VERIFIED')) problems.push('Store AI catalog truth safeguards are missing.')
if (!seo.includes("'/store-ai':{")) problems.push('Store AI SEO route missing.')
if (!sitemap.includes('https://esnoffical.com/store-ai')) problems.push('Store AI missing from sitemap.')
if (!app.includes("import DomainsPage from './Domains'") || !app.includes('path="/hosting" element={<DomainsPage />}') || !app.includes('path="/domains" element={<Navigate to="/hosting" replace />}')) problems.push('ESN Hosting route, legacy redirect, or module is not wired.')
if (!domainsPortal.includes('ESN HOSTING') || !domainsPortal.includes('SUBMIT FOR STAFF REVIEW') || !domainsPortal.includes('CONNECT YOUR DOMAIN') || !domainsPortal.includes('NO NAMESERVER CHANGE')) problems.push('ESN Hosting manual activation portal is incomplete.')
if (!domainsPortal.includes('SPACESHIP') && !domainsPortal.includes('Spaceship')) problems.push('ESN Hosting must preserve the Spaceship DNS manual workflow.')
if (!domainsPortal.includes('STAFF_HASH') || domainsPortal.includes("'052609'")) problems.push('ESN Hosting staff UI gate is missing its hash check or exposes the raw staff code.')
if (!domainsPortal.includes('esn_hosting_requests_v1') || !domainsPortal.includes('OPEN ESN DISCORD')) problems.push('ESN Hosting local request handoff is incomplete.')
if (!domainsPortal.includes("subdomain:{label:'$0.50/month'") || !domainsPortal.includes("custom:{label:'$1.00/month'")) problems.push('ESN Hosting monthly pricing is missing or changed unexpectedly.')
if (!domainsPortal.includes('validStripeLink') || !domainsPortal.includes("url.hostname==='buy.stripe.com'")) problems.push('ESN Hosting Stripe link validation is missing.')
for (const marker of ['READY FOR STAFF REVIEW','AWAITING PAYMENT','PAID','ACTIVE','MARK PAID','MARK ACTIVE']) { if (!domainsPortal.includes(marker)) problems.push(`ESN Hosting payment status workflow missing: ${marker}.`) }
if (!domainsPortal.includes('Never mark a request Paid unless the payment is visible in the official ESN Stripe account.')) problems.push('ESN Hosting manual payment verification warning is missing.')
const freeSubdomainWorkflow = fs.readFileSync('.github/workflows/free-subdomain.yml','utf8')
const freeSubdomainProvisioner = fs.readFileSync('.github/scripts/provision-free-subdomain.mjs','utf8')
for (const marker of ['FREE ESN SUBDOMAIN','CREATE FREE SUBDOMAIN','CONTINUE TO GITHUB','ESN_FREE_SUBDOMAIN_REQUEST_V1','One active free subdomain per GitHub account','DNS IS ONLY HALF OF THE SETUP','I confirmed my destination host supports this custom domain and HTTPS','GitHub Pages:']) {
  if (!domainsPortal.includes(marker)) problems.push(`ESN free-subdomain UI missing: ${marker}.`)
}
if (!freeSubdomainWorkflow.includes('issues:') || !freeSubdomainWorkflow.includes('SPACESHIP_API_KEY') || !freeSubdomainWorkflow.includes('SPACESHIP_API_SECRET')) problems.push('Automatic free-subdomain workflow is missing the GitHub issue trigger or Spaceship secret bindings.')
for (const marker of ['https://spaceship.dev/api/v1/dns/records/','dnsrecords','CNAME','free-subdomain-active','one active subdomain per GitHub account','Host readiness:','DNS creation does not guarantee the website or HTTPS certificate is ready yet']) {
  if (!freeSubdomainProvisioner.toLowerCase().includes(marker.toLowerCase())) problems.push(`Automatic free-subdomain provisioner missing: ${marker}.`)
}
if (freeSubdomainProvisioner.includes('REPLACE_KEY_VALUE') || freeSubdomainWorkflow.includes('X-API-Secret:')) problems.push('Free-subdomain automation appears to contain a hard-coded credential placeholder or secret.')

if (!seo.includes("'/hosting':{") || !seo.includes("canonical:'/hosting'")) problems.push('ESN Hosting SEO route or Domains alias canonical is missing.')
if (!sitemap.includes('https://esnoffical.com/hosting')) problems.push('ESN Hosting missing from sitemap.')
if (!app.includes("import SiteBuilderPage, { HostedSitePage } from './SiteBuilder'") || !app.includes('path="/site-builder" element={<SiteBuilderPage />}') || !app.includes('path="/sites/:slug" element={<HostedSitePage />}')) problems.push('ESN Website Builder routes or module wiring missing.')
for (const marker of ['ESN WEBSITE BUILDER // FLAGSHIP GENERATOR V4','FLAGSHIP SITE ENGINE','VERSION A','VERSION B','VERSION C • FLAGSHIP','UNDO AI CHANGE','SITE QUALITY','REGENERATE HERO','REGENERATE ABOUT','REGENERATE CARDS','REGENERATE STATS','REGENERATE FAQ','REGENERATE SEO','REGENERATE CTA','QUICK_PROMPTS','analyzePrompt','promptKeywords','promptScore','inferAudience','inferLayout','generatedStats','generatedFaq','seoTitle','seoDescription','layout-split','layout-editorial','flagship','FlagshipSitePreview','gfs-core-stage','gfs-story-stack','gfs-bento','gfs-feature-stage','gfs-process','gfs-final','DOWNLOAD HTML','PUBLISH BUILD','LIVE PREVIEW','script-free','ESN_SITE_BUILD_V1','fortnite','minecraft','music','technology','/sites/']) {
  if (!siteBuilder.includes(marker)) problems.push(`ESN Website Builder missing: ${marker}.`)
}
if (!siteBuilder.includes('BLOCKED_TEXT') || !siteBuilder.includes('safeSite') || !siteBuilder.includes('HostedSitePage')) problems.push('ESN Website Builder safety or hosted-preview renderer is incomplete.')
if (!siteBuilderWorkflow.includes('contents: write') || !siteBuilderWorkflow.includes('issues: write') || !siteBuilderWorkflow.includes("startsWith(github.event.issue.title, '[SITE-BUILD]')")) problems.push('ESN Website Builder publish workflow permissions or trigger are incomplete.')
for (const marker of ['free-subdomain-active','site-builder-published','public/generated-sites/','does not request passwords','BLOCKED','version:2','seoTitle','seoDescription','stats','faq','layout']) {
  if (!siteBuilderPublisher.toLowerCase().includes(marker.toLowerCase())) problems.push(`ESN Website Builder publisher missing: ${marker}.`)
}
if (!seo.includes("'/site-builder':{")) problems.push('ESN Website Builder SEO route missing.')
if (!sitemap.includes('https://esnoffical.com/site-builder')) problems.push('ESN Website Builder missing from sitemap.')
const smpGate = fs.readFileSync('src/SMPStaffGate.jsx','utf8')
if (!smpGate.includes("SMP_ACCESS_SESSION_KEY") || !smpGate.includes("STAFF_CODE_HASH") || smpGate.includes("052609")) problems.push('SMP staff gate missing, unhashed, or staff code exposed in source.')
for (const route of ['/storesmp','/smpconnection','/smpconsole','/smpplugin','/smpguide','/smpcheck']) { if (!app.includes(`path="${route}" element={<SMPStaffGate`)) problems.push(`SMP route is not staff-gated: ${route}`) }
for (const route of ['/storesmp','/smpconnection','/smpconsole','/smpplugin','/smpguide','/smpcheck']) { const start=seo.indexOf(`'${route}':{`); if (start<0 || !seo.slice(start,start+700).includes('index:false') || !seo.slice(start,start+700).includes('nofollow:true')) problems.push(`Locked SMP route must be noindex/nofollow: ${route}`) }
if (!liveExperience.includes('Expansion 20') || !liveExperience.includes('release-filter-row') || !liveExperience.includes('INCIDENT HISTORY')) problems.push('Expansion 20 release log, filters, or incident history missing.')
if (!indexHtml.includes('site.webmanifest')) problems.push('PWA manifest link missing from base HTML.')
if (!networkEvolution.includes('ESN Passport') || !networkEvolution.includes('ESN Terminal') || !networkEvolution.includes('Universal ESN Search')) problems.push('Network Evolution Passport, Terminal, or universal search system missing.')
if (!networkEvolution.includes('Share achievement card') || !networkEvolution.includes('Math.random()<.01')) problems.push('Achievement card or ultra-rare event system missing.')
if (!networkEvolution.includes('esn_command_deck') || !evolutionConfig.includes('NETWORK_TAKEOVER') || !evolutionConfig.includes('SMP_EVENT_BOARD')) problems.push('Command Deck, takeover configuration, or event board configuration missing.')
if (!liveExperience.includes('Network Evolution 12X') || !liveExperience.includes('timeline-scrubber')) problems.push('Network Evolution release log or interactive timeline scrubber missing.')
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
if (!seo.includes("export const SEO_ROUTES=") || !seo.includes("export const SEO_LAUNCH_MODE='production'")) problems.push('Shared SEO route configuration missing or production launch mode is not enabled.')
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
if (!indexHtml.includes('name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"') || !indexHtml.includes('name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"')) problems.push('Production base HTML crawler directives are not enabled for the .com launch.')
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
if (!immersiveLayer.includes('useLayoutEffect') || !immersiveLayer.includes('route-transition-scan') || !immersiveLayer.includes('RouteTransition')) problems.push('Stable cinematic route transition hook missing.')
const styles = fs.readFileSync('src/styles.css','utf8')
if (!styles.includes('ESN ULTRA LUXURY 100000X') || !styles.includes('.control-main-3d::before')) problems.push('Ultra Luxury 100000x visual layer missing.')
if (!styles.includes('ESN FLAGSHIP LUXURY 1000000X') || !styles.includes('.lux-cursor-ring') || !styles.includes('.lux-route-rail')) problems.push('Flagship Luxury 1000000x visual layer missing.')
if (!styles.includes('ESN FLAGSHIP ARCHITECTURE 2.0') || !app.includes('flagship-core-stage') || !app.includes('flagship-story-stack') || !app.includes('flagship-service-bento') || !app.includes('flagship-smp-stage') || !app.includes('flagship-arcade-rail') || !app.includes('flagship-review-wall') || !app.includes('flagship-final-cta')) problems.push('Flagship architecture 2.0 is incomplete.')
if (!styles.includes('ESN LIVE EXPERIENCE 1,000,000,000X') || !styles.includes('.startup-intro') || !styles.includes('.status-center-grid') || !styles.includes('.timeline-layout') || !styles.includes('.before-after-stage')) problems.push('1,000,000,000X premium layer missing or incomplete.')
if (!styles.includes('ESN IMMERSIVE SYSTEMS 7X') || !styles.includes('.route-transition') || !styles.includes('.hero-reactor') || !styles.includes('.notification-panel') || !styles.includes('.network-event') || !styles.includes('.share-center-layout') || !styles.includes('.footer-command-deck')) problems.push('Immersive 7-system visual layer missing or incomplete.')
if (!styles.includes('ESN PREMIUM INTERACTION RESTORE 2026-09-27') || !styles.includes('mobileRouteCover 5s') || !styles.includes('.mobile-network-strip') || !styles.includes('.mobile-pinned-deck') || !styles.includes('.touch-energy-ring')) problems.push('Cinematic transition or restored mobile interaction layer missing.')
if (!immersiveLayer.includes("'/notifications'") || !immersiveLayer.includes("'/rewards'") || !immersiveLayer.includes("'/challenges'") || !immersiveLayer.includes("'/staff'")) problems.push('New network routes are missing cinematic route scene mapping.')
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
if (!fs.readFileSync('src/arcade/shared.js','utf8').includes('useArcadeProgress') || !fs.readFileSync('src/arcade/shared.js','utf8').includes('ARCADE_PROGRESS_KEY')) problems.push('Shared Arcade XP/level progression system missing.')
if (!arcadeFrame.includes('oa-arcade-rank') || !arcadeFrame.includes('achievementCount')) problems.push('Shared Arcade rank HUD missing from game frame.')
if (!clicker.includes("clicker-overdrive") || !clicker.includes('prestigeRequirement') || !clicker.includes("bulk==='MAX'")) problems.push('ES Clicker 10X systems missing.')
if (!factory.includes('Offline production recovered') || !factory.includes('R&D LAB') || !factory.includes('CORE SURGE')) problems.push('ES Factory 10X systems missing.')
const mines = fs.readFileSync('src/arcade/Mines.jsx','utf8')
if (!mines.includes('ROUND HISTORY') || !mines.includes('WIN STREAK') || !mines.includes('calcMultiplier')) problems.push('ES Mines 10X systems missing.')
const moto = fs.readFileSync('src/arcade/Moto.jsx','utf8')
if (!moto.includes('DAILY TRACK') || !moto.includes('SHIFT / NITRO') || !moto.includes("key==='shift'")) problems.push('ES MOTO 10X controls/progression missing.')
if (!tower.includes('checkpoint shield') || !tower.includes('HAZARD DOORS') || !tower.includes('bestFloor')) problems.push('ES Tower 10X systems missing.')
const towerDefense = fs.readFileSync('src/arcade/TowerDefense.jsx','utf8')
if (!towerDefense.includes('ESN Pulse') || !towerDefense.includes('upgradeSelected') || !towerDefense.includes('BOSSES DEFEATED') || !towerDefense.includes("s.speed===1?2:1")) problems.push('ES Tower Defense 10X systems missing.')
if (!app.includes('oa-arcade-hub-progress') || !app.includes('shared Arcade XP')) problems.push('Arcade Hub 10X progression overview missing.')
if (!styles.includes('ESN ARCADE 10X') || !styles.includes('.oa-arcade-rank') || !styles.includes('.oa-td-upgrade-panel')) problems.push('Arcade 10X visual system missing.')
if (app.includes('Tool logic is intentionally not being invented')) problems.push('Obsolete ES Tools placeholder content returned.')

if (problems.length) {
  console.error('Site validation failed:')
  for (const problem of problems) console.error(`- ${problem}`)
  process.exit(1)
}

console.log('Site validation passed.')
console.log(`Checked ${requiredRoutes.length} routes and ${requiredPaymentLinks.length} protected payment links.`)
