import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import ESToolsSuite from './Tools'
import ES3DViewer from './ES3DViewer'
import { VERIFIED_REVIEWS } from './reviews'
import ClickerGame from './arcade/Clicker'
import FactoryGame from './arcade/Factory'
import MinesGame from './arcade/Mines'
import MotoGame from './arcade/Moto'
import TowerGame from './arcade/Tower'
import TowerDefenseGame from './arcade/TowerDefense'

const DISCORD_URL = 'https://discord.gg/3gxA66KZ8'
const SMP_HOST = 'esn.ggwp.cc'
const SMP_PORT = '17058'

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

const META = {
  '/': ['ES Network (ESN) | Fortnite Coaching, Editing & Discord Services', 'The official ES Network website for Fortnite coaching, editing, Discord setup services, ESN SMP, Arcade games, tools, and community access.'],
  '/home': ['ES Network (ESN) | Fortnite Coaching, Editing & Discord Services', 'The official ES Network website for Fortnite coaching, editing, Discord setup services, ESN SMP, Arcade games, tools, and community access.'],
  '/serviceshowcase': ['ES Network Services | Fortnite Coaching, Editing & Discord Setup', 'Explore ES Network services including Fortnite coaching, editing, Discord server setups, and selected digital projects.'],
  '/storesmp': ['ESN SMP Store | ES Network Minecraft Items', 'Purchase ESN SMP digital items and bundles through official Stripe checkout links.'],
  '/smpconnection': ['ESN SMP Connection | Server IP & Port', 'Connect to the ESN SMP using the current server IP and port.'],
  '/smpconsole': ['ESN SMP Console Connection | Xbox, PlayStation & Switch', 'Console connection guidance for joining the ESN SMP from Xbox, PlayStation, or Nintendo Switch.'],
  '/estools': ['ES Tools | Free Browser-Based Creator & Gaming Utilities', 'Free browser-based ES Network tools with no account required.'],
  '/about': ['About ES Network | ESN', 'Learn about ES Network, the current brand formerly known as EP1C Services.'],
  '/leadership': ['ES Network Leadership | Meet the Team', 'Meet the founders, co-founders, and administrators behind ES Network.'],
  '/faq': ['ES Network FAQ | Services, Ordering & Support', 'Answers about ES Network services, SMP purchases, support, community access, and tools.'],
  '/testimonials': ['ES Network Customer Testimonials', 'Read 35 verified ES Network reviews for Fortnite coaching, editing, and Discord server setup services.'],
  '/arcade': ['ESN Arcade | Browser Games', 'The ES Network Arcade routes are preserved while the original game experiences are faithfully migrated.'],
  '/esclicker': ['ES Clicker | ESN Arcade', 'Original ES Clicker route preserved for faithful migration.'],
  '/esfactory': ['ES Factory | ESN Arcade', 'Original ES Factory route preserved for faithful migration.'],
  '/esmines': ['ES Mines | ESN Arcade', 'Original ES Mines route preserved for faithful migration.'],
  '/esmoto': ['ES MOTO | ESN Arcade', 'Original ES MOTO route preserved for faithful migration.'],
  '/estower': ['ES Tower | ESN Arcade', 'Original ES Tower route preserved for faithful migration.'],
  '/estowerdefense': ['ES Tower Defense | ESN Arcade', 'Original ES Tower Defense route preserved for faithful migration.'],
}

function MetaManager() {
  const location = useLocation()

  useEffect(() => {
    const [title, description] = META[location.pathname] ?? ['ES Network', 'Official ES Network website.']
    document.title = title

    let descriptionTag = document.querySelector('meta[name="description"]')
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta')
      descriptionTag.setAttribute('name', 'description')
      document.head.appendChild(descriptionTag)
    }
    descriptionTag.setAttribute('content', description)

    let robotsTag = document.querySelector('meta[name="robots"]')
    if (window.location.hostname === 'ep1cservices.shop') {
      if (!robotsTag) {
        robotsTag = document.createElement('meta')
        robotsTag.setAttribute('name', 'robots')
        document.head.appendChild(robotsTag)
      }
      robotsTag.setAttribute('content', 'noindex, nofollow')
    } else if (robotsTag?.dataset?.testDomain === 'true') {
      robotsTag.remove()
    }
    if (robotsTag && window.location.hostname === 'ep1cservices.shop') {
      robotsTag.dataset.testDomain = 'true'
    }

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', `https://esnoffical.com${location.pathname === '/home' ? '/' : location.pathname}`)

    let ogTitle = document.querySelector('meta[property="og:title"]')
    if (!ogTitle) {
      ogTitle = document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      document.head.appendChild(ogTitle)
    }
    ogTitle.setAttribute('content', title)

    let ogDescription = document.querySelector('meta[property="og:description"]')
    if (!ogDescription) {
      ogDescription = document.createElement('meta')
      ogDescription.setAttribute('property', 'og:description')
      document.head.appendChild(ogDescription)
    }
    ogDescription.setAttribute('content', description)
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

function Brand() {
  return (
    <Link to="/" className="brand" aria-label="ES Network home">
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
  const location = useLocation()
  const close = () => setOpen(false)
  const inGroup = (paths) => paths.some((path) => location.pathname === path || location.pathname.startsWith(path + '/'))
  const arcadeActive = location.pathname === '/arcade' || ARCADE_GAMES.some(([, route]) => route === location.pathname)

  return (
    <header className="site-header">
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

          <div className={inGroup(['/serviceshowcase']) ? 'nav-group active' : 'nav-group'}>
            <button className="nav-trigger" type="button" aria-haspopup="true">Services</button>
            <div className="dropdown">
              <span className="dropdown-label">ESN SERVICES</span>
              <Link onClick={close} to="/serviceshowcase">Service Showcase</Link>
              <Link onClick={close} to="/#fortnite-coaching">Fortnite Coaching</Link>
              <Link onClick={close} to="/#editing-services">Editing Services</Link>
              <Link onClick={close} to="/#discord-server-setups">Discord Server Setups</Link>
            </div>
          </div>

          <div className={inGroup(['/smpconnection','/smpconsole','/storesmp']) ? 'nav-group active' : 'nav-group'}>
            <button className="nav-trigger" type="button" aria-haspopup="true">ESN SMP</button>
            <div className="dropdown">
              <span className="dropdown-label">MINECRAFT NETWORK</span>
              <Link onClick={close} to="/smpconnection">SMP Connection</Link>
              <Link onClick={close} to="/smpconsole">Console Connection</Link>
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

          <div className={inGroup(['/about','/leadership','/testimonials','/faq']) ? 'nav-group active' : 'nav-group'}>
            <button className="nav-trigger" type="button" aria-haspopup="true">About</button>
            <div className="dropdown">
              <span className="dropdown-label">THE NETWORK</span>
              <Link onClick={close} to="/about">About ES Network</Link>
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
            <Link to="/testimonials">Verified Reviews</Link>
            <Link to="/arcade">Arcade</Link>
            <Link to="/estools">ES Tools</Link>
          </div>
          <div>
            <h3>ESN SMP</h3>
            <Link to="/smpconnection">Connect</Link>
            <Link to="/smpconsole">Console Guide</Link>
            <Link to="/storesmp">SMP Store</Link>
            <span>{SMP_HOST}</span>
          </div>
          <div>
            <h3>Network</h3>
            <Link to="/about">About ESN</Link>
            <Link to="/leadership">Leadership</Link>
            <Link to="/faq">FAQ</Link>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer">Discord Support</a>
          </div>
        </div>
      </div>

      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} ES Network. All rights reserved.</span>
        <span className="footer-signal"><i /> ESN SYSTEMS ONLINE</span>
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
        <div className="page-hero-mark" aria-hidden="true">
          <span>ES</span>
          <small>NETWORK</small>
        </div>
      </div>
    </section>
  )
}
function Home() {
  return (
    <>
      <section className="hero" id="hero-banner">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orb orb-one" aria-hidden="true" />
        <div className="hero-orb orb-two" aria-hidden="true" />
        <div className="hero-scanline" aria-hidden="true" />

        <div className="shell hero-layout">
          <div className="hero-content">
            <div className="hero-badge-row">
              <span className="signal-badge"><i /> ESN SYSTEMS ONLINE</span>
              <span className="hero-version">NETWORK // 2026</span>
            </div>

            <span className="eyebrow">ES NETWORK • OFFICIAL DIGITAL HUB</span>
            <h1>One network.<br /><span>Everything ESN.</span></h1>
            <p>Creator services, verified customer reviews, six browser games, free tools, community support, and the ESN SMP — built into one connected experience.</p>

            <div className="hero-actions">
              <Link className="button primary" to="/serviceshowcase">Explore ESN <span>↗</span></Link>
              <a className="button secondary" href={DISCORD_URL} target="_blank" rel="noreferrer">Join the community</a>
            </div>

            <div className="hero-stats premium-stats">
              <div><strong>35</strong><span>Verified reviews</span></div>
              <div><strong>6</strong><span>Browser Arcade games</span></div>
              <div><strong>{SMP_HOST}</strong><span>ESN SMP</span></div>
            </div>
          </div>

          <aside className="hero-control-panel">
            <div className="control-panel-top">
              <span>NETWORK STATUS</span>
              <i />
            </div>
            <div className="control-main control-main-3d">
              <ES3DViewer variant="hero" label="Interactive 3D ES Network centerpiece" />
              <div className="control-3d-label">
                <span>ES NETWORK</span>
                <strong>INTERACTIVE 3D CORE</strong>
              </div>
            </div>
            <div className="control-grid">
              <Link to="/serviceshowcase"><span>01</span><b>Services</b><small>Creator & gaming</small></Link>
              <Link to="/arcade"><span>02</span><b>Arcade</b><small>6 original games</small></Link>
              <Link to="/smpconnection"><span>03</span><b>ESN SMP</b><small>Connect & play</small></Link>
              <Link to="/testimonials"><span>04</span><b>Reviews</b><small>35 verified</small></Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="section" aria-labelledby="services-title">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">What we do</span>
              <h2 id="services-title">Built for players, creators, and communities.</h2>
            </div>
            <Link className="text-link" to="/serviceshowcase">View full showcase →</Link>
          </div>
          <div className="card-grid three">
            {SERVICES.map((service, index) => (
              <article className="service-card" id={service.id} key={service.id}>
                <span className="card-number">0{index + 1}</span>
                <span className="eyebrow">{service.eyebrow}</span>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <a href={DISCORD_URL} target="_blank" rel="noreferrer">Open a Discord ticket →</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section panel-section" id="discord-exclusive-services">
        <div className="shell split-panel">
          <div>
            <span className="eyebrow">Community first</span>
            <h2>ES Network lives where the community does.</h2>
            <p>Service support, updates, announcements, SMP information, and community access all connect back to the official ESN Discord.</p>
          </div>
          <a className="button primary" href={DISCORD_URL} target="_blank" rel="noreferrer">Join ESN Discord</a>
        </div>
      </section>

      <section className="section" id="community-safety">
        <div className="shell two-column">
          <div>
            <span className="eyebrow">Community Safety</span>
            <h2>A clearer place to connect.</h2>
          </div>
          <p className="large-copy">ESN is built around organized support channels, community rules, and direct ticket-based help for services and account questions.</p>
        </div>
      </section>

      <section className="section dark-section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ESN SMP</span>
              <h2>The network has its own Minecraft world.</h2>
            </div>
            <Link className="text-link" to="/smpconnection">Connection details →</Link>
          </div>
          <div className="card-grid two">
            <article className="feature-panel">
              <span className="eyebrow">Server</span>
              <h3>{SMP_HOST}</h3>
              <p>Port {SMP_PORT}. Join the ESN SMP using the current connection details.</p>
              <Link to="/smpconnection">View connection page →</Link>
            </article>
            <article className="feature-panel">
              <span className="eyebrow">Store</span>
              <h3>Official SMP Store</h3>
              <p>Realm keys and current ESN SMP bundles with Stripe checkout and username-based delivery.</p>
              <Link to="/storesmp">Open store →</Link>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Arcade</span>
              <h2>Six upgraded browser games.</h2>
            </div>
            <Link className="text-link" to="/arcade">Open Arcade →</Link>
          </div>
          <div className="game-strip">
            {ARCADE_GAMES.map(([name, route]) => <Link to={route} key={route}>{name}</Link>)}
          </div>
        </div>
      </section>

      <section className="section panel-section" id="home-tools">
        <div className="shell split-panel">
          <div>
            <span className="eyebrow">ES Tools</span>
            <h2>Free tools are back — and interactive.</h2>
            <p>Use challenge generation, timers, prompt building, randomizers, quick coin/dice utilities, and website estimates directly in the browser.</p>
          </div>
          <Link className="button primary" to="/estools">Open ES Tools</Link>
        </div>
      </section>

      <section className="section dark-section" id="meet-the-team">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Leadership</span>
              <h2>People behind ES Network.</h2>
            </div>
            <Link className="text-link" to="/leadership">Meet leadership →</Link>
          </div>
          <div className="feature-card">
            <div className="avatar-placeholder">L</div>
            <div>
              <span className="eyebrow">Founder & CEO</span>
              <h3>Landon</h3>
              <p>Founder & CEO of ES Network.</p>
              <ul className="role-list compact-role-list">
                {LANDON_RESPONSIBILITIES.slice(0, 3).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="reviews">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Social Proof</span>
              <h2>Verified ESN customer reviews.</h2>
              <p className="large-copy max-copy">Real Discord feedback from Fortnite coaching, editing, and Discord server setup clients.</p>
            </div>
            <Link className="text-link" to="/testimonials">View all 35 reviews →</Link>
          </div>
          <div className="reviews-grid review-preview-grid">
            {[VERIFIED_REVIEWS[0], VERIFIED_REVIEWS[12], VERIFIED_REVIEWS[24]].map((review) => (
              <ReviewCard key={review.handle} review={review} />
            ))}
          </div>
        </div>
      </section>

      <section className="section panel-section" id="how-it-works">
        <div className="shell">
          <span className="eyebrow">How it works</span>
          <div className="steps">
            <div><strong>01</strong><h3>Choose</h3><p>Find the ESN service, tool, Arcade game, or SMP destination you need.</p></div>
            <div><strong>02</strong><h3>Connect</h3><p>Use the official Discord for service ordering and support.</p></div>
            <div><strong>03</strong><h3>Complete</h3><p>Work through the correct ESN channel for delivery, support, or community access.</p></div>
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="shell narrow">
          <span className="eyebrow">FAQ</span>
          <h2>Quick answers.</h2>
          <div className="faq-list">
            {FAQ_ITEMS.slice(0, 4).map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
          <Link className="text-link" to="/faq">Read the full FAQ →</Link>
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
        <div className="shell leadership-spotlight">
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
              <span className="eyebrow">Need Support?</span>
              <h3>ESN Discord</h3>
              <p>Server announcements, connection help, store support, and community updates all run through the official Discord.</p>
              <a href={DISCORD_URL} target="_blank" rel="noreferrer">Open Discord →</a>
            </article>
          </div>
        </div>
      </section>
    </>
  )
}
function ConsoleConnection() {
  return (
    <>
      <PageHero
        eyebrow="ESN SMP • Console"
        title="Connect from Xbox, PlayStation, or Switch"
        text="Consoles usually hide the normal Add Server button, so joining a third-party Bedrock/Geyser server needs an extra connection method."
      />
      <section className="section">
        <div className="shell">
          <div className="console-grid">
            <article className="feature-panel">
              <span className="eyebrow">SERVER DETAILS</span>
              <h2>{SMP_HOST}</h2>
              <p>Published ESN SMP port: <strong>{SMP_PORT}</strong></p>
              <p className="muted">Keep these details ready. The console workaround opens a custom-server menu where you enter the ESN address and port.</p>
            </article>
            <article className="feature-panel">
              <span className="eyebrow">XBOX</span>
              <h2>Use a console custom-server workaround</h2>
              <p>Geyser's console guide recommends methods such as BedrockConnect for Xbox when a server cannot be added normally.</p>
              <ol className="connection-steps"><li>Open your console network settings.</li><li>Use a current BedrockConnect-compatible DNS/server-list method.</li><li>Launch Minecraft and open the Servers tab.</li><li>Open the custom-server menu and enter <b>{SMP_HOST}</b> with port <b>{SMP_PORT}</b>.</li></ol>
            </article>
            <article className="feature-panel">
              <span className="eyebrow">PLAYSTATION</span>
              <h2>Use a Bedrock LAN/custom-server method</h2>
              <p>PlayStation also needs a workaround because Minecraft does not expose a normal third-party server field on console.</p>
              <ol className="connection-steps"><li>Set up a supported BedrockConnect or LAN-proxy method on the same network.</li><li>Launch Minecraft.</li><li>Open the server/LAN entry exposed by that method.</li><li>Enter the ESN SMP address and port when prompted.</li></ol>
            </article>
            <article className="feature-panel">
              <span className="eyebrow">NINTENDO SWITCH</span>
              <h2>Use a custom-server list method</h2>
              <p>Geyser notes that Switch players can use BedrockConnect-style workarounds to reach third-party servers.</p>
              <ol className="connection-steps"><li>Open Switch Internet settings for your active network.</li><li>Configure a current supported custom-server/DNS method.</li><li>Restart Minecraft and open the Servers tab.</li><li>Select the custom-server option and enter the ESN SMP details.</li></ol>
            </article>
          </div>
          <div className="notice">
            <strong>Need help?</strong>
            <span>Console workarounds can change when Minecraft or console networking changes. If a method stops working, use the ESN Discord for the current connection method.</span>
          </div>
        </div>
      </section>
    </>
  )
}

function ProductCard({ product }) {
  return (
    <article className="product-card store-product">
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
    </>
  )
}
function ArcadeHub() {
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
        text="The original ESN browser games rebuilt from the official site recording, keeping their core identities while improving responsiveness, persistence, and the overall experience."
        actions={<Link className="button primary" to="/esclicker">Start playing <span>→</span></Link>}
      />

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
      <MetaManager />
      <ScrollToHash />
      <Header />
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
