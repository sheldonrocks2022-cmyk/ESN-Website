/**
 * Secure remote business interface. It intentionally does nothing unless the
 * public, non-secret VITE_ESN_API_BASE_URL is configured at build time.
 */
import {useEffect,useState} from 'react'
import {BOT_PLANS} from './Hosting'
import {DISCORD_HOSTING} from './businessPlatformData'

const URL_BASE=String(import.meta.env.VITE_ESN_API_BASE_URL||'').replace(/\/+$/,'')
const ENABLED=URL_BASE.startsWith('https://')&&/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(URL_BASE)
const TYPES=['Hosting order','Server upgrade','Free trial','Partner application','Referral enquiry','Customer review','General support']
const SAFE_PUBLIC_KEYS=new Set(['headline','introduction','featuredPlan','supportMessage','maintenanceNotice','trialPlan','trialDays','planFinderEnabled','compareEnabled','customerWorkspaceEnabled','trialsEnabled','partnerApplicationsEnabled','referralApplicationsEnabled','rewardsInfoEnabled','loyaltyInfoEnabled','milestoneEnabled','milestoneMembers','milestoneCustomers','rewardPolicy','loyaltyPolicy'])

export const businessApiEnabled=()=>ENABLED

async function request(path,method='GET',payload){
  if(!ENABLED)throw Error('Secure ESN business service is not connected to this website.')
  const headers={}
  if(payload!==undefined)headers['Content-Type']='application/json'
  if(method!=='GET'){
    const csrf=await fetch(URL_BASE+'/v1/session/csrf',{credentials:'include',cache:'no-store'})
    if(!csrf.ok)throw Error(csrf.status===401?'Sign in with Discord first.':'Unable to verify your secure session.')
    const json=await csrf.json()
    headers['X-ESN-CSRF']=json.csrf
  }
  const res=await fetch(URL_BASE+path,{
    method,credentials:'include',cache:'no-store',headers,
    ...(payload!==undefined?{body:JSON.stringify(payload)}:{})
  })
  let data={}
  try{data=await res.json()}catch{}
  if(!res.ok)throw Error(String(data.error||'Request failed').replaceAll('_',' ').slice(0,180))
  return data
}
export function loginUrl(){return ENABLED?URL_BASE+'/v1/auth/discord/start':null}
export async function getPublicBusiness(){
  return ENABLED?request('/v1/public'):null
}
export function useEsnIdentity(){
  const [state,setState]=useState({loading:ENABLED,user:null,error:null,enabled:ENABLED})
  useEffect(()=>{
    if(!ENABLED)return
    let mounted=true
    request('/v1/me').then(data=>{
      if(mounted)setState({loading:false,enabled:true,user:data.user,error:null})
    }).catch(e=>{
      if(mounted)setState({loading:false,enabled:true,user:null,error:String(e.message)})
    })
    return()=>{mounted=false}
  },[])
  return state
}
export function LiveBusinessCustomer({section='dashboard'}){
  const identity=useEsnIdentity()
  const [orders,setOrders]=useState([])
  const [requests,setRequests]=useState([])
  const [publicData,setPublicData]=useState(null)
  const [type,setType]=useState('Hosting order')
  const [plan,setPlan]=useState('Pro')
  const [notes,setNotes]=useState('')
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)
  useEffect(()=>{
    if(!ENABLED)return
    let mounted=true
    getPublicBusiness().then(x=>{if(mounted)setPublicData(x)}).catch(()=>{})
    return()=>{mounted=false}
  },[])
  const refresh=async()=>{
    if(!identity.user)return
    try{
      const [o,r]=await Promise.all([request('/v1/orders'),request('/v1/requests')])
      setOrders(o.orders||[]);setRequests(r.requests||[])
    }catch(e){setMessage(e.message)}
  }
  useEffect(()=>{
    if(identity.user)refresh()
  },[identity.user?.id])
  const submit=async()=>{
    setBusy(true);setMessage('')
    try{
      const item=await request('/v1/requests','POST',{kind:type,plan,notes})
      await refresh()
      setMessage('Request '+item.id+' saved on ESN’s secure server for staff review. No payment or server change was made.')
      setNotes('')
    }catch(e){setMessage(e.message)}finally{setBusy(false)}
  }
  const checkout=async()=>{
    setBusy(true);setMessage('')
    try{
      const r=await request('/v1/checkout','POST',{plan})
      const redirect=new URL(r.checkoutUrl)
      if(redirect.origin!=='https://checkout.stripe.com')throw Error('Unrecognized checkout destination')
      window.location.assign(r.checkoutUrl)
    }catch(e){setMessage(e.message);setBusy(false)}
  }
  const portal=async()=>{
    setBusy(true);setMessage('')
    try{
      const r=await request('/v1/billing/portal','POST',{})
      const redirect=new URL(r.portalUrl)
      if(redirect.origin!=='https://billing.stripe.com')throw Error('Unrecognized billing destination')
      window.location.assign(r.portalUrl)
    }catch(e){setMessage(e.message);setBusy(false)}
  }
  if(!ENABLED)return <section className="business-live"><div><span>SECURE ACCOUNTS</span><h2>Account connections are not enabled yet.</h2><p>Our customer services are available through the official Discord ticket system. No billing or server information is simulated.</p><a href={DISCORD_HOSTING} target="_blank" rel="noreferrer">Contact ESN staff ↗</a></div></section>
  return <section className="business-live" aria-labelledby="business-account-heading">
    <div className="business-section-heading"><div><span>SECURE ESN ACCOUNT</span><h2 id="business-account-heading">Your hosting account</h2><p>Only verified Discord sessions can see real orders and saved requests.</p></div></div>
    {identity.loading?<p>Checking your session…</p>:!identity.user?
      <div className="business-live-login"><p>Sign in using Discord to check your ESN orders, submit requests, or start a secure subscription checkout.</p><a href={loginUrl()}>Continue with Discord →</a></div>
      :<>
        <div className="business-live-profile"><div><strong>Signed in as {identity.user.name}</strong><span>{identity.user.staff?'Verified ESN staff':'Customer account'}</span></div><button type="button" onClick={async()=>{try{await request('/v1/auth/logout','POST');window.location.reload()}catch(e){setMessage(e.message)}}}>Sign out</button></div>
        <div className="business-live-columns">
          <article className="business-live-card"><h3>Your verified orders</h3><p>Subscription status comes from signed Stripe events, never a redirect alone.</p>
            {orders.length?orders.map(x=><div className="business-live-record" key={x.id}><strong>ESN {x.plan}</strong><span>{x.status.replaceAll('_',' ')}</span><small>{new Date(x.created).toLocaleDateString()}</small></div>):<p>No verified orders yet.</p>}
            {orders.some(x=>['paid','active','past_due','canceled'].includes(x.status))&&publicData?.integrations?.stripe&&
              <button type="button" disabled={busy} onClick={portal}>Manage billing securely with Stripe →</button>}
          </article>
          <article className="business-live-card"><h3>Your staff requests</h3><p>Requests here are saved securely for ESN staff review.</p>
            {requests.length?requests.map(x=><div className="business-live-record" key={x.id}><strong>{x.kind}</strong><span>{x.status}</span><small>{x.plan||'General'}</small></div>):<p>No submitted staff requests yet.</p>}
          </article>
        </div>
        <div className="business-live-card"><h3>Submit a verified request</h3>
          <div className="business-form-grid">
            <label>Request type<select value={type} onChange={e=>setType(e.target.value)}>{TYPES.map(x=><option key={x}>{x}</option>)}</select></label>
            <label>Hosting plan<select value={plan} onChange={e=>setPlan(e.target.value)}>{BOT_PLANS.map(x=><option key={x.name}>{x.name}</option>)}</select></label>
            <label className="wide">Details (no passwords or payment information)<textarea maxLength={500} value={notes} onChange={e=>setNotes(e.target.value)}/></label>
          </div>
          <div className="business-action-row"><button type="button" disabled={busy} onClick={submit}>Submit to ESN staff</button>
          {publicData?.integrations?.stripe&&<button type="button" disabled={busy} onClick={checkout}>Secure monthly checkout for ESN {plan}</button>}</div>
          {!publicData?.integrations?.stripe&&<p>Online recurring billing is not configured. Please open an official ticket to purchase hosting.</p>}
        </div>
      </>}
    {message&&<p role="status" className="business-info">{message}</p>}
  </section>
}
export function LiveBusinessStaff(){
  const identity=useEsnIdentity()
  const [data,setData]=useState(null)
  const [edit,setEdit]=useState(null)
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const reload=async()=>{
    if(!identity.user?.staff)return
    try{
      const d=await request('/v1/staff/overview')
      setData(d);setEdit(d.settings)
    }catch(e){setMessage(e.message)}
  }
  useEffect(()=>{if(identity.user?.staff)reload()},[identity.user?.staff])
  const change=(key,value)=>setEdit(old=>({...old,[key]:value}))
  const save=async()=>{
    setBusy(true);setMessage('')
    try{
      const changed=Object.fromEntries(Object.entries(edit).filter(([key])=>SAFE_PUBLIC_KEYS.has(key)))
      await request('/v1/staff/settings','PATCH',changed)
      setMessage('Published globally through the authenticated ESN API.')
      await reload()
    }catch(e){setMessage(e.message)}finally{setBusy(false)}
  }
  const decision=async(id,status)=>{
    setBusy(true);setMessage('')
    try{await request('/v1/staff/requests/'+id,'PATCH',{status});await reload();setMessage('Request updated on secure server.')}
    catch(e){setMessage(e.message)}finally{setBusy(false)}
  }
  const provision=async(id)=>{
    if(!window.confirm('Provision this VERIFIED paid order on ESN Pterodactyl? This creates a real server and uses a configured allocation.'))return
    setBusy(true);setMessage('')
    try{await request('/v1/staff/orders/'+id+'/provision','POST',{});await reload();setMessage('Server provisioning completed successfully.')}
    catch(e){setMessage(e.message)}finally{setBusy(false)}
  }
  return <section className="section esn-business-staff" aria-labelledby="live-admin-title"><div className="shell">
    <div className="business-section-heading"><div><span>SECURE BUSINESS MANAGEMENT</span><h2 id="live-admin-title">Authenticated ESN staff dashboard</h2><p>Unlike the old browser-only controls, these actions require Discord login and a server-side staff allowlist.</p></div></div>
    {!ENABLED?<p className="business-mode">Backend not connected. No remote administration is possible until the secure VPS API is configured and deployed.</p>
      :identity.loading?<p>Checking Discord staff identity…</p>
      :!identity.user?<div className="business-live-login"><p>Sign in using your ESN staff Discord account. The backend separately checks your Discord user ID.</p><a href={loginUrl()}>Staff sign in with Discord →</a></div>
      :!identity.user.staff?<p className="business-mode">This Discord account is not on the backend staff allowlist. No administrative records were returned.</p>
      :!data?<p>Loading authorized staff records…</p>:<>
        <div className="business-integration-status business-live-status">{Object.entries(data.integrations).map(([k,v])=><div key={k}><span>{k}</span><strong>{v?'CONNECTED':'NOT CONNECTED'}</strong></div>)}</div>
        <div className="business-live-card"><h3>Publish business settings</h3><p>Changes in this section are stored in the shared database and shown to all visitors when the backend is connected.</p>
          {edit&&<>
            <div className="business-form-grid">
              <label>Public heading<input value={edit.headline||''} maxLength={120} onChange={e=>change('headline',e.target.value)}/></label>
              <label>Featured plan<select value={edit.featuredPlan||'Pro'} onChange={e=>change('featuredPlan',e.target.value)}>{BOT_PLANS.map(x=><option key={x.name}>{x.name}</option>)}</select></label>
              <label className="wide">Homepage introduction<textarea maxLength={500} value={edit.introduction||''} onChange={e=>change('introduction',e.target.value)}/></label>
              <label className="wide">Support message<textarea maxLength={500} value={edit.supportMessage||''} onChange={e=>change('supportMessage',e.target.value)}/></label>
              <label className="wide">Maintenance notice<textarea maxLength={120} value={edit.maintenanceNotice||''} onChange={e=>change('maintenanceNotice',e.target.value)}/></label>
              <label>Trial plan<select value={edit.trialPlan||'Plus'} onChange={e=>change('trialPlan',e.target.value)}>{BOT_PLANS.map(x=><option key={x.name}>{x.name}</option>)}</select></label>
              <label>Trial days<input type="number" min="1" max="30" value={edit.trialDays||7} onChange={e=>change('trialDays',Number(e.target.value))}/></label>
              <label>Confirmed community members<input value={edit.milestoneMembers||''} onChange={e=>change('milestoneMembers',e.target.value)}/></label>
              <label>Confirmed customers<input value={edit.milestoneCustomers||''} onChange={e=>change('milestoneCustomers',e.target.value)}/></label>
            </div>
            <div className="business-live-switches">{Object.entries(edit).filter(([k,v])=>typeof v==='boolean'&&SAFE_PUBLIC_KEYS.has(k)).map(([k,v])=><label key={k}><input type="checkbox" checked={v} onChange={e=>change(k,e.target.checked)}/>{k.replace(/([A-Z])/g,' $1')}</label>)}</div>
            <div className="business-action-row"><button type="button" disabled={busy} onClick={save}>Publish settings to all visitors</button></div>
          </>}
        </div>
        <div className="business-live-card"><h3>Customer requests ({data.requests.length})</h3><div className="business-live-table">{data.requests.map(item=><article key={item.id}><div><strong>{item.kind}</strong><span>{item.username} · ESN {item.plan||'general'} · {item.status}</span><small>{item.notes||'No notes'}</small></div><div className="business-draft-actions">{item.status==='pending'&&<><button disabled={busy} onClick={()=>decision(item.id,'approved')}>Approve</button><button disabled={busy} onClick={()=>decision(item.id,'rejected')}>Reject</button></>}{item.status==='approved'&&<button disabled={busy} onClick={()=>decision(item.id,'completed')}>Complete</button>}</div></article>)}</div></div>
        <div className="business-live-card"><h3>Stripe-verified orders ({data.orders.length})</h3><p>Orders only become paid after a signed Stripe webhook. Server provisioning is a separate staff-confirmed action.</p><div className="business-live-table">{data.orders.map(item=><article key={item.id}><div><strong>ESN {item.plan} — {item.status}</strong><span>{item.username} · {item.id.slice(0,8)}</span></div>{['paid','provision_error'].includes(item.status)&&<button type="button" disabled={busy||!data.integrations.provisioning} onClick={()=>provision(item.id)}>Provision verified order</button>}</article>)}</div></div>
        <div className="business-live-card"><h3>Server-side staff audit</h3><div className="business-live-table">{data.audit.slice(0,30).map((a,i)=><article key={i}><div><strong>{a.event}</strong><span>{a.actor} · {a.at}</span><small>{a.target}</small></div></article>)}</div></div>
      </>}
    {message&&<p className="business-info" role="status">{message}</p>}
  </div></section>
}
