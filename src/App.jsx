import { Suspense, lazy, useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import StartupIntro from './StartupIntro'
import Global3DLighting from './Global3DLighting'
import ES3DViewer from './ES3DViewer'
import PremiumChrome from './PremiumChrome'
import UltraExperience from './UltraExperience'
import ExperienceCoreV2 from './ExperienceCoreV2'
import ExperienceLayer, { FooterCommandDeck } from './ExperienceLayer'
import { EasterEggLayer } from './NetworkShowcase'
import NetworkEvolution from './NetworkEvolution'
import { NetworkNexusPage, NexusEventLayer } from './NetworkNexus'
import { ArcadeProgressCenter, ExplorePage, GalleryPage, NetworkStatsPage, RetentionHub, SettingsPage, SiteExpansionLayer, SMPEncyclopediaPage, SupportPage, WhatsNewPage } from './SiteExpansion'
import { ChallengeLabPage, NoAccountExperienceLayer, NotificationCenterPage, RewardMarketPage, StaffDashboardPage } from './NoAccountExpansion'
import HostingPage, { BOT_PLANS, planCheckoutUrl } from './Hosting'
import HostingBundles from './HostingBundles'
import { TIP_URL } from './servicesCatalog'
import { EXCLUSIVES20 } from './exclusives20'
import { SMP_NEW_ITEMS } from './smpNewItems'
import { BusinessPlatformPage } from './BusinessPlatform'
import { LiveBusinessStaff } from './BusinessLive'
import { ChangelogTimelinePage, DiagnosticCenterPage, GlobalOpsLayer, OperationsMapPage, PublicIncidentsPage, SessionStatsPage, SMPConnectionTesterPage, SystemBlueprintPage } from './OpsExpansion'
import { SOCIAL_IMAGE_ALT, SOCIAL_IMAGE_URL, canonicalUrl, getSeo, robotsContent, socialImageFor, structuredDataFor } from './seo'
import { PortfolioPage, StatusCenter, TimelinePage, UpdatesPage, VaultPage } from './LiveExperience'
import { VERIFIED_REVIEWS } from './reviews'
import { NetworkBar, NetworkFooterRow } from './EsnNetwork'
import { SmpCopyButtons } from './SmpCopy'
import { HOME_FAQ } from './esnNetwork'
import { ActivityTimelinePage, BuilderShowcasePage, DataBackupPage, GlobalSearchPage, LabsPage, LaunchpadPage, NetworkMapPage, PlatformLayer, ProjectEstimatePage, ServiceConfiguratorPage, ShareGeneratorV2Page, SMPItemsPage, SMPWorldHubPage, TrustCenterPage } from './PlatformExpansion'
import { BrandAuthorityPage, GuideArticlePage, GuidesHubPage, RelatedVisibilityLinks, SearchLandingPage, SMPFeaturePage, VisibilityInsightsPage, VisibilityLayer } from './VisibilityExpansion'
import { useArcadeProgress } from './arcade/shared'
import { AnalyticsDashboard, AnalyticsTracker } from './Analytics'

// Route-only pages load on demand so the first page opens faster.
const ESToolsSuite = lazy(() => import('./Tools'))
const ShareCenter = lazy(() => import('./ShareCenter'))
const StoreAIPage = lazy(() => import('./StoreAI'))
const DomainsPage = lazy(() => import('./Domains'))
const ServicesPage = lazy(() => import('./Services'))
const ThanksPage = lazy(() => import('./Thanks'))
const GuardianPage = lazy(() => import('./Guardian'))
const SiteBuilderPage = lazy(() => import('./SiteBuilder'))
const HostedSitePage = lazy(() => import('./SiteBuilder').then((m) => ({ default: m.HostedSitePage })))
const ClickerGame = lazy(() => import('./arcade/Clicker'))
const FactoryGame = lazy(() => import('./arcade/Factory'))
const MinesGame = lazy(() => import('./arcade/Mines'))
const MotoGame = lazy(() => import('./arcade/Moto'))
const TowerGame = lazy(() => import('./arcade/Tower'))
const TowerDefenseGame = lazy(() => import('./arcade/TowerDefense'))
const SMPAscensionPage = lazy(() => import('./SMPAscension'))

const DISCORD_URL = 'https://discord.gg/RGPt3zEfGy'
const GUARDIAN_INVITE_URL = 'https://discord.com/oauth2/authorize?client_id=1544503232674664573'
const SMP_HOST = 'play.esnoffical.com'
const SMP_JAVA_PORT = '25565'
const SMP_BEDROCK_PORT = '19132'
const SMP_PORT = SMP_JAVA_PORT
const PLUGIN_VERSION = 'v2.15.0'
const PLUGIN_DOWNLOAD_URL = '/downloads/ESNSMP.jar'
const PLUGIN_RELEASE_URL = 'https://github.com/sheldonrocks2022-cmyk/ESNSMP/actions/workflows/build.yml?query=branch%3Amain'

const SERVICES = [
  {
    id: 'bot-hosting',
    eyebrow: 'ESN Hosting',
    title: 'Discord Bot Hosting',
    text: 'A straightforward place to run and manage your Python or Node.js bot, with console and file access.',
    route: '/hosting/vps',
  },
  {
    id: 'fortnite-coaching',
    eyebrow: 'Competitive Gaming',
    title: 'Fortnite Coaching',
    text: 'Work on match decisions, positioning, and the parts of Fortnite you want to improve.',
  },
  {
    id: 'editing-services',
    eyebrow: 'Creator Services',
    title: 'Editing Services',
    text: "Have footage that needs work? Tell us the style you're after, and we'll help put together a finished edit.",
  },
  {
    id: 'discord-server-setups',
    eyebrow: 'Community Infrastructure',
    title: 'Discord Server Setups',
    text: 'We set up channels, roles, moderation, and welcome flows so your Discord is easier to manage.',
  },
]

const SHOWCASE_EXTRAS = [
  ['Website Creation', 'Web Projects', 'Choose a Basic, Startup, or Enterprise website project. Tell us what you need and we will confirm the scope and final quote before work begins.'],
  ['Memberships', 'Community', 'Ask about membership options in a ticket. We will confirm current availability and pricing before you order.'],
  ['Hashtag Packs', 'Creator Growth', 'Need help choosing hashtags for a post or campaign? Tell us what you are promoting in a ticket.'],
  ['Stream Branding', 'Creator Branding', 'Talk to us about the visuals and branding your stream or creator channel needs.'],
  ['Custom Services', 'Custom Projects', 'Have a project that is not listed? Open a Discord ticket and tell us what you have in mind.'],
]

const LEADERS = [
  ['Landon', 'Founder & CEO'],
  ['Mark', 'Founder'],
  ['Presten', 'Founder'],
  ['Angie', 'Founder'],
  ['caelian_', 'Founder'],
  ['69isdabest', 'Co-Founder'],
  ['kidrocks1313', 'Co-Founder'],
]

const ADMINISTRATION = [
  ['lala.s.2', 'Administrator'],
  ['Dr.crows', 'Administrator'],
]

const LANDON_RESPONSIBILITIES = [
  'Business Operations',
  'Website & Service Infrastructure',
  'Creator Editing (Gaming, Anime, TV & Movie)',
  'ES Network Discord Ticket Support',
  'Marketing Strategy',
  'Brand Development',
]

const STORE_PRODUCTS = [
  {
    name: '20 Realm 100 Keys',
    price: '$1.25',
    stripe: 'https://buy.stripe.com/4gM14o5pxgaP9Nl2dNdnW00',
    summary: 'Twenty Realm 100 keys delivered through the ESN SMP purchase system.',
    items: ['20 × Realm 100 Keys'],
  },
  {
    name: 'ESN Season Pass Relic Bundle',
    price: '$0.50',
    stripe: 'https://buy.stripe.com/bJe14o8BJbUz4t1dWvdnW01',
    summary: 'A six-item Season Pass relic bundle built from existing ESN SMP items.',
    items: ['Angel Wings', 'Inferno Scepter', 'Storm Crystal', 'Tideheart', 'Void Relic', 'Celestial Star'],
  },
  {
    name: 'ESN Riftwalker Bundle',
    price: '$1.00',
    stripe: 'https://buy.stripe.com/00w3cw6tB7Ej9Nl19JdnW02',
    summary: 'A six-item mobility and utility bundle centered around rift abilities.',
    items: [
      'Riftblade — Rift Dash + bonus strike',
      'Rift Wings — unbreakable Elytra + flight boost',
      'Phase Boots — Speed I + Phase Step',
      'Rift Bow — Slowness II arrows + Rift Burst',
      'Rift Core — Resistance II + Absorption',
      'Void Compass — tracks last death',
    ],
  },
  {
    name: 'ESN Immortal Warden Bundle',
    price: '$1.30',
    stripe: 'https://buy.stripe.com/bJefZi9FN9Mr6B905FdnW03',
    summary: 'A full eight-item Warden-themed combat bundle.',
    items: [
      'Immortal Warden Helmet',
      'Immortal Warden Chestplate',
      'Immortal Warden Leggings',
      'Immortal Warden Boots',
      'Warden Blade',
      'Warden Longbow',
      'Immortal Core',
      'Warden Totem',
    ],
  },
  {
    name: 'ESN Exclusives Mega Bundle',
    price: '$1.99',
    stripe: 'https://buy.stripe.com/eVq3cw9FN3o35x57y7dnW0N',
    summary: 'All three exclusive sets in one checkout: Lightning King, Immortal Warden and Void Warrior. 20 items, delivered together.',
    items: [
      'Lightning King set: crown, chestplate, leggings, boots, blade, bow, core (7 items)',
      'Immortal Warden set: helmet, chestplate, leggings, boots, blade, longbow, Immortal Core, Warden Totem (8 items)',
      'Void Warrior set: crown, chestplate, leggings, boots, blade (5 items)',
    ],
  },
]

const ARCADE_GAMES = [
  ['ES Clicker', '/esclicker', 'Original ES Clicker route. Historically verified features include local progress, ES Coins, statistics, an upgrade shop, and 110 upgrades.'],
  ['ES Factory', '/esfactory', 'Original ES Factory route. Historically verified features include 53 zones, 112 machines, floors, upgrades, boosts, and shared ES Coin progression.'],
  ['ES Mines', '/esmines', 'Original ES Mines route with virtual ES Coins, wager selection, mine-density selection, and multipliers. No real-money transactions.'],
  ['ES MOTO', '/esmoto', 'Original ES MOTO route with 1,000+ tracks, checkpoints, touch controls, best times, and daily challenges.'],
  ['ES Tower', '/estower', 'Original ES Tower route reserved for faithful migration from the official game.'],
  ['ES Tower Defense', '/estowerdefense', 'Original ES Tower Defense route reserved for faithful migration from the official game.'],
]

const FAQ_ITEMS = [
  ['What is ES Network?', 'ES Network (ESN) is the current brand. EP1C Services was the former name and is not a separate current organization or division.'],
  ['What services does ESN offer?', 'ESN Hosting (Discord bot, game server, web and VPS-lite hosting), Fortnite coaching, editing services, Discord server setups, and selected digital or website projects handled through ESN.'],
  ['How do I order a service?', 'Service ordering and support are handled through the official ESN Discord. Open a ticket and provide the details of what you need.'],
  ['How much does ESN Hosting cost?', 'Discord bot hosting starts at $0.50/month (Nano). There are 33 plans in all: bot plans up to Gift at $14.99/month, new Pro Minecraft plans with 8, 12 or 16 GB RAM from $9.99/month, plus game server, web and VPS-lite plans. Many plans can also be paid yearly. See all plans on the Bot Hosting page.'],
  ['How do I buy hosting and how fast is setup?', 'Go to panel.esnoffical.com/plans, sign in (or create an account), pick a plan and pay on Stripe’s secure checkout. Your server is set up automatically after you pay and shows up on your panel dashboard.'],
  ['Do I need an account to buy hosting?', 'Yes, an ESN panel account. You can create one yourself on the panel sign-in page with New here? Create an account. Your server is tied to that account.'],
  ['Where can I check if ESN Hosting is up?', 'The live status page at status.esnoffical.com shows the panel, the hosting nodes, the website and the SMP, checked every minute.'],
  ['Where can I get help with my server?', 'Start with the hosting docs at docs.esnoffical.com. You can also use the chat bubble on this website or the panel, or open a ticket in the ESN Hosting Discord.'],
  ['How do SMP purchases get delivered?', 'Enter your exact in-game Minecraft username at Stripe checkout. The buyer should be online on the SMP for automatic delivery. If your server username starts with a period, include the period at the beginning.'],
  ['Are ES Tools paid?', 'ES Tools are intended to be free browser-based utilities. They do not require an account and are not supposed to save your personal data.'],
  ['Can console players join the ESN SMP?', 'Yes. Xbox, PlayStation, and Nintendo Switch generally need a third-party-server workaround because Minecraft console editions do not expose a normal Add Server field. Use the Console Connection page for ESN server details and guidance.'],
  ['Where can I join the ESN community?', 'Use the official Discord link anywhere on this website to join the ES Network community.'],
]

function MetaManager() {
  const location = useLocation()

  useEffect(() => {
    const meta = getSeo(location.pathname)
    const title = meta.title
    const description = meta.description
    const url = canonicalUrl(location.pathname)
    const robots = robotsContent(location.pathname, window.location.hostname)
    const socialImage = socialImageFor(location.pathname)

    document.title = title

    const setMeta = (selector, attribute, name, content) => {
      let tag = document.querySelector(selector)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute(attribute, name)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
      return tag
    }

    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[name="robots"]', 'name', 'robots', robots)
    setMeta('meta[name="googlebot"]', 'name', 'googlebot', robots)

    setMeta('meta[property="og:title"]', 'property', 'og:title', title)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setMeta('meta[property="og:type"]', 'property', 'og:type', 'website')
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'ES Network')
    setMeta('meta[property="og:locale"]', 'property', 'og:locale', 'en_US')
    setMeta('meta[property="og:url"]', 'property', 'og:url', url)
    setMeta('meta[property="og:image"]', 'property', 'og:image', socialImage)
    setMeta('meta[property="og:image:secure_url"]', 'property', 'og:image:secure_url', socialImage)
    setMeta('meta[property="og:image:alt"]', 'property', 'og:image:alt', SOCIAL_IMAGE_ALT)
    setMeta('meta[property="og:image:type"]', 'property', 'og:image:type', 'image/png')
    setMeta('meta[property="og:image:width"]', 'property', 'og:image:width', '1200')
    setMeta('meta[property="og:image:height"]', 'property', 'og:image:height', '630')

    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', socialImage)
    setMeta('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt', SOCIAL_IMAGE_ALT)

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)

    const setAlternate = (lang) => {
      let link = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`)
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', 'alternate')
        link.setAttribute('hreflang', lang)
        document.head.appendChild(link)
      }
      link.setAttribute('href', url)
    }
    setAlternate('en-US')
    setAlternate('x-default')
    document.documentElement.lang = 'en-US'

    let schema = document.getElementById('esn-route-schema')
    if (!schema) {
      schema = document.createElement('script')
      schema.id = 'esn-route-schema'
      schema.type = 'application/ld+json'
      document.head.appendChild(schema)
    }
    schema.textContent = JSON.stringify(structuredDataFor(location.pathname))
  }, [location.pathname])

  return null
}

function ScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      return
    }

    const id = hash.slice(1)
    let tries = 0

    const tick = () => {
      const target = document.getElementById(id)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      tries += 1
      if (tries < 12) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [pathname, hash])

  return null
}

function ExperienceEffects() {
  const location = useLocation()

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.matchMedia('(max-width: 860px), (pointer: coarse)').matches
    const selector = '.section > .shell, .page-hero-copy, .page-hero-mark, .hero-content, .hero-control-panel, .network-stat-grid > div, .service-card, .product-card, .review-card, .game-card, .tool-card, .feature-panel, .leader-tile, .connection-card, .store-security, .experience-flow > div, .leadership-spotlight'
    const nodes = [...document.querySelectorAll(selector)]

    // Mobile Stability Mode: never hide content waiting for an observer.
    // This prevents sections/cards from flashing out and back in while the mobile browser viewport changes.
    if (reduce || mobile || !('IntersectionObserver' in window)) {
      nodes.forEach((node) => {
        node.classList.remove('reveal-ready')
        node.classList.add('is-visible')
      })
      return
    }

    nodes.forEach((node) => node.classList.add('reveal-ready'))
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' })
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [location.pathname])

  useEffect(() => {
    const interactive = '.service-card,.product-card,.review-card,.game-card,.tool-card,.feature-panel,.leader-tile,.connection-card,.store-security,.hero-control-panel,.page-hero-mark,.plugin-release-card,.console-step-card,.premium-connection'
    const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches
    const move = (event) => {
      document.documentElement.style.setProperty('--cursor-x', `${event.clientX}px`)
      document.documentElement.style.setProperty('--cursor-y', `${event.clientY}px`)
      document.documentElement.style.setProperty('--pointer-x', ((event.clientX / Math.max(1, window.innerWidth)) - .5).toFixed(4))
      document.documentElement.style.setProperty('--pointer-y', ((event.clientY / Math.max(1, window.innerHeight)) - .5).toFixed(4))
      const target = event.target.closest?.(interactive)
      if (!target) return
      const rect = target.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const nx = rect.width ? (x / rect.width) - .5 : 0
      const ny = rect.height ? (y / rect.height) - .5 : 0
      target.classList.add('premium-tilt')
      target.style.setProperty('--spot-x', `${x}px`)
      target.style.setProperty('--spot-y', `${y}px`)
      target.style.setProperty('--tilt-x', `${(-ny * 2.6).toFixed(2)}deg`)
      target.style.setProperty('--tilt-y', `${(nx * 3.4).toFixed(2)}deg`)
    }
    const leave = (event) => {
      const target = event.target.closest?.(interactive)
      if (!target || target.contains(event.relatedTarget)) return
      target.style.setProperty('--tilt-x', '0deg')
      target.style.setProperty('--tilt-y', '0deg')
    }
    const scroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      document.documentElement.style.setProperty('--scroll-progress', value)
    }
    if (finePointer) {
      document.addEventListener('pointermove', move, { passive: true })
      document.addEventListener('pointerout', leave, { passive: true })
    }
    window.addEventListener('scroll', scroll, { passive: true })
    scroll()
    return () => {
      if (finePointer) {
        document.removeEventListener('pointermove', move)
        document.removeEventListener('pointerout', leave)
      }
      window.removeEventListener('scroll', scroll)
    }
  }, [])

  return null
}

function Brand() {
  return (
    <Link to="/" className="brand" data-easter="brand" aria-label="ES Network home">
      <span className="brand-mark">ES</span>
      <span className="brand-copy">
        <strong>ES NETWORK</strong>
        <small>BUILD • PLAY • CREATE</small>
      </span>
    </Link>
  )
}

function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled((current) => {
      const next = window.scrollY > 34
      return current === next ? current : next
    })
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const close = () => setOpen(false)
  const inGroup = (paths) => paths.some((path) => location.pathname === path || location.pathname.startsWith(path + '/'))
  const arcadeActive = location.pathname === '/arcade' || ARCADE_GAMES.some(([, route]) => route === location.pathname)
  const hostingActive = inGroup(['/hosting', '/domains', '/business'])
  const servicesActive = inGroup(['/services', '/serviceshowcase', '/portfolio', '/testimonials', '/store-ai', '/site-builder', '/estools', '/configure', '/estimate', '/showcase', '/fortnite-coaching', '/video-editing', '/discord-server-setup', '/website-builder'])
  const playActive = arcadeActive || inGroup(['/smpconnection', '/smpconsole', '/smpplugin', '/smpguide', '/storesmp', '/smpcheck', '/smp-hub', '/smp-items', '/minecraft-server', '/minecraft-smp', '/smp/realm-ascension'])
  const discoverActive = inGroup(['/status', '/networkstats', '/analytics', '/updates', '/whatsnew', '/timeline', '/explore', '/gallery', '/nexus', '/notifications', '/rewards', '/challenges', '/operations', '/incidents', '/changelog', '/diagnostics', '/blueprint', '/session', '/share', '/launchpad', '/search', '/labs', '/activity', '/share-generator', '/network-map', '/backup', '/guides', '/visibility', '/free-browser-tools'])
  const aboutActive = inGroup(['/about', '/leadership', '/faq', '/settings', '/support', '/staff', '/trust', '/es-network'])
  const mobileSection = hostingActive ? 'Hosting'
    : playActive ? (arcadeActive ? 'Arcade' : 'Minecraft')
    : servicesActive ? 'Services'
    : discoverActive ? 'Explore'
    : aboutActive ? 'About & help'
    : 'Home'

  return (
    <header className={scrolled ? 'site-header scrolled' : 'site-header'}>
      <div className="header-glow" aria-hidden="true" />
      <div className="shell header-inner">
        <Brand />

        <div className="header-status" aria-label="ES Network status">
          <i />
          <span>ESN ONLINE</span>
        </div>
        <span className="mobile-current-section" aria-label="Current section">{mobileSection}</span>

        <button className="menu-toggle" type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="esn-main-nav" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}>
          <span />
          <span />
          <span />
        </button>

        <nav id="esn-main-nav" className={open ? 'nav open organized-nav' : 'nav organized-nav'} aria-label="Main navigation">
          <Link className={location.pathname === '/' || location.pathname === '/home' ? 'nav-direct active' : 'nav-direct'} onClick={close} to="/">Home</Link>

          <div className={hostingActive ? 'nav-group active' : 'nav-group'}>
            <button className="nav-trigger" type="button" aria-haspopup="true">Hosting</button>
            <div className="dropdown organized-dropdown">
              <div className="dropdown-section">
                <span className="dropdown-label">SERVER HOSTING</span>
                <Link onClick={close} to="/hosting/vps">Discord Bot Hosting · from $0.50/mo</Link>
                <Link onClick={close} to="/business">Customer Business Hub</Link>
                <Link onClick={close} to="/hosting">Domains & Hosting Requests</Link>
                <Link onClick={close} to="/status">Service Status</Link>
              </div>
              <div className="dropdown-section">
                <span className="dropdown-label">NEED A HAND?</span>
                <Link onClick={close} to="/site-builder">Website Builder</Link>
                <Link onClick={close} to="/support">Support & Questions</Link>
                <Link onClick={close} to="/business/setup">Bot Setup Guides</Link>
                <a onClick={close} href={DISCORD_URL} target="_blank" rel="noreferrer">Ask in Discord ↗</a>
              </div>
            </div>
          </div>

          <div className={servicesActive ? 'nav-group active' : 'nav-group'}>
            <button className="nav-trigger" type="button" aria-haspopup="true">Services</button>
            <div className="dropdown organized-dropdown">
              <div className="dropdown-section">
                <span className="dropdown-label">WORK WITH US</span>
                <Link onClick={close} to="/services">Professional Services</Link>
                <Link onClick={close} to="/serviceshowcase">All Services</Link>
                <Link onClick={close} to="/portfolio">Our Portfolio</Link>
                <Link onClick={close} to="/testimonials">Customer Reviews</Link>
                <Link onClick={close} to="/configure">Plan a Project</Link>
                <Link onClick={close} to="/estimate">Project Estimate</Link>
              </div>
              <div className="dropdown-section">
                <span className="dropdown-label">TOOLS & BUILDERS</span>
                <Link onClick={close} to="/site-builder">Website Builder</Link>
                <Link onClick={close} to="/showcase">Published Websites</Link>
                <Link onClick={close} to="/store-ai">Store AI</Link>
                <Link onClick={close} to="/estools">Free Browser Tools</Link>
              </div>
            </div>
          </div>

          <div className={playActive ? 'nav-group active' : 'nav-group'}>
            <button className="nav-trigger" type="button" aria-haspopup="true">Play</button>
            <div className="dropdown organized-dropdown play-dropdown">
              <div className="dropdown-section">
                <span className="dropdown-label">MINECRAFT SMP</span>
                <Link onClick={close} to="/smpconnection">Join ESN SMP</Link>
                <Link onClick={close} to="/smpconsole">Console Connection</Link>
                <Link onClick={close} to="/smpguide">SMP Guide</Link>
                <Link onClick={close} to="/smp-hub">SMP World Hub</Link>
                <Link onClick={close} to="/storesmp">SMP Store</Link>
                <Link onClick={close} to="/smpplugin">Plugin Download</Link>
                <Link onClick={close} to="/smp/realm-ascension">Realm Ascension</Link>
              </div>
              <div className="dropdown-section">
                <span className="dropdown-label">ARCADE GAMES</span>
                <Link onClick={close} to="/arcade">All Arcade Games</Link>
                {ARCADE_GAMES.map(([name, route]) => <Link onClick={close} key={route} to={route}>{name}</Link>)}
              </div>
            </div>
          </div>

          <div className={discoverActive ? 'nav-group active' : 'nav-group'}>
            <button className="nav-trigger" type="button" aria-haspopup="true">Explore</button>
            <div className="dropdown organized-dropdown network-dropdown">
              <div className="dropdown-section">
                <span className="dropdown-label">LATEST FROM ESN</span>
                <Link onClick={close} to="/whatsnew">What's New</Link>
                <Link onClick={close} to="/updates">Updates & Releases</Link>
                <Link onClick={close} to="/status">Network Status</Link>
                <Link onClick={close} to="/notifications">Notifications</Link>
                <Link onClick={close} to="/guides">Guides & News</Link>
                <Link onClick={close} to="/timeline">Timeline</Link>
              </div>
              <div className="dropdown-section">
                <span className="dropdown-label">EXPLORE & CREATE</span>
                <Link onClick={close} to="/explore">Explore All Pages</Link>
                <Link onClick={close} to="/search">Search the Site</Link>
                <Link onClick={close} to="/nexus">Network Nexus</Link>
                <Link onClick={close} to="/gallery">Media Gallery</Link>
                <Link onClick={close} to="/share">Share Center</Link>
                <Link onClick={close} to="/launchpad">Launchpad</Link>
              </div>
              <div className="dropdown-section">
                <span className="dropdown-label">ADVANCED TOOLS</span>
                <Link onClick={close} to="/networkstats">Network Stats</Link>
                <Link onClick={close} to="/operations">Operations</Link>
                <Link onClick={close} to="/diagnostics">Diagnostics</Link>
                <Link onClick={close} to="/analytics">Site Analytics</Link>
                <Link onClick={close} to="/incidents">Incidents</Link>
                <Link onClick={close} to="/changelog">Changelog</Link>
              </div>
            </div>
          </div>

          <div className={aboutActive ? 'nav-group active' : 'nav-group'}>
            <button className="nav-trigger" type="button" aria-haspopup="true">About</button>
            <div className="dropdown organized-dropdown">
              <div className="dropdown-section">
                <span className="dropdown-label">OUR TEAM</span>
                <Link onClick={close} to="/about">About ESN</Link>
                <Link onClick={close} to="/leadership">Meet the Team</Link>
                <Link onClick={close} to="/testimonials">Customer Reviews</Link>
                <Link onClick={close} to="/trust">Trust & Safety</Link>
              </div>
              <div className="dropdown-section">
                <span className="dropdown-label">HELP</span>
                <Link onClick={close} to="/faq">Frequently Asked Questions</Link>
                <Link onClick={close} to="/support">Contact Support</Link>
                <Link onClick={close} to="/settings">Settings & Accessibility</Link>
                <Link onClick={close} to="/staff">Staff Dashboard</Link>
              </div>
            </div>
          </div>

          <a onClick={close} className="nav-cta" href={DISCORD_URL} target="_blank" rel="noreferrer">
            <span>Join Discord</span><b>↗</b>
          </a>
        </nav>
      </div>
    </header>
  )
}
function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-orb" aria-hidden="true" />
      <div className="shell footer-top organized-footer">
        <div className="footer-brand-block">
          <Brand />
          <h2>Build. Play. Create.<br />Find your place at ESN.</h2>
          <p>Find ESN services, website tools, the Minecraft SMP, Arcade games, and our Discord community here.</p>
          <a className="footer-discord" href={DISCORD_URL} target="_blank" rel="noreferrer">Join ESN Discord <span>↗</span></a>
        </div>

        <div className="footer-links organized-footer-links">
          <div>
            <h3>Hosting</h3>
            <Link to="/hosting/vps">Discord Bot Hosting</Link>
            <Link to="/business">Customer Business Hub</Link>
            <Link to="/hosting">Hosting & Domains</Link>
            <Link to="/site-builder">Website Builder</Link>
            <Link to="/status">Service Status</Link>
            <a href="https://status.esnoffical.com" target="_blank" rel="noreferrer">Live Uptime ↗</a>
            <a href="https://panel.esnoffical.com/plans">Hosting plans from $0.50/month ↗</a>
            <a href="https://panel.esnoffical.com">Customer Panel Login ↗</a>
            <a href="https://billing.stripe.com/p/login/4gM14o5pxgaP9Nl2dNdnW00">Manage Billing ↗</a>
            <Link to="/support">Hosting Support</Link>
          </div>
          <div>
            <h3>Services & Tools</h3>
            <Link to="/services">Professional Services</Link>
            <Link to="/serviceshowcase">All Services</Link>
            <Link to="/portfolio">Our Portfolio</Link>
            <Link to="/testimonials">Customer Reviews</Link>
            <Link to="/estools">Free Tools</Link>
            <Link to="/store-ai">Store AI</Link>
            <Link to="/configure">Plan a Project</Link>
          </div>
          <div>
            <h3>Minecraft & Games</h3>
            <Link to="/smpconnection">ESN SMP</Link>
            <Link to="/smpconsole">Console Guide</Link>
            <Link to="/storesmp">SMP Store</Link>
            <Link to="/smpplugin">SMP Plugin</Link>
            <Link to="/smp/realm-ascension">Realm Ascension</Link>
            <Link to="/arcade">Arcade Games</Link>
          </div>
          <div>
            <h3>Explore & Help</h3>
            <Link to="/whatsnew">What's New</Link>
            <Link to="/updates">Updates & Releases</Link>
            <Link to="/guides">Guides & News</Link>
            <a href="https://docs.esnoffical.com" target="_blank" rel="noreferrer">Hosting Docs ↗</a>
            <a href="https://www.trustpilot.com/review/esnoffical.com" target="_blank" rel="noreferrer">Review us on Trustpilot ↗</a>
            <Link to="/explore">Explore ESN</Link>
            <Link to="/about">About the Team</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/rules">Rules</Link>
            <Link to="/support">Contact Support</Link>
            <Link to="/settings">Settings</Link>
          </div>
        </div>
      </div>

      <NetworkFooterRow />

      <div className="shell"><FooterCommandDeck /></div>

      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} ES Network. All rights reserved.</span>
        <span className="footer-signal" data-easter="footer-signal"><i /> ESN SYSTEMS ONLINE</span>
      </div>
    </footer>
  )
}
function PageHero({ eyebrow, title, text, actions }) {
  return (
    <section className="page-hero">
      <div className="page-hero-grid" aria-hidden="true" />
      <div className="page-hero-orb orb-a" aria-hidden="true" />
      <div className="page-hero-orb orb-b" aria-hidden="true" />
      <div className="shell page-hero-inner">
        <div className="page-hero-copy">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{text}</p>
          {actions ? <div className="hero-actions page-actions">{actions}</div> : null}
        </div>
        <div className="page-hero-mark" data-easter="page-mark" aria-hidden="true">
          <span>ES</span>
          <small>NETWORK</small>
        </div>
      </div>
    </section>
  )
}
function RelatedLinks({ title, links }) {
  return (
    <section className="section compact-section" aria-label="Related ES Network pages">
      <div className="shell">
        <div className="section-heading">
          <div><span className="eyebrow">Explore Related ESN Pages</span><h2>{title}</h2></div>
        </div>
        <div className="card-grid three">
          {links.map(([label, description, route]) => (
            <article className="feature-panel" key={route}>
              <h3>{label}</h3>
              <p>{description}</p>
              <Link to={route}>Explore {label} →</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
function RouteLoading() {
  return (
    <section className="route-loading" role="status" aria-live="polite" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#a8bad5' }}>
      <p>Loading page…</p>
    </section>
  )
}

const HOME_PLAN_PICKS = ['esn-nano', 'esn-pro', 'esn-elite']
const HOME_DROPS = ['Legends Mega Pack', 'Ultimate Mega Pack', 'New Exclusives Bundle']

function XIcon({ name }) {
  const paths = {
    bot: 'M9 3h6M12 3v3M6 8h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Zm3 5h.01M15 13h.01M9 16h6',
    cube: 'M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 0v20M3 7l9 5 9-5',
    bag: 'M5 8h14l-1 12H6L5 8Zm4 0V6a3 3 0 0 1 6 0v2',
    pad: 'M7 9h10a4 4 0 0 1 4 4v1a3 3 0 0 1-5.4 1.8L14 14h-4l-1.6 1.8A3 3 0 0 1 3 14v-1a4 4 0 0 1 4-4Zm1 2v3M6.5 12.5h3M16 12h.01M18 14h.01',
    chat: 'M4 5h16v11H8l-4 4V5Zm4 5h.01M12 10h.01M16 10h.01',
    spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6',
  }
  return <svg className="x-icon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>
}

function Home() {
  const picks = HOME_PLAN_PICKS.map((slug) => BOT_PLANS.find((plan) => plan.slug === slug)).filter(Boolean)
  const drops = HOME_DROPS.map((name) => SMP_NEW_ITEMS.find((item) => item.name === name)).filter(Boolean)
  return (
    <>
      <section className="x-hero" id="hero-banner">
        <div className="shell x-hero-grid">
          <div className="x-hero-copy">
            <span className="eyebrow">ES Network · Hosting · Minecraft · Community</span>
            <h1>Host your bot. Run your server. <em>Join the crew.</em></h1>
            <p className="x-lead">Discord bot, Minecraft and game server hosting from $0.50/month, our own Minecraft SMP, and a community that actually helps. Pick a plan, check out, and your server is set up automatically after payment.</p>
            <div className="x-actions">
              <Link className="button primary" to="/hosting/vps">See hosting plans</Link>
              <a className="button secondary" href={DISCORD_URL} target="_blank" rel="noreferrer">Join the Discord</a>
            </div>
            <ul className="x-checks" aria-label="Included with ESN hosting">
              <li>Plans from $0.50/mo</li>
              <li>Python + Node.js</li>
              <li>Your own control panel</li>
            </ul>
          </div>

          <aside className="x-hero-panel" aria-label="Popular hosting plans">
            <div className="x-panel-top"><span>Popular plans</span><Link to="/hosting/vps#plans">All plans →</Link></div>
            {picks.map((plan) => (
              <a className={'x-plan-row' + (plan.featured ? ' is-featured' : '')} key={plan.slug} href={planCheckoutUrl(plan)}>
                <span className="x-plan-name"><b>{plan.name}</b><small>{plan.ram} RAM · {plan.storage} disk</small></span>
                {plan.label && <span className="x-pill">{plan.label}</span>}
                <span className="x-plan-price"><b>{plan.price}</b><small>/mo</small></span>
              </a>
            ))}
            <p className="x-panel-foot">Monthly or yearly. Manage billing any time in the <a href="https://billing.stripe.com/p/login/4gM14o5pxgaP9Nl2dNdnW00">billing portal</a>.</p>
          </aside>
        </div>
      </section>

      <section className="section x-routes" aria-labelledby="x-routes-title">
        <div className="shell">
          <h2 className="x-visually-hidden" id="x-routes-title">Where do you want to go?</h2>
          <div className="x-route-grid">
            <Link className="x-route" to="/hosting/vps"><XIcon name="bot" /><b>Bot hosting</b><small>Discord bots from $0.50/mo</small></Link>
            <Link className="x-route" to="/hosting/vps#plans"><XIcon name="cube" /><b>Minecraft servers</b><small>Game, web and VPS-lite plans</small></Link>
            <Link className="x-route" to="/smpconnection"><XIcon name="spark" /><b>ESN SMP</b><small>Java + Bedrock server</small></Link>
            <Link className="x-route" to="/storesmp"><XIcon name="bag" /><b>SMP Store</b><small>Exclusives, bundles, ranks</small></Link>
            <Link className="x-route" to="/arcade"><XIcon name="pad" /><b>Arcade</b><small>Six free browser games</small></Link>
            <a className="x-route" href={DISCORD_URL} target="_blank" rel="noreferrer"><XIcon name="chat" /><b>Discord</b><small>Help, tickets, updates</small></a>
          </div>
        </div>
      </section>

      <HostingBundles id="home-bundles" compact />

      <section className="section x-smp" aria-labelledby="x-smp-title">
        <div className="shell x-smp-grid">
          <div className="x-smp-copy">
            <span className="eyebrow">ESN SMP · Minecraft</span>
            <h2 id="x-smp-title">Our Minecraft server is open.</h2>
            <p>Java and Bedrock players share one world. Copy the address, hop in, and grab exclusives from the official store.</p>
            <div className="x-address">
              <div><small>Server</small><strong>{SMP_HOST}</strong></div>
              <div><small>Java</small><strong>{SMP_JAVA_PORT}</strong></div>
              <div><small>Bedrock</small><strong>{SMP_BEDROCK_PORT}</strong></div>
            </div>
            <SmpCopyButtons />
            <div className="x-actions">
              <Link className="button primary" to="/smpconnection">How to join</Link>
              <Link className="button secondary" to="/smpconsole">Console guide</Link>
            </div>
          </div>
          <div className="x-drops">
            <div className="x-panel-top"><span>New in the SMP Store</span><Link to="/storesmp#new-drops">See all →</Link></div>
            {drops.map((item) => (
              <a className="x-drop" key={item.name} href={item.stripe} target="_blank" rel="noreferrer">
                <span className="x-drop-icon" aria-hidden="true">{item.icon}</span>
                <span className="x-drop-name"><b>{item.name}</b><small>{item.items[0]}</small></span>
                <span className="x-plan-price"><b>{item.price}</b>{item.separate && <s>{item.separate}</s>}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section x-services" aria-labelledby="services-title">
        <div className="shell">
          <div className="x-head x-head-row">
            <div><span className="eyebrow">What we do</span><h2 id="services-title">Built for players, creators and communities.</h2></div>
            <Link className="text-link" to="/serviceshowcase">All services →</Link>
          </div>
          <div className="x-card-grid">
            {SERVICES.map((service) => (
              <article className="x-card x-service" id={service.id} key={service.id}>
                <span className="eyebrow">{service.eyebrow}</span>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                {service.route
                  ? <Link className="text-link" to={service.route}>View hosting options →</Link>
                  : <a className="text-link" href={DISCORD_URL} target="_blank" rel="noreferrer">Open a Discord ticket →</a>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section x-arcade" aria-labelledby="x-arcade-title">
        <div className="shell">
          <div className="x-head x-head-row">
            <div><span className="eyebrow">ESN Arcade</span><h2 id="x-arcade-title">Six games. Pick one and play.</h2></div>
            <Link className="text-link" to="/arcade">Enter Arcade →</Link>
          </div>
          <div className="x-arcade-rail">
            {ARCADE_GAMES.map(([name, route], index) => (
              <Link className="x-game" to={route} key={route}><span>{String(index + 1).padStart(2, '0')}</span><b>{name}</b></Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section x-reviews" id="reviews" aria-labelledby="x-reviews-title">
        <div className="shell">
          <div className="x-head x-head-row">
            <div><span className="eyebrow">Customer feedback</span><h2 id="x-reviews-title">What our customers have said.</h2></div>
            <Link className="text-link" to="/testimonials">All reviews →</Link>
          </div>
          <div className="x-card-grid is-three">
            {[VERIFIED_REVIEWS[0], VERIFIED_REVIEWS[12], VERIFIED_REVIEWS[24]].map((review) => <ReviewCard review={review} key={review.handle} />)}
          </div>
        </div>
      </section>

      <section className="section x-faq" id="faq" aria-labelledby="x-faq-title">
        <div className="shell x-faq-grid">
          <div><span className="eyebrow">FAQ</span><h2 id="x-faq-title">Quick answers.</h2><p>Hosting, the panel, the SMP Store and support.</p><Link className="text-link" to="/faq">Full FAQ →</Link></div>
          <div className="faq-list">
            {HOME_FAQ.map(([q, a], index) => <details key={q} open={index === 0}><summary>{q}</summary><p>{a}</p></details>)}
          </div>
        </div>
      </section>

      <section className="section x-final" id="discord-exclusive-services">
        <div className="shell x-final-card">
          <span className="eyebrow">Community first</span>
          <h2>Build. Play. Create. <em>Find your place at ESN.</em></h2>
          <p>Announcements, help, tickets and the SMP crew all live in our Discord.</p>
          <div className="x-actions">
            <a className="button primary" href={DISCORD_URL} target="_blank" rel="noreferrer">Join ESN Discord</a>
            <a className="button secondary" href={GUARDIAN_INVITE_URL} target="_blank" rel="noreferrer">Add ESN Guardian</a>
          </div>
        </div>
      </section>
    </>
  )
}

function About() {
  return (
    <>
      <PageHero
        eyebrow="About ES Network"
        title="Get to know ES Network."
        text="ES Network is the current organization and brand. EP1C Services was the former name — not a separate current division."
      />

      <section className="section compact-section">
        <div className="shell network-stat-grid about-stat-grid">
          <div><strong>ESN</strong><span>Current brand</span></div>
          <div><strong>35</strong><span>Verified reviews</span></div>
          <div><strong>6</strong><span>Arcade games</span></div>
          <div><strong>Free</strong><span>Browser tools</span></div>
        </div>
      </section>

      <section className="section">
        <div className="shell about-story-grid">
          <div className="about-story-copy">
            <span className="eyebrow">What we do</span>
            <h2>Services, games, and projects built by ESN.</h2>
            <p className="large-copy">We started out as EP1C Services and grew into ES Network. Today you can hire us for creative work, join our Minecraft server, play Arcade games, or try our free tools.</p>
          </div>
          <div className="brand-timeline">
            <div><span>THEN</span><strong>EP1C Services</strong><p>The former name.</p></div>
            <div className="timeline-line"><i /></div>
            <div><span>NOW</span><strong>ES Network</strong><p>Our name today, and the home for our projects.</p></div>
          </div>
        </div>
      </section>

      <section className="section dark-section">
        <div className="shell">
          <div className="section-heading">
            <div><span className="eyebrow">Why ES Network</span><h2>What can you do here?</h2></div>
          </div>
          <div className="card-grid three">
            <article className="feature-panel"><span className="eyebrow">Services</span><h3>Direct ordering & support</h3><p>Service requests and support are routed through ESN Discord tickets so visitors have one clear place to start.</p></article>
            <article className="feature-panel"><span className="eyebrow">Gaming</span><h3>ESN SMP & Arcade</h3><p>Join the Minecraft SMP, check the connection guide, or play one of six browser games.</p></article>
            <article className="feature-panel"><span className="eyebrow">Tools</span><h3>Free browser utilities</h3><p>Try timers, randomizers, prompt tools, and other utilities without signing up.</p></article>
          </div>
        </div>
      </section>
    </>
  )
}
function Leadership() {
  return (
    <>
      <PageHero
        eyebrow="ES Network Team"
        title="The people behind ESN."
        text="Meet the founders, co-founders, and administrators who help run ESN."
      />

      <section className="section leadership-spotlight-section">
        <div className="shell leadership-spotlight" data-easter="leadership" tabIndex="0">
          <div className="leadership-scan" aria-hidden="true" />
          <div className="leadership-monogram">L</div>
          <div>
            <span className="eyebrow">Founder & CEO</span>
            <h2>Landon</h2>
            <p className="large-copy">Business operations, website and service infrastructure, creator editing, Discord ticket support, marketing strategy, and brand development.</p>
            <div className="responsibility-tags">
              {LANDON_RESPONSIBILITIES.map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="section dark-section">
        <div className="shell">
          <div className="section-heading">
            <div><span className="eyebrow">Leadership</span><h2>Founders & co-founders</h2></div>
          </div>
          <div className="team-grid">
            {LEADERS.filter(([name]) => name !== 'Landon').map(([name, title]) => (
              <article className="leader-tile" key={name}>
                <div className="avatar-placeholder">{name.charAt(0).toUpperCase()}</div>
                <div><span className="eyebrow">{title}</span><h3>{name}</h3></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div><span className="eyebrow">Administration</span><h2>ES Network administrators</h2></div>
          </div>
          <div className="team-grid admin-grid">
            {ADMINISTRATION.map(([name, title]) => (
              <article className="leader-tile" key={name}>
                <div className="avatar-placeholder">{name.charAt(0).toUpperCase()}</div>
                <div><span className="eyebrow">{title}</span><h3>{name}</h3></div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
function RulesPage() {
  return (
    <>
      <PageHero eyebrow="ESN Hosting" title="Rules & Acceptable Use" text="ESN Hosting (ES Network) · Last updated October 29, 2026" />
      <section className="section">
        <div className="shell narrow rules-page">
          <p>These rules apply to everyone who uses ESN Hosting: game servers, Discord bots, websites and anything else running on our servers. By creating an account or buying a plan, you agree to them. We keep them short and plain so they are easy to follow.</p>

          <h2>What is not allowed</h2>
          <ul>
            <li><strong>No crypto mining.</strong> No Bitcoin, Ethereum, Monero or any other mining, plotting or similar workloads.</li>
            <li><strong>No attacks.</strong> No DDoS or DoS tools, booters, stressers or network floods, against anyone.</li>
            <li><strong>No port scanning or hacking.</strong> No scanning, brute forcing, exploits, malware or attempts to break into any system.</li>
            <li><strong>No open proxies or VPN exits.</strong> Don't run public proxies, VPN exit nodes, Tor exit relays or anything that lets strangers route traffic through our network.</li>
            <li><strong>No spam or bulk mail.</strong> No unsolicited mass email, mass DMs or other spam.</li>
            <li><strong>No pirated software.</strong> Only run software, plugins and files you have the right to use.</li>
            <li><strong>No illegal content.</strong> Nothing that is illegal, and nothing that harms or exploits others.</li>
            <li><strong>No resource abuse.</strong> Don't run anything built to keep CPU, disk or network maxed out around the clock (for example traffic exchangers or card sharing). Normal game servers and bots are fine.</li>
          </ul>

          <h2>What happens if the rules are broken</h2>
          <div className="rules-box">
            <p>If a service breaks these rules, we may suspend it right away, without warning, to protect our network and other customers. Serious or repeated abuse can lead to the account being closed.</p>
            <p><strong>Services suspended for abuse are not refunded.</strong></p>
          </div>
          <p>You are responsible for what runs on your server, including anything your players, users or bot code do. If your server has been compromised, tell us quickly and we'll help you sort it out.</p>

          <h2>Reporting abuse</h2>
          <p>If you see something on ESN that breaks these rules, open a ticket in our <a href="https://discord.gg/RGPt3zEfGy" target="_blank" rel="noreferrer">Discord</a> or email <a href="mailto:esnhosting@gmail.com">esnhosting@gmail.com</a>.</p>

          <h2>Changes</h2>
          <p>We may update these rules as ESN grows. The date at the top shows the latest version.</p>
        </div>
      </section>
    </>
  )
}

function FAQ() {
  return (
    <>
      <PageHero eyebrow="Support" title="Frequently asked questions" text="Answers about ES Network, hosting, ordering, support, community access, tools, and the SMP." />
      <section className="section">
        <div className="shell narrow faq-list">
          {FAQ_ITEMS.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
        </div>
      </section>
    </>
  )
}

function ReviewCard({ review }) {
  return (
    <article className="review-card">
      <div className="review-topline">
        <div>
          <h3>{review.name}</h3>
          <span className="review-handle">{review.handle}</span>
        </div>
        <span className="review-rating">{review.rating}</span>
      </div>
      <p>{review.text}</p>
      <div className="review-meta">
        <span>{review.category}</span>
        <span>Verified on Discord</span>
      </div>
    </article>
  )
}

function Testimonials() {
  const [filter, setFilter] = useState('All')
  const categories = ['All', 'Fortnite Coaching', 'Editing', 'Discord Server Setup']
  const shown = filter === 'All' ? VERIFIED_REVIEWS : VERIFIED_REVIEWS.filter((review) => review.category === filter)

  return (
    <>
      <PageHero
        eyebrow="Customer Testimonials"
        title="35 verified ESN reviews"
        text="Real Discord feedback from Fortnite coaching, editing, and Discord server setup clients."
      />
      <section className="section">
        <div className="shell">
          <div className="review-summary">
            <div><strong>35</strong><span>Verified reviews</span></div>
            <div><strong>12</strong><span>Fortnite Coaching</span></div>
            <div><strong>12</strong><span>Editing</span></div>
            <div><strong>11</strong><span>Discord Server Setup</span></div>
          </div>

          <div className="review-filters" aria-label="Filter customer reviews">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={filter === category ? 'active' : ''}
                onClick={() => setFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="reviews-grid">
            {shown.map((review) => <ReviewCard key={review.handle} review={review} />)}
          </div>
        </div>
      </section>
    </>
  )
}
function ServicesShowcase() {
  return (
    <>
      <PageHero
        eyebrow="Service Showcase"
        title="Need a project done? Start here."
        text="We handle editing, Fortnite coaching, Discord setups, and website work. Tell us what you need in a ticket and we can discuss the details."
        actions={<a className="button primary" href={DISCORD_URL} target="_blank" rel="noreferrer">Open a service ticket <span>↗</span></a>}
      />

      <section className="section compact-section">
        <div className="shell network-stat-grid">
          <div><strong>8</strong><span>Current service categories</span></div>
          <div><strong>35</strong><span>Verified customer reviews</span></div>
          <div><strong>Discord</strong><span>Ordering & support hub</span></div>
          <div><strong>Tickets</strong><span>Direct project support</span></div>
        </div>
      </section>

      <section className="section service-showcase-section">
        <div className="shell">
          <div className="section-heading">
            <div><span className="eyebrow">Core Services</span><h2>Choose what you need help with.</h2></div>
          </div>
          <div className="card-grid three">
            {SERVICES.map((service, index) => (
              <article className="service-card static-card premium-service" key={service.id}>
                <span className="card-number">0{index + 1}</span>
                <span className="eyebrow">{service.eyebrow}</span>
                <h2>{service.title}</h2>
                <p>{service.text}</p>
                <a href={DISCORD_URL} target="_blank" rel="noreferrer">Open a ticket →</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark-section">
        <div className="shell">
          <div className="section-heading">
            <div><span className="eyebrow">More from ESN</span><h2>More ways to work with ESN.</h2></div>
          </div>
          <div className="card-grid two">
            {SHOWCASE_EXTRAS.map(([title, type, text], index) => (
              <article className="service-card static-card premium-service" key={title}>
                <span className="card-number">{String(index + 4).padStart(2, '0')}</span>
                <span className="eyebrow">{type}</span>
                <h2>{title}</h2>
                <p>{text}</p>
                <a href={DISCORD_URL} target="_blank" rel="noreferrer">Discuss in Discord →</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section compact-section">
        <div className="shell experience-flow">
          <div><span>01</span><strong>Choose</strong><p>Pick the service that matches what you need.</p></div>
          <div><span>02</span><strong>Open a ticket</strong><p>Tell ESN your goals, scope, and references in Discord.</p></div>
          <div><span>03</span><strong>Build together</strong><p>Stay in the ticket for questions, updates, and delivery.</p></div>
        </div>
      </section>
      <RelatedLinks
        title="Research ESN before you order."
        links={[
          ['Customer Reviews','Read the 35 reviews currently presented as verified through ESN Discord.','/testimonials'],
          ['Portfolio Demos','See clearly labeled illustrative editing, Discord, and website process comparisons.','/portfolio'],
          ['Service FAQ','Get answers about ordering, support, SMP purchases, tools, and ESN community access.','/faq'],
        ]}
      />
    </>
  )
}
function SMPConnection() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${SMP_HOST}:${SMP_JAVA_PORT}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <PageHero
        eyebrow="ESN SMP"
        title="Join ESN SMP on Java or Bedrock."
        text="Use the official connection details below. Java uses port 25565; Bedrock and console players use port 19132."
        actions={<Link className="button secondary" to="/smpconsole">Console connection guide</Link>}
      />

      <section className="section">
        <div className="shell smp-connect-layout">
          <div className="connection-card premium-connection">
            <span className="eyebrow">OFFICIAL SERVER ADDRESS</span>
            <strong>{SMP_HOST}</strong>
            <span className="connection-port">JAVA PORT {SMP_JAVA_PORT}</span>
            <button className="button primary copy-button" type="button" onClick={copy}>{copied ? 'Copied to clipboard' : 'Copy server address'}</button>
            <small>Java: {SMP_HOST}:{SMP_JAVA_PORT} • Bedrock/Xbox: {SMP_HOST}:{SMP_BEDROCK_PORT}</small>
            <SmpCopyButtons />
          </div>

          <div className="smp-side-stack">
            <article className="feature-panel">
              <span className="eyebrow">Console Players</span>
              <h3>Xbox, PlayStation & Switch</h3>
              <p>The console guide explains the extra steps for Xbox, PlayStation, and Switch players.</p>
              <Link to="/smpconsole">Open console guide →</Link>
            </article>
            <article className="feature-panel">
              <span className="eyebrow">Server Owners</span>
              <h3>Download ESNSMP</h3>
              <p>Want the ESN SMP plugin on your own server? Download the newest public ESNSMP.jar from the official release.</p>
              <Link to="/smpplugin">Open plugin download →</Link>
            </article>
            <article className="feature-panel">
              <span className="eyebrow">Need Support?</span>
              <h3>ESN Discord</h3>
              <p>Need a hand connecting or have a store question? You can reach the ESN team on Discord.</p>
              <a href={DISCORD_URL} target="_blank" rel="noreferrer">Open Discord →</a>
            </article>
          </div>
        </div>
      </section>
      <RelatedLinks
        title="Everything around the ESN SMP."
        links={[
          ['SMP Store','Browse the current ESN SMP keys, relics, and custom item bundles.','/storesmp'],
          ['ESNSMP Plugin','Download the public ESNSMP.jar and view the verified release information.','/smpplugin'],
          ['Network Status','Check the website, SMP status state, Arcade, Discord connection, and plugin release feed.','/status'],
        ]}
      />
    </>
  )
}
function ConsoleConnection() {
  const [copied, setCopied] = useState(false)
  const copyServer = async () => {
    try {
      await navigator.clipboard.writeText(`${SMP_HOST}:${SMP_BEDROCK_PORT}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  const steps = [
    ['01', 'Open Bedrock Connect on your phone', 'Use the Bedrock Connect app/method from the ESN console guide. Your phone and your console need to be connected to the same Wi-Fi or internet network.'],
    ['02', 'Open Custom', 'Inside Bedrock Connect, choose Custom so you can add the ESN SMP manually.'],
    ['03', 'Tap the + button', 'Create a new custom server entry.'],
    ['04', 'Enter the ESN SMP details', `Server name: ESN SMP • Address: ${SMP_HOST} • Port: ${SMP_BEDROCK_PORT}`],
    ['05', 'Save the server', 'Save the custom entry after all three fields match the ESN details above.'],
    ['06', 'Select ESN SMP', 'Tap the ESN SMP entry you just created so it becomes the active server.'],
    ['07', 'Press Add & Start', 'Bedrock Connect will begin the console connection process. Keep the phone and console on the same network while it starts.'],
    ['08', 'Finish on your console', 'Open Minecraft on Xbox, PlayStation, or Nintendo Switch and follow the connection prompt/process shown by Bedrock Connect.'],
  ]

  return (
    <>
      <PageHero
        eyebrow="ESN SMP • Console Connection"
        title="Join ESN SMP from console."
        text="The same ESN console flow explained on the official site: use Bedrock Connect on a phone, keep it on the same network as the console, add the ESN SMP details, then use Add & Start."
        actions={<button className="button secondary" type="button" onClick={copyServer}>{copied ? 'Copied server details' : 'Copy IP & port'}</button>}
      />

      <section className="section compact-section">
        <div className="shell console-server-ribbon">
          <div><span>SERVER NAME</span><strong>ESN SMP</strong></div>
          <div><span>ADDRESS</span><strong>{SMP_HOST}</strong></div>
          <div><span>BEDROCK PORT</span><strong>{SMP_BEDROCK_PORT}</strong></div>
          <div><span>CONSOLES</span><strong>Xbox • PlayStation • Switch</strong></div>
        </div>
      </section>

      <section className="section console-guide-section">
        <div className="shell console-guide-layout">
          <div className="console-guide-intro">
            <span className="eyebrow">Official ESN Flow</span>
            <h2>Phone + console.<br />Same network.</h2>
            <p>This page follows the connection flow ESN uses instead of sending players through extra DNS instructions that are not part of the official ESN walkthrough.</p>
            <div className="console-network-card">
              <span className="network-pulse"><i /></span>
              <div><strong>Same Wi-Fi / internet required</strong><p>Keep the phone running Bedrock Connect and the console on the same network during setup.</p></div>
            </div>
          </div>

          <div className="console-step-stack">
            {steps.map(([number, title, text]) => (
              <article className="console-step-card" key={number}>
                <span className="console-step-number">{number}</span>
                <div><h3>{title}</h3><p>{text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark-section compact-section">
        <div className="shell console-final-cta">
          <div>
            <span className="eyebrow">Ready?</span>
            <h2>ESN SMP is waiting.</h2>
            <p>If the console does not pick up the Bedrock Connect session, keep both devices on the same network and restart the Add & Start step before opening a support ticket.</p>
          </div>
          <a className="button primary" href={DISCORD_URL} target="_blank" rel="noreferrer">Get help in ESN Discord</a>
        </div>
      </section>
    </>
  )
}
function SMPPluginDownload() {
  const [pluginMeta, setPluginMeta] = useState(null)

  useEffect(() => {
    let active = true
    fetch('/esnsmp-build.json', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (active && data) setPluginMeta(data) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  const pluginSize = pluginMeta?.sizeBytes
    ? `${(pluginMeta.sizeBytes / 1024 / 1024).toFixed(1)} MB`
    : 'Current'
  const pluginBuild = pluginMeta?.commit
    ? pluginMeta.commit.slice(0, 7)
    : 'Verified'
  const pluginSha = pluginMeta?.sha256 || 'Checksum generated during deployment'

  return (
    <>
      <PageHero
        eyebrow="ESNSMP Plugin • Public Download"
        title="Run the ESN SMP plugin on your server."
        text="Download the newest verified ESNSMP v2.10.4 main-branch JAR. The site now syncs the latest successful GitHub Actions build automatically. Current builds include the Lightning King exclusive set, /lightning ability controls, Lightning King access inside Admin Exclusives, anti-cheat-safe movement for current and future exclusive abilities, the existing /void and /ownertag controls, 10-page backpacks, cosmetics, Kill Effects, and the rest of the ESN SMP systems."
        actions={<a className="button primary" href={PLUGIN_DOWNLOAD_URL}>Download latest ESNSMP.jar <span>↓</span></a>}
      />

      <section className="section plugin-showcase-section">
        <div className="shell plugin-showcase-grid">
          <div className="plugin-3d-panel">
            <ES3DViewer variant="ESNSMP Plugin" label="Interactive 3D ESNSMP plugin showcase" />
            <span className="plugin-version-float">{PLUGIN_VERSION} • LATEST VERIFIED MAIN BUILD</span>
          </div>

          <div className="plugin-release-card">
            <span className="eyebrow">Latest Verified Build</span>
            <h2>ESNSMP {PLUGIN_VERSION}</h2>
            <p>The download is synced from the newest successful <b>main</b> build of the official ESNSMP repository. It targets <b>Paper 26.2</b> and includes Lightning King, its ability-control menu, Admin Exclusives integration, and the shared exclusive-movement authorization that prevents ESN AntiCheat from kicking players for legitimate set abilities.</p>

            <div className="plugin-release-stats">
              <div><span>FILE</span><strong>ESNSMP.jar</strong></div>
              <div><span>SIZE</span><strong>{pluginSize}</strong></div>
              <div><span>VERSION</span><strong>{PLUGIN_VERSION}</strong></div>
              <div><span>BUILD</span><strong>{pluginBuild}</strong></div>
            </div>

            <a className="button primary plugin-download-button" href={PLUGIN_DOWNLOAD_URL}>Download latest .jar</a>
            <a className="text-link" href={PLUGIN_RELEASE_URL} target="_blank" rel="noreferrer">View verified main builds →</a>
          </div>
        </div>
      </section>

      <section className="section dark-section">
        <div className="shell">
          <div className="section-heading"><div><span className="eyebrow">Install</span><h2>From download to server in four steps.</h2></div></div>
          <div className="plugin-install-grid">
            <article><span>01</span><h3>Download</h3><p>Download the newest <b>ESNSMP.jar</b> using the button above.</p></article>
            <article><span>02</span><h3>Stop your server</h3><p>Fully stop the Minecraft server before replacing or adding plugin files.</p></article>
            <article><span>03</span><h3>Upload the .jar</h3><p>Place <b>ESNSMP.jar</b> in your server's <b>plugins</b> folder.</p></article>
            <article><span>04</span><h3>Start & verify</h3><p>Start the server and check the console for ESNSMP startup messages before players join.</p></article>
          </div>
        </div>
      </section>

      <section className="section compact-section">
        <div className="shell plugin-integrity-card">
          <div><span className="eyebrow">Release Integrity</span><h2>SHA-256</h2></div>
          <code>{pluginSha}</code>
          <p>The website generates this checksum from the exact ESNSMP.jar it publishes from the newest successful main build, so the displayed integrity value stays matched to the downloadable file.</p>
        </div>
      </section>
      <RelatedLinks
        title="Continue through the ESN Minecraft network."
        links={[
          ['Join ESN SMP','Use the official server address and port for the ES Network Minecraft server.','/smpconnection'],
          ['SMP Store','Browse the current ESN SMP digital products and Stripe checkout links.','/storesmp'],
          ['Release Center','See current ES Network website, plugin, Arcade, and network updates.','/updates'],
        ]}
      />
    </>
  )
}

function ProductCard({ product }) {
  const productId = 'product-' + product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return (
    <article className="product-card store-product" id={productId}>
      <div className="product-topline">
        <span className="eyebrow">ESN SMP</span>
        <span className="product-price">{product.price}</span>
      </div>

      <div className="product-3d-stage">
        <ES3DViewer variant={product.name} compact label={`${product.name} interactive 3D viewer`} />
        <div className="product-3d-badge">LIVE 3D PREVIEW</div>
      </div>

      <h2>{product.name}</h2>
      <p>{product.summary}</p>
      <ul className="product-items">
        {product.items.map((item) => <li key={item}>{item}</li>)}
      </ul>
      {product.stripe ? (
        <a className="button primary product-buy" href={product.stripe} target="_blank" rel="noreferrer">Buy with Stripe</a>
      ) : (
        <button className="button disabled product-buy" type="button" disabled>Checkout link pending migration</button>
      )}
    </article>
  )
}

function SMPStore() {
  const liveProducts = STORE_PRODUCTS.filter((product) => product.stripe)
  return (
    <>
      <PageHero
        eyebrow="ESN SMP Store"
        title="Official SMP store."
        text="Verified ESN SMP digital products with Stripe checkout and username-based delivery."
        actions={<a className="esn-tip-big" href={TIP_URL} target="_blank" rel="noreferrer"><span aria-hidden="true">♥</span> Leave a tip — any amount</a>}
      />

      <section className="section compact-section">
        <div className="shell network-stat-grid store-stat-grid">
          <div><strong>{liveProducts.length + EXCLUSIVES20.length + SMP_NEW_ITEMS.length}</strong><span>Current products</span></div>
          <div><strong>Stripe</strong><span>Secure checkout</span></div>
          <div><strong>Exact name</strong><span>Required for delivery</span></div>
          <div><strong>.</strong><span>Include the prefix if your username uses it</span></div>
        </div>
      </section>

      <section className="section store-section">
        <div className="shell">
          <div className="notice warning-notice store-warning">
            <div className="warning-icon">!</div>
            <div>
              <strong>Before you buy</strong>
              <span>Enter your exact in-game Minecraft username in the required Stripe field. You should be online on the SMP for automatic delivery. If your server username starts with a <b>.</b>, include the <b>.</b> at the beginning or delivery may require manual admin help.</span>
            </div>
          </div>

          <div className="store-x20-head" id="new-drops">
            <span className="eyebrow">New · Bundles &amp; mega packs</span>
            <h2>New exclusives, bundles and mega packs.</h2>
            <p>Five new exclusives, five bundles and two mega packs. Same Stripe checkout and username delivery as every item on this page.</p>
          </div>
          <div className="store-x20-grid store-new-grid">
            {SMP_NEW_ITEMS.map((product) => (
              <article className={'store-x20-card' + (product.kind !== 'exclusive' ? ' is-bundle' : '') + (product.kind === 'mega' ? ' is-mega' : '')} key={product.name} id={'product-' + product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}>
                <div className="store-x20-top"><span className="store-x20-icon" aria-hidden="true">{product.icon}</span><span className="store-x20-price">{product.price}</span></div>
                {product.kind === 'mega' && <span className="store-new-tag">Mega pack</span>}
                <h3>{product.name}</h3>
                {product.separate && <p className="store-new-separate">Separately <s>{product.separate}</s></p>}
                <ul>{product.items.map((item) => <li key={item}>{item}</li>)}</ul>
                <a className="button primary" href={product.stripe} target="_blank" rel="noreferrer">Buy with Stripe</a>
              </article>
            ))}
          </div>

          <div className="card-grid two store-grid">
            {liveProducts.map((product) => <ProductCard key={product.name} product={product} />)}
          </div>

          <div className="store-x20-head" id="exclusives-20">
            <span className="eyebrow">New · Exclusives 20</span>
            <h2>20 new exclusives.</h2>
            <p>Armor sets, tools, trails, kill effects, pets and two bundles. Same Stripe checkout and username delivery as the items above. Brand-new items arrive in-game with the next server update, so if you buy now they are delivered automatically the first time you join after it.</p>
          </div>
          <div className="store-x20-grid">
            {EXCLUSIVES20.map((product) => (
              <article className={'store-x20-card' + (product.bundle ? ' is-bundle' : '')} key={product.name} id={'product-' + product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}>
                <div className="store-x20-top"><span className="store-x20-icon" aria-hidden="true">{product.icon}</span><span className="store-x20-price">{product.price}</span></div>
                <h3>{product.name}</h3>
                <ul>{product.items.map((item) => <li key={item}>{item}</li>)}</ul>
                <a className="button primary" href={product.stripe} target="_blank" rel="noreferrer">Buy with Stripe</a>
              </article>
            ))}
          </div>

          <div className="store-tip-row">
            <p>Want to support the SMP? Leave a tip of any amount.</p>
            <a className="esn-tip-big" href={TIP_URL} target="_blank" rel="noreferrer"><span aria-hidden="true">♥</span> Leave a tip — any amount</a>
          </div>

          <div className="store-security">
            <div className="security-mark">✓</div>
            <div>
              <span className="eyebrow">Payment safety</span>
              <h2>Stripe handles checkout.</h2>
              <p>No Stripe secret keys or private payment credentials are stored in this front-end repository. Product buttons use official public Payment Links.</p>
            </div>
          </div>
        </div>
      </section>
      <RelatedLinks
        title="Need more SMP information?"
        links={[
          ['Join ESN SMP','Get the official Minecraft server address, port, and connection shortcuts.','/smpconnection'],
          ['Console Guide','Follow the ESN console connection flow for Xbox, PlayStation, and Nintendo Switch.','/smpconsole'],
          ['SMP FAQ','Review ordering, username delivery, console access, and ESN support answers.','/faq'],
        ]}
      />
    </>
  )
}
function ArcadeHub() {
  const arcade = useArcadeProgress()
  const gameStats = [
    ['110', 'Upgrades'],
    ['53 / 112', 'Zones / Machines'],
    ['5×5', 'Risk Grid'],
    ['1,000+', 'MOTO Tracks'],
    ['122', 'Tower Floors'],
    ['200', 'Defense Rounds'],
  ]

  return (
    <>
      <PageHero
        eyebrow="ESN Arcade"
        title="Six originals. One ESN Arcade."
        text="Six original ESN browser games with shared Arcade XP, levels, achievements, deeper progression, persistent records, and upgraded mobile and desktop gameplay."
        actions={<Link className="button primary" to="/esclicker">Start playing <span>→</span></Link>}
      />

      <section className="section compact-section">
        <div className="shell oa-arcade-hub-progress">
          <div><span>ARCADE LEVEL</span><strong>{arcade.level}</strong><small>{Math.floor(arcade.progress.xp||0).toLocaleString()} total XP</small></div>
          <div><span>ACHIEVEMENTS</span><strong>{arcade.achievementCount}</strong><small>Unlocked across all six games</small></div>
          <div><span>PROGRESSION</span><strong>SHARED</strong><small>One local Arcade level across every game</small></div>
          <div><span>SAVES</span><strong>LOCAL</strong><small>Progress stays on this device without an account</small></div>
        </div>
      </section>

      <section className="section compact-section">
        <div className="shell network-stat-grid arcade-stat-grid">
          {gameStats.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
        </div>
      </section>

      <ArcadeProgressCenter />

      <RetentionHub />

      <section className="section arcade-hub-section">
        <div className="shell arcade-hub-grid">
          {ARCADE_GAMES.map(([name, route, description], index) => (
            <article className="game-card arcade-hub-card" key={route}>
              <div className="arcade-card-top">
                <span className="card-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="arcade-live"><i /> PLAYABLE</span>
              </div>
              <span className="eyebrow">Original ESN Game</span>
              <h2>{name}</h2>
              <p>{description}</p>
              <div className="arcade-card-stat"><strong>{gameStats[index][0]}</strong><span>{gameStats[index][1]}</span></div>
              <Link to={route}>Launch game <span>→</span></Link>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
function NotFound() {
  return (
    <section className="page-hero">
      <div className="shell narrow">
        <span className="eyebrow">404</span>
        <h1>That page isn't here.</h1>
        <p>The link may be old or mistyped. These are the pages most people are looking for:</p>
        <div className="hero-actions page-actions">
          <Link className="button primary" to="/">Return home</Link>
          <Link className="button secondary" to="/hosting/vps">Hosting plans</Link>
          <Link className="button secondary" to="/storesmp">SMP Store</Link>
          <Link className="button secondary" to="/faq">Get help</Link>
        </div>
      </div>
    </section>
  )
}

function App() {
  const location=useLocation()
  const standaloneSite=location.pathname.startsWith('/sites/')
  return (
    <div className={standaloneSite ? 'site user-site-mode' : 'site'}>
      <AnalyticsTracker />
      {!standaloneSite&&<a className="skip-link" href="#main-content">Skip to main content</a>}
      {/* Kept for compatibility with legacy route checks; its visuals are hidden by calm-theme.css. */}
      {!standaloneSite&&<StartupIntro />}
      {!standaloneSite&&<MetaManager />}
      {!standaloneSite&&<ScrollToHash />}
      {!standaloneSite&&<ExperienceEffects />}
      {!standaloneSite&&<Global3DLighting />}
      {!standaloneSite&&<UltraExperience />}
      {!standaloneSite&&<ExperienceCoreV2 />}
      {!standaloneSite&&<PlatformLayer />}
      {!standaloneSite&&<VisibilityLayer />}
      {!standaloneSite&&<NetworkBar />}
      {!standaloneSite&&<Header />}
      {!standaloneSite&&<PremiumChrome />}
      {!standaloneSite&&<ExperienceLayer />}
      {!standaloneSite&&<EasterEggLayer />}
      {!standaloneSite&&<NetworkEvolution />}
      {!standaloneSite&&<SiteExpansionLayer />}
      {!standaloneSite&&<NexusEventLayer />}
      {!standaloneSite&&<NoAccountExperienceLayer />}
      {!standaloneSite&&<GlobalOpsLayer />}
      <main id="main-content">
        <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/leadership" element={<Leadership />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/terms" element={<Navigate to="/rules" replace />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/serviceshowcase" element={<ServicesShowcase />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/thanks" element={<ThanksPage />} />
          <Route path="/guardian" element={<GuardianPage />} />
          <Route path="/store-ai" element={<StoreAIPage />} />
          <Route path="/storeai" element={<Navigate to="/store-ai" replace />} />
          <Route path="/hosting" element={<DomainsPage />} />
          <Route path="/hosting/vps" element={<HostingPage />} />
          <Route path="/business" element={<BusinessPlatformPage section="overview" />} />
          <Route path="/business/dashboard" element={<BusinessPlatformPage section="dashboard" />} />
          <Route path="/business/admin" element={<LiveBusinessStaff />} />
          <Route path="/business/plans" element={<BusinessPlatformPage section="plans" />} />
          <Route path="/business/partners" element={<BusinessPlatformPage section="partners" />} />
          <Route path="/business/rewards" element={<BusinessPlatformPage section="rewards" />} />
          <Route path="/business/support" element={<BusinessPlatformPage section="support" />} />
          <Route path="/business/setup" element={<BusinessPlatformPage section="setup" />} />
          <Route path="/domains" element={<Navigate to="/hosting" replace />} />
          <Route path="/site-builder" element={<SiteBuilderPage />} />
          <Route path="/sites/:slug" element={<HostedSitePage />} />
        <Route path="/sites/:slug/:page" element={<HostedSitePage />} />
          <Route path="/storesmp" element={<SMPStore />} />
          <Route path="/store" element={<Navigate to="/storesmp" replace />} />
          <Route path="/store/smp" element={<Navigate to="/storesmp" replace />} />
          <Route path="/smpconnection" element={<SMPConnection />} />
          <Route path="/smpconsole" element={<ConsoleConnection />} />
          <Route path="/smpplugin" element={<SMPPluginDownload />} />
          <Route path="/smpguide" element={<SMPEncyclopediaPage />} />
          <Route path="/smp/realm-ascension" element={<SMPAscensionPage />} />
          <Route path="/launchpad" element={<LaunchpadPage />} />
          <Route path="/configure" element={<ServiceConfiguratorPage />} />
          <Route path="/smp-hub" element={<SMPWorldHubPage />} />
          <Route path="/trust" element={<TrustCenterPage />} />
          <Route path="/search" element={<GlobalSearchPage />} />
          <Route path="/labs" element={<LabsPage />} />
          <Route path="/estimate" element={<ProjectEstimatePage />} />
          <Route path="/smp-items" element={<SMPItemsPage />} />
          <Route path="/activity" element={<ActivityTimelinePage />} />
          <Route path="/share-generator" element={<ShareGeneratorV2Page />} />
          <Route path="/showcase" element={<BuilderShowcasePage />} />
          <Route path="/network-map" element={<NetworkMapPage />} />
          <Route path="/backup" element={<DataBackupPage />} />
          <Route path="/minecraft-server" element={<SearchLandingPage />} />
          <Route path="/minecraft-smp" element={<SearchLandingPage />} />
          <Route path="/fortnite-coaching" element={<SearchLandingPage />} />
          <Route path="/video-editing" element={<SearchLandingPage />} />
          <Route path="/discord-server-setup" element={<SearchLandingPage />} />
          <Route path="/website-builder" element={<SearchLandingPage />} />
          <Route path="/free-browser-tools" element={<SearchLandingPage />} />
          <Route path="/guides" element={<GuidesHubPage />} />
          <Route path="/guides/:slug" element={<GuideArticlePage />} />
          <Route path="/es-network" element={<BrandAuthorityPage />} />
          <Route path="/smp/:feature" element={<SMPFeaturePage />} />
          <Route path="/visibility" element={<VisibilityInsightsPage />} />
          <Route path="/status" element={<StatusCenter />} />
          <Route path="/networkstats" element={<NetworkStatsPage />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/nexus" element={<NetworkNexusPage />} />
          <Route path="/notifications" element={<NotificationCenterPage />} />
          <Route path="/rewards" element={<RewardMarketPage />} />
          <Route path="/challenges" element={<ChallengeLabPage />} />
          <Route path="/staff" element={<StaffDashboardPage />} />
          <Route path="/operations" element={<OperationsMapPage />} />
          <Route path="/incidents" element={<PublicIncidentsPage />} />
          <Route path="/changelog" element={<ChangelogTimelinePage />} />
          <Route path="/diagnostics" element={<DiagnosticCenterPage />} />
          <Route path="/smpcheck" element={<SMPConnectionTesterPage />} />
          <Route path="/blueprint" element={<SystemBlueprintPage />} />
          <Route path="/session" element={<SessionStatsPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/updates" element={<UpdatesPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/share" element={<ShareCenter />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/whatsnew" element={<WhatsNewPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/vault" element={<VaultPage />} />
          <Route path="/estools" element={<ESToolsSuite />} />
          <Route path="/tools" element={<Navigate to="/estools" replace />} />
          <Route path="/arcade" element={<ArcadeHub />} />
          <Route path="/esclicker" element={<ClickerGame />} />
          <Route path="/esfactory" element={<FactoryGame />} />
          <Route path="/esmines" element={<MinesGame />} />
          <Route path="/esmoto" element={<MotoGame />} />
          <Route path="/estower" element={<TowerGame />} />
          <Route path="/estowerdefense" element={<TowerDefenseGame />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        {!standaloneSite&&<RelatedVisibilityLinks />}
      </main>
      {!standaloneSite&&<Footer />}
    </div>
  )
}

export default App
