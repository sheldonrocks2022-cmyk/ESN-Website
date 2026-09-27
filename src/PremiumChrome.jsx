import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const DISCORD_URL='https://discord.gg/3gxA66KZ8'
const SMP_HOST='esn.ggwp.cc'

const quickLinks=[
  ['Services','/serviceshowcase','Creator & gaming services'],
  ['Arcade','/arcade','Six original ESN games'],
  ['ESN SMP','/smpconnection',SMP_HOST],
  ['ES Tools','/estools','Free browser utilities'],
  ['Reviews','/testimonials','35 verified reviews'],
  ['Account','/account','Your ESN member identity'],
]

export default function PremiumChrome(){
  const location=useLocation()
  const [open,setOpen]=useState(false)
  const [showTop,setShowTop]=useState(false)
  const [query,setQuery]=useState('')

  useEffect(()=>{
    setOpen(false)
    setQuery('')
    document.documentElement.classList.remove('premium-command-open')
  },[location.pathname])

  useEffect(()=>{
    const key=(e)=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
        e.preventDefault()
        setOpen(v=>!v)
      }
      if(e.key==='Escape')setOpen(false)
    }
    const scroll=()=>setShowTop(window.scrollY>700)
    window.addEventListener('keydown',key)
    window.addEventListener('scroll',scroll,{passive:true})
    scroll()
    return()=>{window.removeEventListener('keydown',key);window.removeEventListener('scroll',scroll)}
  },[])

  useEffect(()=>{
    document.documentElement.classList.toggle('premium-command-open',open)
    return()=>document.documentElement.classList.remove('premium-command-open')
  },[open])

  const filteredLinks=quickLinks.filter(([label,,meta])=>`${label} ${meta}`.toLowerCase().includes(query.trim().toLowerCase()))

  return <>
    <div className="lux-cursor-field" aria-hidden="true"/>
    <div className="premium-ambient" aria-hidden="true">
      <span className="premium-aurora a"/>
      <span className="premium-aurora b"/>
      <span className="premium-aurora c"/>
      <span className="premium-grain"/>
      <span className="premium-vignette"/>
    </div>

    <div key={location.pathname} className="route-lux-flare" aria-hidden="true"/>

    <div className="premium-ticker" aria-label="ES Network highlights">
      <div className="premium-ticker-track">
        {[0,1].map(copy=><div className="premium-ticker-segment" key={copy}>
          <span><i/> ESN SYSTEMS ONLINE</span>
          <span>35 VERIFIED REVIEWS</span>
          <span>6 ORIGINAL ARCADE GAMES</span>
          <span>{SMP_HOST}</span>
          <span>PUBLIC ESNSMP PLUGIN</span>
          <span>FREE ES TOOLS</span>
        </div>)}
      </div>
    </div>

    <div className="premium-dock" aria-label="ESN quick actions">
      <button className={open?'premium-orb active':'premium-orb'} type="button" onClick={()=>setOpen(v=>!v)} aria-expanded={open} aria-label="Open ESN command center">
        <span>ES</span><i/>
      </button>
      <div className="premium-dock-label">QUICK ACCESS</div>
      {showTop&&<button className="premium-top-button" type="button" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} aria-label="Back to top">↑</button>}
    </div>

    <div className={open?'premium-command-backdrop open':'premium-command-backdrop'} onClick={()=>setOpen(false)} aria-hidden={!open}/>

    <aside className={open?'premium-command open':'premium-command'} aria-hidden={!open} inert={!open}>
      <div className="premium-command-head">
        <div>
          <span>ES NETWORK</span>
          <strong>Command Center</strong>
        </div>
        <button type="button" onClick={()=>setOpen(false)} aria-label="Close command center">×</button>
      </div>

      <div className="premium-command-status">
        <div><i/><span>NETWORK</span><b>ONLINE</b></div>
        <div><span>CURRENT</span><b>{location.pathname==='/'?'HOME':location.pathname.replace('/','').toUpperCase()}</b></div>
      </div>

      <label className="premium-command-search">
        <span>SEARCH ESN</span>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Services, Arcade, SMP, Tools…" />
      </label>

      <nav className="premium-command-links">
        {filteredLinks.map(([label,to,meta],index)=><Link key={to} to={to} className={location.pathname===to?'active':''}>
          <span className="premium-command-index">{String(index+1).padStart(2,'0')}</span>
          <span><b>{label}</b><small>{meta}</small></span>
          <em>↗</em>
        </Link>)}
        {!filteredLinks.length&&<div className="premium-command-empty">No quick destination matches that search.</div>}
      </nav>

      <a className="premium-command-discord" href={DISCORD_URL} target="_blank" rel="noreferrer">
        <span><b>Join ESN Discord</b><small>Community • support • ordering</small></span><em>↗</em>
      </a>

      <div className="premium-command-hint"><span>CTRL / CMD + K</span><span>TOGGLE COMMAND CENTER</span></div>
    </aside>
  </>
}
