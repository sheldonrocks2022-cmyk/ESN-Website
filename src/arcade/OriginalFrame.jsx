import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useArcadeProgress } from './shared'

const games=[
  ['ES Clicker','/esclicker'],['ES Factory','/esfactory'],['ES Mines','/esmines'],
  ['ES MOTO','/esmoto'],['ES Tower','/estower'],['ES Tower Defense','/estowerdefense']
]

export default function OriginalFrame({title,subtitle='Browser Arcade',children}){
  const location=useLocation()
  const navigate=useNavigate()

  const slug=location.pathname.replace('/','') || 'arcade'
  const arcade=useArcadeProgress()

  return <div className={`oa-page oa-page-${slug}`}>
    <div className="oa-game-shell">
      <section className="oa-mobile-focusbar" aria-label="Mobile Arcade controls">
        <Link to="/arcade" aria-label="Back to Arcade">←</Link>
        <div><span>PLAYING</span><strong>{title}</strong><small>LV {arcade.level} • {Math.floor(arcade.progress.xp||0).toLocaleString()} XP</small></div>
        <label>
          <span>GAME</span>
          <select value={location.pathname} onChange={event=>navigate(event.target.value)} aria-label="Switch Arcade game">
            {games.map(([name,route])=><option value={route} key={route}>{name}</option>)}
          </select>
        </label>
      </section>

      <section className="oa-commandbar">
        <div className="oa-command-copy">
          <Link className="oa-back" to="/arcade">← ARCADE HUB</Link>
          <span className="oa-command-divider">/</span>
          <strong>{title}</strong>
        </div>
        <div className="oa-command-status"><i/> ORIGINAL ESN GAME • ENHANCED</div>
      </section>

      <nav className="oa-game-switcher" aria-label="Arcade game switcher">
        {games.map(([name,route],index)=>(
          <Link key={route} className={location.pathname===route?'active':''} to={route}>
            <span>{String(index+1).padStart(2,'0')}</span>{name}
          </Link>
        ))}
      </nav>

      <section className="oa-title-card">
        <span className="oa-kicker">ES NETWORK • ARCADE</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </section>

      <section className="oa-arcade-rank" aria-label="ESN Arcade progression">
        <div className="oa-rank-copy">
          <span>ARCADE LEVEL</span>
          <strong>{arcade.level}</strong>
          <small>{Math.floor(arcade.progress.xp||0).toLocaleString()} XP • {arcade.achievementCount} achievements</small>
        </div>
        <div className="oa-rank-meter" aria-hidden="true"><i style={{width:(arcade.levelProgress*100)+'%'}}/></div>
        <div className="oa-rank-recent">
          <span>RECENT XP</span>
          <b>{arcade.progress.recent?.[0]?.label||'Play any ESN game to begin progression'}</b>
        </div>
      </section>

      <div className="oa-game-viewport">
        {children}
      </div>

      <section className="oa-endcap">
        <div>
          <span className="oa-kicker">ESN ARCADE</span>
          <h2>One network. Six original games.</h2>
          <p>Your game stays inside the same ES Network experience — navigation, community, services, tools, SMP, and support remain one tap away.</p>
        </div>
        <Link className="button secondary" to="/arcade">Back to Arcade Hub</Link>
      </section>
    </div>
  </div>
}
