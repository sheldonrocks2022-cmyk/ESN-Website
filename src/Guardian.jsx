import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { GUARDIAN_COMMAND_GROUPS } from './guardianCommands'
import './guardian.css'

// /guardian: public ESN Guardian setup dashboard (static, no login).
// Checklist progress is stored only in this browser (localStorage).
export const GUARDIAN_ADD_URL = 'https://discord.com/oauth2/authorize?client_id=1544503232674664573&permissions=8&scope=bot%20applications.commands'
export const GUARDIAN_SUPPORT_URL = 'https://discord.gg/RGPt3zEfGy'
const STORAGE_KEY = 'esn-guardian-setup-v1'

const STEPS = [
  { id: 'invite', title: 'Invite Guardian and fix the role order', text: 'Add Guardian to your server, then open Server Settings > Roles and drag the Guardian role above every role it must manage (Verified, Unverified, Members).', command: null },
  { id: 'harden', title: 'Harden your server', text: 'Apply Guardian\'s recommended secure baseline in one command.', command: '/security harden' },
  { id: 'logs', title: 'Set your log channel', text: 'Send every Guardian log type to one channel. Pick your own #logs channel.', command: '/logs-all channel:#logs' },
  { id: 'verify', title: 'Turn on verification', text: 'The server owner runs this, then checks it with /verification status. New members get Unverified and only see #guardian-verification. They press VERIFY, type the code, and the server unlocks.', command: '/guardianmax activate-verification', extra: '/verification status' },
  { id: 'test', title: 'Run the self-test and audit', text: 'Check that every protection is working and see your security score.', command: '/guardianmax self-test', extra: '/guardian audit' },
  { id: 'community', title: 'Pick your community features', text: 'Turn on what you want: levels, giveaways, polls, birthdays and starboard.', command: '/community toggle' },
  { id: 'hub', title: 'Try the new Hub features', text: 'Daily coins, a role and color shop, profiles, rank cards, clans, events, server stats and translate. Use /hub setup to turn on the weekly recap.', command: '/hub setup', more: ['/hub daily', '/hub shop', '/hub profile', '/hub rank', '/hub clan', '/hub event', '/hub stats', '/hub translate'] },
]

const FAQ = [
  ['VERIFY says verification is not enabled.', 'Verification is switched off for your server. The server owner runs /guardianmax activate-verification, then /verification status to confirm it is on. Members can press VERIFY again right after.'],
  ['Members verify but nothing unlocks.', 'This is almost always role order. In Server Settings > Roles, drag the Guardian role above Verified, Unverified and Members, then run /verification status again.'],
  ['Is the economy real money?', 'No. Hub coins are earned in your server and only buy things like roles and name colors. They cannot be bought, sold or cashed out.'],
  ['What does Guardian store about my members?', 'Only what it needs to protect and run your server: the settings you choose, moderation cases and warnings, and Hub levels and coins. That data is used to run Guardian for your server and is never sold. Questions about your data? Ask in the support server.'],
  ['Where do I get help?', 'Join the Guardian support server and open a ticket. Staff can check your setup with you.'],
]

function loadDone() {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        const area = document.createElement('textarea')
        area.value = text
        area.setAttribute('readonly', '')
        area.style.position = 'fixed'
        area.style.opacity = '0'
        document.body.appendChild(area)
        area.select()
        document.execCommand('copy')
        document.body.removeChild(area)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }
  return (
    <button type="button" className={'esn-g-copy' + (copied ? ' is-copied' : '')} onClick={copy} aria-label={'Copy ' + text}>
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function Command({ text }) {
  return (
    <span className="esn-g-cmd"><code>{text}</code><CopyButton text={text} /></span>
  )
}

export default function GuardianPage() {
  const [done, setDone] = useState({})
  const [query, setQuery] = useState('')

  useEffect(() => { setDone(loadDone()) }, [])

  const toggle = (id) => {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* storage blocked */ }
      return next
    })
  }

  const reset = () => {
    setDone({})
    try { window.localStorage.removeItem(STORAGE_KEY) } catch { /* storage blocked */ }
  }

  const doneCount = STEPS.filter((step) => done[step.id]).length
  const percent = Math.round((doneCount / STEPS.length) * 100)

  const totalCommands = useMemo(() => GUARDIAN_COMMAND_GROUPS.reduce((sum, group) => sum + group.commands.length, 0), [])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return GUARDIAN_COMMAND_GROUPS
    return GUARDIAN_COMMAND_GROUPS
      .map((group) => ({ ...group, commands: group.commands.filter(([name, desc]) => (name + ' ' + desc + ' ' + group.label).toLowerCase().includes(q)) }))
      .filter((group) => group.commands.length)
  }, [query])
  const shownCount = filtered.reduce((sum, group) => sum + group.commands.length, 0)

  return (
    <main className="esn-g-page">
      <section className="esn-g-hero">
        <div className="shell esn-g-hero-inner">
          <span className="eyebrow">ESN Discord bot</span>
          <h1>ESN Guardian</h1>
          <p className="esn-g-lead">The all-in-one security, verification and community bot for ESN servers.</p>
          <div className="esn-g-actions">
            <a className="button primary" href={GUARDIAN_ADD_URL} target="_blank" rel="noreferrer">Add Guardian to your server <span>↗</span></a>
            <a className="button secondary" href={GUARDIAN_SUPPORT_URL} target="_blank" rel="noreferrer">Support server <span>↗</span></a>
          </div>
          <div className="esn-g-stats">
            <div><strong>{totalCommands}</strong><span>Commands</span></div>
            <div><strong>Verify</strong><span>Code-checked gate</span></div>
            <div><strong>Free</strong><span>To add</span></div>
          </div>
        </div>
      </section>

      <section className="section esn-g-section" id="setup">
        <div className="shell">
          <div className="esn-g-head">
            <span className="eyebrow">Setup dashboard</span>
            <h2>Set up Guardian in 7 steps.</h2>
            <p>Tick each step as you go. Your progress is saved in this browser only.</p>
          </div>
          <div className="esn-g-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label="Setup progress">
            <div className="esn-g-progress-bar" style={{ width: percent + '%' }} />
          </div>
          <div className="esn-g-progress-meta">
            <span>{doneCount} of {STEPS.length} done{doneCount === STEPS.length ? ' · your server is protected' : ''}</span>
            {doneCount ? <button type="button" className="esn-g-reset" onClick={reset}>Reset</button> : null}
          </div>
          <ol className="esn-g-steps">
            {STEPS.map((step, index) => (
              <li key={step.id} className={'esn-g-step' + (done[step.id] ? ' is-done' : '')}>
                <label className="esn-g-check">
                  <input type="checkbox" checked={!!done[step.id]} onChange={() => toggle(step.id)} />
                  <span className="esn-g-num" aria-hidden="true">{done[step.id] ? '✓' : index + 1}</span>
                  <span className="esn-g-step-title">{step.title}</span>
                </label>
                <p>{step.text}</p>
                <div className="esn-g-cmds">
                  {step.id === 'invite' ? (
                    <a className="button primary esn-g-inline-btn" href={GUARDIAN_ADD_URL} target="_blank" rel="noreferrer">Add Guardian <span>↗</span></a>
                  ) : null}
                  {step.command ? <Command text={step.command} /> : null}
                  {step.extra ? <Command text={step.extra} /> : null}
                  {step.more ? step.more.map((cmd) => <Command key={cmd} text={cmd} />) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section esn-g-section" id="commands">
        <div className="shell">
          <div className="esn-g-head">
            <span className="eyebrow">Command reference</span>
            <h2>Every public command.</h2>
            <p>Search by name or by what you want to do, like "ban", "logs" or "coins".</p>
          </div>
          <input
            className="esn-g-search"
            type="search"
            placeholder={'Search ' + totalCommands + ' commands'}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search Guardian commands"
          />
          <p className="esn-g-count">{query ? shownCount + ' matching' : totalCommands + ' commands in ' + GUARDIAN_COMMAND_GROUPS.length + ' groups'}</p>
          {filtered.length ? filtered.map((group) => (
            <details className="esn-g-group" key={group.key} open={!!query || group.key === 'hub'}>
              <summary><span>{group.label}</span><em>{group.commands.length}</em></summary>
              <ul>
                {group.commands.map(([name, desc]) => (
                  <li key={name}>
                    <Command text={name} />
                    <span className="esn-g-desc">{desc}</span>
                  </li>
                ))}
              </ul>
            </details>
          )) : <p className="esn-g-empty">No commands match "{query}".</p>}
        </div>
      </section>

      <section className="section esn-g-section" id="faq">
        <div className="shell esn-g-faq">
          <div className="esn-g-head">
            <span className="eyebrow">FAQ</span>
            <h2>Common questions.</h2>
          </div>
          {FAQ.map(([q, a]) => (
            <details className="esn-g-faq-item" key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
          <div className="esn-g-cta">
            <p>Ready to protect your server?</p>
            <div className="esn-g-actions">
              <a className="button primary" href={GUARDIAN_ADD_URL} target="_blank" rel="noreferrer">Add Guardian to your server <span>↗</span></a>
              <a className="button secondary" href={GUARDIAN_SUPPORT_URL} target="_blank" rel="noreferrer">Support server <span>↗</span></a>
            </div>
            <p className="esn-g-small"><Link to="/services">Want us to set up your whole server? See Professional Services.</Link></p>
          </div>
        </div>
      </section>
    </main>
  )
}
