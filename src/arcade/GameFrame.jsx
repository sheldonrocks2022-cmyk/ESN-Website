export default function GameFrame({ title, text, profile, children }) {
  return (
    <section className="arcade-shell">
      <div className="shell">
        <div className="arcade-topbar">
          <div>
            <span className="eyebrow">ESN ARCADE 2.0</span>
            <h1>{title}</h1>
            <p>{text}</p>
          </div>
          <div className="arcade-wallet">
            <span><b>{Math.floor(profile.coins).toLocaleString()}</b> ES Coins</span>
            <span>Level <b>{profile.level}</b></span>
          </div>
        </div>
        {children}
      </div>
    </section>
  )
}
