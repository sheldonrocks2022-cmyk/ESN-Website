
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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
  if(['/status','/updates','/timeline','/share','/nexus','/notifications','/rewards','/challenges','/staff','/networkstats','/whatsnew','/explore','/gallery','/settings','/support','/operations','/incidents','/changelog','/diagnostics','/smpcheck','/blueprint','/session','/store-ai','/hosting','/domains','/site-builder'].includes(path))return {key:'network',label:'NETWORK CORE',glyph:'◎'}
  return {key:'home',label:'ES NETWORK',glyph:'ES'}
}

export function RouteTransition(){
  const location=useLocation()
  const first=useRef(true)
  const timer=useRef(null)
  const [scene,setScene]=useState(null)

  useLayoutEffect(()=>{
    if(first.current){first.current=false;return}
    const next=routeScene(location.pathname)
    const mobile=window.matchMedia('(max-width: 860px), (pointer: coarse)').matches
    clearTimeout(timer.current)
    setScene({...next,id:location.pathname})
    timer.current=window.setTimeout(()=>setScene(null),mobile?5000:560)
    return()=>clearTimeout(timer.current)
  },[location.pathname])

  useEffect(()=>{
    if(!scene)return
    const mobile=window.matchMedia('(max-width: 860px), (pointer: coarse)').matches
    if(!mobile)return

    const root=document.documentElement
    const body=document.body
    const previous={
      rootOverflow:root.style.overflow,
      rootOverscroll:root.style.overscrollBehavior,
      bodyOverflow:body.style.overflow,
      bodyOverscroll:body.style.overscrollBehavior,
      bodyTouchAction:body.style.touchAction,
    }

    root.classList.add('route-transition-locked')
    root.style.overflow='hidden'
    root.style.overscrollBehavior='none'
    body.style.overflow='hidden'
    body.style.overscrollBehavior='none'
    body.style.touchAction='none'

    const block=event=>event.preventDefault()
    window.addEventListener('touchmove',block,{passive:false})
    window.addEventListener('wheel',block,{passive:false})

    return()=>{
      window.removeEventListener('touchmove',block)
      window.removeEventListener('wheel',block)
      root.classList.remove('route-transition-locked')
      root.style.overflow=previous.rootOverflow
      root.style.overscrollBehavior=previous.rootOverscroll
      body.style.overflow=previous.bodyOverflow
      body.style.overscrollBehavior=previous.bodyOverscroll
      body.style.touchAction=previous.bodyTouchAction
    }
  },[scene])

  if(!scene)return null
  return <div className={'route-transition route-transition-'+scene.key} aria-hidden="true">
    <div className="route-transition-tunnel">
      <span className="rt-ring r1"/><span className="rt-ring r2"/><span className="rt-ring r3"/>
    </div>
    <div className="route-transition-core"><strong>{scene.glyph}</strong><span>{scene.label}</span></div>
    <div className="route-transition-scan" aria-hidden="true"/>
  </div>
}

export function EnergyTrail(){
  useEffect(()=>{
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine=matchMedia('(hover:hover) and (pointer:fine)').matches
    if(reduce)return

    let last=0
    let activeTouchBursts=0

    const spawn=(x,y,burst=false,angle=0)=>{
      const node=document.createElement('i')
      node.className=burst?'energy-trail-particle touch-burst':'energy-trail-particle'
      node.style.left=x+'px'
      node.style.top=y+'px'
      node.style.setProperty('--drift-x',burst?(Math.cos(angle)*28)+'px':(((x%17)-8)*1.4)+'px')
      node.style.setProperty('--drift-y',burst?(Math.sin(angle)*28)+'px':(-18-(y%21))+'px')
      document.body.appendChild(node)
      window.setTimeout(()=>node.remove(),burst?640:720)
    }

    const move=event=>{
      if(!fine)return
      const now=performance.now()
      if(now-last<48)return
      last=now
      spawn(event.clientX,event.clientY)
    }

    const touch=event=>{
      if(fine||event.pointerType==='mouse')return
      if(document.documentElement.dataset.motion==='reduced')return
      if(activeTouchBursts>=2)return
      activeTouchBursts+=1

      const ring=document.createElement('i')
      ring.className='touch-energy-ring'
      ring.style.left=event.clientX+'px'
      ring.style.top=event.clientY+'px'
      document.body.appendChild(ring)

      for(let index=0;index<6;index+=1){
        spawn(event.clientX,event.clientY,true,(Math.PI*2*index)/6)
      }

      window.setTimeout(()=>{
        ring.remove()
        activeTouchBursts=Math.max(0,activeTouchBursts-1)
      },660)
    }

    if(fine)window.addEventListener('pointermove',move,{passive:true})
    else window.addEventListener('pointerdown',touch,{passive:true})

    return()=>{
      window.removeEventListener('pointermove',move)
      window.removeEventListener('pointerdown',touch)
    }
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
    const mobile=matchMedia('(max-width: 860px), (pointer: coarse)').matches
    if(reduce||mobile)return
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

  useEffect(()=>{
    const openNotifications=()=>setOpen(true)
    window.addEventListener('esn-open-notifications',openNotifications)
    return()=>window.removeEventListener('esn-open-notifications',openNotifications)
  },[])

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
      <Link className="core-orbit-label label-a" to="/serviceshowcase">SERVICES</Link>
      <Link className="core-orbit-label label-b" to="/arcade">ARCADE</Link>
      <Link className="core-orbit-label label-c" to="/smpconnection">SMP</Link>
      <Link className="core-orbit-label label-d" to="/estools">TOOLS</Link>
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
