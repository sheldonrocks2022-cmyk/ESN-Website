import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { DISCORD_URL, SITE_RELEASE, SMP_ADDRESS, SMP_PORT, useLiveNetwork } from './liveNetwork'
import { useArcadeProgress } from './arcade/shared'

const RELEASE_ID='2026-09-28-site-builder'
const RECENT_KEY='esn_recent_routes'
const FAVORITES_KEY='esn_favorites'
const PREF_KEY='esn_site_preferences'
const DAILY_KEY='esn_arcade_daily_v1'
const RETENTION_KEY='esn_retention_v1'
const WEEKLY_KEY='esn_weekly_missions_v1'
const VOTE_KEY='esn_community_vote_v1'
const GAME_ROUTES=['/esclicker','/esfactory','/esmines','/esmoto','/estower','/estowerdefense']
const PLUGIN_SHA256='4439a6c8bf7ea6b0bf170098eeb1dff3f9f2f7008c06556140a1c1cfd8afd356'

const ROUTE_META={
  '/':{label:'Home',category:'Network'},
  '/serviceshowcase':{label:'Services',category:'Services'},
  '/store-ai':{label:'ESN Store AI',category:'Services'},
  '/hosting':{label:'ESN Hosting',category:'Services'},
  '/site-builder':{label:'ESN Website Builder',category:'Services'},
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
  '/operations':{label:'Operations Map',category:'Network'},
  '/incidents':{label:'Incident History',category:'Network'},
  '/changelog':{label:'Network Changelog',category:'Updates'},
  '/diagnostics':{label:'Diagnostic Center',category:'Help'},
  '/smpcheck':{label:'SMP Connection Tester',category:'SMP'},
  '/blueprint':{label:'System Blueprint',category:'Network'},
  '/session':{label:'Session Stats',category:'Network'},
  '/nexus':{label:'Network Nexus',category:'Network'},
  '/notifications':{label:'Notification Center',category:'Network'},
  '/rewards':{label:'Reward Vault',category:'Network'},
  '/challenges':{label:'Challenge Lab',category:'Arcade'},
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
  ['Notification Center','Keep release, reward, achievement, SMP, and local browser alerts in one account-free inbox.','/notifications','ALERTS'],
  ['Reward Vault','Spend locally earned Network Shards on cosmetic core skins and profile titles.','/rewards','REWARDS'],
  ['Challenge Lab','Create and accept shareable Arcade target challenges without accounts or fake opponents.','/challenges','CHALLENGE'],
  ['Operations Map','See Website, Nexus, SMP, Arcade, Terminal, Store, and Staff as one connected live system.','/operations','OPS'],
  ['Diagnostic Center','Run safe browser, service worker, cache, SMP, plugin, and Discord checks before opening support.','/diagnostics','DIAG'],
  ['SMP Connection Tester','Test the current SMP address, port, telemetry, plugin release, and website reachability.','/smpcheck','SMP'],
  ['System Blueprint','Explore how Nexus, Terminal, Vault, Arcade, SMP, Staff, and Operations connect.','/blueprint','SYSTEM'],
  ['Session Stats','See account-free local visit time, routes, Arcade XP, hidden signals, and Terminal activity.','/session','LOCAL'],
  ['ESN Store AI','Ask about every verified ESN product and service, compare prices, check delivery rules, find checkout, or unlock staff store tools.','/store-ai','STORE AI'],
  ['ESN Domains','Choose an ESN subdomain, connect a domain you own, and manage activation through the ESN Domains control layer.','/domains','DOMAINS'],
  ['ESN Website Builder','Generate, edit, preview, export, and safely publish a website tied to your ESN subdomain.','/site-builder','BUILDER'],
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
  ['/leaderboard','View the ESN leaderboard.','Progression'],
  ['/team <create|join|leave|info>','Manage ESN teams.','Player'],
  ['/outlaws','View active ESN outlaws and hunter rewards.','Player'],
  ['/grave','View your last death location.','Player'],
  ['/msg <player> <message>','Send a private message.','Chat'],
  ['/reply <message>','Reply to your latest private message.','Chat'],
  ['/globalchat','Switch to global chat.','Chat'],
  ['/localchat','Switch to local chat.','Chat'],
  ['/chattoggle','Toggle receiving public chat.','Chat'],
  ['/chatmenu','Open ESN chat settings.','Chat'],
  ['/tpmenu','Open the ESN teleport request menu.','Travel'],
  ['/tradegui <player>','Open secure player trading.','Economy'],
  ['/party','Access the ESN party system.','Adventure'],
  ['/guildhq [create <name>]','View or create your Guild Headquarters.','Adventure'],
  ['/guild','Manage adventure guild progression.','Adventure'],
  ['/records','View persistent ESN server records.','Adventure'],
  ['/bountyboard','View your rotating adventure bounty.','Adventure'],
  ['/artifactfusion','Fuse matching ESN rarity artifacts.','Gear'],
  ['/adventureachievements','View adventure achievements.','Adventure'],
  ['/revive','Revive a nearby downed teammate.','Adventure'],
  ['/mastery','View Realm mastery progression.','Progression'],
  ['/codex','View discovered ESN boss progression.','Bosses'],
  ['/pets','View boss pet information.','Bosses'],
  ['/treasure','View treasure system information.','Bosses'],
  ['/chaos','View the active ESN Chaos modifier.','Events'],
  ['/artifacts','View ESN boss artifact information.','Gear'],
  ['/contracts','View persistent boss contracts.','Progression'],
  ['/challenges','View ESN challenge progress.','Progression'],
  ['/rewards','View the ESN reward road.','Progression'],
  ['/milestones','View and claim boss milestones.','Bosses'],
  ['/bestiary2','View the persistent bestiary.','RPG'],
  ['/achievements2','View 2.0 achievements.','Progression'],
  ['/title','Equip earned titles.','RPG'],
  ['/party2','Use safe party invitations.','Adventure'],
  ['/events2','View 2.0 world events.','Events'],
  ['/leaderboards2','View 2.0 career standings.','Progression'],
  ['/claimflags','View claim protection features.','Protection'],
  ['/skilltree','View RPG skill tree progression.','RPG'],
  ['/contracts2','View advanced weekly contracts.','Progression'],
  ['/rotation','View the current progression rotation.','Progression'],
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

const KNOWN_ITEMS=[
  ['Season Pass Relics','Angel Wings • Inferno Scepter • Storm Crystal • Tideheart • Void Relic • Celestial Star'],
  ['Riftwalker Bundle','Riftblade • Rift Wings • Phase Boots • Rift Bow • Rift Core • Void Compass'],
  ['Immortal Warden Bundle','Immortal Warden Helmet • Chestplate • Leggings • Boots • Warden Blade • Warden Longbow • Immortal Core • Warden Totem'],
  ['Void Warrior Bundle','Void Blade • Void Crown • Void Chestplate • Void Leggings • Void Boots'],
  ['Realm Progression','Realm 100 keys and Realm-scaled rewards are part of the current public store/progression surface.'],
]

const WHAT_IS_NEW=[
  ['ESN Domains Launch','Subdomain selection, custom-domain connection, protected names, Cloudflare-ready D1 reservations, staff-approved activation, expiration handling, and domain routing are now built into ESN.'],
  ['ESN Store AI','A public catalog-aware store assistant now covers SMP products and ESN services, with verified-price safeguards, checkout help, comparisons, delivery guidance, and staff-only store auditing/draft tools.'],
  ['Operations Expansion','Operations Map, maintenance mode, public incident controls, changelog timeline, diagnostics, SMP connection testing, Terminal campaign, dynamic homepage state, blueprint, recovery console, session stats, broadcast previews, countdowns, emergency themes, and staff macros are now active.'],
  ['No-Account Expansion','Notification Center, Reward Vault, shareable Challenge Lab, stronger Nexus actions, richer SMP telemetry, and the code-gated Staff Dashboard are now wired into ESN.'],
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
  noFlashing:false,
}

function readJson(key,fallback){
  try{
    const value=JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))
    if(Array.isArray(fallback))return Array.isArray(value)?value:fallback
    if(fallback&&typeof fallback==='object')return value&&typeof value==='object'&&!Array.isArray(value)?value:fallback
    return value??fallback
  }catch{return fallback}
}

function writeJson(key,value){
  try{localStorage.setItem(key,JSON.stringify(value))}catch{}
}

function deviceAutoMode(){
  const memory=navigator.deviceMemory||8
  const cores=navigator.hardwareConcurrency||8
  const saveData=Boolean(navigator.connection?.saveData)
  return saveData||memory<=4||cores<=4?'performance':'premium'
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
    <section className="page-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">WHAT'S NEW</span><h1>Everything added in the latest ESN expansion.</h1><p>This center marks the current feature batch as seen on this device and keeps the major changes easy to find.</p></div><div className="page-hero-mark"><span>NEW</span><small>NO-ACCOUNT EXPANSION</small></div></div></section>
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
    <section className="section compact-section"><div className="shell"><div className="section-heading"><div><span className="eyebrow">KNOWN CUSTOM ITEMS + SETS</span><h2>Current website/store-backed item reference.</h2><p>Only items already surfaced by the current ESN SMP store or progression experience are listed here; the site does not invent undocumented gear.</p></div></div><div className="known-item-grid">{KNOWN_ITEMS.map(([title,items])=><article key={title}><strong>{title}</strong><p>{items}</p></article>)}</div></div></section>
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
    <section className="page-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">EXPLORE ESN</span><h1>Everything the website can do.</h1><p>Discover the systems behind ESN instead of relying on hidden UI or floating controls to explain themselves.</p></div><div className="page-hero-mark"><span>{EXPLORE_FEATURES.length}</span><small>FEATURES</small></div></div></section>
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


function weekKey(){
  const now=new Date()
  const first=new Date(now.getFullYear(),0,1)
  const days=Math.floor((now-first)/86400000)
  const week=Math.ceil((days+first.getDay()+1)/7)
  return `${now.getFullYear()}-W${String(week).padStart(2,'0')}`
}

function previousDateKey(){
  const d=new Date()
  d.setDate(d.getDate()-1)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const WEEKLY_POOL=[
  {id:'weekly-clicker',label:'Reactor Operator',stat:'clickerTaps',target:1200,xp:180,copy:'Make 1,200 Clicker taps this week.'},
  {id:'weekly-mines',label:'Deep Miner',stat:'minesSafe',target:75,xp:180,copy:'Reveal 75 safe Mines tiles this week.'},
  {id:'weekly-moto',label:'Track Specialist',stat:'motoFinishes',target:5,xp:220,copy:'Finish five MOTO tracks this week.'},
  {id:'weekly-tower',label:'Tower Veteran',stat:'towerFloors',target:60,xp:220,copy:'Advance 60 Tower floors this week.'},
  {id:'weekly-defense',label:'Defense Commander',stat:'tdWaves',target:45,xp:240,copy:'Clear 45 Tower Defense waves this week.'},
  {id:'weekly-factory',label:'Industrial Expansion',stat:'factoryMachines',target:15,xp:200,copy:'Purchase 15 Factory machines this week.'},
]

const VOTE_OPTIONS=[
  ['arcade-event','Arcade event weekend','A rotating boosted Arcade event with special challenges.'],
  ['smp-event','SMP event board expansion','More live SMP event information and event history.'],
  ['vault-drop','Vault collectible drop','A limited collectible hunt hidden across ESN.'],
  ['new-game-mode','New Arcade game mode','Add another mode to an existing ESN Arcade title.'],
]

function personalGameRecords(){
  const clicker=readJson('esn_clicker_original_v1',{highest:0,totalClicks:0})
  const factory=readJson('esn_factory_original_v1',{lifetimeMachines:0})
  const mines=readJson('esn_mines_stats_v2',{bestMultiplier:1,safeTiles:0})
  const moto=readJson('esn_moto_original_v1',{best:{},finishes:0,golds:0})
  const tower=readJson('esn_tower_stats_v2',{bestFloor:1,cashouts:0})
  const defense=readJson('esn_td_career_v2',{bestRound:1,waves:0})
  const motoTimes=Object.values(moto.best||{}).filter(value=>Number.isFinite(value))
  const bestMoto=motoTimes.length?Math.min(...motoTimes):null
  return [
    {name:'ES Clicker',route:'/esclicker',record:Math.floor(clicker.highest||0).toLocaleString()+' ES',score:Math.log10((clicker.highest||0)+1)*22+(clicker.totalClicks||0)/80},
    {name:'ES Factory',route:'/esfactory',record:(factory.lifetimeMachines||0).toLocaleString()+' machines',score:(factory.lifetimeMachines||0)*2.2},
    {name:'ES Mines',route:'/esmines',record:Number(mines.bestMultiplier||1).toFixed(2)+'× best',score:Number(mines.bestMultiplier||1)*18+(mines.safeTiles||0)/8},
    {name:'ES MOTO',route:'/esmoto',record:bestMoto?bestMoto.toFixed(2)+'s best':'No finish yet',score:(moto.golds||0)*35+(moto.finishes||0)*5+(bestMoto?Math.max(0,50-bestMoto):0)},
    {name:'ES Tower',route:'/estower',record:'Floor '+(tower.bestFloor||1),score:(tower.bestFloor||1)*3+(tower.cashouts||0)*8},
    {name:'ES Tower Defense',route:'/estowerdefense',record:'Wave '+(defense.bestRound||1),score:(defense.bestRound||1)*3+(defense.waves||0)},
  ].sort((a,b)=>b.score-a.score)
}

export function RetentionHub(){
  const arcade=useArcadeProgress()
  const [,refresh]=useState(0)
  const today=dateKey()
  const week=weekKey()
  const totals=arcade.progress.totals||{}
  const recent=readJson(RECENT_KEY,[])
  const continueRoute=recent.find(route=>GAME_ROUTES.includes(route))||'/arcade'
  const continueMeta=ROUTE_META[continueRoute]||{label:'ESN Arcade',category:'Arcade'}
  const daily=readJson(DAILY_KEY,{date:today,completed:[],streak:0})
  const current=readJson(RETENTION_KEY,{lastClaim:null,streak:0,networkXp:0,shards:0,collectibles:[],visits:0,lastVisit:null})
  const weeklyStored=readJson(WEEKLY_KEY,{})
  const weekSeed=Number(week.replace(/\D/g,''))||0
  const weeklySelected=[0,1,2,3].map(offset=>WEEKLY_POOL[(weekSeed+offset*2)%WEEKLY_POOL.length])
  const baseline=weeklyStored.week===week?weeklyStored.baseline:Object.fromEntries(Object.keys(totals).map(key=>[key,totals[key]||0]))
  const weeklyCompleted=weeklyStored.week===week?(weeklyStored.completed||[]):[]
  const weekend=[0,5,6].includes(new Date().getDay())
  const records=personalGameRecords()
  const eggs=readJson('esn_easter_eggs',[])

  useEffect(()=>{
    const state=readJson(RETENTION_KEY,{lastClaim:null,streak:0,networkXp:0,shards:0,collectibles:[],visits:0,lastVisit:null})
    if(state.lastVisit!==today){
      writeJson(RETENTION_KEY,{...state,lastVisit:today,visits:(state.visits||0)+1})
      refresh(value=>value+1)
    }
  },[today])

  useEffect(()=>{
    if(weeklyStored.week!==week){
      writeJson(WEEKLY_KEY,{week,baseline,completed:[],claimed:[]})
      refresh(value=>value+1)
      return
    }
    const latest=readJson(WEEKLY_KEY,{week,baseline,completed:[],claimed:[]})
    const next=new Set(latest.completed||[])
    let changed=false
    weeklySelected.forEach(mission=>{
      const progress=Math.max(0,(totals[mission.stat]||0)-(latest.baseline?.[mission.stat]||0))
      if(progress>=mission.target&&!next.has(mission.id)){
        next.add(mission.id)
        arcade.gainXp(mission.xp,'Weekly mission: '+mission.label)
        const retention=readJson(RETENTION_KEY,{networkXp:0,shards:0,collectibles:[]})
        writeJson(RETENTION_KEY,{...retention,networkXp:(retention.networkXp||0)+mission.xp,shards:(retention.shards||0)+3})
        window.dispatchEvent(new CustomEvent('esn-achievement',{detail:{title:'Weekly mission complete',copy:`${mission.label} • +${mission.xp} XP • +3 Network Shards`}}))
        changed=true
      }
    })
    if(changed){
      writeJson(WEEKLY_KEY,{...latest,completed:[...next]})
      refresh(value=>value+1)
    }
  },[week,totals.clickerTaps,totals.minesSafe,totals.motoFinishes,totals.towerFloors,totals.tdWaves,totals.factoryMachines])

  useEffect(()=>{
    const state=readJson(RETENTION_KEY,{networkXp:0,shards:0,collectibles:[]})
    const unlocked=new Set(state.collectibles||[])
    if((state.streak||0)>=3)unlocked.add('Streak Core')
    if((state.streak||0)>=7)unlocked.add('Seven-Day Signal')
    if(arcade.achievementCount>=5)unlocked.add('Arcade Crest')
    if(eggs.length>=5)unlocked.add('Hidden Signal Fragment')
    if(weeklyCompleted.length>=3)unlocked.add('Mission Prism')
    if(weekend)unlocked.add('Surge Weekend Token')
    if(unlocked.size!==(state.collectibles||[]).length){
      writeJson(RETENTION_KEY,{...state,collectibles:[...unlocked]})
      refresh(value=>value+1)
    }
  },[arcade.achievementCount,eggs.length,weeklyCompleted.length,weekend])

  const claimDaily=()=>{
    const state=readJson(RETENTION_KEY,{lastClaim:null,streak:0,networkXp:0,shards:0,collectibles:[],visits:0})
    if(state.lastClaim===today)return
    const streak=state.lastClaim===previousDateKey()?(state.streak||0)+1:1
    const baseXp=75+Math.min(175,streak*10)
    const xp=weekend?baseXp*2:baseXp
    const shards=2+(streak%7===0?5:0)
    const next={...state,lastClaim:today,streak,networkXp:(state.networkXp||0)+xp,shards:(state.shards||0)+shards}
    writeJson(RETENTION_KEY,next)
    arcade.gainXp(xp,'Daily ESN reward')
    window.dispatchEvent(new CustomEvent('esn-achievement',{detail:{title:'Daily ESN reward claimed',copy:`Day ${streak} • +${xp} XP • +${shards} Network Shards`}}))
    refresh(value=>value+1)
  }

  const voteState=readJson(VOTE_KEY,{week:null,choice:null})
  const vote=choice=>{
    writeJson(VOTE_KEY,{week,choice,at:Date.now()})
    refresh(value=>value+1)
  }

  const state=readJson(RETENTION_KEY,{lastClaim:null,streak:0,networkXp:0,shards:0,collectibles:[],visits:0})
  const voteNow=readJson(VOTE_KEY,{week:null,choice:null})
  const claimed=state.lastClaim===today
  const weeklyNow=readJson(WEEKLY_KEY,{week,baseline,completed:[],claimed:[]})

  return <section className="section retention-hub-section"><div className="shell retention-hub">
    <div className="section-heading retention-heading">
      <div><span className="eyebrow">RETURN LOOP</span><h2>There is always something waiting.</h2><p>Daily rewards, weekly missions, records, rotating events, collectibles, and cross-system progression all feed the same ESN experience on this device.</p></div>
      <div className={weekend?'retention-event live':'retention-event'}><span>{weekend?'LIMITED EVENT LIVE':'NEXT SURGE'}</span><strong>{weekend?'2× XP WEEKEND':'FRIDAY → SUNDAY'}</strong><small>{weekend?'Arcade + reward XP is boosted right now.':'Network Surge activates every weekend.'}</small></div>
    </div>

    <div className="retention-primary-grid">
      <article className="retention-reward-card">
        <span>DAILY REWARD</span><strong>DAY {state.streak||0}</strong>
        <p>{claimed?'Today’s reward is secured. Come back tomorrow to keep the streak alive.':'Claim today’s XP and Network Shards. Consecutive days increase the reward.'}</p>
        <div className="retention-metrics"><b>{Math.floor(state.networkXp||0).toLocaleString()}<small>Network XP</small></b><b>{state.shards||0}<small>Shards</small></b><b>{state.visits||0}<small>Visit days</small></b></div>
        <button type="button" onClick={claimDaily} disabled={claimed}>{claimed?'CLAIMED TODAY':'CLAIM DAILY REWARD'}</button>
      </article>

      <article className="retention-continue-card">
        <span>CONTINUE PLAYING</span><strong>{continueMeta.label}</strong>
        <p>Jump straight back into the last ESN Arcade game you used instead of digging through the site again.</p>
        <Link className="button primary" to={continueRoute}>Resume game →</Link>
        <small>{daily.completed?.length||0}/3 daily challenges complete • Arcade Level {arcade.level}</small>
      </article>

      <article className="retention-collect-card">
        <span>COLLECTION VAULT</span><strong>{(state.collectibles||[]).length} FOUND</strong>
        <p>Collectibles unlock from streaks, missions, Arcade achievements, Easter eggs, and limited events.</p>
        <div className="retention-collectibles">{(state.collectibles||[]).length?(state.collectibles||[]).map(item=><i key={item}>{item}</i>):<small>Complete missions and return on multiple days to discover your first collectible.</small>}</div>
      </article>
    </div>

    <div className="retention-split">
      <div className="retention-weekly">
        <div className="retention-block-head"><div><span>WEEKLY MISSIONS</span><h3>{weeklyNow.completed?.length||0} / 4 complete</h3></div><b>{week}</b></div>
        <div className="retention-weekly-grid">{weeklySelected.map(mission=>{
          const progress=Math.max(0,(totals[mission.stat]||0)-(weeklyNow.baseline?.[mission.stat]||0))
          const done=(weeklyNow.completed||[]).includes(mission.id)||progress>=mission.target
          return <article className={done?'complete':''} key={mission.id}><span>{done?'COMPLETE':mission.xp+' XP'}</span><strong>{mission.label}</strong><p>{mission.copy}</p><div><i style={{width:Math.min(100,(progress/mission.target)*100)+'%'}}/></div><small>{Math.min(progress,mission.target)} / {mission.target}</small></article>
        })}</div>
      </div>

      <div className="retention-leaderboard">
        <div className="retention-block-head"><div><span>YOUR ARCADE LEADERBOARD</span><h3>Personal mastery ranking</h3></div><b>LOCAL</b></div>
        <div className="retention-ranks">{records.map((record,index)=><Link to={record.route} key={record.route}><em>{String(index+1).padStart(2,'0')}</em><div><strong>{record.name}</strong><small>{record.record}</small></div><b>{Math.floor(record.score)} PTS</b></Link>)}</div>
      </div>
    </div>

    <div className="retention-vote" id="community-ballot">
      <div><span className="eyebrow">COMMUNITY BALLOT</span><h3>What should ESN push next?</h3><p>Your choice is remembered for this weekly ballot. The public community tally remains handled through ESN community channels until account-backed voting is available.</p></div>
      <div className="retention-vote-options">{VOTE_OPTIONS.map(([id,title,copy])=><button type="button" className={voteNow.week===week&&voteNow.choice===id?'selected':''} onClick={()=>vote(id)} key={id}><strong>{title}</strong><small>{copy}</small></button>)}</div>
    </div>
  </div></section>
}
