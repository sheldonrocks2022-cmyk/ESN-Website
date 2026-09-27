import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import ESToolsSuite from './Tools'
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
            <button className="nav-trigger" type="button" aria-haspopup="true">Services</button>
            <div className="dropdown">
              <Link onClick={close} to="/serviceshowcase">Service Showcase</Link>
              <Link onClick={close} to="/#fortnite-coaching">Fortnite Coaching</Link>
              <Link onClick={close} to="/#editing-services">Editing Services</Link>
              <Link onClick={close} to="/#discord-server-setups">Discord Server Setups</Link>
            </div>
          </div>

          <div className="nav-group">
            <button className="nav-trigger" type="button" aria-haspopup="true">ESN SMP</button>
            <div className="dropdown">
              <Link onClick={close} to="/smpconnection">SMP Connection</Link>
              <Link onClick={close} to="/smpconsole">Console Connection</Link>
              <Link onClick={close} to="/storesmp">SMP Store</Link>
            </div>
          </div>

          <div className="nav-group">
            <button className="nav-trigger" type="button" aria-haspopup="true">Arcade</button>
            <div className="dropdown">
              <Link onClick={close} to="/arcade">Arcade Hub</Link>
              {ARCADE_GAMES.map(([name, route]) => <Link onClick={close} key={route} to={route}>{name}</Link>)}
            </div>
          </div>

          <Link onClick={close} to="/estools">ES Tools</Link>

          <div className="nav-group">
            <button className="nav-trigger" type="button" aria-haspopup="true">About</button>
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
      <PageHero eyebrow="About" title="About ES Network" text="ES Network is the current organization and brand. EP1C Services was the former name — not a separate current division." />
      <section className="section">
        <div className="shell two-column">
          <div>
            <span className="eyebrow">One network</span>
            <h2>Gaming, creator services, tools, community, and ESN SMP.</h2>
          </div>
          <div className="stack">
            <p className="large-copy">ESN brings together creator services, gaming, community projects, browser experiences, tools, and the ESN SMP under one recognizable name.</p>
            <p className="muted">The website keeps the history clear: EP1C Services was the former name, while ES Network is the organization moving forward.</p>
          </div>
        </div>
      </section>
      <section className="section dark-section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Why ES Network</span>
              <h2>One place for the network’s public projects.</h2>
            </div>
          </div>
          <div className="card-grid three">
            <article className="feature-panel">
              <span className="eyebrow">Services</span>
              <h3>Direct ordering & support</h3>
              <p>Service requests and support are routed through ESN Discord tickets so visitors have a clear place to start.</p>
            </article>
            <article className="feature-panel">
              <span className="eyebrow">Gaming</span>
              <h3>ESN SMP & Arcade</h3>
              <p>The Minecraft server and rebuilt browser Arcade sit under the same ES Network identity.</p>
            </article>
            <article className="feature-panel">
              <span className="eyebrow">Tools</span>
              <h3>Free browser utilities</h3>
              <p>ES Tools provides browser-first creator and gaming utilities without requiring an account.</p>
            </article>
          </div>
        </div>
      </section>
    </>
  )
}
function Leadership() {
  return (
    <>
      <PageHero eyebrow="ES Network Team" title="Leadership & administration" text="Founders and co-founders are shown separately from the administration team so roles are clear." />
      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Leadership</span>
              <h2>Founders & co-founders</h2>
            </div>
          </div>
          <div className="team-grid">
            {LEADERS.map(([name, title]) => (
              <article className="leader-tile" key={name}>
                <div className="avatar-placeholder">{name.charAt(0).toUpperCase()}</div>
                <div>
                  <span className="eyebrow">{title}</span>
                  <h3>{name}</h3>
                  {name === 'Landon' ? (
                    <ul className="role-list">
                      {LANDON_RESPONSIBILITIES.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section dark-section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Administration</span>
              <h2>ES Network administrators</h2>
            </div>
          </div>
          <div className="team-grid">
            {ADMINISTRATION.map(([name, title]) => (
              <article className="leader-tile" key={name}>
                <div className="avatar-placeholder">{name.charAt(0).toUpperCase()}</div>
                <div>
                  <span className="eyebrow">{title}</span>
                  <h3>{name}</h3>
                </div>
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
          {SHOWCASE_EXTRAS.map(([title, type, text]) => (
            <article className="service-card static-card" key={title}>
              <span className="eyebrow">{type}</span>
              <h2>{title}</h2>
              <p>{text}</p>
              <a href={DISCORD_URL} target="_blank" rel="noreferrer">Discuss in Discord →</a>
            </article>
          ))}
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
          <div className="connection-actions">
            <Link className="button secondary console-guide-link" to="/smpconsole">Playing on console? Open the console guide</Link>
          </div>
          <p className="muted center">Use the official ESN Discord for server announcements, support, and community updates.</p>
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

function ArcadeHub() {
  return (
    <>
      <PageHero
        eyebrow="ESN Arcade"
        title="ESN Arcade"
        text="The original ESN Arcade games rebuilt from the official website recording — same identities, same core mechanics, upgraded responsiveness and persistence."
      />
      <section className="section">
        <div className="shell card-grid two">
          {ARCADE_GAMES.map(([name, route, description]) => (
            <article className="game-card" key={route}>
              <span className="eyebrow">Original game</span>
              <h2>{name}</h2>
              <p>{description}</p>
              <Link to={route}>Play game →</Link>
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
            <span className="eyebrow">Faithful migration required</span>
            <h2>This game will not be approximated.</h2>
            <p>The replacement build keeps this route reserved for the original ESN game. Its real mechanics, saves, ES Coins, upgrades, controls, balancing, progression, and presentation must be migrated from the official version before an upgraded edition is published.</p>
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
  const location = useLocation()
  const isArcadeGame = ARCADE_GAMES.some(([, route]) => route === location.pathname)

  return (
    <div className="site">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <MetaManager />
      <ScrollToHash />
      {!isArcadeGame && <Header />}
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
      {!isArcadeGame && <Footer />}
    </div>
  )
}

export default App
