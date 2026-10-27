import { Link } from 'react-router-dom'
import './services.css'

// Professional Services page (/services).
// PRICES: set a service's `price` to a string like 'From $X' to show it on its card.
// Leave it null to show "Get a quote". Only confirmed prices belong here.
const DISCORD_TICKET = 'https://discord.gg/RGPt3zEfGy'
const SUPPORT_EMAIL = 'support@esnoffical.com'

export const SERVICES = [
  {
    id: 'discord-server-setup',
    icon: '🛠️',
    title: 'Discord Server Setup',
    blurb: 'A clean, professional server built from scratch or rebuilt from a messy one.',
    points: ['Channels and categories laid out for your community', 'Roles and permissions that make sense', 'Verification so only real members can chat', 'Reaction roles and onboarding', 'Welcome messages, logs and ticket support'],
    price: null,
  },
  {
    id: 'streamer-servers',
    icon: '🎥',
    title: 'Streamer & Creator Servers',
    blurb: 'A community home for your audience that tells them the moment you go live.',
    points: ['Automatic live alerts for Twitch, TikTok and YouTube', 'Socials and links channels', 'Platform roles (Xbox, PC, PlayStation and more)', 'Media channels with slowmode for reacting', 'Game suggestions, clips and fan art'],
    price: null,
  },
  {
    id: 'custom-bots',
    icon: '🤖',
    title: 'Custom Discord Bot Development',
    blurb: 'A bot built around what your server actually needs.',
    points: ['Slash commands and custom features', 'Moderation, tickets, roles and utility tools', 'Python or Node.js', 'Set up and hosted for you if you want'],
    price: null,
  },
  {
    id: 'bot-hosting',
    icon: '⚡',
    title: 'Discord Bot Hosting 24/7',
    blurb: 'Keep your bot online around the clock without managing a server yourself.',
    points: ['Python and Node.js bots', 'Automatic restart if your bot crashes', 'Your own panel with console and file access', 'Help getting your bot running'],
    price: 'From $0.50/mo',
    link: { to: '/hosting/vps', label: 'See hosting plans' },
  },
  {
    id: 'game-servers',
    icon: '⛏️',
    title: 'Minecraft & Game Server Setup',
    blurb: 'A game server that is ready for your friends or community to join.',
    points: ['Minecraft server setup and configuration', 'Plugins and permissions', 'Geyser so Bedrock players can join Java servers', 'Other game servers on request'],
    price: null,
  },
]

const STEPS = [
  ['Open a ticket', 'Join our Discord and open a ticket. Tell us what you want built.'],
  ['We scope and quote', 'We go over what you need and give you a clear quote before any work starts.'],
  ['We build', 'The ESN team builds your server, bot or game server.'],
  ['You review', 'You look it over and tell us what to change.'],
  ['Handover', 'We hand everything over to you, with ownership and access set up.'],
]

const SHOWCASE = [
  'Verification gate so only real members can chat',
  'Platform roles picked with one tap (Xbox, PC, PlayStation, Switch, Mobile)',
  'Automatic live alerts that ping an opt-in role when the stream starts',
  'Socials, stream schedule and announcement channels',
  'Media channel with slowmode, plus clips, pets, fan art and game suggestions',
  'Custom emojis and soundboard',
]

function QuoteButtons({ secondary = true }) {
  return (
    <div className="esn-services-actions">
      <a className="button primary" href={DISCORD_TICKET} target="_blank" rel="noreferrer">Get a quote <span>↗</span></a>
      {secondary ? <a className="button secondary" href="#services">See services</a> : null}
    </div>
  )
}

export default function ServicesPage() {
  return (
    <div className="esn-services-page">
      <section className="esn-services-hero">
        <div className="shell">
          <span className="eyebrow">ESN PROFESSIONAL SERVICES</span>
          <h1>Custom Discord servers, bots and game servers, <em>built for you.</em></h1>
          <p>
            The ESN team designs and builds Discord servers, custom bots and game servers for communities,
            creators and streamers. Tell us what you need and we will build it.
          </p>
          <QuoteButtons />
          <p className="esn-services-note">
            Quotes are given in a Discord ticket. Prefer email? <a href={'mailto:' + SUPPORT_EMAIL}>{SUPPORT_EMAIL}</a>
          </p>
        </div>
      </section>

      <section className="esn-services-section" id="services">
        <div className="shell">
          <div className="esn-services-head">
            <span className="eyebrow">WHAT WE BUILD</span>
            <h2>Services</h2>
          </div>
          <div className="esn-services-grid">
            {SERVICES.map((service) => (
              <article className="esn-service-card" id={service.id} key={service.id}>
                <div className="esn-service-icon" aria-hidden="true">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.blurb}</p>
                <ul>{service.points.map((point) => <li key={point}>{point}</li>)}</ul>
                <div className="esn-service-foot">
                  <strong>{service.price || 'Custom quote'}</strong>
                  {service.link
                    ? <Link to={service.link.to}>{service.link.label} →</Link>
                    : <a href={DISCORD_TICKET} target="_blank" rel="noreferrer">Get a quote ↗</a>}
                </div>
              </article>
            ))}
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

      <section className="esn-services-section" id="how-it-works">
        <div className="shell">
          <div className="esn-services-head">
            <span className="eyebrow">HOW IT WORKS</span>
            <h2>From ticket to handover</h2>
          </div>
          <ol className="esn-services-steps">
            {STEPS.map(([title, copy], index) => (
              <li key={title}>
                <b>{String(index + 1).padStart(2, '0')}</b>
                <h3>{title}</h3>
                <p>{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="esn-services-section">
        <div className="shell">
          <div className="esn-services-cta">
            <div>
              <span className="eyebrow">READY WHEN YOU ARE</span>
              <h2>Get a quote for your project</h2>
              <p>Open a ticket in the ESN Discord and tell us what you want built. Or email <a href={'mailto:' + SUPPORT_EMAIL}>{SUPPORT_EMAIL}</a>.</p>
            </div>
            <QuoteButtons secondary={false} />
          </div>
        </div>
      </section>
    </div>
  )
}
