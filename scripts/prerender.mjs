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
    description: 'Console connection guidance for joining the ESN SMP from Xbox, PlayStation, or Nintendo Switch.',
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
    description: 'The ES Network Arcade routes are preserved while the original game experiences are faithfully migrated.',
  },
  '/esclicker': { title: 'ES Clicker | ESN Arcade', description: 'Original ES Clicker route preserved for faithful migration.' },
  '/esfactory': { title: 'ES Factory | ESN Arcade', description: 'Original ES Factory route preserved for faithful migration.' },
  '/esmines': { title: 'ES Mines | ESN Arcade', description: 'Original ES Mines route preserved for faithful migration.' },
  '/esmoto': { title: 'ES MOTO | ESN Arcade', description: 'Original ES MOTO route preserved for faithful migration.' },
  '/estower': { title: 'ES Tower | ESN Arcade', description: 'Original ES Tower route preserved for faithful migration.' },
  '/estowerdefense': { title: 'ES Tower Defense | ESN Arcade', description: 'Original ES Tower Defense route preserved for faithful migration.' },
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
