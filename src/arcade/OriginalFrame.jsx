import { useState } from 'react'
import { Link } from 'react-router-dom'

const games=[
  ['ES Clicker','/esclicker'],['ES Factory','/esfactory'],['ES Mines','/esmines'],
  ['ES MOTO','/esmoto'],['ES Tower','/estower'],['ES Tower Defense','/estowerdefense']
]

export default function OriginalFrame({title,subtitle='Browser Arcade',children}){
  const [menu,setMenu]=useState(false)
  const [muted,setMuted]=useState(true)
  return <div className="oa-page">
    <header className="oa-header">
      <Link className="oa-brand" to="/arcade">
        <span className="oa-logo">ES</span>
        <span>ES NETWORK</span>
      </Link>
      <button className="oa-menu-btn" onClick={()=>setMenu(v=>!v)}>MENU <b>☰</b></button>
    </header>
    {menu&&<div className="oa-menu-panel">
      <Link to="/">HOME</Link>
      <Link to="/serviceshowcase">SERVICES</Link>
      <span>ARCADE</span>
      {games.map(([name,route])=><Link key={route} to={route}>{name.toUpperCase()}</Link>)}
      <Link to="/estools">TOOLS</Link>
      <Link to="/smpconnection">SMP</Link>
      <Link to="/about">ABOUT</Link>
    </div>}
    <main className="oa-main">
      <section className="oa-title-card">
        <span className="oa-kicker">ES NETWORK • ARCADE</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </section>
      {children}
    </main>
    <button className="oa-audio" onClick={()=>setMuted(v=>!v)} aria-label={muted?'Unmute game audio':'Mute game audio'}>{muted?'🔇':'🔊'}</button>
  </div>
}
