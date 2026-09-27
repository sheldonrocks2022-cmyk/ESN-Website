import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const DISCORD_URL='https://discord.gg/3gxA66KZ8'
const SMP_HOST='esn.ggwp.cc'

const routeThemes={
  home:['84 154 255','143 249 255'],
  services:['121 92 255','92 214 255'],
  smp:['69 229 157','82 180 255'],
  arcade:['167 93 255','90 220 255'],
  tools:['255 174 82','112 216 255'],
  reviews:['255 207 96','176 108 255'],
  about:['91 160 255','122 240 255'],
}

const quickLinks=[
  ['Services','/serviceshowcase','Creator & gaming services'],
  ['Arcade','/arcade','Six original ESN games'],
  ['ESN SMP','/smpconnection',SMP_HOST],
  ['ES Tools','/estools','Free browser utilities'],
  ['Reviews','/testimonials','35 verified reviews'],
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

  useEffect(()=>{
    const root=document.documentElement
    root.dataset.luxRoute=routeKey
    root.style.setProperty('--route-accent',routeAccent)
    root.style.setProperty('--route-accent-2',routeAccent2)
    return()=>delete root.dataset.luxRoute
  },[routeKey,routeAccent,routeAccent2])

  useEffect(()=>{
    const fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if(!fine||reduce)return
    const selector='.button,.nav-cta,.footer-discord,.premium-command-discord,.text-link,.plugin-download-button'
    const move=e=>{
      const target=e.target.closest?.(selector)
      if(!target)return
      const rect=target.getBoundingClientRect()
      const dx=(e.clientX-(rect.left+rect.width/2))*0.08
      const dy=(e.clientY-(rect.top+rect.height/2))*0.1
      target.style.setProperty('--mag-x',`${Math.max(-7,Math.min(7,dx)).toFixed(2)}px`)
      target.style.setProperty('--mag-y',`${Math.max(-5,Math.min(5,dy)).toFixed(2)}px`)
    }
    const out=e=>{
      const target=e.target.closest?.(selector)
      if(!target||target.contains(e.relatedTarget))return
      target.style.setProperty('--mag-x','0px')
      target.style.setProperty('--mag-y','0px')
    }
    document.addEventListener('pointermove',move,{passive:true})
    document.addEventListener('pointerout',out,{passive:true})
    return()=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerout',out)}
  },[])

  const routeKey=location.pathname.startsWith('/smp')||location.pathname.startsWith('/store')?'smp'
    :location.pathname==='/arcade'||location.pathname.startsWith('/es')?'arcade'
    :location.pathname==='/serviceshowcase'?'services'
    :location.pathname==='/estools'||location.pathname==='/tools'?'tools'
    :location.pathname==='/testimonials'?'reviews'
    :['/about','/leadership','/faq'].includes(location.pathname)?'about':'home'
  const [routeAccent,routeAccent2]=routeThemes[routeKey]
  const routeLabel=routeKey.toUpperCase()
  const filteredLinks=quickLinks.filter(([label,,meta])=>`${label} ${meta}`.toLowerCase().includes(query.trim().toLowerCase()))

  return <>
    <div className="lux-cursor-field" aria-hidden="true"/>
    <div className="lux-cursor-ring" aria-hidden="true"/>
    <div className="lux-cursor-core" aria-hidden="true"/>
    <div className="lux-edge-beam top" aria-hidden="true"/>
    <div className="lux-edge-beam right" aria-hidden="true"/>
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

    <div className="lux-route-rail" aria-hidden="true">
      <span>ESN</span>
      <i/>
      <b>{routeLabel}</b>
      <em>PREMIUM NETWORK</em>
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
