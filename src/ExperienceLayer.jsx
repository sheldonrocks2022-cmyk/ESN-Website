
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ES3DViewer from './ES3DViewer'
import { SITE_RELEASE, useLiveNetwork } from './liveNetwork'

const gameRoutes=['/esclicker','/esfactory','/esmines','/esmoto','/estower','/estowerdefense']

function routeScene(path){
  if(path.startsWith('/smp')||path.startsWith('/store'))return {key:'smp',label:'SMP PORTAL',glyph:'⬡'}
  if(path==='/arcade'||gameRoutes.includes(path))return {key:'arcade',label:'ARCADE GATE',glyph:'▣'}
  if(path==='/serviceshowcase'||path==='/portfolio')return {key:'services',label:'SERVICE DECK',glyph:'◇'}
  if(path==='/estools'||path==='/tools')return {key:'tools',label:'TOOLS HUD',glyph:'⌁'}
  if(path==='/vault')return {key:'vault',label:'VAULT ACCESS',glyph:'◈'}
  if(path==='/status'||path==='/updates'||path==='/timeline'||path==='/share')return {key:'network',label:'NETWORK CORE',glyph:'◎'}
  return {key:'home',label:'ES NETWORK',glyph:'ES'}
}

export function RouteTransition(){
  const location=useLocation()
  const first=useRef(true)
  const timer=useRef(null)
  const [scene,setScene]=useState(null)

  useEffect(()=>{
    if(first.current){first.current=false;return}
    const next=routeScene(location.pathname)
    clearTimeout(timer.current)
    setScene({...next,id:Date.now()})
    timer.current=window.setTimeout(()=>setScene(null),720)
    return()=>clearTimeout(timer.current)
  },[location.pathname])

  if(!scene)return null
  return <div className={'route-transition route-transition-'+scene.key} aria-hidden="true">
    <div className="route-transition-tunnel">
      <span className="rt-ring r1"/><span className="rt-ring r2"/><span className="rt-ring r3"/><span className="rt-ring r4"/>
    </div>
    <div className="route-transition-core"><strong>{scene.glyph}</strong><span>{scene.label}</span><small>ROUTING EXPERIENCE</small></div>
    <div className="route-transition-slice left"/><div className="route-transition-slice right"/>
  </div>
}

export function EnergyTrail(){
  useEffect(()=>{
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches
    if(reduce)return
    const fine=matchMedia('(hover:hover) and (pointer:fine)').matches
    let last=0
    const spawn=(x,y,burst=false)=>{
      const node=document.createElement('i')
      node.className=burst?'energy-trail-particle touch-burst':'energy-trail-particle'
      node.style.left=x+'px'
      node.style.top=y+'px'
      node.style.setProperty('--drift-x',(((x%17)-8)*1.4)+'px')
      node.style.setProperty('--drift-y',(-18-(y%21))+'px')
      document.body.appendChild(node)
      window.setTimeout(()=>node.remove(),720)
    }
    const move=e=>{
      const now=performance.now()
      if(!fine||now-last<48)return
      last=now
      spawn(e.clientX,e.clientY)
    }
    const down=e=>{
      if(fine)return
      for(let i=0;i<4;i++)window.setTimeout(()=>spawn(e.clientX,e.clientY,true),i*28)
    }
    window.addEventListener('pointermove',move,{passive:true})
    window.addEventListener('pointerdown',down,{passive:true})
    return()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',down)}
  },[])
  return null
}

const visualEvents=[
  {key:'void',title:'VOID SURGE',copy:'A temporary Void-energy wave crossed the ESN visual layer.'},
  {key:'warden',title:'WARDEN PULSE',copy:'The network core registered a Warden resonance pulse.'},
  {key:'arcade',title:'ARCADE OVERLOAD',copy:'Arcade energy briefly spiked across the network.'},
  {key:'rift',title:'RIFT BREACH',copy:'A harmless Riftwalker visual anomaly opened and collapsed.'},
]

export function NetworkEvents(){
  const location=useLocation()
  const [event,setEvent]=useState(null)

  useEffect(()=>{
    if(gameRoutes.includes(location.pathname))return
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches
    if(reduce)return
    let timeout
    const schedule=(first=false)=>{
      const delay=first?45000:90000+Math.floor(Math.random()*90000)
      timeout=window.setTimeout(()=>{
        const next=visualEvents[Math.floor(Math.random()*visualEvents.length)]
        setEvent(next)
        window.setTimeout(()=>setEvent(null),3600)
        schedule(false)
      },delay)
    }
    schedule(true)
    return()=>clearTimeout(timeout)
  },[location.pathname])

  if(!event)return null
  return <div className={'network-event network-event-'+event.key} aria-live="polite">
    <div className="network-event-wave" aria-hidden="true"/>
    <div className="network-event-card"><span>ESN RANDOM NETWORK EVENT</span><strong>{event.title}</strong><p>{event.copy}</p><small>VISUAL EVENT ONLY</small></div>
  </div>
}

export function NotificationCenter(){
  const live=useLiveNetwork()
  const [open,setOpen]=useState(false)
  const location=useLocation()

  useEffect(()=>setOpen(false),[location.pathname])

  const notifications=[
    {
      type:'SMP',
      title:live.smp.status==='online'?'ESN SMP is live':'SMP telemetry update',
      copy:live.smp.telemetry==='live'&&live.smp.players!=null
        ? live.smp.players+'/'+(live.smp.maxPlayers??'—')+' players detected.'
        : 'ESN-confirmed operational. Public player telemetry may be unavailable.',
      to:'/status',
      live:true,
    },
    {
      type:'PLUGIN',
      title:live.plugin.version?live.plugin.version+' detected':'Checking ESNSMP release',
      copy:'The Release Center tracks the latest public ESNSMP GitHub release.',
      to:'/updates',
      live:Boolean(live.plugin.version),
    },
    {type:'WEBSITE',title:'Live Experience active',copy:SITE_RELEASE,to:'/updates',live:true},
    {type:'ARCADE',title:'Six ESN games ready',copy:'Clicker, Factory, Mines, MOTO, Tower, and Tower Defense are available.',to:'/arcade',live:true},
    {type:'SHARE',title:'ESN Share Deck available',copy:'Generate branded cards for the SMP, services, Arcade, releases, and store products.',to:'/share',live:true},
  ]

  return <>
    <button className={open?'notification-orb active':'notification-orb'} type="button" onClick={()=>setOpen(v=>!v)} aria-expanded={open} aria-label="Open ESN notifications">
      <span>⌁</span><b>{notifications.length}</b>
    </button>
    <div className={open?'notification-backdrop open':'notification-backdrop'} onClick={()=>setOpen(false)} aria-hidden={!open}/>
    <aside className={open?'notification-panel open':'notification-panel'} aria-hidden={!open} inert={!open}>
      <div className="notification-head"><div><span>ES NETWORK</span><strong>Notification Center</strong></div><button type="button" onClick={()=>setOpen(false)} aria-label="Close notifications">×</button></div>
      <div className="notification-live-strip"><i/><span>LIVE NETWORK FEED</span><small>Current ESN website data</small></div>
      <div className="notification-list">
        {notifications.map((item,index)=><Link to={item.to} key={item.type}>
          <span className="notification-index">{String(index+1).padStart(2,'0')}</span>
          <div><small>{item.type}</small><strong>{item.title}</strong><p>{item.copy}</p></div>
          <em>{item.live?'●':'○'}</em>
        </Link>)}
      </div>
    </aside>
  </>
}

export function HeroReactor(){
  const [energy,setEnergy]=useState(24)
  const [overdrive,setOverdrive]=useState(false)
  const [burst,setBurst]=useState(0)

  const charge=()=>{
    if(overdrive)return
    const next=Math.min(100,energy+16)
    setEnergy(next)
    setBurst(v=>v+1)
    if(next>=100){
      setOverdrive(true)
      window.dispatchEvent(new CustomEvent('esn-reactor-overdrive'))
      window.setTimeout(()=>{setOverdrive(false);setEnergy(38)},1800)
    }
  }

  return <div className={overdrive?'hero-reactor overdrive':'hero-reactor'}>
    <div className="flagship-core-visual">
      <ES3DViewer variant="hero" label="Interactive 3D ES Network reactor" />
      <div className="reactor-burst" key={burst} aria-hidden="true"/>
      <div className="core-orbit-label label-a">SERVICES</div>
      <div className="core-orbit-label label-b">ARCADE</div>
      <div className="core-orbit-label label-c">SMP</div>
      <div className="core-orbit-label label-d">TOOLS</div>
      <div className="reactor-energy-ring" style={{'--energy':(energy*3.6)+'deg'}} aria-hidden="true"/>
    </div>
    <div className="reactor-console">
      <div><span>CORE ENERGY</span><strong>{energy}%</strong></div>
      <div className="reactor-meter"><i style={{width:energy+'%'}}/></div>
      <button type="button" onClick={charge}>{overdrive?'CORE OVERDRIVE':'CHARGE REACTOR +16'}</button>
    </div>
  </div>
}

export function FooterCommandDeck(){
  const live=useLiveNetwork()
  const location=useLocation()
  const openCommand=()=>window.dispatchEvent(new CustomEvent('esn-open-command'))

  return <div className="footer-command-deck">
    <div className="footer-deck-status">
      <span>ESN COMMAND DECK</span>
      <strong>{location.pathname==='/'?'HOME':location.pathname.replace('/','').toUpperCase()}</strong>
      <small><i/> NETWORK ONLINE</small>
    </div>
    <div className="footer-deck-telemetry">
      <div><span>SMP</span><b>{live.smp.status==='online'?'LIVE':'CHECK'}</b></div>
      <div><span>PLAYERS</span><b>{live.smp.players??'—'}</b></div>
      <div><span>PLUGIN</span><b>{live.plugin.version||'…'}</b></div>
    </div>
    <nav className="footer-deck-actions">
      <Link to="/status">Status</Link>
      <Link to="/share">Share Deck</Link>
      <Link to="/updates">Updates</Link>
      <button type="button" onClick={openCommand}>Command Center</button>
      <button type="button" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>Top ↑</button>
    </nav>
  </div>
}

export default function ExperienceLayer(){
  return <>
    <RouteTransition/>
    <EnergyTrail/>
    <NetworkEvents/>
    <NotificationCenter/>
  </>
}
