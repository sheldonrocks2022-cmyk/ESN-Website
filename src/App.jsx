import { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'

const DISCORD_URL = 'https://discord.gg/3gxA66KZ8'
const SMP_HOST = 'esn.ggwp.cc'
const SMP_PORT = '17058'

const services = [
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

const questions = [
  ['What is ES Network?', 'ES Network (ESN) is the current brand. EP1C Services was the former name and is no longer a separate organization or division.'],
  ['How do I order a service?', 'Service ordering and support are handled through the official ESN Discord. Open a ticket and provide the details of what you need.'],
  ['Where can I join the ESN community?', 'Use the official Discord link anywhere on this website to join the ES Network community.'],
]

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
      if (tries < 10) requestAnimationFrame(tick)
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
          <p className="muted">The official home of ES Network, its services, community, and ESN SMP.</p>
        </div>
        <div>
          <h3>Explore</h3>
          <Link to="/serviceshowcase">Services</Link>
          <Link to="/smpconnection">ESN SMP</Link>
          <Link to="/about">About</Link>
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

function PageHero({ eyebrow, title, text }) {
  return (
    <section className="page-hero">
      <div className="shell narrow">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{text}</p>
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
          <p>Gaming, creator services, community, and the ESN SMP — brought together under one ES Network.</p>
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
            {services.map((service, index) => (
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
          <p className="large-copy max-copy">The rebuild preserves a dedicated testimonials route and a homepage review destination so feedback remains easy to find.</p>
          <Link className="button secondary" to="/testimonials">View testimonials</Link>
        </div>
      </section>

      <section className="section panel-section" id="how-it-works">
        <div className="shell">
          <span className="eyebrow">How it works</span>
          <div className="steps">
            <div><strong>01</strong><h3>Choose</h3><p>Find the ESN service or SMP destination you need.</p></div>
            <div><strong>02</strong><h3>Connect</h3><p>Use the official Discord for service ordering and support.</p></div>
            <div><strong>03</strong><h3>Complete</h3><p>Work directly through the proper ESN channel for delivery or help.</p></div>
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="shell narrow">
          <span className="eyebrow">FAQ</span>
          <h2>Quick answers.</h2>
          <div className="faq-list">
            {questions.map(([q, a]) => (
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
            <p className="large-copy">ESN brings together creator services, gaming, community projects, and the ESN SMP under one recognizable name.</p>
            <p className="muted">This rebuild keeps that brand history clear so visitors and search engines do not confuse the old EP1C Services name with a separate organization.</p>
          </div>
        </div>
      </section>
    </>
  )
}

function Leadership() {
  return (
    <>
      <PageHero eyebrow="ES Network Leadership" title="Meet the team" text="The people responsible for leading ES Network and its projects." />
      <section className="section">
        <div className="shell">
          <article className="leader-card">
            <div className="avatar-placeholder large">L</div>
            <div>
              <span className="eyebrow">Founder & CEO</span>
              <h2>Landon</h2>
              <p>Founder and CEO of ES Network.</p>
            </div>
          </article>
        </div>
      </section>
    </>
  )
}

function FAQ() {
  return (
    <>
      <PageHero eyebrow="Support" title="Frequently asked questions" text="Answers about ES Network, ordering, support, community access, and the SMP." />
      <section className="section">
        <div className="shell narrow faq-list">
          {questions.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
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
            <span className="eyebrow">Migration-safe placeholder</span>
            <h2>Current testimonial content will be migrated without inventing reviews.</h2>
            <p>The route and design are ready; only verified existing testimonials should be added here.</p>
          </div>
        </div>
      </section>
    </>
  )
}

function ServicesShowcase() {
  const showcase = [
    ['Fortnite Coaching', 'Gaming'],
    ['Editing Services', 'Creator'],
    ['Discord Server Setups', 'Community'],
    ['Website Creation', 'Web'],
  ]
  return (
    <>
      <PageHero eyebrow="Service Showcase" title="ESN services in one place" text="A clearer catalog that makes it easier to understand what ES Network offers and where to order." />
      <section className="section">
        <div className="shell card-grid two">
          {showcase.map(([title, type]) => (
            <article className="service-card" key={title}>
              <span className="eyebrow">{type}</span>
              <h2>{title}</h2>
              <p>Service details and exact current pricing will be migrated from the existing site before production launch.</p>
              <a href={DISCORD_URL} target="_blank" rel="noreferrer">Order through Discord →</a>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

function SMPConnection() {
  return (
    <>
      <PageHero eyebrow="ESN SMP" title="Connect to the server" text="The official ESN SMP connection details, kept simple and easy to copy." />
      <section className="section">
        <div className="shell narrow">
          <div className="connection-card">
            <span className="eyebrow">Server Address</span>
            <strong>{SMP_HOST}</strong>
            <span>Port {SMP_PORT}</span>
          </div>
          <p className="muted center">SMP information remains informational on the website; live server activity and community updates can stay in Discord.</p>
        </div>
      </section>
    </>
  )
}

function SMPStore() {
  return (
    <>
      <PageHero eyebrow="ESN SMP Store" title="Support the SMP" text="A clean storefront shell that preserves the current purchase flow without exposing private Stripe or delivery credentials." />
      <section className="section">
        <div className="shell">
          <div className="notice">
            <strong>Delivery reminder:</strong>
            <span>Enter your exact Minecraft username at checkout. If your server username begins with a <b>.</b>, include the <b>.</b> at the beginning.</span>
          </div>
          <div className="card-grid two">
            {['Realm 100 Keys', 'ESN Season Pass Relic Bundle', 'Riftwalker Bundle', 'Immortal Warden Bundle'].map((name) => (
              <article className="product-card" key={name}>
                <span className="eyebrow">ESN SMP</span>
                <h2>{name}</h2>
                <p>The current Stripe destination and exact live product details will be migrated before this rebuild replaces production.</p>
                <span className="status-chip">Protected migration</span>
              </article>
            ))}
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
        <p>The rebuilt ESN site uses explicit routes so broken links are easier to detect and fix.</p>
        <Link className="button primary" to="/">Return home</Link>
      </div>
    </section>
  )
}

function App() {
  return (
    <div className="site">
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
          <Route path="/smpconnection" element={<SMPConnection />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
