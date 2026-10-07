import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SITE_RELEASE, SMP_ADDRESS, SMP_PORT, DISCORD_URL, useLiveNetwork } from './liveNetwork'
import { useArcadeProgress } from './arcade/shared'
import './opsExpansion.css'

const OPS_MAINTENANCE_KEY='esn_ops_maintenance_v1'
const OPS_INCIDENTS_KEY='esn_staff_incidents_v1'
const OPS_COUNTDOWN_KEY='esn_ops_countdown_v1'
const OPS_EMERGENCY_KEY='esn_ops_emergency_v1'
const OPS_ACTIVITY_KEY='esn_staff_activity_v1'
const OPS_CAMPAIGN_KEY='esn_terminal_campaign_v1'
const OPS_SESSION_KEY='esn_ops_session_started_v1'

function readJson(key,fallback){
  try{
    const value=JSON.parse(localStorage.getItem(key)||'null')
    if(Array.isArray(fallback))return Array.isArray(value)?value:fallback
    if(fallback&&typeof fallback==='object')return value&&typeof value==='object'&&!Array.isArray(value)?value:fallback
    return value==null?fallback:value
  }catch{return fallback}
}
function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
function iso(){return new Date().toISOString()}
function uid(prefix){return prefix+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,7)}
async function copyText(value){try{await navigator.clipboard.writeText(value);return true}catch{return false}}

function record(action,copy=''){
  const current=readJson(OPS_ACTIVITY_KEY,[])
  const next=[{id:uid('ops'),at:iso(),action,copy},...current].slice(0,80)
  writeJson(OPS_ACTIVITY_KEY,next)
  window.dispatchEvent(new Event('esn-staff-activity-change'))
}

function countdownParts(target){
  const ms=Math.max(0,new Date(target).getTime()-Date.now())
  return {
    done:ms<=0,
    days:Math.floor(ms/86400000),
    hours:Math.floor((ms%86400000)/3600000),
    minutes:Math.floor((ms%3600000)/60000),
    seconds:Math.floor((ms%60000)/1000),
  }
}

export function GlobalOpsLayer(){
  const location=useLocation()
  const live=useLiveNetwork()
  const [tick,setTick]=useState(0)
  const [maintenance,setMaintenance]=useState(()=>readJson(OPS_MAINTENANCE_KEY,{active:false}))
  const [countdown,setCountdown]=useState(()=>readJson(OPS_COUNTDOWN_KEY,{active:false}))
  const [emergency,setEmergency]=useState(()=>readJson(OPS_EMERGENCY_KEY,{mode:'normal'}))

  useEffect(()=>{
    if(!sessionStorage.getItem(OPS_SESSION_KEY))sessionStorage.setItem(OPS_SESSION_KEY,String(Date.now()))
    const refresh=()=>{
      setMaintenance(readJson(OPS_MAINTENANCE_KEY,{active:false}))
      setCountdown(readJson(OPS_COUNTDOWN_KEY,{active:false}))
      setEmergency(readJson(OPS_EMERGENCY_KEY,{mode:'normal'}))
      setTick(v=>v+1)
    }
    window.addEventListener('esn-ops-change',refresh)
    window.addEventListener('storage',refresh)
    const timer=window.setInterval(()=>setTick(v=>v+1),1000)
    return()=>{window.removeEventListener('esn-ops-change',refresh);window.removeEventListener('storage',refresh);window.clearInterval(timer)}
  },[])

  useEffect(()=>{
    const root=document.documentElement
    root.dataset.esnEmergency=emergency.mode||'normal'
    return()=>{delete root.dataset.esnEmergency}
  },[emergency.mode])

  const cd=countdown?.active&&countdown.target?countdownParts(countdown.target):null
  const openIncidents=readJson(OPS_INCIDENTS_KEY,[]).filter(item=>item.status==='OPEN')
  const homeState=maintenance.active?'MAINTENANCE':openIncidents.length?'INCIDENT ACTIVE':live.smp.online?'NETWORK OPERATIONAL':'NETWORK CHECKING'

  return <>
    {location.pathname==='/'&&<div className="ops-home-state"><span>ESN LIVE STATE</span><strong>{homeState}</strong><small>{maintenance.active?'Local maintenance presentation is enabled on this device.':openIncidents.length?openIncidents[0].title:live.smp.online?'SMP and website systems are reporting operational.':'Public telemetry is being checked.'}</small><Link to="/operations">OPEN OPERATIONS</Link></div>}
    {countdown?.active&&cd&&!cd.done&&<div className="ops-countdown-bar"><span>{countdown.label||'ESN EVENT'}</span><strong>{cd.days?cd.days+'d ':''}{String(cd.hours).padStart(2,'0')}:{String(cd.minutes).padStart(2,'0')}:{String(cd.seconds).padStart(2,'0')}</strong><small>{countdown.copy||'Upcoming ES Network event'}</small></div>}
    {maintenance?.active&&!['/staff','/status'].includes(location.pathname)&&<div className="ops-maintenance-cover">
      <div className="ops-maintenance-core"><span>ESN MAINTENANCE MODE</span><h1>{maintenance.title||'Network maintenance in progress.'}</h1><p>{maintenance.copy||'Some ES Network systems may be temporarily unavailable.'}</p>
        <div className="ops-maintenance-tags">{(maintenance.affected||['Website']).map(item=><b key={item}>{item}</b>)}</div>
        {maintenance.estimate&&<small>ESTIMATED RESTORATION: {maintenance.estimate}</small>}
        <div className="noacct-actions"><Link to="/status">NETWORK STATUS</Link><a href={DISCORD_URL} target="_blank" rel="noreferrer">DISCORD</a></div>
      </div>
    </div>}
  </>
}

const OPS_NODES=[
  {id:'website',label:'WEBSITE',route:'/',x:50,y:10},
  {id:'nexus',label:'NEXUS',route:'/nexus',x:20,y:30},
  {id:'smp',label:'SMP',route:'/smpconnection',x:80,y:30},
  {id:'arcade',label:'ARCADE',route:'/arcade',x:12,y:67},
  {id:'terminal',label:'TERMINAL',action:'terminal',x:38,y:78},
  {id:'store',label:'STORE',route:'/storesmp',x:62,y:78},
  {id:'staff',label:'STAFF',route:'/staff',x:88,y:67},
]

export function OperationsMapPage(){
  const live=useLiveNetwork()
  const systemStatus=id=>{
    if(id==='smp')return live.smp.online?'ONLINE':String(live.smp.status||'CHECK')
    if(id==='website')return navigator.onLine?'CONNECTED':'OFFLINE'
    if(id==='store')return 'READY'
    return 'ACTIVE'
  }
  const activate=node=>{
    if(node.action==='terminal')window.dispatchEvent(new Event('esn-open-terminal'))
    else window.location.assign(node.route)
  }
  return <>
    <section className="page-hero ops-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">ESN OPERATIONS MAP</span><h1>Find ESN pages and status tools.</h1><p>Use the map to open ESN projects. Browser, Minecraft, plugin, and Discord information is shown below.</p></div><div className="page-hero-mark"><span>OPS</span><small>NETWORK MAP</small></div></div></section>
    <section className="section"><div className="shell"><div className="ops-map">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{OPS_NODES.filter(n=>n.id!=='website').map(n=><line key={n.id} x1="50" y1="10" x2={n.x} y2={n.y}/>)}</svg>
      {OPS_NODES.map(node=><button key={node.id} type="button" style={{'--x':node.x+'%','--y':node.y+'%'}} onClick={()=>activate(node)}><i/><strong>{node.label}</strong><small>{systemStatus(node.id)}</small></button>)}
    </div></div></section>
    <section className="section dark-section"><div className="shell ops-status-grid">
      <article><span>YOUR BROWSER</span><strong>{navigator.onLine?'CONNECTED':'OFFLINE'}</strong><small>{SITE_RELEASE}</small></article>
      <article><span>SMP</span><strong>{live.smp.online?'ONLINE':String(live.smp.status||'CHECKING').toUpperCase()}</strong><small>{live.smp.players!=null?live.smp.players+'/'+(live.smp.maxPlayers??'—')+' players':'Telemetry limited'}</small></article>
      <article><span>PLUGIN</span><strong>{live.plugin.version||live.plugin.status}</strong><small>Latest public release channel</small></article>
      <article><span>DISCORD</span><strong>{String(live.discord.status||'configured').toUpperCase()}</strong><small>{live.discord.members!=null?live.discord.members+' members':'Invite configured'}</small></article>
    </div></section>
  </>
}

export function PublicIncidentsPage(){
  const [,refresh]=useState(0)
  useEffect(()=>{const f=()=>refresh(v=>v+1);window.addEventListener('esn-ops-change',f);return()=>window.removeEventListener('esn-ops-change',f)},[])
  const incidents=readJson(OPS_INCIDENTS_KEY,[]).filter(item=>item.published)
  return <>
    <section className="page-hero ops-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">PUBLIC INCIDENT HISTORY</span><h1>What happened, and what was resolved.</h1><p>Incidents explicitly marked for public display by Staff on this device appear here. A backend is still required to publish them to every visitor globally.</p></div><div className="page-hero-mark"><span>{incidents.length}</span><small>VISIBLE HERE</small></div></div></section>
    <section className="section"><div className="shell public-incidents">{incidents.length?incidents.map(item=><article key={item.id} className={item.status==='OPEN'?'open':'resolved'}><div><span>{item.severity}</span><b>{item.status}</b></div><h2>{item.title}</h2><p>{item.copy||'No additional public details.'}</p><small>Opened {new Date(item.createdAt).toLocaleString()}{item.resolvedAt?' • Resolved '+new Date(item.resolvedAt).toLocaleString():''}</small></article>):<div className="empty-state"><h2>No public incidents on this device.</h2><p>Normal operation or no incidents have been published locally.</p></div>}</div></section>
  </>
}

const CHANGELOG=[
  {date:'2026-09-28',type:'WEBSITE',title:'Operations Expansion',copy:'Operations map, diagnostics, connection testing, system blueprint, maintenance controls, incident publishing, countdowns, session stats, emergency states, and recovery tools.'},
  {date:'2026-09-28',type:'WEBSITE',title:'Cinematic Interaction Restoration',copy:'Restored route portals, mobile five-second blocking transitions, tap energy, mobile operator controls, and premium safe motion.'},
  {date:'2026-09-27',type:'STAFF',title:'Staff Operator Console',copy:'Added code-gated staff tools, local notices, incidents, notes, release checks, announcement builder, diagnostics, and activity history.'},
  {date:'2026-09-27',type:'NETWORK',title:'Network Nexus Expansion',copy:'Connected missions, XP, achievements, lore, live systems, local guide actions, rewards, and challenges.'},
  {date:'2026-09-27',type:'TERMINAL',title:'Terminal Operator Suite',copy:'Added macros, aliases, watch mode, logs, QR, themes, diagnostics, profiler, archive lore, and operator progression.'},
  {date:'2026-09-27',type:'ARCADE',title:'Arcade Realism & Mobile Pass',copy:'Rebuilt Arcade presentation and mobile controls with stronger game-specific visual systems.'},
]

export function ChangelogTimelinePage(){
  const [filter,setFilter]=useState('ALL')
  const types=['ALL',...new Set(CHANGELOG.map(x=>x.type))]
  const rows=filter==='ALL'?CHANGELOG:CHANGELOG.filter(x=>x.type===filter)
  return <>
    <section className="page-hero ops-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">NETWORK CHANGELOG TIMELINE</span><h1>Every major ESN system shift, in order.</h1><p>Filter the network history by Website, Staff, Network, Terminal, or Arcade releases.</p></div><div className="page-hero-mark"><span>{CHANGELOG.length}</span><small>MAJOR RELEASES</small></div></div></section>
    <section className="section"><div className="shell"><div className="ops-filter-row">{types.map(type=><button key={type} className={filter===type?'active':''} onClick={()=>setFilter(type)}>{type}</button>)}</div><div className="ops-timeline">{rows.map((row,i)=><article key={row.date+row.title}><i/><div><span>{row.type} • {row.date}</span><h2>{row.title}</h2><p>{row.copy}</p></div><b>{String(i+1).padStart(2,'0')}</b></article>)}</div></div></section>
  </>
}

async function runCoreDiagnostics(live){
  const rows=[]
  const add=(name,status,copy)=>rows.push({name,status,copy})
  add('Browser connection',navigator.onLine?'PASS':'FAIL',navigator.onLine?'Browser reports online.':'Browser reports offline.')
  try{localStorage.setItem('__esn_diag','1');localStorage.removeItem('__esn_diag');add('Local storage','PASS','Local ESN state can be saved.')}catch{add('Local storage','FAIL','Browser blocked local storage.')}
  add('Notifications','Notification' in window?(Notification.permission==='granted'?'PASS':'INFO'):'WARN','Permission: '+(('Notification' in window&&Notification.permission)||'unsupported'))
  if('serviceWorker' in navigator){
    try{const reg=await navigator.serviceWorker.getRegistration();add('Service worker',reg?'PASS':'WARN',reg?'Registered for offline/update support.':'No active registration found.')}catch{add('Service worker','WARN','Registration check failed.')}
  }else add('Service worker','WARN','Not supported by this browser.')
  if('caches' in window){try{const keys=await caches.keys();add('ESN cache','PASS',keys.length+' cache bucket(s) visible.')}catch{add('ESN cache','WARN','Cache API check failed.')}}
  add('SMP telemetry',live.smp.online?'PASS':live.smp.status==='offline'?'FAIL':'WARN',live.smp.online?'SMP reports operational.':'SMP public telemetry: '+live.smp.status)
  add('Plugin release',live.plugin.version?'PASS':'WARN',live.plugin.version||live.plugin.status||'Unavailable')
  add('Discord channel',live.discord.status==='available'||live.discord.status==='configured'?'PASS':'WARN',String(live.discord.status||'unknown'))
  return rows
}

export function DiagnosticCenterPage(){
  const live=useLiveNetwork()
  const [rows,setRows]=useState([])
  const [running,setRunning]=useState(false)
  const run=async()=>{setRunning(true);setRows(await runCoreDiagnostics(live));setRunning(false)}
  useEffect(()=>{if(!live.loading)run()},[live.loading])
  const report=rows.map(r=>r.status+' | '+r.name+' | '+r.copy).join('\n')
  return <>
    <section className="page-hero ops-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">ESN DIAGNOSTIC CENTER</span><h1>Test the browser before opening support.</h1><p>Runs safe local checks for connection, storage, notifications, service worker, cache, SMP telemetry, plugin release, and Discord status.</p></div><div className="page-hero-mark"><span>DIAG</span><small>SELF TEST</small></div></div></section>
    <section className="section"><div className="shell"><div className="ops-diagnostic-actions"><button onClick={run} disabled={running}>{running?'RUNNING…':'RUN DIAGNOSTICS'}</button><button onClick={()=>copyText('ESN DIAGNOSTIC REPORT\n'+report)}>COPY REPORT</button><Link to="/support">OPEN SUPPORT</Link></div><div className="ops-diagnostic-grid">{rows.map(r=><article key={r.name} className={r.status.toLowerCase()}><span>{r.status}</span><strong>{r.name}</strong><p>{r.copy}</p></article>)}</div></div></section>
  </>
}

export function SMPConnectionTesterPage(){
  const live=useLiveNetwork()
  const [ping,setPing]=useState(null)
  const [busy,setBusy]=useState(false)
  const test=async()=>{
    setBusy(true)
    const started=performance.now()
    try{await fetch(window.location.origin+'/?smpcheck='+Date.now(),{method:'HEAD',cache:'no-store'});setPing(Math.max(1,Math.round(performance.now()-started)))}catch{setPing(-1)}
    await live.refresh()
    setBusy(false)
  }
  return <>
    <section className="page-hero ops-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">SMP CONNECTION TESTER</span><h1>Check the whole path to ESN SMP.</h1><p>Validates the current ESN address, port, website reachability, public Minecraft telemetry, plugin release channel, and Discord connection.</p></div><div className="page-hero-mark"><span>SMP</span><small>TESTER</small></div></div></section>
    <section className="section"><div className="shell smp-test-grid">
      <article><span>ADDRESS</span><strong>{SMP_ADDRESS}</strong><small>Current ESN SMP hostname</small></article>
      <article><span>PORT</span><strong>{SMP_PORT}</strong><small>Current configured port</small></article>
      <article><span>SMP STATUS</span><strong>{live.smp.online?'ONLINE':String(live.smp.status||'CHECKING').toUpperCase()}</strong><small>{live.smp.players!=null?live.smp.players+'/'+(live.smp.maxPlayers??'—')+' players':'Public telemetry may be limited'}</small></article>
      <article><span>PLUGIN</span><strong>{live.plugin.version||'CHECKING'}</strong><small>Latest public GitHub release</small></article>
      <article><span>DISCORD</span><strong>{String(live.discord.status||'CHECKING').toUpperCase()}</strong><small>Official invite channel</small></article>
      <article><span>WEB RTT</span><strong>{ping==null?'—':ping<0?'FAILED':ping+' ms'}</strong><small>Browser round-trip to ESN website origin</small></article>
    </div><div className="ops-center-action"><button onClick={test} disabled={busy}>{busy?'TESTING…':'RUN CONNECTION TEST'}</button></div></section>
  </>
}

const BLUEPRINT=[
  {id:'nexus',name:'Nexus',copy:'Progression, missions, guide actions, lore, live systems.',links:['Terminal','Arcade','SMP','Vault']},
  {id:'terminal',name:'Terminal',copy:'Command console, macros, diagnostics, lore, themes, campaign protocols.',links:['Nexus','Vault','Operations']},
  {id:'vault',name:'Vault',copy:'Hidden network layer unlocked through signals and Terminal authorization.',links:['Terminal','Nexus']},
  {id:'arcade',name:'Arcade',copy:'Six browser games with shared local XP, achievements, challenges, and rewards.',links:['Nexus','Rewards']},
  {id:'smp',name:'SMP',copy:'Minecraft server connection, plugin, store, encyclopedia, and live telemetry.',links:['Store','Status','Operations']},
  {id:'staff',name:'Staff',copy:'Code-gated local operator tools for diagnostics, maintenance, incidents, and releases.',links:['Operations','Status','Updates']},
  {id:'operations',name:'Operations',copy:'Network map, diagnostics, incident history, maintenance state, and system recovery.',links:['Staff','SMP','Website']},
]

export function SystemBlueprintPage(){
  const [selected,setSelected]=useState(BLUEPRINT[0])
  return <>
    <section className="page-hero ops-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">ESN SYSTEM BLUEPRINT</span><h1>See how every major ESN system connects.</h1><p>Select a system to inspect its role and the other parts of the network it connects to.</p></div><div className="page-hero-mark"><span>SYS</span><small>BLUEPRINT</small></div></div></section>
    <section className="section"><div className="shell blueprint-layout"><div className="blueprint-list">{BLUEPRINT.map(item=><button className={selected.id===item.id?'active':''} key={item.id} onClick={()=>setSelected(item)}><span>{item.name.slice(0,2).toUpperCase()}</span><strong>{item.name}</strong></button>)}</div><article className="blueprint-detail"><span>SELECTED SYSTEM</span><h2>{selected.name}</h2><p>{selected.copy}</p><div>{selected.links.map(link=><b key={link}>{link}</b>)}</div></article></div></section>
  </>
}

export function SessionStatsPage(){
  const arcade=useArcadeProgress()
  const [tick,setTick]=useState(0)
  useEffect(()=>{if(!sessionStorage.getItem(OPS_SESSION_KEY))sessionStorage.setItem(OPS_SESSION_KEY,String(Date.now()));const t=setInterval(()=>setTick(v=>v+1),1000);return()=>clearInterval(t)},[])
  const started=Number(sessionStorage.getItem(OPS_SESSION_KEY)||Date.now())
  const secs=Math.max(0,Math.floor((Date.now()-started)/1000))
  let routes=[]
  try{routes=JSON.parse(sessionStorage.getItem('esn_routes_seen')||'[]')}catch{}
  const eggs=readJson('esn_easter_eggs',[])
  const operator=readJson('esn_terminal_operator_v1',{commands:0})
  const minutes=Math.floor(secs/60)
  const rank=minutes>=60?'NETWORK VETERAN':routes.length>=8?'ROUTE RUNNER':operator.commands>=10?'OPERATOR':'VISITOR'
  return <>
    <section className="page-hero ops-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">VISITOR SESSION STATS</span><h1>Your current ESN session, locally.</h1><p>No account required. These statistics use session/local browser progress only.</p></div><div className="page-hero-mark"><span>{rank}</span><small>SESSION RANK</small></div></div></section>
    <section className="section"><div className="shell session-stat-grid">
      <article><span>SESSION TIME</span><strong>{Math.floor(secs/3600)}h {Math.floor((secs%3600)/60)}m {secs%60}s</strong></article>
      <article><span>PAGES THIS SESSION</span><strong>{new Set(routes).size}</strong></article>
      <article><span>ARCADE XP</span><strong>{Math.floor(arcade.progress.xp||0).toLocaleString()}</strong></article>
      <article><span>HIDDEN SIGNALS</span><strong>{Array.isArray(eggs)?eggs.length:0} / 24</strong></article>
      <article><span>TERMINAL COMMANDS</span><strong>{operator.commands||0}</strong></article>
      <article><span>SESSION RANK</span><strong>{rank}</strong></article>
    </div></section>
  </>
}

export function StaffOpsExpansion(){
  const live=useLiveNetwork()
  const [,refresh]=useState(0)
  const [maintenance,setMaintenance]=useState(()=>readJson(OPS_MAINTENANCE_KEY,{active:false,title:'ESN maintenance in progress',copy:'Some ES Network systems may be temporarily unavailable.',affected:['Website'],estimate:''}))
  const [countdown,setCountdown]=useState(()=>readJson(OPS_COUNTDOWN_KEY,{active:false,label:'ESN EVENT',copy:'',target:''}))
  const [emergency,setEmergency]=useState(()=>readJson(OPS_EMERGENCY_KEY,{mode:'normal'}))
  const [preview,setPreview]=useState({title:'ES Network Notice',copy:'Preview how a network broadcast will look before showing it.'})
  const incidents=readJson(OPS_INCIDENTS_KEY,[])

  const saveMaintenance=next=>{setMaintenance(next);writeJson(OPS_MAINTENANCE_KEY,next);window.dispatchEvent(new Event('esn-ops-change'));record('MAINTENANCE MODE '+(next.active?'ENABLED':'DISABLED'),next.title||'')}
  const saveCountdown=next=>{setCountdown(next);writeJson(OPS_COUNTDOWN_KEY,next);window.dispatchEvent(new Event('esn-ops-change'));record('COUNTDOWN UPDATED',next.active?(next.label||'ESN event'):'Countdown disabled')}
  const saveEmergency=mode=>{const next={mode};setEmergency(next);writeJson(OPS_EMERGENCY_KEY,next);window.dispatchEvent(new Event('esn-ops-change'));record('EMERGENCY THEME',mode.toUpperCase())}
  const togglePublish=id=>{
    const next=incidents.map(item=>item.id===id?{...item,published:!item.published}:item)
    writeJson(OPS_INCIDENTS_KEY,next);window.dispatchEvent(new Event('esn-ops-change'));refresh(v=>v+1);record('INCIDENT PUBLIC STATE CHANGED',id)
  }
  const macro=async name=>{
    if(name==='maintenance'){saveEmergency('maintenance');saveMaintenance({...maintenance,active:true});}
    if(name==='all-clear'){saveMaintenance({...maintenance,active:false});saveEmergency('normal')}
    if(name==='smp-check'){await live.refresh();window.location.hash='staff-smp-check'}
    if(name==='diagnostics'){window.location.assign('/diagnostics')}
    if(name==='release'){window.location.assign('/updates')}
  }
  const clearSafeState=()=>{
    try{localStorage.removeItem('esn_site_preferences');localStorage.removeItem('esn_visual_theme');localStorage.removeItem(OPS_EMERGENCY_KEY)}catch{}
    window.dispatchEvent(new Event('esn-ops-change'))
    record('SAFE UI STATE RESET','Preferences/theme reset; Arcade, Vault, rewards, and missions preserved.')
  }

  return <>
    <section className="section staff-ops-section"><div className="shell">
      <div className="section-heading"><div><span className="eyebrow">OPERATIONS CONTROL</span><h2>Maintenance, countdowns & emergency state.</h2></div><Link className="button secondary" to="/operations">Open Operations Map</Link></div>
      <div className="staff-operations-grid">
        <article className="noacct-panel">
          <span className="noacct-kicker">MAINTENANCE MODE</span><h2>{maintenance.active?'ACTIVE':'STANDBY'}</h2>
          <label>TITLE<input value={maintenance.title||''} onChange={e=>setMaintenance({...maintenance,title:e.target.value.slice(0,80)})}/></label>
          <label>MESSAGE<textarea value={maintenance.copy||''} onChange={e=>setMaintenance({...maintenance,copy:e.target.value.slice(0,260)})}/></label>
          <label>ESTIMATED RESTORATION<input value={maintenance.estimate||''} onChange={e=>setMaintenance({...maintenance,estimate:e.target.value.slice(0,80)})} placeholder="Example: Later tonight"/></label>
          <div className="ops-check-row">{['Website','SMP','Arcade','Store','Nexus'].map(item=><label key={item}><input type="checkbox" checked={(maintenance.affected||[]).includes(item)} onChange={e=>setMaintenance({...maintenance,affected:e.target.checked?[...(maintenance.affected||[]),item]:(maintenance.affected||[]).filter(x=>x!==item)})}/><span>{item}</span></label>)}</div>
          <div className="noacct-actions"><button onClick={()=>saveMaintenance({...maintenance,active:true})}>ENABLE MAINTENANCE</button><button onClick={()=>saveMaintenance({...maintenance,active:false})}>ALL CLEAR</button></div>
        </article>
        <article className="noacct-panel">
          <span className="noacct-kicker">EVENT COUNTDOWN</span><h2>{countdown.active?'LIVE':'OFF'}</h2>
          <label>LABEL<input value={countdown.label||''} onChange={e=>setCountdown({...countdown,label:e.target.value.slice(0,40)})}/></label>
          <label>MESSAGE<input value={countdown.copy||''} onChange={e=>setCountdown({...countdown,copy:e.target.value.slice(0,120)})}/></label>
          <label>DATE / TIME<input type="datetime-local" value={countdown.target||''} onChange={e=>setCountdown({...countdown,target:e.target.value})}/></label>
          <div className="noacct-actions"><button disabled={!countdown.target} onClick={()=>saveCountdown({...countdown,active:true})}>START COUNTDOWN</button><button onClick={()=>saveCountdown({...countdown,active:false})}>STOP</button></div>
        </article>
      </div>
    </div></section>

    <section className="section dark-section"><div className="shell">
      <div className="section-heading"><div><span className="eyebrow">NETWORK EMERGENCY THEMES</span><h2>Change the operating state instantly.</h2></div></div>
      <div className="emergency-theme-grid">{['normal','blackout','critical','maintenance','rift','overdrive'].map(mode=><button key={mode} className={emergency.mode===mode?'active':''} onClick={()=>saveEmergency(mode)}><span>{mode.toUpperCase()}</span><small>{mode==='normal'?'Standard ESN state':mode==='blackout'?'Dark reduced-power network':mode==='critical'?'Red critical incident state':mode==='maintenance'?'Maintenance operations state':mode==='rift'?'Violet Rift breach state':'High-energy Core Overdrive'}</small></button>)}</div>
    </div></section>

    <section className="section"><div className="shell staff-operations-grid">
      <article className="noacct-panel">
        <span className="noacct-kicker">PUBLIC INCIDENT CONTROL</span><h2>{incidents.filter(x=>x.published).length} published locally</h2><p>Toggle incidents into the public incident-history page on this device.</p>
        <div className="ops-incident-publish">{incidents.slice(0,12).map(item=><label key={item.id}><input type="checkbox" checked={Boolean(item.published)} onChange={()=>togglePublish(item.id)}/><span><strong>{item.title}</strong><small>{item.severity} • {item.status}</small></span></label>)}</div>
        <Link className="button secondary" to="/incidents">VIEW PUBLIC INCIDENT PAGE</Link>
      </article>
      <article className="noacct-panel">
        <span className="noacct-kicker">BROADCAST SIMULATOR</span><h2>Preview before showing.</h2>
        <label>TITLE<input value={preview.title} onChange={e=>setPreview({...preview,title:e.target.value.slice(0,80)})}/></label>
        <label>MESSAGE<textarea value={preview.copy} onChange={e=>setPreview({...preview,copy:e.target.value.slice(0,220)})}/></label>
        <div className="broadcast-simulator"><div className="desktop"><span>DESKTOP PREVIEW</span><strong>{preview.title}</strong><p>{preview.copy}</p></div><div className="mobile"><span>MOBILE</span><strong>{preview.title}</strong><p>{preview.copy}</p></div></div>
      </article>
    </div></section>

    <section className="section dark-section"><div className="shell staff-operations-grid">
      <article className="noacct-panel">
        <span className="noacct-kicker">RECOVERY CONSOLE</span><h2>Safe repair tools.</h2><p>These tools avoid deleting Arcade saves, Vault state, missions, rewards, and other progression.</p>
        <div className="staff-tool-stack"><Link to="/diagnostics">RUN FULL DIAGNOSTICS</Link><Link to="/smpcheck">TEST SMP CONNECTION</Link><button onClick={clearSafeState}>RESET UI / THEME STATE</button><button onClick={()=>window.location.reload()}>HARD RELOAD PAGE</button></div>
      </article>
      <article className="noacct-panel">
        <span className="noacct-kicker">COMMAND MACROS</span><h2>One-tap operator routines.</h2><div className="staff-macro-grid"><button onClick={()=>macro('maintenance')}>PREPARE MAINTENANCE</button><button onClick={()=>macro('smp-check')}>CHECK SMP</button><button onClick={()=>macro('diagnostics')}>RUN DIAGNOSTICS</button><button onClick={()=>macro('release')}>OPEN RELEASE TOOLS</button><button onClick={()=>macro('all-clear')}>PUBLISH ALL CLEAR</button></div>
      </article>
    </div></section>
  </>
}
