import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { DISCORD_URL, SMP_ADDRESS, SMP_PORT, useLiveNetwork } from './liveNetwork'
import './platformExpansion.css'

const ITEMS=[
  {product:'20 Realm 100 Keys',price:'$1.25',summary:'Twenty Realm 100 keys delivered through the ESN SMP purchase system.',items:['20 × Realm 100 Keys']},
  {product:'ESN Season Pass Relic Bundle',price:'$0.50',summary:'A six-item Season Pass relic bundle built from existing ESN SMP items.',items:['Angel Wings','Inferno Scepter','Storm Crystal','Tideheart','Void Relic','Celestial Star']},
  {product:'ESN Riftwalker Bundle',price:'$0.50',summary:'A six-item mobility and utility bundle centered around rift abilities.',items:['Riftblade — Rift Dash + bonus strike','Rift Wings — unbreakable Elytra + flight boost','Phase Boots — Speed I + Phase Step','Rift Bow — Slowness II arrows + Rift Burst','Rift Core — Resistance II + Absorption','Void Compass — tracks last death']},
  {product:'ESN Immortal Warden Bundle',price:'$1.30',summary:'A full eight-item Warden-themed combat bundle.',items:['Immortal Warden Helmet','Immortal Warden Chestplate','Immortal Warden Leggings','Immortal Warden Boots','Warden Blade','Warden Longbow','Immortal Core','Warden Totem']},
  {product:'Void Warrior Bundle',price:'$0.50',summary:'A high-end Void set with mobility, durability, combat bonuses, and full-set effects.',items:['Void Blade','Void Crown','Void Chestplate','Void Leggings','Void Boots']},
]

const MODULES=[
  ['/launchpad','Launchpad','Choose your fastest route into ESN.','START'],
  ['/configure','Service Configurator','Build a clean project brief before opening a ticket.','CREATE'],
  ['/smp-hub','Live SMP World Hub','Status, players, plugin data, links, and integration-ready event slots.','SMP'],
  ['/trust','Trust Center','Official links, payment safety, privacy, and operational transparency.','TRUST'],
  ['/search','Search 2.0','Search pages, services, SMP items, FAQs, tools, and commands.','SEARCH'],
  ['/labs','ESN Labs','Try local beta experience switches without an account.','LABS'],
  ['/estimate','Project Estimate','Generate a scope estimate without pretending it is a final price quote.','SCOPE'],
  ['/smp-items','SMP Item Encyclopedia','Search current store bundles and their verified contents.','ITEMS'],
  ['/activity','Network Activity','See current ESN releases plus activity stored on this device.','LIVE'],
  ['/share-generator','Share Generator 2.0','Build a share target with QR, copy, and native share support.','SHARE'],
  ['/showcase','Builder Showcase','Browse real published ESN Builder sites.','BUILD'],
  ['/network-map','Interactive Network Map','Explore ESN as one connected platform.','MAP'],
  ['/backup','Local Backup + Restore','Export and restore your local ESN data without an account.','LOCAL'],
]

const SEARCH_INDEX=[
  ...MODULES.map(([to,label,copy,tag])=>({to,label,copy,category:tag,keywords:label+' '+copy})),
  {to:'/minecraft-server',label:'Minecraft Server',copy:'ESN Minecraft server status, resources, guides, and official links.',category:'DISCOVER',keywords:'minecraft server ip join java bedrock smp'},
  {to:'/minecraft-smp',label:'Minecraft SMP',copy:'ESN SMP survival, progression, bosses, economy, gear, and Adventure systems.',category:'DISCOVER',keywords:'minecraft smp survival realms bosses economy'},
  {to:'/fortnite-coaching',label:'Fortnite Coaching',copy:'Practical ESN Fortnite coaching and project scoping.',category:'SERVICES',keywords:'fortnite coach coaching improve gaming'},
  {to:'/video-editing',label:'Video Editing Services',copy:'Creator and gaming video editing support through ES Network.',category:'SERVICES',keywords:'video edit editing creator gaming'},
  {to:'/discord-server-setup',label:'Discord Server Setup',copy:'Roles, channels, moderation, onboarding, and gaming community structure.',category:'SERVICES',keywords:'discord server setup roles channels moderation'},
  {to:'/website-builder',label:'Website Builder',copy:'Build, preview, publish, and share websites with ESN.',category:'BUILDER',keywords:'website builder create publish sites'},
  {to:'/free-browser-tools',label:'Free Browser Tools',copy:'Free ES Tools for creators and gamers.',category:'TOOLS',keywords:'free browser tools prompt timer randomizer'},
  {to:'/guides',label:'ESN Guides + News',copy:'Minecraft, Discord, website guides, plus current ESN releases.',category:'GUIDES',keywords:'guides articles news help minecraft discord website'},
  {to:'/es-network',label:'What is ES Network?',copy:'Official ES Network brand, projects, services, SMP, tools, and community.',category:'ABOUT',keywords:'es network esn ep1c services official brand'},

  {to:'/serviceshowcase',label:'ESN Services',copy:'Fortnite coaching, editing, Discord setups, website projects, and custom work.',category:'SERVICES',keywords:'order coaching edit discord website service'},
  {to:'/site-builder',label:'ESN Website Builder',copy:'Build and publish a website under the ESN /sites path.',category:'BUILDER',keywords:'ai website builder publish site generate'},
  {to:'/storesmp',label:'SMP Store',copy:'Official ESN SMP products and Stripe checkout.',category:'SMP',keywords:'buy keys relic warden riftwalker void store'},
  {to:'/smpguide',label:'SMP Encyclopedia',copy:'Search the existing ESNSMP systems and verified commands.',category:'SMP',keywords:'minecraft commands bosses season pass crates'},
  {to:'/status',label:'Network Status',copy:'Current ESN system and SMP telemetry.',category:'NETWORK',keywords:'online uptime live status players'},
  {to:'/updates',label:'Release Center',copy:'Website, SMP, Arcade, network, and security releases.',category:'NETWORK',keywords:'updates release version roadmap changelog'},
  {to:'/estools',label:'ES Tools',copy:'Free browser utilities with no account wall.',category:'TOOLS',keywords:'timer prompt randomizer utilities free'},
  {to:'/arcade',label:'ESN Arcade',copy:'Six original browser games.',category:'ARCADE',keywords:'play games clicker factory mines moto tower defense'},
  {to:'/faq',label:'FAQ',copy:'Quick answers about ES Network, ordering, SMP purchases, tools, and console access.',category:'HELP',keywords:'question help order username console'},
  {to:'/support',label:'Support',copy:'Create diagnostics and get the correct ESN support path.',category:'HELP',keywords:'bug issue problem ticket discord support'},
  ...ITEMS.flatMap(bundle=>[
    {to:'/smp-items',label:bundle.product,copy:bundle.summary,category:'SMP ITEM',keywords:bundle.items.join(' ')},
    ...bundle.items.map(item=>({to:'/smp-items',label:item,copy:'Included in '+bundle.product+'.',category:'SMP ITEM',keywords:bundle.product+' '+item}))
  ])
]

function PageIntro({eyebrow,title,copy,actions}){
  return <section className="page-hero platform-page-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{copy}</p>{actions&&<div className="hero-actions">{actions}</div>}</div><div className="platform-page-mark">ESN<span>//</span>NO ACCOUNT</div></div></section>
}

function writeLocal(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
function readLocal(key,fallback=[]){
  try{
    const value=JSON.parse(localStorage.getItem(key)||'null')
    if(Array.isArray(fallback))return Array.isArray(value)?value:fallback
    if(fallback&&typeof fallback==='object')return value&&typeof value==='object'&&!Array.isArray(value)?value:fallback
    return value??fallback
  }catch{return fallback}
}
async function copyText(value){try{await navigator.clipboard.writeText(value);return true}catch{return false}}

export function PlatformHomeSection(){
  return <section className="section platform-home-section"><div className="shell">
    <div className="section-heading flagship-heading"><div><span className="eyebrow">SITE TOOLS & SHORTCUTS</span><h2>Useful things, all in one place.</h2><p>Search the site, check SMP information, put together a project brief, or use the free tools. No account needed.</p></div><Link className="text-link" to="/launchpad">Open Launchpad →</Link></div>
    <div className="platform-module-grid">{MODULES.slice(0,8).map(([to,label,copy,tag],index)=><Link to={to} key={to}><span>{String(index+1).padStart(2,'0')}</span><small>{tag}</small><strong>{label}</strong><p>{copy}</p><em>↗</em></Link>)}</div>
  </div></section>
}

const INTENTS=[
  ['◇','Create something','Services, website projects, Store AI, and portfolio.','/serviceshowcase'],
  ['⬡','Join the SMP','Server details, live world hub, store, plugin, and guide.','/smp-hub'],
  ['⌕','Find something','Search pages, commands, products, FAQs, tools, and SMP items.','/search'],
  ['▣','Play','Enter the ESN Arcade and its six original browser games.','/arcade'],
  ['⌘','Use free tools','Open ES Tools with no account wall.','/estools'],
  ['◎','Check the network','Status, releases, activity, incidents, and system details.','/status'],
]

export function LaunchpadPage(){
  return <><PageIntro eyebrow="ESN LAUNCHPAD" title="What are you here to do?" copy="Pick a destination and ESN gets out of your way. No registration, onboarding form, or account required."/>
  <section className="section"><div className="shell platform-launch-grid">{INTENTS.map(([mark,label,copy,to])=><Link to={to} key={to}><span>{mark}</span><div><small>LAUNCH</small><h2>{label}</h2><p>{copy}</p></div><em>↗</em></Link>)}</div></section>
  <section className="section dark-section"><div className="shell platform-small-cta"><div><span className="eyebrow">EVERYTHING ESN</span><h2>Want the full map instead?</h2></div><Link className="button secondary" to="/network-map">Open Network Map</Link></div></section></>
}

export function ServiceConfiguratorPage(){
  const [service,setService]=useState('Website project')
  const [goal,setGoal]=useState('Launch something new')
  const [turnaround,setTurnaround]=useState('Standard')
  const [extras,setExtras]=useState([])
  const choices=['Mobile-first','Brand matching','Animations','SEO setup','Discord integration','Revision pass']
  const summary='ESN project brief\nService: '+service+'\nGoal: '+goal+'\nTurnaround: '+turnaround+'\nExtras: '+(extras.length?extras.join(', '):'None selected')
  const toggle=value=>setExtras(current=>current.includes(value)?current.filter(item=>item!==value):[...current,value])
  return <><PageIntro eyebrow="SERVICE CONFIGURATOR" title="Build the brief before the ticket." copy="Choose what you need and ESN creates a clean project summary you can copy into Discord. This is not an account and nothing is submitted automatically."/>
  <section className="section"><div className="shell platform-config-layout">
    <div className="platform-form-panel">
      <label><span>PROJECT TYPE</span><select value={service} onChange={e=>setService(e.target.value)}>{['Website project','Editing service','Discord server setup','Fortnite coaching','Branding / creator work','Custom ESN project'].map(x=><option key={x}>{x}</option>)}</select></label>
      <label><span>MAIN GOAL</span><select value={goal} onChange={e=>setGoal(e.target.value)}>{['Launch something new','Improve an existing project','Fix a specific problem','Build a premium version','Get coaching / guidance'].map(x=><option key={x}>{x}</option>)}</select></label>
      <label><span>TURNAROUND PREFERENCE</span><select value={turnaround} onChange={e=>setTurnaround(e.target.value)}>{['Flexible','Standard','Priority discussion'].map(x=><option key={x}>{x}</option>)}</select></label>
      <div className="platform-choice-field"><span>OPTIONAL NEEDS</span><div>{choices.map(x=><button type="button" className={extras.includes(x)?'active':''} onClick={()=>toggle(x)} key={x}>{extras.includes(x)?'✓ ':''}{x}</button>)}</div></div>
    </div>
    <aside className="platform-summary-panel"><span>PROJECT BRIEF</span><pre>{summary}</pre><div className="platform-button-row"><button className="button primary" type="button" onClick={()=>copyText(summary)}>Copy brief</button><a className="button secondary" href={DISCORD_URL} target="_blank" rel="noreferrer">Open Discord</a></div><small>ESN confirms final scope, availability, and pricing through the normal support process.</small></aside>
  </div></section></>
}

export function SMPWorldHubPage(){
  const live=useLiveNetwork()
  const smp=live.smp||{}
  return <><PageIntro eyebrow="LIVE SMP WORLD HUB" title="The ESN SMP, in one control room." copy="Live public telemetry where available, ESN-confirmed operational state when third-party pings fail, plugin release data, quick actions, and integration-ready event slots." actions={<><button className="button secondary" type="button" onClick={live.refresh}>Refresh telemetry</button><Link className="button primary" to="/smpconnection">Connect</Link></>}/>
  <section className="section compact-section"><div className="shell platform-stat-grid">
    <div><span>SERVER</span><strong className={smp.online?'good':'warn'}>{smp.online?'ONLINE':smp.status?.toUpperCase()||'CHECKING'}</strong><small>{SMP_ADDRESS}:{SMP_PORT}</small></div>
    <div><span>PLAYERS</span><strong>{smp.players??'—'}{smp.maxPlayers!=null?' / '+smp.maxPlayers:''}</strong><small>{smp.telemetry==='live'?'Live public ping':'Telemetry unavailable'}</small></div>
    <div><span>VERSION</span><strong>{smp.version||'—'}</strong><small>{smp.software||'Minecraft server'}</small></div>
    <div><span>PLUGIN</span><strong>{live.plugin?.version||'—'}</strong><small>{live.plugin?.status||'checking'}</small></div>
  </div></section>
  <section className="section"><div className="shell platform-hub-grid">
    <article className="platform-world-card"><span className="eyebrow">WORLD STATUS</span><h2>{smp.motd||'ESN SMP'}</h2><p>{smp.playerSample?.length?'Players visible to telemetry: '+smp.playerSample.join(', '):'Player names are not currently exposed by the available public telemetry source.'}</p><div className="platform-source-row"><span>Source</span><b>{smp.source||'checking'}</b><span>Checked</span><b>{live.checkedAt?new Date(live.checkedAt).toLocaleTimeString():'—'}</b></div></article>
    <article className="platform-world-card"><span className="eyebrow">SERVER EVENTS</span><h2>Event timer bridge ready.</h2><p>World Boss and scheduled-event countdowns will display here as soon as the SMP exposes a verified event feed. ESN does not invent countdowns when the server has not published one.</p><div className="platform-event-slots"><div><span>WORLD BOSS</span><strong>WAITING FOR SERVER FEED</strong></div><div><span>EVENTS</span><strong>WAITING FOR SERVER FEED</strong></div></div></article>
  </div></section>
  <section className="section dark-section"><div className="shell platform-link-grid">{[['Connection','/smpconnection'],['Item Encyclopedia','/smp-items'],['SMP Guide','/smpguide'],['SMP Store','/storesmp'],['Plugin','/smpplugin'],['Connection Test','/smpcheck']].map(([label,to])=><Link to={to} key={to}><strong>{label}</strong><span>↗</span></Link>)}</div></section></>
}

export function TrustCenterPage(){
  const cards=[
    ['Official website','You are on the official ES Network website. Use site links instead of copies sent by unknown accounts.'],
    ['Payments','SMP purchases use official Stripe checkout links surfaced by ESN. Stripe handles the payment form; ESN requires the exact Minecraft username for delivery.'],
    ['Local privacy','Favorites, recent routes, themes, Launchpad state, Labs switches, and backup data stay in browser storage on this device unless you export them yourself.'],
    ['No accounts','This website platform layer does not require an ESN user account. There is no password or profile database for these features.'],
    ['Status transparency','The site distinguishes public telemetry from ESN-confirmed operational state instead of presenting unreliable third-party pings as certainty.'],
    ['Support','Service ordering, community support, and issue escalation use the official ESN Discord.'],
  ]
  return <><PageIntro eyebrow="ESN TRUST CENTER" title="Know what is official." copy="Payment safety, privacy, operational transparency, and official access paths in one place."/>
  <section className="section"><div className="shell platform-trust-grid">{cards.map(([title,copy],i)=><article key={title}><span>{String(i+1).padStart(2,'0')}</span><h2>{title}</h2><p>{copy}</p></article>)}</div></section>
  <section className="section dark-section"><div className="shell platform-official-links"><div><span className="eyebrow">OFFICIAL ACCESS</span><h2>Use ESN-controlled paths.</h2></div><div><a href={DISCORD_URL} target="_blank" rel="noreferrer">Official Discord ↗</a><Link to="/status">Network Status ↗</Link><Link to="/support">Support Center ↗</Link><Link to="/storesmp">SMP Store ↗</Link></div></div></section></>
}

export function GlobalSearchPage(){
  const [query,setQuery]=useState('')
  const normalized=query.trim().toLowerCase()
  const results=useMemo(()=>{
    if(!normalized)return SEARCH_INDEX.slice(0,18)
    return SEARCH_INDEX.map(item=>{
      const hay=(item.label+' '+item.copy+' '+item.category+' '+item.keywords).toLowerCase()
      const tokens=normalized.split(/\s+/).filter(Boolean)
      const score=tokens.reduce((sum,token)=>sum+(item.label.toLowerCase().includes(token)?4:0)+(item.category.toLowerCase().includes(token)?2:0)+(hay.includes(token)?1:0),0)
      return {...item,score}
    }).filter(item=>item.score>0).sort((a,b)=>b.score-a.score).slice(0,30)
  },[normalized])
  return <><PageIntro eyebrow="SMART GLOBAL SEARCH 2.0" title="Search the network, not just page names." copy="Find ESN pages, services, SMP products and items, FAQs, tools, releases, and platform features from one local search index."/>
  <section className="section"><div className="shell platform-search-shell"><label className="platform-big-search"><span>⌕</span><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try: Warden Blade, website builder, SMP status, support…"/></label><div className="platform-search-meta"><span>{results.length} results</span><span>NO ACCOUNT</span><span>LOCAL INDEX</span></div><div className="platform-search-results">{results.map((item,index)=><Link to={item.to} key={item.label+index}><span>{item.category}</span><div><strong>{item.label}</strong><p>{item.copy}</p></div><em>↗</em></Link>)}{!results.length&&<div className="platform-no-results"><strong>No local result found.</strong><p>Try a broader term or open the full ESN network map.</p><Link to="/network-map">Open Network Map →</Link></div>}</div></div></section></>
}

const LABS=[
  ['esn_lab_compact','Compact platform cards','Tighten newer platform grids on this device.','data-lab-compact'],
  ['esn_lab_lowglow','Low-glow mode','Reduce decorative platform glow while preserving the premium layout.','data-lab-lowglow'],
  ['esn_lab_densemap','Dense network map','Use a tighter layout on the interactive network map.','data-lab-densemap'],
]
function applyLab(){
  LABS.forEach(([key,, ,attr])=>document.documentElement.toggleAttribute(attr,localStorage.getItem(key)==='1'))
}
export function LabsPage(){
  const [tick,setTick]=useState(0)
  useEffect(()=>{applyLab()},[tick])
  const toggle=key=>{localStorage.setItem(key,localStorage.getItem(key)==='1'?'0':'1');setTick(x=>x+1)}
  return <><PageIntro eyebrow="ESN LABS" title="Experimental controls. Zero account." copy="Test optional presentation features locally. These switches only affect this browser and can be turned off any time."/>
  <section className="section"><div className="shell platform-lab-grid">{LABS.map(([key,label,copy])=>{const on=localStorage.getItem(key)==='1';return <button type="button" onClick={()=>toggle(key)} className={on?'active':''} key={key}><span>{on?'ON':'OFF'}</span><h2>{label}</h2><p>{copy}</p><em>{on?'Enabled':'Enable'}</em></button>})}</div></section>
  <section className="section dark-section"><div className="shell platform-lab-note"><span>LAB RULE</span><strong>Experiments never require a login and never replace core accessibility settings.</strong><Link to="/settings">Open normal settings →</Link></div></section></>
}

export function ProjectEstimatePage(){
  const [type,setType]=useState('Website')
  const [size,setSize]=useState(2)
  const [complexity,setComplexity]=useState(1)
  const [speed,setSpeed]=useState(0)
  const score=Number(size)+Number(complexity)*2+Number(speed)*2
  const tier=score<=4?'Simple':score<=8?'Standard':'Advanced'
  const notes=tier==='Simple'?['Focused scope','Few moving parts','Good fit for a straightforward build']:tier==='Standard'?['Multiple deliverables or pages','Moderate design / integration work','Needs a more detailed ticket brief']:['Large or premium scope','Multiple systems, revisions, or custom interactions','ESN should confirm feasibility and timeline before work starts']
  const brief=type+' project — '+tier+' scope. Size '+size+'/5, complexity '+complexity+'/3, urgency '+(speed?'Priority discussion':'Standard')+'.'
  return <><PageIntro eyebrow="INSTANT PROJECT ESTIMATE" title="Understand the scope before you order." copy="This estimates project complexity, not a guaranteed price or delivery date. ESN confirms final scope through the normal support process."/>
  <section className="section"><div className="shell platform-estimate-layout"><div className="platform-form-panel">
    <label><span>PROJECT</span><select value={type} onChange={e=>setType(e.target.value)}>{['Website','Video editing','Discord setup','Fortnite coaching','Brand / creator project','Custom project'].map(x=><option key={x}>{x}</option>)}</select></label>
    <label><span>SIZE: {size}/5</span><input type="range" min="1" max="5" value={size} onChange={e=>setSize(e.target.value)}/></label>
    <label><span>COMPLEXITY: {complexity}/3</span><input type="range" min="1" max="3" value={complexity} onChange={e=>setComplexity(e.target.value)}/></label>
    <div className="platform-choice-field"><span>TURNAROUND</span><div><button type="button" className={!speed?'active':''} onClick={()=>setSpeed(0)}>Standard</button><button type="button" className={speed?'active':''} onClick={()=>setSpeed(1)}>Priority discussion</button></div></div>
  </div><aside className="platform-estimate-result"><span>ESTIMATED SCOPE</span><strong>{tier}</strong><p>{brief}</p><ul>{notes.map(x=><li key={x}>{x}</li>)}</ul><div className="platform-button-row"><button type="button" className="button secondary" onClick={()=>copyText(brief)}>Copy estimate</button><Link className="button primary" to="/configure">Build full brief</Link></div></aside></div></section></>
}

export function SMPItemsPage(){
  const [query,setQuery]=useState('')
  const q=query.toLowerCase().trim()
  const filtered=ITEMS.map(bundle=>({...bundle,items:bundle.items.filter(item=>!q||item.toLowerCase().includes(q)||bundle.product.toLowerCase().includes(q))})).filter(bundle=>bundle.items.length)
  return <><PageIntro eyebrow="SMP ITEM ENCYCLOPEDIA" title="Search the current ESN SMP store catalog." copy="Bundle names, current website prices, and item descriptions come from the ESN store data already published on this site."/>
  <section className="section"><div className="shell"><label className="platform-big-search compact"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search Warden, Rift, Wings, Blade, Void…"/></label><div className="platform-item-grid">{filtered.map(bundle=><article key={bundle.product}><header><div><span>STORE BUNDLE</span><h2>{bundle.product}</h2></div><strong>{bundle.price}</strong></header><p>{bundle.summary}</p><ul>{bundle.items.map(item=><li key={item}>{item}</li>)}</ul><Link to="/storesmp">Open SMP Store →</Link></article>)}</div></div></section></>
}

export function ActivityTimelinePage(){
  const recents=readLocal('esn_recent_routes',[]).slice(0,8)
  const releases=[
    ['2026.09.29','Platform Expansion','Launchpad, Trust Center, Search 2.0, SMP World Hub, Labs, scope tools, local backup, and more.'],
    ['2026.09.29','My ESN','Local favorites, recents, smart next moves, and adaptive homepage controls.'],
    ['2026.09.29','Experience Core V2','Smart page navigation and adaptive rendering profiles.'],
    ['2026.09.28','Website Builder','ESN site creation and /sites publishing workflow expanded.'],
    ['HISTORY','ES Network','EP1C Services became ES Network, the current organization and brand.'],
  ]
  return <><PageIntro eyebrow="NETWORK ACTIVITY" title="What changed, plus where you have been." copy="Public ESN milestones are combined with recent routes saved locally on this device. No account activity feed is required."/>
  <section className="section"><div className="shell platform-activity-layout"><div className="platform-timeline">{releases.map(([date,title,copy])=><article key={title}><span>{date}</span><i/><div><h2>{title}</h2><p>{copy}</p></div></article>)}</div><aside className="platform-local-activity"><span>THIS DEVICE</span><h2>Recent ESN routes</h2>{recents.length?recents.map((route,index)=><div key={route+index}><b>{String(index+1).padStart(2,'0')}</b><code>{route}</code></div>):<p>No recent routes saved yet.</p>}<Link to="/backup">Back up local ESN data →</Link></aside></div></section></>
}

const SHARE_TARGETS={
  'ES Network':'/',
  'ESN SMP':'/smp-hub',
  'ESN Arcade':'/arcade',
  'ES Tools':'/estools',
  'Website Builder':'/site-builder',
  'ESN Services':'/serviceshowcase',
}
export function ShareGeneratorV2Page(){
  const [target,setTarget]=useState('ES Network')
  const [source,setSource]=useState('share')
  const [copied,setCopied]=useState(false)
  const base=typeof window==='undefined'?'https://esnoffical.com/':new URL(SHARE_TARGETS[target],window.location.origin).href
  const url=base+(base.includes('?')?'&':'?')+'ref='+encodeURIComponent(source)
  const qr='https://api.qrserver.com/v1/create-qr-code/?size=260x260&data='+encodeURIComponent(url)
  const share=async()=>{if(navigator.share){try{await navigator.share({title:target,text:'Check out '+target+' on ES Network.',url});return}catch{}}await copyText(url);setCopied(true);setTimeout(()=>setCopied(false),1600)}
  return <><PageIntro eyebrow="SHARE GENERATOR 2.0" title="Turn any major ESN area into a share target." copy="Choose a destination and referral label, then get a trackable ESN URL, QR code, native share action, or copyable link — no account required."/>
  <section className="section"><div className="shell platform-share-layout"><div><div className="platform-share-options">{Object.keys(SHARE_TARGETS).map(name=><button type="button" className={name===target?'active':''} onClick={()=>setTarget(name)} key={name}><span>{name===target?'●':'○'}</span><strong>{name}</strong><small>{SHARE_TARGETS[name]}</small></button>)}</div><label className="platform-ref-source"><span>REFERRAL LABEL</span><select value={source} onChange={e=>setSource(e.target.value)}><option value="share">General share</option><option value="discord">Discord</option><option value="tiktok">TikTok</option><option value="youtube">YouTube</option><option value="github">GitHub</option><option value="staff">ESN staff</option><option value="community">Community</option></select><small>ESN records this referral only in the visitor's local browser diagnostics unless a privacy-focused aggregate analytics service is connected later.</small></label></div><aside className="platform-share-card"><span>ES NETWORK // SHARE</span><h2>{target}</h2><img src={qr} alt={'QR code for '+target}/><code>{url}</code><div className="platform-button-row"><button className="button primary" type="button" onClick={share}>{copied?'Copied':'Share'}</button><button className="button secondary" type="button" onClick={()=>copyText(url)}>Copy URL</button></div><small>The QR image contains only the public ESN destination and referral label. It contains no account or personal information.</small></aside></div></section></>
}

export function BuilderShowcasePage(){
  const [sites,setSites]=useState([])
  const [loading,setLoading]=useState(true)
  useEffect(()=>{
    let active=true
    fetch('/generated-sites/index.json',{cache:'no-store'})
      .then(r=>r.ok?r.json():{sites:[]})
      .then(value=>{if(active)setSites(Array.isArray(value?.sites)?value.sites:[])})
      .catch(()=>{if(active)setSites([])})
      .finally(()=>{if(active)setLoading(false)})
    return()=>{active=false}
  },[])
  return <><PageIntro eyebrow="WEBSITE BUILDER SHOWCASE" title="Real sites published through ESN." copy="This gallery reads the live ESN generated-site manifest. New published sites can appear automatically; ESN does not invent customer examples." actions={<Link className="button primary" to="/site-builder">Build a site</Link>}/>
  <section className="section"><div className="shell">
    <div className="platform-showcase-manifest-head"><span>{sites.length} PUBLISHED SITE{sites.length===1?'':'S'}</span><Link to="/website-builder">How the Builder works →</Link></div>
    {loading?<div className="platform-showcase-loading">Loading published sites…</div>:sites.length?<div className="platform-showcase-manifest-grid">{sites.map(site=><article className="platform-site-showcase" key={site.slug}><span>{String(site.category||'website').toUpperCase()} // LIVE</span><div className="platform-site-browser"><i/><i/><i/><b>esnoffical.com/sites/{site.slug}</b></div><div className="platform-site-preview"><strong>{site.brand||site.slug}</strong><p>{site.heroTitle||site.description||'Published with ESN Website Builder.'}</p></div><div className="platform-button-row"><Link className="button primary" to={site.path||('/sites/'+site.slug)}>Open site</Link><Link className="button secondary" to="/site-builder">Create yours</Link></div></article>)}</div>:<div className="platform-showcase-loading">No published showcase entries are available right now.</div>}
    <article className="platform-showcase-note manifest-note"><span className="eyebrow">SHOWCASE POLICY</span><h2>Real examples only.</h2><p>The publish workflow updates this manifest when a valid ESN Website Builder site goes live. Removed or unpublished sites are not intentionally presented as live examples.</p></article>
  </div></section></>
}

export function NetworkMapPage(){
  const groups=[
    ['CREATE',[['Services','/serviceshowcase'],['Website Builder','/site-builder'],['Store AI','/store-ai'],['Portfolio','/portfolio'],['Configurator','/configure'],['Estimate','/estimate']]],
    ['PLAY',[['Arcade','/arcade'],['Challenges','/challenges'],['Rewards','/rewards']]],
    ['SMP',[['World Hub','/smp-hub'],['Connect','/smpconnection'],['Store','/storesmp'],['Items','/smp-items'],['Guide','/smpguide'],['Plugin','/smpplugin']]],
    ['NETWORK',[['Status','/status'],['Activity','/activity'],['Updates','/updates'],['Trust','/trust'],['Search','/search'],['Labs','/labs']]],
    ['UTILITY',[['ES Tools','/estools'],['Share','/share-generator'],['Backup','/backup'],['Support','/support'],['Settings','/settings'],['Explore','/explore']]],
  ]
  return <><PageIntro eyebrow="INTERACTIVE NETWORK MAP" title="ESN as one connected platform." copy="Every major area grouped by purpose, with direct routes instead of making visitors hunt through menus."/>
  <section className="section"><div className="shell platform-network-map"><div className="platform-map-core"><span>ES</span><strong>ES NETWORK</strong><small>CORE</small></div>{groups.map(([group,links],index)=><section className={'platform-map-group group-'+index} key={group}><span>{group}</span><div>{links.map(([label,to])=><Link to={to} key={to}>{label}<em>↗</em></Link>)}</div></section>)}</div></section></>
}

export function DataBackupPage(){
  const [count,setCount]=useState(()=>Object.keys(localStorage).filter(key=>key.startsWith('esn_')).length)
  const input=useRef(null)
  const exportData=()=>{
    const data={}
    Object.keys(localStorage).filter(key=>key.startsWith('esn_')).forEach(key=>{data[key]=localStorage.getItem(key)})
    const blob=new Blob([JSON.stringify({format:'ESN_LOCAL_BACKUP_V1',createdAt:new Date().toISOString(),data},null,2)],{type:'application/json'})
    const url=URL.createObjectURL(blob)
    const link=document.createElement('a');link.href=url;link.download='esn-local-backup.json';link.click();URL.revokeObjectURL(url)
  }
  const importData=file=>{
    if(!file)return
    const reader=new FileReader()
    reader.onload=()=>{
      try{
        const parsed=JSON.parse(String(reader.result||'{}'))
        if(parsed.format!=='ESN_LOCAL_BACKUP_V1'||!parsed.data||typeof parsed.data!=='object')throw new Error('Invalid backup')
        Object.entries(parsed.data).forEach(([key,value])=>{if(key.startsWith('esn_')&&typeof value==='string')localStorage.setItem(key,value)})
        setCount(Object.keys(localStorage).filter(key=>key.startsWith('esn_')).length)
        window.dispatchEvent(new Event('esn-history-change'))
        alert('ESN local backup restored on this device.')
      }catch{alert('That file is not a valid ESN local backup.')}
    }
    reader.readAsText(file)
  }
  return <><PageIntro eyebrow="LOCAL BACKUP + RESTORE" title="Keep your ESN data without creating an account." copy="Export browser-stored ESN preferences, favorites, recent routes, Arcade progress, theme choices, Labs switches, and other esn_ local data into a file you control."/>
  <section className="section"><div className="shell platform-backup-grid"><article><span>LOCAL KEYS</span><strong>{count}</strong><p>ESN browser-storage entries currently found on this device.</p></article><article><span>EXPORT</span><h2>Download your local state.</h2><p>The file is created in your browser. It does not upload your data to an ESN account.</p><button className="button primary" type="button" onClick={exportData}>Export backup</button></article><article><span>RESTORE</span><h2>Bring it back later.</h2><p>Choose a previously exported ESN local backup to restore supported keys on this browser.</p><button className="button secondary" type="button" onClick={()=>input.current?.click()}>Choose backup</button><input ref={input} hidden type="file" accept="application/json,.json" onChange={e=>importData(e.target.files?.[0])}/></article></div></section></>
}

export function PlatformLayer(){
  const location=useLocation()
  const navigate=useNavigate()
  const [launch,setLaunch]=useState(false)
  const [quick,setQuick]=useState(false)
  const games=['/arcade','/esclicker','/esfactory','/esmines','/esmoto','/estower','/estowerdefense']
  const disabled=location.pathname.startsWith('/sites/')||games.includes(location.pathname)

  useEffect(()=>{
    applyLab()
    if(location.pathname!=='/'||localStorage.getItem('esn_launchpad_seen')==='1')return
    const timer=setTimeout(()=>setLaunch(true),3200)
    return()=>clearTimeout(timer)
  },[location.pathname])

  useEffect(()=>{setQuick(false)},[location.pathname])

  if(disabled)return null
  const recents=readLocal('esn_recent_routes',[]).filter(route=>route&&route!=='/')

  const closeLaunch=()=>{localStorage.setItem('esn_launchpad_seen','1');setLaunch(false)}
  const launchTo=to=>{closeLaunch();navigate(to)}
  const copyServer=async()=>{await copyText(SMP_ADDRESS+':'+SMP_PORT);setQuick(false)}

  return <>
    {launch&&<div className="platform-firstvisit-backdrop" role="dialog" aria-modal="true" aria-label="ESN Launchpad"><div className="platform-firstvisit"><header><div><span>WELCOME TO ES NETWORK</span><strong>What are you here for?</strong></div><button type="button" onClick={closeLaunch} aria-label="Close">×</button></header><div>{INTENTS.slice(0,6).map(([mark,label,,to])=><button type="button" onClick={()=>launchTo(to)} key={to}><span>{mark}</span><strong>{label}</strong><em>↗</em></button>)}</div><footer><button type="button" onClick={()=>launchTo('/launchpad')}>Open full Launchpad</button><button type="button" onClick={closeLaunch}>Skip for now</button></footer></div></div>}

    <div className={'platform-mobile-quick '+(quick?'open':'')}>
      {quick&&<div className="platform-mobile-quick-panel">
        <button type="button" onClick={copyServer}><span>⬡</span><div><b>Copy SMP</b><small>{SMP_ADDRESS}:{SMP_PORT}</small></div></button>
        <a href={DISCORD_URL} target="_blank" rel="noreferrer"><span>◎</span><div><b>Discord</b><small>Community + support</small></div></a>
        <button type="button" onClick={()=>navigate('/status')}><span>●</span><div><b>Status</b><small>Network health</small></div></button>
        <button type="button" onClick={()=>navigate(recents[0]||'/launchpad')}><span>↗</span><div><b>{recents[0]?'Continue':'Launchpad'}</b><small>{recents[0]||'Choose your route'}</small></div></button>
      </div>}
      <button className="platform-mobile-quick-trigger" type="button" onClick={()=>setQuick(x=>!x)} aria-expanded={quick}><span>＋</span><b>QUICK</b></button>
    </div>
  </>
}
