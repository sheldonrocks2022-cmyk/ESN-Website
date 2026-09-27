import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { DISCORD_URL, SITE_RELEASE, SMP_ADDRESS, SMP_PORT, useLiveNetwork } from './liveNetwork'
import { useArcadeProgress } from './arcade/shared'
import {
  DECK_DESTINATIONS,
  MISSIONS,
  NETWORK_EVOLUTION_VERSION,
  NETWORK_TAKEOVER,
  RARE_EVENTS,
  SEARCH_INDEX,
  SEASONAL_EVENTS,
  SMP_EVENT_BOARD,
} from './networkEvolutionConfig'

const GAME_ROUTES=['/esclicker','/esfactory','/esmines','/esmoto','/estower','/estowerdefense']
const DEFAULT_DECK=['smp','arcade','tools','updates']
const TERMINAL_HISTORY_KEY='esn_terminal_history_v2'
const TERMINAL_FAVORITES_KEY='esn_favorites'
const TERMINAL_PREF_KEY='esn_site_preferences'
const TERMINAL_THEMES=['dynamic','esn','void','smp','arcade','warden','riftwalker','midnight']
const TERMINAL_COMMANDS=[
  'help','help advanced','network','status','smp','smp status','arcade','arcade stats',
  'arcade launch clicker','arcade launch factory','arcade launch mines','arcade launch moto','arcade launch tower','arcade launch defense',
  'missions','rewards','inventory','profile','whoami','vault','vault open','release latest','updates','timeline','tools',
  'history','favorites','favorites add arcade','favorites remove arcade','theme dynamic','theme esn','theme void','theme smp','theme arcade','theme warden','theme riftwalker',
  'performance auto','performance performance','performance premium','motion full','motion reduced',
  'diagnostics','ping','uptime','random','daily','leaderboard','vote','search','sound on','sound off','event','clear','clear data',
]

function readJson(key,fallback){
  try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}
}

function writeJson(key,value){
  try{localStorage.setItem(key,JSON.stringify(value))}catch{}
}

function terminalResolveDestination(raw){
  const value=raw.trim().toLowerCase()
  if(!value)return null
  const aliases={
    home:'/',services:'/serviceshowcase',service:'/serviceshowcase',portfolio:'/portfolio',reviews:'/testimonials',
    smp:'/smpconnection',minecraft:'/smpconnection',store:'/storesmp',plugin:'/smpplugin',
    arcade:'/arcade',clicker:'/esclicker',factory:'/esfactory',mines:'/esmines',moto:'/esmoto',
    tower:'/estower',defense:'/estowerdefense','tower defense':'/estowerdefense',tools:'/estools',
    status:'/status',stats:'/networkstats',updates:'/updates',timeline:'/timeline',explore:'/explore',
    gallery:'/gallery',settings:'/settings',support:'/support',about:'/about',leadership:'/leadership',
    faq:'/faq',share:'/share',vault:'/vault',
  }
  if(aliases[value])return {path:aliases[value],label:value}
  if(value.startsWith('/')){
    const exact=SEARCH_INDEX.find(item=>item.path===value)
    return exact?{path:exact.path,label:exact.label}:null
  }
  const exact=SEARCH_INDEX.find(item=>item.label.toLowerCase()===value)
  if(exact)return {path:exact.path,label:exact.label}
  const partial=SEARCH_INDEX.find(item=>(item.label+' '+item.meta).toLowerCase().includes(value))
  return partial?{path:partial.path,label:partial.label}:null
}

function terminalUnlockEgg(id){
  const allowed=['typed-kavero','typed-warden','typed-riftwalker','typed-void','typed-1337']
  if(!allowed.includes(id))return false
  const current=readJson('esn_easter_eggs',[])
  if(current.includes(id))return false
  const next=[...current,id]
  writeJson('esn_easter_eggs',next)
  window.dispatchEvent(new CustomEvent('esn-egg-unlocked',{detail:{id,count:next.length,total:24}}))
  window.dispatchEvent(new Event('esn-progress-change'))
  return true
}

function readEggs(){
  const value=readJson('esn_easter_eggs',[])
  return Array.isArray(value)?value:[]
}

function completeMission(mission,visited,eggs){
  if(mission.type==='routes')return mission.targets.every(route=>visited.includes(route))
  if(mission.type==='any-route')return mission.targets.some(route=>visited.includes(route))
  if(mission.type==='eggs')return eggs.length>=mission.target
  if(mission.type==='flag')return localStorage.getItem(mission.target)==='1'
  return false
}

function currentSeason(){
  const month=new Date().getMonth()
  return SEASONAL_EVENTS.find(item=>item.months.includes(month))||SEASONAL_EVENTS[0]
}

function tone(enabled,kind='tap'){
  if(!enabled)return
  try{
    const AudioCtx=window.AudioContext||window.webkitAudioContext
    if(!AudioCtx)return
    const ctx=new AudioCtx()
    const osc=ctx.createOscillator()
    const gain=ctx.createGain()
    const now=ctx.currentTime
    const config=kind==='unlock'
      ?{from:360,to:760,duration:.16,volume:.035}
      :kind==='rare'
        ?{from:145,to:82,duration:.34,volume:.035}
        :{from:520,to:620,duration:.055,volume:.018}
    osc.type='sine'
    osc.frequency.setValueAtTime(config.from,now)
    osc.frequency.exponentialRampToValueAtTime(config.to,now+config.duration)
    gain.gain.setValueAtTime(config.volume,now)
    gain.gain.exponentialRampToValueAtTime(.0001,now+config.duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now+config.duration)
    window.setTimeout(()=>ctx.close?.(),Math.ceil(config.duration*1000)+120)
  }catch{}
}

function passportSnapshot(visited,eggs){
  const completed=MISSIONS.filter(mission=>completeMission(mission,visited,eggs))
  const missionXp=completed.reduce((sum,item)=>sum+item.xp,0)
  const arcade=readJson('esn_arcade_progress_v2',{achievements:{},xp:0})
  const arcadeAchievements=Object.keys(arcade.achievements||{}).length
  const daily=readJson('esn_arcade_daily_v1',{completed:[]})
  const dailyCompleted=Array.isArray(daily.completed)?daily.completed.length:0
  const arcadePassportXp=arcadeAchievements*35+dailyCompleted*15
  const retention=readJson('esn_retention_v1',{networkXp:0,collectibles:[],streak:0})
  const retentionXp=Math.max(0,Math.floor(retention.networkXp||0))
  const collectibleCount=Array.isArray(retention.collectibles)?retention.collectibles.length:0
  const xp=visited.length*18+eggs.length*12+missionXp+arcadePassportXp+retentionXp
  const level=Math.max(1,Math.floor(xp/120)+1)
  const badges=[
    visited.length>=4&&'Network Explorer',
    completed.length>=4&&'Mission Operator',
    eggs.length>=3&&'Signal Hunter',
    GAME_ROUTES.every(route=>visited.includes(route))&&'Arcade Pathfinder',
    arcadeAchievements>=3&&'Arcade Achiever',
    arcadeAchievements>=6&&'Arcade Veteran',
    (retention.streak||0)>=7&&'Seven-Day Operator',
    collectibleCount>=3&&'Relic Collector',
    visited.includes('/vault')&&'Vault Witness',
    completed.length===MISSIONS.length&&'12X Completionist',
  ].filter(Boolean)
  return {completed,xp,level,badges,arcadeAchievements,arcadePassportXp,retentionXp,collectibleCount}
}

function SystemModal({title,kicker,onClose,children,className=''}) {
  return <div className="ev-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}>
    <section className={'ev-modal '+className} role="dialog" aria-modal="true" aria-label={title}>
      <header className="ev-modal-head">
        <div><span>{kicker}</span><strong>{title}</strong></div>
        <button type="button" onClick={onClose} aria-label="Close">×</button>
      </header>
      {children}
    </section>
  </div>
}

function Takeover({soundEnabled,onDone}) {
  return <div className="ev-takeover" role="dialog" aria-modal="true" aria-label={NETWORK_TAKEOVER.title}>
    <div className="ev-takeover-grid" aria-hidden="true"/>
    <div className="ev-takeover-scan" aria-hidden="true"/>
    <div className="ev-takeover-core"><span>ES</span></div>
    <div className="ev-takeover-copy">
      <span>{NETWORK_TAKEOVER.kicker}</span>
      <h2>{NETWORK_TAKEOVER.title}</h2>
      <p>{NETWORK_TAKEOVER.copy}</p>
      <button type="button" onClick={()=>{tone(soundEnabled,'unlock');onDone()}}>{NETWORK_TAKEOVER.actionLabel} →</button>
    </div>
  </div>
}

function RareEvent({event,onDone,soundEnabled}) {
  useEffect(()=>{
    tone(soundEnabled,'rare')
    const timer=window.setTimeout(onDone,9200)
    return()=>window.clearTimeout(timer)
  },[event])
  return <div className={'ev-rare-event rare-'+event.key} role="status">
    <div className="ev-rare-wave" aria-hidden="true"/>
    <span>ULTRA-RARE ESN NETWORK EVENT</span>
    <strong>{event.title}</strong>
    <p>{event.copy}</p>
    <small>VISUAL EVENT • AUTO-CLEARING</small>
    <button type="button" onClick={onDone}>Dismiss</button>
  </div>
}

function MissionPanel({visited,eggs}) {
  const snapshot=passportSnapshot(visited,eggs)
  return <div className="ev-mission-list">
    {MISSIONS.map((mission,index)=>{
      const done=snapshot.completed.some(item=>item.id===mission.id)
      return <article className={done?'complete':''} key={mission.id}>
        <span>{String(index+1).padStart(2,'0')}</span>
        <div><strong>{mission.title}</strong><p>{mission.copy}</p></div>
        <b>{done?'COMPLETE':mission.xp+' XP'}</b>
      </article>
    })}
  </div>
}

function PassportPanel({visited,eggs,onClose}) {
  const snapshot=passportSnapshot(visited,eggs)
  const generateCard=()=>{
    const canvas=document.createElement('canvas')
    canvas.width=1200
    canvas.height=630
    const ctx=canvas.getContext('2d')
    if(!ctx)return
    const gradient=ctx.createLinearGradient(0,0,1200,630)
    gradient.addColorStop(0,'#050711')
    gradient.addColorStop(.55,'#0b1732')
    gradient.addColorStop(1,'#251148')
    ctx.fillStyle=gradient
    ctx.fillRect(0,0,1200,630)
    ctx.strokeStyle='rgba(98,241,255,.35)'
    ctx.lineWidth=2
    ctx.strokeRect(42,42,1116,546)
    ctx.fillStyle='#62f1ff'
    ctx.font='800 26px system-ui'
    ctx.fillText('ES NETWORK // DIGITAL PASSPORT',78,105)
    ctx.fillStyle='#ffffff'
    ctx.font='900 82px system-ui'
    ctx.fillText('NETWORK LEVEL '+snapshot.level,78,220)
    ctx.fillStyle='#9eabc2'
    ctx.font='600 28px system-ui'
    ctx.fillText(snapshot.xp+' XP  •  '+snapshot.completed.length+'/'+MISSIONS.length+' MISSIONS  •  '+eggs.length+' HIDDEN SIGNALS',82,282)
    ctx.fillStyle='#dffaff'
    ctx.font='800 30px system-ui'
    ctx.fillText(snapshot.badges.length?snapshot.badges.slice(0,3).join('  •  '):'NETWORK EXPLORER IN PROGRESS',82,372)
    ctx.fillStyle='#788aa6'
    ctx.font='600 24px system-ui'
    ctx.fillText('esnoffical.com  •  BUILD. PLAY. CREATE.',82,510)
    ctx.fillStyle='rgba(255,255,255,.08)'
    ctx.font='950 210px system-ui'
    ctx.fillText('ES',850,410)
    canvas.toBlob(async blob=>{
      if(!blob)return
      const file=new File([blob],'esn-passport.png',{type:'image/png'})
      try{
        if(navigator.share&&navigator.canShare?.({files:[file]})){
          await navigator.share({title:'My ESN Passport',text:'My ES Network Passport progress.',files:[file]})
          return
        }
      }catch{}
      const url=URL.createObjectURL(blob)
      const a=document.createElement('a')
      a.href=url
      a.download='esn-passport.png'
      a.click()
      window.setTimeout(()=>URL.revokeObjectURL(url),1200)
    },'image/png')
  }

  return <SystemModal title="ESN Passport" kicker="LOCAL DEVICE PROGRESSION" onClose={onClose} className="ev-passport-modal">
    <div className="ev-passport-hero">
      <div><span>NETWORK LEVEL</span><strong>{snapshot.level}</strong></div>
      <div><span>TOTAL XP</span><strong>{snapshot.xp}</strong></div>
      <div><span>MISSIONS</span><strong>{snapshot.completed.length}/{MISSIONS.length}</strong></div>
      <div><span>SIGNALS</span><strong>{eggs.length}/24</strong></div>
    </div>
    <div className="ev-progress"><i style={{width:Math.min(100,(snapshot.xp%120)/120*100)+'%'}}/></div>
    <section className="ev-passport-block">
      <div className="ev-inline-head"><div><span>BADGES</span><strong>Unlocked on this device</strong></div><button type="button" onClick={generateCard}>Share achievement card ↗</button></div>
      <div className="ev-badges">{snapshot.badges.length?snapshot.badges.map(item=><span key={item}>{item}</span>):<small>Keep exploring to unlock your first badge.</small>}</div>
    </section>
    <section className="ev-passport-block"><span className="ev-label">MISSIONS</span><MissionPanel visited={visited} eggs={eggs}/></section>
  </SystemModal>
}

function SearchPanel({onClose,onOpenPassport,onOpenTerminal}) {
  const navigate=useNavigate()
  const [query,setQuery]=useState('')
  const normalized=query.trim().toLowerCase()
  const results=useMemo(()=>normalized
    ?SEARCH_INDEX.filter(item=>(item.label+' '+item.meta+' '+(item.category||'')).toLowerCase().includes(normalized)).slice(0,18)
    :SEARCH_INDEX.slice(0,12),[normalized])
  const grouped=useMemo(()=>results.reduce((map,item)=>{
    const key=item.category||'Network'
    if(!map[key])map[key]=[]
    map[key].push(item)
    return map
  },{}),[results])
  useEffect(()=>{localStorage.setItem('esn_search_used','1');window.dispatchEvent(new Event('esn-progress-change'))},[])
  return <SystemModal title="Universal ESN Search" kicker="SEARCH THE ENTIRE NETWORK" onClose={onClose} className="ev-search-modal">
    <label className="ev-search-field"><span>⌕</span><input autoFocus value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search services, SMP, Arcade, tools, updates…"/></label>
    <div className="ev-quick-actions">
      <button type="button" onClick={()=>{onClose();onOpenPassport()}}>Passport</button>
      <button type="button" onClick={()=>{onClose();onOpenTerminal()}}>Terminal</button>
      <button type="button" onClick={()=>{onClose();navigate('/explore')}}>Explore ESN</button>
      <button type="button" onClick={()=>{onClose();navigate('/status')}}>Network Status</button>
    </div>
    <div className="ev-search-results categorized">
      {Object.entries(grouped).map(([category,items])=><section className="ev-search-group" key={category}>
        <div className="ev-search-group-label">{category}</div>
        {items.map(item=><button type="button" key={item.path} onClick={()=>{onClose();navigate(item.path)}}>
          <span>{item.label}</span><small>{item.meta}</small><b>↗</b>
        </button>)}
      </section>)}
      {!results.length&&<p>No ESN destination matched that search.</p>}
    </div>
  </SystemModal>
}

function TerminalPanel({onClose,onOpenPassport,onOpenSearch,soundEnabled,setSoundEnabled,triggerRare}) {
  const navigate=useNavigate()
  const live=useLiveNetwork()
  const arcade=useArcadeProgress()
  const [value,setValue]=useState('')
  const [lines,setLines]=useState([
    {kind:'system',text:'ESN TERMINAL // OPERATOR CHANNEL READY'},
    {kind:'system',text:'Type "help" for commands. ↑/↓ recalls history. TAB autocompletes.'},
  ])
  const [history,setHistory]=useState(()=>readJson(TERMINAL_HISTORY_KEY,[]))
  const [historyIndex,setHistoryIndex]=useState(-1)
  const [clearArmed,setClearArmed]=useState(false)
  const sessionStarted=useRef(Number(sessionStorage.getItem('esn_session_started'))||Date.now())

  useEffect(()=>{
    if(!sessionStorage.getItem('esn_session_started'))sessionStorage.setItem('esn_session_started',String(sessionStarted.current))
  },[])

  const suggestions=useMemo(()=>{
    const q=value.trim().toLowerCase()
    if(!q)return TERMINAL_COMMANDS.slice(0,6)
    return TERMINAL_COMMANDS.filter(item=>item.startsWith(q)||item.includes(q)).slice(0,6)
  },[value])

  const push=(kind,text)=>setLines(current=>[...current,{kind,text}].slice(-60))
  const pushMany=(kind,items)=>items.filter(Boolean).forEach(item=>push(kind,item))
  const go=(path,label)=>{
    push('ok','Routing to '+label+'…')
    window.setTimeout(()=>{onClose();navigate(path)},220)
  }

  const savePrefs=changes=>{
    const current={performance:'auto',reducedMotion:false,highContrast:false,largeText:false,largeTargets:false,noFlashing:true,...readJson(TERMINAL_PREF_KEY,{})}
    const next={...current,...changes}
    writeJson(TERMINAL_PREF_KEY,next)
    window.dispatchEvent(new CustomEvent('esn-preferences-change',{detail:next}))
    return next
  }

  const snapshot=()=>{
    const visited=readJson('esn_passport_routes',[])
    const eggs=readEggs()
    return passportSnapshot(visited,eggs)
  }

  const run=async raw=>{
    const original=raw.trim()
    const command=original.toLowerCase()
    if(!command)return
    localStorage.setItem('esn_terminal_used','1')
    window.dispatchEvent(new Event('esn-progress-change'))
    push('input','> '+original)

    const nextHistory=[original,...history.filter(item=>item.toLowerCase()!==command)].slice(0,60)
    setHistory(nextHistory)
    writeJson(TERMINAL_HISTORY_KEY,nextHistory)
    setHistoryIndex(-1)
    setClearArmed(false)

    const gameMap={clicker:'/esclicker',factory:'/esfactory',mines:'/esmines',moto:'/esmoto',tower:'/estowerdefense'===command?'/estowerdefense':'/estower',defense:'/estowerdefense','tower defense':'/estowerdefense'}
    const protocolMap={kavero:'typed-kavero',warden:'typed-warden',riftwalker:'typed-riftwalker',void:'typed-void','1337':'typed-1337'}

    if(command==='help'){
      pushMany('system',[
        'CORE // network, status, smp status, arcade stats, profile, daily, missions, rewards, inventory',
        'NAV // arcade launch <game>, search, tools, updates, timeline, leaderboard, vote, random',
        'CUSTOMIZE // favorites, favorites add/remove <page>, theme <name>, performance <mode>, motion <mode>',
        'SYSTEM // diagnostics, ping, uptime, history, sound on/off, clear',
        'Type "help advanced" for the full operator command index.',
      ])
    }else if(command==='help advanced'){
      pushMany('system',[
        'ADVANCED COMMAND INDEX',
        'NETWORK: network | status | smp | smp status | release latest',
        'ARCADE: arcade | arcade stats | arcade launch clicker/factory/mines/moto/tower/defense | leaderboard',
        'PROGRESS: missions | rewards | inventory | profile | whoami | daily | vault | vault open',
        'NAVIGATION: tools | updates | timeline | search [term] | random | vote',
        'CUSTOMIZATION: favorites | favorites add <page> | favorites remove <page> | theme dynamic/esn/void/smp/arcade/warden/riftwalker | performance auto/performance/premium | motion full/reduced',
        'SYSTEM: diagnostics | ping | uptime | history | sound on/off | event | clear | clear data',
        'HIDDEN CHANNEL: protocol <signal> // some signals are not documented.',
      ])
    }else if(command==='network'){
      pushMany('ok',[
        'WEBSITE // '+String(live.website.status||'online').toUpperCase(),
        'SMP // '+String(live.smp.status||'checking').toUpperCase()+(live.smp.players!=null?' • '+live.smp.players+(live.smp.maxPlayers!=null?'/'+live.smp.maxPlayers:'')+' players':''),
        'PLUGIN // '+(live.plugin.version||'checking'),
        'ARCADE // 6 games operational',
        'DISCORD // '+String(live.discord.status||'checking').toUpperCase()+(live.discord.members!=null?' • '+live.discord.members+' members':''),
        'RELEASE // '+SITE_RELEASE,
      ])
    }else if(command==='status')go('/status','Network Status')
    else if(command==='smp')go('/smpconnection','ESN SMP')
    else if(command==='smp status'){
      pushMany('ok',[
        'ESN SMP // '+String(live.smp.status||'checking').toUpperCase(),
        'ADDRESS // '+SMP_ADDRESS+':'+SMP_PORT,
        live.smp.players!=null?'PLAYERS // '+live.smp.players+(live.smp.maxPlayers!=null?'/'+live.smp.maxPlayers:''):null,
        live.smp.version?'MINECRAFT // '+live.smp.version:null,
        live.smp.software?'SOFTWARE // '+live.smp.software:null,
        'PLUGIN // '+(live.plugin.version||'checking'),
      ])
    }else if(command==='arcade')go('/arcade','Arcade')
    else if(command==='arcade stats'){
      const totals=arcade.progress.totals||{}
      pushMany('ok',[
        'ARCADE LEVEL // '+arcade.level,
        'XP // '+Math.floor(arcade.progress.xp||0).toLocaleString(),
        'ACHIEVEMENTS // '+arcade.achievementCount,
        'CLICKER TAPS // '+Math.floor(totals.clickerTaps||0).toLocaleString(),
        'MOTO FINISHES // '+Math.floor(totals.motoFinishes||0).toLocaleString(),
        'TOWER FLOORS // '+Math.floor(totals.towerFloors||0).toLocaleString(),
        'TD WAVES // '+Math.floor(totals.tdWaves||0).toLocaleString(),
      ])
    }else if(command.startsWith('arcade launch ')){
      const requested=command.slice('arcade launch '.length).trim()
      const route=requested==='tower defense'||requested==='defense'?'/estowerdefense':requested==='tower'?'/estower':requested==='clicker'?'/esclicker':requested==='factory'?'/esfactory':requested==='mines'?'/esmines':requested==='moto'?'/esmoto':null
      if(route)go(route,'ES '+requested.toUpperCase())
      else push('error','Game not found. Try clicker, factory, mines, moto, tower, or defense.')
    }else if(command==='tools')go('/estools','ES Tools')
    else if(command==='updates')go('/updates','Release Center')
    else if(command==='timeline')go('/timeline','Timeline')
    else if(command==='release latest')push('ok','LATEST RELEASE // '+SITE_RELEASE+' // Open /updates for the complete release history.')
    else if(command==='passport'||command==='profile'){
      const data=snapshot()
      if(command==='passport'){onClose();onOpenPassport()}
      else pushMany('ok',[
        'ESN PASSPORT // LEVEL '+data.level,
        'NETWORK XP // '+data.xp.toLocaleString(),
        'MISSIONS // '+data.completed.length+'/'+MISSIONS.length,
        'BADGES // '+(data.badges.length?data.badges.join(', '):'none yet'),
        'COLLECTIBLES // '+data.collectibleCount,
      ])
    }else if(command==='whoami'){
      const data=snapshot()
      const retention=readJson('esn_retention_v1',{streak:0,shards:0,collectibles:[]})
      pushMany('system',[
        'IDENTITY // ESN LOCAL OPERATOR',
        'PASSPORT // LEVEL '+data.level+' • '+data.xp.toLocaleString()+' XP',
        'STREAK // '+(retention.streak||0)+' days',
        'NETWORK SHARDS // '+(retention.shards||0),
        'BADGES // '+data.badges.length,
        'SCOPE // Device-local profile; no account identity required.',
      ])
    }else if(command==='missions'){
      const visited=readJson('esn_passport_routes',[])
      const eggs=readEggs()
      const complete=MISSIONS.filter(item=>completeMission(item,visited,eggs))
      push('system','MISSIONS // '+complete.length+'/'+MISSIONS.length+' complete')
      MISSIONS.forEach(item=>push(complete.includes(item)?'ok':'system',(complete.includes(item)?'✓ ':'○ ')+item.title+' • '+item.xp+' XP'))
    }else if(command==='rewards'){
      const retention=readJson('esn_retention_v1',{lastClaim:null,streak:0,networkXp:0,shards:0,collectibles:[]})
      const today=new Date().toISOString().slice(0,10)
      pushMany('ok',[
        'DAILY REWARD // '+(retention.lastClaim===today?'CLAIMED':'READY ON HOME / ARCADE'),
        'STREAK // '+(retention.streak||0)+' days',
        'NETWORK XP // '+Math.floor(retention.networkXp||0).toLocaleString(),
        'NETWORK SHARDS // '+(retention.shards||0),
        'COLLECTIBLES // '+(retention.collectibles||[]).length,
      ])
    }else if(command==='inventory'){
      const data=snapshot()
      const retention=readJson('esn_retention_v1',{collectibles:[],shards:0})
      const eggs=readEggs()
      pushMany('system',[
        'NETWORK SHARDS // '+(retention.shards||0),
        'COLLECTIBLES // '+((retention.collectibles||[]).join(', ')||'none yet'),
        'BADGES // '+(data.badges.join(', ')||'none yet'),
        'HIDDEN SIGNALS // '+eggs.length+'/24',
      ])
    }else if(command==='vault'){
      const unlocked=localStorage.getItem('esn_vault_unlocked')==='1'
      const eggs=readEggs()
      pushMany(unlocked?'ok':'system',[
        'VAULT // '+(unlocked?'UNLOCKED':'LOCKED'),
        'HIDDEN SIGNALS // '+eggs.length+'/24',
        unlocked?'Use "vault open" to enter.':'The network still contains undiscovered authorization signals.',
      ])
    }else if(command==='vault open'){
      if(localStorage.getItem('esn_vault_unlocked')==='1')go('/vault','ESN Vault')
      else push('error','Vault authorization denied. Discover the network signal first.')
    }else if(command==='esn vault'){
      localStorage.setItem('esn_vault_unlocked','1')
      localStorage.setItem('esn_visual_theme','midnight')
      window.dispatchEvent(new CustomEvent('esn-terminal-theme',{detail:{theme:'midnight',vault:true}}))
      push('ok','VAULT AUTHORIZATION ACCEPTED // Midnight Core enabled.')
    }else if(command==='search'){
      onClose();onOpenSearch()
    }else if(command.startsWith('search ')){
      const q=command.slice(7).trim()
      const hit=SEARCH_INDEX.find(item=>(item.label+' '+item.meta+' '+item.category).toLowerCase().includes(q))
      if(hit)go(hit.path,hit.label)
      else push('error','No ESN destination matched "'+q+'".')
    }else if(command==='favorites'){
      const favorites=readJson(TERMINAL_FAVORITES_KEY,[])
      const labels=favorites.map(route=>SEARCH_INDEX.find(item=>item.path===route)?.label||route)
      push('system','FAVORITES // '+(labels.length?labels.join(' • '):'none yet'))
    }else if(command.startsWith('favorites add ')){
      const target=terminalResolveDestination(command.slice('favorites add '.length))
      if(!target)push('error','Could not resolve that page. Example: favorites add moto')
      else{
        const current=readJson(TERMINAL_FAVORITES_KEY,[])
        const next=[target.path,...current.filter(route=>route!==target.path)].slice(0,12)
        writeJson(TERMINAL_FAVORITES_KEY,next)
        window.dispatchEvent(new Event('esn-history-change'))
        push('ok','Favorite added // '+target.label)
      }
    }else if(command.startsWith('favorites remove ')){
      const target=terminalResolveDestination(command.slice('favorites remove '.length))
      if(!target)push('error','Could not resolve that page.')
      else{
        const current=readJson(TERMINAL_FAVORITES_KEY,[])
        writeJson(TERMINAL_FAVORITES_KEY,current.filter(route=>route!==target.path))
        window.dispatchEvent(new Event('esn-history-change'))
        push('ok','Favorite removed // '+target.label)
      }
    }else if(command.startsWith('theme ')){
      const theme=command.slice(6).trim()
      if(!TERMINAL_THEMES.includes(theme))push('error','Themes: dynamic, esn, void, smp, arcade, warden, riftwalker'+(localStorage.getItem('esn_vault_unlocked')==='1'?', midnight':''))
      else if(theme==='midnight'&&localStorage.getItem('esn_vault_unlocked')!=='1')push('error','Midnight Core is Vault-locked.')
      else{
        localStorage.setItem('esn_visual_theme',theme)
        window.dispatchEvent(new CustomEvent('esn-terminal-theme',{detail:{theme}}))
        push('ok','Visual theme changed // '+theme.toUpperCase())
      }
    }else if(command.startsWith('performance ')){
      const mode=command.slice(12).trim()
      if(!['auto','performance','premium'].includes(mode))push('error','Performance modes: auto, performance, premium')
      else{savePrefs({performance:mode});push('ok','Performance profile // '+mode.toUpperCase())}
    }else if(command.startsWith('motion ')){
      const mode=command.slice(7).trim()
      if(!['full','reduced'].includes(mode))push('error','Motion modes: full, reduced')
      else{savePrefs({reducedMotion:mode==='reduced'});push('ok','Motion profile // '+mode.toUpperCase())}
    }else if(command==='diagnostics'){
      const prefs=readJson(TERMINAL_PREF_KEY,{performance:'auto',reducedMotion:false})
      pushMany('system',[
        'DIAGNOSTICS // '+SITE_RELEASE,
        'VIEWPORT // '+window.innerWidth+'×'+window.innerHeight+' @ '+(window.devicePixelRatio||1)+' DPR',
        'CPU // '+(navigator.hardwareConcurrency||'unknown')+' logical cores',
        'MEMORY // '+(navigator.deviceMemory?navigator.deviceMemory+' GB estimate':'not exposed by browser'),
        'NETWORK // '+(navigator.onLine?'online':'offline')+(navigator.connection?.effectiveType?' • '+navigator.connection.effectiveType:''),
        'PERFORMANCE // '+(document.documentElement.dataset.performanceMode||prefs.performance||'auto'),
        'MOTION // '+(document.documentElement.dataset.motion||'full'),
        'STORAGE // '+(typeof localStorage!=='undefined'?'available':'unavailable'),
      ])
    }else if(command==='ping'){
      const started=performance.now()
      push('system','PING // checking ESN origin…')
      try{
        await fetch(window.location.origin+'/?terminal_ping='+Date.now(),{method:'HEAD',cache:'no-store'})
        push('ok','PING // '+Math.max(1,Math.round(performance.now()-started))+' ms browser round-trip')
      }catch{
        push('error','PING // request failed or network unavailable')
      }
    }else if(command==='uptime'){
      const seconds=Math.floor((Date.now()-sessionStarted.current)/1000)
      const h=Math.floor(seconds/3600),m=Math.floor((seconds%3600)/60),s=seconds%60
      push('ok','SESSION UPTIME // '+(h?h+'h ':'')+(m?m+'m ':'')+s+'s • Release '+SITE_RELEASE)
    }else if(command==='history'){
      if(!history.length)push('system','COMMAND HISTORY // empty')
      else history.slice(0,12).forEach((item,index)=>push('system',String(index+1).padStart(2,'0')+' // '+item))
    }else if(command==='daily'){
      const daily=readJson('esn_arcade_daily_v1',{completed:[],streak:0,date:null})
      const retention=readJson('esn_retention_v1',{lastClaim:null,streak:0})
      pushMany('system',[
        'DAILY ARCADE CHALLENGES // '+(daily.completed?.length||0)+'/3 complete',
        'ARCADE DAILY STREAK // '+(daily.streak||0),
        'ESN RETURN STREAK // '+(retention.streak||0),
        'DAILY REWARD // '+(retention.lastClaim===new Date().toISOString().slice(0,10)?'CLAIMED':'READY'),
      ])
    }else if(command==='leaderboard')go('/arcade','Arcade records & mastery leaderboard')
    else if(command==='vote')go('/arcade#community-ballot','Community Ballot')
    else if(command==='random'){
      const pool=SEARCH_INDEX.filter(item=>item.path!=='/vault')
      const item=pool[Math.floor(Math.random()*pool.length)]
      go(item.path,'Random: '+item.label)
    }else if(command==='sound on'){setSoundEnabled(true);push('ok','Optional interface sound enabled.')}
    else if(command==='sound off'){setSoundEnabled(false);push('ok','Interface sound muted.')}
    else if(command==='event'){triggerRare();push('ok','Rare-event simulator requested.')}
    else if(command==='clear')setLines([])
    else if(command==='clear data'){
      setClearArmed(true)
      pushMany('error',[
        'LOCAL PROGRESS CLEAR ARMED — nothing has been deleted.',
        'Run "clear data confirm" next if you really want to reset local progress. Themes, accessibility preferences, and favorites will be kept.',
      ])
      setValue('')
      return
    }else if(command==='clear data confirm'){
      if(!clearArmed)push('error','Confirmation expired/not armed. Run "clear data" first.')
      else{
        const keys=[
          'esn_arcade_progress_v2','esn_arcade_daily_v1','esn_retention_v1','esn_weekly_missions_v1','esn_community_vote_v1',
          'esn_passport_routes','esn_easter_eggs','esn_vault_unlocked','esn_clicker_original_v1','esn_factory_original_v1',
          'esn_mines_stats_v2','esn_moto_original_v1','esn_tower_stats_v2','esn_td_career_v2'
        ]
        keys.forEach(key=>localStorage.removeItem(key))
        window.dispatchEvent(new Event('esn-progress-change'))
        window.dispatchEvent(new Event('esn-arcade-progress'))
        push('ok','LOCAL PROGRESS CLEARED // visual preferences and favorites preserved.')
        setClearArmed(false)
      }
    }else if(command.startsWith('protocol ')){
      const signal=command.slice(9).trim()
      const egg=protocolMap[signal]
      if(!egg)push('error','No response on that protocol channel.')
      else{
        const fresh=terminalUnlockEgg(egg)
        push(fresh?'ok':'system',fresh?'HIDDEN SIGNAL CAPTURED // '+signal.toUpperCase():'SIGNAL ALREADY CAPTURED // '+signal.toUpperCase())
      }
    }else if(command==='1337'){
      const fresh=terminalUnlockEgg('typed-1337')
      push(fresh?'ok':'system',fresh?'LEGACY MODE SIGNAL CAPTURED.':'LEGACY MODE already recorded.')
    }else{
      const personalities=[
        'COMMAND NOT RECOGNIZED // The network heard you. It just has no idea what you meant.',
        'NO ROUTE FOUND // Try "help" before the terminal starts judging your typing.',
        'UNKNOWN OPERATOR REQUEST // Search index returned absolutely nothing useful.',
        'SIGNAL LOST // That command does not exist in this timeline.',
      ]
      push('error',personalities[(command.length*7)%personalities.length])
    }
    setValue('')
  }

  const keyDown=event=>{
    if(event.key==='ArrowUp'){
      event.preventDefault()
      if(!history.length)return
      const next=Math.min(history.length-1,historyIndex+1)
      setHistoryIndex(next);setValue(history[next]||'')
    }else if(event.key==='ArrowDown'){
      event.preventDefault()
      if(historyIndex<=0){setHistoryIndex(-1);setValue('')}
      else{const next=historyIndex-1;setHistoryIndex(next);setValue(history[next]||'')}
    }else if(event.key==='Tab'&&suggestions.length){
      event.preventDefault()
      setValue(suggestions[0])
    }
  }

  return <SystemModal title="ESN Terminal" kicker="NETWORK COMMAND INTERFACE" onClose={onClose} className="ev-terminal-modal">
    <div className="ev-terminal-toolbar">
      <span>OPERATOR MODE</span><b>{navigator.onLine?'ONLINE':'OFFLINE'}</b><small>{SITE_RELEASE}</small>
    </div>
    <div className="ev-terminal-output">{lines.map((line,index)=><div className={line.kind} key={index}>{line.text}</div>)}</div>
    <div className="ev-terminal-suggestions">{suggestions.map(item=><button type="button" key={item} onClick={()=>setValue(item)}>{item}</button>)}</div>
    <form className="ev-terminal-input" onSubmit={event=>{event.preventDefault();run(value)}}>
      <span>ESN:/</span><input autoFocus autoComplete="off" spellCheck="false" value={value} onKeyDown={keyDown} onChange={event=>{setValue(event.target.value);setHistoryIndex(-1)}} placeholder="help"/><button type="submit">RUN</button>
    </form>
  </SystemModal>
}

function CommandDeck({pins,onEdit}) {
  return <div className="ev-command-deck" aria-label="Personal ESN command deck">
    {pins.map(id=>{
      const item=DECK_DESTINATIONS.find(value=>value.id===id)
      if(!item)return null
      return <Link key={id} to={item.path} data-esn-sound="tap" title={item.label}><span>{item.glyph}</span><small>{item.label}</small></Link>
    })}
    <button type="button" onClick={onEdit} title="Customize command deck"><span>＋</span><small>Edit</small></button>
  </div>
}

function DeckEditor({pins,setPins,onClose}) {
  const toggle=id=>{
    const next=pins.includes(id)?pins.filter(value=>value!==id):[...pins,id].slice(-6)
    setPins(next.length?next:DEFAULT_DECK)
    localStorage.setItem('esn_deck_customized','1')
    window.dispatchEvent(new Event('esn-progress-change'))
  }
  return <SystemModal title="Command Deck" kicker="PIN YOUR FAVORITE ESN DESTINATIONS" onClose={onClose} className="ev-deck-modal">
    <p className="ev-modal-copy">Choose up to six shortcuts. They stay on this device and never require an account.</p>
    <div className="ev-deck-grid">{DECK_DESTINATIONS.map(item=><button className={pins.includes(item.id)?'active':''} type="button" onClick={()=>toggle(item.id)} key={item.id}><span>{item.glyph}</span><strong>{item.label}</strong><small>{pins.includes(item.id)?'PINNED':'ADD'}</small></button>)}</div>
  </SystemModal>
}

export function NetworkEvolutionSection(){
  const [visited,setVisited]=useState(()=>readJson('esn_passport_routes',[]))
  const [eggs,setEggs]=useState(readEggs)
  useEffect(()=>{
    const refresh=()=>{setVisited(readJson('esn_passport_routes',[]));setEggs(readEggs())}
    window.addEventListener('esn-progress-change',refresh)
    window.addEventListener('esn-egg-unlocked',refresh)
    return()=>{window.removeEventListener('esn-progress-change',refresh);window.removeEventListener('esn-egg-unlocked',refresh)}
  },[])
  const snapshot=passportSnapshot(visited,eggs)
  return <section className="section ev-hub-section">
    <div className="shell">
      <div className="section-heading flagship-heading">
        <div><span className="eyebrow">NETWORK EVOLUTION 12X</span><h2>The website now remembers how you explore.</h2><p>Local-device missions, progression, live event information, universal search, commands, seasonal states, and hidden network events.</p></div>
        <button className="text-link ev-link-button" type="button" onClick={()=>window.dispatchEvent(new Event('esn-open-passport'))}>Open Passport →</button>
      </div>
      <div className="ev-home-grid">
        <article className="ev-home-passport">
          <span>YOUR ESN PASSPORT</span>
          <strong>LEVEL {snapshot.level}</strong>
          <p>{snapshot.xp} XP • {snapshot.completed.length}/{MISSIONS.length} missions • {eggs.length}/24 hidden signals</p>
          <div className="ev-progress"><i style={{width:Math.min(100,(snapshot.xp%120)/120*100)+'%'}}/></div>
          <button type="button" onClick={()=>window.dispatchEvent(new Event('esn-open-passport'))}>View missions & badges</button>
        </article>
        <article className="ev-home-terminal">
          <span>ESN TERMINAL</span><strong>Command the entire network.</strong><p>Live status, Arcade stats and launching, missions, rewards, inventory, Passport identity, favorites, themes, performance controls, diagnostics, history, voting, hidden protocols, and more.</p>
          <button type="button" onClick={()=>window.dispatchEvent(new Event('esn-open-terminal'))}>Open Terminal</button>
        </article>
        <article className="ev-home-search">
          <span>UNIVERSAL SEARCH</span><strong>Find anything ESN.</strong><p>Search routes, services, SMP tools, Arcade games, updates, leadership, reviews, and network utilities.</p>
          <button type="button" onClick={()=>window.dispatchEvent(new Event('esn-open-universal-search'))}>Search ESN</button>
        </article>
      </div>

      <div className="ev-event-board">
        <div className="ev-event-board-head"><div><span>LIVE SMP + NETWORK EVENT BOARD</span><strong>Current public signals</strong></div><small>Discord remains the source of truth for newly announced timed events.</small></div>
        <div className="ev-event-board-grid">{SMP_EVENT_BOARD.map(item=><article key={item.title}>
          <div><span>{item.type}</span><b>{item.status}</b></div><strong>{item.title}</strong><p>{item.copy}</p>
          {item.external?<a href={DISCORD_URL} target="_blank" rel="noreferrer">Open Discord ↗</a>:<Link to={item.to}>Open →</Link>}
        </article>)}</div>
      </div>
    </div>
  </section>
}

export default function NetworkEvolution(){
  const location=useLocation()
  const [visited,setVisited]=useState(()=>readJson('esn_passport_routes',[]))
  const [eggs,setEggs]=useState(readEggs)
  const [passportOpen,setPassportOpen]=useState(false)
  const [terminalOpen,setTerminalOpen]=useState(false)
  const [searchOpen,setSearchOpen]=useState(false)
  const [deckOpen,setDeckOpen]=useState(false)
  const [pins,setPinsState]=useState(()=>readJson('esn_command_deck',DEFAULT_DECK))
  const [soundEnabled,setSoundState]=useState(()=>localStorage.getItem('esn_sound_enabled')==='1')
  const [takeover,setTakeover]=useState(false)
  const [rareEvent,setRareEvent]=useState(null)
  const season=useMemo(currentSeason,[])
  const rareTimer=useRef(null)

  const refreshProgress=()=>{
    setVisited(readJson('esn_passport_routes',[]))
    setEggs(readEggs())
  }

  const setPins=next=>{
    const safe=next.slice(0,6)
    setPinsState(safe)
    localStorage.setItem('esn_command_deck',JSON.stringify(safe))
  }

  const setSoundEnabled=value=>{
    setSoundState(value)
    localStorage.setItem('esn_sound_enabled',value?'1':'0')
    if(value)tone(true,'unlock')
  }

  const triggerRare=()=>{
    const next=RARE_EVENTS[Math.floor(Math.random()*RARE_EVENTS.length)]
    setRareEvent({...next,id:Date.now()})
  }

  useEffect(()=>{
    document.documentElement.dataset.esnSeason=season.key
    return()=>delete document.documentElement.dataset.esnSeason
  },[season.key])

  useEffect(()=>{
    const next=[...new Set([...readJson('esn_passport_routes',[]),location.pathname])]
    localStorage.setItem('esn_passport_routes',JSON.stringify(next))
    setVisited(next)
    window.dispatchEvent(new Event('esn-progress-change'))
  },[location.pathname])

  useEffect(()=>{
    const refresh=()=>refreshProgress()
    const openPassport=()=>setPassportOpen(true)
    const openTerminal=()=>setTerminalOpen(true)
    const openSearch=()=>setSearchOpen(true)
    window.addEventListener('esn-egg-unlocked',refresh)
    window.addEventListener('esn-progress-change',refresh)
    window.addEventListener('esn-open-passport',openPassport)
    window.addEventListener('esn-open-terminal',openTerminal)
    window.addEventListener('esn-open-universal-search',openSearch)
    return()=>{
      window.removeEventListener('esn-egg-unlocked',refresh)
      window.removeEventListener('esn-progress-change',refresh)
      window.removeEventListener('esn-open-passport',openPassport)
      window.removeEventListener('esn-open-terminal',openTerminal)
      window.removeEventListener('esn-open-universal-search',openSearch)
    }
  },[])

  useEffect(()=>{
    const key=event=>{
      const input=event.target?.matches?.('input,textarea,select,[contenteditable="true"]')
      if(event.key==='/'&&!input){event.preventDefault();setSearchOpen(true)}
      if(event.key==='Escape'){setPassportOpen(false);setTerminalOpen(false);setSearchOpen(false);setDeckOpen(false)}
    }
    window.addEventListener('keydown',key)
    return()=>window.removeEventListener('keydown',key)
  },[])

  useEffect(()=>{
    const ack=localStorage.getItem('esn_takeover_seen')
    if(NETWORK_TAKEOVER.active&&ack!==NETWORK_TAKEOVER.id){
      const timer=window.setTimeout(()=>setTakeover(true),2350)
      return()=>window.clearTimeout(timer)
    }
  },[])

  useEffect(()=>{
    if(sessionStorage.getItem('esn_rare_roll')==='1')return
    sessionStorage.setItem('esn_rare_roll','1')
    rareTimer.current=window.setTimeout(()=>{
      if(Math.random()<.01)triggerRare()
    },11000)
    return()=>window.clearTimeout(rareTimer.current)
  },[])

  useEffect(()=>{
    const click=event=>{
      if(event.target.closest?.('[data-esn-sound]'))tone(soundEnabled,'tap')
    }
    document.addEventListener('click',click)
    return()=>document.removeEventListener('click',click)
  },[soundEnabled])

  return <>
    <div className="network-evolution-ambient" aria-hidden="true"/>
    <div className="ev-system-rail" aria-label="ESN network utilities">
      <button type="button" onClick={()=>setSearchOpen(true)} data-esn-sound="tap"><span>⌕</span><small>Search</small></button>
      <button type="button" onClick={()=>setTerminalOpen(true)} data-esn-sound="tap"><span>›_</span><small>Terminal</small></button>
      <button type="button" onClick={()=>setPassportOpen(true)} data-esn-sound="tap"><span>{passportSnapshot(visited,eggs).level}</span><small>Passport</small></button>
      <button className={soundEnabled?'active':''} type="button" onClick={()=>setSoundEnabled(!soundEnabled)}><span>{soundEnabled?'◉':'○'}</span><small>Sound</small></button>
    </div>

    <div className="ev-season-pill"><i/><span>{season.label}</span><small>{season.copy}</small></div>

    <div className="mobile-network-strip" aria-label="ESN mobile network controls">
      <div className="mobile-network-strip-top">
        <div className="mobile-season-chip"><i/><span>{season.label}</span></div>
        <Link className="mobile-update-chip" to="/whatsnew"><b>NEW</b><span>Website update</span></Link>
      </div>
      <div className="mobile-network-strip-actions">
        <button type="button" onClick={()=>setSearchOpen(true)}><span>⌕</span><small>Search</small></button>
        <button type="button" onClick={()=>setTerminalOpen(true)}><span>›_</span><small>Terminal</small></button>
        <button type="button" onClick={()=>setPassportOpen(true)}><span>{passportSnapshot(visited,eggs).level}</span><small>Passport</small></button>
        <button type="button" onClick={()=>window.dispatchEvent(new Event('esn-open-notifications'))}><span>5</span><small>Alerts</small></button>
        <button className={soundEnabled?'active':''} type="button" onClick={()=>setSoundEnabled(!soundEnabled)}><span>{soundEnabled?'ON':'OFF'}</span><small>Sound</small></button>
      </div>
      <div className="mobile-pinned-deck" aria-label="Pinned ESN shortcuts">
        {pins.map(id=>{
          const item=DECK_DESTINATIONS.find(value=>value.id===id)
          if(!item)return null
          return <Link key={'mobile-'+id} to={item.path}><span>{item.glyph}</span><small>{item.label}</small></Link>
        })}
        <button type="button" onClick={()=>setDeckOpen(true)}><span>+</span><small>Edit</small></button>
      </div>
    </div>

    <CommandDeck pins={pins} onEdit={()=>setDeckOpen(true)}/>

    {takeover&&<Takeover soundEnabled={soundEnabled} onDone={()=>{localStorage.setItem('esn_takeover_seen',NETWORK_TAKEOVER.id);setTakeover(false)}}/>}
    {rareEvent&&<RareEvent event={rareEvent} soundEnabled={soundEnabled} onDone={()=>setRareEvent(null)}/>}
    {passportOpen&&<PassportPanel visited={visited} eggs={eggs} onClose={()=>setPassportOpen(false)}/>}
    {searchOpen&&<SearchPanel onClose={()=>setSearchOpen(false)} onOpenPassport={()=>setPassportOpen(true)} onOpenTerminal={()=>setTerminalOpen(true)}/>}
    {terminalOpen&&<TerminalPanel onClose={()=>setTerminalOpen(false)} onOpenPassport={()=>setPassportOpen(true)} onOpenSearch={()=>setSearchOpen(true)} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} triggerRare={triggerRare}/>}
    {deckOpen&&<DeckEditor pins={pins} setPins={setPins} onClose={()=>setDeckOpen(false)}/>}

    <span className="ev-version" aria-hidden="true">{NETWORK_EVOLUTION_VERSION} • {SITE_RELEASE}</span>
  </>
}
