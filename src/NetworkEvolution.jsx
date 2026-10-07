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
const TERMINAL_MACROS_KEY='esn_terminal_macros_v1'
const TERMINAL_ALIASES_KEY='esn_terminal_aliases_v1'
const TERMINAL_OPERATOR_KEY='esn_terminal_operator_v1'
const TERMINAL_THEME_KEY='esn_terminal_theme_v1'
const TERMINAL_CRT_KEY='esn_terminal_crt_v1'
const TERMINAL_NOTICE_CLEAR_KEY='esn_terminal_notice_clear_v1'
const TERMINAL_CHALLENGE_KEY='esn_terminal_challenge_v1'
const TERMINAL_SIGNAL_KEY='esn_terminal_signal_v1'
const TERMINAL_CAMPAIGN_KEY='esn_terminal_campaign_v1'
const TERMINAL_PLUGIN_URL='https://github.com/sheldonrocks2022-cmyk/ESNSMP/releases/latest/download/ESNSMP.jar'
const TERMINAL_UI_THEMES=['cyan','green','amber','void','warden','crt','minimal']
const TERMINAL_WATCHABLE=['network','smp status','arcade stats','daily','rewards','uptime','diagnostics','session','notifications','dashboard network','dashboard arcade']
const TERMINAL_COMMANDS=[
  'help','help advanced','man help','network','map','status','smp','smp status','arcade','arcade stats',
  'arcade launch clicker','arcade launch factory','arcade launch mines','arcade launch moto','arcade launch tower','arcade launch defense',
  'dashboard','dashboard arcade','dashboard network','dashboard missions','missions','rewards','inventory','profile','whoami',
  'vault','vault open','release latest','updates','timeline','tools','history','logs','logs arcade','logs achievements','logs network',
  'notifications','notifications network','notifications achievements','notifications rewards','notifications releases','notifications events','notifications clear','favorites','favorites add arcade','favorites remove arcade',
  'alias','alias grind "arcade launch tower"','unalias grind','macro','macro save daily "rewards && missions && arcade stats"','macro run daily','macro delete daily',
  'watch network','watch smp status','watch stop','terminal theme cyan','terminal theme green','terminal theme amber','terminal theme void',
  'terminal theme warden','terminal theme crt','terminal theme minimal','crt on','crt off',
  'theme dynamic','theme esn','theme void','theme smp','theme arcade','theme warden','theme riftwalker',
  'performance auto','performance performance','performance premium','motion full','motion reduced',
  'copy smp','copy discord','copy plugin','copy website','copy diagnostics',
  'qr smp','qr discord','qr website','session','profiler','diagnostics','diagnostics export','ping','uptime',
  'random','daily','leaderboard','vote','challenge','fortune','signal','campaign','protocol alpha','protocol midnight','protocol overdrive','protocol origin','search','sound on','sound off','event',
  'terminal export','terminal import ','repeat 3 network','dev info','dev routes','dev release','dev storage',
  'ls /network/archive','cat /network/archive/origin.txt','cat /network/archive/founder.log','cat /network/archive/arcade.sys',
  'clear','clear data',
]

const TERMINAL_MAN={
  help:['help','Lists core command groups. Use "help advanced" for the full operator index.'],
  network:['network','Shows live Website, SMP, Plugin, Arcade, Discord, and release status.'],
  map:['map','Renders a text network topology with current live states.'],
  watch:['watch <command>','Refreshes a safe status command every three seconds. Use "watch stop" to end it.'],
  alias:['alias <name> "<command>"','Creates a custom one-word shortcut. Use "alias" to list and "unalias <name>" to remove.'],
  macro:['macro save <name> "<cmd && cmd>"','Stores a multi-command routine. Use "macro run <name>" or "macro delete <name>".'],
  logs:['logs [arcade|achievements|network]','Shows recent device-local activity and progress logs.'],
  notifications:['notifications [network|achievements|rewards|releases|events]','Shows the Terminal notification console with optional filters. Use "notifications clear" to mark current notices read.'],
  copy:['copy <smp|discord|plugin|website|diagnostics>','Copies useful ESN information to your clipboard.'],
  qr:['qr <smp|discord|website>','Displays a scannable QR code for the selected ESN destination.'],
  session:['session','Shows this visit: duration, pages seen, commands run, and Arcade XP earned.'],
  profiler:['profiler','Measures an approximate browser frame rate and reports the active rendering profile.'],
  diagnostics:['diagnostics','Shows public browser/device/site diagnostics. "diagnostics export" copies a support-ready report.'],
  dashboard:['dashboard [arcade|network|missions]','Prints a compact ASCII/Unicode dashboard in the Terminal.'],
  challenge:['challenge','Shows today’s Terminal challenge. Complete its requested command for bonus Network XP.'],
  signal:['signal','Tunes into a daily ESN signal. Rare signals can contain a Terminal-only collectible.'],
  campaign:['campaign | protocol <alpha|midnight|overdrive|origin>','Runs the hidden multi-stage ESN Terminal protocol campaign. Each stage unlocks only after the previous stage is complete.'],
  fortune:['fortune','Returns a random ESN network message, hint, or operator line.'],
  repeat:['repeat <1-10> <safe command>','Repeats a safe local/read-only command up to ten times.'],
  terminal:['terminal export | terminal import <code> | terminal theme <theme>','Moves Terminal setup between devices or changes the Terminal-only visual theme.'],
  dev:['dev info | dev routes | dev release | dev storage','Read-only public developer information. No secrets or private server data are exposed.'],
  lore:['ls /network/archive | cat /network/archive/<file>','Explores hidden ESN archive files and Terminal-only relics.'],
}

const TERMINAL_LORE={
  '/network/archive/origin.txt':[
    'ES NETWORK ARCHIVE // ORIGIN',
    'EP1C Services was the former name. ES Network is the current organization and identity.',
    'The archive records the rename as an evolution of the same project, not a separate active division.',
  ],
  '/network/archive/founder.log':[
    'FOUNDER CHANNEL // AUTHORIZED PUBLIC RECORD',
    'Landon // Founder & CEO of ES Network.',
    'The Founder channel is tied to one of the network’s hidden signals.',
  ],
  '/network/archive/arcade.sys':[
    'ARCADE CORE // SIX ACTIVE MODULES',
    'CLICKER • FACTORY • MINES • MOTO • TOWER • TOWER DEFENSE',
    'Local progression links Arcade activity into the wider ESN Passport and return-loop systems.',
  ],
  '/network/archive/rift.sig':[
    'RIFT SIGNAL // PARTIAL',
    'violet/cyan carrier detected',
    'Hint: some Terminal protocols are names already hidden elsewhere in the network.',
  ],
  '/network/archive/legacy.1337':[
    'LEGACY CHANNEL // 1337',
    'Old network habits leave new traces.',
    'The terminal remembers operators who still know where to look.',
  ],
}

function terminalLevenshtein(a,b){
  const left=String(a||''),right=String(b||'')
  const row=Array.from({length:right.length+1},(_,i)=>i)
  for(let i=1;i<=left.length;i++){
    let prev=row[0]
    row[0]=i
    for(let j=1;j<=right.length;j++){
      const old=row[j]
      row[j]=Math.min(row[j]+1,row[j-1]+1,prev+(left[i-1]===right[j-1]?0:1))
      prev=old
    }
  }
  return row[right.length]
}

function terminalClosestCommand(value){
  const query=String(value||'').trim().toLowerCase()
  if(!query)return null
  const ranked=TERMINAL_COMMANDS.map(item=>({item,score:terminalLevenshtein(query,item)})).sort((a,b)=>a.score-b.score)
  const best=ranked[0]
  return best&&best.score<=Math.max(2,Math.floor(query.length*.28))?best.item:null
}

async function terminalCopy(value){
  try{
    await navigator.clipboard.writeText(String(value))
    return true
  }catch{
    try{
      const node=document.createElement('textarea')
      node.value=String(value)
      node.style.position='fixed'
      node.style.opacity='0'
      document.body.appendChild(node)
      node.select()
      const ok=document.execCommand('copy')
      node.remove()
      return ok
    }catch{return false}
  }
}

function terminalEncode(value){
  try{return btoa(unescape(encodeURIComponent(JSON.stringify(value))))}catch{return ''}
}

function terminalDecode(value){
  try{return JSON.parse(decodeURIComponent(escape(atob(value))))}catch{return null}
}

function terminalBar(value,total=100,width=18){
  const ratio=Math.max(0,Math.min(1,Number(value||0)/Math.max(1,Number(total||1))))
  const filled=Math.round(ratio*width)
  return '['+'█'.repeat(filled)+'░'.repeat(width-filled)+'] '+Math.round(ratio*100)+'%'
}

function terminalDateSeed(){
  const key=terminalDateKey().replace(/\D/g,'')
  return Number(key)||1
}


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

function terminalDateKey(){
  const date=new Date()
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
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
  useEffect(()=>{
    const root=document.documentElement
    const body=document.body
    const previousRootOverflow=root.style.overflow
    const previousBodyOverflow=body.style.overflow
    root.classList.add('esn-system-modal-open')
    root.style.overflow='hidden'
    body.style.overflow='hidden'
    return()=>{
      root.classList.remove('esn-system-modal-open')
      root.style.overflow=previousRootOverflow
      body.style.overflow=previousBodyOverflow
    }
  },[])

  return <div className="ev-backdrop" role="presentation" onPointerDown={event=>{if(event.target===event.currentTarget)onClose()}}>
    <section className={'ev-modal '+className} role="dialog" aria-modal="true" aria-label={title} onPointerDown={event=>event.stopPropagation()}>
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
  const inputRef=useRef(null)
  const runRef=useRef(null)
  const sessionStarted=useRef(Number(sessionStorage.getItem('esn_session_started'))||Date.now())
  const sessionStartXp=useRef(Number(sessionStorage.getItem('esn_terminal_session_xp'))||Math.floor(arcade.progress.xp||0))
  const [value,setValue]=useState('')
  const [lines,setLines]=useState([])
  const [history,setHistory]=useState(()=>readJson(TERMINAL_HISTORY_KEY,[]))
  const [historyIndex,setHistoryIndex]=useState(-1)
  const [historySearch,setHistorySearch]=useState(false)
  const [clearArmed,setClearArmed]=useState(false)
  const [watchCommand,setWatchCommand]=useState('')
  const [qrData,setQrData]=useState(null)
  const [online,setOnline]=useState(()=>navigator.onLine)
  const [booting,setBooting]=useState(true)
  const [sessionCommands,setSessionCommands]=useState(0)
  const [terminalTheme,setTerminalTheme]=useState(()=>localStorage.getItem(TERMINAL_THEME_KEY)||'cyan')
  const [crtEnabled,setCrtEnabled]=useState(()=>localStorage.getItem(TERMINAL_CRT_KEY)==='1')
  const [aliases,setAliases]=useState(()=>readJson(TERMINAL_ALIASES_KEY,{}))
  const [macros,setMacros]=useState(()=>readJson(TERMINAL_MACROS_KEY,{}))
  const [operator,setOperator]=useState(()=>readJson(TERMINAL_OPERATOR_KEY,{xp:0,commands:0,achievements:{},relics:[],used:[]}))

  useEffect(()=>{
    if(!sessionStorage.getItem('esn_session_started'))sessionStorage.setItem('esn_session_started',String(sessionStarted.current))
    if(!sessionStorage.getItem('esn_terminal_session_xp'))sessionStorage.setItem('esn_terminal_session_xp',String(sessionStartXp.current))
    const steps=[
      [0,'ESN TERMINAL // BOOTING OPERATOR CORE'],
      [150,'CHECK // WEBSITE LINK ... '+(navigator.onLine?'OK':'OFFLINE / LOCAL MODE')],
      [300,'CHECK // ARCADE CORE ... 6 MODULES READY'],
      [450,'CHECK // SMP CHANNEL ... '+String(live.smp.status||'CHECKING').toUpperCase()],
      [600,'CHECK // LOCAL PASSPORT ... MOUNTED'],
      [760,'READY // Type "help" or press TAB for commands. ↑/↓ history • Ctrl+R search'],
    ]
    const timers=steps.map(([delay,text])=>window.setTimeout(()=>setLines(current=>[...current,{kind:delay===760?'ok':'system',text}]),delay))
    timers.push(window.setTimeout(()=>setBooting(false),800))
    return()=>timers.forEach(timer=>window.clearTimeout(timer))
  },[])

  useEffect(()=>{
    const setOn=()=>setOnline(true)
    const setOff=()=>setOnline(false)
    window.addEventListener('online',setOn)
    window.addEventListener('offline',setOff)
    return()=>{window.removeEventListener('online',setOn);window.removeEventListener('offline',setOff)}
  },[])

  useEffect(()=>{
    return()=>{
      setWatchCommand('')
      document.documentElement.classList.remove('terminal-crt-active')
    }
  },[])

  useEffect(()=>{
    document.documentElement.classList.toggle('terminal-crt-active',crtEnabled)
    localStorage.setItem(TERMINAL_CRT_KEY,crtEnabled?'1':'0')
  },[crtEnabled])

  useEffect(()=>{
    localStorage.setItem(TERMINAL_THEME_KEY,terminalTheme)
  },[terminalTheme])

  const suggestions=useMemo(()=>{
    const q=value.trim().toLowerCase()
    const custom=[
      ...Object.keys(aliases),
      ...Object.keys(macros).map(name=>'macro run '+name),
    ]
    const source=[...TERMINAL_COMMANDS,...custom]
    if(!q)return source.slice(0,7)
    return [...new Set(source.filter(item=>item.toLowerCase().startsWith(q)||item.toLowerCase().includes(q)))].slice(0,7)
  },[value,aliases,macros])

  const historyMatches=useMemo(()=>{
    const q=value.trim().toLowerCase()
    return history.filter(item=>!q||item.toLowerCase().includes(q)).slice(0,12)
  },[history,value])

  const push=(kind,text)=>setLines(current=>[...current,{kind,text}].slice(-120))
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

  const awardOperator=(id,label,xp=25,relic=null)=>{
    const current=readJson(TERMINAL_OPERATOR_KEY,{xp:0,commands:0,achievements:{},relics:[],used:[]})
    if(current.achievements?.[id])return false
    const next={
      ...current,
      xp:(current.xp||0)+xp,
      achievements:{...(current.achievements||{}),[id]:{label,xp,at:Date.now()}},
      relics:relic&&!current.relics?.includes(relic)?[...(current.relics||[]),relic]:(current.relics||[]),
    }
    writeJson(TERMINAL_OPERATOR_KEY,next)
    setOperator(next)
    const retention=readJson('esn_retention_v1',{networkXp:0,shards:0,collectibles:[]})
    const collectibles=relic&&!retention.collectibles?.includes(relic)?[...(retention.collectibles||[]),relic]:(retention.collectibles||[])
    writeJson('esn_retention_v1',{...retention,networkXp:(retention.networkXp||0)+xp,shards:(retention.shards||0)+1,collectibles})
    window.dispatchEvent(new CustomEvent('esn-achievement',{detail:{title:'Terminal achievement: '+label,copy:'+'+xp+' Network XP • +1 Network Shard'}}))
    window.dispatchEvent(new Event('esn-progress-change'))
    return true
  }

  const trackOperator=command=>{
    const current=readJson(TERMINAL_OPERATOR_KEY,{xp:0,commands:0,achievements:{},relics:[],used:[]})
    const used=[command,...(current.used||[]).filter(item=>item!==command)].slice(0,60)
    const next={...current,xp:(current.xp||0)+3,commands:(current.commands||0)+1,used}
    writeJson(TERMINAL_OPERATOR_KEY,next)
    setOperator(next)
    if(next.commands===1)window.setTimeout(()=>awardOperator('first-command','First Contact',25),0)
    if(next.commands>=25)window.setTimeout(()=>awardOperator('command-25','Command Cadet',35),0)
    if(next.commands>=100)window.setTimeout(()=>awardOperator('command-100','Network Operator',80,'Operator Core Fragment'),0)
  }

  const challengeData=()=>{
    const list=[
      ['systems-scan','Systems Scan','Run "network".','network',60],
      ['arcade-audit','Arcade Audit','Run "arcade stats".','arcade stats',60],
      ['smp-pulse','SMP Pulse','Run "smp status".','smp status',60],
      ['inventory-check','Inventory Check','Run "inventory".','inventory',60],
      ['diagnostic-cycle','Diagnostic Cycle','Run "diagnostics".','diagnostics',70],
      ['daily-sync','Daily Sync','Run "daily".','daily',60],
    ]
    return list[terminalDateSeed()%list.length]
  }

  const checkChallenge=command=>{
    const [id,title,copy,target,xp]=challengeData()
    const today=terminalDateKey()
    const current=readJson(TERMINAL_CHALLENGE_KEY,{date:today,id,complete:false})
    const state=current.date===today&&current.id===id?current:{date:today,id,complete:false}
    if(!state.complete&&command===target){
      writeJson(TERMINAL_CHALLENGE_KEY,{...state,complete:true,at:Date.now()})
      const retention=readJson('esn_retention_v1',{networkXp:0,shards:0})
      writeJson('esn_retention_v1',{...retention,networkXp:(retention.networkXp||0)+xp,shards:(retention.shards||0)+2})
      window.dispatchEvent(new CustomEvent('esn-achievement',{detail:{title:'Terminal challenge complete: '+title,copy:'+'+xp+' Network XP • +2 Network Shards'}}))
      window.dispatchEvent(new Event('esn-progress-change'))
      push('ok','CHALLENGE COMPLETE // '+title+' • +'+xp+' XP • +2 Shards')
    }
  }

  const diagnosticsText=()=>{
    const prefs=readJson(TERMINAL_PREF_KEY,{performance:'auto',reducedMotion:false})
    return [
      'ESN DIAGNOSTIC REPORT',
      'Release: '+SITE_RELEASE,
      'URL: '+window.location.href,
      'Viewport: '+window.innerWidth+'x'+window.innerHeight+' @ '+(window.devicePixelRatio||1)+' DPR',
      'CPU: '+(navigator.hardwareConcurrency||'unknown')+' logical cores',
      'Memory: '+(navigator.deviceMemory?navigator.deviceMemory+' GB browser estimate':'not exposed'),
      'Connection: '+(navigator.onLine?'online':'offline')+(navigator.connection?.effectiveType?' / '+navigator.connection.effectiveType:''),
      'Performance: '+(document.documentElement.dataset.performanceMode||prefs.performance||'auto'),
      'Motion: '+(document.documentElement.dataset.motion||'full'),
      'Terminal theme: '+terminalTheme+(crtEnabled?' + CRT':''),
      'User agent: '+navigator.userAgent,
    ].join('\n')
  }

  const measureFps=()=>new Promise(resolve=>{
    let frames=0
    const started=performance.now()
    const tick=now=>{
      frames+=1
      if(now-started>=650){resolve(Math.round(frames/((now-started)/1000)));return}
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })

  const run=async(raw,options={})=>{
    const original=String(raw||'').trim()
    if(!original)return
    let command=original.toLowerCase()

    if(command.includes('&&')&&!command.startsWith('macro save ')&&!command.startsWith('alias ')&&!options.noChain){
      if(options.record!==false){
        push('input','> '+original)
        const nextHistory=[original,...history.filter(item=>item.toLowerCase()!==command)].slice(0,60)
        setHistory(nextHistory);writeJson(TERMINAL_HISTORY_KEY,nextHistory);setSessionCommands(n=>n+1);trackOperator(command)
      }
      const parts=original.split('&&').map(item=>item.trim()).filter(Boolean)
      push('system','CHAIN // '+parts.length+' commands')
      for(const part of parts)await runRef.current(part,{record:false,noChain:true})
      setValue('')
      return
    }

    const first=command.split(/\s+/)[0]
    if(aliases[first]&&!options.aliasExpanded){
      const rest=original.split(/\s+/).slice(1).join(' ')
      const expanded=aliases[first]+(rest?' '+rest:'')
      push('system','ALIAS '+first+' → '+expanded)
      await runRef.current(expanded,{...options,record:options.record,aliasExpanded:true})
      return
    }

    if(options.record!==false){
      localStorage.setItem('esn_terminal_used','1')
      window.dispatchEvent(new Event('esn-progress-change'))
      push('input','> '+original)
      const nextHistory=[original,...history.filter(item=>item.toLowerCase()!==command)].slice(0,60)
      setHistory(nextHistory)
      writeJson(TERMINAL_HISTORY_KEY,nextHistory)
      setHistoryIndex(-1)
      setHistorySearch(false)
      setSessionCommands(n=>n+1)
      trackOperator(command)
      checkChallenge(command)
    }else if(options.watch){
      push('watch','↻ '+new Date().toLocaleTimeString()+' // '+original.toUpperCase())
    }

    const protocolMap={kavero:'typed-kavero',warden:'typed-warden',riftwalker:'typed-riftwalker',void:'typed-void','1337':'typed-1337'}

    if(command==='help'){
      pushMany('system',[
        'CORE // network, map, status, smp status, arcade stats, dashboard, profile',
        'OPERATOR // man, alias, macro, watch, logs, notifications, session, profiler',
        'UTILITY // copy, qr, favorites, search, repeat, terminal export/import',
        'CUSTOMIZE // terminal theme, crt, site theme, performance, motion',
        'DISCOVERY // challenge, fortune, signal, dev, ls /network/archive, cat <file>',
        'Type "help advanced" for the complete command index.',
      ])
    }else if(command==='help advanced'){
      pushMany('system',[
        'ADVANCED ESN TERMINAL INDEX',
        'NETWORK // network | map | status | smp | smp status | release latest | ping | uptime',
        'ARCADE // arcade | arcade stats | arcade launch <game> | leaderboard | dashboard arcade',
        'PROGRESS // missions | rewards | inventory | profile | whoami | daily | challenge',
        'OPERATOR // operator | man <command> | alias | macro | watch | history | logs | notifications',
        'UTILITY // copy <target> | qr <target> | search <term> | favorites | random | repeat',
        'VISUAL // terminal theme <theme> | crt on/off | theme <site-theme> | performance | motion',
        'SYSTEM // session | profiler | diagnostics | diagnostics export | terminal export/import',
        'ARCHIVE // ls /network/archive | cat /network/archive/<file> | signal | fortune',
        'DEV // dev info | dev routes | dev release | dev storage',
        'KEYS // ↑/↓ history • TAB/Ctrl+Space autocomplete • Ctrl+R history search • Ctrl+L clear • "/" search',
      ])
    }else if(command.startsWith('man ')){
      const rawKey=command.slice(4).trim()
      const key=TERMINAL_MAN[rawKey]?rawKey:rawKey.split(' ')[0]
      const doc=TERMINAL_MAN[key]
      if(doc){pushMany('system',['MANUAL // '+key.toUpperCase(),'USAGE // '+doc[0],doc[1]]);awardOperator('manual-reader','Manual Reader',25)}
      else push('error','No manual page for "'+rawKey+'". Try man watch, man macro, man diagnostics, or help advanced.')
    }else if(command==='operator'){
      const current=readJson(TERMINAL_OPERATOR_KEY,{xp:0,commands:0,achievements:{},relics:[]})
      const rank=Math.floor((current.xp||0)/120)+1
      pushMany('ok',[
        'OPERATOR RANK // '+rank,
        'MASTERY XP // '+Math.floor(current.xp||0).toLocaleString(),
        'COMMANDS RUN // '+(current.commands||0),
        'TERMINAL ACHIEVEMENTS // '+Object.keys(current.achievements||{}).length,
        'TERMINAL RELICS // '+((current.relics||[]).join(', ')||'none yet'),
      ])
    }else if(command==='network'){
      pushMany('ok',[
        'WEBSITE // '+String(live.website.status||'online').toUpperCase(),
        '├─ SMP // '+String(live.smp.status||'checking').toUpperCase()+(live.smp.players!=null?' • '+live.smp.players+(live.smp.maxPlayers!=null?'/'+live.smp.maxPlayers:'')+' players':''),
        '├─ PLUGIN // '+(live.plugin.version||'checking'),
        '├─ ARCADE // 6 games operational',
        '└─ DISCORD // '+String(live.discord.status||'checking').toUpperCase()+(live.discord.members!=null?' • '+live.discord.members+' members':''),
        'RELEASE // '+SITE_RELEASE,
      ])
    }else if(command==='map'){
      pushMany('system',[
        '              ┌─────────────┐',
        '              │  ES NETWORK │',
        '              └──────┬──────┘',
        '       ┌──────────────┼──────────────┐',
        '       ▼              ▼              ▼',
        '  SMP ['+(live.smp.status==='online'?'LIVE':'CHECK')+']     ARCADE [6/6]     TOOLS [LIVE]',
        '       │                             │',
        '       └──── PLUGIN ['+(live.plugin.version||'…')+']       └──── PASSPORT [LOCAL]',
        '              DISCORD ['+String(live.discord.status||'CHECK').toUpperCase()+']',
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
        'ARCADE LEVEL // '+arcade.level+' '+terminalBar(arcade.levelProgress*100),
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
    }else if(command==='dashboard'||command==='dashboard network'){
      pushMany('system',[
        '┌─ ESN NETWORK DASHBOARD ─────────────────────┐',
        '│ WEBSITE  '+String(live.website.status||'online').toUpperCase().padEnd(10)+' SMP '+String(live.smp.status||'checking').toUpperCase().padEnd(10)+' │',
        '│ ARCADE   6/6 LIVE    PLUGIN '+String(live.plugin.version||'…').slice(0,15).padEnd(15)+' │',
        '│ DISCORD  '+String(live.discord.status||'checking').toUpperCase().padEnd(10)+' RELEASE ACTIVE        │',
        '└─────────────────────────────────────────────┘',
      ])
    }else if(command==='dashboard arcade'){
      const totals=arcade.progress.totals||{}
      pushMany('system',[
        '┌─ ARCADE DASHBOARD ──────────────────────────┐',
        '│ LEVEL '+String(arcade.level).padEnd(5)+' XP '+String(Math.floor(arcade.progress.xp||0)).padEnd(12)+' ACH '+String(arcade.achievementCount).padEnd(5)+'│',
        '│ '+terminalBar(arcade.levelProgress*100,100,28)+' │',
        '│ MOTO '+String(totals.motoFinishes||0).padEnd(7)+' TOWER '+String(totals.towerFloors||0).padEnd(7)+' TD '+String(totals.tdWaves||0).padEnd(7)+'│',
        '└─────────────────────────────────────────────┘',
      ])
    }else if(command==='dashboard missions'){
      const visited=readJson('esn_passport_routes',[])
      const eggs=readEggs()
      const complete=MISSIONS.filter(item=>completeMission(item,visited,eggs))
      pushMany('system',['MISSION DASHBOARD // '+complete.length+'/'+MISSIONS.length,terminalBar(complete.length,MISSIONS.length,28),...MISSIONS.map(item=>(complete.includes(item)?'✓ ':'○ ')+item.title)])
    }else if(command==='tools')go('/estools','ES Tools')
    else if(command==='updates')go('/updates','Release Center')
    else if(command==='timeline')go('/timeline','Timeline')
    else if(command==='release latest')push('ok','LATEST RELEASE // '+SITE_RELEASE+' // Open /updates for the full release history.')
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
      const current=readJson(TERMINAL_OPERATOR_KEY,{xp:0})
      pushMany('system',[
        'IDENTITY // ESN LOCAL OPERATOR',
        'PASSPORT // LEVEL '+data.level+' • '+data.xp.toLocaleString()+' XP',
        'OPERATOR RANK // '+(Math.floor((current.xp||0)/120)+1),
        'STREAK // '+(retention.streak||0)+' days',
        'NETWORK SHARDS // '+(retention.shards||0),
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
      const today=terminalDateKey()
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
      const current=readJson(TERMINAL_OPERATOR_KEY,{relics:[]})
      pushMany('system',[
        'NETWORK SHARDS // '+(retention.shards||0),
        'COLLECTIBLES // '+((retention.collectibles||[]).join(', ')||'none yet'),
        'TERMINAL RELICS // '+((current.relics||[]).join(', ')||'none yet'),
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
      awardOperator('vault-terminal','Terminal Vault Authorization',80,'Midnight Authorization Chip')
      push('ok','VAULT AUTHORIZATION ACCEPTED // Midnight Core enabled.')
    }else if(command==='campaign'){
      const state=readJson(TERMINAL_CAMPAIGN_KEY,{stage:0,complete:false,startedAt:null})
      const labels=['LOCKED SIGNAL','ALPHA HANDSHAKE','MIDNIGHT AUTHORIZATION','CORE OVERDRIVE','ORIGIN COMPLETE']
      const hints=[
        'Begin with: protocol alpha',
        'The second protocol is tied to the Vault and Midnight Core.',
        'The third protocol is named after the Reactor state beyond 100% charge.',
        'One archive file keeps returning to the beginning. Try its name as a protocol.',
        'Campaign complete. Classified Core Token retained locally.',
      ]
      pushMany(state.complete?'ok':'system',[
        'ESN CLASSIFIED PROTOCOL CAMPAIGN',
        'STAGE // '+Math.min(4,state.stage||0)+'/4 • '+labels[Math.min(4,state.stage||0)],
        'CLUE // '+hints[Math.min(4,state.stage||0)],
        'SCOPE // Local device progression. No account required.',
      ])
    }else if(command==='protocol alpha'){
      const state=readJson(TERMINAL_CAMPAIGN_KEY,{stage:0,complete:false})
      if((state.stage||0)>0)push('system','ALPHA PROTOCOL // already synchronized.')
      else{
        writeJson(TERMINAL_CAMPAIGN_KEY,{...state,stage:1,startedAt:Date.now(),alphaAt:Date.now()})
        awardOperator('campaign-alpha','Alpha Signal Decoder',60,'Alpha Handshake Key')
        pushMany('ok',['ALPHA PROTOCOL ACCEPTED','Carrier lock established.','NEXT CLUE // The Vault knows Midnight.'])
      }
    }else if(command==='protocol midnight'){
      const state=readJson(TERMINAL_CAMPAIGN_KEY,{stage:0,complete:false})
      if((state.stage||0)<1)push('error','MIDNIGHT PROTOCOL // Alpha handshake required first.')
      else if(localStorage.getItem('esn_vault_unlocked')!=='1')push('error','MIDNIGHT PROTOCOL // Vault authorization required.')
      else if((state.stage||0)>1)push('system','MIDNIGHT PROTOCOL // already synchronized.')
      else{
        writeJson(TERMINAL_CAMPAIGN_KEY,{...state,stage:2,midnightAt:Date.now()})
        awardOperator('campaign-midnight','Midnight Protocol',75,'Midnight Cipher Fragment')
        pushMany('ok',['MIDNIGHT PROTOCOL ACCEPTED','Vault carrier linked to Terminal.','NEXT CLUE // Push the Core into OVERDRIVE.'])
      }
    }else if(command==='protocol overdrive'){
      const state=readJson(TERMINAL_CAMPAIGN_KEY,{stage:0,complete:false})
      if((state.stage||0)<2)push('error','OVERDRIVE PROTOCOL // Midnight authorization required first.')
      else if((state.stage||0)>2)push('system','OVERDRIVE PROTOCOL // already synchronized.')
      else{
        writeJson(TERMINAL_CAMPAIGN_KEY,{...state,stage:3,overdriveAt:Date.now()})
        awardOperator('campaign-overdrive','Core Overdrive Link',90,'Overdrive Reactor Seal')
        window.dispatchEvent(new CustomEvent('esn-local-notification',{detail:{type:'PROTOCOL',title:'Core protocol synchronized',copy:'Terminal campaign stage 3/4 complete.'}}))
        pushMany('ok',['OVERDRIVE PROTOCOL ACCEPTED','Core channel at classified resonance.','FINAL CLUE // Every network has an ORIGIN.'])
      }
    }else if(command==='protocol origin'){
      const state=readJson(TERMINAL_CAMPAIGN_KEY,{stage:0,complete:false})
      if((state.stage||0)<3)push('error','ORIGIN PROTOCOL // Core Overdrive synchronization required first.')
      else if(state.complete)push('ok','ORIGIN PROTOCOL // campaign already complete.')
      else{
        const next={...state,stage:4,complete:true,completedAt:Date.now()}
        writeJson(TERMINAL_CAMPAIGN_KEY,next)
        awardOperator('campaign-origin','Classified Network Operator',150,'Classified Core Token')
        const retention=readJson('esn_retention_v1',{networkXp:0,shards:0,collectibles:[]})
        writeJson('esn_retention_v1',{...retention,networkXp:(retention.networkXp||0)+150,shards:(retention.shards||0)+5,collectibles:[...new Set([...(retention.collectibles||[]),'Classified Core Token'])]})
        window.dispatchEvent(new Event('esn-progress-change'))
        window.dispatchEvent(new CustomEvent('esn-local-notification',{detail:{type:'PROTOCOL',title:'Classified campaign complete',copy:'Classified Core Token + 5 Network Shards unlocked.'}}))
        pushMany('ok',['ORIGIN PROTOCOL ACCEPTED','CLASSIFIED CAMPAIGN COMPLETE','REWARD // Classified Core Token • +150 Network XP • +5 Shards'])
      }
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
    }else if(command==='alias'){
      const entries=Object.entries(aliases)
      push('system','ALIASES // '+(entries.length?entries.map(([name,target])=>name+' → '+target).join(' • '):'none yet'))
    }else if(command.startsWith('unalias ')){
      const name=command.slice(8).trim()
      if(!aliases[name])push('error','Alias "'+name+'" does not exist.')
      else{
        const next={...aliases};delete next[name];setAliases(next);writeJson(TERMINAL_ALIASES_KEY,next);push('ok','Alias removed // '+name)
      }
    }else if(command.startsWith('alias ')){
      const match=original.match(/^alias\s+([a-z0-9_-]+)\s+["']?(.+?)["']?$/i)
      if(!match)push('error','Usage: alias <name> "<command>"')
      else{
        const name=match[1].toLowerCase(),target=match[2].replace(/^["']|["']$/g,'').trim()
        if(['help','clear','alias','macro'].includes(name))push('error','That alias name is reserved.')
        else{
          const next={...aliases,[name]:target};setAliases(next);writeJson(TERMINAL_ALIASES_KEY,next);push('ok','Alias saved // '+name+' → '+target);awardOperator('alias-maker','Shortcut Architect',30)
        }
      }
    }else if(command==='macro'){
      const entries=Object.entries(macros)
      push('system','MACROS // '+(entries.length?entries.map(([name,body])=>name+' → '+body).join(' • '):'none yet'))
    }else if(command.startsWith('macro run ')){
      const name=command.slice(10).trim()
      if(!macros[name])push('error','Macro "'+name+'" not found.')
      else{
        push('system','MACRO '+name.toUpperCase()+' // '+macros[name])
        await runRef.current(macros[name],{record:false})
      }
    }else if(command.startsWith('macro delete ')){
      const name=command.slice(13).trim()
      if(!macros[name])push('error','Macro "'+name+'" not found.')
      else{
        const next={...macros};delete next[name];setMacros(next);writeJson(TERMINAL_MACROS_KEY,next);push('ok','Macro deleted // '+name)
      }
    }else if(command.startsWith('macro save ')){
      const match=original.match(/^macro\s+save\s+([a-z0-9_-]+)\s+["']?(.+?)["']?$/i)
      if(!match)push('error','Usage: macro save <name> "command && command"')
      else{
        const name=match[1].toLowerCase(),body=match[2].replace(/^["']|["']$/g,'').trim()
        const next={...macros,[name]:body};setMacros(next);writeJson(TERMINAL_MACROS_KEY,next);push('ok','Macro saved // '+name+' → '+body);awardOperator('macro-maker','Routine Builder',35)
      }
    }else if(command==='watch stop'){
      setWatchCommand('');push('ok','WATCH // stopped')
    }else if(command.startsWith('watch ')){
      const target=command.slice(6).trim()
      if(!TERMINAL_WATCHABLE.includes(target))push('error','Watch supports: '+TERMINAL_WATCHABLE.join(', '))
      else{setWatchCommand(target);push('ok','WATCH // '+target+' every 3 seconds • use "watch stop"');awardOperator('watcher','Live Channel Watcher',35)}
    }else if(command==='history'){
      if(!history.length)push('system','COMMAND HISTORY // empty')
      else history.slice(0,15).forEach((item,index)=>push('system',String(index+1).padStart(2,'0')+' // '+item))
    }else if(command==='logs'||command==='logs network'){
      const routes=readJson('esn_recent_routes',[])
      pushMany('system',[
        'NETWORK LOG // '+SITE_RELEASE,
        'RECENT ROUTES // '+(routes.join(' → ')||'none'),
        'SMP LAST CHECK // '+(live.checkedAt?new Date(live.checkedAt).toLocaleString():'not checked'),
        'TERMINAL COMMANDS // '+(readJson(TERMINAL_OPERATOR_KEY,{commands:0}).commands||0),
      ])
    }else if(command==='logs arcade'){
      const recent=arcade.progress.recent||[]
      if(!recent.length)push('system','ARCADE LOG // no recent XP events')
      else recent.slice(0,12).forEach(item=>push('system',new Date(item.at).toLocaleTimeString()+' // '+item.label+' +'+item.xp+' XP'))
    }else if(command==='logs achievements'){
      const op=readJson(TERMINAL_OPERATOR_KEY,{achievements:{}})
      const combined=[
        ...Object.values(arcade.progress.achievements||{}).map(item=>({label:'ARCADE • '+item.label,at:item.at})),
        ...Object.values(op.achievements||{}).map(item=>({label:'TERMINAL • '+item.label,at:item.at})),
      ].sort((a,b)=>(b.at||0)-(a.at||0)).slice(0,16)
      if(!combined.length)push('system','ACHIEVEMENT LOG // empty')
      else combined.forEach(item=>push('system',(item.at?new Date(item.at).toLocaleDateString():'—')+' // '+item.label))
    }else if(command==='notifications clear'){
      localStorage.setItem(TERMINAL_NOTICE_CLEAR_KEY,String(Date.now()));push('ok','NOTIFICATIONS // current Terminal notices marked read')
    }else if(command==='notifications'||command.startsWith('notifications ')){
      const filter=command==='notifications'?'all':command.slice('notifications '.length).trim()
      const allowed=['all','network','achievements','rewards','releases','events']
      if(!allowed.includes(filter))push('error','Notification filters: network, achievements, rewards, releases, events')
      else{
        const cleared=Number(localStorage.getItem(TERMINAL_NOTICE_CLEAR_KEY)||0)
        const notices=[]
        const add=(type,text,at=Date.now())=>{if((filter==='all'||filter===type)&&at>cleared)notices.push(type.toUpperCase()+' • '+text)}
        if(live.checkedAt)add('network','SMP '+String(live.smp.status||'checking').toUpperCase()+' • Plugin '+(live.plugin.version||'checking'),new Date(live.checkedAt).getTime())
        ;(arcade.progress.recent||[]).slice(0,6).forEach(item=>add('achievements',item.label+' • +'+item.xp+' XP',item.at||0))
        const retention=readJson('esn_retention_v1',{lastClaim:null,streak:0,shards:0})
        if(retention.lastClaim===terminalDateKey())add('rewards','Daily reward claimed • streak '+(retention.streak||0)+' • '+(retention.shards||0)+' shards',Date.now())
        const releaseSeen=Number(localStorage.getItem('esn_terminal_release_seen_at')||0)
        if(!releaseSeen)add('releases',SITE_RELEASE,Date.now())
        const season=currentSeason()
        add('events',season.label+' • '+season.copy,Date.now())
        if(!notices.length)push('system','NOTIFICATIONS // no unread '+(filter==='all'?'Terminal':'filtered')+' notices')
        else notices.forEach(item=>push('ok','NOTICE // '+item))
        if(filter==='releases')localStorage.setItem('esn_terminal_release_seen_at',String(Date.now()))
      }
    }else if(command.startsWith('terminal theme ')){
      const theme=command.slice('terminal theme '.length).trim()
      if(!TERMINAL_UI_THEMES.includes(theme))push('error','Terminal themes: '+TERMINAL_UI_THEMES.join(', '))
      else{
        setTerminalTheme(theme);localStorage.setItem(TERMINAL_THEME_KEY,theme)
        if(theme==='crt')setCrtEnabled(true)
        push('ok','TERMINAL THEME // '+theme.toUpperCase())
      }
    }else if(command==='crt on'){
      setCrtEnabled(true);push('ok','CRT EFFECTS // ON')
    }else if(command==='crt off'){
      setCrtEnabled(false);push('ok','CRT EFFECTS // OFF')
    }else if(command.startsWith('theme ')){
      const theme=command.slice(6).trim()
      if(!TERMINAL_THEMES.includes(theme))push('error','Site themes: dynamic, esn, void, smp, arcade, warden, riftwalker'+(localStorage.getItem('esn_vault_unlocked')==='1'?', midnight':''))
      else if(theme==='midnight'&&localStorage.getItem('esn_vault_unlocked')!=='1')push('error','Midnight Core is Vault-locked.')
      else{
        localStorage.setItem('esn_visual_theme',theme)
        window.dispatchEvent(new CustomEvent('esn-terminal-theme',{detail:{theme}}))
        push('ok','SITE THEME // '+theme.toUpperCase())
      }
    }else if(command.startsWith('performance ')){
      const mode=command.slice(12).trim()
      if(!['auto','performance','premium'].includes(mode))push('error','Performance modes: auto, performance, premium')
      else{savePrefs({performance:mode});push('ok','PERFORMANCE PROFILE // '+mode.toUpperCase())}
    }else if(command.startsWith('motion ')){
      const mode=command.slice(7).trim()
      if(!['full','reduced'].includes(mode))push('error','Motion modes: full, reduced')
      else{savePrefs({reducedMotion:mode==='reduced'});push('ok','MOTION PROFILE // '+mode.toUpperCase())}
    }else if(command.startsWith('copy ')){
      const target=command.slice(5).trim()
      const values={
        smp:SMP_ADDRESS+':'+SMP_PORT,
        discord:DISCORD_URL,
        plugin:TERMINAL_PLUGIN_URL,
        website:window.location.origin,
        diagnostics:diagnosticsText(),
      }
      if(!values[target])push('error','Copy targets: smp, discord, plugin, website, diagnostics')
      else{
        const ok=await terminalCopy(values[target])
        push(ok?'ok':'error',(ok?'COPIED // ':'COPY FAILED // ')+target.toUpperCase())
      }
    }else if(command.startsWith('qr ')){
      const target=command.slice(3).trim()
      const values={smp:'minecraft://?addExternalServer=ESN|'+SMP_ADDRESS+':'+SMP_PORT,discord:DISCORD_URL,website:window.location.origin}
      if(!values[target])push('error','QR targets: smp, discord, website')
      else{setQrData({label:target.toUpperCase(),value:values[target]});push('ok','QR READY // '+target.toUpperCase());awardOperator('qr-tech','Signal Encoder',30)}
    }else if(command==='session'){
      const seconds=Math.floor((Date.now()-sessionStarted.current)/1000)
      const routes=readJson('esn_passport_routes',[])
      const routeSession=(()=>{try{return JSON.parse(sessionStorage.getItem('esn_routes_seen')||'[]')}catch{return []}})()
      pushMany('system',[
        'SESSION // '+Math.floor(seconds/60)+'m '+(seconds%60)+'s',
        'PAGES THIS SESSION // '+new Set(routeSession).size,
        'TERMINAL COMMANDS THIS OPEN // '+sessionCommands,
        'ARCADE XP GAIN // '+Math.max(0,Math.floor(arcade.progress.xp||0)-sessionStartXp.current),
        'TOTAL PAGES EXPLORED // '+new Set(routes).size,
        'CONNECTION // '+(online?'ONLINE':'OFFLINE / LOCAL MODE'),
      ])
    }else if(command==='profiler'){
      push('system','PROFILER // measuring ~650ms sample…')
      const fps=await measureFps()
      pushMany('ok',[
        'FPS ESTIMATE // '+fps,
        'RENDER PROFILE // '+(document.documentElement.dataset.performanceMode||'auto'),
        'VIEWPORT // '+window.innerWidth+'×'+window.innerHeight,
        'DPR // '+(window.devicePixelRatio||1),
        'MOTION // '+(document.documentElement.dataset.motion||'full'),
      ])
      awardOperator('profiler','Performance Analyst',30)
    }else if(command==='diagnostics'){
      pushMany('system',diagnosticsText().split('\n'))
    }else if(command==='diagnostics export'){
      const report=diagnosticsText()+'\nGenerated: '+new Date().toISOString()
      const ok=await terminalCopy(report)
      push(ok?'ok':'error',ok?'DIAGNOSTIC REPORT COPIED // ready to paste into support':'Could not copy diagnostic report.')
      if(ok)awardOperator('diagnostic-export','Support Engineer',35)
    }else if(command==='ping'){
      const started=performance.now()
      push('system','PING // checking ESN origin…')
      try{
        await fetch(window.location.origin+'/?terminal_ping='+Date.now(),{method:'HEAD',cache:'no-store'})
        push('ok','PING // '+Math.max(1,Math.round(performance.now()-started))+' ms browser round-trip')
      }catch{
        push('error','PING // request failed; local Terminal functions remain available offline')
      }
    }else if(command==='uptime'){
      const seconds=Math.floor((Date.now()-sessionStarted.current)/1000)
      const h=Math.floor(seconds/3600),m=Math.floor((seconds%3600)/60),s=seconds%60
      push('ok','SESSION UPTIME // '+(h?h+'h ':'')+(m?m+'m ':'')+s+'s • '+SITE_RELEASE)
    }else if(command==='daily'){
      const daily=readJson('esn_arcade_daily_v1',{completed:[],streak:0,date:null})
      const retention=readJson('esn_retention_v1',{lastClaim:null,streak:0})
      pushMany('system',[
        'DAILY ARCADE CHALLENGES // '+(daily.completed?.length||0)+'/3 complete',
        'ARCADE DAILY STREAK // '+(daily.streak||0),
        'ESN RETURN STREAK // '+(retention.streak||0),
        'DAILY REWARD // '+(retention.lastClaim===terminalDateKey()?'CLAIMED':'READY'),
      ])
    }else if(command==='leaderboard')go('/arcade','Arcade records & mastery leaderboard')
    else if(command==='vote')go('/arcade#community-ballot','Community Ballot')
    else if(command==='random'){
      const pool=SEARCH_INDEX.filter(item=>item.path!=='/vault')
      const item=pool[Math.floor(Math.random()*pool.length)]
      go(item.path,'Random: '+item.label)
    }else if(command==='challenge'){
      const [id,title,copy,target,xp]=challengeData()
      const saved=readJson(TERMINAL_CHALLENGE_KEY,{date:terminalDateKey(),id,complete:false})
      const complete=saved.date===terminalDateKey()&&saved.id===id&&saved.complete
      pushMany(complete?'ok':'system',[
        'TODAY’S TERMINAL CHALLENGE // '+title,
        copy,
        'REWARD // '+xp+' Network XP + 2 Shards',
        'STATUS // '+(complete?'COMPLETE':'ACTIVE'),
      ])
    }else if(command==='fortune'){
      const fortunes=[
        'The network rewards curiosity more than speed.',
        'Six Arcade modules. One Passport. Too many hidden signals.',
        'If a command looks ordinary, try reading its manual page.',
        'The Vault rarely opens for operators who only follow buttons.',
        'A good operator checks diagnostics before blaming the server.',
        'Build. Play. Create. Then check the logs.',
      ]
      push('system','FORTUNE // '+fortunes[(Date.now()+history.length)%fortunes.length])
    }else if(command==='signal'){
      const today=terminalDateKey()
      const previous=readJson(TERMINAL_SIGNAL_KEY,{date:null,rolled:false})
      const hints=[
        'WARDEN carrier detected near the hidden protocol band.',
        'RIFTWALKER signature found between Arcade and Store channels.',
        '1337 legacy digits still echo in the archive.',
        'VOID is short, but the signal behind it is not.',
        'KAVERO protocol handshake is still recognized by the network.',
      ]
      const index=terminalDateSeed()%hints.length
      push('system','SIGNAL // '+hints[index])
      if(previous.date!==today){
        const rare=terminalDateSeed()%11===0
        writeJson(TERMINAL_SIGNAL_KEY,{date:today,rolled:true,rare})
        if(rare){
          awardOperator('signal-relic-'+today,'Rare Signal Capture',55,'Ghost Signal Fragment')
          push('ok','ULTRA-RARE SIGNAL // Ghost Signal Fragment captured.')
        }else push('system','No rare carrier locked today. Signal scan resets tomorrow.')
      }else push('system','Daily signal already scanned.')
    }else if(command.startsWith('repeat ')){
      const match=original.match(/^repeat\s+(\d+)\s+(.+)$/i)
      if(!match)push('error','Usage: repeat <1-10> <safe command>')
      else{
        const count=Math.max(1,Math.min(10,Number(match[1]))),target=match[2].trim().toLowerCase()
        const safe=['network','map','smp status','arcade stats','daily','rewards','inventory','profile','whoami','diagnostics','uptime','session','notifications','dashboard','dashboard network','dashboard arcade','dashboard missions']
        if(!safe.includes(target))push('error','Repeat only supports safe local/read-only commands.')
        else for(let i=0;i<count;i++)await runRef.current(target,{record:false,noChain:true})
      }
    }else if(command==='terminal export'){
      const payload={
        version:1,
        favorites:readJson(TERMINAL_FAVORITES_KEY,[]),
        aliases:readJson(TERMINAL_ALIASES_KEY,{}),
        macros:readJson(TERMINAL_MACROS_KEY,{}),
        terminalTheme,
        crtEnabled,
      }
      const code=terminalEncode(payload)
      const ok=await terminalCopy(code)
      push(ok?'ok':'error',ok?'TERMINAL EXPORT COPIED // paste it on another ESN device with "terminal import <code>"':'Export created but clipboard copy failed.')
      if(ok)awardOperator('exporter','Portable Operator',35)
    }else if(command.startsWith('terminal import ')){
      const payload=terminalDecode(original.slice('terminal import '.length).trim())
      if(!payload||payload.version!==1)push('error','Invalid ESN Terminal export code.')
      else{
        const favorites=Array.isArray(payload.favorites)?payload.favorites.filter(route=>SEARCH_INDEX.some(item=>item.path===route)).slice(0,12):[]
        const nextAliases=payload.aliases&&typeof payload.aliases==='object'?Object.fromEntries(Object.entries(payload.aliases).filter(([k,v])=>/^[a-z0-9_-]{1,24}$/.test(k)&&typeof v==='string'&&v.length<=180)):{}
        const nextMacros=payload.macros&&typeof payload.macros==='object'?Object.fromEntries(Object.entries(payload.macros).filter(([k,v])=>/^[a-z0-9_-]{1,24}$/.test(k)&&typeof v==='string'&&v.length<=360)):{}
        writeJson(TERMINAL_FAVORITES_KEY,favorites);writeJson(TERMINAL_ALIASES_KEY,nextAliases);writeJson(TERMINAL_MACROS_KEY,nextMacros)
        setAliases(nextAliases);setMacros(nextMacros)
        if(TERMINAL_UI_THEMES.includes(payload.terminalTheme)){setTerminalTheme(payload.terminalTheme);localStorage.setItem(TERMINAL_THEME_KEY,payload.terminalTheme)}
        setCrtEnabled(Boolean(payload.crtEnabled))
        window.dispatchEvent(new Event('esn-history-change'))
        push('ok','TERMINAL IMPORT COMPLETE // favorites, aliases, macros, and Terminal visuals restored.')
      }
    }else if(command==='dev info'){
      pushMany('system',['DEV INFO // public read-only','APP // React + Vite ESN website','RELEASE // '+SITE_RELEASE,'ROUTE // '+window.location.pathname,'ORIGIN // '+window.location.origin])
    }else if(command==='dev routes'){
      push('system','PUBLIC ROUTES // '+SEARCH_INDEX.map(item=>item.path).join(' • '))
    }else if(command==='dev release'){
      push('system','RELEASE // '+SITE_RELEASE+' • Network Evolution '+NETWORK_EVOLUTION_VERSION)
    }else if(command==='dev storage'){
      const keys=Object.keys(localStorage).filter(key=>key.startsWith('esn_'))
      const bytes=keys.reduce((sum,key)=>sum+(localStorage.getItem(key)?.length||0),0)
      pushMany('system',['LOCAL ESN STORAGE // '+keys.length+' keys','APPROX TEXT BYTES // '+bytes.toLocaleString(),'VALUES // hidden by this readout','Use Settings/Terminal reset controls for deliberate changes.'])
    }else if(command==='ls /network/archive'||command==='ls archive'){
      pushMany('system',['/network/archive/',...Object.keys(TERMINAL_LORE).map(path=>'  '+path.split('/').pop())])
    }else if(command.startsWith('cat ')){
      const requested=command.slice(4).trim()
      const path=requested.startsWith('/')?requested:'/network/archive/'+requested
      const file=TERMINAL_LORE[path]
      if(!file)push('error','Archive file not found. Run "ls /network/archive".')
      else{
        pushMany('system',file)
        const relicMap={
          '/network/archive/origin.txt':'Origin Archive Chip',
          '/network/archive/founder.log':'Founder Channel Token',
          '/network/archive/arcade.sys':'Arcade Kernel Fragment',
          '/network/archive/rift.sig':'Rift Signal Shard',
          '/network/archive/legacy.1337':'Legacy 1337 Chip',
        }
        awardOperator('archive-'+path.split('/').pop(),'Archive Reader: '+path.split('/').pop(),30,relicMap[path])
        awardOperator('archivist','Archive Diver',45)
      }
    }else if(command==='sound on'){setSoundEnabled(true);push('ok','Optional interface sound enabled.')}
    else if(command==='sound off'){setSoundEnabled(false);push('ok','Interface sound muted.')}
    else if(command==='event'){triggerRare();push('ok','Rare-event simulator requested.')}
    else if(command==='clear'){setLines([])}
    else if(command==='clear data'){
      setClearArmed(true)
      pushMany('error',[
        'LOCAL PROGRESS CLEAR ARMED — nothing has been deleted.',
        'Run "clear data confirm" next to reset local progress. Terminal visual preferences, aliases, macros, and favorites will be kept.',
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
        push('ok','LOCAL PROGRESS CLEARED // Terminal setup and visual preferences preserved.')
        setClearArmed(false)
      }
    }else if(command.startsWith('protocol ')){
      const signal=command.slice(9).trim()
      const egg=protocolMap[signal]
      if(!egg)push('error','No response on that protocol channel.')
      else{
        const fresh=terminalUnlockEgg(egg)
        push(fresh?'ok':'system',fresh?'HIDDEN SIGNAL CAPTURED // '+signal.toUpperCase():'SIGNAL ALREADY CAPTURED // '+signal.toUpperCase())
        if(fresh)awardOperator('protocol-'+signal,'Protocol Breaker: '+signal.toUpperCase(),40,'Protocol '+signal.toUpperCase()+' Fragment')
      }
    }else if(command==='1337'){
      const fresh=terminalUnlockEgg('typed-1337')
      push(fresh?'ok':'system',fresh?'LEGACY MODE SIGNAL CAPTURED.':'LEGACY MODE already recorded.')
      if(fresh)awardOperator('protocol-1337','Legacy Protocol',40,'Legacy Protocol Fragment')
    }else{
      const suggestion=terminalClosestCommand(command)
      const personalities=[
        'COMMAND NOT RECOGNIZED // The network heard you. It just has no idea what you meant.',
        'NO ROUTE FOUND // The command parser has filed a formal complaint.',
        'UNKNOWN OPERATOR REQUEST // Search index returned absolutely nothing useful.',
        'SIGNAL LOST // That command does not exist in this timeline.',
      ]
      push('error',personalities[(command.length*7)%personalities.length]+(suggestion?' Did you mean "'+suggestion+'"?':' Type "help".'))
    }
    setValue('')
  }

  runRef.current=run

  useEffect(()=>{
    if(!watchCommand)return
    const fire=async()=>{
      if(watchCommand==='network'||watchCommand==='smp status')live.refresh?.()
      await runRef.current?.(watchCommand,{record:false,watch:true,noChain:true})
    }
    fire()
    const timer=window.setInterval(fire,3000)
    return()=>window.clearInterval(timer)
  },[watchCommand])

  const keyDown=event=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='l'){
      event.preventDefault();setLines([]);return
    }
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='r'){
      event.preventDefault();setHistorySearch(v=>!v);return
    }
    if(event.ctrlKey&&event.code==='Space'&&suggestions.length){
      event.preventDefault();setValue(suggestions[0]);return
    }
    if(event.key==='/'&&!value){
      event.preventDefault();setValue('search ');return
    }
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
      event.preventDefault();setValue(suggestions[0])
    }else if(event.key==='Escape'&&historySearch){
      event.preventDefault();setHistorySearch(false)
    }
  }

  const currentOperator=readJson(TERMINAL_OPERATOR_KEY,{xp:0,commands:0,achievements:{},relics:[]})
  const operatorRank=Math.floor((currentOperator.xp||0)/120)+1

  return <SystemModal title="ESN Terminal" kicker="NETWORK COMMAND INTERFACE" onClose={onClose} className={'ev-terminal-modal terminal-theme-'+terminalTheme+(crtEnabled?' terminal-crt':'')}>
    <div className="ev-terminal-toolbar">
      <span>OPERATOR RANK {operatorRank}</span><b>{online?'ONLINE':'OFFLINE / LOCAL'}</b><small>{watchCommand?'WATCHING '+watchCommand.toUpperCase():' '+SITE_RELEASE}</small>
    </div>
    <div className="ev-terminal-output" aria-live="polite">{lines.map((line,index)=><div className={line.kind} key={index}>{line.text}</div>)}</div>
    {historySearch&&<div className="ev-terminal-history-search"><span>CTRL+R HISTORY SEARCH</span>{historyMatches.length?historyMatches.map(item=><button type="button" key={item} onClick={()=>{setValue(item);setHistorySearch(false);inputRef.current?.focus()}}>{item}</button>):<small>No history match.</small>}</div>}
    {qrData&&<div className="ev-terminal-qr">
      <img src={'https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data='+encodeURIComponent(qrData.value)} alt={qrData.label+' QR code'}/>
      <div><span>QR SIGNAL</span><strong>{qrData.label}</strong><small>{qrData.value}</small><button type="button" onClick={()=>setQrData(null)}>CLOSE QR</button></div>
    </div>}
    <div className="ev-terminal-suggestions">{suggestions.map(item=><button type="button" key={item} onClick={()=>{setValue(item);inputRef.current?.focus()}}>{item}</button>)}</div>
    <form className="ev-terminal-input" onSubmit={event=>{event.preventDefault();if(!booting)run(value)}}>
      <span>ESN:/</span><input ref={inputRef} autoFocus autoComplete="off" spellCheck="false" disabled={booting} value={value} onKeyDown={keyDown} onChange={event=>{setValue(event.target.value);setHistoryIndex(-1)}} placeholder={booting?'booting…':'help'}/><button type="submit" disabled={booting}>RUN</button>
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
        <div><span className="eyebrow">YOUR ESN EXTRAS</span><h2>There is more to find around here.</h2><p>Collect badges, find hidden surprises, track your progress, and use quick search. Your progress stays on your device.</p></div>
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
          <span>ESN TERMINAL</span><strong>Shortcuts when you need them.</strong><p>Open games, check status, find saved pages, change your theme, or look at your badges from one menu.</p>
          <button type="button" onClick={()=>window.dispatchEvent(new Event('esn-open-terminal'))}>Open Terminal</button>
        </article>
        <article className="ev-home-search">
          <span>UNIVERSAL SEARCH</span><strong>Find anything ESN.</strong><p>Search routes, services, SMP tools, Arcade games, updates, leadership, reviews, and network utilities.</p>
          <button type="button" onClick={()=>window.dispatchEvent(new Event('esn-open-universal-search'))}>Search ESN</button>
        </article>
      </div>

      <div className="ev-event-board">
        <div className="ev-event-board-head"><div><span>LIVE SMP + NETWORK EVENT BOARD</span><strong>SMP announcements and updates</strong></div><small>Discord remains the source of truth for newly announced timed events.</small></div>
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
