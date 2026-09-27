import fs from 'node:fs'
import path from 'node:path'

const routes = {
  '/': {
    title: 'ES Network (ESN) | Fortnite Coaching, Editing & Discord Services',
    description: 'The official ES Network website for Fortnite coaching, editing, Discord setup services, ESN SMP, Arcade games, tools, and community access.',
  },
  '/home': {
    title: 'ES Network (ESN) | Fortnite Coaching, Editing & Discord Services',
    description: 'The official ES Network website for Fortnite coaching, editing, Discord setup services, ESN SMP, Arcade games, tools, and community access.',
    canonical: '/',
  },
  '/serviceshowcase': {
    title: 'ES Network Services | Fortnite Coaching, Editing & Discord Setup',
    description: 'Explore ES Network services including Fortnite coaching, editing, Discord server setups, website creation, creator branding, and custom projects.',
  },
  '/storesmp': {
    title: 'ESN SMP Store | ES Network Minecraft Items',
    description: 'Purchase ESN SMP digital items and bundles through official Stripe checkout links.',
  },
  '/store': {
    title: 'ESN SMP Store | ES Network Minecraft Items',
    description: 'Purchase ESN SMP digital items and bundles through official Stripe checkout links.',
    canonical: '/storesmp',
  },
  '/store/smp': {
    title: 'ESN SMP Store | ES Network Minecraft Items',
    description: 'Purchase ESN SMP digital items and bundles through official Stripe checkout links.',
    canonical: '/storesmp',
  },
  '/smpconnection': {
    title: 'ESN SMP Connection | Server IP & Port',
    description: 'Connect to the ESN SMP using esn.ggwp.cc and port 17058.',
  },
  '/smpconsole': {
    title: 'ESN SMP Console Connection | Xbox, PlayStation & Switch',
    description: 'Step-by-step ESN console connection guide using Bedrock Connect for Xbox, PlayStation, and Nintendo Switch.',
  },
  '/smpplugin': {
    title: 'Download ESNSMP Plugin | ES Network',
    description: 'Download the latest public ESNSMP Minecraft plugin release directly from the official ESNSMP GitHub release.',
  },
  '/status': {
    title: 'ESN Network Status | Live SMP Players & Systems',
    description: 'View live ES Network website, SMP player count, plugin release, Arcade, and Discord connection status.',
  },
  '/timeline': {
    title: 'ES Network Timeline | EP1C Services to ESN',
    description: 'Explore the ES Network timeline from the former EP1C Services name through ESN, SMP, Arcade, and current projects.',
  },
  '/updates': {
    title: 'ES Network Release Center | Updates & Roadmap',
    description: 'See current ES Network website, ESNSMP, Arcade, live-network releases, and future project candidates.',
  },
  '/portfolio': {
    title: 'ES Network Portfolio | Interactive Before & After Demos',
    description: 'Explore illustrative before-and-after ES Network service transformation demos for editing, Discord setup, and website creation.',
  },
  '/share': {
    title: 'ESN Share Deck | Branded Share Cards',
    description: 'Generate branded ES Network share cards for the SMP, Arcade, services, releases, and current SMP store products.',
  },
  '/vault': {
    title: 'ESN Vault | Secret Network Layer',
    description: 'A hidden ES Network experience unlocked through easter eggs.',
  },
  '/estools': {
    title: 'ES Tools | Free Browser-Based Creator & Gaming Utilities',
    description: 'Free browser-based ES Network tools with no account required.',
  },
  '/tools': {
    title: 'ES Tools | Free Browser-Based Creator & Gaming Utilities',
    description: 'Free browser-based ES Network tools with no account required.',
    canonical: '/estools',
  },
  '/arcade': {
    title: 'ESN Arcade | Browser Games',
    description: 'Play the six ES Network Arcade games rebuilt from the official ESN website experience.',
  },
  '/esclicker': { title: 'ES Clicker | ESN Arcade', description: 'Play ES Clicker with live balance stats, tap progression, and the 110-upgrade Power Forge.' },
  '/esfactory': { title: 'ES Factory | ESN Arcade', description: 'Play ES Factory with 53 zones, production floors, and a 112-machine progression catalog.' },
  '/esmines': { title: 'ES Mines | ESN Arcade', description: 'Play ES Mines with virtual ES Coins, wager choices, mine density, multipliers, and cash-out gameplay.' },
  '/esmoto': { title: 'ES MOTO | ESN Arcade', description: 'Play ES MOTO with side-view touch controls, checkpoints, track selection, and saved best times.' },
  '/estower': { title: 'ES Tower | ESN Arcade', description: 'Play ES Tower with 122 floors, three-door risk progression, shared ES Coins, and cash-out decisions.' },
  '/estowerdefense': { title: 'ES Tower Defense | ESN Arcade', description: 'Play ES Tower Defense across 200 rounds using the original 10-tower roster and path-defense layout.' },
  '/about': {
    title: 'About ES Network | ESN',
    description: 'Learn about ES Network, the current brand formerly known as EP1C Services.',
  },
  '/leadership': {
    title: 'ES Network Leadership | Meet the Team',
    description: 'Meet the founders, co-founders, and administrators behind ES Network.',
  },
  '/testimonials': {
    title: 'ES Network Customer Testimonials',
    description: 'Customer and community feedback for ES Network services and projects.',
  },
  '/faq': {
    title: 'ES Network FAQ | Services, Ordering & Support',
    description: 'Answers about ES Network services, SMP purchases, support, community access, and tools.',
  },
}

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

for (const [route, meta] of Object.entries(routes)) {
  const canonicalPath = meta.canonical ?? route
  const canonicalUrl = `https://esnoffical.com${canonicalPath === '/' ? '/' : canonicalPath}`
  let html = source

  html = html.replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(meta.title)}</title>`)
  html = html.replace(
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
  )
  html = html.replace(
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
  )
  html = html.replace(
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
  )
  html = html.replace(
    /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${canonicalUrl}" />`,
  )
  html = html.replace(
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${canonicalUrl}" />`,
  )

  if (route === '/') {
    fs.writeFileSync(sourcePath, html)
    continue
  }

  const routeDirectory = path.join('dist', route.replace(/^\//, ''))
  fs.mkdirSync(routeDirectory, { recursive: true })
  fs.writeFileSync(path.join(routeDirectory, 'index.html'), html)
}

const notFoundHtml = source
  .replace(/<title>.*?<\/title>/s, '<title>Page Not Found | ES Network</title>')
  .replace(
    /<meta name="description" content="[^"]*"\s*\/?>/,
    '<meta name="description" content="The requested ES Network page could not be found." />',
  )
  .replace(
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    '<meta property="og:title" content="Page Not Found | ES Network" />',
  )
  .replace(
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    '<meta property="og:description" content="The requested ES Network page could not be found." />',
  )
fs.writeFileSync(path.join('dist', '404.html'), notFoundHtml)

console.log(`Generated route HTML for ${Object.keys(routes).length} routes plus 404.html.`)
