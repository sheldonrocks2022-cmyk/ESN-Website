import { HOSTING_BUNDLES, BOT_MC_BUNDLES } from './hostingBundles'

// Bundles are bought through the ESN checkout on the panel: it checks node room, asks which server types you want, then opens Stripe.
const BUNDLE_CHECKOUT = 'https://panel.esnoffical.com/plans'

// Hosting bundles: monthly and yearly prices, bought through the ESN panel checkout.
export default function HostingBundles({ id = 'bundles', compact = false }) {
  return (
    <section className={'section x-bundles' + (compact ? ' is-compact' : '')} id={id} aria-labelledby={id + '-title'}>
      <div className="shell">
        <div className="x-head">
          <span className="eyebrow">Hosting bundles</span>
          <h2 id={id + '-title'}>Bundle your servers and pay less.</h2>
          <p>Two or more servers in one checkout, for less than buying them one by one. Checkout runs on the ESN panel: pick your server types, pay, and your servers are set up automatically. If our nodes are full it says Sold out before you pay.</p>
        </div>
        <div className="x-bundle-grid">
          {HOSTING_BUNDLES.map((bundle) => (
            <article className="x-card x-bundle" key={bundle.name}>
              <h3>{bundle.name}</h3>
              <p className="x-bundle-detail">{bundle.detail}</p>
              <p className="x-price"><strong>${bundle.monthly}</strong><span>/month</span><s aria-label={'$' + bundle.separate + ' if bought separately'}>${bundle.separate}</s></p>
              {bundle.setup && <p className="x-note">+ ${bundle.setup} one-time Discord server setup</p>}
              <ul className="x-list">{bundle.includes.filter((item) => !item.startsWith('+')).map((item, index) => <li key={item + index}>{item}</li>)}</ul>
              <div className="x-buy-row">
                <a className="button primary" href={BUNDLE_CHECKOUT} aria-label={'Buy bundle: ' + bundle.name + ', $' + bundle.monthly + ' per month or $' + bundle.yearly + ' per year, on the ESN panel'}>Buy bundle <span aria-hidden="true">→</span></a>
                <span className="x-note">${bundle.monthly}/mo or ${bundle.yearly}/yr</span>
              </div>
            </article>
          ))}
        </div>
        <div className="x-subhead">
          <h3>Bot + Minecraft bundles</h3>
          <span className="x-pill">Save up to 13%</span>
        </div>
        <div className="x-bundle-grid is-small">
          {BOT_MC_BUNDLES.map((bundle) => (
            <article className="x-card x-bundle" key={bundle.name}>
              <h3>{bundle.name}</h3>
              <p className="x-price"><strong>${bundle.monthly}</strong><span>/month</span><s aria-label={'$' + bundle.separate + ' if bought separately'}>${bundle.separate}</s></p>
              <p className="x-note">Save {bundle.saving} vs buying both</p>
              <div className="x-buy-row">
                <a className="button primary" href={BUNDLE_CHECKOUT} aria-label={'Get bundle $' + bundle.monthly + '/mo: ' + bundle.name + ', on the ESN panel'}>Get bundle ${bundle.monthly}/mo</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
