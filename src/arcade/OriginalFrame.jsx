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
    <footer className="oa-footer">
      <h2>ES NETWORK (ESN) • GAMING & CREATOR SERVICES</h2>
      <p>ES Network is the gaming and creator support hub for Fortnite coaching, digital editing, Discord server setups, browser games, tools, and community-first service delivery through Discord tickets.</p>
      <div>
        <Link to="/">ESN Official Hub</Link>
        <Link to="/serviceshowcase">Services</Link>
        <Link to="/arcade">Arcade</Link>
        <Link to="/estools">Tools</Link>
        <Link to="/about">ESN Team & Community</Link>
        <a href="https://discord.gg/3gxA66KZ8" target="_blank" rel="noreferrer">Order & Support on Discord</a>
      </div>
      <small>© {new Date().getFullYear()} ES Network (ESN). All rights reserved.</small>
    </footer>
    <button className="oa-audio" onClick={()=>setMuted(v=>!v)} aria-label={muted?'Unmute game audio':'Mute game audio'}>{muted?'🔇':'🔊'}</button>
  </div>
}
