import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { DISCORD_URL, SMP_ADDRESS, SMP_PORT, useLiveNetwork } from './liveNetwork'

const HUB_ROUTES=['/serviceshowcase','/arcade','/smpconnection','/estools']
const GAME_ROUTES=['/esclicker','/esfactory','/esmines','/esmoto','/estower','/estowerdefense']

const EGG_DEFS=[
  ['core-overdrive','Core Overdrive','Charge the ESN reactor to 100%.'],
  ['brand-five','Five-Fold Signal','Tap the ESN brand five times quickly.'],
  ['hero-version','2026 Handshake','Tap the ES NETWORK // 2026 label four times.'],
  ['footer-signal','Footer Frequency','Tap the footer online signal three times.'],
  ['map-core','Network Heartbeat','Tap the center of the Network Map five times.'],
  ['core-hold','Core Lock','Press and hold the Network Map core.'],
  ['command-triple','Command Addict','Open the Command Center three times.'],
  ['notifications-triple','Signal Watcher','Open notifications three times.'],
  ['leadership-triple','Founder Frequency','Tap the Founder & CEO spotlight three times.'],
  ['page-mark-double','Double Authorization','Double-tap a page hero ES mark.'],
  ['bottom','Deep Network','Reach the very bottom of an ESN page.'],
  ['all-hubs','Full Network Tour','Visit Services, Arcade, SMP, and ES Tools in one session.'],
  ['arcade-tour','Arcade Pathfinder','Visit all six ESN Arcade games in one session.'],
  ['vault-entry','Vault Witness','Enter the ESN Vault after unlocking it.'],
  ['typed-kavero','Kavero Protocol','A hidden alias opens this signal.'],
  ['typed-esnetwork','Network Name','Type the current brand name without spaces.'],
  ['typed-ggwp','GGWP','The SMP address contains a clue.'],
  ['typed-warden','Warden Wake','A powerful SMP guardian leaves a signal.'],
  ['typed-riftwalker','Riftwalker Trace','A store bundle name hides a path.'],
  ['typed-void','Into the Void','Four letters. One hidden state.'],
  ['typed-buildplaycreate','Motto Complete','Type the three-word ESN motto without spaces.'],
  ['typed-founder','Founder Channel','A leadership word opens this channel.'],
  ['typed-network','Network Echo','Type what ESN is built to be.'],
  ['typed-1337','Legacy Mode','Classic digits still work here.'],
]

const TYPED_EGGS={
  kavero:'typed-kavero',
  esnetwork:'typed-esnetwork',
  ggwp:'typed-ggwp',
  warden:'typed-warden',
  riftwalker:'typed-riftwalker',
  void:'typed-void',
  buildplaycreate:'typed-buildplaycreate',
  founder:'typed-founder',
  network:'typed-network',
  '1337':'typed-1337',
}

function statusLabel(value){
  return ['online','operational','available','configured'].includes(value)?'LIVE':value==='checking'?'CHECKING':'STATUS'
}

function Counter({value,label,prefix='',suffix=''}) {
  const ref=useRef(null)
  const [shown,setShown]=useState(0)

  useEffect(()=>{
    const node=ref.current
    if(!node)return
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches
    if(reduce){setShown(value);return}
    let frame
    const observer=new IntersectionObserver(([entry])=>{
      if(!entry.isIntersecting)return
      observer.disconnect()
      const start=performance.now()
      const run=(now)=>{
        const progress=Math.min(1,(now-start)/1100)
        const eased=1-Math.pow(1-progress,3)
        setShown(Math.round(value*eased))
        if(progress<1)frame=requestAnimationFrame(run)
      }
      frame=requestAnimationFrame(run)
    },{threshold:.45})
    observer.observe(node)
    return()=>{observer.disconnect();cancelAnimationFrame(frame)}
  },[value])

  return <div className="achievement-counter" ref={ref}>
    <span>{prefix}{shown}{suffix}</span>
    <small>{label}</small>
  </div>
}

function NetworkMap({live}) {
  const nodes=[
    {key:'services',label:'SERVICES',meta:'Creator + gaming',to:'/serviceshowcase',status:'LIVE',x:15,y:24},
    {key:'smp',label:'ESN SMP',meta:live.smp.players!=null?`${live.smp.players} online`:'Owner-confirmed live',to:'/smpconnection',status:statusLabel(live.smp.status),x:82,y:21},
    {key:'arcade',label:'ARCADE',meta:'6 original games',to:'/arcade',status:'LIVE',x:87,y:73},
    {key:'tools',label:'ES TOOLS',meta:'Free utilities',to:'/estools',status:'LIVE',x:14,y:76},
    {key:'discord',label:'DISCORD',meta:live.discord.onlineMembers!=null?`${live.discord.onlineMembers} online`:'Community hub',href:DISCORD_URL,status:statusLabel(live.discord.status),x:50,y:89},
  ]

  return <div className="network-map" aria-label="Interactive ES Network map">
    <div className="network-map-grid" aria-hidden="true"/>
    <svg className="network-map-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {nodes.map(node=><line key={node.key} x1="50" y1="48" x2={node.x} y2={node.y}/>)}
      <circle cx="50" cy="48" r="22"/>
      <circle cx="50" cy="48" r="34"/>
    </svg>
    <button className="network-map-core" type="button" data-easter="map-core" aria-label="ES Network core">
      <span>ES</span><strong>QUICK LINKS</strong><small>INTERACTIVE</small>
    </button>
    {nodes.map(node=>{
      const body=<><span className="network-node-dot"/><strong>{node.label}</strong><small>{node.meta}</small><em>{node.status}</em></>
      return node.href
        ? <a className={`network-node node-${node.key}`} style={{'--node-x':node.x+'%','--node-y':node.y+'%'}} href={node.href} target="_blank" rel="noreferrer" key={node.key}>{body}</a>
        : <Link className={`network-node node-${node.key}`} style={{'--node-x':node.x+'%','--node-y':node.y+'%'}} to={node.to} key={node.key}>{body}</Link>
    })}
    <div className="network-map-caption"><span>EXPLORE ESN</span><b>{SMP_ADDRESS}:{SMP_PORT}</b></div>
  </div>
}

function ActivityFeed({live}) {
  const checked=live.checkedAt?new Date(live.checkedAt).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):'LIVE'
  const items=[
    {type:'SMP',title:live.smp.status==='online'?'ESN SMP operational':'SMP telemetry checking',detail:live.smp.players!=null?`${live.smp.players}/${live.smp.maxPlayers??'—'} players detected`:'Public player telemetry may be unavailable',state:statusLabel(live.smp.status)},
    {type:'PLUGIN',title:live.plugin.version||'Latest ESNSMP release',detail:'Public release channel connected',state:statusLabel(live.plugin.status)},
    {type:'WEB',title:'ESN website',detail:'Website and browser tools',state:'LIVE'},
    {type:'ARCADE',title:'Six original games ready',detail:'Shared ES Coin ecosystem',state:'LIVE'},
    {type:'DISCORD',title:'ESN Discord',detail:live.discord.members!=null?`${live.discord.members.toLocaleString()} approximate members`:'Official invite configured',state:statusLabel(live.discord.status)},
  ]

  return <aside className="activity-feed">
    <div className="activity-feed-head">
      <div><span>LATEST CHECK</span><h3>Project and server status</h3></div>
      <small>LAST CHECK {checked}</small>
    </div>
    <div className="activity-feed-list">
      {items.map((item,index)=><div className="activity-card" key={item.type}>
        <span className="activity-index">{String(index+1).padStart(2,'0')}</span>
        <i/>
        <div><small>{item.type}</small><strong>{item.title}</strong><p>{item.detail}</p></div>
        <em>{item.state}</em>
      </div>)}
    </div>
    <Link className="activity-feed-link" to="/status">See detailed status <span>↗</span></Link>
  </aside>
}

export default function NetworkShowcase(){
  const live=useLiveNetwork()
  return <section className="section network-showcase-section">
    <div className="shell">
      <div className="section-heading flagship-heading">
        <div><span className="eyebrow">LIVE NETWORK MAP</span><h2>See what's running across ESN.</h2><p>Check the SMP, see our latest plugin release, or jump into a part of ESN.</p></div>
        <Link className="text-link" to="/status">Network Status →</Link>
      </div>

      <div className="network-showcase-grid">
        <NetworkMap live={live}/>
        <ActivityFeed live={live}/>
      </div>

      <div className="achievement-strip" aria-label="ES Network verified counts">
        <Counter value={35} label="Verified Reviews"/>
        <Counter value={6} label="Original Arcade Games"/>
        <Counter value={5} label="SMP Store Products"/>
        <Counter value={9} label="Leadership + Admin Listings"/>
      </div>
    </div>
  </section>
}

function readFound(){
  try{return JSON.parse(localStorage.getItem('esn_easter_eggs')||'[]')}catch{return []}
}

export function EasterEggLayer(){
  const location=useLocation()
  const [found,setFound]=useState(readFound)
  const [toast,setToast]=useState(null)
  const foundRef=useRef(new Set(found))
  const tapRef=useRef({})
  const typedRef=useRef('')
  const holdRef=useRef(null)
  const routeRef=useRef(new Set(JSON.parse(sessionStorage.getItem('esn_routes_seen')||'[]')))

  const defs=useMemo(()=>Object.fromEntries(EGG_DEFS.map(item=>[item[0],{id:item[0],name:item[1],hint:item[2]}])),[])

  const unlock=(id)=>{
    if(!defs[id]||foundRef.current.has(id))return
    foundRef.current.add(id)
    const next=[...foundRef.current]
    localStorage.setItem('esn_easter_eggs',JSON.stringify(next))
    setFound(next)
    setToast(defs[id])
    document.documentElement.classList.add('egg-signal-active')
    window.dispatchEvent(new CustomEvent('esn-egg-unlocked',{detail:{id,count:next.length,total:EGG_DEFS.length}}))
    window.setTimeout(()=>document.documentElement.classList.remove('egg-signal-active'),1900)
    window.setTimeout(()=>setToast(null),3600)
  }

  useEffect(()=>{
    const overdrive=()=>unlock('core-overdrive')
    window.addEventListener('esn-reactor-overdrive',overdrive)
    return()=>window.removeEventListener('esn-reactor-overdrive',overdrive)
  })

  useEffect(()=>{
    const seen=routeRef.current
    seen.add(location.pathname)
    sessionStorage.setItem('esn_routes_seen',JSON.stringify([...seen]))
    if(HUB_ROUTES.every(route=>seen.has(route)))unlock('all-hubs')
    if(GAME_ROUTES.every(route=>seen.has(route)))unlock('arcade-tour')
    if(location.pathname==='/vault'&&localStorage.getItem('esn_vault_unlocked')==='1')unlock('vault-entry')
  },[location.pathname])

  useEffect(()=>{
    const targetCount={brand:5,'hero-version':4,'footer-signal':3,'map-core':5,leadership:3,'page-mark':2}
    const targetEgg={brand:'brand-five','hero-version':'hero-version','footer-signal':'footer-signal','map-core':'map-core',leadership:'leadership-triple','page-mark':'page-mark-double'}

    const click=(event)=>{
      const easter=event.target.closest?.('[data-easter]')?.dataset.easter
      if(easter&&targetCount[easter]){
        const current=tapRef.current[easter]||{count:0,timer:null}
        current.count+=1
        clearTimeout(current.timer)
        if(current.count>=targetCount[easter]){unlock(targetEgg[easter]);current.count=0}
        current.timer=window.setTimeout(()=>{current.count=0},2600)
        tapRef.current[easter]=current
      }
      if(event.target.closest?.('.premium-orb')){
        const current=tapRef.current.command||{count:0,timer:null}
        current.count+=1
        clearTimeout(current.timer)
        if(current.count>=3){unlock('command-triple');current.count=0}
        current.timer=window.setTimeout(()=>{current.count=0},3200)
        tapRef.current.command=current
      }
      if(event.target.closest?.('.notification-orb')){
        const current=tapRef.current.notify||{count:0,timer:null}
        current.count+=1
        clearTimeout(current.timer)
        if(current.count>=3){unlock('notifications-triple');current.count=0}
        current.timer=window.setTimeout(()=>{current.count=0},3200)
        tapRef.current.notify=current
      }
    }

    const key=(event)=>{
      const el=event.target
      if(el?.matches?.('input,textarea,select,[contenteditable="true"]'))return
      if(event.key.length!==1)return
      typedRef.current=(typedRef.current+event.key.toLowerCase()).replace(/[^a-z0-9]/g,'').slice(-40)
      for(const [sequence,id] of Object.entries(TYPED_EGGS)){
        if(typedRef.current.endsWith(sequence))unlock(id)
      }
    }

    const scroll=()=>{
      const remaining=document.documentElement.scrollHeight-(window.scrollY+window.innerHeight)
      if(remaining<18&&document.documentElement.scrollHeight>window.innerHeight*1.5)unlock('bottom')
    }

    const pointerDown=(event)=>{
      if(!event.target.closest?.('[data-easter="map-core"]'))return
      clearTimeout(holdRef.current)
      holdRef.current=window.setTimeout(()=>unlock('core-hold'),1350)
    }
    const clearHold=()=>clearTimeout(holdRef.current)

    document.addEventListener('click',click)
    window.addEventListener('keydown',key)
    window.addEventListener('scroll',scroll,{passive:true})
    document.addEventListener('pointerdown',pointerDown,{passive:true})
    document.addEventListener('pointerup',clearHold,{passive:true})
    document.addEventListener('pointercancel',clearHold,{passive:true})
    return()=>{
      document.removeEventListener('click',click)
      window.removeEventListener('keydown',key)
      window.removeEventListener('scroll',scroll)
      document.removeEventListener('pointerdown',pointerDown)
      document.removeEventListener('pointerup',clearHold)
      document.removeEventListener('pointercancel',clearHold)
      clearTimeout(holdRef.current)
    }
  })

  const unlocked=localStorage.getItem('esn_vault_unlocked')==='1'
  return <>
    <div className="esn-global-grid" aria-hidden="true"/>
    {toast&&<div className="easter-toast" role="status">
      <span>SECRET SIGNAL FOUND</span>
      <strong>{toast.name}</strong>
      <small>{found.length} / {EGG_DEFS.length} discovered</small>
    </div>}

    {location.pathname==='/vault'&&unlocked&&<section className="egg-vault-panel">
      <div className="shell">
        <div className="egg-vault-head">
          <div><span className="eyebrow">HIDDEN SIGNAL ARCHIVE</span><h2>{found.length} / {EGG_DEFS.length} Easter eggs discovered.</h2></div>
          <strong>{Math.round((found.length/EGG_DEFS.length)*100)}%</strong>
        </div>
        <div className="egg-progress"><i style={{width:`${(found.length/EGG_DEFS.length)*100}%`}}/></div>
        <div className="egg-grid">
          {EGG_DEFS.map(([id,name,hint],index)=>{
            const has=found.includes(id)
            return <article className={has?'egg-card found':'egg-card'} key={id}>
              <span>{String(index+1).padStart(2,'0')}</span>
              <strong>{has?name:'ENCRYPTED SIGNAL'}</strong>
              <p>{has?'Discovered.':hint}</p>
            </article>
          })}
        </div>
      </div>
    </section>}
  </>
}
