import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { DISCORD_URL, SITE_RELEASE, SMP_ADDRESS, SMP_PORT, useLiveNetwork } from './liveNetwork'

function StatusPill({status}){
  const normalized=status||'unknown'
  const label=normalized==='online'||normalized==='operational'||normalized==='available'?'ONLINE'
    :normalized==='configured'?'CONFIGURED'
    :normalized==='checking'?'CHECKING'
    :normalized==='connection-lost'?'CONNECTION LOST'
    :normalized==='offline'?'OFFLINE':'UNAVAILABLE'
  return <span className={`live-status-pill ${normalized}`}><i/>{label}</span>
}

export function WhatsHappeningNow(){
  const live=useLiveNetwork()
  return <section className="section now-section">
    <div className="shell">
      <div className="section-heading flagship-heading">
        <div><span className="eyebrow">WHAT'S HAPPENING NOW</span><h2>Live across ES Network.</h2></div>
        <Link className="text-link" to="/status">Open Network Status →</Link>
      </div>

      <div className="now-grid">
        <article className="now-card now-smp">
          <div className="now-card-top"><span>ESN SMP</span><StatusPill status={live.smp.status}/></div>
          {live.smp.telemetry==='live'&&live.smp.players!=null
            ? <><strong>{live.smp.players}<small> / {live.smp.maxPlayers??'—'}</small></strong><p>Players online right now</p></>
            : <><strong>LIVE</strong><p>ESN confirmed online • player telemetry unavailable</p></>}
          <div className="now-meta"><span>{SMP_ADDRESS}:{SMP_PORT}</span><span>{live.smp.version||'Version unavailable'}</span></div>
        </article>

        <article className="now-card">
          <div className="now-card-top"><span>PLUGIN RELEASE</span><StatusPill status={live.plugin.status}/></div>
          <strong>{live.plugin.version||'Checking…'}</strong>
          <p>Latest public ESNSMP release</p>
          <Link to="/updates">Release center →</Link>
        </article>

        <article className="now-card">
          <div className="now-card-top"><span>WEBSITE</span><StatusPill status={live.website.status}/></div>
          <strong>LIVE</strong>
          <p>{SITE_RELEASE}</p>
          <Link to="/updates">See what changed →</Link>
        </article>

        <article className="now-card">
          <div className="now-card-top"><span>COMMUNITY</span><StatusPill status={live.discord.status}/></div>
          <strong>{live.discord.onlineMembers??'ESN'}</strong>
          <p>{live.discord.onlineMembers!=null?'Approx. Discord members online':'Discord is the source of truth for current announcements.'}</p>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer">Open Discord →</a>
        </article>
      </div>
    </div>
  </section>
}

export function StatusCenter(){
  const live=useLiveNetwork()
  const checked=live.checkedAt?new Date(live.checkedAt).toLocaleTimeString([], {hour:'numeric',minute:'2-digit',second:'2-digit'}):'—'

  return <>
    <section className="page-hero live-page-hero">
      <div className="shell page-hero-inner">
        <div className="page-hero-copy">
          <span className="eyebrow">ESN LIVE NETWORK</span>
          <h1>Network Status Center.</h1>
          <p>Live website, SMP, plugin, Arcade, and community connection information in one place.</p>
        </div>
        <div className="page-hero-mark" aria-hidden="true"><span>LIVE</span><small>STATUS</small></div>
      </div>
    </section>

    <section className="section compact-section">
      <div className="shell live-status-summary">
        <div><span>LAST CHECK</span><strong>{checked}</strong></div>
        <div><span>AUTO REFRESH</span><strong>60 SEC</strong></div>
        <button type="button" onClick={live.refresh}>Refresh now ↻</button>
      </div>
    </section>

    <section className="section status-center-section">
      <div className="shell status-center-grid">
        <article className="status-system-card featured">
          <div className="status-system-head"><div><span>01</span><h2>ESN SMP</h2></div><StatusPill status={live.smp.status}/></div>
          <div className="status-player-display">
            <strong>{live.smp.telemetry==='live'&&live.smp.players!=null?live.smp.players:'LIVE'}</strong>
            <span>{live.smp.telemetry==='live'&&live.smp.players!=null?`of ${live.smp.maxPlayers??'—'} players online`:'ESN-confirmed operational • player telemetry unavailable'}</span>
          </div>
          <div className="status-detail-grid">
            <div><span>SERVER</span><strong>{SMP_ADDRESS}:{SMP_PORT}</strong></div>
            <div><span>VERSION</span><strong>{live.smp.version||'Unavailable'}</strong></div>
            <div><span>SOFTWARE</span><strong>{live.smp.software||'Not exposed'}</strong></div>
            <div><span>STATUS SOURCE</span><strong>{live.smp.source==='esn-confirmed'?'ESN confirmed live':live.smp.source||'Unavailable'}</strong></div>
          </div>
          <p className="status-note">{live.smp.source==='esn-confirmed'
            ? 'ESN has confirmed the SMP is live. Public Minecraft status providers are currently unable to read reliable telemetry for this server setup, so the site will not falsely mark it offline or invent a player count.'
            : 'Public Minecraft status telemetry is responding normally. Historical uptime still requires a separate monitoring service, so ESN does not invent an uptime percentage.'}</p>
          <Link className="button primary" to="/smpconnection">Connect to ESN SMP</Link>
        </article>

        <article className="status-system-card">
          <div className="status-system-head"><div><span>02</span><h3>Website</h3></div><StatusPill status={live.website.status}/></div>
          <strong className="status-big-value">ONLINE</strong>
          <p>This page and the current ESN website bundle loaded successfully.</p>
          <small>{SITE_RELEASE}</small>
        </article>

        <article className="status-system-card">
          <div className="status-system-head"><div><span>03</span><h3>Arcade</h3></div><StatusPill status={live.arcade.status}/></div>
          <strong className="status-big-value">{live.arcade.games}</strong>
          <p>Original ESN browser games available through the current website build.</p>
          <Link to="/arcade">Open Arcade →</Link>
        </article>

        <article className="status-system-card">
          <div className="status-system-head"><div><span>04</span><h3>ESNSMP Plugin</h3></div><StatusPill status={live.plugin.status}/></div>
          <strong className="status-big-value">{live.plugin.version||'—'}</strong>
          <p>Latest public GitHub release detected from the official ESNSMP repository.</p>
          <Link to="/smpplugin">Download plugin →</Link>
        </article>

        <article className="status-system-card">
          <div className="status-system-head"><div><span>05</span><h3>Discord</h3></div><StatusPill status={live.discord.status}/></div>
          <strong className="status-big-value">{live.discord.onlineMembers??'LIVE'}</strong>
          <p>{live.discord.onlineMembers!=null?`${live.discord.onlineMembers.toLocaleString()} approximate members online • ${live.discord.members?.toLocaleString()||'—'} total`:'The official invite is configured. Live Discord counts may be unavailable if Discord blocks browser status requests.'}</p>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer">Open Discord →</a>
        </article>
      </div>
    </section>
    <section className="section dark-section incident-history-section">
      <div className="shell">
        <div className="section-heading"><div><span className="eyebrow">INCIDENT HISTORY</span><h2>Transparent status history.</h2><p>ESN will only list outages or maintenance here when there is a verified public record. No uptime percentage or historical outage is invented.</p></div></div>
        <div className="incident-history-empty">
          <span>CURRENT PUBLIC RECORD</span>
          <strong>No verified historical incident entries are published yet.</strong>
          <p>Live status above remains the source for current availability. Future verified maintenance windows and resolved outages can be logged here with date, affected system, and resolution details.</p>
        </div>
      </div>
    </section>
  </>
}

const timelinePhases=[
  {
    id:'ep1c',
    index:'01',
    title:'EP1C Services',
    eyebrow:'Former Name',
    copy:'The organization began under the EP1C Services name. This is the historical name, not a separate current division.',
    points:['Original service identity','Early creator/community work','Foundation for the current brand'],
  },
  {
    id:'esn',
    index:'02',
    title:'ES Network',
    eyebrow:'Current Brand',
    copy:'EP1C Services was renamed to ES Network, bringing services, community projects, gaming, tools, and web experiences under one current identity.',
    points:['One network identity','Unified navigation and branding','Services + community + digital experiences'],
  },
  {
    id:'smp',
    index:'03',
    title:'ESN SMP',
    eyebrow:'Minecraft Network',
    copy:'ESN expanded into its Minecraft SMP ecosystem with custom items, crates, bosses, events, progression, store delivery, and the public ESNSMP plugin.',
    points:['Custom Paper server systems','Official SMP Store','Public ESNSMP plugin'],
  },
  {
    id:'arcade',
    index:'04',
    title:'ESN Arcade',
    eyebrow:'Browser Games',
    copy:'The network added six original browser game experiences: Clicker, Factory, Mines, MOTO, Tower, and Tower Defense.',
    points:['Six original games','Shared ES Coin progression','Mobile-responsive controls'],
  },
  {
    id:'current',
    index:'05',
    title:'Current Projects',
    eyebrow:'Now',
    copy:'ESN is currently focused on a premium unified website experience with persistent local-device progression, live network systems, SMP development, Arcade improvements, tools, and public-facing infrastructure.',
    points:['Network Evolution 12X: missions, Passport, Terminal + search','Live status, event board + seasonal network states','Ongoing SMP and Arcade development'],
  },
]

export function TimelinePage(){
  const [active,setActive]=useState(1)
  const phase=timelinePhases[active]

  return <>
    <section className="page-hero timeline-hero">
      <div className="shell page-hero-inner">
        <div className="page-hero-copy"><span className="eyebrow">ESN HISTORY</span><h1>From EP1C to ES Network.</h1><p>An interactive view of the major eras that shaped the current ESN ecosystem. Exact historical dates are intentionally omitted where they have not been verified.</p></div>
        <div className="page-hero-mark" aria-hidden="true"><span>05</span><small>ERAS</small></div>
      </div>
    </section>

    <section className="section timeline-section" data-era={phase.id}>
      <div className="shell timeline-layout">
        <nav className="timeline-nav" aria-label="ESN timeline">
          {timelinePhases.map((item,index)=><button key={item.id} type="button" className={active===index?'active':''} onClick={()=>setActive(index)}>
            <span>{item.index}</span><b>{item.title}</b><small>{item.eyebrow}</small>
          </button>)}
        </nav>

        <article key={phase.id} className="timeline-detail">
          <span className="timeline-detail-index">{phase.index}</span>
          <span className="eyebrow">{phase.eyebrow}</span>
          <h2>{phase.title}</h2>
          <p>{phase.copy}</p>
          <div className="timeline-points">{phase.points.map(point=><div key={point}><i/> {point}</div>)}</div>
          <div className="timeline-scrubber">
            <button type="button" onClick={()=>setActive(value=>Math.max(0,value-1))} disabled={active===0}>← PREV</button>
            <label><span>SCRUB THROUGH ESN HISTORY</span><input aria-label="ESN timeline era" type="range" min="0" max={timelinePhases.length-1} step="1" value={active} onChange={event=>setActive(Number(event.target.value))}/></label>
            <button type="button" onClick={()=>setActive(value=>Math.min(timelinePhases.length-1,value+1))} disabled={active===timelinePhases.length-1}>NEXT →</button>
          </div>
          <div className="timeline-position"><span>ERA {phase.index}</span><div><i style={{width:`${((active+1)/timelinePhases.length)*100}%`}}/></div><strong>{active+1} / {timelinePhases.length}</strong></div>
        </article>
      </div>
    </section>
  </>
}

export function UpdatesPage(){
  const live=useLiveNetwork()
  const [filter,setFilter]=useState('All')

  const releases=[
    {category:'Website',type:'Website Expansion',status:'LIVE',version:'Expansion 20',title:'20-system ESN website feature expansion',copy:'Added installable PWA support, automatic and manual performance modes, What\'s New, SMP Encyclopedia + command database, bug reporting, update filters, incident history, recent routes + favorites, Arcade daily challenges, cross-game achievements, global achievement alerts, media gallery, network statistics, quick-copy tools, smart mobile header, Accessibility Center, categorized search, and a full Explore ESN discovery page.'},
    {category:'Mobile',type:'Mobile Safe Mode',status:'LIVE',version:'Single-Surface UI',title:'Phone UI rebuilt for stability',copy:'Removed the extra floating Network Evolution bars and mobile notification orb, moved Search/Terminal/Passport into the existing More panel, disabled all mobile animations/transitions, removed decorative fixed layers, made the mobile header and bottom nav opaque, and eliminated dynamic-viewport/3D hover behavior that could flicker as the browser chrome resized.'},
    {category:'Mobile',type:'Mobile Stability',status:'LIVE',version:'Anti-Flicker Pass',title:'Mobile flashing and pop-in removed',copy:'Disabled phone-only reveal observers and route overlays, removed mobile content-visibility pop-in, forced already-rendered sections to remain visible, stabilized fixed controls against browser viewport changes, and removed touch hover/tilt transforms that could flash or disappear during scrolling.'},
    {category:'Mobile',type:'Mobile UI',status:'LIVE',version:'Floating Bar Fix',title:'Mobile command bars realigned',copy:'Realigned the Network Evolution utility rail, personal Command Deck, and mobile bottom navigation into a clean stacked layout with consistent edges, spacing, and safe-area padding so the floating bars no longer cross or overlap on phones.'},
    {category:'Mobile',type:'Mobile',status:'LIVE',version:'Performance Mode',title:'Phone performance stabilization pass',copy:'Disabled continuous WebGL rendering on touch devices, removed touch particle spawning and random event load, stopped pointer-reactive repaint work during scrolling, disabled expensive mobile backdrop blurs and decorative animation loops, and simplified touch rendering so the premium interface stays smoother on phones.'},
    {category:'Website',type:'Website 12X',status:'LIVE',version:'Network Evolution 12X',title:'12-system interactive network expansion',copy:'Added ESN Missions, local-device Passport progression, configurable Network Takeovers, seasonal network states, ESN Terminal commands, universal search, an upgraded timeline scrubber, optional muted-by-default sound design, a public SMP + network event board, a customizable personal Command Deck, shareable Passport achievement cards, and ultra-rare network events.'},
    {category:'Website',type:'Website',status:'LIVE',version:SITE_RELEASE,title:'ESN Live Experience + stable cinematic transitions',copy:'Flagship architecture, global WebGL lighting on capable desktop devices, premium command center, live status systems, mobile navigation, themes, timeline, update center, portfolio demos, cinematic startup, and corrected route transitions.'},
    {category:'SMP',type:'ESNSMP Plugin',status:live.plugin.status==='available'?'LATEST':'CHECKING',version:live.plugin.version||'Checking…',title:'Latest public ESNSMP release',copy:'Detected live from the official ESNSMP GitHub Releases feed.'},
    {category:'Arcade',type:'Arcade',status:'LIVE',version:'Shared Progression',title:'Arcade daily challenges + achievement expansion',copy:'The Arcade now has rotating daily challenges, local streak tracking, shared XP rewards, cross-game meta achievements, and clean achievement notifications tied to real local progress.'},
    {category:'Network',type:'Network',status:'LIVE',version:'Live Status + Event Board',title:'Public network telemetry and event surface',copy:'Website, SMP player count/version, plugin release, Arcade status, Discord connection information, event surface, incident-history area, and local Network Statistics are now connected.'},
    {category:'Store',type:'SMP Store',status:'LIVE',version:'Current Checkout Flow',title:'Official SMP store delivery guidance',copy:'The website keeps the current Stripe checkout links, exact Minecraft Username guidance, online-delivery reminder, and store support path connected to the ESN SMP store experience.'},
    {category:'Security',type:'Security',status:'LIVE',version:'Protected CI',title:'Expansion features covered by validation and security workflows',copy:'Site route validation, production SEO checks, build verification, and CodeQL continue to run on website changes before the published build is treated as complete.'},
  ]

  const categories=['All','Website','Mobile','SMP','Arcade','Network','Store','Security']
  const visible=filter==='All'?releases:releases.filter(item=>item.category===filter)

  const roadmap=[
    ['Verified Portfolio Cases','Waiting on source assets','Replace illustrative before/after demos with real client-approved work when originals are available.'],
    ['Approved Media Uploads','Waiting on source assets','Add real SMP screenshots, builds, community event media, and promotional visuals once approved files are available.'],
  ]

  return <>
    <section className="page-hero updates-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">ESN RELEASE CENTER</span><h1>What changed. What's live. What's next.</h1><p>A single source for website upgrades, ESNSMP releases, Arcade work, mobile fixes, network changes, and security-related release information.</p></div><div className="page-hero-mark" aria-hidden="true"><span>UP</span><small>DATES</small></div></div></section>
    <section className="section compact-section"><div className="shell release-filter-row">{categories.map(item=><button type="button" className={filter===item?'active':''} onClick={()=>setFilter(item)} key={item}>{item}</button>)}</div></section>
    <section className="section"><div className="shell update-feed">
      {visible.map((item,index)=><article className="update-entry" key={item.type+item.version}>
        <div className="update-entry-rail"><span>{String(index+1).padStart(2,'0')}</span><i/></div>
        <div><div className="update-entry-top"><span className="eyebrow">{item.type}</span><b>{item.status}</b></div><h2>{item.title}</h2><strong>{item.version}</strong><p>{item.copy}</p></div>
      </article>)}
    </div></section>
    <section className="section dark-section"><div className="shell"><div className="section-heading"><div><span className="eyebrow">ROADMAP</span><h2>Items waiting on real source material.</h2><p>Completed ideas were removed from the roadmap instead of being left labeled as future work.</p></div></div><div className="roadmap-grid">{roadmap.map(([name,status,copy])=><article key={name}><span>{status}</span><h3>{name}</h3><p>{copy}</p></article>)}</div></div></section>
  </>
}

const portfolioDemos=[
  {
    key:'editing',label:'Editing',title:'Raw timeline → polished creator cut',
    before:['Untrimmed pacing','No visual hierarchy','Basic audio levels','No finishing pass'],
    after:['Tighter pacing','Intentional impact moments','Balanced audio','Delivery-ready polish'],
  },
  {
    key:'discord',label:'Discord Setup',title:'Unstructured server → organized community hub',
    before:['Mixed channel purposes','Loose permissions','No onboarding path','Harder staff navigation'],
    after:['Clear categories','Role-based permissions','Guided onboarding','Cleaner staff workflow'],
  },
  {
    key:'website',label:'Website Creation',title:'Basic page → premium conversion-focused experience',
    before:['Flat information layout','Weak mobile hierarchy','Minimal interaction','Generic calls-to-action'],
    after:['Premium hierarchy','Responsive composition','Interactive depth','Clear conversion paths'],
  },
]

function BeforeAfterDemo({demo}){
  const [split,setSplit]=useState(50)
  return <article className="portfolio-demo">
    <div className="portfolio-demo-head"><div><span className="eyebrow">{demo.label}</span><h2>{demo.title}</h2></div><span className="portfolio-demo-note">ILLUSTRATIVE PROCESS DEMO</span></div>
    <div className="before-after-stage">
      <div className={`portfolio-visual before ${demo.key}`}>
        <span>BEFORE</span>
        <div className="portfolio-mock">{demo.before.map((item,index)=><div key={item}><i>{index+1}</i><b>{item}</b></div>)}</div>
      </div>
      <div className={`portfolio-visual after ${demo.key}`} style={{clipPath:`inset(0 0 0 ${split}%)`}}>
        <span>AFTER</span>
        <div className="portfolio-mock">{demo.after.map((item,index)=><div key={item}><i>{index+1}</i><b>{item}</b></div>)}</div>
      </div>
      <div className="before-after-divider" style={{left:`${split}%`}}><i>↔</i></div>
    </div>
    <input className="before-after-range" aria-label={`${demo.label} before and after comparison`} type="range" min="8" max="92" value={split} onChange={e=>setSplit(Number(e.target.value))}/>
    <p className="portfolio-disclaimer">This is an illustrative ESN service transformation demo, not a claimed customer result. Real client before/after work can replace it when verified source assets are available.</p>
  </article>
}

export function PortfolioPage(){
  return <>
    <section className="page-hero portfolio-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">ESN PORTFOLIO LAB</span><h1>See the transformation.</h1><p>Interactive before/after demos for editing, Discord setup, and website creation. These demos describe the service process without inventing client work.</p></div><div className="page-hero-mark" aria-hidden="true"><span>↔</span><small>COMPARE</small></div></div></section>
    <section className="section"><div className="shell portfolio-stack">{portfolioDemos.map(demo=><BeforeAfterDemo key={demo.key} demo={demo}/>)}</div></section>
  </>
}

export function VaultPage(){
  const unlocked=typeof window!=='undefined'&&localStorage.getItem('esn_vault_unlocked')==='1'
  if(!unlocked)return <section className="page-hero vault-locked"><div className="shell narrow"><span className="eyebrow">RESTRICTED</span><h1>The ESN Vault is locked.</h1><p>There are things hidden around the network. Find the sequence, the command, or the right number of taps.</p><Link className="button secondary" to="/">Return to ESN</Link></div></section>

  return <section className="vault-page">
    <div className="vault-grid" aria-hidden="true"/>
    <div className="shell vault-content">
      <span className="eyebrow">SECRET // UNLOCKED</span>
      <h1>Welcome to the ESN Vault.</h1>
      <p>You found one of the hidden network layers. Unlocking the Vault also reveals the hidden <b>Midnight Core</b> visual theme inside the Command Center.</p>
      <div className="vault-code">ESN // 07 // CORE ACCESS GRANTED</div>
      <div className="vault-actions"><Link className="button primary" to="/arcade">Enter Arcade</Link><Link className="button secondary" to="/updates">Open Release Center</Link></div>
    </div>
  </section>
}
