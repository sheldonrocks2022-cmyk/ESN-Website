import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'

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

const LEADERS = [
  ['Landon', 'Founder & CEO'],
  ['Mark', 'Founder'],
  ['Presten', 'Founder'],
  ['Angie', 'Founder'],
  ['caelian_', 'Founder'],
  ['69isdabest', 'Co-Founder'],
  ['kidrocks1313', 'Co-Founder'],
  ['lala.s.2', 'Administrator'],
  ['Dr.crows', 'Administrator'],
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
    name: 'Riftwalker Bundle',
    price: 'Stripe checkout',
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
  ['ES Clicker', '/esclicker', 'Local progress, ES Coins, statistics, and an upgrade shop with 110 upgrades.'],
  ['ES Factory', '/esfactory', 'A factory progression game with 53 zones, 112 machines, upgrades, boosts, and shared ES Coins.'],
  ['ES Mines', '/esmines', 'Virtual ES Coin gameplay built around wager, density, and multiplier mechanics.'],
  ['ES MOTO', '/esmoto', 'A racing experience with 1,000+ tracks, checkpoints, touch controls, best times, and daily challenges.'],
  ['ES Tower', '/estower', 'The existing ES Tower browser game route, preserved for migration.'],
  ['ES Tower Defense', '/estowerdefense', 'The existing ES Tower Defense browser game route, preserved for migration.'],
]

const FAQ_ITEMS = [
  ['What is ES Network?', 'ES Network (ESN) is the current brand. EP1C Services was the former name and is not a separate current organization or division.'],
  ['What services does ESN offer?', 'The current public service focus includes Fortnite coaching, editing services, Discord server setups, and selected digital or website projects handled through ESN.'],
  ['How do I order a service?', 'Service ordering and support are handled through the official ESN Discord. Open a ticket and provide the details of what you need.'],
  ['How do SMP purchases get delivered?', 'Enter your exact in-game Minecraft username at Stripe checkout. The buyer should be online on the SMP for automatic delivery. If your server username starts with a period, include the period at the beginning.'],
  ['Are ES Tools paid?', 'ES Tools are intended to be free browser-based utilities. They do not require an account and are not supposed to save your personal data.'],
  ['Where can I join the ESN community?', 'Use the official Discord link anywhere on this website to join the ES Network community.'],
]

const META = {
  '/': ['ES Network (ESN) | Fortnite Coaching, Editing & Discord Services', 'The official ES Network website for Fortnite coaching, editing, Discord setup services, ESN SMP, Arcade games, tools, and community access.'],
  '/home': ['ES Network (ESN) | Fortnite Coaching, Editing & Discord Services', 'The official ES Network website for Fortnite coaching, editing, Discord setup services, ESN SMP, Arcade games, tools, and community access.'],
  '/serviceshowcase': ['ES Network Services | Fortnite Coaching, Editing & Discord Setup', 'Explore ES Network services including Fortnite coaching, editing, Discord server setups, and selected digital projects.'],
  '/storesmp': ['ESN SMP Store | ES Network Minecraft Items', 'Purchase ESN SMP digital items and bundles through official Stripe checkout links.'],
  '/smpconnection': ['ESN SMP Connection | Server IP & Port', 'Connect to the ESN SMP using the current server IP and port.'],
  '/estools': ['ES Tools | Free Browser-Based Creator & Gaming Utilities', 'Free browser-based ES Network tools with no account required.'],
  '/about': ['About ES Network | ESN', 'Learn about ES Network, the current brand formerly known as EP1C Services.'],
  '/leadership': ['ES Network Leadership | Meet the Team', 'Meet the founders, co-founders, and administrators behind ES Network.'],
  '/faq': ['ES Network FAQ | Services, Ordering & Support', 'Answers about ES Network services, SMP purchases, support, community access, and tools.'],
  '/testimonials': ['ES Network Customer Testimonials', 'Customer and community feedback for ES Network services and projects.'],
  '/arcade': ['ESN Arcade | Browser Games', 'Play and explore ES Network browser games including ES Clicker, ES Factory, ES Mines, ES MOTO, ES Tower, and ES Tower Defense.'],
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
      window.scrollTo({ top: 0, behavior: 'instant' })
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
  const close = () => setOpen(false)

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Brand />
        <button className="menu-toggle" type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Toggle navigation">
          <span />
          <span />
          <span />
        </button>

        <nav className={open ? 'nav open' : 'nav'} aria-label="Main navigation">
          <div className="nav-group">
            <button className="nav-trigger" type="button">Services</button>
            <div className="dropdown">
              <Link onClick={close} to="/serviceshowcase">Service Showcase</Link>
              <Link onClick={close} to="/#fortnite-coaching">Fortnite Coaching</Link>
              <Link onClick={close} to="/#editing-services">Editing Services</Link>
              <Link onClick={close} to="/#discord-server-setups">Discord Server Setups</Link>
            </div>
          </div>

          <div className="nav-group">
            <button className="nav-trigger" type="button">ESN SMP</button>
            <div className="dropdown">
              <Link onClick={close} to="/smpconnection">SMP Connection</Link>
              <Link onClick={close} to="/storesmp">SMP Store</Link>
            </div>
          </div>

          <div className="nav-group">
            <button className="nav-trigger" type="button">Arcade</button>
            <div className="dropdown">
              <Link onClick={close} to="/arcade">Arcade Hub</Link>
              {ARCADE_GAMES.map(([name, route]) => <Link onClick={close} key={route} to={route}>{name}</Link>)}
            </div>
          </div>

          <Link onClick={close} to="/estools">ES Tools</Link>

          <div className="nav-group">
            <button className="nav-trigger" type="button">About</button>
            <div className="dropdown">
              <Link onClick={close} to="/about">About ES Network</Link>
              <Link onClick={close} to="/leadership">Leadership</Link>
              <Link onClick={close} to="/testimonials">Customer Testimonials</Link>
              <Link onClick={close} to="/faq">FAQ</Link>
            </div>
          </div>

          <a onClick={close} className="nav-cta" href={DISCORD_URL} target="_blank" rel="noreferrer">Join Discord</a>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Brand />
          <p className="muted">The official home of ES Network, its services, community, Arcade, tools, and ESN SMP.</p>
        </div>
        <div>
          <h3>Explore</h3>
          <Link to="/serviceshowcase">Services</Link>
          <Link to="/smpconnection">ESN SMP</Link>
          <Link to="/arcade">Arcade</Link>
          <Link to="/estools">ES Tools</Link>
        </div>
        <div>
          <h3>Community</h3>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer">Official Discord</a>
          <Link to="/testimonials">Testimonials</Link>
          <Link to="/faq">FAQ</Link>
        </div>
      </div>
      <div className="shell footer-bottom">© {new Date().getFullYear()} ES Network. All rights reserved.</div>
    </footer>
  )
}

function PageHero({ eyebrow, title, text, actions }) {
  return (
    <section className="page-hero">
      <div className="shell narrow">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{text}</p>
        {actions ? <div className="hero-actions page-actions">{actions}</div> : null}
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
        <div className="shell hero-content">
          <span className="eyebrow">ES NETWORK • OFFICIAL</span>
          <h1>One network.<br /><span>More ways to build.</span></h1>
          <p>Gaming, creator services, browser games, tools, community, and the ESN SMP — brought together under one ES Network.</p>
          <div className="hero-actions">
            <Link className="button primary" to="/serviceshowcase">Explore services</Link>
            <a className="button secondary" href={DISCORD_URL} target="_blank" rel="noreferrer">Join the community</a>
          </div>
          <div className="hero-stats">
            <div><strong>ESN</strong><span>Current brand</span></div>
            <div><strong>{SMP_HOST}</strong><span>Minecraft server</span></div>
            <div><strong>Discord</strong><span>Ordering & support</span></div>
          </div>
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
              <h2>Six protected browser-game routes.</h2>
            </div>
            <Link className="text-link" to="/arcade">Open Arcade →</Link>
          </div>
          <div className="game-strip">
            {ARCADE_GAMES.map(([name, route]) => <Link to={route} key={route}>{name}</Link>)}
          </div>
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
              <p>Founder and CEO of ES Network, overseeing the organization, its services, community, and ESN SMP direction.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="reviews">
        <div className="shell">
          <span className="eyebrow">Customer Testimonials</span>
          <h2>Community feedback belongs front and center.</h2>
          <p className="large-copy max-copy">The rebuild preserves a dedicated testimonials route and a homepage review destination without inventing customer quotes that have not been verified.</p>
          <Link className="button secondary" to="/testimonials">View testimonials</Link>
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
      <PageHero eyebrow="About" title="About ES Network" text="ES Network is the current organization and brand. EP1C Services was the former name — not a separate current division." />
      <section className="section">
        <div className="shell two-column">
          <div><h2>One identity.</h2></div>
          <div className="stack">
            <p className="large-copy">ESN brings together creator services, gaming, community projects, browser experiences, tools, and the ESN SMP under one recognizable name.</p>
            <p className="muted">The rebuilt site keeps the history clear so visitors and search engines do not confuse the old EP1C Services name with a separate organization.</p>
          </div>
        </div>
      </section>
    </>
  )
}

function Leadership() {
  return (
    <>
      <PageHero eyebrow="ES Network Leadership" title="Meet the team" text="The founders, co-founders, and administrators behind ES Network." />
      <section className="section">
        <div className="shell team-grid">
          {LEADERS.map(([name, title], index) => (
            <article className="leader-tile" key={name}>
              <div className="avatar-placeholder">{name.charAt(0).toUpperCase()}</div>
              <div>
                <span className="eyebrow">{title}</span>
                <h3>{name}</h3>
                {index === 0 ? <p>Founder and CEO of ES Network.</p> : <p>ES Network leadership team.</p>}
              </div>
            </article>
          ))}
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

function Testimonials() {
  return (
    <>
      <PageHero eyebrow="Customer Testimonials" title="What people say about ESN" text="A dedicated home for verified customer and community feedback." />
      <section className="section">
        <div className="shell">
          <div className="empty-state">
            <span className="eyebrow">Verified content only</span>
            <h2>No fake reviews.</h2>
            <p>Existing verified testimonial content will be migrated here when its exact text is available. This page intentionally does not fabricate quotes, names, ratings, or customer stories.</p>
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
        title="ESN services in one place"
        text="A clearer catalog for the current public ES Network services and selected digital work."
        actions={<a className="button primary" href={DISCORD_URL} target="_blank" rel="noreferrer">Order through Discord</a>}
      />
      <section className="section">
        <div className="shell card-grid two">
          {SERVICES.map((service) => (
            <article className="service-card static-card" key={service.id}>
              <span className="eyebrow">{service.eyebrow}</span>
              <h2>{service.title}</h2>
              <p>{service.text}</p>
              <a href={DISCORD_URL} target="_blank" rel="noreferrer">Open a ticket →</a>
            </article>
          ))}
          <article className="service-card static-card">
            <span className="eyebrow">Digital Projects</span>
            <h2>Website Creation</h2>
            <p>Website and digital-project work is handled case-by-case through ES Network. Exact scope, pricing, and delivery depend on the project.</p>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer">Discuss a project →</a>
          </article>
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
      <PageHero eyebrow="ESN SMP" title="Connect to the server" text="The official ESN SMP connection details, kept simple and easy to copy." />
      <section className="section">
        <div className="shell narrow">
          <div className="connection-card">
            <span className="eyebrow">Server Address</span>
            <strong>{SMP_HOST}</strong>
            <span>Port {SMP_PORT}</span>
            <button className="button primary copy-button" type="button" onClick={copy}>{copied ? 'Copied' : 'Copy server address'}</button>
          </div>
          <p className="muted center">Use the official ESN Discord for server announcements, support, and community updates.</p>
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
      <PageHero eyebrow="ESN SMP Store" title="Official SMP store" text="Current ESN SMP products with real Stripe checkout links and protected username-delivery instructions." />
      <section className="section">
        <div className="shell">
          <div className="notice warning-notice">
            <strong>Before you buy:</strong>
            <span>Enter your exact in-game Minecraft username in the required Stripe field. You should be online on the SMP for automatic delivery. If your server username starts with a <b>.</b>, include the <b>.</b> at the beginning or delivery may require manual admin help.</span>
          </div>
          <div className="card-grid two">
            {STORE_PRODUCTS.map((product) => <ProductCard key={product.name} product={product} />)}
          </div>
          <div className="store-security">
            <span className="eyebrow">Payment safety</span>
            <h2>Stripe handles checkout.</h2>
            <p>No Stripe secret keys or private payment credentials are stored in this front-end repository. Product buttons only use official public Payment Links.</p>
          </div>
        </div>
      </section>
    </>
  )
}

function ESTools() {
  return (
    <>
      <PageHero eyebrow="ES Tools" title="Free browser utilities" text="The existing ES Tools route is preserved. Original tool behavior will be migrated without changing its no-account, no-save approach." />
      <section className="section">
        <div className="shell">
          <div className="preserve-box">
            <span className="eyebrow">Protected migration</span>
            <h2>Tool logic is intentionally not being invented or rewritten.</h2>
            <p>The current ES Tools experience is protected. This rebuild preserves the route and product identity while we migrate the exact existing utilities instead of replacing them with made-up versions.</p>
            <div className="preserve-grid">
              <div><strong>Free</strong><span>No purchase required</span></div>
              <div><strong>No account</strong><span>Browser-first access</span></div>
              <div><strong>No personal-data saves</strong><span>Keep the existing privacy approach</span></div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function ArcadeHub() {
  return (
    <>
      <PageHero eyebrow="ESN Arcade" title="Six ES Network games" text="The current Arcade routes are preserved exactly while the original gameplay code and saves are migrated." />
      <section className="section">
        <div className="shell card-grid two">
          {ARCADE_GAMES.map(([name, route, description]) => (
            <article className="game-card" key={route}>
              <span className="eyebrow">Arcade</span>
              <h2>{name}</h2>
              <p>{description}</p>
              <Link to={route}>Open protected route →</Link>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

function ProtectedGame({ name, description }) {
  return (
    <>
      <PageHero eyebrow="ESN Arcade" title={name} text={description} />
      <section className="section">
        <div className="shell narrow">
          <div className="preserve-box">
            <span className="eyebrow">Protected game migration</span>
            <h2>Original gameplay comes next.</h2>
            <p>This route is already reserved in the new site, but the existing game code, saves, ES Coins, upgrades, controls, mechanics, and progression are intentionally not being replaced with approximations.</p>
            <Link className="button secondary" to="/arcade">Back to Arcade</Link>
          </div>
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
      <MetaManager />
      <ScrollToHash />
      <Header />
      <main>
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
          <Route path="/estools" element={<ESTools />} />
          <Route path="/tools" element={<Navigate to="/estools" replace />} />
          <Route path="/arcade" element={<ArcadeHub />} />
          {ARCADE_GAMES.map(([name, route, description]) => (
            <Route key={route} path={route} element={<ProtectedGame name={name} description={description} />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
