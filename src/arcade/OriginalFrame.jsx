import { useEffect, useState } from 'react'
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
  const [playMode,setPlayMode]=useState(false)
  const [fx,setFx]=useState(null)

  useEffect(()=>{
    if(!playMode)return
    document.documentElement.classList.add('oa-focus-play-active')
    if(window.matchMedia('(max-width:760px), (pointer:coarse)').matches)document.documentElement.classList.add('oa-mobile-play-active')
    return()=>{
      document.documentElement.classList.remove('oa-focus-play-active')
      document.documentElement.classList.remove('oa-mobile-play-active')
    }
  },[playMode])

  useEffect(()=>{
    let timer
    const onFx=event=>{
      const type=event.detail?.type||'tap'
      setFx({type,id:event.detail?.at||Date.now()})
      clearTimeout(timer)
      timer=setTimeout(()=>setFx(null),type==='danger'?620:420)
    }
    window.addEventListener('esn-arcade-fx',onFx)
    return()=>{window.removeEventListener('esn-arcade-fx',onFx);clearTimeout(timer)}
  },[])

  return <div className={`oa-page oa-page-${slug} ${playMode?'oa-focus-play-mode oa-mobile-play-mode':''} ${fx?'oa-fx-'+fx.type:''}`}>
    <div className="oa-world-layer" aria-hidden="true">
      <i className="oa-world-glow oa-world-glow-a"/><i className="oa-world-glow oa-world-glow-b"/>
      <i className="oa-world-horizon"/><i className="oa-world-fog"/>
      <div className="oa-world-particles">{Array.from({length:18},(_,i)=><i key={i} style={{'--p':i}}/>)}</div>
    </div>
    {fx&&<div key={fx.id} className={'oa-impact-layer oa-impact-'+fx.type} aria-hidden="true"><i/><b/></div>}
    <div className="oa-game-shell">
      <section className="oa-mobile-focusbar" aria-label="Arcade focus controls">
        <Link to="/arcade" aria-label="Back to Arcade">←</Link>
        <div><span>PLAYING</span><strong>{title}</strong><small>LV {arcade.level} • {Math.floor(arcade.progress.xp||0).toLocaleString()} XP</small></div>
        <label>
          <span>GAME</span>
          <select value={location.pathname} onChange={event=>navigate(event.target.value)} aria-label="Switch Arcade game">
            {games.map(([name,route])=><option value={route} key={route}>{name}</option>)}
          </select>
        </label>
        <button className={playMode?'oa-mobile-play-toggle active':'oa-mobile-play-toggle'} type="button" onClick={()=>setPlayMode(value=>!value)}>{playMode?'EXIT FOCUS':'PLAY'}</button>
      </section>

      <section className="oa-commandbar">
        <div className="oa-command-copy">
          <Link className="oa-back" to="/arcade">← ARCADE HUB</Link>
          <span className="oa-command-divider">/</span>
          <strong>{title}</strong>
        </div>
        <div className="oa-command-actions">
          <div className="oa-command-status"><i/> PC + MOBILE • ENHANCED</div>
          <button className={playMode?'oa-desktop-play-toggle active':'oa-desktop-play-toggle'} type="button" onClick={()=>setPlayMode(value=>!value)}>{playMode?'EXIT FOCUS':'FOCUS PLAY'}</button>
        </div>
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
