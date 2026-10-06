import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './hosting.css'

const EMPTY_STATE = {
  connected: false,
  controller: 'not-configured',
  nodes: [],
  updatedAt: null,
}

function formatMemory(value) {
  const gb = Number(value)
  return Number.isFinite(gb) && gb > 0 ? `${gb} GB` : 'Set after provisioning'
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
        <div><span>ROLE</span><strong>{node.role || 'Compute'}</strong></div>
      </div>
      <div className="esn-node-actions" aria-label="Node controls">
        <button type="button" disabled>Console</button>
        <button type="button" disabled>Files</button>
        <button type="button" disabled>Restart</button>
        <button type="button" disabled>Backups</button>
      </div>
      <p className="esn-node-note">Live controls stay locked until the secure ESN node agent is connected.</p>
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
            <span className="eyebrow">ESN HOSTING // FOUNDATION</span>
            <h1>Your cloud. Your panel. <em>ESN on the front.</em></h1>
            <p>
              ESN Hosting is being built as a provider-independent control layer. Free cloud machines can become ESN nodes
              while provider credentials stay server-side and out of the public website.
            </p>
            <div className="hero-actions page-actions">
              <a className="button primary" href="#node-setup">Connect first node <span>→</span></a>
              <Link className="button secondary" to="/domains">Domains</Link>
            </div>
          </div>
          <aside className="esn-hosting-controller">
            <div className="esn-controller-top">
              <span>ESN CONTROLLER</span>
              <span className={state.connected ? 'esn-controller-dot online' : 'esn-controller-dot'} />
            </div>
            <strong>{loading ? 'CHECKING…' : state.connected ? 'READY' : 'AWAITING NODE'}</strong>
            <small>{state.connected ? `${state.nodes.length} node(s) connected` : 'No cloud machine is connected yet.'}</small>
            <button type="button" onClick={refresh} disabled={loading}>{loading ? 'Checking…' : 'Refresh controller'}</button>
          </aside>
        </div>
      </section>

      <section className="section compact-section">
        <div className="shell esn-hosting-stat-grid">
          <div><strong>{state.nodes.length}</strong><span>Connected nodes</span></div>
          <div><strong>{totalRam ? `${totalRam} GB` : '0 GB'}</strong><span>Connected RAM</span></div>
          <div><strong>$0</strong><span>Target infrastructure cost</span></div>
          <div><strong>PRIVATE</strong><span>Provider credentials</span></div>
        </div>
      </section>

      <section className="section" id="nodes">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">NODE FLEET</span>
              <h2>ESN compute nodes.</h2>
            </div>
            <p>Each free cloud VM remains its own machine. ESN combines them into one management experience without pretending separate RAM is one giant VPS.</p>
          </div>

          {state.nodes.length ? (
            <div className="esn-hosting-node-grid">
              {state.nodes.map((node, index) => <NodeCard key={node.id || node.name || index} node={node} />)}
            </div>
          ) : (
            <div className="esn-hosting-empty">
              <span className="esn-empty-orbit"><i /><i /><i /></span>
              <div>
                <span className="eyebrow">NO NODE CONNECTED</span>
                <h3>The ESN panel is ready for its first machine.</h3>
                <p>We have not fabricated server stats. Once the first free cloud VM is provisioned, it will appear here as an ESN node.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section dark-section" id="node-setup">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ZERO-DOLLAR BUILD PATH</span>
              <h2>Build the network one free node at a time.</h2>
            </div>
          </div>
          <div className="esn-hosting-roadmap">
            <article><b>01</b><span>Provision</span><h3>Free cloud VM</h3><p>Create the first eligible free-tier cloud machine. No provider key is ever pasted into front-end code.</p></article>
            <article><b>02</b><span>Harden</span><h3>Ubuntu node</h3><p>Update the machine, create the ESN service user, enable the firewall, and use key-based SSH.</p></article>
            <article><b>03</b><span>Connect</span><h3>ESN node agent</h3><p>The secure controller layer reports health and later provides console, restart, files, and backup operations.</p></article>
            <article><b>04</b><span>Deploy</span><h3>Minecraft + bots</h3><p>Assign workloads by node so Minecraft servers, Guardian, and other ESN services do not fight for the same memory.</p></article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell esn-hosting-architecture">
          <div>
            <span className="eyebrow">ARCHITECTURE</span>
            <h2>Providers stay behind ESN.</h2>
            <p>The public website talks to an ESN controller. The controller talks to connected nodes. Cloud credentials and node secrets remain on the server side.</p>
          </div>
          <div className="esn-architecture-flow" aria-label="ESN hosting architecture">
            <span>ESN WEB</span><b>→</b><span>ESN CONTROLLER</span><b>→</b><span>FREE CLOUD NODES</span>
          </div>
        </div>
      </section>
    </div>
  )
}
