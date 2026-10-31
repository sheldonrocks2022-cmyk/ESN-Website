import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SERVICE_CATEGORIES, SERVICE_LISTINGS, TIP_URL } from './servicesCatalog'
import './services.css'

// Professional Services page (/services).
// Every fixed-price listing, its price and its checkout link live in src/servicesCatalog.js.
const DISCORD_TICKET = 'https://discord.gg/RGPt3zEfGy'

const BUY_STEPS = [
  ['Buy', 'Pick a service and pay with the Buy now button. Add your Discord username at checkout.'],
  ['Open a ticket', 'Join the ESN Discord, open a ticket, choose Services and paste your receipt or order number as proof of purchase.'],
  ['We deliver', 'We start within 24 hours and deliver in the time shown on the listing.'],
]

const SHOWCASE = [
  'Verification gate so only real members can chat',
  'Platform roles picked with one tap (Xbox, PC, PlayStation, Switch, Mobile)',
  'Automatic live alerts that ping an opt-in role when the stream starts',
  'Socials, stream schedule and announcement channels',
  'Media channel with slowmode, plus clips, pets, fan art and game suggestions',
  'Custom emojis and soundboard',
]

function money(value, per) {
  return '$' + value + (per ? '/' + per : '')
}

function ListingCard({ item }) {
  const href = item.url || DISCORD_TICKET
  return (
    <article className={item.pro ? 'esn-listing esn-listing-pro' : 'esn-listing'} id={item.id}>
      <div className="esn-listing-top">
        <h3>{item.name}</h3>
        <strong className="esn-listing-price">{money(item.price, item.per)}</strong>
      </div>
      <span className="esn-listing-time">{item.per ? item.days : 'Delivery: ' + item.days}</span>
      {item.desc ? <p className="esn-listing-desc">{item.desc}</p> : null}
      <ul>{item.includes.map((point) => <li key={point}>{point}</li>)}</ul>
      <a className="button primary esn-buy" href={href} target="_blank" rel="noreferrer">Buy now · {money(item.price, item.per)}</a>
      {item.pro ? (
        <ol className="esn-buy-mini">
          <li>Check out with your Discord username and project details</li>
          <li>ESN staff message you on Discord within 24 hours</li>
          <li>We deliver</li>
        </ol>
      ) : (
        <ol className="esn-buy-mini">
          <li>Buy</li>
          <li>Open a <a href={DISCORD_TICKET} target="_blank" rel="noreferrer">Discord ticket</a> with your receipt as proof of purchase</li>
          <li>We deliver</li>
        </ol>
      )}
    </article>
  )
}

export default function ServicesPage() {
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return SERVICE_LISTINGS.filter((item) => (category === 'All' || item.category === category) &&
      (!q || (item.name + ' ' + item.includes.join(' ') + ' ' + item.category).toLowerCase().includes(q)))
  }, [category, query])
  const groups = SERVICE_CATEGORIES.map((name) => [name, shown.filter((item) => item.category === name)]).filter(([, items]) => items.length)

  return (
    <div className="esn-services-page">
      <section className="esn-services-hero">
        <div className="shell">
          <span className="eyebrow">ESN PROFESSIONAL SERVICES</span>
          <h1>Custom Discord servers, bots and game servers, <em>built for you.</em></h1>
          <p>
            Pick a fixed-price package, check out in a minute, and the ESN team builds it. Discord servers,
            live alerts, bots, bot hosting and Minecraft servers, from {money(Math.min(...SERVICE_LISTINGS.map((item) => item.price)))}.
          </p>
          <div className="esn-services-actions">
            <a className="button primary" href="#services">Browse {SERVICE_LISTINGS.length} services</a>
            <a className="button secondary" href={DISCORD_TICKET} target="_blank" rel="noreferrer">Get a quote <span>↗</span></a>
            <a className="button secondary esn-tip-button" href={TIP_URL} target="_blank" rel="noreferrer">Tip any amount <span>♥</span></a>
          </div>
          <p className="esn-services-note">Need something custom? Open a Discord ticket for a quote.</p>
        </div>
      </section>

      <section className="esn-services-section esn-buy-how" id="how-it-works">
        <div className="shell">
          <div className="esn-services-head">
            <span className="eyebrow">HOW IT WORKS</span>
            <h2>Buy, open a ticket, we deliver</h2>
          </div>
          <ol className="esn-services-steps esn-steps-3">
            {BUY_STEPS.map(([title, copy], index) => (
              <li key={title}>
                <b>{String(index + 1).padStart(2, '0')}</b>
                <h3>{title}</h3>
                <p>{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="esn-services-section" id="services">
        <div className="shell">
          <div className="esn-services-head">
            <span className="eyebrow">FIXED-PRICE SERVICES</span>
            <h2>Services</h2>
          </div>
          <div className="esn-svc-filters">
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search services (e.g. tickets, Geyser, alerts)" aria-label="Search services" />
            <div className="esn-svc-chips" role="tablist" aria-label="Service categories">
              {['All', ...SERVICE_CATEGORIES].map((name) => (
                <button type="button" key={name} className={name === category ? 'active' : ''} onClick={() => setCategory(name)}>{name}</button>
              ))}
            </div>
            <p className="esn-svc-count">{shown.length} of {SERVICE_LISTINGS.length} services</p>
          </div>
          {groups.map(([name, items]) => (
            <div className="esn-svc-group" key={name}>
              <h3 className="esn-svc-group-title">{name}</h3>
              {name === 'Professional Services' ? <p className="esn-svc-group-note">Done-for-you work by the ESN team. Tell us what you need at checkout and we take it from there.</p> : null}
              <div className="esn-listings">
                {items.map((item) => <ListingCard item={item} key={item.id} />)}
              </div>
            </div>
          ))}
          {!shown.length ? <p className="esn-svc-empty">No service matches that search. Open a <a href={DISCORD_TICKET} target="_blank" rel="noreferrer">Discord ticket</a> and we will quote it.</p> : null}
        </div>
      </section>

      <section className="esn-services-section" id="custom">
        <div className="shell">
          <div className="esn-services-head">
            <span className="eyebrow">CUSTOM WORK</span>
            <h2>Bigger or custom projects</h2>
          </div>
          <div className="esn-services-grid">
            <article className="esn-service-card">
              <div className="esn-service-icon" aria-hidden="true">🤖</div>
              <h3>Custom Discord Bot Development</h3>
              <p>A bot built around what your server actually needs: slash commands, moderation, tickets, roles and utility tools, in Python or Node.js.</p>
              <div className="esn-service-foot"><strong>Custom quote</strong><a href={DISCORD_TICKET} target="_blank" rel="noreferrer">Get a quote ↗</a></div>
            </article>
            <article className="esn-service-card">
              <div className="esn-service-icon" aria-hidden="true">⚡</div>
              <h3>Self-Serve Bot Hosting 24/7</h3>
              <p>Host your own Python or Node.js bot on the ESN panel with console, file access and automatic restarts.</p>
              <div className="esn-service-foot"><strong>From $0.50/mo</strong><Link to="/hosting/vps">See hosting plans →</Link></div>
            </article>
            <article className="esn-service-card">
              <div className="esn-service-icon" aria-hidden="true">🛠️</div>
              <h3>Anything else</h3>
              <p>Game servers, bigger builds or a mix of services. Tell us what you want and we will scope it and quote it before any work starts.</p>
              <div className="esn-service-foot"><strong>Custom quote</strong><a href={DISCORD_TICKET} target="_blank" rel="noreferrer">Get a quote ↗</a></div>
            </article>
          </div>
        </div>
      </section>

      <section className="esn-services-section esn-services-showcase" id="recent-work">
        <div className="shell esn-showcase-grid">
          <div>
            <span className="eyebrow">RECENT WORK</span>
            <h2>A streamer community server</h2>
            <p>
              We recently built a community server for a streamer: a place for viewers to hang out,
              get notified when the stream goes live, and share clips and suggestions. Here is what went into it.
            </p>
          </div>
          <ul className="esn-showcase-list">
            {SHOWCASE.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </section>

      <section className="esn-services-section">
        <div className="shell">
          <div className="esn-services-cta">
            <div>
              <span className="eyebrow">QUESTIONS?</span>
              <h2>Not sure which one fits?</h2>
              <p>Open a ticket in the ESN Discord and tell us what you want built. We will point you to the right package or quote custom work.</p>
            </div>
            <div className="esn-services-actions">
              <a className="button primary" href={DISCORD_TICKET} target="_blank" rel="noreferrer">Open a ticket <span>↗</span></a>
              <a className="button secondary esn-tip-button" href={TIP_URL} target="_blank" rel="noreferrer">Tip any amount <span>♥</span></a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
