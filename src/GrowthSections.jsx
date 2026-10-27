// Free 3-day trial + Creator Program sections (added Oct 27, 2026).
// Trial links are Stripe Payment Links with a 3-day trial: $0 today, card required, then the normal monthly price.
const TRIAL_PLANS = [
  { name: 'Nano', ram: '256 MB', price: '$0.50', url: 'https://buy.stripe.com/8x214o9FN8InbVtg4DdnW1i' },
  { name: 'Starter', ram: '512 MB', price: '$0.75', url: 'https://buy.stripe.com/14AbJ205dcYD8JhaKjdnW1j' },
  { name: 'Basic', ram: '1 GB', price: '$0.99', url: 'https://buy.stripe.com/3cIaEY5px8In7Fd3hRdnW1k' },
]

const DISCORD = 'https://discord.gg/RGPt3zEfGy'
const BILLING_PORTAL = 'https://billing.stripe.com/p/login/4gM14o5pxgaP9Nl2dNdnW00'

const card = { border: '1px solid rgba(139,156,255,.28)', borderRadius: 16, padding: '20px 22px', background: 'rgba(14,19,48,.55)' }
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginTop: 18 }

export function FreeTrialSection() {
  return (
    <section className="section compact-section" id="free-trial">
      <div className="shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FREE 3-DAY TRIAL</span>
            <h2>Try bot hosting free for 3 days.</h2>
          </div>
          <p>Start a Nano, Starter, or Basic bot server for $0 today. Stripe asks for a card; you are only charged the normal monthly price if you keep the server after 3 days. Cancel before then and you pay nothing.</p>
        </div>
        <div style={grid}>
          {TRIAL_PLANS.map((plan) => (
            <div key={plan.name} style={card}>
              <strong style={{ fontSize: 20 }}>ESN {plan.name}</strong>
              <p style={{ margin: '6px 0 14px' }}>{plan.ram} RAM · 3 days free, then {plan.price}/month</p>
              <a className="button primary" href={plan.url} target="_blank" rel="noreferrer">Start free 3-day trial</a>
            </div>
          ))}
        </div>
        <div className="esn-hosting-payment-safety">
          <strong>How the trial works</strong>
          <p>Check out with the same email as your panel.esnoffical.com account (or create one with that email). Your server is set up automatically within minutes. One free trial per person (Discord account, email, or card). Cancel any time in the <a href={BILLING_PORTAL} target="_blank" rel="noreferrer">billing portal</a>. In our Discord, the ESN HELPER bot's <code>/freetrial</code> command links the trial to your account for you.</p>
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
