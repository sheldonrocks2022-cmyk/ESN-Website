import { Link, useLocation } from 'react-router-dom'
import { TIP_URL } from './servicesCatalog'
import './thanks.css'

// After-payment page (/thanks). Every Stripe Payment Link redirects here:
// /thanks?item=<slug>&type=<service|smp>  (the tip link uses ?item=tip).
const DISCORD_TICKET = 'https://discord.gg/RGPt3zEfGy'

function itemLabel(slug) {
  const clean = String(slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 80)
  if (!clean) return ''
  return clean.split('-').filter(Boolean).map((word) => (
    word === 'esn' || word === 'smp' || word === 'vps' || word === 'xp' ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)
  )).join(' ')
}

function TipButton() {
  return (
    <a className="esn-thanks-tip" href={TIP_URL} target="_blank" rel="noreferrer">
      <span aria-hidden="true">♥</span> Leave a tip — any amount
    </a>
  )
}

export default function ThanksPage() {
  const params = new URLSearchParams(useLocation().search)
  const slug = params.get('item') || ''
  const type = (params.get('type') || '').toLowerCase()
  const isTip = slug === 'tip'
  const label = itemLabel(slug)

  if (isTip) {
    return (
      <main className="esn-thanks-page">
        <section className="shell esn-thanks-card">
          <span className="eyebrow">Payment received</span>
          <h1>Thank you for the tip!</h1>
          <p className="esn-thanks-lead">It really helps keep ESN servers, bots and the SMP running. We appreciate you.</p>
          <div className="esn-thanks-links">
            <Link className="button secondary" to="/storesmp">SMP Store</Link>
            <Link className="button secondary" to="/services">Services</Link>
            <a className="button secondary" href={DISCORD_TICKET} target="_blank" rel="noreferrer">Join our Discord <span>↗</span></a>
          </div>
        </section>
      </main>
    )
  }

  const showService = type !== 'smp'
  const showSmp = type !== 'service'
  return (
    <main className="esn-thanks-page">
      <section className="shell esn-thanks-card">
        <span className="eyebrow">Payment received</span>
        <h1>Thanks for your purchase!</h1>
        {label ? <p className="esn-thanks-item">Your order: <strong>{label}</strong></p> : null}
        <p className="esn-thanks-lead">Stripe has emailed your receipt. Here is what happens next.</p>

        {showService ? (
          <div className="esn-thanks-steps">
            <h2>{showSmp ? 'Services' : 'Next steps'}</h2>
            <ol>
              <li><b>Open a ticket</b> in our Discord.</li>
              <li><b>Paste your receipt</b> (or its receipt number) in the ticket as proof of purchase.</li>
              <li><b>Tell us what you need.</b> We will confirm the details and get started.</li>
            </ol>
            <a className="button primary" href={DISCORD_TICKET} target="_blank" rel="noreferrer">Open a Discord ticket <span>↗</span></a>
          </div>
        ) : null}

        {showSmp ? (
          <div className="esn-thanks-steps">
            <h2>{showService ? 'SMP store items' : 'Next steps'}</h2>
            <ol>
              <li><b>Items are delivered in-game automatically</b> to the Minecraft username you entered at checkout.</li>
              <li><b>Join ESN SMP</b> at <code>play.esnoffical.com</code> (Bedrock port 19132) and they arrive when you are online.</li>
              <li><b>Something missing?</b> Open a Discord ticket and paste your receipt.</li>
            </ol>
            <div className="esn-thanks-links">
              <Link className="button primary" to="/smpconnection">How to join</Link>
              <a className="button secondary" href={DISCORD_TICKET} target="_blank" rel="noreferrer">Open a ticket <span>↗</span></a>
            </div>
          </div>
        ) : null}

        <div className="esn-thanks-tipbox">
          <p>Enjoying ESN? Tips keep everything running.</p>
          <TipButton />
        </div>

        <div className="esn-thanks-links esn-thanks-back">
          <Link to="/storesmp">Back to the SMP Store</Link>
          <Link to="/services">Browse services</Link>
          <Link to="/">Home</Link>
        </div>
      </section>
    </main>
  )
}
