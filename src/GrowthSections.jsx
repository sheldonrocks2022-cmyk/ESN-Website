// Free ESN Nano + Creator Program sections. The free trial section was replaced by Free ESN Nano on Oct 30, 2026.
const PANEL_REGISTER = 'https://panel.esnoffical.com/auth/register'
const FREE_NANO_SPECS = ['256 MB RAM', '25% CPU', '1 GB storage', 'Python or Node.js']

const DISCORD = 'https://discord.gg/RGPt3zEfGy'

const card = { border: '1px solid rgba(139,156,255,.28)', borderRadius: 16, padding: '20px 22px', background: 'rgba(14,19,48,.55)' }
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginTop: 18 }

export function FreeNanoSection() {
  return (
    <section className="section compact-section" id="free-nano">
      <span id="free-trial" aria-hidden="true" />
      <div className="shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FREE ESN NANO</span>
            <h2>Free ESN Nano included with every account — 256 MB bot server, no card, no expiry.</h2>
          </div>
          <p>Create an account and your free bot server is set up automatically. No card, no trial clock, no expiry. Need more power later? Pick any paid plan from $0.50/month.</p>
        </div>
        <div style={grid}>
          <div style={card}>
            <strong style={{ fontSize: 20 }}>ESN Nano · Free</strong>
            <p style={{ margin: '6px 0 14px' }}>{FREE_NANO_SPECS.join(' · ')}</p>
            <a className="button primary" href={PANEL_REGISTER} target="_blank" rel="noreferrer">Create your free account</a>
          </div>
        </div>
        <div className="esn-hosting-payment-safety">
          <strong>How it works</strong>
          <p>Sign up at panel.esnoffical.com. Your free ESN Nano is created on your account automatically, ready for your Discord bot. One free server per person (account, email, or Discord). Questions? Ask in our <a href={DISCORD} target="_blank" rel="noreferrer">Discord</a>.</p>
        </div>
      </div>
    </section>
  )
}

export function CreatorSection() {
  return (
    <section className="section" id="creators">
      <div className="shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CREATOR PROGRAM</span>
            <h2>Make videos about ESN? Get your own code.</h2>
          </div>
          <p>YouTubers, streamers, and TikTokers can apply for a personal ESN creator code. ESN staff review every application.</p>
        </div>
        <div style={grid}>
          <div style={card}>
            <strong>Your viewers save 15%</strong>
            <p>Your code (CREATOR-YOURNAME) gives a new customer 15% off their first ESN purchase.</p>
          </div>
          <div style={card}>
            <strong>You earn 20% of the first month</strong>
            <p>For every purchase made with your code, you earn 20% of that customer's first month. ESN pays creators manually.</p>
          </div>
          <div style={card}>
            <strong>How to apply</strong>
            <p>Join the ESN Discord and run <code>/creator apply</code>. If you're approved, the bot DMs you your code; <code>/creator me</code> shows your sales.</p>
          </div>
        </div>
        <div className="esn-hosting-payment-safety">
          <strong>Keep it honest</strong>
          <p>No fake reviews, made-up stats, or spam. Tell your viewers the code supports you.</p>
        </div>
        <a className="button primary" href={DISCORD} target="_blank" rel="noreferrer">Apply in the ESN Discord <span>→</span></a>
      </div>
    </section>
  )
}
