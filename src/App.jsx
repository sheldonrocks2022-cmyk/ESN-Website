import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import ESToolsSuite from './Tools'
import ES3DViewer from './ES3DViewer'
import PremiumChrome from './PremiumChrome'
import Global3DLighting from './Global3DLighting'
import StartupIntro from './StartupIntro'
import ExperienceLayer, { FooterCommandDeck, HeroReactor } from './ExperienceLayer'
import NetworkShowcase, { EasterEggLayer } from './NetworkShowcase'
import NetworkEvolution, { NetworkEvolutionSection } from './NetworkEvolution'
import ShareCenter from './ShareCenter'
import { SOCIAL_IMAGE_ALT, SOCIAL_IMAGE_URL, canonicalUrl, getSeo, robotsContent, structuredDataFor } from './seo'
import { PortfolioPage, StatusCenter, TimelinePage, UpdatesPage, VaultPage, WhatsHappeningNow } from './LiveExperience'
import { VERIFIED_REVIEWS } from './reviews'
import ClickerGame from './arcade/Clicker'
import FactoryGame from './arcade/Factory'
import MinesGame from './arcade/Mines'
import MotoGame from './arcade/Moto'
import TowerGame from './arcade/Tower'
import TowerDefenseGame from './arcade/TowerDefense'
import { useArcadeProgress } from './arcade/shared'

const DISCORD_URL = 'https://discord.gg/3gxA66KZ8'
const SMP_HOST = 'esn.ggwp.cc'
const SMP_PORT = '17058'
const PLUGIN_VERSION = 'v2.9.4'
const PLUGIN_DOWNLOAD_URL = 'https://github.com/sheldonrocks2022-cmyk/ESNSMP/releases/latest/download/ESNSMP.jar'
const PLUGIN_RELEASE_URL = 'https://github.com/sheldonrocks2022-cmyk/ESNSMP/releases/tag/v2.9.4'
const PLUGIN_SHA256 = '4439a6c8bf7ea6b0bf170098eeb1dff3f9f2f7008c06556140a1c1cfd8afd356'

const SERVICES = [
  {
    id: 'fortnite-coaching',
    eyebrow: 'Competitive Gaming',
    title: 'Fortnite Coaching',
    text: 'Focused coaching built around practical improvement, stronger decision-making, and better in-game consistency.',
  },
  {
    id: 'editing-services',
    eyebrow: 'Creator Services',
    title: 'Editing Services',
    text: 'Editing support for creators who want sharper, cleaner content built for their platform and audience.',
  },
  {
    id: 'discord-server-setups',
    eyebrow: 'Community Infrastructure',
    title: 'Discord Server Setups',
    text: 'Structured Discord setups designed around roles, channels, moderation, onboarding, and community growth.',
  },
]

const SHOWCASE_EXTRAS = [
  ['Website Creation', 'Web Projects', 'Website Creation includes Basic, Startup, and Enterprise options. ES Tools also includes the previously surfaced $180 starter and $320 multi-page starting estimates; final scope is confirmed through ESN.'],
  ['Memberships', 'Community', 'Existing ESN membership offers preserved from the current Service Showcase. Exact current tiers and prices will only be migrated once verified.'],
  ['Hashtag Packs', 'Creator Growth', 'Existing hashtag-pack offers preserved from the current Service Showcase without inventing package details.'],
  ['Stream Branding', 'Creator Branding', 'Branding work for streams and creator channels, preserved as an existing ESN showcase category.'],
  ['Custom Services', 'Custom Projects', 'For ESN work that does not fit a standard package, handled through Discord tickets.'],
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
    price: '$0.50',
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
    name: 'Void Warrior Bundle',
    price: '$0.50',
    stripe: null,
    summary: 'A high-end Void set with mobility, durability, combat bonuses, and full-set effects.',
    items: [
      'Void Blade',
      'Void Crown',
      'Void Chestplate',
      'Void Leggings',
      'Void Boots',
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
  ['What services does ESN offer?', 'The current public service focus includes Fortnite coaching, editing services, Discord server setups, and selected digital or website projects handled through ESN.'],
  ['How do I order a service?', 'Service ordering and support are handled through the official ESN Discord. Open a ticket and provide the details of what you need.'],
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
    setMeta('meta[property="og:image"]', 'property', 'og:image', SOCIAL_IMAGE_URL)
    setMeta('meta[property="og:image:alt"]', 'property', 'og:image:alt', SOCIAL_IMAGE_ALT)
    setMeta('meta[property="og:image:type"]', 'property', 'og:image:type', 'image/svg+xml')
    setMeta('meta[property="og:image:width"]', 'property', 'og:image:width', '1200')
    setMeta('meta[property="og:image:height"]', 'property', 'og:image:height', '630')

    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', SOCIAL_IMAGE_URL)
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

  return (
    <header className={scrolled ? 'site-header scrolled' : 'site-header'}>
      <div className="header-glow" aria-hidden="true" />
      <div className="shell header-inner">
        <Brand />

        <div className="header-status" aria-label="ES Network status">
          <i />
          <span>ESN ONLINE</span>
        </div>

        <button className="menu-toggle" type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Toggle navigation">
          <span />
          <span />
          <span />
        </button>

        <nav className={open ? 'nav open' : 'nav'} aria-label="Main navigation">
          <Link className={location.pathname === '/' || location.pathname === '/home' ? 'nav-direct active' : 'nav-direct'} onClick={close} to="/">Home</Link>

          <div className={inGroup(['/serviceshowcase','/portfolio']) ? 'nav-group active' : 'nav-group'}>
            <button className="nav-trigger" type="button" aria-haspopup="true">Services</button>
            <div className="dropdown">
              <span className="dropdown-label">ESN SERVICES</span>
              <Link onClick={close} to="/serviceshowcase">Service Showcase</Link>
              <Link onClick={close} to="/portfolio">Before / After Portfolio</Link>
              <Link onClick={close} to="/#fortnite-coaching">Fortnite Coaching</Link>
              <Link onClick={close} to="/#editing-services">Editing Services</Link>
              <Link onClick={close} to="/#discord-server-setups">Discord Server Setups</Link>
            </div>
          </div>

          <div className={inGroup(['/smpconnection','/smpconsole','/smpplugin','/storesmp']) ? 'nav-group active' : 'nav-group'}>
            <button className="nav-trigger" type="button" aria-haspopup="true">ESN SMP</button>
            <div className="dropdown">
              <span className="dropdown-label">MINECRAFT NETWORK</span>
              <Link onClick={close} to="/smpconnection">SMP Connection</Link>
              <Link onClick={close} to="/smpconsole">Console Connection</Link>
              <Link onClick={close} to="/smpplugin">Download ESNSMP Plugin</Link>
              <Link onClick={close} to="/storesmp">SMP Store</Link>
            </div>
          </div>

          <div className={arcadeActive ? 'nav-group active' : 'nav-group'}>
            <button className="nav-trigger" type="button" aria-haspopup="true">Arcade</button>
            <div className="dropdown arcade-dropdown">
              <span className="dropdown-label">PLAY ESN</span>
              <Link onClick={close} to="/arcade">Arcade Hub</Link>
              {ARCADE_GAMES.map(([name, route]) => <Link onClick={close} key={route} to={route}>{name}</Link>)}
            </div>
          </div>

          <Link className={location.pathname === '/estools' ? 'nav-direct active' : 'nav-direct'} onClick={close} to="/estools">ES Tools</Link>

          <div className={inGroup(['/about','/leadership','/testimonials','/faq','/status','/timeline','/updates','/share']) ? 'nav-group active' : 'nav-group'}>
            <button className="nav-trigger" type="button" aria-haspopup="true">About</button>
            <div className="dropdown">
              <span className="dropdown-label">THE NETWORK</span>
              <Link onClick={close} to="/about">About ES Network</Link>
              <Link onClick={close} to="/status">Live Network Status</Link>
              <Link onClick={close} to="/updates">Release Center</Link>
              <Link onClick={close} to="/timeline">Interactive Timeline</Link>
              <Link onClick={close} to="/share">Share Deck</Link>
              <Link onClick={close} to="/leadership">Leadership</Link>
              <Link onClick={close} to="/testimonials">35 Verified Reviews</Link>
              <Link onClick={close} to="/faq">FAQ</Link>
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
      <div className="shell footer-top">
        <div className="footer-brand-block">
          <Brand />
          <h2>Build. Play. Create.<br />Stay inside the network.</h2>
          <p>The official home of ES Network — creator services, verified reviews, ESN SMP, browser Arcade, free tools, and community support.</p>
          <a className="footer-discord" href={DISCORD_URL} target="_blank" rel="noreferrer">Join ESN Discord <span>↗</span></a>
        </div>

        <div className="footer-links">
          <div>
            <h3>Explore</h3>
            <Link to="/serviceshowcase">Services</Link>
            <Link to="/portfolio">Portfolio</Link>
            <Link to="/testimonials">Verified Reviews</Link>
            <Link to="/arcade">Arcade</Link>
            <Link to="/estools">ES Tools</Link>
          </div>
          <div>
            <h3>ESN SMP</h3>
            <Link to="/smpconnection">Connect</Link>
            <Link to="/smpconsole">Console Guide</Link>
            <Link to="/smpplugin">Download Plugin</Link>
            <Link to="/storesmp">SMP Store</Link>
            <span>{SMP_HOST}</span>
          </div>
          <div>
            <h3>Network</h3>
            <Link to="/about">About ESN</Link>
            <Link to="/status">Network Status</Link>
            <Link to="/updates">Release Center</Link>
            <Link to="/timeline">Timeline</Link>
            <Link to="/share">Share Deck</Link>
            <Link to="/leadership">Leadership</Link>
            <Link to="/faq">FAQ</Link>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer">Discord Support</a>
          </div>
        </div>
      </div>

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
function Home() {
  return (
    <>
      <section className="hero flagship-hero" id="hero-banner">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orb orb-one" aria-hidden="true" />
        <div className="hero-orb orb-two" aria-hidden="true" />
        <div className="hero-scanline" aria-hidden="true" />
        <div className="flagship-horizon" aria-hidden="true" />
        <div className="flagship-lines" aria-hidden="true" />

        <div className="shell flagship-hero-layout">
          <div className="flagship-hero-copy">
            <div className="hero-badge-row">
              <span className="signal-badge"><i /> ESN SYSTEMS ONLINE</span>
              <span className="hero-version" data-easter="hero-version" title="ES NETWORK // 2026">ES NETWORK // 2026</span>
            </div>

            <span className="eyebrow">OFFICIAL ES NETWORK DIGITAL HUB</span>
            <h1><span className="hero-line-small">One network.</span><br /><span className="hero-line-main">Everything ESN.</span></h1>
            <p>Creator services, verified customer reviews, six original browser games, free tools, community support, and the ESN SMP — built as one connected digital network.</p>

            <div className="hero-actions flagship-actions">
              <Link className="button primary" to="/serviceshowcase">Enter ES Network <span>↗</span></Link>
              <a className="button secondary" href={DISCORD_URL} target="_blank" rel="noreferrer">Join the community</a>
            </div>

            <div className="flagship-metrics">
              <div><span>01</span><strong>35</strong><small>Verified reviews</small></div>
              <div><span>02</span><strong>6</strong><small>Original Arcade games</small></div>
              <div><span>03</span><strong>{SMP_HOST}</strong><small>ESN SMP</small></div>
            </div>
          </div>

          <aside className="flagship-core-stage">
            <div className="flagship-core-top"><span>ESN CORE</span><i /><b>LIVE</b></div>
            <HeroReactor />
            <div className="flagship-core-footer">
              <span>INTERACTIVE NETWORK REACTOR</span>
              <strong>DRAG • ROTATE • CHARGE • OVERDRIVE</strong>
            </div>
          </aside>
        </div>

        <div className="shell flagship-route-strip">
          <Link to="/serviceshowcase"><span>01</span><b>Services</b><small>Creator & gaming</small><em>↗</em></Link>
          <Link to="/arcade"><span>02</span><b>Arcade</b><small>Six original games</small><em>↗</em></Link>
          <Link to="/smpconnection"><span>03</span><b>ESN SMP</b><small>Connect & play</small><em>↗</em></Link>
          <Link to="/estools"><span>04</span><b>ES Tools</b><small>Free browser utilities</small><em>↗</em></Link>
        </div>
      </section>

      <WhatsHappeningNow />

      <NetworkShowcase />

      <NetworkEvolutionSection />

      <section className="section flagship-story-section">
        <div className="shell flagship-story">
          <aside className="flagship-story-sticky">
            <span className="eyebrow">THE NETWORK</span>
            <h2>Not a collection of pages.<br />One connected experience.</h2>
            <p>Every major part of ESN now lives inside the same premium system — same navigation, same identity, same visual language.</p>
            <Link className="text-link" to="/about">About ES Network →</Link>
          </aside>

          <div className="flagship-story-stack">
            <article className="story-panel story-services" id="fortnite-coaching">
              <span className="story-index">01</span>
              <div><span className="eyebrow">CREATOR & GAMING SERVICES</span><h3>Work directly with ESN.</h3><p>Fortnite coaching, editing, Discord server setups, website projects, and other selected digital services.</p><Link to="/serviceshowcase">Explore services →</Link></div>
              <strong>SERVICES</strong>
            </article>

            <article className="story-panel story-smp">
              <span className="story-index">02</span>
              <div><span className="eyebrow">ESN SMP</span><h3>A Minecraft world inside the network.</h3><p>Join at {SMP_HOST}:{SMP_PORT}, browse the official store, use the console guide, or download the public ESNSMP plugin.</p><Link to="/smpconnection">Enter the SMP hub →</Link></div>
              <strong>SMP</strong>
            </article>

            <article className="story-panel story-arcade">
              <span className="story-index">03</span>
              <div><span className="eyebrow">ESN ARCADE</span><h3>Six original browser games.</h3><p>Clicker, Factory, Mines, MOTO, Tower, and Tower Defense — all inside the same ESN shell.</p><Link to="/arcade">Open the Arcade →</Link></div>
              <strong>PLAY</strong>
            </article>

            <article className="story-panel story-tools" id="home-tools">
              <span className="story-index">04</span>
              <div><span className="eyebrow">ES TOOLS</span><h3>Fast utilities with no account wall.</h3><p>Challenge generation, timers, prompt building, randomizers, coin/dice tools, and website estimates.</p><Link to="/estools">Open ES Tools →</Link></div>
              <strong>TOOLS</strong>
            </article>
          </div>
        </div>
      </section>

      <section className="section flagship-services-section" aria-labelledby="services-title">
        <div className="shell">
          <div className="section-heading flagship-heading">
            <div><span className="eyebrow">WHAT WE DO</span><h2 id="services-title">Built for players, creators, and communities.</h2></div>
            <Link className="text-link" to="/serviceshowcase">View full showcase →</Link>
          </div>

          <div className="flagship-service-bento">
            {SERVICES.map((service,index)=>(
              <article className={`service-card flagship-service-card service-${index+1}`} id={service.id} key={service.id}>
                <div className="service-card-top"><span className="card-number">0{index+1}</span><span className="service-live"><i/> AVAILABLE</span></div>
                <span className="eyebrow">{service.eyebrow}</span>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <a href={DISCORD_URL} target="_blank" rel="noreferrer">Open a Discord ticket <span>↗</span></a>
              </article>
            ))}

            <article className="service-card flagship-service-card service-more">
              <span className="eyebrow">MORE FROM ESN</span>
              <h3>Website projects, branding, memberships, and custom work.</h3>
              <p>Explore the full Service Showcase for additional ESN categories and project types.</p>
              <Link to="/serviceshowcase">See everything ESN offers →</Link>
            </article>
          </div>
        </div>
      </section>

      <section className="section flagship-smp-section">
        <div className="shell flagship-smp-stage">
          <div className="flagship-smp-copy">
            <div className="flagship-big-index">ESN // SMP</div>
            <span className="eyebrow">MINECRAFT NETWORK</span>
            <h2>The network has its own world.</h2>
            <p>Connect to the ESN SMP, shop official server items, use the console walkthrough, or download the latest public ESNSMP plugin release.</p>
            <div className="flagship-smp-address"><span>SERVER</span><strong>{SMP_HOST}</strong><small>PORT {SMP_PORT}</small></div>
            <div className="hero-actions">
              <Link className="button primary" to="/smpconnection">Connection details</Link>
              <Link className="button secondary" to="/storesmp">Open SMP Store</Link>
            </div>
          </div>

          <div className="flagship-smp-grid">
            <Link to="/smpconsole"><span>01</span><strong>Console Guide</strong><small>Xbox • PlayStation • Switch</small><em>↗</em></Link>
            <Link to="/smpplugin"><span>02</span><strong>Public Plugin</strong><small>Download ESNSMP.jar</small><em>↓</em></Link>
            <Link to="/storesmp"><span>03</span><strong>SMP Store</strong><small>Official Stripe checkout</small><em>↗</em></Link>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer"><span>04</span><strong>Support</strong><small>ESN Discord</small><em>↗</em></a>
          </div>
        </div>
      </section>

      <section className="section flagship-arcade-section">
        <div className="shell">
          <div className="section-heading flagship-heading">
            <div><span className="eyebrow">ESN ARCADE</span><h2>Six worlds. One launch deck.</h2></div>
            <Link className="text-link" to="/arcade">Enter Arcade →</Link>
          </div>

          <div className="flagship-arcade-rail">
            {ARCADE_GAMES.map(([name,route,description],index)=>(
              <Link className="flagship-game-card" to={route} key={route}>
                <span className="flagship-game-index">{String(index+1).padStart(2,'0')}</span>
                <div className="flagship-game-glow" aria-hidden="true"/>
                <span className="eyebrow">ORIGINAL ESN GAME</span>
                <h3>{name}</h3>
                <p>{description}</p>
                <div className="flagship-game-launch"><span>LAUNCH</span><b>↗</b></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section flagship-community-section" id="discord-exclusive-services">
        <div className="shell flagship-community-stage">
          <div>
            <span className="eyebrow">COMMUNITY FIRST</span>
            <h2>ES Network lives where the community does.</h2>
            <p>Service support, updates, announcements, SMP information, and community access all connect back to the official ESN Discord.</p>
          </div>
          <div className="flagship-community-actions">
            <a className="button primary" href={DISCORD_URL} target="_blank" rel="noreferrer">Join ESN Discord</a>
            <div className="flagship-community-status"><i/><span>COMMUNITY ACCESS</span><strong>OPEN</strong></div>
          </div>
        </div>
      </section>

      <section className="section flagship-safety-section" id="community-safety">
        <div className="shell flagship-safety-grid">
          <div><span className="eyebrow">COMMUNITY SAFETY</span><h2>A clearer place to connect.</h2></div>
          <div className="flagship-safety-copy"><span>DIRECT SUPPORT</span><p>ESN uses organized support channels, community rules, and ticket-based help for services, SMP support, and general community questions.</p></div>
        </div>
      </section>

      <section className="section flagship-leadership-section" id="meet-the-team">
        <div className="shell flagship-leadership">
          <div className="flagship-leader-mark">L</div>
          <div className="flagship-leader-copy">
            <span className="eyebrow">FOUNDER & CEO</span>
            <h2>Landon</h2>
            <p>Founder & CEO of ES Network.</p>
            <div className="responsibility-tags">{LANDON_RESPONSIBILITIES.slice(0,3).map(item=><span key={item}>{item}</span>)}</div>
          </div>
          <Link className="flagship-leader-link" to="/leadership"><span>Meet the team</span><b>↗</b></Link>
        </div>
      </section>

      <section className="section flagship-reviews-section" id="reviews">
        <div className="shell">
          <div className="flagship-review-header">
            <div><span className="eyebrow">VERIFIED SOCIAL PROOF</span><h2>35 real ESN customer reviews.</h2><p>Discord feedback from Fortnite coaching, editing, and Discord server setup clients.</p></div>
            <div className="flagship-review-score"><strong>35</strong><span>VERIFIED</span><small>Discord reviews</small></div>
          </div>
          <div className="flagship-review-wall">
            {[VERIFIED_REVIEWS[0],VERIFIED_REVIEWS[12],VERIFIED_REVIEWS[24]].map((review,index)=>(
              <div className={`flagship-review-slot slot-${index+1}`} key={review.handle}><ReviewCard review={review}/></div>
            ))}
          </div>
          <Link className="flagship-review-link" to="/testimonials"><span>View all 35 verified reviews</span><b>↗</b></Link>
        </div>
      </section>

      <section className="section flagship-process-section" id="how-it-works">
        <div className="shell">
          <div className="section-heading flagship-heading"><div><span className="eyebrow">HOW IT WORKS</span><h2>Three steps. One network.</h2></div></div>
          <div className="flagship-process">
            <div><span>01</span><strong>Choose</strong><p>Find the service, tool, Arcade game, or SMP destination you need.</p></div>
            <div><span>02</span><strong>Connect</strong><p>Use the official ESN Discord for service ordering and support.</p></div>
            <div><span>03</span><strong>Complete</strong><p>Work through the correct ESN channel for delivery, support, or community access.</p></div>
          </div>
        </div>
      </section>

      <section className="section flagship-faq-section" id="faq">
        <div className="shell flagship-faq-layout">
          <div><span className="eyebrow">FAQ</span><h2>Quick answers.</h2><p>Everything important without digging through the site.</p><Link className="text-link" to="/faq">Full FAQ →</Link></div>
          <div className="faq-list">
            {FAQ_ITEMS.slice(0,4).map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}
          </div>
        </div>
      </section>

      <section className="section flagship-final-section">
        <div className="shell flagship-final-cta">
          <span className="flagship-final-kicker">ES NETWORK</span>
          <h2>Build. Play. Create.<br/><span>Stay inside the network.</span></h2>
          <p>Everything ESN — services, community, tools, Arcade, and SMP — in one connected experience.</p>
          <div className="hero-actions">
            <Link className="button primary" to="/serviceshowcase">Explore ESN</Link>
            <a className="button secondary" href={DISCORD_URL} target="_blank" rel="noreferrer">Join Discord</a>
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
        title="Built as one network, not a pile of separate projects."
        text="ES Network is the current organization and brand. EP1C Services was the former name — not a separate current division."
      />

      <section className="section compact-section">
        <div className="shell network-stat-grid about-stat-grid">
          <div><strong>ESN</strong><span>Current brand</span></div>
          <div><strong>35</strong><span>Verified reviews</span></div>
          <div><strong>6</strong><span>Arcade games</span></div>
          <div><strong>1</strong><span>Connected network</span></div>
        </div>
      </section>

      <section className="section">
        <div className="shell about-story-grid">
          <div className="about-story-copy">
            <span className="eyebrow">The Network</span>
            <h2>Gaming, creator services, tools, community, and ESN SMP.</h2>
            <p className="large-copy">ESN brings together creator services, gaming, community projects, browser experiences, tools, and the ESN SMP under one recognizable identity.</p>
          </div>
          <div className="brand-timeline">
            <div><span>THEN</span><strong>EP1C Services</strong><p>The former name.</p></div>
            <div className="timeline-line"><i /></div>
            <div><span>NOW</span><strong>ES Network</strong><p>The current organization and brand moving forward.</p></div>
          </div>
        </div>
      </section>

      <section className="section dark-section">
        <div className="shell">
          <div className="section-heading">
            <div><span className="eyebrow">Why ES Network</span><h2>Everything connects back to the same identity.</h2></div>
          </div>
          <div className="card-grid three">
            <article className="feature-panel"><span className="eyebrow">Services</span><h3>Direct ordering & support</h3><p>Service requests and support are routed through ESN Discord tickets so visitors have one clear place to start.</p></article>
            <article className="feature-panel"><span className="eyebrow">Gaming</span><h3>ESN SMP & Arcade</h3><p>The Minecraft server and browser Arcade live under the same ES Network navigation and visual system.</p></article>
            <article className="feature-panel"><span className="eyebrow">Tools</span><h3>Free browser utilities</h3><p>ES Tools provides browser-first creator and gaming utilities without requiring an account.</p></article>
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
        text="Founders and co-founders are separated from administration so the structure stays clear."
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
function FAQ() {
  return (
    <>
      <PageHero eyebrow="Support" title="Frequently asked questions" text="Answers about ES Network, ordering, support, community access, tools, and the SMP." />
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
        title="ESN services, built around real people."
        text="Gaming, creator, community, and web services with ordering and support handled through the official ES Network Discord."
        actions={<a className="button primary" href={DISCORD_URL} target="_blank" rel="noreferrer">Open a service ticket <span>↗</span></a>}
      />

      <section className="section compact-section">
        <div className="shell network-stat-grid">
          <div><strong>8</strong><span>Current service categories</span></div>
          <div><strong>35</strong><span>Verified customer reviews</span></div>
          <div><strong>Discord</strong><span>Ordering & support hub</span></div>
          <div><strong>ESN</strong><span>One connected network</span></div>
        </div>
      </section>

      <section className="section service-showcase-section">
        <div className="shell">
          <div className="section-heading">
            <div><span className="eyebrow">Core Services</span><h2>Start with what ESN does best.</h2></div>
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
            <div><span className="eyebrow">More from ESN</span><h2>Digital work beyond the core three.</h2></div>
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
          <div><span>03</span><strong>Build together</strong><p>Work through the correct ESN support channel through delivery.</p></div>
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
      await navigator.clipboard.writeText(`${SMP_HOST}:${SMP_PORT}`)
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
        title="Your gateway into the ESN world."
        text="Use the official connection details below. Console players have a dedicated walkthrough built into the site."
        actions={<Link className="button secondary" to="/smpconsole">Console connection guide</Link>}
      />

      <section className="section">
        <div className="shell smp-connect-layout">
          <div className="connection-card premium-connection">
            <span className="eyebrow">OFFICIAL SERVER ADDRESS</span>
            <strong>{SMP_HOST}</strong>
            <span className="connection-port">PORT {SMP_PORT}</span>
            <button className="button primary copy-button" type="button" onClick={copy}>{copied ? 'Copied to clipboard' : 'Copy server address'}</button>
            <small>Copy: {SMP_HOST}:{SMP_PORT}</small>
          </div>

          <div className="smp-side-stack">
            <article className="feature-panel">
              <span className="eyebrow">Console Players</span>
              <h3>Xbox, PlayStation & Switch</h3>
              <p>Use the dedicated console page for third-party server connection guidance and the same ESN server details.</p>
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
              <p>Server announcements, connection help, store support, and community updates all run through the official Discord.</p>
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
      await navigator.clipboard.writeText(`${SMP_HOST}:${SMP_PORT}`)
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
    ['04', 'Enter the ESN SMP details', `Server name: ESN SMP • Address: ${SMP_HOST} • Port: ${SMP_PORT}`],
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
          <div><span>PORT</span><strong>{SMP_PORT}</strong></div>
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
  return (
    <>
      <PageHero
        eyebrow="ESNSMP Plugin • Public Download"
        title="Run the ESN SMP plugin on your server."
        text="Download the newest published ESNSMP.jar directly from the official ESNSMP GitHub release. The download button follows the latest release automatically."
        actions={<a className="button primary" href={PLUGIN_DOWNLOAD_URL}>Download latest ESNSMP.jar <span>↓</span></a>}
      />

      <section className="section plugin-showcase-section">
        <div className="shell plugin-showcase-grid">
          <div className="plugin-3d-panel">
            <ES3DViewer variant="ESNSMP Plugin" label="Interactive 3D ESNSMP plugin showcase" />
            <span className="plugin-version-float">{PLUGIN_VERSION} • LATEST VERIFIED RELEASE</span>
          </div>

          <div className="plugin-release-card">
            <span className="eyebrow">Latest Public Release</span>
            <h2>ESNSMP {PLUGIN_VERSION}</h2>
            <p>The current public release passed its GitHub build and publish workflows before being attached as <b>ESNSMP.jar</b>.</p>

            <div className="plugin-release-stats">
              <div><span>FILE</span><strong>ESNSMP.jar</strong></div>
              <div><span>SIZE</span><strong>16.2 MB</strong></div>
              <div><span>RELEASE</span><strong>{PLUGIN_VERSION}</strong></div>
              <div><span>BUILD</span><strong>Verified</strong></div>
            </div>

            <a className="button primary plugin-download-button" href={PLUGIN_DOWNLOAD_URL}>Download latest .jar</a>
            <a className="text-link" href={PLUGIN_RELEASE_URL} target="_blank" rel="noreferrer">View {PLUGIN_VERSION} release notes →</a>
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
          <code>{PLUGIN_SHA256}</code>
          <p>Current checksum for the verified {PLUGIN_VERSION} release asset. The “latest” download URL will move forward when a newer release is published, so check that release's checksum when the version changes.</p>
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
  return (
    <>
      <PageHero
        eyebrow="ESN SMP Store"
        title="Official SMP store."
        text="Verified ESN SMP digital products with Stripe checkout and username-based delivery."
      />

      <section className="section compact-section">
        <div className="shell network-stat-grid store-stat-grid">
          <div><strong>{STORE_PRODUCTS.length}</strong><span>Current products</span></div>
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

          <div className="card-grid two store-grid">
            {STORE_PRODUCTS.map((product) => <ProductCard key={product.name} product={product} />)}
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
        <p>The rebuilt ESN site uses explicit routes so broken links are easier to detect and fix before launch.</p>
        <div className="hero-actions page-actions">
          <Link className="button primary" to="/">Return home</Link>
          <Link className="button secondary" to="/faq">Get help</Link>
        </div>
      </div>
    </section>
  )
}

function App() {
  return (
    <div className="site">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <StartupIntro />
      <MetaManager />
      <ScrollToHash />
      <ExperienceEffects />
      <Global3DLighting />
      <Header />
      <PremiumChrome />
      <ExperienceLayer />
      <EasterEggLayer />
      <NetworkEvolution />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/leadership" element={<Leadership />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/serviceshowcase" element={<ServicesShowcase />} />
          <Route path="/storesmp" element={<SMPStore />} />
          <Route path="/store" element={<Navigate to="/storesmp" replace />} />
          <Route path="/store/smp" element={<Navigate to="/storesmp" replace />} />
          <Route path="/smpconnection" element={<SMPConnection />} />
          <Route path="/smpconsole" element={<ConsoleConnection />} />
          <Route path="/smpplugin" element={<SMPPluginDownload />} />
          <Route path="/status" element={<StatusCenter />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/updates" element={<UpdatesPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/share" element={<ShareCenter />} />
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
      </main>
      <Footer />
    </div>
  )
}

export default App
