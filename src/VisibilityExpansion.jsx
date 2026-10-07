import { useEffect, useMemo } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { DISCORD_URL, SMP_ADDRESS, SMP_PORT } from './liveNetwork'
import './visibilityExpansion.css'

const LANDINGS={
  'minecraft-server':{
    eyebrow:'MINECRAFT SERVER',
    title:'Join ESN SMP on Java or Bedrock.',
    intro:'Get the server address and ports, check its status, and browse the ESN SMP guides before joining.',
    bullets:['Live server and plugin status','Java / Bedrock-aware telemetry where available','Progression, commands, bosses, gear, and economy guides','Official ESN community and support paths'],
    primary:['Open SMP World Hub','/smp-hub'],
    secondary:['Browse SMP guides','/guides/minecraft-smp-beginner-guide'],
    related:[['SMP Item Encyclopedia','/smp-items'],['Network Status','/status'],['ESNSMP Plugin','/smpplugin']],
  },
  'minecraft-smp':{
    eyebrow:'MINECRAFT SMP',
    title:'See what ESN SMP has to offer.',
    intro:'Play survival with quests, boss fights, custom equipment, an economy, and more. Find the current server details and guides here.',
    bullets:['100-Realm progression surfaced by ESNSMP','Economy, trading, jobs, skills, quests, and titles','Boss, dungeon, raid, relic, rune, and Adventure systems','Official store items and searchable item encyclopedia'],
    primary:['Explore ESN SMP','/smp-hub'],
    secondary:['SMP beginner guide','/guides/minecraft-smp-beginner-guide'],
    related:[['SMP Encyclopedia','/smpguide'],['SMP Items','/smp-items'],['SMP Store','/storesmp']],
  },
  'fortnite-coaching':{
    eyebrow:'FORTNITE COACHING',
    title:'Fortnite coaching through ES Network.',
    intro:'Work on the parts of Fortnite that matter to you, from match decisions and positioning to consistency.',
    bullets:['Focused improvement instead of generic advice','Project brief builder before opening a ticket','Discord-based ordering and support','Scope is confirmed before work begins'],
    primary:['Configure coaching','/configure'],
    secondary:['Explore ESN services','/serviceshowcase'],
    related:[['Project Estimate','/estimate'],['Verified Reviews','/testimonials'],['Trust Center','/trust']],
  },
  'video-editing':{
    eyebrow:'VIDEO EDITING',
    title:'Video editing support for creators.',
    intro:'Need a video edited? Share the footage, examples, and deadline in a Discord ticket so we can discuss the work.',
    bullets:['Gaming and creator-focused editing support','Build a clear project brief before contacting ESN','Flexible project scope instead of invented fixed promises','Official Discord handoff for ordering and support'],
    primary:['Build editing brief','/configure'],
    secondary:['See service showcase','/serviceshowcase'],
    related:[['Project Estimate','/estimate'],['Portfolio','/portfolio'],['Verified Reviews','/testimonials']],
  },
  'discord-server-setup':{
    eyebrow:'DISCORD SERVER SETUP',
    title:'Discord server setup for communities and creators.',
    intro:'Need a better Discord setup? We can discuss roles, channels, welcome messages, moderation, and server organization.',
    bullets:['Role and channel organization','Moderation and onboarding planning','Community-focused structure','Custom scope confirmed through ESN support'],
    primary:['Configure Discord project','/configure'],
    secondary:['Discord setup guide','/guides/gaming-discord-server-guide'],
    related:[['Services','/serviceshowcase'],['Project Estimate','/estimate'],['Trust Center','/trust']],
  },
  'website-builder':{
    eyebrow:'WEBSITE BUILDER',
    title:'Build and publish a website with ESN.',
    intro:'Start with a description, edit the result, preview it on mobile or desktop, and publish through the ESN site builder.',
    bullets:['Prompt-driven site generation and editing','Desktop, tablet, and mobile previews','Real published-site showcase','Public /sites/yourname publishing flow'],
    primary:['Open Website Builder','/site-builder'],
    secondary:['See real showcase','/showcase'],
    related:[['Creator website guide','/guides/creator-website-guide'],['Website services','/serviceshowcase'],['Network Map','/network-map']],
  },
  'free-browser-tools':{
    eyebrow:'FREE BROWSER TOOLS',
    title:'Free ES Tools, directly in your browser.',
    intro:'Free timers, randomizers, prompt tools, and other utilities you can use right in your browser.',
    bullets:['Challenge generator','Focus timer','Prompt generator and random picker','Coin flip, dice, and website estimates'],
    primary:['Open ES Tools','/estools'],
    secondary:['Explore ES Network','/explore'],
    related:[['Launchpad','/launchpad'],['Search ESN','/search'],['Local Backup','/backup']],
  },
}

const GUIDES={
  'join-minecraft-server-xbox':{
    title:'How to join a custom Minecraft server on Xbox',
    description:'A practical overview of why Xbox Bedrock does not expose a normal custom-server field and the type of connection workaround console players commonly need.',
    category:'Minecraft Guide',
    updated:'September 29, 2026',
    sections:[
      ['Why it works differently on Xbox','Minecraft Bedrock on Xbox does not normally provide the same simple Add Server field available on some other platforms. Joining a custom server can therefore require a console-compatible connection method.'],
      ['Prepare the server details','Have the server hostname and port ready. For ESN SMP, the current website lists '+SMP_ADDRESS+' with port '+SMP_PORT+'.'],
      ['Use the ESN connection guide','ESN keeps its current console connection flow and server details in its dedicated connection resources. Follow the current instructions shown there rather than relying on an old screenshot or saved address.'],
      ['If it stops working','Custom-server workarounds can change as console networking or Minecraft changes. Check ESN Network Status and the official Discord if the normal flow no longer reaches the server.'],
    ],
    links:[['ESN SMP World Hub','/smp-hub'],['Network Status','/status'],['Official Discord',DISCORD_URL,true]],
  },
  'join-minecraft-server-playstation':{
    title:'How to join a custom Minecraft server on PlayStation',
    description:'A simple guide to the custom-server limitation on Minecraft Bedrock for PlayStation and where to find current ESN connection information.',
    category:'Minecraft Guide',
    updated:'September 29, 2026',
    sections:[
      ['Understand the limitation','PlayStation Bedrock does not normally expose a standard Add Server box for arbitrary third-party servers, so console players may need a compatible connection workaround.'],
      ['Keep the current address nearby','The ESN website currently lists '+SMP_ADDRESS+' and port '+SMP_PORT+' for the ESN SMP.'],
      ['Follow current instructions','Use ESN’s current console connection resources for the latest workflow. Avoid assuming an old DNS, app, or screen-recorded flow is still current.'],
      ['Troubleshoot with live status','If the server cannot be reached, check the SMP World Hub and Network Status before changing settings. Public Minecraft telemetry can occasionally fail even when ESN has confirmed the server is operational.'],
    ],
    links:[['SMP World Hub','/smp-hub'],['SMP Connection','/smpconnection'],['Support','/support']],
  },
  'minecraft-smp-beginner-guide':{
    title:'Minecraft SMP beginner guide: what to do first',
    description:'A beginner-friendly checklist for starting on a progression-heavy Minecraft SMP such as ESN SMP.',
    category:'Minecraft Guide',
    updated:'September 29, 2026',
    sections:[
      ['Learn the entry commands','On ESN SMP, the public encyclopedia surfaces starter commands such as /tutorial, /guide, /menu, /journal, /spawn, and /profile as useful entry points.'],
      ['Understand progression','Do not treat the server like plain survival only. ESNSMP exposes Realm progression, quests, jobs, skills, titles, seasons, achievements, bosses, gear systems, and Adventure content.'],
      ['Protect and organize your progress','Learn homes, claims, teleport tools, backpacks, economy systems, and secure trading before carrying valuable items around.'],
      ['Use official information','Server mechanics change over time. Use the current ESN encyclopedia, release center, and SMP hub instead of old player screenshots when details conflict.'],
    ],
    links:[['SMP Encyclopedia','/smpguide'],['SMP World Hub','/smp-hub'],['SMP Items','/smp-items']],
  },
  'gaming-discord-server-guide':{
    title:'How to organize a gaming Discord server',
    description:'A practical structure for roles, channels, onboarding, moderation, and support in a gaming community Discord.',
    category:'Community Guide',
    updated:'September 29, 2026',
    sections:[
      ['Start with purpose','Decide what the server is primarily for: a game community, creator audience, support hub, team, or mixed community. The channel structure should follow that purpose.'],
      ['Keep onboarding simple','New members should quickly understand the rules, where announcements live, how to get roles, and where normal conversation happens. Too many first-day choices create friction.'],
      ['Separate support from conversation','Tickets or dedicated support channels keep problems from being buried in general chat. Staff permissions should be limited to what each role actually needs.'],
      ['Create a maintenance routine','Review unused roles, permissions, dead channels, automations, and outdated information periodically instead of letting the server grow forever without cleanup.'],
    ],
    links:[['Discord setup service','/discord-server-setup'],['Service Configurator','/configure'],['ESN Trust Center','/trust']],
  },
  'creator-website-guide':{
    title:'How to plan a creator website before you build it',
    description:'A simple way to decide pages, calls to action, proof, mobile layout, and content before opening a website builder.',
    category:'Website Guide',
    updated:'September 29, 2026',
    sections:[
      ['Pick one primary goal','A creator site can showcase work, collect inquiries, explain services, build community, or route people to content. Choose the most important action first.'],
      ['Design the information order','A strong homepage usually explains who you are, what you do, why someone should care, proof or examples, and a clear next action without forcing visitors to hunt.'],
      ['Build mobile-first','Most social traffic can arrive on phones. Test navigation, text size, card density, media, buttons, and loading behavior on a narrow screen early.'],
      ['Give every page a reason to exist','Separate pages should target a real question or task. Do not create dozens of nearly empty pages just to have more URLs.'],
    ],
    links:[['ESN Website Builder','/site-builder'],['Builder Showcase','/showcase'],['Website landing page','/website-builder']],
  },
}

const SMP_FEATURES={
  'riftwalker':{title:'ESN Riftwalker Bundle',tag:'SMP GEAR',copy:'A mobility and utility bundle currently published by the ESN SMP Store.',items:['Riftblade — Rift Dash + bonus strike','Rift Wings — unbreakable Elytra + flight boost','Phase Boots — Speed I + Phase Step','Rift Bow — Slowness II arrows + Rift Burst','Rift Core — Resistance II + Absorption','Void Compass — tracks last death']},
  'immortal-warden':{title:'ESN Immortal Warden Bundle',tag:'SMP GEAR',copy:'A Warden-themed combat bundle currently published by the ESN SMP Store.',items:['Immortal Warden Helmet','Immortal Warden Chestplate','Immortal Warden Leggings','Immortal Warden Boots','Warden Blade','Warden Longbow','Immortal Core','Warden Totem']},
  'void-warrior':{title:'Void Warrior Bundle',tag:'SMP GEAR',copy:'A Void-themed high-end set currently listed by ESN. The store page should be treated as the source of truth for checkout availability.',items:['Void Blade','Void Crown','Void Chestplate','Void Leggings','Void Boots']},
  'realm-100':{title:'Realm 100 Keys',tag:'SMP PROGRESSION',copy:'Realm 100 keys are part of the current ESN SMP store and progression surface.',items:['20 × Realm 100 Keys','Realm progression is exposed through the current ESNSMP systems','Use the official store for current purchase availability']},
  'season-pass':{title:'ESN Season Pass Relics',tag:'SMP RELICS',copy:'The current Season Pass relic bundle contains six published ESN SMP items.',items:['Angel Wings','Inferno Scepter','Storm Crystal','Tideheart','Void Relic','Celestial Star']},
  'world-bosses':{title:'ESN SMP Boss & Endgame Systems',tag:'SMP BOSSES',copy:'The current public ESNSMP encyclopedia exposes bosses, boss drops, summoning, dungeons, raids, Endless Trials, codex systems, artifacts, pets, and other endgame mechanics.',items:['Boss and boss-drop systems','Dungeons and raids','Boss Codex and progression','Artifacts, pets, treasure, and endgame systems','Live boss timers are only shown when a verified server feed exists']},
}

function Hero({eyebrow,title,copy,children}){
  return <section className="page-hero visibility-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{copy}</p>{children}</div><div className="visibility-mark"><span>ES</span><strong>DISCOVER</strong><small>BUILD • PLAY • CREATE</small></div></div></section>
}

export function SearchLandingPage(){
  const location=useLocation()
  const {topic}=useParams()
  const resolved=topic||location.pathname.replace(/^\//,'')
  const page=LANDINGS[resolved]
  if(!page)return <Hero eyebrow="ES NETWORK" title="That ESN guide was not found." copy="Use the Explore page to find the current ESN destination."/>
  return <><Hero eyebrow={page.eyebrow} title={page.title} copy={page.intro}><div className="hero-actions"><Link className="button primary" to={page.primary[1]}>{page.primary[0]}</Link><Link className="button secondary" to={page.secondary[1]}>{page.secondary[0]}</Link></div></Hero>
    <section className="section"><div className="shell visibility-landing-grid"><article><span className="eyebrow">WHY THIS PAGE EXISTS</span><h2>Get to the useful part quickly.</h2><p>{page.intro}</p></article><div className="visibility-benefits">{page.bullets.map((item,index)=><div key={item}><span>{String(index+1).padStart(2,'0')}</span><strong>{item}</strong></div>)}</div></div></section>
    <section className="section dark-section"><div className="shell visibility-related"><div><span className="eyebrow">KEEP EXPLORING</span><h2>Keep reading.</h2></div><div>{page.related.map(([label,to])=><Link to={to} key={to}>{label}<span>↗</span></Link>)}</div></div></section></>
}

export function GuidesHubPage(){
  const articles=Object.entries(GUIDES)
  const news=[['Release Center','Current website, SMP, Arcade, network, store, and security updates.','/updates'],['Network Activity','Recent ESN platform milestones plus local route activity.','/activity'],["What's New",'A quick view of major features added to the current ESN website.','/whatsnew'],['Network Changelog','Interactive change history across ESN systems.','/changelog']]
  return <><Hero eyebrow="ESN GUIDES + NEWS" title="Guides from ESN." copy="Connection steps, creator tips, Discord setup advice, and links to current ESN updates."/>
    <section className="section"><div className="shell"><div className="section-heading"><div><span className="eyebrow">EVERGREEN GUIDES</span><h2>Answers people can actually use.</h2></div></div><div className="visibility-guide-grid">{articles.map(([slug,item])=><Link to={'/guides/'+slug} key={slug}><span>{item.category}</span><h2>{item.title}</h2><p>{item.description}</p><small>Updated {item.updated}</small><em>Read guide ↗</em></Link>)}</div></div></section>
    <section className="section dark-section"><div className="shell"><div className="section-heading"><div><span className="eyebrow">ESN NEWS + RELEASES</span><h2>See what changed recently.</h2></div></div><div className="visibility-news-grid">{news.map(([title,copy,to])=><Link to={to} key={to}><strong>{title}</strong><p>{copy}</p><span>Open ↗</span></Link>)}</div></div></section></>
}

export function GuideArticlePage(){
  const {slug}=useParams()
  const article=GUIDES[slug]
  if(!article)return <Hero eyebrow="ESN GUIDES" title="Guide not found." copy="Open the ESN Guides Center to browse current articles."/>
  return <><Hero eyebrow={article.category} title={article.title} copy={article.description}><div className="visibility-article-meta"><span>Updated {article.updated}</span><span>ES NETWORK</span><span>ACCOUNT-FREE</span></div></Hero>
    <article className="section visibility-article"><div className="shell visibility-article-shell">{article.sections.map(([title,copy],index)=><section key={title}><span>{String(index+1).padStart(2,'0')}</span><div><h2>{title}</h2><p>{copy}</p></div></section>)}<aside><span className="eyebrow">NEXT STEPS</span><div>{article.links.map(([label,to,external])=>external?<a href={to} target="_blank" rel="noreferrer" key={to}>{label} ↗</a>:<Link to={to} key={to}>{label} ↗</Link>)}</div></aside></div></article></>
}

export function BrandAuthorityPage(){
  return <><Hero eyebrow="ES NETWORK // OFFICIAL" title="Meet ES Network." copy="ES Network (ESN) is the current organization and brand. EP1C Services was the former name, not a separate current division."/>
    <section className="section"><div className="shell visibility-brand-grid">
      <article><span>01</span><h2>Creator services</h2><p>Fortnite coaching, creator editing, Discord server setups, website projects, and selected custom digital work.</p><Link to="/serviceshowcase">Explore services →</Link></article>
      <article><span>02</span><h2>Gaming network</h2><p>ESN includes the ESN SMP and six original browser games inside the ESN Arcade.</p><Link to="/minecraft-smp">Explore gaming →</Link></article>
      <article><span>03</span><h2>Tools + creation</h2><p>Try free browser tools, build a website, or find information about ESN products and services.</p><Link to="/website-builder">Explore creation →</Link></article>
      <article><span>04</span><h2>Community</h2><p>Join the Discord for updates, support, project tickets, and community conversations.</p><a href={DISCORD_URL} target="_blank" rel="noreferrer">Official Discord ↗</a></article>
    </div></section>
    <section className="section dark-section"><div className="shell visibility-official-card"><div><span className="eyebrow">IDENTITY</span><h2>How ESN got its name.</h2><p>When you see ES Network or ESN on this site, it refers to the current organization. References to EP1C Services describe the former name and history.</p></div><div><Link to="/about">About ESN ↗</Link><Link to="/trust">Trust Center ↗</Link><Link to="/timeline">ESN Timeline ↗</Link><Link to="/leadership">Leadership ↗</Link></div></div></section></>
}

export function SMPFeaturePage(){
  const {feature}=useParams()
  const item=SMP_FEATURES[feature]
  if(!item)return <Hero eyebrow="ESN SMP" title="SMP feature not found." copy="Browse the current SMP Item Encyclopedia for published ESN gear and systems."/>
  return <><Hero eyebrow={item.tag} title={item.title} copy={item.copy}><div className="hero-actions"><Link className="button primary" to="/smp-items">Open item encyclopedia</Link><Link className="button secondary" to="/smp-hub">SMP World Hub</Link></div></Hero>
    <section className="section"><div className="shell visibility-feature-layout"><article><span className="eyebrow">ITEM DETAILS</span><h2>{item.title}</h2><p>{item.copy}</p><small>Product availability, checkout state, and live server behavior can change. Use the current ESN Store and SMP Hub as the source of truth.</small></article><div>{item.items.map((value,index)=><div key={value}><span>{String(index+1).padStart(2,'0')}</span><strong>{value}</strong></div>)}</div></div></section>
    <section className="section dark-section"><div className="shell visibility-related"><div><span className="eyebrow">SMP DISCOVERY</span><h2>More from the SMP.</h2></div><div><Link to="/smp-items">Items <span>↗</span></Link><Link to="/smpguide">Encyclopedia <span>↗</span></Link><Link to="/smp-hub">World Hub <span>↗</span></Link></div></div></section></>
}

function readObject(key){try{const value=JSON.parse(localStorage.getItem(key)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{}}catch{return{}}}
function bump(key,name){
  const data=readObject(key)
  data[name]=(Number(data[name])||0)+1
  localStorage.setItem(key,JSON.stringify(data))
}

export function VisibilityLayer(){
  const location=useLocation()
  useEffect(()=>{
    if(location.pathname.startsWith('/sites/'))return
    const viewKey=location.pathname||'/'
    const sessionKey='esn-view:'+viewKey
    if(!sessionStorage.getItem(sessionKey)){
      bump('esn_visibility_pageviews_v1',viewKey)
      sessionStorage.setItem(sessionKey,'1')
    }
    const params=new URLSearchParams(location.search)
    const ref=params.get('ref')||params.get('utm_source')
    if(ref){
      const safe=ref.toLowerCase().replace(/[^a-z0-9._-]/g,'').slice(0,40)
      const dedupe='esn-ref:'+safe+':'+viewKey
      if(safe&&!sessionStorage.getItem(dedupe)){
        bump('esn_visibility_referrals_v1',safe)
        sessionStorage.setItem(dedupe,'1')
      }
    }
  },[location.pathname,location.search])
  return null
}

const RELATED={
  '/serviceshowcase':[['Fortnite Coaching','/fortnite-coaching'],['Video Editing','/video-editing'],['Discord Setup','/discord-server-setup'],['Project Estimate','/estimate']],
  '/site-builder':[['Website Builder Guide','/website-builder'],['Creator Website Guide','/guides/creator-website-guide'],['Builder Showcase','/showcase']],
  '/estools':[['Free Browser Tools','/free-browser-tools'],['Guides Center','/guides'],['Explore ESN','/explore']],
  '/smp-hub':[['Minecraft Server','/minecraft-server'],['Minecraft SMP','/minecraft-smp'],['Beginner Guide','/guides/minecraft-smp-beginner-guide'],['SMP Items','/smp-items']],
  '/smp-items':[['Riftwalker','/smp/riftwalker'],['Immortal Warden','/smp/immortal-warden'],['Season Pass','/smp/season-pass'],['Realm 100','/smp/realm-100']],
  '/showcase':[['Website Builder','/website-builder'],['Creator Website Guide','/guides/creator-website-guide'],['Build a Site','/site-builder']],
  '/about':[['ES Network','/es-network'],['Trust Center','/trust'],['Timeline','/timeline']],
}

export function RelatedVisibilityLinks(){
  const location=useLocation()
  const links=RELATED[location.pathname]
  if(!links)return null
  return <section className="visibility-global-related"><div className="shell"><span>RELATED ESN</span><div>{links.map(([label,to])=><Link to={to} key={to}>{label}<em>↗</em></Link>)}</div></div></section>
}

export function VisibilityInsightsPage(){
  const views=useMemo(()=>readObject('esn_visibility_pageviews_v1'),[])
  const refs=useMemo(()=>readObject('esn_visibility_referrals_v1'),[])
  const viewRows=Object.entries(views).sort((a,b)=>b[1]-a[1]).slice(0,20)
  const refRows=Object.entries(refs).sort((a,b)=>b[1]-a[1]).slice(0,20)
  return <><Hero eyebrow="PRIVACY-FRIENDLY VISIBILITY" title="See referral and page signals stored on this device." copy="This dashboard intentionally does not create visitor accounts or send analytics to an ESN user-profile database. It is a local diagnostic view, not a network-wide traffic total."/>
    <section className="section"><div className="shell visibility-insights-grid"><article><span>LOCAL PAGE VIEWS</span>{viewRows.length?viewRows.map(([name,count])=><div key={name}><code>{name}</code><strong>{count}</strong></div>):<p>No local page-view signals yet.</p>}</article><article><span>LOCAL REFERRALS</span>{refRows.length?refRows.map(([name,count])=><div key={name}><code>{name}</code><strong>{count}</strong></div>):<p>Open a link such as <code>?ref=discord</code> to record a local referral signal.</p>}</article></div></section>
    <section className="section dark-section"><div className="shell visibility-insight-note"><span>IMPORTANT</span><p>Because ESN is keeping this account-free and no external analytics provider is connected here, these numbers only describe this browser. Site-wide visitor counts would require a privacy-focused aggregate analytics service or server-side logging.</p></div></section></>
}

export const VISIBILITY_GUIDES=GUIDES
