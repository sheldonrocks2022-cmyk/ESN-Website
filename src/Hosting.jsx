import { useCallback, useEffect, useMemo, useState } from 'react'
import './hosting.css'

const HOSTING_DISCORD = 'https://discord.gg/RGPt3zEfGy'

const EMPTY_STATE = {
  connected: false,
  controller: 'not-configured',
  nodes: [],
  updatedAt: null,
}

const BOT_PLANS = [
  { name: 'Starter', ram: '512 MB', cpu: '35%', storage: '2 GB', price: '$0.99', featured: false },
  { name: 'Basic', ram: '1 GB', cpu: '50%', storage: '4 GB', price: '$1.99', featured: true },
  { name: 'Plus', ram: '2 GB', cpu: '100%', storage: '8 GB', price: '$3.49', featured: false },
  { name: 'Pro', ram: '4 GB', cpu: '150%', storage: '15 GB', price: '$5.99', featured: false },
  { name: 'Ultra', ram: '6 GB', cpu: '200%', storage: '20 GB', price: '$8.99', featured: false },
  { name: 'Extreme', ram: '8 GB', cpu: '250%', storage: '30 GB', price: '$11.99', featured: false },
]

const PANEL_FEATURES = [
  ['Console', 'Live output plus start, stop, restart, and kill controls.'],
  ['Files + SFTP', 'Upload, edit, organize, and manage bot files from your own server panel.'],
  ['Resources', 'See RAM, CPU, storage, uptime, and live usage for your server.'],
  ['Startup', 'Manage startup files, Node.js or Python runtime settings, and environment variables.'],
]

function formatMemory(value) {
  const gb = Number(value)
  return Number.isFinite(gb) && gb > 0 ? `${gb} GB` : 'Pending'
}

function NodeCard({ node }) {
  const online = node.status === 'online'
  return (
    <article className="esn-hosting-node">
      <div className="esn-hosting-node-head">
        <div>
          <span className="eyebrow">{node.provider || 'ESN NODE'}</span>
          <h3>{node.name || 'Unnamed node'}</h3>
        </div>
        <span className={online ? 'esn-node-status online' : 'esn-node-status'}>
          <i />
          {online ? 'ONLINE' : String(node.status || 'UNKNOWN').toUpperCase()}
        </span>
      </div>
      <div className="esn-node-specs">
        <div><span>RAM</span><strong>{formatMemory(node.ramGb)}</strong></div>
        <div><span>CPU</span><strong>{node.cpu || 'Pending'}</strong></div>
        <div><span>REGION</span><strong>{node.region || 'Pending'}</strong></div>
        <div><span>ROLE</span><strong>{node.role || 'Bot Hosting'}</strong></div>
      </div>
    </article>
  )
}

export default function HostingPage() {
  const [state, setState] = useState(EMPTY_STATE)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/hosting/status', { cache: 'no-store' })
      if (!response.ok) throw new Error('hosting controller unavailable')
      const data = await response.json()
      setState({
        connected: Boolean(data.connected),
        controller: data.controller || 'not-configured',
        nodes: Array.isArray(data.nodes) ? data.nodes : [],
        updatedAt: data.updatedAt || null,
      })
    } catch {
      setState(EMPTY_STATE)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const totalRam = useMemo(
    () => state.nodes.reduce((sum, node) => sum + (Number(node.ramGb) || 0), 0),
    [state.nodes],
  )

  return (
    <div className="esn-hosting-page">
      <section className="esn-hosting-hero">
        <div className="shell esn-hosting-hero-grid">
          <div>
            <span className="eyebrow">ESN BOT HOSTING // 24/7</span>
            <h1>Your bot. Your panel. <em>Always online.</em></h1>
            <p>
              Run Node.js and Python Discord bots on ESN infrastructure with a private customer panel,
              live console, file management, resource controls, and 24/7 runtime.
            </p>
            <div className="hero-actions page-actions">
              <a className="button primary" href={HOSTING_DISCORD} target="_blank" rel="noreferrer">
                Buy through Discord <span>→</span>
              </a>
              <a className="button secondary" href="#customer-panel">See the customer panel</a>
            </div>
            <p className="esn-hosting-purchase-note">
              Purchases and support are handled only through the official ESN Hosting Discord.
            </p>
          </div>

          <aside className="esn-hosting-launch-card">
            <span className="eyebrow">ESN-US-01</span>
            <strong>24/7 BOT NODE</strong>
            <div className="esn-launch-specs">
              <span><b>24 GB</b> RAM</span>
              <span><b>6</b> CPU cores</span>
              <span><b>100 GB</b> NVMe</span>
              <span><b>7 TB</b> transfer</span>
            </div>
            <small>Customer capacity is limited so performance stays stable.</small>
          </aside>
        </div>
      </section>

      <section className="section compact-section" id="plans">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">BOT HOSTING PLANS</span>
              <h2>Start small. Scale when your bot grows.</h2>
            </div>
            <p>Every plan includes 24/7 runtime, a private customer panel, console, files, SFTP, resource graphs, and Node.js or Python support.</p>
          </div>

          <div className="esn-hosting-plan-grid">
            {BOT_PLANS.map((plan) => (
              <article className={plan.featured ? 'esn-hosting-plan featured' : 'esn-hosting-plan'} key={plan.name}>
                {plan.featured && <span className="esn-plan-badge">MOST POPULAR</span>}
                <span className="eyebrow">ESN {plan.name.toUpperCase()}</span>
                <div className="esn-plan-price"><strong>{plan.price}</strong><span>/ month</span></div>
                <div className="esn-plan-resources">
                  <div><span>RAM</span><b>{plan.ram}</b></div>
                  <div><span>CPU</span><b>{plan.cpu}</b></div>
                  <div><span>STORAGE</span><b>{plan.storage}</b></div>
                </div>
                <ul>
                  <li>24/7 bot runtime</li>
                  <li>Node.js + Python</li>
                  <li>Private customer panel</li>
                  <li>Console + file manager</li>
                  <li>Crash restart support</li>
                </ul>
                <a href={HOSTING_DISCORD} target="_blank" rel="noreferrer">Buy in Discord <span>→</span></a>
              </article>
            ))}
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
            <p>Customers only see servers assigned to their account. They do not get access to ESN-US-01, other customers, or the ESN administrator area.</p>
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
                <div className="esn-panel-actions">
                  <button type="button">Start</button>
                  <button type="button">Restart</button>
                  <button type="button">Stop</button>
                  <button type="button">Files</button>
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
              <h3>Customer login link is being secured before public launch.</h3>
              <p>We will publish the customer login only after the panel is behind an ESN domain with HTTPS. Until then, customers should purchase or request support through Discord.</p>
            </div>
            <a className="button primary" href={HOSTING_DISCORD} target="_blank" rel="noreferrer">Open ESN Hosting Discord</a>
          </div>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">HOW ORDERS WORK</span>
              <h2>Discord purchase to private panel.</h2>
            </div>
          </div>
          <div className="esn-hosting-roadmap">
            <article><b>01</b><span>PURCHASE</span><h3>Open a Discord ticket</h3><p>Choose a plan in the official ESN Hosting Discord and complete the purchase with staff.</p></article>
            <article><b>02</b><span>PROVISION</span><h3>ESN creates your server</h3><p>Your RAM, CPU, storage, runtime, and server ownership are provisioned on an ESN node.</p></article>
            <article><b>03</b><span>ACCESS</span><h3>Receive your panel account</h3><p>You get access to your own customer account and only the servers assigned to you.</p></article>
            <article><b>04</b><span>DEPLOY</span><h3>Upload and run your bot</h3><p>Use files, SFTP, console, environment settings, Node.js or Python, and 24/7 runtime.</p></article>
          </div>
          <div className="esn-hosting-discord-cta">
            <div>
              <span className="eyebrow">OFFICIAL HOSTING DISCORD</span>
              <h3>Ready to order?</h3>
              <p>Join the permanent ESN Hosting server and open a hosting ticket.</p>
            </div>
            <a className="button primary" href={HOSTING_DISCORD} target="_blank" rel="noreferrer">Join & buy hosting <span>→</span></a>
          </div>
        </div>
      </section>

      <section className="section compact-section" id="network-status">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">INFRASTRUCTURE STATUS</span>
              <h2>ESN node connection.</h2>
            </div>
            <button className="esn-status-refresh" type="button" onClick={refresh} disabled={loading}>
              {loading ? 'Checking…' : 'Refresh'}
            </button>
          </div>

          <div className="esn-hosting-stat-grid">
            <div><strong>{state.nodes.length}</strong><span>Reported nodes</span></div>
            <div><strong>{totalRam ? `${totalRam} GB` : '—'}</strong><span>Reported RAM</span></div>
            <div><strong>{state.connected ? 'ONLINE' : 'PENDING'}</strong><span>Website controller</span></div>
            <div><strong>24/7</strong><span>Hosting target</span></div>
          </div>

          {state.nodes.length > 0 && (
            <div className="esn-hosting-node-grid">
              {state.nodes.map((node, index) => <NodeCard key={node.id || node.name || index} node={node} />)}
            </div>
          )}

          {!state.connected && (
            <p className="esn-status-note">
              The public website controller has not been connected to Pelican yet. This status block intentionally does not fabricate live node data.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
