import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { DISCORD_URL, SITE_RELEASE, SMP_ADDRESS, SMP_PORT, useLiveNetwork } from './liveNetwork'
import { useArcadeProgress } from './arcade/shared'

const RELEASE_ID='2026-09-27-expansion-20'
const RECENT_KEY='esn_recent_routes'
const FAVORITES_KEY='esn_favorites'
const PREF_KEY='esn_site_preferences'
const DAILY_KEY='esn_arcade_daily_v1'
const PLUGIN_SHA256='4439a6c8bf7ea6b0bf170098eeb1dff3f9f2f7008c06556140a1c1cfd8afd356'

const ROUTE_META={
  '/':{label:'Home',category:'Network'},
  '/serviceshowcase':{label:'Services',category:'Services'},
  '/portfolio':{label:'Portfolio',category:'Services'},
  '/testimonials':{label:'Verified Reviews',category:'Services'},
  '/smpconnection':{label:'SMP Connection',category:'SMP'},
  '/smpconsole':{label:'Console Guide',category:'SMP'},
  '/smpplugin':{label:'ESNSMP Plugin',category:'SMP'},
  '/smpguide':{label:'SMP Encyclopedia',category:'SMP'},
  '/storesmp':{label:'SMP Store',category:'SMP'},
  '/arcade':{label:'Arcade',category:'Arcade'},
  '/esclicker':{label:'ES Clicker',category:'Arcade'},
  '/esfactory':{label:'ES Factory',category:'Arcade'},
  '/esmines':{label:'ES Mines',category:'Arcade'},
  '/esmoto':{label:'ES MOTO',category:'Arcade'},
  '/estower':{label:'ES Tower',category:'Arcade'},
  '/estowerdefense':{label:'ES Tower Defense',category:'Arcade'},
  '/estools':{label:'ES Tools',category:'Tools'},
  '/status':{label:'Network Status',category:'Network'},
  '/networkstats':{label:'Network Statistics',category:'Network'},
  '/updates':{label:'Release Center',category:'Network'},
  '/whatsnew':{label:"What's New",category:'Network'},
  '/timeline':{label:'Timeline',category:'Network'},
  '/explore':{label:'Explore ESN',category:'Network'},
  '/gallery':{label:'Media Gallery',category:'Network'},
  '/settings':{label:'Accessibility & Performance',category:'Help'},
  '/support':{label:'Report a Problem',category:'Help'},
  '/about':{label:'About ESN',category:'About'},
  '/leadership':{label:'Leadership',category:'About'},
  '/faq':{label:'FAQ',category:'Help'},
  '/share':{label:'Share Deck',category:'Network'},
  '/vault':{label:'Vault',category:'Network'},
}

const EXPLORE_FEATURES=[
  ['Install ESN','Add the ESN website to your home screen as an installable web app.','/settings','PWA'],
  ['Performance Mode','Automatic device-aware performance mode plus manual Performance / Premium controls.','/settings','SYSTEM'],
  ["What's New",'See updates that landed since your last visit.','/whatsnew','UPDATES'],
  ['SMP Encyclopedia','Search progression, bosses, crates, systems, and verified commands from ESNSMP v2.9.4.','/smpguide','SMP'],
  ['Bug Reporter','Create a diagnostic report and take it straight to ESN Discord support.','/support','HELP'],
  ['Release Filters','Filter the Release Center by Website, Mobile, SMP, Arcade, Store, Network, and Security.','/updates','LOGS'],
  ['Incident History','Current status plus a transparent incident-history area with no invented outages.','/status','STATUS'],
  ['Favorites + Recents','Keep your favorite and recently visited ESN destinations on this device.','/explore','LOCAL'],
  ['Arcade Daily Challenges','Three rotating daily challenges tied to your real local Arcade progress.','/arcade','ARCADE'],
  ['Arcade Achievements','Cross-game trophies now connect into the existing shared Arcade progression.','/arcade','ARCADE'],
  ['Achievement Alerts','Clean achievement notifications instead of constant random visual effects.','/arcade','ALERTS'],
  ['Media Gallery','A dedicated ESN media and milestone gallery ready for approved screenshots and media.','/gallery','MEDIA'],
  ['Network Statistics','Live and local ESN stats in one dashboard.','/networkstats','STATS'],
  ['Quick Copy','One-tap copy for SMP IP, port, plugin checksum, commands, and useful support details.','/smpguide','UTILITY'],
  ['Smart Mobile Header','A simpler phone header that prioritizes brand, current area, and the menu.','/explore','MOBILE'],
  ['Accessibility Center','Text size, contrast, motion, flashing, target-size, and performance controls.','/settings','ACCESS'],
  ['Search Categories','Universal Search now groups ESN results by category.','/explore','SEARCH'],
  ['Feature Discovery','This page shows the major systems the ESN website can actually do.','/explore','DISCOVER'],
]

const COMMANDS=[
  ['/spawn','Teleport to ESN SMP spawn.','Player'],
  ['/menu','Open the ESN SMP menu.','Player'],
  ['/shop','Open the ESN server shop.','Player'],
  ['/journal','Open the ESN Adventure Journal.','Player'],
  ['/crates','Open ESN loot crates.','Player'],
  ['/daily','Claim the daily ESN reward.','Progression'],
  ['/quests','View ESN quests.','Progression'],
  ['/realm [advance]','View or advance Realm 1–100 progression.','Progression'],
  ['/story','View and advance the NPC story questline.','Progression'],
  ['/discoveries','View Journal world discoveries.','Progression'],
  ['/level','View ESN level and rank.','Progression'],
  ['/achievements','View ESN achievements.','Progression'],
  ['/streak','View daily login streak.','Progression'],
  ['/season','View ESN season progress.','Progression'],
  ['/pass','Open the ESN Season Pass.','Progression'],
  ['/seasonpass','View RPG season progression.','Progression'],
  ['/jobs','View ESN jobs and job progress.','RPG'],
  ['/skills','View ESN skill progression.','RPG'],
  ['/prestige','Prestige ESN skills.','RPG'],
  ['/titles','View unlockable player titles.','RPG'],
  ['/titlemenu','View unlockable ESN player titles.','RPG'],
  ['/collections','View ESN collections.','RPG'],
  ['/bestiary','View mob and boss collection progress.','RPG'],
  ['/stats','View ESN career statistics.','RPG'],
  ['/progression','View the ESN RPG progression path.','RPG'],
  ['/adventure','View the ESN Adventure Engine.','Adventure'],
  ['/class','Choose an ESN combat class.','Adventure'],
  ['/ultimate','Activate your charged class ultimate.','Adventure'],
  ['/rift','Start a Rift encounter.','Adventure'],
  ['/bossrush','Start a five-boss rush.','Adventure'],
  ['/hunt','Start a Mythic Hunt.','Adventure'],
  ['/trophies','View your trophy room.','Adventure'],
  ['/boss','Access the ESN boss system.','Bosses'],
  ['/bossdrops','View uses for ESN boss drops.','Bosses'],
  ['/bosscodex','View the persistent boss codex.','Bosses'],
  ['/bosssummon','Consume a Nether Star to summon a Titan boss.','Bosses'],
  ['/dungeon','Access the ESN dungeon system.','Bosses'],
  ['/raid','Access the ESN raid system.','Bosses'],
  ['/endless','Start an Endless Trial.','Bosses'],
  ['/forge','Forge boss drops into ESN relics.','Gear'],
  ['/relics','View the ESN relic system.','Gear'],
  ['/runes','View ESN rune information.','Gear'],
  ['/runeforge','Socket Elite Runes into equipment.','Gear'],
  ['/gearupgrade','Evolve held equipment.','Gear'],
  ['/ascend','Ascend held Eternal equipment.','Gear'],
  ['/setbonus','View Eternal armor set bonuses.','Gear'],
  ['/blacksmith','Open ESN blacksmith information.','Gear'],
  ['/salvage','Access the ESN salvage system.','Gear'],
  ['/reforge','Access the ESN reforge system.','Gear'],
  ['/balance','View your ESN Coin balance.','Economy'],
  ['/pay <player> <amount>','Pay ESN Coins to an online player.','Economy'],
  ['/ah','Open and manage the ESN Auction House.','Economy'],
  ['/bounty [player] [coins]','View or place player bounties.','Economy'],
  ['/trade <player>','Securely trade held items.','Economy'],
  ['/stall browse','Browse ESN marketplace stalls.','Economy'],
  ['/blackmarket','Open the rotating ESN Black Market.','Economy'],
  ['/sethome [name]','Set a home.','Travel'],
  ['/home [name]','Teleport home.','Travel'],
  ['/homes','List your homes.','Travel'],
  ['/delhome [name]','Delete a home.','Travel'],
  ['/rtp','Random teleport.','Travel'],
  ['/tpa <player>','Request teleport to a player.','Travel'],
  ['/tpahere <player>','Request a player teleport to you.','Travel'],
  ['/tpaccept','Accept a teleport request.','Travel'],
  ['/tpdeny','Deny a teleport request.','Travel'],
  ['/tptoggle','Toggle incoming teleport requests.','Travel'],
  ['/back','Return to your previous teleport location.','Travel'],
  ['/warps','List server warps.','Travel'],
  ['/warp <name>','Teleport to a server warp.','Travel'],
  ['/claim','Protect and manage your base claim.','Protection'],
  ['/backpack','Open an ESN backpack.','Player'],
  ['/profile','View your ESN profile.','Player'],
  ['/tutorial','View the ESN SMP quick-start tutorial.','Help'],
  ['/guide','View the 2.0 progression path.','Help'],
  ['/calendar','View the ESN event calendar.','Events'],
  ['/event','View the current ESN event.','Events'],
  ['/community','View community goals.','Events'],
  ['/merchant','View the Mystery Merchant.','Events'],
  ['/fishingevent','View fishing event information.','Events'],
  ['/report <player> <reason>','Report a player to ESN staff.','Help'],
  ['/storeclaim','Claim pending paid ESN Store purchases.','Store'],
]

const ENCYCLOPEDIA=[
  ['Getting Started','Use /tutorial, /guide, /menu, /journal, /spawn, and /profile as the main entry points. The server combines survival, RPG progression, economy, custom bosses, events, crates, quests, and Adventure systems.'],
  ['Realm Progression','The plugin exposes a 100-Realm progression path through /realm. Discoveries, story progress, Realm rewards, Ascension Trials, and Realm-scaled gear are part of the current source.'],
  ['Economy + Trading','ESN Coins power balance, payments, shops, bounties, Auction House listings, secure trades, marketplace stalls, and related progression systems.'],
  ['Crates + Keys','The current plugin declares standard, Mythic, extended, and 100 Realm/Mega crate tiers. Authorized staff can use /megacratekey <1-100>; players use /crates.'],
  ['Boss + Endgame','Bosses, Boss Codex, boss drops, summoning, dungeons, raids, Endless Trials, Realm Mastery, artifacts, pets, treasure systems, KOTH, Chaos modifiers, and world events are represented in the current plugin.'],
  ['RPG Gear','Blacksmith, salvage, reforging, relics, runes, Rune Forge, gear evolution, Eternal ascension, set bonuses, skills, jobs, prestige, titles, collections, and bestiary systems are exposed by the current command metadata.'],
  ['Adventure Engine','Combat classes, ultimates, Rifts, five-boss Boss Rush, Mythic Hunts, trophies, adventure guilds, rotating bounties, artifact fusion, adventure achievements, and teammate revive mechanics are exposed in the current plugin.'],
  ['Season + Rewards','The plugin exposes /season, /season2, /pass, /seasonpass, challenges, milestones, achievements, daily rewards, reward roads, and rotating progression systems.'],
  ['Claims + Travel','Players have homes, warps, RTP, TPA, back, claim protection, and teleport toggles. Staff-only warp management remains permission-gated.'],
  ['Store Delivery','Paid ESN SMP products use the store bridge. Buyers should use the exact Minecraft username required by checkout and be online when automatic delivery is expected. /storeclaim is available for pending purchases.'],
]

const WHAT_IS_NEW=[
  ['Expansion 20','20 requested website systems added in one connected feature batch.'],
  ['Installable ESN','PWA manifest, service worker registration, install prompt support, home-screen launch, and standalone display mode.'],
  ['Adaptive Performance','Automatic device-aware mode plus manual Auto, Performance, and Premium selection.'],
  ['Accessibility Center','Reduced motion, no flashing, high contrast, larger text, and larger touch targets.'],
  ['SMP Knowledge Base','Searchable encyclopedia plus verified v2.9.4 command database sourced from the current ESNSMP plugin metadata.'],
  ['Arcade Meta Progression','Daily challenges, streaks, cross-game achievements, and global achievement notifications.'],
  ['Smarter Navigation','Recent destinations, favorites, categorized search, feature discovery, quick-copy tools, and a simplified mobile header.'],
]

const defaultPrefs={
  performance:'auto',
  reducedMotion:false,
  highContrast:false,
  largeText:false,
  largeTargets:false,
  noFlashing:true,
}

function readJson(key,fallback){
  try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}
}

function writeJson(key,value){
  try{localStorage.setItem(key,JSON.stringify(value))}catch{}
}

function deviceAutoMode(){
  const memory=navigator.deviceMemory||8
  const cores=navigator.hardwareConcurrency||8
  const saveData=Boolean(navigator.connection?.saveData)
  const coarse=matchMedia('(pointer: coarse)').matches
  return saveData||memory<=4||cores<=4||coarse?'performance':'premium'
}

function applyPrefs(prefs){
  const root=document.documentElement
  const effective=prefs.performance==='auto'?deviceAutoMode():prefs.performance
  root.dataset.performanceMode=effective
  root.dataset.motion=prefs.reducedMotion?'reduced':'full'
  root.dataset.contrast=prefs.highContrast?'high':'normal'
  root.dataset.textSize=prefs.largeText?'large':'normal'
  root.dataset.targetSize=prefs.largeTargets?'large':'normal'
  root.dataset.flashing=prefs.noFlashing?'off':'on'
}

async function copyText(value){
  try{await navigator.clipboard.writeText(value);return true}catch{return false}
}

export function SiteExpansionLayer(){
  const location=useLocation()
  const arcade=useArcadeProgress()
  const [toast,setToast]=useState(null)
  const previousAchievements=useRef(arcade.achievementCount)
  const installPrompt=useRef(null)

  useEffect(()=>{
    const current=readJson(RECENT_KEY,[])
    const next=[location.pathname,...current.filter(route=>route!==location.pathname)].slice(0,8)
    writeJson(RECENT_KEY,next)
    window.dispatchEvent(new Event('esn-history-change'))
  },[location.pathname])

  useEffect(()=>{
    const prefs={...defaultPrefs,...readJson(PREF_KEY,{})}
    applyPrefs(prefs)
    const update=event=>{
      const next={...defaultPrefs,...event.detail}
      applyPrefs(next)
    }
    window.addEventListener('esn-preferences-change',update)
    return()=>window.removeEventListener('esn-preferences-change',update)
  },[])

  useEffect(()=>{
    const beforeInstall=event=>{
      event.preventDefault()
      installPrompt.current=event
      window.dispatchEvent(new CustomEvent('esn-install-state',{detail:{available:true}}))
    }
    const install=async()=>{
      const prompt=installPrompt.current
      if(!prompt){
        window.dispatchEvent(new CustomEvent('esn-install-state',{detail:{available:false,message:'Install is not currently offered by this browser. On Android Chrome, use the browser menu and choose Add to Home screen / Install app if available.'}}))
        return
      }
      prompt.prompt()
      const choice=await prompt.userChoice
      if(choice?.outcome==='accepted')installPrompt.current=null
      window.dispatchEvent(new CustomEvent('esn-install-state',{detail:{available:Boolean(installPrompt.current),message:choice?.outcome==='accepted'?'ESN install accepted.':'Install prompt closed.'}}))
    }
    window.addEventListener('beforeinstallprompt',beforeInstall)
    window.addEventListener('esn-install-request',install)
    return()=>{window.removeEventListener('beforeinstallprompt',beforeInstall);window.removeEventListener('esn-install-request',install)}
  },[])

  useEffect(()=>{
    const achievement=event=>{
      const detail=event.detail||{}
      setToast({title:detail.title||'Achievement unlocked',copy:detail.copy||'ESN progress updated.'})
      window.setTimeout(()=>setToast(null),3200)
    }
    window.addEventListener('esn-achievement',achievement)
    return()=>window.removeEventListener('esn-achievement',achievement)
  },[])

  useEffect(()=>{
    if(arcade.achievementCount>previousAchievements.current){
      const recent=arcade.progress.recent?.[0]
      setToast({title:'Arcade achievement unlocked',copy:recent?.label||'Your shared Arcade progress increased.'})
      window.dispatchEvent(new Event('esn-progress-change'))
      window.setTimeout(()=>setToast(null),3200)
    }
    previousAchievements.current=arcade.achievementCount
  },[arcade.achievementCount])

  const unseen=localStorage.getItem('esn_last_seen_release')!==RELEASE_ID

  return <>
    {unseen&&<Link className="site-update-badge" to="/whatsnew" onClick={()=>localStorage.setItem('esn_last_seen_release',RELEASE_ID)}><span>NEW</span><b>Website update</b><small>See what changed →</small></Link>}
    {toast&&<div className="global-achievement-toast" role="status"><span>ESN ACHIEVEMENT</span><strong>{toast.title}</strong><small>{toast.copy}</small></div>}
  </>
}

export function SettingsPage(){
  const [prefs,setPrefs]=useState(()=>({...defaultPrefs,...readJson(PREF_KEY,{})}))
  const [installMessage,setInstallMessage]=useState('')
  const effective=prefs.performance==='auto'?deviceAutoMode():prefs.performance

  const save=next=>{
    setPrefs(next)
    writeJson(PREF_KEY,next)
    applyPrefs(next)
    window.dispatchEvent(new CustomEvent('esn-preferences-change',{detail:next}))
  }

  useEffect(()=>{
    const result=event=>setInstallMessage(event.detail?.message||'')
    window.addEventListener('esn-install-state',result)
    return()=>window.removeEventListener('esn-install-state',result)
  },[])

  const toggles=[
    ['reducedMotion','Reduced motion','Stops non-essential movement and animated transitions.'],
    ['noFlashing','Disable flashing','Keeps flashes and rapid attention effects disabled.'],
    ['highContrast','High contrast','Strengthens text, borders, and foreground contrast.'],
    ['largeText','Larger text','Increases the global reading scale.'],
    ['largeTargets','Larger controls','Makes buttons and touch targets easier to hit.'],
  ]

  return <>
    <section className="page-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">SYSTEM CONTROL</span><h1>Performance & Accessibility.</h1><p>Control how much visual work ESN does on this device and tune the interface for comfort, readability, and battery life.</p></div><div className="page-hero-mark"><span>SYS</span><small>SETTINGS</small></div></div></section>
    <section className="section"><div className="shell expansion-settings-grid">
      <article className="expansion-panel">
        <span className="eyebrow">PERFORMANCE MODE</span><h2>Choose your rendering profile.</h2><p>Auto detects phone/low-power conditions. Performance reduces visual cost. Premium keeps the richer desktop presentation where the device can handle it.</p>
        <div className="mode-selector">{['auto','performance','premium'].map(mode=><button className={prefs.performance===mode?'active':''} type="button" onClick={()=>save({...prefs,performance:mode})} key={mode}><strong>{mode.toUpperCase()}</strong><small>{mode==='auto'?'Device-aware':mode==='performance'?'Battery + smoothness':'Maximum desktop visuals'}</small></button>)}</div>
        <div className="effective-mode"><span>ACTIVE PROFILE</span><strong>{effective.toUpperCase()}</strong></div>
      </article>
      <article className="expansion-panel">
        <span className="eyebrow">INSTALL ESN</span><h2>Add the site like an app.</h2><p>Supported browsers can install ES Network to the home screen and launch it in a standalone window.</p>
        <button className="button primary" type="button" onClick={()=>window.dispatchEvent(new Event('esn-install-request'))}>Install ESN</button>
        {installMessage&&<small className="settings-message">{installMessage}</small>}
      </article>
    </div></section>
    <section className="section dark-section"><div className="shell"><div className="section-heading"><div><span className="eyebrow">ACCESSIBILITY CENTER</span><h2>Make ESN fit you.</h2></div></div><div className="accessibility-grid">{toggles.map(([key,label,copy])=><button className={prefs[key]?'active':''} type="button" onClick={()=>save({...prefs,[key]:!prefs[key]})} key={key}><span>{prefs[key]?'ON':'OFF'}</span><strong>{label}</strong><small>{copy}</small></button>)}</div></div></section>
  </>
}

export function WhatsNewPage(){
  useEffect(()=>{localStorage.setItem('esn_last_seen_release',RELEASE_ID)},[])
  return <>
    <section className="page-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">WHAT'S NEW</span><h1>Everything added in the latest ESN expansion.</h1><p>This center marks the current feature batch as seen on this device and keeps the major changes easy to find.</p></div><div className="page-hero-mark"><span>NEW</span><small>20 SYSTEMS</small></div></div></section>
    <section className="section"><div className="shell whats-new-grid">{WHAT_IS_NEW.map(([title,copy],index)=><article key={title}><span>{String(index+1).padStart(2,'0')}</span><h2>{title}</h2><p>{copy}</p></article>)}</div></section>
    <section className="section compact-section dark-section"><div className="shell expansion-callout"><div><span className="eyebrow">FULL CHANGELOG</span><h2>Release Center keeps the long-term history.</h2></div><Link className="button secondary" to="/updates">Open Release Center</Link></div></section>
  </>
}

export function SMPEncyclopediaPage(){
  const [query,setQuery]=useState('')
  const [category,setCategory]=useState('All')
  const categories=['All',...new Set(COMMANDS.map(item=>item[2]))]
  const normalized=query.trim().toLowerCase()
  const filtered=COMMANDS.filter(([command,copy,group])=>(category==='All'||group===category)&&(!normalized||(`${command} ${copy} ${group}`).toLowerCase().includes(normalized)))
  const [copied,setCopied]=useState('')

  const doCopy=async value=>{
    if(await copyText(value)){setCopied(value);window.setTimeout(()=>setCopied(''),1200)}
  }

  return <>
    <section className="page-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">ESN SMP ENCYCLOPEDIA</span><h1>Search the server, not a Discord wall.</h1><p>Current public ESNSMP v2.9.4 systems and declared player-facing commands organized into one searchable reference.</p></div><div className="page-hero-mark"><span>SMP</span><small>CODEX</small></div></div></section>
    <section className="section compact-section"><div className="shell quick-copy-strip">
      <button type="button" onClick={()=>doCopy(SMP_ADDRESS)}><span>IP</span><strong>{SMP_ADDRESS}</strong><small>{copied===SMP_ADDRESS?'COPIED':'COPY'}</small></button>
      <button type="button" onClick={()=>doCopy(SMP_PORT)}><span>PORT</span><strong>{SMP_PORT}</strong><small>{copied===SMP_PORT?'COPIED':'COPY'}</small></button>
      <button type="button" onClick={()=>doCopy(`${SMP_ADDRESS}:${SMP_PORT}`)}><span>FULL</span><strong>{SMP_ADDRESS}:{SMP_PORT}</strong><small>{copied===`${SMP_ADDRESS}:${SMP_PORT}`?'COPIED':'COPY'}</small></button>
      <button type="button" onClick={()=>doCopy(PLUGIN_SHA256)}><span>PLUGIN SHA-256</span><strong>{PLUGIN_SHA256}</strong><small>{copied===PLUGIN_SHA256?'COPIED':'COPY'}</small></button>
    </div></section>
    <section className="section"><div className="shell"><div className="section-heading"><div><span className="eyebrow">ENCYCLOPEDIA</span><h2>Major ESNSMP systems.</h2></div></div><div className="encyclopedia-grid">{ENCYCLOPEDIA.map(([title,copy])=><article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>
    <section className="section dark-section"><div className="shell"><div className="section-heading"><div><span className="eyebrow">COMMAND DATABASE</span><h2>Search verified command metadata.</h2><p>Command names and descriptions here follow the current v2.9.4 plugin metadata. Permission-gated admin commands are intentionally not presented as normal player tools.</p></div></div>
      <div className="command-search-bar"><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search home, boss, realm, trade, season…"/><span>{filtered.length} RESULTS</span></div>
      <div className="command-category-row">{categories.map(item=><button className={category===item?'active':''} type="button" onClick={()=>setCategory(item)} key={item}>{item}</button>)}</div>
      <div className="smp-command-grid">{filtered.map(([command,copy,group])=><article key={command}><div><span>{group}</span><button type="button" onClick={()=>doCopy(command.split(' ')[0])}>{copied===command.split(' ')[0]?'COPIED':'COPY'}</button></div><code>{command}</code><p>{copy}</p></article>)}</div>
    </div></section>
  </>
}

export function SupportPage(){
  const location=useLocation()
  const [description,setDescription]=useState('')
  const [copied,setCopied]=useState(false)
  const report=useMemo(()=>{
    const lines=[
      'ESN WEBSITE BUG REPORT',
      `Page: ${window.location.href}`,
      `Viewport: ${window.innerWidth}x${window.innerHeight}`,
      `Performance mode: ${document.documentElement.dataset.performanceMode||'unknown'}`,
      `Browser: ${navigator.userAgent}`,
      `Online: ${navigator.onLine?'yes':'no'}`,
      `Issue: ${description.trim()||'[describe the problem]'}`,
    ]
    return lines.join('\n')
  },[description,location.pathname])

  const copy=async()=>{if(await copyText(report)){setCopied(true);window.setTimeout(()=>setCopied(false),1400)}}

  return <>
    <section className="page-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">WEBSITE SUPPORT</span><h1>Report a problem with useful diagnostics.</h1><p>The report stays on your device until you copy it. ESN does not automatically send browser diagnostics anywhere.</p></div><div className="page-hero-mark"><span>BUG</span><small>REPORT</small></div></div></section>
    <section className="section"><div className="shell report-layout">
      <article className="expansion-panel"><span className="eyebrow">WHAT HAPPENED?</span><h2>Describe the issue.</h2><textarea value={description} onChange={event=>setDescription(event.target.value)} placeholder="Example: the bottom navigation flashes when I scroll back up…"/><div className="hero-actions"><button className="button primary" type="button" onClick={copy}>{copied?'Report copied':'Copy diagnostic report'}</button><a className="button secondary" href={DISCORD_URL} target="_blank" rel="noreferrer">Open ESN Discord</a></div></article>
      <article className="diagnostic-preview"><span>REPORT PREVIEW</span><pre>{report}</pre></article>
    </div></section>
  </>
}

export function GalleryPage(){
  const media=[
    {type:'BRAND',title:'ES Network Social Card',copy:'Current official 1200×630 ESN social-preview artwork.',image:'/esn-social-card.svg'},
    {type:'BRAND',title:'ES Network Mark',copy:'Current ESN mark used across the website and installable app experience.',image:'/esn-mark.svg'},
    {type:'MILESTONE',title:'Network Evolution 12X',copy:'Missions, Passport, Terminal, search, event board, achievements, and mobile-safe systems shipped together.'},
    {type:'MILESTONE',title:'Custom .com Launch',copy:'The rebuilt production website moved onto esnoffical.com with production indexing enabled.'},
    {type:'SMP',title:'ESNSMP v2.9.4',copy:'Current public plugin metadata used by the website command encyclopedia.'},
    {type:'MEDIA',title:'Community Media Slots',copy:'Approved SMP screenshots, builds, event photos, and promotional media can be added here without using fake placeholders.'},
  ]
  return <>
    <section className="page-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">ESN MEDIA</span><h1>Gallery & milestones.</h1><p>A home for official ESN visuals, website milestones, SMP media, Arcade releases, and approved community content.</p></div><div className="page-hero-mark"><span>ESN</span><small>MEDIA</small></div></div></section>
    <section className="section"><div className="shell media-gallery-grid">{media.map(item=><article key={item.title}>{item.image?<div className="media-gallery-image"><img src={item.image} alt={item.title}/></div>:<div className="media-gallery-placeholder"><span>ES</span></div>}<span>{item.type}</span><h2>{item.title}</h2><p>{item.copy}</p></article>)}</div></section>
  </>
}

export function NetworkStatsPage(){
  const live=useLiveNetwork()
  const arcade=useArcadeProgress()
  const recent=readJson(RECENT_KEY,[])
  const favorites=readJson(FAVORITES_KEY,[])
  const eggs=readJson('esn_easter_eggs',[])
  const missions=readJson('esn_passport_routes',[])
  const stats=[
    ['Website','ONLINE'],
    ['SMP',live.smp.status==='offline'?'CHECKING':'LIVE'],
    ['Plugin',live.plugin.version||'Checking…'],
    ['Arcade games','6'],
    ['Verified reviews','35'],
    ['Arcade level',String(arcade.level)],
    ['Arcade achievements',String(arcade.achievementCount)],
    ['Hidden signals',`${eggs.length}/24`],
    ['Pages explored',String(new Set(missions).size)],
    ['Recent destinations',String(recent.length)],
    ['Favorites',String(favorites.length)],
    ['SMP address',`${SMP_ADDRESS}:${SMP_PORT}`],
  ]
  return <>
    <section className="page-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">NETWORK STATISTICS</span><h1>Live network + local progress.</h1><p>Public ESN status information and device-local progress shown together without inventing historical uptime or server telemetry.</p></div><div className="page-hero-mark"><span>12</span><small>METRICS</small></div></div></section>
    <section className="section"><div className="shell network-stat-dashboard">{stats.map(([label,value])=><article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div></section>
  </>
}

export function ExplorePage(){
  const [,force]=useState(0)
  const recent=readJson(RECENT_KEY,[]).filter(route=>ROUTE_META[route]).slice(0,6)
  const favorites=readJson(FAVORITES_KEY,[]).filter(route=>ROUTE_META[route])
  useEffect(()=>{const refresh=()=>force(value=>value+1);window.addEventListener('esn-history-change',refresh);return()=>window.removeEventListener('esn-history-change',refresh)},[])
  const toggleFavorite=route=>{
    const current=readJson(FAVORITES_KEY,[])
    const next=current.includes(route)?current.filter(item=>item!==route):[...current,route].slice(0,8)
    writeJson(FAVORITES_KEY,next)
    force(value=>value+1)
  }
  return <>
    <section className="page-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">EXPLORE ESN</span><h1>Everything the website can do.</h1><p>Discover the systems behind ESN instead of relying on hidden UI or floating controls to explain themselves.</p></div><div className="page-hero-mark"><span>20</span><small>FEATURES</small></div></div></section>
    <section className="section"><div className="shell"><div className="section-heading"><div><span className="eyebrow">FEATURE DISCOVERY</span><h2>Built into the current ESN experience.</h2></div></div><div className="feature-discovery-grid">{EXPLORE_FEATURES.map(([title,copy,to,tag])=><Link to={to} key={title}><span>{tag}</span><h3>{title}</h3><p>{copy}</p><b>Explore →</b></Link>)}</div></div></section>
    <section className="section dark-section"><div className="shell recent-favorite-layout">
      <div><div className="section-heading"><div><span className="eyebrow">RECENTLY VISITED</span><h2>Continue where you left off.</h2></div></div><div className="recent-route-list">{recent.length?recent.map(route=><div key={route}><Link to={route}><strong>{ROUTE_META[route].label}</strong><small>{ROUTE_META[route].category}</small></Link><button type="button" onClick={()=>toggleFavorite(route)}>{favorites.includes(route)?'★':'☆'}</button></div>):<p>Explore ESN and your recent destinations will appear here.</p>}</div></div>
      <div><div className="section-heading"><div><span className="eyebrow">FAVORITES</span><h2>Your pinned destinations.</h2></div></div><div className="recent-route-list">{favorites.length?favorites.map(route=><div key={route}><Link to={route}><strong>{ROUTE_META[route].label}</strong><small>{ROUTE_META[route].category}</small></Link><button type="button" onClick={()=>toggleFavorite(route)}>★</button></div>):<p>Tap the star beside a recent destination to save it here.</p>}</div></div>
    </div></section>
  </>
}

function dateKey(){
  const now=new Date()
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
}

const DAILY_POOL=[
  {id:'clicks',label:'Clicker Charge',stat:'clickerTaps',target:250,copy:'Make 250 Clicker taps today.'},
  {id:'mines',label:'Safe Miner',stat:'minesSafe',target:20,copy:'Reveal 20 safe Mines tiles today.'},
  {id:'moto',label:'Track Runner',stat:'motoFinishes',target:1,copy:'Finish one MOTO track today.'},
  {id:'tower',label:'Tower Climber',stat:'towerFloors',target:12,copy:'Advance 12 Tower floors today.'},
  {id:'td',label:'Defense Shift',stat:'tdWaves',target:15,copy:'Clear 15 Tower Defense waves today.'},
  {id:'factory',label:'Factory Builder',stat:'factoryMachines',target:3,copy:'Add 3 Factory machine progress events today.'},
]

export function ArcadeProgressCenter(){
  const arcade=useArcadeProgress()
  const today=dateKey()
  const stored=readJson(DAILY_KEY,{})
  const totals=arcade.progress.totals||{}
  const seed=Number(today.replaceAll('-',''))||0
  const selected=[0,1,2].map(offset=>DAILY_POOL[(seed+offset*2)%DAILY_POOL.length])
  const baseline=stored.date===today?stored.baseline:Object.fromEntries(Object.keys(totals).map(key=>[key,totals[key]||0]))
  const completed=stored.date===today?(stored.completed||[]):[]

  useEffect(()=>{
    if(stored.date!==today)writeJson(DAILY_KEY,{date:today,baseline,completed:[],streak:stored.streak||0,lastComplete:stored.lastComplete||null})
  },[today])

  useEffect(()=>{
    const latest=readJson(DAILY_KEY,{date:today,baseline,completed:[],streak:0})
    let changed=false
    const nextCompleted=new Set(latest.completed||[])
    selected.forEach(challenge=>{
      const value=Math.max(0,(totals[challenge.stat]||0)-(latest.baseline?.[challenge.stat]||0))
      if(value>=challenge.target&&!nextCompleted.has(challenge.id)){
        nextCompleted.add(challenge.id)
        arcade.gainXp(60,'Daily challenge: '+challenge.label)
        window.dispatchEvent(new CustomEvent('esn-achievement',{detail:{title:'Daily challenge complete',copy:challenge.label+' • +60 Arcade XP'}}))
        changed=true
      }
    })
    if(changed){
      const next={...latest,completed:[...nextCompleted]}
      if(nextCompleted.size===3&&latest.lastComplete!==today){
        const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1)
        const y=`${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`
        next.streak=latest.lastComplete===y?(latest.streak||0)+1:1
        next.lastComplete=today
        window.dispatchEvent(new CustomEvent('esn-achievement',{detail:{title:'Daily set complete',copy:`${next.streak}-day Arcade challenge streak`}}))
      }
      writeJson(DAILY_KEY,next)
    }
  },[totals.clickerTaps,totals.minesSafe,totals.motoFinishes,totals.towerFloors,totals.tdWaves,totals.factoryMachines,today])

  useEffect(()=>{
    const tests=[
      ['cross-game-starter','Cross-Game Starter',(totals.clickerTaps||0)>0&&(totals.minesSafe||0)>0&&(totals.towerFloors||0)>0,150],
      ['arcade-veteran','Arcade Veteran',(arcade.progress.xp||0)>=5000,250],
      ['defense-operator','Defense Operator',(totals.tdWaves||0)>=100,180],
      ['tower-climber','Tower Climber',(totals.towerFloors||0)>=100,180],
    ]
    tests.forEach(([id,label,ready,xp])=>{if(ready)arcade.unlock(id,label,xp)})
  },[arcade.progress.xp,totals.clickerTaps,totals.minesSafe,totals.towerFloors,totals.tdWaves])

  const latest=readJson(DAILY_KEY,{date:today,baseline,completed:[],streak:0})
  return <section className="section arcade-daily-section"><div className="shell">
    <div className="section-heading"><div><span className="eyebrow">ARCADE DAILY</span><h2>Three challenges. One shared progression.</h2><p>Daily progress is calculated from this device's real Arcade totals and resets to a new local baseline each day.</p></div><div className="daily-streak"><span>STREAK</span><strong>{latest.streak||0}</strong></div></div>
    <div className="arcade-daily-grid">{selected.map(challenge=>{
      const progress=Math.max(0,(totals[challenge.stat]||0)-(latest.baseline?.[challenge.stat]||0))
      const done=(latest.completed||[]).includes(challenge.id)||progress>=challenge.target
      return <article className={done?'complete':''} key={challenge.id}><span>{done?'COMPLETE':'60 XP'}</span><h3>{challenge.label}</h3><p>{challenge.copy}</p><div><i style={{width:Math.min(100,(progress/challenge.target)*100)+'%'}}/></div><small>{Math.min(progress,challenge.target)} / {challenge.target}</small></article>
    })}</div>
  </div></section>
}
