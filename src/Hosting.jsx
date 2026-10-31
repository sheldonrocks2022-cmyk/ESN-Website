import { useEffect, useState } from 'react'
import './hosting.css'
import { CreatorSection } from './GrowthSections'

const HOSTING_DISCORD = 'https://discord.gg/RGPt3zEfGy'
const HOSTING_CHECKOUT = 'https://panel.esnoffical.com/plans'
export const planCheckoutUrl = (plan, yearly = false) => (!yearly && plan && plan.slug ? `${HOSTING_CHECKOUT}?buy=${plan.slug}` : HOSTING_CHECKOUT)
const BILLING_PORTAL = 'https://billing.stripe.com/p/login/4gM14o5pxgaP9Nl2dNdnW00'
const HOSTING_DOCS = 'https://docs.esnoffical.com'
const HOSTING_STATUS = 'https://status.esnoffical.com'
const PANEL_REGISTER = 'https://panel.esnoffical.com/auth/register'
const planId = (name) => 'plan-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export const BOT_PLANS = [
  { name: 'Nano', slug: 'esn-nano', ram: '256 MB', cpu: '25%', storage: '1 GB', price: '$0.50', yearly: '$5.00', group: 'budget' },
  { name: 'Micro', slug: 'esn-micro', ram: '384 MB', cpu: '30%', storage: '1.5 GB', price: '$0.65', yearly: '', group: 'budget' },
  { name: 'Starter', slug: 'esn-starter', ram: '512 MB', cpu: '35%', storage: '2 GB', price: '$0.75', yearly: '$7.50', group: 'budget' },
  { name: 'Basic', slug: 'esn-basic', ram: '1 GB', cpu: '50%', storage: '4 GB', price: '$0.99', yearly: '$9.90', group: 'budget' },
  { name: 'Plus', slug: 'esn-plus', ram: '1.5 GB', cpu: '75%', storage: '6 GB', price: '$1.29', yearly: '$14.90', group: 'budget' },
  { name: 'Advanced', slug: 'esn-advanced', ram: '2 GB', cpu: '100%', storage: '8 GB', price: '$1.79', yearly: '$19.90', group: 'performance' },
  { name: 'Pro', slug: 'esn-pro', ram: '3 GB', cpu: '125%', storage: '12 GB', price: '$2.49', yearly: '$24.90', group: 'performance', featured: true, label: 'MOST POPULAR' },
  { name: 'Elite', slug: 'esn-elite', ram: '4 GB', cpu: '150%', storage: '15 GB', price: '$4.49', yearly: '$49.90', group: 'performance' },
  { name: 'Ultra', slug: 'esn-ultra', ram: '6 GB', cpu: '200%', storage: '20 GB', price: '$6.99', yearly: '$79.90', group: 'performance' },
  { name: 'Boost', slug: 'esn-boost', ram: '7 GB', cpu: '225%', storage: '25 GB', price: '$7.99', yearly: '', group: 'performance' },
  { name: 'Extreme', slug: 'esn-extreme', ram: '8 GB', cpu: '250%', storage: '30 GB', price: '$7.99', yearly: '$89.90', group: 'premium' },
  { name: 'Titan', slug: 'esn-titan', ram: '10 GB', cpu: '300%', storage: '40 GB', price: '$10.99', yearly: '$129.90', group: 'premium', label: 'BEST VALUE' },
  { name: 'Max', slug: 'esn-max', ram: '12 GB', cpu: '350%', storage: '50 GB', price: '$13.49', yearly: '', group: 'premium' },
  { name: 'Gift', slug: 'esn-gift', ram: '15 GB', cpu: '450%', storage: '60 GB', price: '$14.99', yearly: '$169.90', group: 'premium', label: 'MAX RESOURCES' },
  { name: 'Pro 8GB', slug: 'esn-pro-8gb', ram: '8 GB', cpu: '400%', storage: '30 GB', price: '$9.99', yearly: '', group: 'pro', label: 'NEW' },
  { name: 'Pro 12GB', slug: 'esn-pro-12gb', ram: '12 GB', cpu: '500%', storage: '40 GB', price: '$14.99', yearly: '', group: 'pro', label: 'NEW' },
  { name: 'Pro 16GB', slug: 'esn-pro-16gb', ram: '16 GB', cpu: '600%', storage: '50 GB', price: '$19.99', yearly: '', group: 'pro', label: 'NEW' },
]

const PLAN_GROUPS = [
  { id: 'budget', label: 'Budget Plans', copy: 'Affordable options for smaller bots and projects.' },
  { id: 'performance', label: 'Performance Plans', copy: 'More room for active communities and heavier workloads.' },
  { id: 'premium', label: 'Premium Plans', copy: 'Higher resources for demanding projects. Ask us about game compatibility.' },
  { id: 'pro', label: 'Pro Plans', copy: 'Big Minecraft servers with boosted CPU and disk.' },
]

const BOT_FEATURES = ['24/7 hosting availability', 'Python + Node.js support', 'Private Pterodactyl panel', 'Console, files + SFTP', 'Resource monitoring + auto restart']

// Plans added Oct 27, 2026; prices updated Oct 30, 2026 to match the live checkout prices. Empty yearly = no yearly option.
export const MORE_PLANS = [
  { name: 'Core', slug: 'esn-core', ram: '2.5 GB', cpu: '110%', storage: '10 GB', price: '$2.19', yearly: '$24.90', group: 'bigger' },
  { name: 'Turbo', slug: 'esn-turbo', ram: '3.5 GB', cpu: '140%', storage: '14 GB', price: '$3.49', yearly: '$39.90', group: 'bigger' },
  { name: 'Power', slug: 'esn-power', ram: '5 GB', cpu: '175%', storage: '18 GB', price: '$5.49', yearly: '$59.90', group: 'bigger' },
  { name: 'Terraria', slug: 'esn-terraria', ram: '1.5 GB', cpu: '75%', storage: '6 GB', price: '$1.29', yearly: '$14.90', group: 'game' },
  { name: 'Factorio', slug: 'esn-factorio', ram: '2 GB', cpu: '100%', storage: '8 GB', price: '$1.79', yearly: '$19.90', group: 'game' },
  { name: 'Valheim', slug: 'esn-valheim', ram: '4 GB', cpu: '150%', storage: '15 GB', price: '$4.49', yearly: '$49.90', group: 'game' },
  { name: 'Palworld', slug: 'esn-palworld', ram: '8 GB', cpu: '300%', storage: '30 GB', price: '$8.99', yearly: '$99.90', group: 'game' },
  { name: 'Unturned', slug: 'esn-unturned', ram: '2 GB', cpu: '100%', storage: '8 GB', price: '$1.99', yearly: '', group: 'game' },
  { name: 'Zomboid', slug: 'esn-zomboid', ram: '4 GB', cpu: '150%', storage: '15 GB', price: '$4.99', yearly: '', group: 'game' },
  { name: 'FiveM', slug: 'esn-fivem', ram: '4 GB', cpu: '200%', storage: '25 GB', price: '$5.99', yearly: '', group: 'game' },
  { name: 'Web', slug: 'esn-web-1gb', ram: '1 GB', cpu: '50%', storage: '8 GB', price: '$1.19', yearly: '$12.90', group: 'web' },
  { name: 'VPS-lite 512MB', slug: 'esn-vps-512mb', ram: '512 MB', cpu: '25%', storage: '5 GB', price: '$1.49', yearly: '', group: 'vps' },
  { name: 'VPS-lite 1GB', slug: 'esn-vps-1gb', ram: '1 GB', cpu: '40%', storage: '8 GB', price: '$1.99', yearly: '$19.90', group: 'vps' },
  { name: 'VPS-lite 2GB', slug: 'esn-vps-2gb', ram: '2 GB', cpu: '60%', storage: '12 GB', price: '$3.99', yearly: '$44.90', group: 'vps' },
  { name: 'VPS-lite 4GB', slug: 'esn-vps-4gb', ram: '4 GB', cpu: '100%', storage: '20 GB', price: '$6.99', yearly: '$79.90', group: 'vps' },
  { name: 'VPS-lite 8GB', slug: 'esn-vps-8gb', ram: '8 GB', cpu: '200%', storage: '40 GB', price: '$14.99', yearly: '', group: 'vps' },
]

const MORE_PLAN_GROUPS = [
  { id: 'bigger', label: 'Bigger Bot Plans', copy: 'More room for Discord bots, Telegram bots, or a Minecraft server. You pick the type at checkout.', features: ['24/7 hosting availability', 'Discord, Telegram or Minecraft', 'Private Pterodactyl panel', 'Console, files + SFTP', 'Resource monitoring + auto restart'] },
  { id: 'game', label: 'Game Servers', copy: 'Plans for Terraria, Factorio, Valheim, and Palworld. The game server is installed for you after payment.', features: ['24/7 hosting availability', 'Game server installed for you', 'Private Pterodactyl panel', 'Console, files + SFTP', 'Resource monitoring'] },
  { id: 'web', label: 'Web Hosting', copy: 'Host a website, WordPress, a Node.js app, or a Python app.', features: ['24/7 hosting availability', 'Website, WordPress, Node.js or Python app', 'Private Pterodactyl panel', 'Console, files + SFTP', 'Resource monitoring'] },
  { id: 'vps', label: 'VPS-lite (Linux container)', copy: 'Your own Linux container with a shell in the panel console. It is a container, not a full VPS: no root, apt, systemd, or Docker inside.', features: ['Linux shell in the panel console', 'SFTP + file manager', 'Node.js 22, Python 3, git, gcc', 'One public port + autostart.sh', 'No root, apt, systemd or Docker'] },
]

function CopyPlanLink({ name }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    const link = `https://esnoffical.com/hosting/vps#${planId(name)}`
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { window.location.hash = planId(name) }
  }
  return <button type="button" className="esn-plan-copy" onClick={copy} aria-label={`Copy a link to the ESN ${name} plan`}>{copied ? 'Link copied' : 'Copy plan link'}</button>
}

function PlanGroup({ group, plans, features, billing }) {
  const groupPlans = plans.filter((plan) => plan.group === group.id)
  const yearly = billing === 'yearly'
  return (
    <section className="esn-hosting-plan-group" id={`group-${group.id}`} aria-labelledby={`esn-plan-${group.id}`}>
      <div className="esn-hosting-group-head">
        <div>
          <h3 id={`esn-plan-${group.id}`}>{group.label}</h3>
          <p>{group.copy}</p>
        </div>
        <span>{groupPlans.length} {groupPlans.length === 1 ? 'plan' : 'plans'}</span>
      </div>
      <div className="esn-hosting-plan-grid">
        {groupPlans.map((plan) => (
          <article className={plan.featured ? 'esn-hosting-plan featured' : 'esn-hosting-plan'} key={plan.name} id={planId(plan.name)}>
            {plan.label && <span className={plan.featured ? 'esn-plan-badge' : 'esn-plan-badge subtle'}>{plan.label}</span>}
            <span className="eyebrow">ESN {plan.name.toUpperCase()}</span>
            <div className="esn-plan-price">
              <strong>{yearly && plan.yearly ? plan.yearly : plan.price}</strong><span>{yearly && plan.yearly ? '/ year' : '/ month'}</span>
            </div>
            <div className="esn-plan-resources">
              <div><span>RAM</span><b>{plan.ram}</b></div>
              <div><span>CPU</span><b>{plan.cpu}</b></div>
              <div><span>STORAGE</span><b>{plan.storage}</b></div>
            </div>
            <p className="esn-plan-bestfor"><b>Best for:</b> {bestFor(plan)}</p>
            <ul>
              {plan.yearly && <li>{yearly ? `Monthly: ${plan.price}/month` : `Yearly: ${plan.yearly}/year`}</li>}
              {features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
            <CopyPlanLink name={plan.name} />
            <a href={planCheckoutUrl(plan, yearly && Boolean(plan.yearly))} aria-label={`Order ESN ${plan.name}, ${yearly && plan.yearly ? plan.yearly + ' per year' : plan.price + ' per month'}`}>Order ESN {plan.name} <span aria-hidden="true">→</span></a>
          </article>
        ))}
      </div>
    </section>
  )
}

// A plain starting point per plan. Starting points, not guarantees: the panel graphs show when to move up.
function bestFor(plan) {
  if (plan.group === 'game') return `A ${plan.name} server, installed for you after checkout`
  if (plan.group === 'web') return 'A website, WordPress, Node.js or Python app'
  if (plan.group === 'vps') return 'Scripts, tools and small apps in a Linux shell'
  if (plan.group === 'pro') return 'Big Minecraft servers, modpacks and busy communities'
  const gb = parseFloat(plan.ram) / (plan.ram.includes('MB') ? 1024 : 1)
  if (gb < 1) return 'A small Discord or Telegram bot'
  if (gb < 2) return 'A busier bot with music, a database or many servers'
  if (gb < 4) return 'Several bots, or a small Minecraft server'
  return 'Minecraft with plugins, or several heavy bots'
}

const PLAN_INCLUDES = [
  ['Full control panel', 'Web console, file manager, SFTP, startup settings, schedules, power controls, live CPU/RAM/disk graphs and subusers to share access. Sign in with Discord or Google.'],
  ['Set up automatically', 'Your server is created automatically after checkout and shows up on your panel dashboard.'],
  ['Free move from another host', 'The free importer copies your bot or server over.', 'https://docs.esnoffical.com/move-bot-to-esn.html', 'Guide: move your bot to ESN'],
  ['40+ step-by-step guides', 'Hosting Docs cover Discord bots (Python, Node.js), Telegram bots, Minecraft, game servers, websites and billing, including new guides on Minecraft lag and Bedrock crossplay.', 'https://docs.esnoffical.com/fix-minecraft-lag.html', 'Guide: fix Minecraft lag'],
  ['Help in Discord', 'Open a ticket in the ESN Discord, or ask the ESN Helper bot with /ask, /docs, /botfix and /uptime.'],
  ['Live status page', 'Every ESN service is checked every minute on status.esnoffical.com, with 1h, 6h and 24h response-time charts, an RSS feed and a badge.', 'https://status.esnoffical.com', 'Open the status page'],
  ['US servers', 'Nodes in Chicago and New York.'],
  ['Secure checkout, cancel anytime', 'Stripe handles payment, so card details never touch ESN. Cancel in the billing portal and your plan runs to the end of the paid month.'],
]

function PlanIncludes() {
  return (
    <section className="section compact-section" id="every-plan-includes" aria-labelledby="every-plan-includes-title">
      <div className="shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow">EVERY PLAN INCLUDES</span>
            <h2 id="every-plan-includes-title">What you get with every ESN plan.</h2>
          </div>
          <p>Same tools on every plan, from Nano to Pro 16GB. Bigger plans add RAM, CPU and storage.</p>
        </div>
        <ul className="esn-plan-includes">
          {PLAN_INCLUDES.map(([title, copy, href, label]) => (
            <li key={title}><strong>{title}</strong><span>{copy}{href && <> <a href={href} target="_blank" rel="noreferrer">{label} ↗</a></>}</span></li>
          ))}
        </ul>
        <p className="esn-plan-includes-note">Backups: plans don’t include backup slots by default. A daily backups add-on is available, just ask in <a href={HOSTING_DISCORD} target="_blank" rel="noreferrer">our Discord</a>. You can always download your files with the file manager or SFTP.</p>
      </div>
    </section>
  )
}

const ALL_PLANS = [...BOT_PLANS, ...MORE_PLANS]
const ALL_GROUPS = [...PLAN_GROUPS, ...MORE_PLAN_GROUPS]

// Plan finder: suggests a starting plan from the use case. These are starting points, not guarantees.
const FINDER = [
  { id: 'small-bot', label: 'Small Discord or Telegram bot', plan: 'Nano', why: 'A simple command or moderation bot for one server usually fits in 256 MB.' },
  { id: 'busy-bot', label: 'Busy bot (many servers, music, databases)', plan: 'Basic', why: '1 GB gives room for caches, audio and more servers. Move up if your panel graphs show RAM near the limit.' },
  { id: 'big-bot', label: 'Several bots or a heavy bot', plan: 'Pro', why: '3 GB and 125% CPU, our most popular plan for bigger projects.' },
  { id: 'minecraft', label: 'Small Minecraft server', plan: 'Core', why: 'Bigger Bot Plans can run a Minecraft server; pick the type at checkout. More players or mods need more RAM.' },
  { id: 'big-minecraft', label: 'Big Minecraft server (mods, many players)', plan: 'Pro 8GB', why: 'Pro Plans give 8 to 16 GB RAM with boosted CPU for modpacks and busy servers.' },
  { id: 'terraria', label: 'Terraria / Factorio / Valheim / Palworld', plan: 'Terraria', why: 'Game Server plans install the game for you after payment. Pick the plan named after your game.' },
  { id: 'website', label: 'Website, WordPress or web app', plan: 'Web', why: 'Web Hosting runs a website, WordPress, Node.js or Python app.' },
  { id: 'linux', label: 'Linux shell for scripts and tools', plan: 'VPS-lite 1GB', why: 'A Linux container with a shell in the panel console (no root, apt, systemd or Docker).' },
]

function PlanFinder() {
  const [pick, setPick] = useState(() => {
    try {
      const host = new URLSearchParams(window.location.search).get('host')
      return FINDER.some((item) => item.id === host) ? host : FINDER[0].id
    } catch { return FINDER[0].id }
  })
  const choice = FINDER.find((item) => item.id === pick) || FINDER[0]
  const plan = ALL_PLANS.find((item) => item.name === choice.plan)
  return (
    <div className="esn-plan-finder" id="plan-finder">
      <div>
        <span className="eyebrow">PLAN FINDER</span>
        <h3>Not sure which plan? Tell us what you're hosting.</h3>
        <label htmlFor="esn-finder-select">I want to host</label>
        <select id="esn-finder-select" value={pick} onChange={(event) => setPick(event.target.value)}>
          {FINDER.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </div>
      {plan && (
        <div className="esn-plan-finder-result" aria-live="polite">
          <strong>Start with ESN {plan.name}: {plan.price}/month</strong>
          <p>{plan.ram} RAM · {plan.cpu} CPU · {plan.storage} storage. {choice.why}</p>
          <a className="button secondary" href={`#${planId(plan.name)}`}>See the {plan.name} plan</a>
        </div>
      )}
    </div>
  )
}

function PlanCompare() {
  return (
    <details className="esn-plan-compare" id="compare-plans">
      <summary>Compare all {ALL_PLANS.length} plans side by side</summary>
      <div className="esn-plan-compare-scroll" tabIndex={0} role="region" aria-label="All hosting plans compared">
        <table>
          <caption>ESN Hosting plans: resources and prices</caption>
          <thead><tr><th scope="col">Plan</th><th scope="col">Type</th><th scope="col">RAM</th><th scope="col">CPU</th><th scope="col">Storage</th><th scope="col">Monthly</th><th scope="col">Yearly</th><th scope="col">Order</th></tr></thead>
          <tbody>
            {ALL_PLANS.map((plan) => (
              <tr key={plan.name}>
                <th scope="row"><a href={`#${planId(plan.name)}`}>{plan.name}</a></th>
                <td>{ALL_GROUPS.find((group) => group.id === plan.group)?.label}</td>
                <td>{plan.ram}</td><td>{plan.cpu}</td><td>{plan.storage}</td><td>{plan.price}</td><td>{plan.yearly}</td>
                <td><a href={planCheckoutUrl(plan)} aria-label={`Order ESN ${plan.name}`}>Order</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}

const HOSTING_FAQ = [
  ['How fast is my server ready?', 'Your server is set up automatically after payment, and your panel login is sent to you. Log in at panel.esnoffical.com.'],
  ['Can I cancel?', 'Yes. Use the Stripe billing portal to cancel at the end of your billing period, update your card, or download invoices.'],
  ['Which languages can my bot use?', 'Bot plans support Python and Node.js. You choose the runtime at checkout and can change startup settings in the panel.'],
  ['Is VPS-lite a full VPS?', 'No. It is a Linux container with a shell in the panel console, SFTP and one public port. There is no root, apt, systemd or Docker inside.'],
  ['Where do I get help?', 'Open a ticket in our Discord, read the Hosting Docs, or check Live Uptime for service status.'],
  ['Are backups included?', 'Plans don’t include backup slots by default. A daily backups add-on is available, just ask in our Discord. You can always download your files with the file manager or SFTP.'],
  ['Can I move my bot from another host?', 'Yes. The free importer and the step-by-step guide in the Hosting Docs help you move from Replit, Railway, Heroku, a VPS or another host.'],
  ['Where are the servers?', 'ESN servers are in the US, in Chicago and New York.'],
]

function HostingFAQ() {
  return (
    <section className="section compact-section" id="hosting-faq">
      <div className="shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow">HOSTING FAQ</span>
            <h2>Quick answers before you order.</h2>
          </div>
          <p>More guides live in the <a href={HOSTING_DOCS}>Hosting Docs</a>.</p>
        </div>
        <div className="esn-hosting-faq">
          {HOSTING_FAQ.map(([q, a]) => (
            <details key={q}><summary>{q}</summary><p>{a}</p></details>
          ))}
        </div>
      </div>
    </section>
  )
}

function CopyInvite() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(HOSTING_DISCORD); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { window.open(HOSTING_DISCORD, '_blank', 'noopener') }
  }
  return <button type="button" className="button secondary" onClick={copy}>{copied ? 'Invite link copied' : 'Copy Discord invite'}</button>
}

const PANEL_FEATURES = [
  ['Console', 'Live output plus start, stop, restart, and kill controls.'],
  ['Files + SFTP', 'Upload, edit, organize, and manage bot files from your own server panel.'],
  ['Resources', 'See RAM, CPU, storage, uptime, and live usage for your server.'],
  ['Startup', 'Manage startup files, Node.js or Python runtime settings, and environment variables.'],
]

export default function HostingPage() {
  const [billing, setBillingState] = useState(() => {
    try {
      const fromUrl = new URLSearchParams(window.location.search).get('billing')
      if (fromUrl === 'yearly' || fromUrl === 'monthly') return fromUrl
      return localStorage.getItem('esn_hosting_billing') === 'yearly' ? 'yearly' : 'monthly'
    } catch { return 'monthly' }
  })
  const setBilling = (value) => { setBillingState(value); try { localStorage.setItem('esn_hosting_billing', value) } catch {} }
  const [showTop, setShowTop] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 1400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className="esn-hosting-page">
      <section className="esn-hosting-hero">
        <div className="shell esn-hosting-hero-grid">
          <div>
            <span className="eyebrow">ESN BOT HOSTING // 24/7</span>
            <h1>Your bot. Your files. <em>Your controls.</em></h1>
            <p>
              Plans from $0.50/month. {ALL_PLANS.length} plans for Discord bots, Minecraft, game servers, websites, and VPS-lite.
              Get your own panel with console, files, startup settings, and resource graphs.
            </p>
            <div className="hero-actions page-actions">
              <a className="button primary" href={HOSTING_CHECKOUT}>
                Pick a plan &amp; check out <span>→</span>
              </a>
              <a className="button secondary" href="#customer-panel">See the customer panel</a>
              <a className="button secondary" href="/business">Customer Business Hub</a>
            </div>
            <p className="esn-hosting-purchase-note">
              Pick a plan and check out — your server is set up automatically after payment.{' '}
              <a href={HOSTING_DISCORD} target="_blank" rel="noreferrer">Need help? Join our Discord</a>
            </p>
            <p className="esn-hosting-quicklinks">
              <a href={HOSTING_DOCS}>Hosting Docs</a>
              <a href={HOSTING_STATUS}>Live Uptime</a>
              <a href={BILLING_PORTAL}>Manage billing</a>
            </p>
          </div>

          <aside className="esn-hosting-launch-card esn-hosting-benefits-card">
            <span className="eyebrow">HOSTING MADE SIMPLE</span>
            <strong>More control. Less hassle.</strong>
            <p>Choose a plan, check out, and your server is set up automatically after payment.</p>
            <ul className="esn-hosting-benefits-list">
              <li><b>Private control panel</b><span>Manage your own server, files, and startup settings.</span></li>
              <li><b>Python &amp; Node.js</b><span>Pick the runtime that fits your Discord bot.</span></li>
              <li><b>Help when you need it</b><span>Support and custom requests through Discord tickets.</span></li>
            </ul>
            <small>Server availability is checked automatically at checkout.</small>
          </aside>
        </div>
      </section>

      <section className="section compact-section" id="plans">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">HOSTING PLANS</span>
              <h2>{ALL_PLANS.length} plans. Plans from $0.50/month.</h2>
            </div>
            <p>Every plan includes a private Pterodactyl panel, console, file manager, SFTP, resource monitoring, and Discord ticket support. Bot plans add Python and Node.js support, startup and environment settings, and crash restarting.</p>
          </div>

          <PlanFinder />

          <div className="esn-plan-toolbar">
            <div className="esn-billing-toggle" role="group" aria-label="Show prices">
              <button type="button" aria-pressed={billing === 'monthly'} onClick={() => setBilling('monthly')}>Monthly</button>
              <button type="button" aria-pressed={billing === 'yearly'} onClick={() => setBilling('yearly')}>Yearly</button>
            </div>
            <nav className="esn-plan-jump" aria-label="Jump to plan type">
              {ALL_GROUPS.map((group) => (
                <a key={group.id} href={`#group-${group.id}`}>{group.label} <span>{ALL_PLANS.filter((plan) => plan.group === group.id).length}</span></a>
              ))}
            </nav>
          </div>

          <div className="esn-hosting-plan-groups">
            {PLAN_GROUPS.map((group) => (
              <PlanGroup key={group.id} group={group} plans={BOT_PLANS} features={BOT_FEATURES} billing={billing} />
            ))}
            {MORE_PLAN_GROUPS.map((group) => (
              <PlanGroup key={group.id} group={group} plans={MORE_PLANS} features={group.features} billing={billing} />
            ))}
          </div>

          <p className="esn-plan-soldout-note">If a plan says Sold out at checkout, our nodes are full right now. You won't be charged. Ask in <a href={HOSTING_DISCORD}>Discord</a> and we'll tell you when it's back.</p>

          <PlanCompare />

          <div className="esn-hosting-payment-safety">
            <strong>VPS-lite rules</strong>
            <p>No crypto mining, DDoS or flooding, port scanning, or brute forcing. A VPS-lite server that breaks these rules is stopped.</p>
          </div>

          <div className="esn-hosting-payment-safety">
            <strong>Payment safety</strong>
            <p>Pay only through the official checkout at panel.esnoffical.com/plans (Stripe checkout). Your server is set up automatically after payment. Never send money to anyone in Discord DMs.</p>
          </div>

          <div className="esn-hosting-payment-safety">
            <strong>Already a customer?</strong>
            <p>Cancel, update your card, or download invoices in the <a href={BILLING_PORTAL}>Stripe billing portal</a>. Manage your server at <a href="https://panel.esnoffical.com">panel.esnoffical.com</a>.</p>
          </div>
        </div>
      </section>


      <section className="section dark-section" id="customer-panel">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">CUSTOMER PANEL</span>
              <h2>Every buyer gets their own server control panel.</h2>
            </div>
            <p>Customers only see servers assigned to their account. Other customers' servers and ESN administrator controls remain private.</p>
          </div>

          <div className="esn-customer-panel-shell">
            <div className="esn-panel-topbar">
              <div><i /> <strong>ESN HOSTING</strong></div>
              <span>CUSTOMER CONTROL</span>
            </div>
            <div className="esn-panel-preview">
              <aside>
                <b>MY SERVERS</b>
                <span className="active">Discord Bot #1</span>
                <span>Account</span>
                <span>Support</span>
              </aside>
              <main>
                <div className="esn-panel-server-head">
                  <div>
                    <span className="eyebrow">DISCORD BOT #1</span>
                    <h3>Online</h3>
                  </div>
                  <span className="esn-panel-online"><i /> RUNNING</span>
                </div>
                <div className="esn-panel-metrics">
                  <div><span>RAM</span><strong>438 MB</strong><small>of 1 GB</small></div>
                  <div><span>CPU</span><strong>18%</strong><small>live usage</small></div>
                  <div><span>DISK</span><strong>1.2 GB</strong><small>of 4 GB</small></div>
                  <div><span>UPTIME</span><strong>24/7</strong><small>auto restart</small></div>
                </div>
                <div className="esn-panel-console">
                  <span>[ESN] Starting server...</span>
                  <span>[BOT] Connected to Discord Gateway</span>
                  <span>[BOT] Ready and listening for events</span>
                  <b>Server marked as running.</b>
                </div>
                <div className="esn-panel-actions" aria-hidden="true">
                  <span>Start</span>
                  <span>Restart</span>
                  <span>Stop</span>
                  <span>Files</span>
                </div>
              </main>
            </div>
          </div>

          <div className="esn-panel-feature-grid">
            {PANEL_FEATURES.map(([title, text]) => (
              <article key={title}><strong>{title}</strong><p>{text}</p></article>
            ))}
          </div>

          <div className="esn-panel-access">
            <div>
              <span className="eyebrow">SECURE PANEL ACCESS</span>
              <h3>Log in at panel.esnoffical.com.</h3>
              <p>The customer panel runs on an ESN domain with HTTPS. After checkout, your panel login is sent to you automatically. Need help? Join our Discord.</p>
            </div>
            <a className="button primary" href="https://panel.esnoffical.com">Open the customer panel</a>
          </div>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">HOW ORDERS WORK</span>
              <h2>Checkout to private panel.</h2>
            </div>
          </div>
          <div className="esn-hosting-roadmap">
            <article><b>01</b><span>PURCHASE</span><h3>Pick a plan and check out</h3><p>Choose a plan on panel.esnoffical.com/plans and pay through the secure checkout.</p></article>
            <article><b>02</b><span>PROVISION</span><h3>Your server is created automatically</h3><p>The plan resources and your selected runtime are set up for your own private server after payment.</p></article>
            <article><b>03</b><span>ACCESS</span><h3>Receive your panel account</h3><p>You get access to your own customer account and only the servers assigned to you.</p></article>
            <article><b>04</b><span>DEPLOY</span><h3>Upload and run your bot</h3><p>Use files, SFTP, console, environment settings, Node.js or Python, and 24/7 runtime.</p></article>
          </div>
          <div className="esn-hosting-discord-cta">
            <div>
              <span className="eyebrow">READY TO ORDER?</span>
              <h3>Pick a plan and check out.</h3>
              <p>Plans from $0.50/month, set up automatically after payment. Need help or a custom plan? <a href={HOSTING_DISCORD} target="_blank" rel="noreferrer">Join our Discord</a>.</p>
            </div>
            <a className="button primary" href={HOSTING_CHECKOUT}>See plans &amp; check out <span>→</span></a>
          </div>
        </div>
      </section>

      <PlanIncludes />
      <HostingFAQ />

      <CreatorSection />

      <section className="section compact-section" id="network-status">
        <div className="shell">
          <div className="esn-hosting-availability">
            <div>
              <span className="eyebrow">QUESTIONS ABOUT AVAILABILITY?</span>
              <h2>Let's find the right setup for you.</h2>
              <p>We keep our internal infrastructure details private. Join our Discord to ask about your project or request a custom plan.</p>
            </div>
            <div className="esn-hosting-help-actions">
              <a className="button primary" href={HOSTING_DISCORD} target="_blank" rel="noreferrer">Need help? Join our Discord <span>→</span></a>
              <CopyInvite />
            </div>
          </div>
        </div>
      </section>

      {showTop && <button type="button" className="esn-hosting-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">↑</button>}

      <div className="esn-hosting-sticky-cta">
        <span>Plans from <b>$0.50/month</b></span>
        <a href="#plans">See plans</a>
      </div>
    </div>
  )
}
