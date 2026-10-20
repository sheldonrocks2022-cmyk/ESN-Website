import './hosting.css'

const HOSTING_DISCORD = 'https://discord.gg/RGPt3zEfGy'

export const BOT_PLANS = [
  { name: 'Nano', ram: '256 MB', cpu: '25%', storage: '1 GB', price: '$0.50', group: 'budget' },
  { name: 'Starter', ram: '512 MB', cpu: '35%', storage: '2 GB', price: '$0.75', group: 'budget' },
  { name: 'Basic', ram: '1 GB', cpu: '50%', storage: '4 GB', price: '$0.99', group: 'budget' },
  { name: 'Plus', ram: '1.5 GB', cpu: '75%', storage: '6 GB', price: '$1.49', group: 'budget' },
  { name: 'Advanced', ram: '2 GB', cpu: '100%', storage: '8 GB', price: '$1.99', group: 'performance' },
  { name: 'Pro', ram: '3 GB', cpu: '125%', storage: '12 GB', price: '$2.99', group: 'performance', featured: true, label: 'MOST POPULAR' },
  { name: 'Elite', ram: '4 GB', cpu: '150%', storage: '15 GB', price: '$4.99', group: 'performance' },
  { name: 'Ultra', ram: '6 GB', cpu: '200%', storage: '20 GB', price: '$7.99', group: 'performance' },
  { name: 'Extreme', ram: '8 GB', cpu: '250%', storage: '30 GB', price: '$8.99', group: 'premium' },
  { name: 'Titan', ram: '10 GB', cpu: '300%', storage: '40 GB', price: '$12.99', group: 'premium', label: 'BEST VALUE' },
  { name: 'Gift', ram: '15 GB', cpu: '450%', storage: '60 GB', price: '$16.99', group: 'premium', label: 'MAX RESOURCES' },
]

const PLAN_GROUPS = [
  { id: 'budget', label: 'Budget Plans', copy: 'Affordable options for smaller bots and projects.' },
  { id: 'performance', label: 'Performance Plans', copy: 'More room for active communities and heavier workloads.' },
  { id: 'premium', label: 'Premium Plans', copy: 'Higher resources for demanding projects. Ask us about game compatibility.' },
]

const PANEL_FEATURES = [
  ['Console', 'Live output plus start, stop, restart, and kill controls.'],
  ['Files + SFTP', 'Upload, edit, organize, and manage bot files from your own server panel.'],
  ['Resources', 'See RAM, CPU, storage, uptime, and live usage for your server.'],
  ['Startup', 'Manage startup files, Node.js or Python runtime settings, and environment variables.'],
]

export default function HostingPage() {
  return (
    <div className="esn-hosting-page">
      <section className="esn-hosting-hero">
        <div className="shell esn-hosting-hero-grid">
          <div>
            <span className="eyebrow">ESN BOT HOSTING // 24/7</span>
            <h1>Your bot. Your files. <em>Your controls.</em></h1>
            <p>
              Start from $0.50/month with 11 plans for Discord bots and larger projects.
              Get your own panel with console, files, startup settings, and resource graphs.
            </p>
            <div className="hero-actions page-actions">
              <a className="button primary" href={HOSTING_DISCORD} target="_blank" rel="noreferrer">
                Buy through Discord <span>→</span>
              </a>
              <a className="button secondary" href="#customer-panel">See the customer panel</a>
              <a className="button secondary" href="/business">Customer Business Hub</a>
            </div>
            <p className="esn-hosting-purchase-note">
              Open a hosting ticket to order. Payments must be approved by an authorized ESN CEO.
            </p>
          </div>

          <aside className="esn-hosting-launch-card esn-hosting-benefits-card">
            <span className="eyebrow">HOSTING MADE SIMPLE</span>
            <strong>More control. Less hassle.</strong>
            <p>Choose a plan, open a ticket, and let our team help you get your server running.</p>
            <ul className="esn-hosting-benefits-list">
              <li><b>Private control panel</b><span>Manage your own server, files, and startup settings.</span></li>
              <li><b>Python &amp; Node.js</b><span>Pick the runtime that fits your Discord bot.</span></li>
              <li><b>Help when you need it</b><span>Support and custom requests through Discord tickets.</span></li>
            </ul>
            <small>Server availability is confirmed when you order.</small>
          </aside>
        </div>
      </section>

      <section className="section compact-section" id="plans">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">BOT HOSTING PLANS</span>
              <h2>11 plans. Starting at $0.50/month.</h2>
            </div>
            <p>Every plan includes a private Pterodactyl panel, Python and Node.js support, console, file manager, SFTP, resource monitoring, startup and environment settings, crash restarting, and Discord ticket support.</p>
          </div>

          <div className="esn-hosting-plan-groups">
            {PLAN_GROUPS.map((group) => (
              <section className="esn-hosting-plan-group" key={group.id} aria-labelledby={`esn-plan-${group.id}`}>
                <div className="esn-hosting-group-head">
                  <div>
                    <h3 id={`esn-plan-${group.id}`}>{group.label}</h3>
                    <p>{group.copy}</p>
                  </div>
                  <span>{BOT_PLANS.filter((plan) => plan.group === group.id).length} plans</span>
                </div>
                <div className="esn-hosting-plan-grid">
                  {BOT_PLANS.filter((plan) => plan.group === group.id).map((plan) => (
                    <article className={plan.featured ? 'esn-hosting-plan featured' : 'esn-hosting-plan'} key={plan.name}>
                      {plan.label && <span className={plan.featured ? 'esn-plan-badge' : 'esn-plan-badge subtle'}>{plan.label}</span>}
                      <span className="eyebrow">ESN {plan.name.toUpperCase()}</span>
                      <div className="esn-plan-price"><strong>{plan.price}</strong><span>/ month</span></div>
                      <div className="esn-plan-resources">
                        <div><span>RAM</span><b>{plan.ram}</b></div>
                        <div><span>CPU</span><b>{plan.cpu}</b></div>
                        <div><span>STORAGE</span><b>{plan.storage}</b></div>
                      </div>
                      <ul>
                        <li>24/7 hosting availability</li>
                        <li>Python + Node.js support</li>
                        <li>Private Pterodactyl panel</li>
                        <li>Console, files + SFTP</li>
                        <li>Resource monitoring + auto restart</li>
                      </ul>
                      <a href={HOSTING_DISCORD} target="_blank" rel="noreferrer">Order ESN {plan.name} <span>→</span></a>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="esn-hosting-payment-safety">
            <strong>Payment safety</strong>
            <p>Open a hosting ticket first. Payments are handled only by authorized ESN CEOs (Discord IDs 811100216052547594 and 1515077206886453469). Never send money to unauthorized staff members.</p>
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
            <article><b>02</b><span>PROVISION</span><h3>ESN creates your server</h3><p>The plan resources and your selected runtime are set up for your own private server.</p></article>
            <article><b>03</b><span>ACCESS</span><h3>Receive your panel account</h3><p>You get access to your own customer account and only the servers assigned to you.</p></article>
            <article><b>04</b><span>DEPLOY</span><h3>Upload and run your bot</h3><p>Use files, SFTP, console, environment settings, Node.js or Python, and 24/7 runtime.</p></article>
          </div>
          <div className="esn-hosting-discord-cta">
            <div>
              <span className="eyebrow">OFFICIAL HOSTING DISCORD</span>
              <h3>Ready to order?</h3>
              <p>Choose one of our 11 plans, starting at $0.50/month, then open a hosting ticket. Our team can discuss custom requirements too.</p>
            </div>
            <a className="button primary" href={HOSTING_DISCORD} target="_blank" rel="noreferrer">Join & buy hosting <span>→</span></a>
          </div>
        </div>
      </section>

      <section className="section compact-section" id="network-status">
        <div className="shell">
          <div className="esn-hosting-availability">
            <div>
              <span className="eyebrow">QUESTIONS ABOUT AVAILABILITY?</span>
              <h2>Let's find the right setup for you.</h2>
              <p>We keep our internal infrastructure details private. Open a hosting ticket to check availability, ask about your project, or request a custom plan.</p>
            </div>
            <a className="button primary" href={HOSTING_DISCORD} target="_blank" rel="noreferrer">Ask ESN Hosting <span>→</span></a>
          </div>
        </div>
      </section>
    </div>
  )
}
