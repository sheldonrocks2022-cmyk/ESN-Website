import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const DISCORD_URL='https://discord.gg/3gxA66KZ8'
const SMP_HOST='fr3.plugged.host'
const PLUGIN_DOWNLOAD_URL='https://github.com/sheldonrocks2022-cmyk/ESNSMP/releases/latest/download/ESNSMP.jar'

const compactRouteLabels={
  '/':'Home','/serviceshowcase':'Services','/portfolio':'Portfolio','/testimonials':'Reviews',
  '/smpconnection':'SMP','/smpconsole':'Console Guide','/smpplugin':'Plugin','/smpguide':'SMP Encyclopedia','/storesmp':'SMP Store',
  '/arcade':'Arcade','/esclicker':'Clicker','/esfactory':'Factory','/esmines':'Mines','/esmoto':'MOTO','/estower':'Tower','/estowerdefense':'Tower Defense',
  '/estools':'ES Tools','/status':'Status','/networkstats':'Network Stats','/updates':'Updates','/whatsnew':"What's New",'/timeline':'Timeline',
  '/nexus':'Network Nexus','/explore':'Explore ESN','/gallery':'Gallery','/settings':'Settings','/support':'Support','/about':'About','/leadership':'Leadership','/faq':'FAQ','/share':'Share','/site-builder':'Site Builder',
  '/launchpad':'Launchpad','/configure':'Configurator','/smp-hub':'SMP World Hub','/trust':'Trust Center','/search':'Search 2.0','/labs':'ESN Labs','/estimate':'Project Estimate','/smp-items':'SMP Items','/activity':'Network Activity','/share-generator':'Share Generator','/showcase':'Builder Showcase','/network-map':'Network Map','/backup':'Local Backup'
}
function localList(key){try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[]}catch{return []}}

const routeThemes={
  home:['84 154 255','143 249 255'],
  services:['121 92 255','92 214 255'],
  smp:['69 229 157','82 180 255'],
  arcade:['167 93 255','90 220 255'],
  tools:['255 174 82','112 216 255'],
  reviews:['255 207 96','176 108 255'],
  about:['91 160 255','122 240 255'],
}

const userThemes={
  esn:{label:'ESN Blue',colors:['84 154 255','143 249 255']},
  void:{label:'Void Purple',colors:['135 76 255','214 92 255']},
  smp:{label:'SMP Green',colors:['69 229 157','82 180 255']},
  arcade:{label:'Arcade Neon',colors:['0 229 255','255 79 214']},
  warden:{label:'Warden',colors:['18 154 168','93 239 220']},
  riftwalker:{label:'Riftwalker',colors:['138 76 255','70 143 255']},
  midnight:{label:'Midnight Core',colors:['52 72 135','112 244 255']},
}

const baseCommands=[
  {label:'ESN Launchpad',meta:'Choose the fastest route into the network',keywords:'start launchpad what can i do take me somewhere choose route',kind:'route',value:'/launchpad'},
  {label:'Service Configurator',meta:'Build a service brief before opening a Discord ticket',keywords:'configure service project brief order quote editing website discord coaching',kind:'route',value:'/configure'},
  {label:'Live SMP World Hub',meta:'SMP telemetry, players, plugin data, and world links',keywords:'smp hub live world players server minecraft boss events telemetry',kind:'route',value:'/smp-hub'},
  {label:'Trust Center',meta:'Official links, payment safety, privacy, and transparency',keywords:'trust safe official stripe payment privacy security scam account',kind:'route',value:'/trust'},
  {label:'Search 2.0',meta:'Search pages, services, SMP items, FAQs, tools, and commands',keywords:'find search anything item command faq service product',kind:'route',value:'/search'},
  {label:'ESN Labs',meta:'No-account local beta experience controls',keywords:'labs beta experiment compact glow local',kind:'route',value:'/labs'},
  {label:'Project Estimate',meta:'Generate a complexity and scope estimate',keywords:'estimate project scope price quote complexity website editing discord',kind:'route',value:'/estimate'},
  {label:'SMP Item Encyclopedia',meta:'Search current SMP bundles and verified contents',keywords:'smp items warden riftwalker void relic keys blade armor wings bundle',kind:'route',value:'/smp-items'},
  {label:'Network Activity',meta:'Current ESN releases and local recent activity',keywords:'activity updates history recent changed release timeline',kind:'route',value:'/activity'},
  {label:'Share Generator 2.0',meta:'Create ESN share links and QR targets',keywords:'share qr code link send generator',kind:'route',value:'/share-generator'},
  {label:'Builder Showcase',meta:'Browse real published ESN Website Builder sites',keywords:'showcase generated sites examples cutecats website builder',kind:'route',value:'/showcase'},
  {label:'Interactive Network Map',meta:'See ESN as one connected platform',keywords:'network map everything pages routes platform where',kind:'route',value:'/network-map'},
  {label:'Local Backup + Restore',meta:'Export or restore local ESN browser data',keywords:'backup restore export import local progress favorites settings arcade no account',kind:'route',value:'/backup'},
  {label:'Network Nexus',meta:'XP, missions, Arcade competition, lore, events, map, and ESN Guide',keywords:'nexus command center xp missions achievements leaderboard tournament lore guide map',kind:'route',value:'/nexus'},
  {label:'Join SMP',meta:'Open ESN SMP connection details',keywords:'join smp server ip port minecraft connect',kind:'route',value:'/smpconnection'},
  {label:'Open Riftwalker',meta:'Jump to the Riftwalker store bundle',keywords:'riftwalker bundle store buy',kind:'route',value:'/storesmp#product-esn-riftwalker-bundle'},
  {label:'Play Tower',meta:'Launch ES Tower',keywords:'play tower arcade',kind:'route',value:'/estower'},
  {label:'Play Tower Defense',meta:'Launch ES Tower Defense',keywords:'play tower defense arcade',kind:'route',value:'/estowerdefense'},
  {label:'Download Plugin',meta:'Download latest ESNSMP.jar',keywords:'download plugin jar esnsmp latest',kind:'download',value:PLUGIN_DOWNLOAD_URL},
  {label:'Network Status',meta:'Live ESN systems and SMP players',keywords:'status live player count uptime network',kind:'route',value:'/status'},
  {label:'Release Center',meta:'Website, plugin, Arcade, and roadmap updates',keywords:'updates releases roadmap changelog version',kind:'route',value:'/updates'},
  {label:'ESN Timeline',meta:'EP1C Services → ES Network → current projects',keywords:'timeline history ep1c es network',kind:'route',value:'/timeline'},
  {label:'Portfolio',meta:'Interactive service before/after demos',keywords:'portfolio before after editing discord website',kind:'route',value:'/portfolio'},
  {label:'Share Deck',meta:'Generate branded ESN share cards',keywords:'share card png social smp arcade services store',kind:'route',value:'/share'},
  {label:'SMP Store',meta:'Official ESN SMP products',keywords:'store products keys relic warden void',kind:'route',value:'/storesmp'},
  {label:'ES Tools',meta:'Free browser utilities',keywords:'tools timer prompt randomizer',kind:'route',value:'/estools'},
  {label:'Website Builder',meta:'Build a site for an ESN subdomain',keywords:'website builder ai subdomain hosting generate site',kind:'route',value:'/site-builder'},
  {label:'Verified Reviews',meta:'35 ESN customer reviews',keywords:'reviews testimonials verified',kind:'route',value:'/testimonials'},
  {label:'Join Discord',meta:'Open the official ESN Discord',keywords:'discord community support ticket',kind:'external',value:DISCORD_URL},
]

export default function PremiumChrome(){
  const location=useLocation()
  const navigate=useNavigate()
  const [open,setOpen]=useState(false)
  const [showTop,setShowTop]=useState(false)
  const [query,setQuery]=useState('')
  const [theme,setTheme]=useState(()=>localStorage.getItem('esn_visual_theme')||'dynamic')
  const [lighting,setLighting]=useState(()=>localStorage.getItem('esn_lighting_mode')||'night')
  const [vaultUnlocked,setVaultUnlocked]=useState(()=>localStorage.getItem('esn_vault_unlocked')==='1')
  const [secretPulse,setSecretPulse]=useState(false)
  const [historyTick,setHistoryTick]=useState(0)
  const tapRef=useRef({count:0,timer:null})

  const arcadeRoutes=['/arcade','/esclicker','/esfactory','/esmines','/esmoto','/estower','/estowerdefense']
  const gameRoutes=arcadeRoutes.filter(route=>route!=='/arcade')
  const routeKey=location.pathname.startsWith('/smp')||location.pathname.startsWith('/store')?'smp'
    :arcadeRoutes.includes(location.pathname)?'arcade'
    :location.pathname==='/serviceshowcase'||location.pathname==='/portfolio'||location.pathname==='/site-builder'?'services'
    :location.pathname==='/estools'||location.pathname==='/tools'?'tools'
    :location.pathname==='/testimonials'?'reviews'
    :['/about','/leadership','/faq','/timeline','/updates','/status','/share','/vault','/nexus'].includes(location.pathname)?'about':'home'

  const routePalette=routeThemes[routeKey]||routeThemes.home
  const effectivePalette=theme==='dynamic'?routePalette:(userThemes[theme]?.colors||routePalette)
  const [routeAccent,routeAccent2]=effectivePalette
  const routeLabel=routeKey.toUpperCase()
  const isGame=gameRoutes.includes(location.pathname)

  const availableThemes=useMemo(()=>[
    ['dynamic','Dynamic'],
    ['esn',userThemes.esn.label],
    ['void',userThemes.void.label],
    ['smp',userThemes.smp.label],
    ['arcade',userThemes.arcade.label],
    ['warden',userThemes.warden.label],
    ['riftwalker',userThemes.riftwalker.label],
    ...(vaultUnlocked?[['midnight',userThemes.midnight.label]]:[]),
  ],[vaultUnlocked])

  const unlockVault=()=>{
    localStorage.setItem('esn_vault_unlocked','1')
    setVaultUnlocked(true)
    setTheme('midnight')
    localStorage.setItem('esn_visual_theme','midnight')
    setSecretPulse(true)
    window.dispatchEvent(new CustomEvent('esn-visual-settings',{detail:{theme:'midnight',lighting,palette:userThemes.midnight.colors}}))
    window.setTimeout(()=>{setSecretPulse(false);setOpen(false);navigate('/vault')},850)
  }

  const normalized=query.trim().toLowerCase()
  const intentQuery=normalized
    .replace(/^(please\\s+)?(take me to|go to|open|show me|show|find|search for|launch|visit|i want|i need)\\s+/,'')
    .replace(/\\b(the|a|an|page|section|website)\\b/g,' ')
    .replace(/\\s+/g,' ')
    .trim()
  const commandResults=useMemo(()=>{
    const list=[...baseCommands]
    if(vaultUnlocked||normalized==='esn vault'||normalized==='vault'){
      list.unshift({label:'ESN Vault',meta:vaultUnlocked?'Open the unlocked hidden network layer':'Secret command detected',keywords:'esn vault secret core',kind:vaultUnlocked?'route':'unlock',value:'/vault'})
    }
    if(!normalized)return list.slice(0,8)
    const terms=(intentQuery||normalized).split(/\\s+/).filter(Boolean)
    return list
      .map(item=>{
        const label=item.label.toLowerCase()
        const hay=(item.label+' '+item.meta+' '+item.keywords).toLowerCase()
        const score=terms.reduce((sum,term)=>sum+(label.includes(term)?5:0)+(hay.includes(term)?2:0),0)
        return {...item,_score:score}
      })
      .filter(item=>item._score>0)
      .sort((a,b)=>b._score-a._score)
      .slice(0,10)
  },[normalized,intentQuery,vaultUnlocked])

  const runCommand=(command)=>{
    if(command.kind==='route'){setOpen(false);navigate(command.value);return}
    if(command.kind==='external'){window.open(command.value,'_blank','noopener,noreferrer');return}
    if(command.kind==='download'){window.location.href=command.value;return}
    if(command.kind==='unlock'){unlockVault()}
  }

  useEffect(()=>{
    const terminalTheme=event=>{
      const requested=event.detail?.theme
      if(!requested)return
      if(event.detail?.vault)setVaultUnlocked(true)
      if(requested==='midnight'&&localStorage.getItem('esn_vault_unlocked')!=='1')return
      if(requested==='dynamic'||userThemes[requested]){
        setTheme(requested)
        localStorage.setItem('esn_visual_theme',requested)
      }
    }
    window.addEventListener('esn-terminal-theme',terminalTheme)
    return()=>window.removeEventListener('esn-terminal-theme',terminalTheme)
  },[])

  useEffect(()=>{
    setOpen(false)
    setQuery('')
    document.documentElement.classList.remove('premium-command-open')
  },[location.pathname])

  useEffect(()=>{
    const refresh=()=>setHistoryTick(value=>value+1)
    window.addEventListener('esn-history-change',refresh)
    return()=>window.removeEventListener('esn-history-change',refresh)
  },[])

  useEffect(()=>{
    const openFromDeck=()=>setOpen(true)
    window.addEventListener('esn-open-command',openFromDeck)
    const key=(e)=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
        e.preventDefault();setOpen(v=>!v)
      }
      if(e.key==='Escape')setOpen(false)
    }
    const scroll=()=>setShowTop(window.scrollY>700)
    window.addEventListener('keydown',key)
    window.addEventListener('scroll',scroll,{passive:true})
    scroll()
    return()=>{window.removeEventListener('keydown',key);window.removeEventListener('scroll',scroll);window.removeEventListener('esn-open-command',openFromDeck)}
  },[])

  useEffect(()=>{
    const sequence=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']
    let at=0
    const handler=e=>{
      if(e.key===sequence[at]){at+=1;if(at===sequence.length){at=0;unlockVault()}}
      else at=e.key===sequence[0]?1:0
    }
    window.addEventListener('keydown',handler)
    return()=>window.removeEventListener('keydown',handler)
  })

  useEffect(()=>{
    document.documentElement.classList.toggle('premium-command-open',open)
    return()=>document.documentElement.classList.remove('premium-command-open')
  },[open])

  useEffect(()=>{
    const root=document.documentElement
    root.dataset.luxRoute=routeKey
    root.dataset.visualTheme=theme
    root.dataset.lighting=lighting
    root.style.setProperty('--route-accent',routeAccent)
    root.style.setProperty('--route-accent-2',routeAccent2)
    localStorage.setItem('esn_visual_theme',theme)
    localStorage.setItem('esn_lighting_mode',lighting)
    window.dispatchEvent(new CustomEvent('esn-visual-settings',{detail:{theme,lighting,palette:effectivePalette}}))
    return()=>delete root.dataset.luxRoute
  },[routeKey,theme,lighting,routeAccent,routeAccent2])

  useEffect(()=>{
    const fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if(!fine||reduce)return
    const selector='.button,.nav-cta,.footer-discord,.premium-command-discord,.text-link,.plugin-download-button,.command-result'
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
      target.style.setProperty('--mag-x','0px');target.style.setProperty('--mag-y','0px')
    }
    document.addEventListener('pointermove',move,{passive:true})
    document.addEventListener('pointerout',out,{passive:true})
    return()=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerout',out)}
  },[])

  const orbTap=()=>{
    setOpen(v=>!v)
    const tap=tapRef.current
    tap.count+=1
    clearTimeout(tap.timer)
    if(tap.count>=7){tap.count=0;unlockVault();return}
    tap.timer=setTimeout(()=>{tap.count=0},2600)
  }

  const recentRoutes=localList('esn_recent_routes').filter(route=>compactRouteLabels[route]).slice(0,4)
  const favoriteRoutes=localList('esn_favorites').filter(route=>compactRouteLabels[route]).slice(0,4)
  void historyTick

  return <>
    <div className="lux-cursor-field" aria-hidden="true"/>
    <div className="lux-cursor-ring" aria-hidden="true"/>
    <div className="lux-cursor-core" aria-hidden="true"/>
    <div className="lux-edge-beam top" aria-hidden="true"/>
    <div className="lux-edge-beam right" aria-hidden="true"/>
    <div className="premium-ambient" aria-hidden="true"><span className="premium-aurora a"/><span className="premium-aurora b"/><span className="premium-aurora c"/><span className="premium-grain"/><span className="premium-vignette"/></div>
    <div key={location.pathname} className="route-lux-flare" aria-hidden="true"/>

    {secretPulse&&<div className="secret-unlock-flash"><span>ESN // VAULT UNLOCKED</span><strong>MIDNIGHT CORE ACQUIRED</strong></div>}

    <div className="premium-ticker" aria-label="ES Network highlights">
      <div className="premium-ticker-track">
        {[0,1].map(copy=><div className="premium-ticker-segment" key={copy}>
          <span><i/> ESN SYSTEMS ONLINE</span><span>35 VERIFIED REVIEWS</span><span>6 ORIGINAL ARCADE GAMES</span><span>{SMP_HOST}</span><span>LIVE NETWORK STATUS</span><span>PUBLIC ESNSMP PLUGIN</span><span>FREE ES TOOLS</span>
        </div>)}
      </div>
    </div>

    <div className="lux-route-rail" aria-hidden="true"><span>ESN</span><i/><b>{routeLabel}</b><em>LIVE EXPERIENCE</em></div>

    <div className="premium-dock" aria-label="ESN quick actions">
      <button className={open?'premium-orb active':'premium-orb'} type="button" onClick={orbTap} aria-expanded={open} aria-label="Open ESN command center"><span>ES</span><i/></button>
      <div className="premium-dock-label">COMMAND CENTER</div>
      {showTop&&<button className="premium-top-button" type="button" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} aria-label="Back to top">↑</button>}
    </div>

    {!isGame&&<nav className="mobile-bottom-nav" aria-label="Mobile primary navigation">
      <Link className={location.pathname==='/'?'active':''} to="/"><span>⌂</span><small>Home</small></Link>
      <Link className={['/serviceshowcase','/portfolio','/store-ai','/hosting','/site-builder','/estools'].includes(location.pathname)?'active':''} to="/serviceshowcase"><span>◇</span><small>Create</small></Link>
      <Link className={routeKey==='smp'?'active':''} to="/smpconnection"><span>⬡</span><small>SMP</small></Link>
      <Link className={routeKey==='arcade'?'active':''} to="/arcade"><span>▣</span><small>Arcade</small></Link>
      <button type="button" className={open?'active':''} onClick={()=>setOpen(true)}><span>•••</span><small>More</small></button>
    </nav>}

    <div className={open?'premium-command-backdrop open':'premium-command-backdrop'} onClick={()=>setOpen(false)} aria-hidden={!open}/>

    <aside className={open?'premium-command open':'premium-command'} aria-hidden={!open} inert={!open}>
      <div className="premium-command-head"><div><span>ES NETWORK</span><strong>Command Center 2.0</strong></div><button type="button" onClick={()=>setOpen(false)} aria-label="Close command center">×</button></div>

      <div className="premium-command-status">
        <div><i/><span>NETWORK</span><b>ONLINE</b></div>
        <div><span>CURRENT</span><b>{location.pathname==='/'?'HOME':location.pathname.replace('/','').toUpperCase()}</b></div>
      </div>

      <label className="premium-command-search">
        <span>COMMAND / SEARCH</span>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder='Try "take me to the SMP store", "find Warden items"…' />
      </label>

      <div className="command-results">
        {commandResults.map((command,index)=><button className="command-result" type="button" onClick={()=>runCommand(command)} key={command.label}>
          <span className="premium-command-index">{String(index+1).padStart(2,'0')}</span>
          <span><b>{command.label}</b><small>{command.meta}</small></span><em>{command.kind==='download'?'↓':'↗'}</em>
        </button>)}
        {!commandResults.length&&<div className="premium-command-empty">No command matches that search.</div>}
      </div>

      <section className="mobile-network-utilities" aria-label="Network Evolution utilities">
        <button type="button" onClick={()=>{setOpen(false);window.dispatchEvent(new Event('esn-open-universal-search'))}}><span>⌕</span><b>Search</b><small>Find anything ESN</small></button>
        <button type="button" onClick={()=>{setOpen(false);window.dispatchEvent(new Event('esn-open-terminal'))}}><span>›_</span><b>Terminal</b><small>Network commands</small></button>
        <button type="button" onClick={()=>{setOpen(false);window.dispatchEvent(new Event('esn-open-passport'))}}><span>◎</span><b>Passport</b><small>Missions + XP</small></button>
        <button type="button" onClick={()=>{setOpen(false);navigate('/explore')}}><span>✦</span><b>Explore</b><small>All website features</small></button>
        <button type="button" onClick={()=>{setOpen(false);navigate('/whatsnew')}}><span>NEW</span><b>What's New</b><small>Latest site changes</small></button>
        <button type="button" onClick={()=>{setOpen(false);navigate('/settings')}}><span>⚙</span><b>Settings</b><small>Performance + access</small></button>
        <button type="button" onClick={()=>window.dispatchEvent(new Event('esn-install-request'))}><span>↓</span><b>Install</b><small>Add ESN to device</small></button>
      </section>

      {(favoriteRoutes.length>0||recentRoutes.length>0)&&<section className="premium-local-history">
        {favoriteRoutes.length>0&&<div><span>FAVORITES</span>{favoriteRoutes.map(route=><button type="button" key={'fav-'+route} onClick={()=>{setOpen(false);navigate(route)}}>{compactRouteLabels[route]} <b>★</b></button>)}</div>}
        {recentRoutes.length>0&&<div><span>RECENT</span>{recentRoutes.map(route=><button type="button" key={'recent-'+route} onClick={()=>{setOpen(false);navigate(route)}}>{compactRouteLabels[route]} <b>↗</b></button>)}</div>}
      </section>}

      <section className="visual-control-center">
        <div className="visual-control-head"><span>VISUAL SYSTEM</span><b>{lighting.toUpperCase()} MODE</b></div>
        <div className="theme-chip-row">
          {availableThemes.map(([key,label])=><button type="button" className={theme===key?'active':''} onClick={()=>setTheme(key)} key={key}>{label}</button>)}
        </div>
        <div className="lighting-toggle">
          <button type="button" className={lighting==='day'?'active':''} onClick={()=>setLighting('day')}><span>DAY</span><small>Brighter volumetric scene</small></button>
          <button type="button" className={lighting==='night'?'active':''} onClick={()=>setLighting('night')}><span>NIGHT</span><small>Deeper cinematic lighting</small></button>
        </div>
      </section>

      <a className="premium-command-discord" href={DISCORD_URL} target="_blank" rel="noreferrer"><span><b>Join ESN Discord</b><small>Community • support • ordering</small></span><em>↗</em></a>
      <div className="premium-command-hint"><span>CTRL / CMD + K</span><span>SEARCH • COMMANDS • THEMES</span></div>
    </aside>
  </>
}
