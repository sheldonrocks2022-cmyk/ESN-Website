import {useEffect,useMemo,useState} from 'react'
import {Link} from 'react-router-dom'
import {BOT_PLANS} from './Hosting'
import { LiveBusinessCustomer,getPublicBusiness,businessApiEnabled } from './BusinessLive'
import {
  CAPABILITIES,DEFAULT_BUSINESS_SETTINGS,DISCORD_HOSTING,SETUP_GUIDES,
  BUSINESS_AUDIT_KEY,addBusinessAudit,createLocalDraft,readBusinessDrafts,
  readBusinessSettings,ticketMessage,writeBusinessDrafts,writeBusinessSettings,
} from './businessPlatformData'
import './businessPlatform.css'

const MONEY=(value)=>Number(value.replace(/[^0-9.]/g,''))||0
const RAM=(value)=>value.includes('MB')?parseFloat(value)/1024:parseFloat(value)
const SECTIONS=[
  {id:'overview',label:'Overview',url:'/business'},
  {id:'dashboard',label:'My workspace',url:'/business/dashboard'},
  {id:'plans',label:'Plans & requests',url:'/business/plans'},
  {id:'partners',label:'Partnerships',url:'/business/partners'},
  {id:'rewards',label:'Rewards',url:'/business/rewards'},
  {id:'support',label:'Help',url:'/business/support'},
  {id:'setup',label:'Setup guides',url:'/business/setup'},
]
const REQUEST_TYPES=['Hosting order','Server upgrade','Free trial','Partner application','Referral enquiry','Customer review','General support']

function useBusinessSettings(){
  const [settings,setSettings]=useState(readBusinessSettings)
  useEffect(()=>{
    if(businessApiEnabled())getPublicBusiness().then(data=>{if(data?.settings)setSettings(old=>({...old,...data.settings}))}).catch(()=>{})
    const sync=()=>{if(!businessApiEnabled())setSettings(readBusinessSettings())}
    window.addEventListener('esn-business-change',sync)
    window.addEventListener('storage',sync)
    return()=>{window.removeEventListener('esn-business-change',sync);window.removeEventListener('storage',sync)}
  },[])
  return settings
}
function useLocalRequests(){
  const [items,setItems]=useState(readBusinessDrafts)
  useEffect(()=>{
    const sync=()=>setItems(readBusinessDrafts())
    window.addEventListener('esn-business-drafts-change',sync)
    window.addEventListener('storage',sync)
    return()=>{window.removeEventListener('esn-business-drafts-change',sync);window.removeEventListener('storage',sync)}
  },[])
  return items
}
async function copyText(text){
  try{await navigator.clipboard.writeText(text);return true}catch{return false}
}
function LocalMode(){
  return <p className="business-mode"><strong>Buy hosting on the ESN panel</strong> — Plans are bought at <a href="https://panel.esnoffical.com/plans" target="_blank" rel="noreferrer">panel.esnoffical.com/plans</a>: pay on Stripe and your server is set up automatically. This page is a planning and request tool: drafts stay in your browser and no orders, payments, referrals, credits, or server changes happen here.</p>
}
function PlanCard({plan,featured,onAsk}){
  return <article className={featured?'business-plan highlighted':'business-plan'}>
    <div className="business-plan-head"><strong>ESN {plan.name}</strong>{featured&&<span>RECOMMENDED</span>}</div>
    <div className="business-plan-price">{plan.price}<small>/ month</small></div>
    <div className="business-resource"><span>{plan.ram} RAM</span><span>{plan.cpu} CPU</span><span>{plan.storage} storage</span></div>
    <a className="business-plan-buy" href="https://panel.esnoffical.com/plans" target="_blank" rel="noreferrer">Buy on the panel <span>↗</span></a>
    <button type="button" onClick={()=>onAsk(plan.name)}>Prepare a ticket <span>↗</span></button>
  </article>
}
function ContactRequest({presetType='Hosting order',presetPlan='Pro',settings}){
  const [type,setType]=useState(presetType)
  const [plan,setPlan]=useState(presetPlan)
  const [notes,setNotes]=useState('')
  const [result,setResult]=useState('')
  const unavailable=(type==='Free trial'&&!settings.trialsEnabled)||
    (type==='Partner application'&&!settings.partnerApplicationsEnabled)||
    (type==='Referral enquiry'&&!settings.referralApplicationsEnabled)
  const prepare=async()=>{
    const message=ticketMessage(type,plan,notes)
    createLocalDraft(type,plan,notes)
    const copied=await copyText(message)
    setResult(copied?'Saved as a local draft and copied. Open Discord, create a ticket and paste the request.':'Saved as a local draft. Copy the message below and open a Discord ticket.')
  }
  const text=ticketMessage(type,plan,notes)
  return <section className="business-request-panel">
    <div className="business-section-heading"><div><span>REQUEST CENTER</span><h2>Tell us what you need.</h2><p>Prepare a message for a real ESN staff member. Requests are not automatically submitted.</p></div></div>
    <div className="business-form-grid">
      <label>Request type<select value={type} onChange={e=>{setType(e.target.value);setResult('')}}>{REQUEST_TYPES.filter(k=>k!=='Free trial'||settings.trialsEnabled).map(k=><option key={k}>{k}</option>)}</select></label>
      <label>Plan<select value={plan} onChange={e=>setPlan(e.target.value)}>{BOT_PLANS.map(p=><option key={p.name}>{p.name}</option>)}</select></label>
      <label className="wide">Details (optional; don't include passwords or payment data)<textarea maxLength="240" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Example: I run a Python moderation bot and would like to upgrade."/></label>
    </div>
    {unavailable&&<p className="business-warning">This program is not currently accepting requests. You can still ask ESN staff about future availability.</p>}
    <div className="business-action-row">
      <button type="button" onClick={prepare}>Save draft & copy request</button>
      <a href={DISCORD_HOSTING} target="_blank" rel="noreferrer">Open hosting Discord ↗</a>
    </div>
    {result&&<p role="status" className="business-success">{result}</p>}
    <details><summary>View the request text</summary><pre>{text}</pre></details>
  </section>
}
function Overview({settings}){
  return <>
    <div className="business-section-heading"><div><span>WHAT'S AVAILABLE</span><h2>Everything ESN can help with.</h2><p>Explore the tools and programs. Features that need verified billing or staff approval stay request-only for now.</p></div></div>
    <div className="business-feature-grid">
      {CAPABILITIES.map((feature,index)=><Link to={feature.path} className="business-feature" key={feature.id}>
        <span>{String(index+1).padStart(2,'0')}</span><strong>{feature.title}</strong><p>{feature.copy}</p><b>Explore →</b>
      </Link>)}
    </div>
    <section className="business-promo"><div><span>QUESTIONS?</span><h2>We're real people. Come talk to us.</h2><p>{settings.supportMessage}</p></div><a href={DISCORD_HOSTING} target="_blank" rel="noreferrer">Join hosting Discord ↗</a></section>
  </>
}
function Dashboard({settings}){
  const drafts=useLocalRequests()
  const [selected,setSelected]=useState(settings.featuredPlan)
  const remove=id=>writeBusinessDrafts(drafts.filter(d=>d.id!==id))
  return <>
    <div className="business-section-heading"><div><span>YOUR LOCAL WORKSPACE</span><h2>Pick up where you left off.</h2><p>This is a private draft workspace on this device, not a customer account. Your live subscriptions and payments aren't connected yet.</p></div></div>
    <div className="business-panel-grid">
      <article className="business-tile"><span>REQUESTS</span><strong>{drafts.length}</strong><p>Drafts saved only in this browser; none have been sent to staff automatically.</p></article>
      <article className="business-tile"><span>YOUR SERVER</span><strong>Not connected</strong><p>Discord account login and server status require the secure customer API.</p></article>
      <article className="business-tile"><span>BILLING</span><strong>Not connected</strong><p>Renewal dates and invoices must come from verified Stripe records.</p></article>
    </div>
    <div className="business-section-heading"><div><h2>Your request drafts</h2><p>Copy any request into an official ticket. Removing a draft only deletes it from this browser.</p></div></div>
    {drafts.length?<div className="business-drafts">{drafts.map(d=><article key={d.id}><div><span>{d.type} · {d.status}</span><strong>{d.plan}</strong><small>{new Date(d.createdAt).toLocaleString()}</small></div><div className="business-draft-actions"><button onClick={()=>copyText(ticketMessage(d.type,d.plan,d.notes))}>Copy text</button><button onClick={()=>remove(d.id)}>Delete</button></div></article>)}</div>:<p className="business-empty">No drafts yet. Start with a plan or a support request.</p>}
    <div className="business-section-heading"><div><h2>Plan a server upgrade</h2><p>Staff must verify your current plan, capacity, and any prorated charges.</p></div></div>
    <label className="business-label">Target plan<select value={selected} onChange={e=>setSelected(e.target.value)}>{BOT_PLANS.map(x=><option key={x.name}>{x.name}</option>)}</select></label>
    <ContactRequest key={selected} presetType="Server upgrade" presetPlan={selected} settings={settings}/>
  </>
}
function Plans({settings}){
  const [purpose,setPurpose]=useState('standard')
  const [bots,setBots]=useState('one')
  const [sort,setSort]=useState('price')
  const [chosen,setChosen]=useState(settings.featuredPlan)
  const recommended=useMemo(()=>{
    const minRam=purpose==='intensive'?6:purpose==='moderate'?3:purpose==='standard'?1:0.25
    const boost=bots==='multiple'?2:bots==='several'?4:0
    return BOT_PLANS.find(p=>RAM(p.ram)>=minRam+boost)||BOT_PLANS[BOT_PLANS.length-1]
  },[purpose,bots])
  const plans=useMemo(()=>[...BOT_PLANS].sort((a,b)=>sort==='memory'?RAM(b.ram)-RAM(a.ram):MONEY(a.price)-MONEY(b.price)),[sort])
  return <>
    {settings.planFinderEnabled&&<section className="business-finder">
      <div className="business-section-heading"><div><span>PLAN FINDER</span><h2>Find a good starting point.</h2><p>This is an estimate, not a guaranteed performance benchmark. Staff can help you size your bot.</p></div></div>
      <div className="business-form-grid">
        <label>Workload<select value={purpose} onChange={e=>setPurpose(e.target.value)}><option value="light">Small test bot</option><option value="standard">Typical community bot</option><option value="moderate">Active moderation and events</option><option value="intensive">Large or demanding project</option></select></label>
        <label>How many processes?<select value={bots} onChange={e=>setBots(e.target.value)}><option value="one">One bot</option><option value="multiple">A few processes</option><option value="several">Several demanding processes</option></select></label>
      </div>
      <div className="business-recommendation"><div><span>START BY COMPARING</span><strong>ESN {recommended.name}</strong><p>{recommended.ram} RAM · {recommended.cpu} CPU · {recommended.storage} storage · {recommended.price}/month</p></div><button type="button" onClick={()=>setChosen(recommended.name)}>Use this in request</button></div>
    </section>}
    {settings.compareEnabled&&<section>
      <div className="business-section-heading"><div><span>HOSTING COMPARISON</span><h2>11 bot plans. No confusing extras.</h2></div><label>Sort by<select value={sort} onChange={e=>setSort(e.target.value)}><option value="price">Lowest price</option><option value="memory">Most RAM</option></select></label></div>
      <div className="business-plan-grid">{plans.map(p=><PlanCard key={p.name} plan={p} featured={p.name===settings.featuredPlan} onAsk={setChosen}/>)}</div>
    </section>}
    <ContactRequest key={chosen} presetPlan={chosen} settings={settings}/>
    <section className="business-promo"><div><span>FREE ESN NANO</span><h2>Free ESN Nano included with every account — 256 MB bot server, no card, no expiry.</h2><p>Create an account and your free bot server is set up automatically.</p></div><a href="https://panel.esnoffical.com/auth/register" target="_blank" rel="noreferrer">Create your free account ↗</a></section>
  </>
}
function Partners({settings}){
  return <>
    <div className="business-section-heading"><div><span>PARTNER PROGRAM</span><h2>Grow alongside ESN.</h2><p>For server owners, creators, and communities interested in working together. Applications require human review.</p></div></div>
    <div className="business-panel-grid">
      <article className="business-tile"><span>PARTNERSHIPS</span><strong>{settings.partnerApplicationsEnabled?'Applications open':'Temporarily closed'}</strong><p>Tell us about your community, audience, and what you'd like to build together.</p></article>
      <article className="business-tile"><span>REFERRALS</span><strong>{settings.referralApplicationsEnabled?'Enquiries open':'Coming later'}</strong><p>Referral credit requires a verified qualifying purchase and staff approval.</p></article>
      <article className="business-tile"><span>REVENUE REPORTING</span><strong>Not connected</strong><p>Trackable links, conversions, and payouts require a secure referral backend.</p></article>
    </div>
    <ContactRequest presetType="Partner application" settings={settings}/>
    <p className="business-info">No referral tracking or commission payment is implied by creating a request draft.</p>
  </>
}
function Rewards({settings}){
  return <>
    <div className="business-section-heading"><div><span>CUSTOMER BENEFITS</span><h2>More reasons to stay with ESN.</h2><p>Real credits require verified purchases and secure staff approval; local activity never generates redeemable cash value.</p></div></div>
    <div className="business-panel-grid">
      <article className="business-tile"><span>REWARDS</span><strong>{settings.rewardsInfoEnabled?'Staff-reviewed':'Unavailable'}</strong><p>{settings.rewardPolicy}</p></article>
      <article className="business-tile"><span>LOYALTY LEVELS</span><strong>{settings.loyaltyInfoEnabled?'Benefits in planning':'Unavailable'}</strong><p>{settings.loyaltyPolicy}</p></article>
      <article className="business-tile"><span>YOUR HOSTING CREDITS</span><strong>Not connected</strong><p>Customer credit balances will only be shown after verified billing integration.</p></article>
    </div>
    {settings.milestoneEnabled&&(settings.milestoneMembers||settings.milestoneCustomers)&&<section className="business-milestones"><h2>ESN milestones</h2><div>{settings.milestoneMembers&&<article><strong>{settings.milestoneMembers}</strong><span>Community members (staff-supplied)</span></article>}{settings.milestoneCustomers&&<article><strong>{settings.milestoneCustomers}</strong><span>Customers (staff-supplied)</span></article>}</div></section>}
    <div className="business-action-row"><Link to="/testimonials">Read verified reviews →</Link><a href={DISCORD_HOSTING} target="_blank" rel="noreferrer">Ask about benefits ↗</a></div>
  </>
}
function Support({settings}){
  const topics=[['Getting started','/business/setup','Bot setup and startup settings'],['Hosting plans','/hosting/vps','Compare all 22 plans and buy on the panel'],['Server problems','/diagnostics','Check your browser before support'],['Service status','/status','Check public service notices'],['Account & billing','/trust','Official payments and trust guidance'],['Customer feedback','/testimonials','Read ESN reviews']]
  return <><div className="business-section-heading"><div><span>ESN SUPPORT</span><h2>Support that makes sense.</h2><p>{settings.supportMessage}</p></div></div><div className="business-feature-grid">{topics.map(([title,to,copy])=><Link key={to} className="business-feature" to={to}><strong>{title}</strong><p>{copy}</p><b>Open guide →</b></Link>)}</div><ContactRequest presetType="General support" settings={settings}/></>
}
function Setup(){
  const [runtime,setRuntime]=useState('Python')
  const [checked,setChecked]=useState([])
  const steps=SETUP_GUIDES[runtime]
  return <><div className="business-section-heading"><div><span>BOT SETUP WIZARD</span><h2>Get your first bot online.</h2><p>Simple instructions for your Pterodactyl server. Always keep your Discord token private.</p></div><label>Runtime<select value={runtime} onChange={e=>{setRuntime(e.target.value);setChecked([])}}><option>Python</option><option>Node.js</option></select></label></div><div className="business-steps">{steps.map((step,i)=><label key={step}><input type="checkbox" checked={checked.includes(i)} onChange={()=>setChecked(v=>v.includes(i)?v.filter(x=>x!==i):[...v,i])}/><span><strong>Step {i+1}</strong>{step}</span></label>)}</div><p className="business-info">{checked.length}/{steps.length} steps checked on this page. Setup is not performed remotely.</p><div className="business-action-row"><Link to="/hosting/vps">Compare hosting plans</Link><a href={DISCORD_HOSTING} target="_blank" rel="noreferrer">Get setup help ↗</a></div></>
}

export function BusinessPlatformPage({section='overview'}){
  const settings=useBusinessSettings()
  const current=SECTIONS.find(s=>s.id===section)||SECTIONS[0]
  return <div className="esn-business-page">
    <header className="business-hero"><div className="shell"><span className="eyebrow">ESN HOSTING · CUSTOMER SERVICES</span><h1>{section==='overview'?settings.headline:current.label}</h1><p>{section==='overview'?settings.introduction:'Hosting plans, support and requests, all in one place.'}</p><div className="business-hero-actions"><Link to="/business/plans">Find hosting</Link><Link to="/business/support">Talk to our team</Link></div></div></header>
    <div className="shell business-shell"><nav className="business-nav" aria-label="Business platform">{SECTIONS.map(s=><Link className={s.id===section?'active':''} key={s.id} to={s.url}>{s.label}</Link>)}</nav>{settings.maintenanceNotice&&<p className="business-warning" role="status">ESN notice: {settings.maintenanceNotice}</p>}<LocalMode/>
      {(section==='dashboard'||section==='plans'||section==='partners'||section==='support')&&<LiveBusinessCustomer section={section}/>}
      {section==='overview'&&<Overview settings={settings}/>}
      {section==='dashboard'&&(settings.customerWorkspaceEnabled?<Dashboard settings={settings}/>:<section className="business-empty"><h2>Customer workspace preview is unavailable.</h2><p>Ask ESN Hosting staff about orders and subscriptions through Discord.</p><a href={DISCORD_HOSTING} target="_blank" rel="noreferrer">Open hosting Discord →</a></section>)}
      {section==='plans'&&<Plans settings={settings}/>}
      {section==='partners'&&<Partners settings={settings}/>}
      {section==='rewards'&&<Rewards settings={settings}/>}
      {section==='support'&&<Support settings={settings}/>}
      {section==='setup'&&<Setup/>}
    </div>
  </div>
}

export function BusinessStaffControls(){
  // Parent StaffDashboardPage handles its local session gate. This is NOT a
  // secure production admin API and intentionally performs no remote mutations.
  const [settings,setSettings]=useState(readBusinessSettings)
  const drafts=useLocalRequests()
  const [audit,setAudit]=useState([])
  const [feedback,setFeedback]=useState('')
  useEffect(()=>{
    try{setAudit(JSON.parse(localStorage.getItem(BUSINESS_AUDIT_KEY)||'[]'))}catch{setAudit([])}
  },[settings])
  const field=(key,value)=>setSettings(v=>({...v,[key]:value}))
  const save=()=>{writeBusinessSettings(settings);addBusinessAudit('Saved business controls as local browser preview');setFeedback('Saved to this browser preview. These settings are NOT published globally.')};
  const reset=()=>{setSettings({...DEFAULT_BUSINESS_SETTINGS});writeBusinessSettings(DEFAULT_BUSINESS_SETTINGS);addBusinessAudit('Reset business preview defaults');setFeedback('Local business settings reset to defaults.')}
  const exportConfig=()=>{
    const blob=new Blob([JSON.stringify({schemaVersion:1,settings,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a');a.href=url;a.download='esn-business-staff-preview.json';a.click()
    URL.revokeObjectURL(url)
    addBusinessAudit('Exported business preview settings')
    setFeedback('Exported preview settings. This is not a publish or deployment action.')
  }
  const toggle=(key,label)=><label className="business-switch" key={key}><input type="checkbox" checked={Boolean(settings[key])} onChange={e=>field(key,e.target.checked)}/><span>{label}</span></label>
  const lines=[
    ['planFinderEnabled','Plan finder'],['compareEnabled','Plan comparison'],
    ['customerWorkspaceEnabled','Customer workspace preview'],['trialsEnabled','Trial enquiry program'],
    ['partnerApplicationsEnabled','Partner applications'],['referralApplicationsEnabled','Referral enquiries'],
    ['rewardsInfoEnabled','Rewards information'],['loyaltyInfoEnabled','Loyalty information'],
    ['milestoneEnabled','Community milestone display'],
  ]
  return <section className="section esn-business-staff" aria-labelledby="business-staff-title"><div className="shell">
    <div className="business-section-heading"><div><span>ESN STAFF · BUSINESS TOOLS</span><h2 id="business-staff-title">Business platform controls</h2><p>Edit the customer-facing preview, review drafts stored on this browser and prepare configuration for a future secure backend.</p></div><Link to="/business">Open customer view →</Link></div>
    <p className="business-mode"><strong>STAFF PREVIEW ONLY</strong> — The existing website staff code is not secure server-side authorization. These controls affect this browser only. They cannot charge customers, grant credits, approve real subscriptions, create servers, or publish changes for everyone.</p>
    <div className="business-staff-grid">
      <article className="business-staff-card"><h3>Programs & feature visibility</h3><div className="business-switch-grid">{lines.map(([key,label])=>toggle(key,label))}</div><div className="business-form-grid">
        <label>Featured plan<select value={settings.featuredPlan} onChange={e=>field('featuredPlan',e.target.value)}>{BOT_PLANS.map(p=><option key={p.name}>{p.name}</option>)}</select></label>
        <label>Trial plan<select value={settings.trialPlan} onChange={e=>field('trialPlan',e.target.value)}>{BOT_PLANS.map(p=><option key={p.name}>{p.name}</option>)}</select></label>
        <label>Trial duration (days)<input type="number" min="1" max="30" value={settings.trialDays} onChange={e=>field('trialDays',Math.max(1,Math.min(30,Number(e.target.value)||1)))}/></label>
      </div></article>
      <article className="business-staff-card"><h3>Homepage and support copy</h3>
        <label>Business heading<input maxLength="100" value={settings.headline} onChange={e=>field('headline',e.target.value)}/></label>
        <label>Introduction<textarea maxLength="340" value={settings.introduction} onChange={e=>field('introduction',e.target.value)}/></label>
        <label>Support message<textarea maxLength="340" value={settings.supportMessage} onChange={e=>field('supportMessage',e.target.value)}/></label>
        <label>Public maintenance information<textarea maxLength="280" value={settings.maintenanceNotice} onChange={e=>field('maintenanceNotice',e.target.value)}/></label>
      </article>
      <article className="business-staff-card"><h3>Benefits policies</h3>
        <label>Rewards policy<textarea maxLength="500" value={settings.rewardPolicy} onChange={e=>field('rewardPolicy',e.target.value)}/></label>
        <label>Loyalty policy<textarea maxLength="500" value={settings.loyaltyPolicy} onChange={e=>field('loyaltyPolicy',e.target.value)}/></label>
        <label>Confirmed community members<input maxLength="14" value={settings.milestoneMembers} onChange={e=>field('milestoneMembers',e.target.value.replace(/[^0-9]/g,''))}/></label>
        <label>Confirmed paying customers<input maxLength="14" value={settings.milestoneCustomers} onChange={e=>field('milestoneCustomers',e.target.value.replace(/[^0-9]/g,''))}/></label>
      </article>
      <article className="business-staff-card"><h3>Integration readiness</h3>
        <div className="business-integration-status">{['Discord OAuth (server verified)','Customer database','Stripe subscriptions + webhook','Pterodactyl provisioning','Referral attribution','Cross-device admin publishing'].map(x=><div key={x}><span>{x}</span><strong>NOT CONNECTED</strong></div>)}</div>
        <p>Do not enter API tokens, billing details, or Discord bot secrets here. Those belong in a privately deployed backend.</p>
      </article>
    </div>
    <div className="business-action-row"><button type="button" onClick={save}>Save local preview</button><button type="button" onClick={exportConfig}>Export settings JSON</button><button type="button" onClick={reset}>Reset preview</button></div>
    {feedback&&<p className="business-success" role="status">{feedback}</p>}
    <div className="business-section-heading"><div><span>LOCAL REQUESTS</span><h2>Request drafts on this browser</h2><p>These aren't remotely submitted orders and contain no verified payment or customer information.</p></div></div>
    {drafts.length?<div className="business-drafts">{drafts.map(d=><article key={d.id}><div><span>{d.type} · {d.status}</span><strong>{d.plan}</strong><small>{d.notes||'No details'} · {new Date(d.createdAt).toLocaleString()}</small></div><div className="business-draft-actions"><button type="button" onClick={()=>copyText(ticketMessage(d.type,d.plan,d.notes))}>Copy request</button><button type="button" onClick={()=>{writeBusinessDrafts(drafts.filter(x=>x.id!==d.id));addBusinessAudit('Deleted local draft '+d.id)}}>Remove</button></div></article>)}</div>:<p className="business-empty">No drafts exist in this browser.</p>}
    <div className="business-section-heading"><div><h2>Local activity log</h2></div></div>
    <div className="business-audit">{audit.length?audit.slice(0,10).map((x,i)=><div key={i}><span>{new Date(x.at).toLocaleString()}</span><strong>{x.message}</strong></div>):<p>No local business actions yet.</p>}</div>
  </div></section>
}
