import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useArcadeProgress } from './arcade/shared'
import { SITE_RELEASE, SMP_ADDRESS, SMP_PORT, DISCORD_URL, useLiveNetwork } from './liveNetwork'
import './noAccountExpansion.css'

const NOTICE_KEY='esn_notification_center_v1'
const ALERT_PREF_KEY='esn_browser_alerts_v1'
const MARKET_KEY='esn_reward_market_v1'
const RETENTION_KEY='esn_retention_v1'
const CHALLENGE_KEY='esn_share_challenges_v1'
const STAFF_SESSION_KEY='esn_staff_session_v1'
const STAFF_BANNER_KEY='esn_staff_banner_v1'
const STAFF_CODE_HASH='645569b472b3670b547fd45aa2a626177a8fb71f722bb7c3dc07d0d670311cab'

const GAME_DEFS=[
  {id:'clicker',name:'ES Clicker',route:'/esclicker',stat:'clickerTaps',unit:'taps',step:250},
  {id:'factory',name:'ES Factory',route:'/esfactory',stat:'factoryMachines',unit:'machines',step:10},
  {id:'mines',name:'ES Mines',route:'/esmines',stat:'minesSafe',unit:'safe tiles',step:25},
  {id:'moto',name:'ES MOTO',route:'/esmoto',stat:'motoFinishes',unit:'finishes',step:3},
  {id:'tower',name:'ES Tower',route:'/estower',stat:'towerFloors',unit:'floors',step:25},
  {id:'defense',name:'ES Tower Defense',route:'/estowerdefense',stat:'tdWaves',unit:'waves',step:20},
]

const MARKET_ITEMS=[
  {id:'cyan',name:'Cyan Reactor',type:'CORE SKIN',cost:4,copy:'A bright ESN cyan network accent.',cosmetic:'cyan'},
  {id:'void',name:'Void Signal',type:'CORE SKIN',cost:7,copy:'A violet-black Vault inspired accent.',cosmetic:'void'},
  {id:'warden',name:'Warden Pulse',type:'CORE SKIN',cost:9,copy:'A dark teal Warden-style system accent.',cosmetic:'warden'},
  {id:'rift',name:'Rift Surge',type:'CORE SKIN',cost:11,copy:'A high-energy violet and blue Rift accent.',cosmetic:'rift'},
  {id:'operator-title',name:'Network Operator',type:'PROFILE TITLE',cost:6,copy:'Adds the Network Operator title to your local identity card.',title:'Network Operator'},
  {id:'signal-title',name:'Signal Hunter',type:'PROFILE TITLE',cost:8,copy:'A title for hidden-signal hunters.',title:'Signal Hunter'},
  {id:'arcade-title',name:'Arcade Vanguard',type:'PROFILE TITLE',cost:10,copy:'A title for dedicated ESN Arcade players.',title:'Arcade Vanguard'},
]

function readJson(key,fallback){
  try{
    const value=JSON.parse(localStorage.getItem(key)||'null')
    return value==null?fallback:value
  }catch{return fallback}
}
function writeJson(key,value){
  try{localStorage.setItem(key,JSON.stringify(value))}catch{}
}
function nowIso(){return new Date().toISOString()}
function makeId(prefix='notice'){return prefix+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,8)}

function addNotice(notice){
  const current=readJson(NOTICE_KEY,[])
  const id=notice.id||makeId()
  if(current.some(item=>item.id===id))return current
  const next=[{id,at:nowIso(),read:false,...notice},...current].slice(0,80)
  writeJson(NOTICE_KEY,next)
  window.dispatchEvent(new Event('esn-notification-center-change'))
  return next
}

async function showBrowserNotice(title,body){
  if(!('Notification' in window)||Notification.permission!=='granted')return false
  try{
    if('serviceWorker' in navigator){
      const registration=await navigator.serviceWorker.ready
      await registration.showNotification(title,{body,icon:'/esn-mark.svg',badge:'/esn-mark.svg',tag:'esn-local-'+Date.now()})
      return true
    }
    new Notification(title,{body,icon:'/esn-mark.svg'})
    return true
  }catch{return false}
}

export function NoAccountExperienceLayer(){
  const [banner,setBanner]=useState(()=>readJson(STAFF_BANNER_KEY,null))

  useEffect(()=>{
    const market=readJson(MARKET_KEY,{owned:[],equipped:'cyan',callsign:'Operator',title:'Network Explorer'})
    document.documentElement.dataset.esnCosmetic=market.equipped||'cyan'

    const refreshCosmetic=()=>{
      const next=readJson(MARKET_KEY,{equipped:'cyan'})
      document.documentElement.dataset.esnCosmetic=next.equipped||'cyan'
    }
    const refreshBanner=()=>setBanner(readJson(STAFF_BANNER_KEY,null))
    const achievement=event=>{
      const detail=event.detail||{}
      const notice={type:'ACHIEVEMENT',title:detail.title||'Achievement unlocked',copy:detail.copy||'ESN progress updated.'}
      addNotice(notice)
      if(readJson(ALERT_PREF_KEY,{enabled:false}).enabled)showBrowserNotice(notice.title,notice.copy)
    }
    const localNotice=event=>{
      const detail=event.detail||{}
      const notice={type:detail.type||'NETWORK',title:detail.title||'ESN update',copy:detail.copy||'Network activity updated.'}
      addNotice(notice)
      if(readJson(ALERT_PREF_KEY,{enabled:false}).enabled)showBrowserNotice(notice.title,notice.copy)
    }

    addNotice({id:'release-'+SITE_RELEASE,type:'RELEASE',title:SITE_RELEASE,copy:'This website release is active on ES Network.'})
    window.addEventListener('esn-cosmetic-change',refreshCosmetic)
    window.addEventListener('esn-staff-banner-change',refreshBanner)
    window.addEventListener('esn-achievement',achievement)
    window.addEventListener('esn-local-notification',localNotice)
    window.addEventListener('storage',refreshBanner)
    return()=>{
      window.removeEventListener('esn-cosmetic-change',refreshCosmetic)
      window.removeEventListener('esn-staff-banner-change',refreshBanner)
      window.removeEventListener('esn-achievement',achievement)
      window.removeEventListener('esn-local-notification',localNotice)
      window.removeEventListener('storage',refreshBanner)
    }
  },[])

  if(!banner?.active)return null
  return <div className="esn-staff-banner" role="status"><span>{banner.label||'ESN NETWORK NOTICE'}</span><strong>{banner.title||'Network notice'}</strong><small>{banner.copy||''}</small></div>
}

export function NotificationCenterPage(){
  const live=useLiveNetwork()
  const [,refresh]=useState(0)
  const notices=readJson(NOTICE_KEY,[])
  const prefs=readJson(ALERT_PREF_KEY,{enabled:false})
  const unread=notices.filter(item=>!item.read).length
  const permission='Notification' in window?Notification.permission:'unsupported'

  useEffect(()=>{
    const rerender=()=>refresh(v=>v+1)
    window.addEventListener('esn-notification-center-change',rerender)
    return()=>window.removeEventListener('esn-notification-center-change',rerender)
  },[])

  useEffect(()=>{
    if(live.loading)return
    const statusCopy=live.smp.players!=null
      ? `${live.smp.players}/${live.smp.maxPlayers??'—'} players are currently reported online.`
      : live.smp.online?'ESN SMP is operational; public player telemetry is limited right now.':'Public SMP telemetry is not reporting online.'
    addNotice({id:'smp-state-'+String(live.smp.status)+'-'+String(live.smp.players),type:'SMP',title:live.smp.online?'ESN SMP online':'SMP telemetry update',copy:statusCopy})
  },[live.loading,live.smp.status,live.smp.players,live.smp.maxPlayers,live.smp.online])

  const requestAlerts=async()=>{
    if(!('Notification' in window))return
    const result=await Notification.requestPermission()
    const enabled=result==='granted'
    writeJson(ALERT_PREF_KEY,{enabled})
    if(enabled){
      addNotice({type:'SYSTEM',title:'Browser alerts enabled',copy:'ESN can now show on-device alerts triggered while the site is active.'})
      await showBrowserNotice('ESN alerts enabled','On-device ES Network alerts are ready.')
    }
    refresh(v=>v+1)
  }
  const toggleAlerts=()=>{
    if(permission!=='granted'){requestAlerts();return}
    writeJson(ALERT_PREF_KEY,{enabled:!prefs.enabled})
    refresh(v=>v+1)
  }
  const markAll=()=>{
    writeJson(NOTICE_KEY,notices.map(item=>({...item,read:true})))
    window.dispatchEvent(new Event('esn-notification-center-change'))
  }
  const clear=()=>{
    writeJson(NOTICE_KEY,[])
    window.dispatchEvent(new Event('esn-notification-center-change'))
  }
  const test=()=>window.dispatchEvent(new CustomEvent('esn-local-notification',{detail:{type:'TEST',title:'ESN test alert',copy:'Your local notification pipeline is working.'}}))

  return <>
    <section className="page-hero noacct-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">NOTIFICATION CENTER</span><h1>Your ESN alerts in one place.</h1><p>Release notices, achievements, rewards, SMP status, and network alerts are stored on this device without an account.</p></div><div className="page-hero-mark"><span>{unread}</span><small>UNREAD</small></div></div></section>
    <section className="section"><div className="shell noacct-layout">
      <article className="noacct-panel">
        <span className="noacct-kicker">BROWSER ALERTS</span><h2>{prefs.enabled?'Enabled':'Optional'}</h2>
        <p>Permission: <strong>{permission}</strong>. These alerts are account-free and device-local. True remote push while the site is fully closed still requires a server push service.</p>
        <div className="noacct-actions"><button type="button" onClick={toggleAlerts}>{prefs.enabled?'DISABLE ALERTS':'ENABLE ALERTS'}</button><button type="button" onClick={test}>SEND TEST</button></div>
      </article>
      <article className="noacct-panel">
        <span className="noacct-kicker">LIVE SMP</span><h2>{live.smp.online?'ONLINE':'CHECKING'}</h2>
        <p>{live.smp.players!=null?`${live.smp.players} / ${live.smp.maxPlayers??'—'} players reported online.`:'Operational state is available; player telemetry may be limited by public status providers.'}</p>
        {live.smp.playerSample?.length>0&&<div className="noacct-tags">{live.smp.playerSample.map(name=><span key={name}>{name}</span>)}</div>}
      </article>
    </div></section>
    <section className="section dark-section"><div className="shell">
      <div className="section-heading"><div><span className="eyebrow">LOCAL INBOX</span><h2>Recent network activity.</h2></div><div className="noacct-actions"><button type="button" onClick={markAll}>MARK ALL READ</button><button type="button" onClick={clear}>CLEAR LOCAL LOG</button></div></div>
      <div className="noacct-feed">{notices.length?notices.map(item=><article className={item.read?'read':''} key={item.id}><span>{item.type||'NETWORK'}</span><div><strong>{item.title}</strong><p>{item.copy}</p></div><time>{new Date(item.at).toLocaleString()}</time></article>):<p>No local alerts yet. New ESN activity will appear here.</p>}</div>
    </div></section>
  </>
}

export function RewardMarketPage(){
  const arcade=useArcadeProgress()
  const [,refresh]=useState(0)
  const retention=readJson(RETENTION_KEY,{networkXp:0,shards:0,collectibles:[],streak:0})
  const market=readJson(MARKET_KEY,{owned:[],equipped:'cyan',callsign:'Operator',title:'Network Explorer'})
  const owned=new Set(market.owned||[])

  const purchase=item=>{
    if(owned.has(item.id)||Number(retention.shards||0)<item.cost)return
    const nextRetention={...retention,shards:Number(retention.shards||0)-item.cost}
    const nextMarket={...market,owned:[...(market.owned||[]),item.id]}
    writeJson(RETENTION_KEY,nextRetention)
    writeJson(MARKET_KEY,nextMarket)
    addNotice({type:'REWARD',title:item.name+' unlocked',copy:`${item.cost} Network Shards spent from this device.`})
    window.dispatchEvent(new Event('esn-progress-change'))
    refresh(v=>v+1)
  }
  const equip=item=>{
    if(!owned.has(item.id))return
    const next={...market}
    if(item.cosmetic)next.equipped=item.cosmetic
    if(item.title)next.title=item.title
    writeJson(MARKET_KEY,next)
    window.dispatchEvent(new Event('esn-cosmetic-change'))
    refresh(v=>v+1)
  }
  const saveIdentity=(field,value)=>{
    writeJson(MARKET_KEY,{...market,[field]:value.slice(0,24)})
    refresh(v=>v+1)
  }

  return <>
    <section className="page-hero noacct-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">REWARD VAULT</span><h1>Earn it. Unlock it. Keep it locally.</h1><p>Network Shards earned from ESN progression can unlock cosmetic rewards without accounts, real money, or fake global inventory.</p></div><div className="page-hero-mark"><span>{retention.shards||0}</span><small>SHARDS</small></div></div></section>
    <section className="section"><div className="shell noacct-layout">
      <article className="noacct-panel identity-card">
        <span className="noacct-kicker">LOCAL IDENTITY CARD</span><strong className="identity-name">{market.callsign||'Operator'}</strong><small>{market.title||'Network Explorer'}</small>
        <div className="identity-stats"><b>LV {Math.max(1,Math.floor(((arcade.progress.xp||0)+(retention.networkXp||0))/500)+1)}</b><b>{Math.floor(retention.networkXp||0)} XP</b><b>{retention.streak||0} DAY</b></div>
        <label>CALLSIGN<input value={market.callsign||''} onChange={e=>saveIdentity('callsign',e.target.value)} maxLength={24}/></label>
      </article>
      <article className="noacct-panel">
        <span className="noacct-kicker">INVENTORY</span><h2>{owned.size} unlocks</h2>
        <p>Your unlocks are stored in this browser. Existing Nexus collectibles remain separate and are still earned from missions, streaks, achievements, and Easter eggs.</p>
        <div className="noacct-tags">{(retention.collectibles||[]).map(item=><span key={item}>{item}</span>)}{!(retention.collectibles||[]).length&&<small>No collectible relics yet.</small>}</div>
      </article>
    </div></section>
    <section className="section dark-section"><div className="shell"><div className="section-heading"><div><span className="eyebrow">SHARD MARKET</span><h2>Local cosmetic unlocks.</h2><p>Nothing here is paid and nothing is traded between users.</p></div></div>
      <div className="market-grid">{MARKET_ITEMS.map(item=>{
        const has=owned.has(item.id)
        const equipped=(item.cosmetic&&market.equipped===item.cosmetic)||(item.title&&market.title===item.title)
        return <article key={item.id} className={equipped?'equipped':''}><span>{item.type}</span><h3>{item.name}</h3><p>{item.copy}</p><strong>{item.cost} SHARDS</strong><button type="button" disabled={!has&&Number(retention.shards||0)<item.cost} onClick={()=>has?equip(item):purchase(item)}>{equipped?'EQUIPPED':has?'EQUIP':'UNLOCK'}</button></article>
      })}</div>
    </div></section>
  </>
}

export function ChallengeLabPage(){
  const arcade=useArcadeProgress()
  const [,refresh]=useState(0)
  const params=useMemo(()=>new URLSearchParams(window.location.search),[window.location.search])
  const incomingId=params.get('game')
  const incomingTarget=Number(params.get('target')||0)
  const [gameId,setGameId]=useState(()=>incomingId&&GAME_DEFS.some(g=>g.id===incomingId)?incomingId:'clicker')
  const selected=GAME_DEFS.find(game=>game.id===gameId)||GAME_DEFS[0]
  const totals=arcade.progress.totals||{}
  const current=Number(totals[selected.stat]||0)
  const [target,setTarget]=useState(()=>incomingId&&incomingTarget>0?incomingTarget:current+selected.step)
  const history=readJson(CHALLENGE_KEY,[])
  const activeIncoming=incomingId&&incomingTarget>0?GAME_DEFS.find(game=>game.id===incomingId):null
  const incomingCurrent=activeIncoming?Number(totals[activeIncoming.stat]||0):0
  const complete=Boolean(activeIncoming&&incomingCurrent>=incomingTarget)

  useEffect(()=>{
    const next=GAME_DEFS.find(game=>game.id===gameId)||GAME_DEFS[0]
    setTarget(Number(totals[next.stat]||0)+next.step)
  },[gameId])

  useEffect(()=>{
    if(!activeIncoming)return
    const id=`${activeIncoming.id}-${incomingTarget}`
    if(!history.some(item=>item.id===id)){
      writeJson(CHALLENGE_KEY,[{id,game:activeIncoming.id,target:incomingTarget,acceptedAt:nowIso()},...history].slice(0,30))
      refresh(v=>v+1)
    }
    if(complete&&!history.some(item=>item.id===id&&item.completedAt)){
      writeJson(CHALLENGE_KEY,[{id,game:activeIncoming.id,target:incomingTarget,acceptedAt:nowIso(),completedAt:nowIso()},...history.filter(item=>item.id!==id)].slice(0,30))
      addNotice({id:'challenge-complete-'+id,type:'CHALLENGE',title:'Challenge complete',copy:`${activeIncoming.name}: ${incomingTarget} ${activeIncoming.unit} reached.`})
    }
  },[activeIncoming?.id,incomingTarget,complete])

  const link=()=>{
    const url=new URL('/challenges',window.location.origin)
    url.searchParams.set('game',selected.id)
    url.searchParams.set('target',String(Math.max(1,Math.floor(target))))
    return url.toString()
  }
  const copy=async()=>{
    try{await navigator.clipboard.writeText(link())}catch{}
    addNotice({type:'CHALLENGE',title:'Challenge link copied',copy:`${selected.name} target: ${Math.floor(target)} ${selected.unit}.`})
  }
  const share=async()=>{
    const url=link()
    if(navigator.share){
      try{await navigator.share({title:'ESN Arcade Challenge',text:`Beat my ${selected.name} challenge: reach ${Math.floor(target)} ${selected.unit}.`,url});return}catch{}
    }
    await copy()
  }

  return <>
    <section className="page-hero noacct-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">CHALLENGE LAB</span><h1>Challenge someone without an account.</h1><p>Create a shareable ESN Arcade target. The link carries the game and target; each player completes it using their own local Arcade progress.</p></div><div className="page-hero-mark"><span>{history.length}</span><small>LOCAL RUNS</small></div></div></section>
    {activeIncoming&&<section className="section"><div className="shell"><article className={complete?'incoming-challenge complete':'incoming-challenge'}><span>INCOMING CHALLENGE</span><h2>{activeIncoming.name}</h2><p>Reach <strong>{incomingTarget.toLocaleString()} {activeIncoming.unit}</strong>. Your current total is <strong>{incomingCurrent.toLocaleString()}</strong>.</p><div className="challenge-progress"><i style={{width:Math.min(100,incomingCurrent/incomingTarget*100)+'%'}}/></div><Link className="button primary" to={activeIncoming.route}>{complete?'CHALLENGE COMPLETE — PLAY AGAIN':'ENTER GAME'}</Link></article></div></section>}
    <section className="section dark-section"><div className="shell noacct-layout">
      <article className="noacct-panel">
        <span className="noacct-kicker">CREATE CHALLENGE</span>
        <label>GAME<select value={gameId} onChange={e=>setGameId(e.target.value)}>{GAME_DEFS.map(game=><option value={game.id} key={game.id}>{game.name}</option>)}</select></label>
        <label>TARGET<input type="number" min="1" value={target} onChange={e=>setTarget(Math.max(1,Number(e.target.value)||1))}/></label>
        <p>Your current {selected.unit}: <strong>{current.toLocaleString()}</strong></p>
        <div className="noacct-actions"><button type="button" onClick={share}>SHARE CHALLENGE</button><button type="button" onClick={copy}>COPY LINK</button></div>
      </article>
      <article className="noacct-panel">
        <span className="noacct-kicker">HOW IT WORKS</span><h2>No fake lobby.</h2><p>This uses a normal shareable URL, not accounts or invented opponents. The target is real, the receiving player uses their own local game stats, and completion is tracked only on their device.</p>
        <div className="noacct-tags"><span>NO ACCOUNT</span><span>NO BACKEND</span><span>REAL LOCAL STATS</span></div>
      </article>
    </div></section>
  </>
}

async function sha256(value){
  const bytes=new TextEncoder().encode(value)
  const hash=await crypto.subtle.digest('SHA-256',bytes)
  return [...new Uint8Array(hash)].map(byte=>byte.toString(16).padStart(2,'0')).join('')
}

export function StaffDashboardPage(){
  const live=useLiveNetwork()
  const [authorized,setAuthorized]=useState(()=>sessionStorage.getItem(STAFF_SESSION_KEY)==='1')
  const [code,setCode]=useState('')
  const [error,setError]=useState('')
  const [banner,setBanner]=useState(()=>readJson(STAFF_BANNER_KEY,{active:false,label:'ESN NETWORK NOTICE',title:'',copy:''}))
  const notices=readJson(NOTICE_KEY,[])

  const unlock=async event=>{
    event.preventDefault()
    try{
      const digest=await sha256(code.trim())
      if(digest!==STAFF_CODE_HASH){setError('ACCESS CODE REJECTED');return}
      sessionStorage.setItem(STAFF_SESSION_KEY,'1')
      setAuthorized(true);setError('');setCode('')
      addNotice({type:'STAFF',title:'Staff console unlocked',copy:'This browser session entered the local staff dashboard.'})
    }catch{setError('SECURE CHECK UNAVAILABLE')}
  }
  const publishLocalBanner=()=>{
    const next={...banner,active:true,updatedAt:nowIso()}
    writeJson(STAFF_BANNER_KEY,next)
    setBanner(next)
    window.dispatchEvent(new Event('esn-staff-banner-change'))
  }
  const clearBanner=()=>{
    const next={...banner,active:false}
    writeJson(STAFF_BANNER_KEY,next)
    setBanner(next)
    window.dispatchEvent(new Event('esn-staff-banner-change'))
  }
  const copyDiagnostics=async()=>{
    const payload={
      generatedAt:nowIso(),
      release:SITE_RELEASE,
      website:navigator.onLine?'online':'connection-lost',
      smp:live.smp,
      plugin:live.plugin,
      discord:live.discord,
      localStorageKeys:Object.keys(localStorage),
      noticeCount:notices.length,
      userAgent:navigator.userAgent,
    }
    try{await navigator.clipboard.writeText(JSON.stringify(payload,null,2))}catch{}
    addNotice({type:'STAFF',title:'Diagnostics copied',copy:'Public and local browser diagnostics were copied to the clipboard.'})
  }

  if(!authorized)return <section className="staff-lock"><div className="staff-lock-card"><span>ESN STAFF // RESTRICTED</span><h1>Operator access.</h1><p>Enter the staff access code to open this browser session.</p><form onSubmit={unlock}><input type="password" inputMode="numeric" autoComplete="off" value={code} onChange={e=>setCode(e.target.value)} placeholder="ACCESS CODE"/><button type="submit">UNLOCK STAFF DASHBOARD</button></form>{error&&<strong>{error}</strong>}<small>This is a client-side gate on a public static website. It prevents casual access, but it is not equivalent to server-side authentication.</small></div></section>

  return <>
    <section className="page-hero noacct-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">STAFF DASHBOARD</span><h1>ESN operator console.</h1><p>Live public telemetry, local notification tools, a device-local banner preview, and diagnostics without staff accounts.</p></div><div className="page-hero-mark"><span>STAFF</span><small>SESSION</small></div></div></section>
    <section className="section"><div className="shell staff-grid">
      <article className="noacct-panel"><span className="noacct-kicker">NETWORK</span><h2>{navigator.onLine?'ONLINE':'OFFLINE'}</h2><p>SMP: <strong>{live.smp.status}</strong> • Plugin: <strong>{live.plugin.version||live.plugin.status}</strong> • Discord: <strong>{live.discord.status}</strong></p><div className="noacct-actions"><button type="button" onClick={live.refresh}>REFRESH TELEMETRY</button><Link to="/status">STATUS CENTER</Link></div></article>
      <article className="noacct-panel"><span className="noacct-kicker">SMP PLAYERS</span><h2>{live.smp.players??'—'} / {live.smp.maxPlayers??'—'}</h2><p>Public player samples appear only when the external Minecraft status source provides them.</p><div className="noacct-tags">{live.smp.playerSample?.length?live.smp.playerSample.map(name=><span key={name}>{name}</span>):<small>No public player names supplied.</small>}</div></article>
      <article className="noacct-panel"><span className="noacct-kicker">LOCAL SYSTEM</span><h2>{localStorage.length} keys</h2><p>{notices.length} notification records are stored on this browser.</p><div className="noacct-actions"><button type="button" onClick={copyDiagnostics}>COPY DIAGNOSTICS</button><button type="button" onClick={()=>window.dispatchEvent(new CustomEvent('esn-local-notification',{detail:{type:'STAFF',title:'Staff test alert',copy:'Staff notification test from the operator console.'}}))}>TEST ALERT</button></div></article>
    </div></section>
    <section className="section dark-section"><div className="shell">
      <div className="section-heading"><div><span className="eyebrow">LOCAL BANNER PREVIEW</span><h2>Preview a takeover notice.</h2><p>This changes only this browser because the site currently has no writable public backend.</p></div></div>
      <div className="staff-banner-editor">
        <label>LABEL<input value={banner.label||''} onChange={e=>setBanner({...banner,label:e.target.value.slice(0,30)})}/></label>
        <label>TITLE<input value={banner.title||''} onChange={e=>setBanner({...banner,title:e.target.value.slice(0,60)})}/></label>
        <label>MESSAGE<textarea value={banner.copy||''} onChange={e=>setBanner({...banner,copy:e.target.value.slice(0,180)})}/></label>
        <div className="noacct-actions"><button type="button" onClick={publishLocalBanner}>SHOW LOCAL PREVIEW</button><button type="button" onClick={clearBanner}>CLEAR PREVIEW</button></div>
      </div>
      <div className="staff-quicklinks"><Link to="/updates">Release Center</Link><Link to="/nexus">Nexus</Link><Link to="/notifications">Notifications</Link><Link to="/rewards">Reward Vault</Link><Link to="/challenges">Challenge Lab</Link><a href={DISCORD_URL} target="_blank" rel="noreferrer">Discord</a></div>
      <button className="staff-lock-button" type="button" onClick={()=>{sessionStorage.removeItem(STAFF_SESSION_KEY);setAuthorized(false)}}>LOCK STAFF CONSOLE</button>
    </div></section>
  </>
}
