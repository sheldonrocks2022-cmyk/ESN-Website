import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ES3DViewer from './ES3DViewer'
import { useArcadeProgress } from './arcade/shared'
import { SITE_RELEASE, useLiveNetwork } from './liveNetwork'
import './networkNexus.css'

const ROUTE_LABELS={
  '/':'Home','/arcade':'Arcade','/storesmp':'SMP Store','/smpconnection':'SMP','/estools':'ES Tools',
  '/status':'Status','/updates':'Updates','/timeline':'Timeline','/vault':'Vault','/explore':'Explore',
  '/gallery':'Gallery','/serviceshowcase':'Services','/portfolio':'Portfolio','/about':'About','/nexus':'Nexus',
  '/notifications':'Notifications','/rewards':'Reward Vault','/challenges':'Challenge Lab',
  '/operations':'Operations','/diagnostics':'Diagnostics','/smpcheck':'SMP Tester','/blueprint':'Blueprint','/incidents':'Incidents','/session':'Session','/changelog':'Changelog','/store-ai':'Store AI','/hosting':'Hosting','/site-builder':'Site Builder'
}

const PROJECTS=[
  {id:'services',label:'SERVICES',to:'/serviceshowcase',x:11,y:28,copy:'Creator services + portfolio'},
  {id:'smp',label:'ESN SMP',to:'/smpconnection',x:24,y:76,copy:'Minecraft network + store'},
  {id:'arcade',label:'ARCADE',to:'/arcade',x:78,y:74,copy:'Six browser games'},
  {id:'tools',label:'TOOLS',to:'/estools',x:90,y:28,copy:'Free browser utilities'},
  {id:'terminal',label:'TERMINAL',action:'terminal',x:50,y:8,copy:'Operator command suite'},
  {id:'vault',label:'VAULT',to:'/vault',x:50,y:90,copy:'Hidden network layer'},
]

const GAME_META=[
  ['Clicker','/esclicker','clickerTaps','TAPS'],
  ['Factory','/esfactory','factoryMachines','MACHINES'],
  ['Mines','/esmines','minesSafe','SAFE PICKS'],
  ['MOTO','/esmoto','motoFinishes','FINISHES'],
  ['Tower','/estower','towerFloors','FLOORS'],
  ['Tower Defense','/estowerdefense','tdWaves','WAVES'],
]

const EVENTS=[
  {id:'core',label:'CORE STABLE',copy:'Normal ES Network state. All systems are running in standard visual mode.'},
  {id:'blackout',label:'BLACKOUT PROTOCOL',copy:'A dark network pulse reduces ambient light and reveals high-contrast core signals.'},
  {id:'overdrive',label:'ARCADE OVERDRIVE',copy:'Arcade energy is elevated across the network. Neon routing and reactor intensity increase.'},
  {id:'rift',label:'RIFT SIGNAL',copy:'A violet route signal is passing through the ESN core. Hidden systems become more visible.'},
]

const LORE=[
  {id:'origin',title:'FILE 001 // ORIGIN',copy:'EP1C Services was the former name. ES Network is the current unified identity.',need:()=>true},
  {id:'arcade',title:'FILE 014 // ARCADE CORE',copy:'The Arcade is connected through one shared local progression layer instead of six isolated experiences.',need:s=>s.arcadeXp>=250},
  {id:'terminal',title:'FILE 031 // OPERATOR',copy:'Terminal operators leave traces: commands, relics, achievements, and signals persist locally on the device.',need:s=>s.operatorCommands>=10},
  {id:'vault',title:'FILE 077 // MIDNIGHT',copy:'The Midnight Core is tied to the hidden Vault and the wider ESN signal-hunting system.',need:s=>s.vaultUnlocked},
  {id:'signals',title:'FILE 099 // SIGNAL HUNTER',copy:'Hidden signals are distributed across branded controls, typed protocols, route markers, and the Terminal archive.',need:s=>s.eggs>=5},
]

function readJson(key,fallback){
  try{
    const value=JSON.parse(localStorage.getItem(key)||'null')
    return value==null?fallback:value
  }catch{return fallback}
}
function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
function dayKey(){
  const d=new Date()
  return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')
}
function weekKey(){
  const now=new Date()
  const start=new Date(now.getFullYear(),0,1)
  const week=Math.ceil((((now-start)/86400000)+start.getDay()+1)/7)
  return now.getFullYear()+'-W'+String(week).padStart(2,'0')
}
function eventForNow(){
  const d=new Date()
  const seed=(d.getFullYear()*13+(d.getMonth()+1)*17+d.getDate()*23+d.getHours())%EVENTS.length
  return EVENTS[seed]
}
function normalizeRoutes(value){
  if(!Array.isArray(value))return []
  return value.map(item=>typeof item==='string'?item:item?.path).filter(Boolean)
}
function clamp(value,min,max){return Math.max(min,Math.min(max,value))}

export function NexusEventLayer(){
  const [event,setEvent]=useState(()=>eventForNow())
  useEffect(()=>{
    const root=document.documentElement
    const apply=()=>{
      const next=eventForNow()
      setEvent(next)
      root.dataset.nexusEvent=next.id
    }
    apply()
    const timer=window.setInterval(apply,60000)
    return()=>{window.clearInterval(timer);delete root.dataset.nexusEvent}
  },[])
  if(event.id==='core')return null
  return <div className="nexus-global-event" role="status">
    <i/><span>{event.label}</span><small>{event.copy}</small>
  </div>
}

function useNexusSnapshot(){
  const arcade=useArcadeProgress()
  const [tick,setTick]=useState(0)
  useEffect(()=>{
    const refresh=()=>setTick(v=>v+1)
    for(const name of ['esn-progress-change','esn-egg-unlocked','esn-history-change','esn-achievement','esn-arcade-progress'])window.addEventListener(name,refresh)
    window.addEventListener('storage',refresh)
    return()=>{
      for(const name of ['esn-progress-change','esn-egg-unlocked','esn-history-change','esn-achievement','esn-arcade-progress'])window.removeEventListener(name,refresh)
      window.removeEventListener('storage',refresh)
    }
  },[])
  return useMemo(()=>{
    const routes=normalizeRoutes(readJson('esn_passport_routes',[]))
    const recent=normalizeRoutes(readJson('esn_recent_routes',[]))
    const favorites=normalizeRoutes(readJson('esn_favorites',[]))
    const eggs=readJson('esn_easter_eggs',[])
    const retention=readJson('esn_retention_v1',{networkXp:0,shards:0,collectibles:[],streak:0})
    const operator=readJson('esn_terminal_operator_v1',{xp:0,commands:0,achievements:{},relics:[]})
    const claims=readJson('esn_nexus_claims_v1',{daily:{},weekly:{}})
    const arcadeAchievements=Object.values(arcade.progress.achievements||{})
    const xp=Math.floor((arcade.progress.xp||0)+(retention.networkXp||0)+(operator.xp||0)+routes.length*18+eggs.length*35)
    const level=Math.max(1,Math.floor(xp/500)+1)
    const levelFloor=(level-1)*500
    const levelProgress=clamp((xp-levelFloor)/500,0,1)
    return {
      tick,routes,recent,favorites,eggs:Array.isArray(eggs)?eggs:[],retention,operator,claims,
      arcadeXp:Math.floor(arcade.progress.xp||0),arcadeAchievements,arcadeTotals:arcade.progress.totals||{},
      arcadeRecent:arcade.progress.recent||[],xp,level,levelProgress,
      vaultUnlocked:localStorage.getItem('esn_vault_unlocked')==='1'
    }
  },[arcade.progress,tick])
}

function Stat({label,value,copy}){
  return <article className="nexus-stat"><span>{label}</span><strong>{value}</strong><small>{copy}</small></article>
}

function ProjectMap(){
  const navigate=useNavigate()
  const activate=item=>{
    if(item.action==='terminal')window.dispatchEvent(new Event('esn-open-terminal'))
    else navigate(item.to)
  }
  return <section className="nexus-panel nexus-map-panel">
    <div className="nexus-panel-head"><div><span>INTERACTIVE ESN WORLD MAP</span><h2>One network. Multiple live systems.</h2></div><small>SELECT A NODE</small></div>
    <div className="nexus-map" data-easter="map-core">
      <div className="nexus-map-grid"/>
      <div className="nexus-map-core"><span>ES</span><b>NETWORK</b><i/></div>
      {PROJECTS.map(item=><button key={item.id} type="button" className={'nexus-node node-'+item.id} style={{'--x':item.x+'%','--y':item.y+'%'}} onClick={()=>activate(item)}>
        <i/><strong>{item.label}</strong><small>{item.copy}</small>
      </button>)}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {PROJECTS.map(item=><line key={item.id} x1="50" y1="50" x2={item.x} y2={item.y}/>)}
      </svg>
    </div>
  </section>
}

function AchievementWall({snapshot}){
  const entries=[
    ...snapshot.arcadeAchievements.map((item,index)=>({id:'arcade-'+index,label:item.label||'Arcade Achievement',copy:'Arcade',at:item.at})),
    ...(snapshot.eggs||[]).map((id,index)=>({id:'egg-'+id,label:'Hidden Signal '+String(index+1).padStart(2,'0'),copy:'Easter Egg'})),
    ...(snapshot.routes.length>=8?[{id:'explorer',label:'Network Explorer',copy:'Visited 8+ ESN destinations'}]:[]),
    ...(snapshot.operator.commands>=25?[{id:'operator',label:'Network Operator',copy:'25+ Terminal commands'}]:[]),
    ...(snapshot.vaultUnlocked?[{id:'vault',label:'Vault Breaker',copy:'Unlocked the ESN Vault'}]:[]),
  ]
  return <section className="nexus-panel">
    <div className="nexus-panel-head"><div><span>ACHIEVEMENT SHOWCASE WALL</span><h2>{entries.length} unlocked signals.</h2></div><small>LOCAL DEVICE</small></div>
    <div className="nexus-achievements">
      {entries.slice(0,12).map((item,index)=><article key={item.id}><span>{String(index+1).padStart(2,'0')}</span><div><strong>{item.label}</strong><small>{item.copy}</small></div><b>UNLOCKED</b></article>)}
      {!entries.length&&<p className="nexus-empty">Play Arcade games, explore ESN, use the Terminal, and hunt hidden signals to populate this wall.</p>}
    </div>
  </section>
}

function Missions({snapshot,onRefresh}){
  const today=dayKey()
  const week=weekKey()
  const daily=[
    {id:'explore-3',title:'Route Runner',copy:'Visit at least 3 ESN destinations.',done:s=>s.routes.length>=3,xp:80},
    {id:'arcade-250',title:'Arcade Pulse',copy:'Reach 250 shared Arcade XP.',done:s=>s.arcadeXp>=250,xp:100},
    {id:'terminal-10',title:'Operator Check',copy:'Run at least 10 Terminal commands.',done:s=>s.operator.commands>=10,xp:90},
    {id:'signal-1',title:'Signal Trace',copy:'Discover at least 1 hidden ESN signal.',done:s=>s.eggs.length>=1,xp:110},
  ]
  const weekly=[
    {id:'explore-10',title:'Network Tour',copy:'Visit 10 different ESN destinations.',done:s=>s.routes.length>=10,xp:300},
    {id:'arcade-2000',title:'Arcade Grinder',copy:'Reach 2,000 shared Arcade XP.',done:s=>s.arcadeXp>=2000,xp:450},
    {id:'signals-5',title:'Deep Signal Hunt',copy:'Discover 5 hidden ESN signals.',done:s=>s.eggs.length>=5,xp:500},
  ]
  const claim=(period,id,xp)=>{
    const all=readJson('esn_nexus_claims_v1',{daily:{},weekly:{}})
    const bucket=period==='daily'?today:week
    const current=all[period]?.[bucket]||[]
    if(current.includes(id))return
    const next={...all,[period]:{...(all[period]||{}),[bucket]:[...current,id]}}
    writeJson('esn_nexus_claims_v1',next)
    const retention=readJson('esn_retention_v1',{networkXp:0,shards:0,collectibles:[]})
    writeJson('esn_retention_v1',{...retention,networkXp:(retention.networkXp||0)+xp,shards:(retention.shards||0)+Math.max(1,Math.floor(xp/100))})
    window.dispatchEvent(new CustomEvent('esn-achievement',{detail:{title:'Mission claimed',copy:'+'+xp+' Network XP added to your Passport.'}}))
    window.dispatchEvent(new Event('esn-progress-change'))
    onRefresh()
  }
  const render=(period,item,bucket)=>{
    const done=item.done(snapshot)
    const claimed=(snapshot.claims[period]?.[bucket]||[]).includes(item.id)
    return <article className={'nexus-mission '+(done?'ready ':'')+(claimed?'claimed':'')} key={period+item.id}>
      <div><span>{period.toUpperCase()}</span><strong>{item.title}</strong><small>{item.copy}</small></div>
      <button type="button" disabled={!done||claimed} onClick={()=>claim(period,item.id,item.xp)}>{claimed?'CLAIMED':done?'CLAIM +'+item.xp:'+'+item.xp+' XP'}</button>
    </article>
  }
  return <section className="nexus-panel">
    <div className="nexus-panel-head"><div><span>DAILY + WEEKLY MISSIONS</span><h2>Progress that feeds your Network level.</h2></div><small>{today}</small></div>
    <div className="nexus-mission-grid">{daily.map(item=>render('daily',item,today))}{weekly.map(item=>render('weekly',item,week))}</div>
  </section>
}

function ActivityFeed({snapshot,live}){
  const rows=[
    {type:'NETWORK',title:live.smp.status==='online'?'ESN SMP is online':'SMP telemetry is checking',meta:live.smp.players!=null?live.smp.players+'/'+(live.smp.maxPlayers??'—')+' players':'Public telemetry'},
    {type:'RELEASE',title:SITE_RELEASE,meta:'Current website release'},
    ...snapshot.arcadeRecent.slice(0,5).map(item=>({type:'ARCADE',title:item.label,meta:'+'+(item.xp||0)+' XP'})),
    ...snapshot.recent.slice(0,4).map(path=>({type:'ROUTE',title:'Visited '+(ROUTE_LABELS[path]||path),meta:'Local activity'})),
  ]
  return <section className="nexus-panel">
    <div className="nexus-panel-head"><div><span>LIVE ACTIVITY FEED</span><h2>What the network is doing now.</h2></div><small>LIVE + LOCAL</small></div>
    <div className="nexus-feed">{rows.slice(0,10).map((row,index)=><article key={row.type+row.title+index}><span>{row.type}</span><strong>{row.title}</strong><small>{row.meta}</small><i/></article>)}</div>
  </section>
}

function ArcadeCompetition({snapshot}){
  const [spectating,setSpectating]=useState(true)
  const [frame,setFrame]=useState(0)
  useEffect(()=>{
    if(!spectating)return
    const timer=window.setInterval(()=>setFrame(v=>(v+1)%12),850)
    return()=>window.clearInterval(timer)
  },[spectating])
  const week=Number(weekKey().replace(/D/g,''))||1
  const tournament=GAME_META[week%GAME_META.length]
  const current=Number(snapshot.arcadeTotals[tournament[2]]||0)
  const target=50+(week%6)*25
  const ranked=GAME_META.map(([name,to,key,label])=>({name,to,label,value:Number(snapshot.arcadeTotals[key]||0)})).sort((a,b)=>b.value-a.value)
  const demo=[
    {name:'MOTO',copy:'Rider lean • suspension • nitro telemetry',value:85+((frame*7)%130),unit:'KM/H'},
    {name:'TOWER',copy:'Vertical climb • door risk • cashout simulation',value:18+(frame%9),unit:'FLOOR'},
    {name:'TOWER DEFENSE',copy:'Turret tracking • enemy lane • wave telemetry',value:4+(frame%8),unit:'WAVE'},
  ][frame%3]
  return <section className="nexus-panel nexus-competition">
    <div className="nexus-panel-head"><div><span>ARCADE LEADERBOARDS + TOURNAMENTS</span><h2>Competition layer without fake global scores.</h2></div><small>GLOBAL SYNC READY</small></div>
    <div className="nexus-competition-grid">
      <article className="nexus-leaderboard">
        <div className="nexus-subhead"><strong>PERSONAL MASTERY BOARD</strong><small>Current device until shared backend is connected</small></div>
        {ranked.map((item,index)=><Link to={item.to} key={item.name}><b>#{index+1}</b><span>{item.name}</span><strong>{item.value.toLocaleString()}</strong><small>{item.label}</small></Link>)}
      </article>
      <article className="nexus-tournament">
        <span>WEEKLY TOURNAMENT</span><h3>{tournament[0]} // TARGET RUN</h3><p>Push your personal {tournament[3].toLowerCase()} record this week. This local tournament shell is ready for real cross-user sync when a shared backend exists.</p>
        <div className="nexus-target"><strong>{current.toLocaleString()}</strong><i><b style={{width:clamp(current/target*100,0,100)+'%'}}/></i><span>{target} TARGET</span></div>
        <Link className="button primary" to={tournament[1]}>Enter challenge</Link>
      </article>
      <article className="nexus-spectator">
        <div className="nexus-subhead"><strong>ARCADE SPECTATOR MODE</strong><button type="button" onClick={()=>setSpectating(v=>!v)}>{spectating?'PAUSE':'PLAY'}</button></div>
        <div className={'spectator-stage spectator-'+demo.name.toLowerCase().replaceAll(' ','-')}>
          <div className="spectator-grid"/><i className="spectator-object"/><em/><span>{demo.name}</span>
        </div>
        <strong>{demo.value} {demo.unit}</strong><small>{demo.copy}</small>
      </article>
    </div>
  </section>
}

function LoreArchive({snapshot}){
  const state={arcadeXp:snapshot.arcadeXp,operatorCommands:snapshot.operator.commands||0,vaultUnlocked:snapshot.vaultUnlocked,eggs:snapshot.eggs.length}
  return <section className="nexus-panel">
    <div className="nexus-panel-head"><div><span>SECRET WEBSITE LORE</span><h2>Encrypted files unlock as the network knows you.</h2></div><small>ARCHIVE</small></div>
    <div className="nexus-lore">{LORE.map((item,index)=>{
      const unlocked=item.need(state)
      return <article className={unlocked?'unlocked':'locked'} key={item.id}><span>{unlocked?'ACCESS GRANTED':'ENCRYPTED'}</span><h3>{unlocked?item.title:'FILE '+String(index+1).padStart(3,'0')+' // ███████'}</h3><p>{unlocked?item.copy:'Continue exploring, playing, and using hidden ESN systems to decrypt this file.'}</p></article>
    })}</div>
  </section>
}

function PersonalizedDock({snapshot}){
  const items=[...snapshot.favorites,...snapshot.recent].filter((value,index,array)=>array.indexOf(value)===index).slice(0,8)
  return <section className="nexus-panel">
    <div className="nexus-panel-head"><div><span>PERSONALIZED HOME SCREEN</span><h2>Your ESN launch deck on this device.</h2></div><small>LOCAL MEMORY</small></div>
    <div className="nexus-dock">
      {items.map(path=><Link key={path} to={path}><span>{ROUTE_LABELS[path]?.slice(0,2).toUpperCase()||'ES'}</span><strong>{ROUTE_LABELS[path]||path}</strong><small>{snapshot.favorites.includes(path)?'FAVORITE':'RECENT'}</small></Link>)}
      {!items.length&&<p className="nexus-empty">Browse ESN and favorite destinations to build your personal launch deck.</p>}
    </div>
  </section>
}

function NetworkVisualization(){
  return <section className="nexus-panel nexus-visual-panel">
    <div className="nexus-panel-head"><div><span>3D NETWORK VISUALIZATION</span><h2>The ESN core rendered as a live system.</h2></div><small>INTERACTIVE</small></div>
    <div className="nexus-3d"><ES3DViewer variant="hero" label="Interactive ES Network core visualization"/></div>
  </section>
}

function Guide(){
  const navigate=useNavigate()
  const [query,setQuery]=useState('')
  const [reply,setReply]=useState('Ask me to open a page, copy the SMP address, change a theme, install ESN, launch the Terminal, or explain a system.')

  const go=(path,message)=>{
    setReply(message)
    window.setTimeout(()=>navigate(path),220)
  }
  const answer=async()=>{
    const q=query.toLowerCase().trim()
    if(!q)return

    const routeRules=[
      [['notification','alerts','inbox'],'/notifications','Opening your ESN Notification Center.'],
      [['store ai','shop ai','store assistant'],'/store-ai','Opening ESN Store AI.'],
      [['domains','subdomain','custom domain'],'/domains','Opening ESN Domains.'],
      [['operations','ops map','network map'],'/operations','Opening the ESN Operations Map.'],
      [['diagnostic','diagnostics','self test'],'/diagnostics','Opening the ESN Diagnostic Center.'],
      [['smp test','connection test'],'/smpcheck','Opening the SMP Connection Tester.'],
      [['blueprint','system map'],'/blueprint','Opening the ESN System Blueprint.'],
      [['incident','incidents'],'/incidents','Opening the ESN Incident History.'],
      [['session stats','session'],'/session','Opening your local Session Stats.'],
      [['changelog','release timeline'],'/changelog','Opening the Network Changelog.'],
      [['reward','market','inventory'],'/rewards','Opening the account-free Reward Vault and Shard Market.'],
      [['challenge','compete'],'/challenges','Opening the Challenge Lab so you can create or accept a shareable Arcade challenge.'],
      [['staff','operator console'],'/staff','Opening the code-gated Staff Dashboard.'],
      [['status','network status'],'/status','Opening live ESN Network Status.'],
      [['update','release','what changed','what is new'] ,'/updates','Opening the Release Center.'],
      [['service'],'/serviceshowcase','Opening ESN Services.'],
      [['tool'],'/estools','Opening ES Tools.'],
      [['arcade','game'],'/arcade','Opening the ESN Arcade.'],
      [['smp','minecraft'],'/smpconnection','Opening ESN SMP connection information.'],
    ]
    for(const [words,path,message] of routeRules){
      if(words.some(word=>q.includes(word))&&(q.includes('open')||q.includes('go')||q.includes('take me')||q.includes('show')||q===wordOr(words))){
        go(path,message)
        return
      }
    }

    if((q.includes('copy')||q.includes('give me'))&&(q.includes('smp')||q.includes('ip')||q.includes('address'))){
      const value='fr3.plugged.host:43353'
      try{await navigator.clipboard.writeText(value);setReply('Copied the ESN SMP address: '+value)}
      catch{setReply('ESN SMP address: '+value)}
      return
    }
    if(q.includes('install')||q.includes('home screen')){
      window.dispatchEvent(new Event('esn-install-request'))
      setReply('I sent the install request to your browser. If the browser supports PWA install, its install prompt will appear.')
      return
    }
    if(q.includes('terminal')){
      window.dispatchEvent(new Event('esn-open-terminal'))
      setReply('Terminal opened. You can run network, Arcade, mission, diagnostics, lore, QR, and operator commands there.')
      return
    }
    if(q.includes('vault')){
      go('/vault','Opening the Vault. Hidden website signals and Terminal protocols control its access state.')
      return
    }
    const themes=['dynamic','esn','void','smp','arcade','warden','riftwalker','midnight']
    const requestedTheme=themes.find(theme=>q.includes(theme)&&q.includes('theme'))
    if(requestedTheme){
      if(requestedTheme==='midnight'&&localStorage.getItem('esn_vault_unlocked')!=='1'){
        setReply('Midnight Core is still Vault-locked. Unlock the Vault first.')
        return
      }
      localStorage.setItem('esn_visual_theme',requestedTheme)
      window.dispatchEvent(new CustomEvent('esn-terminal-theme',{detail:{theme:requestedTheme}}))
      setReply('Site theme changed to '+requestedTheme.toUpperCase()+'.')
      return
    }

    if(q.includes('level')||q.includes('xp')||q.includes('mission'))setReply('Network XP combines Arcade progress, claimed Nexus missions, Terminal operator progress, exploration, and hidden-signal discoveries on this device.')
    else if(q.includes('notification')||q.includes('alert'))setReply('The Notification Center stores release, achievement, reward, SMP, and network notices locally. Browser alerts can be enabled without an ESN account.')
    else if(q.includes('reward')||q.includes('shard'))setReply('The Reward Vault lets you spend locally earned Network Shards on cosmetic core skins and profile titles. Nothing uses real money.')
    else if(q.includes('challenge'))setReply('Challenge Lab creates shareable Arcade target links. The other player uses their own real local stats, with no account or fake global lobby.')
    else if(q.includes('smp')||q.includes('minecraft'))setReply('ESN SMP is at fr3.plugged.host:43353. I can also copy the address or open the SMP page for you.')
    else if(q.includes('arcade')||q.includes('game'))setReply('The Arcade has Clicker, Factory, Mines, MOTO, Tower, and Tower Defense with shared local XP and achievements.')
    else if(q.includes('update')||q.includes('new')||q.includes('change'))setReply('The Release Center and What’s New pages track website, SMP, Arcade, mobile, store, and security changes.')
    else setReply('I can now take actions too. Try “open notifications,” “open rewards,” “open challenge lab,” “copy the SMP IP,” “install ESN,” “open terminal,” or “change theme to void.”')
  }
  function wordOr(words){return words[0]}

  const quick=(label,route)=>route?navigate(route):window.dispatchEvent(new Event('esn-open-terminal'))
  return <section className="nexus-panel nexus-guide">
    <div className="nexus-panel-head"><div><span>ESN AI GUIDE</span><h2>Ask the network — or tell it what to do.</h2></div><small>LOCAL ACTION GUIDE</small></div>
    <div className="nexus-guide-console"><div className="nexus-guide-reply"><span>ESN GUIDE</span><p>{reply}</p></div><label><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')answer()}} placeholder="Try: open notifications"/><button type="button" onClick={answer}>ASK</button></label></div>
    <div className="nexus-guide-actions"><button onClick={()=>quick('Terminal')} type="button">OPEN TERMINAL</button><button onClick={()=>quick('Notifications','/notifications')} type="button">ALERTS</button><button onClick={()=>quick('Rewards','/rewards')} type="button">REWARDS</button><button onClick={()=>quick('Challenges','/challenges')} type="button">CHALLENGES</button><button onClick={()=>quick('Arcade','/arcade')} type="button">ARCADE</button><button onClick={()=>quick('SMP','/smpconnection')} type="button">SMP</button></div>
  </section>
}

export function NetworkNexusPage(){
  const live=useLiveNetwork()
  const snapshot=useNexusSnapshot()
  const [,force]=useState(0)
  const event=eventForNow()
  const achievements=snapshot.arcadeAchievements.length+snapshot.eggs.length+(snapshot.routes.length>=8?1:0)+(snapshot.operator.commands>=25?1:0)+(snapshot.vaultUnlocked?1:0)
  const openCommand=()=>window.dispatchEvent(new Event('esn-open-command'))
  const openTerminal=()=>window.dispatchEvent(new Event('esn-open-terminal'))

  return <>
    <section className="nexus-hero">
      <div className="nexus-hero-grid" aria-hidden="true"/>
      <div className="shell nexus-hero-inner">
        <div className="nexus-hero-copy">
          <span className="eyebrow">ES NETWORK // NETWORK NEXUS</span>
          <h1>Your entire ESN world in one command layer.</h1>
          <p>Command Center, progression, missions, Arcade competition, live activity, secret lore, dynamic events, personalized routing, spectator systems, 3D network visualization, and the ESN Guide are now connected to the systems already running across the site.</p>
          <div className="hero-actions"><button className="button primary" type="button" onClick={openCommand}>Open Command Center</button><button className="button secondary" type="button" onClick={openTerminal}>Launch Terminal</button></div>
        </div>
        <div className="nexus-level-card">
          <span>NETWORK LEVEL</span><strong>{snapshot.level}</strong><small>{snapshot.xp.toLocaleString()} TOTAL XP</small>
          <div><i style={{width:(snapshot.levelProgress*100)+'%'}}/></div>
          <p>{Math.max(0,500-(snapshot.xp%500))} XP until the next Network level</p>
        </div>
      </div>
      <div className="shell nexus-hero-stats">
        <Stat label="SMP" value={live.smp.status==='online'?'ONLINE':live.smp.status?.toUpperCase()||'CHECKING'} copy={live.smp.players!=null?live.smp.players+' players detected':'Public telemetry'}/>
        <Stat label="ARCADE XP" value={snapshot.arcadeXp.toLocaleString()} copy="Shared across all six games"/>
        <Stat label="ACHIEVEMENTS" value={achievements} copy="Arcade + signals + network"/>
        <Stat label="MISSIONS" value={(Object.values(snapshot.claims.daily||{}).flat().length+Object.values(snapshot.claims.weekly||{}).flat().length)} copy="Claimed Nexus missions"/>
        <Stat label="HIDDEN SIGNALS" value={snapshot.eggs.length+'/24'} copy="Easter egg discoveries"/>
        <Stat label="CURRENT EVENT" value={event.label} copy="Hourly network state"/>
      </div>
    </section>

    <main className="nexus-main">
      <div className="shell nexus-layout">
        <ProjectMap/>
        <NetworkVisualization/>
        <Missions snapshot={snapshot} onRefresh={()=>force(v=>v+1)}/>
        <ActivityFeed snapshot={snapshot} live={live}/>
        <ArcadeCompetition snapshot={snapshot}/>
        <AchievementWall snapshot={snapshot}/>
        <LoreArchive snapshot={snapshot}/>
        <PersonalizedDock snapshot={snapshot}/>
        <section className="nexus-panel nexus-terminal-card">
          <div><span>TERMINAL OPERATING SYSTEM</span><h2>Operator Core is already connected.</h2><p>{snapshot.operator.commands||0} commands executed • {snapshot.operator.xp||0} operator XP • {(snapshot.operator.relics||[]).length} Terminal relics. Use aliases, macros, history search, watch mode, dashboards, diagnostics, lore files, themes, signals, and challenges without leaving ESN.</p></div>
          <button className="button primary" type="button" onClick={openTerminal}>Boot Terminal</button>
        </section>
        <section className="nexus-panel nexus-links-panel">
          <div className="nexus-panel-head"><div><span>TIMELINE + CHANGELOG + COMMAND PALETTE</span><h2>Three fast ways to navigate ESN.</h2></div><small>CONNECTED</small></div>
          <div className="nexus-link-grid">
            <Link to="/timeline"><span>01</span><strong>Interactive Timeline</strong><small>Scrub through major ESN eras and project milestones.</small></Link>
            <Link to="/updates"><span>02</span><strong>Website Changelog</strong><small>Website, SMP, Arcade, network, mobile, store, and security releases.</small></Link>
            <button type="button" onClick={openCommand}><span>03</span><strong>Command Palette</strong><small>Search and launch ESN destinations from one overlay. Ctrl/Cmd + K supported.</small></button>
          </div>
        </section>
        <Guide/>
      </div>
    </main>
  </>
}
