import { useMemo, useState } from 'react'
import './domains.css'

const ROOT_DOMAIN='esnoffical.com'
const DISCORD_URL='https://discord.gg/3gxA66KZ8'
const FREE_ISSUE_BASE='https://github.com/sheldonrocks2022-cmyk/ESN-Website/issues/new'
const STAFF_HASH='645569b472b3670b547fd45aa2a626177a8fb71f722bb7c3dc07d0d670311cab'
const REQUEST_KEY='esn_hosting_requests_v1'
const PLAN_PRICES={
  free:{label:'FREE',cents:0},
  subdomain:{label:'$0.50/month',cents:50},
  custom:{label:'$1.00/month',cents:100},
  hosting:{label:'Price pending',cents:null},
}
const RESERVED=new Set(['www','api','admin','staff','store','store-ai','smp','status','support','mail','billing','domains','hosting','dns','ftp','cpanel','webmail','discord','nexus','arcade','tools','assets','cdn','static','auth','login','dashboard','root','esn','official','offical'])

async function sha256(value){
  const bytes=new TextEncoder().encode(value)
  const hash=await crypto.subtle.digest('SHA-256',bytes)
  return [...new Uint8Array(hash)].map(byte=>byte.toString(16).padStart(2,'0')).join('')
}
function cleanLabel(value){return value.toLowerCase().replace(/[^a-z0-9-]/g,'').replace(/^-+|-+$/g,'').slice(0,48)}
function validLabel(value){return /^[a-z0-9](?:[a-z0-9-]{0,46}[a-z0-9])?$/.test(value)&&!RESERVED.has(value)}
function normalizeDomain(value){return value.toLowerCase().trim().replace(/^https?:\/\//,'').replace(/\/.*$/,'').replace(/\.$/,'')}
function validDomain(value){return /^(?=.{3,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(normalizeDomain(value))}
function normalizeTarget(value){
  const raw=value.trim()
  if(!raw)return ''
  try{
    const url=new URL(/^https?:\/\//i.test(raw)?raw:'https://'+raw)
    return url.toString().replace(/\/$/,'')
  }catch{return ''}
}
function validStripeLink(value){
  try{
    const url=new URL(value.trim())
    return url.protocol==='https:'&&url.hostname==='buy.stripe.com'
  }catch{return false}
}
function freeIssueUrl(label,target){
  const host=new URL(target).hostname.toLowerCase()
  const body=[
    '<!-- ESN_FREE_SUBDOMAIN_REQUEST_V1 -->',
    'Subdomain: `'+label+'`',
    'Target: `'+host+'`',
    'Terms: I agree to the ESN free subdomain rules.',
    '',
    'I understand that ESN may remove this free subdomain if it is used for phishing, malware, impersonation, spam, or other abuse.',
  ].join('\n')
  const params=new URLSearchParams({
    title:'[FREE-SUBDOMAIN] '+label,
    body,
  })
  return FREE_ISSUE_BASE+'?'+params.toString()
}
function readRequests(){
  try{
    const value=JSON.parse(localStorage.getItem(REQUEST_KEY)||'[]')
    if(!Array.isArray(value))return []
    return value.slice(0,25).map(request=>({
      paymentLink:'',
      priceLabel:PLAN_PRICES[request.type]?.label||'Price pending',
      status:'READY FOR STAFF REVIEW',
      ...request,
    }))
  }catch{return []}
}
function saveRequests(value){
  try{localStorage.setItem(REQUEST_KEY,JSON.stringify(value.slice(0,25)))}catch{}
}
async function copyText(value){
  try{await navigator.clipboard.writeText(value);return true}catch{}
  try{
    const area=document.createElement('textarea')
    area.value=value
    area.style.position='fixed'
    area.style.opacity='0'
    document.body.appendChild(area)
    area.select()
    const ok=document.execCommand('copy')
    area.remove()
    return ok
  }catch{return false}
}
function requestText(request){
  const lines=[
    'ESN HOSTING ACTIVATION REQUEST',
    'Request ID: '+request.id,
    'Type: '+request.typeLabel,
    'Price: '+request.priceLabel,
    'Status: '+request.status,
    'Contact: '+request.contact,
  ]
  if(request.hostname)lines.push('Requested ESN subdomain: '+request.hostname)
  if(request.customDomain)lines.push('Custom domain: '+request.customDomain)
  if(request.target)lines.push('Current website / destination: '+request.target)
  if(request.details)lines.push('Project details: '+request.details)
  if(request.paymentLink)lines.push('Stripe checkout: '+request.paymentLink)
  lines.push('Activation: Manual ESN staff review')
  lines.push('Nameserver change requested: NO')
  return lines.join('\n')
}
function paymentText(request){
  const destination=request.hostname||request.customDomain||'your ESN hosting request'
  return [
    'ESN Hosting payment approved',
    'Request: '+request.id,
    'Service: '+request.typeLabel,
    'Address: '+destination,
    'Price: '+request.priceLabel,
    'Stripe checkout: '+request.paymentLink,
    '',
    'After payment, send ESN staff confirmation so the request can be marked Paid and activated.',
  ].join('\n')
}

export default function DomainsPage(){
  const [mode,setMode]=useState('free')
  const [label,setLabel]=useState('')
  const [customDomain,setCustomDomain]=useState('')
  const [target,setTarget]=useState('')
  const [contact,setContact]=useState('')
  const [details,setDetails]=useState('')
  const [eligibility,setEligibility]=useState(null)
  const [result,setResult]=useState(null)
  const [requests,setRequests]=useState(readRequests)
  const [copied,setCopied]=useState('')
  const [staff,setStaff]=useState(false)
  const [showStaff,setShowStaff]=useState(false)
  const [staffCode,setStaffCode]=useState('')
  const [staffError,setStaffError]=useState('')
  const [paymentInputs,setPaymentInputs]=useState({})

  const subdomain=useMemo(()=>label?cleanLabel(label)+'.'+ROOT_DOMAIN:'yourname.'+ROOT_DOMAIN,[label])
  const selectedPlan=PLAN_PRICES[mode]

  const persistRequests=next=>{
    setRequests(next)
    saveRequests(next)
  }

  const updateRequest=(id,patch)=>{
    persistRequests(requests.map(request=>request.id===id?{...request,...patch}:request))
  }

  const checkName=()=>{
    const clean=cleanLabel(label)
    setLabel(clean)
    setResult(null)
    if(!clean){setEligibility({ok:false,title:'ENTER A NAME',copy:'Choose the subdomain you want first.'});return}
    if(RESERVED.has(clean)){setEligibility({ok:false,title:'RESERVED BY ESN',copy:'That name is protected and cannot be rented.'});return}
    if(!validLabel(clean)){setEligibility({ok:false,title:'INVALID NAME',copy:'Use 1–48 lowercase letters, numbers, or hyphens.'});return}
    setEligibility({ok:true,title:'NAME FORMAT OK',copy:mode==='free'?'Spaceship availability is re-checked automatically before DNS creation.':'Final availability is confirmed manually by ESN staff before payment.'})
  }

  const buildRequest=event=>{
    event.preventDefault()
    setResult(null)
    const clean=cleanLabel(label)
    const hostname=clean?clean+'.'+ROOT_DOMAIN:''
    const domain=normalizeDomain(customDomain)
    const destination=normalizeTarget(target)

    if((mode==='free'||mode==='subdomain'||mode==='hosting')&&!validLabel(clean)){
      setResult({ok:false,message:'Choose a valid ESN subdomain first.'});return
    }
    if(mode==='custom'&&!validDomain(domain)){
      setResult({ok:false,message:'Enter a valid custom domain, such as yourbusiness.com.'});return
    }
    if((mode==='free'||mode==='subdomain'||mode==='custom')&&!destination){
      setResult({ok:false,message:'Enter the website or hosting destination ESN should connect.'});return
    }
    if(mode==='hosting'&&!details.trim()){
      setResult({ok:false,message:'Tell ESN what website or project you want hosted.'});return
    }
    if(mode!=='free'&&!contact.trim()){
      setResult({ok:false,message:'Enter a Discord username or email so ESN staff can identify the request.'});return
    }

    if(mode==='free'){
      const issueUrl=freeIssueUrl(clean,destination)
      setResult({
        ok:true,
        free:true,
        issueUrl,
        message:'Your free subdomain request is ready. Submit the pre-filled GitHub request and the ESN automation will check Spaceship DNS and create the CNAME automatically.',
        hostname:clean+'.'+ROOT_DOMAIN,
      })
      return
    }

    const request={
      id:'ESN-'+Date.now().toString(36).toUpperCase(),
      type:mode,
      typeLabel:mode==='subdomain'?'ESN Subdomain Rental':mode==='custom'?'Custom Domain Connection':'ESN Web Hosting Waitlist',
      priceLabel:selectedPlan.label,
      hostname:(mode==='subdomain'||mode==='hosting')?hostname:'',
      customDomain:mode==='custom'?domain:'',
      target:mode==='hosting'?'':destination,
      contact:contact.trim().slice(0,120),
      details:details.trim().slice(0,600),
      createdAt:new Date().toISOString(),
      paymentLink:'',
      status:'READY FOR STAFF REVIEW',
    }
    const next=[request,...requests].slice(0,25)
    persistRequests(next)
    setResult({ok:true,request,message:mode==='hosting'?'Waitlist request built. Copy it and send it to ESN staff in Discord.':'Request built. Staff will verify it first, then send the Stripe checkout link.'})
  }

  const copyRequest=async request=>{
    const ok=await copyText(requestText(request))
    setCopied(ok?request.id:'error')
    window.setTimeout(()=>setCopied(''),1800)
  }

  const copyPayment=async request=>{
    const ok=await copyText(paymentText(request))
    setCopied(ok?'pay-'+request.id:'error')
    window.setTimeout(()=>setCopied(''),1800)
  }

  const attachPayment=(request)=>{
    const link=(paymentInputs[request.id]||'').trim()
    if(!validStripeLink(link)){
      setPaymentInputs(current=>({...current,[request.id]:link}))
      return
    }
    updateRequest(request.id,{paymentLink:link,status:'AWAITING PAYMENT'})
  }

  const unlockStaff=async event=>{
    event.preventDefault();setStaffError('')
    try{
      if(await sha256(staffCode.trim())!==STAFF_HASH){setStaffError('ACCESS CODE REJECTED');return}
      setStaff(true);setShowStaff(false);setStaffCode('')
    }catch{setStaffError('SECURE CHECK UNAVAILABLE')}
  }

  return <>
    <section className="page-hero domains-hero"><div className="shell page-hero-inner">
      <div className="page-hero-copy">
        <span className="eyebrow">ESN HOSTING // FREE SUBDOMAINS</span>
        <h1>Get a free ESN subdomain — automatically.</h1>
        <p>Choose a name like <strong>yourname.{ROOT_DOMAIN}</strong>. ESN's GitHub automation securely checks and creates the DNS record through the official Spaceship API. Paid subdomain and custom-domain options are still available too.</p>
      </div>
      <div className="page-hero-mark"><span>DNS</span><small>AUTO + SPACESHIP API</small></div>
    </div></section>

    <section className="section"><div className="shell">
      <div className="domains-system-banner ready">
        <div><span>ESN HOSTING STATUS</span><strong>FREE SUBDOMAIN AUTOMATION INSTALLED</strong><small>Free requests use GitHub + Spaceship API automation. Paid options still use the staff payment flow.</small></div>
        <button onClick={()=>setShowStaff(true)}>STAFF</button>
      </div>

      <div className="domains-safety-strip">
        <strong>NO NAMESERVER CHANGE</strong>
        <span>ESN stays on Spaceship DNS. Free subdomains create only their own CNAME record — the main ESN nameservers are never changed.</span>
      </div>

      <div className="domains-payment-flow" aria-label="ESN Hosting payment workflow">
        {['STAFF REVIEW','AWAITING PAYMENT','PAID','ACTIVE'].map((step,index)=><div key={step}><b>{String(index+1).padStart(2,'0')}</b><span>{step}</span></div>)}
      </div>

      <div className="domains-plan-grid four">
        <button className={mode==='free'?'active':''} onClick={()=>{setMode('free');setResult(null)}}>
          <span>FREE ESN SUBDOMAIN</span><strong>FREE</strong><p>One automatic subdomain per GitHub account. No payment. GitHub confirmation is required to prevent anonymous DNS abuse.</p>
        </button>
        <button className={mode==='subdomain'?'active':''} onClick={()=>{setMode('subdomain');setResult(null)}}>
          <span>ESN SUBDOMAIN RENTAL</span><strong>$0.50 / MONTH</strong><p>Choose an address like <b>yourname.{ROOT_DOMAIN}</b> with the existing staff-supported paid flow.</p>
        </button>
        <button className={mode==='custom'?'active':''} onClick={()=>{setMode('custom');setResult(null)}}>
          <span>CONNECT YOUR DOMAIN</span><strong>$1.00 / MONTH</strong><p>Use a domain you already own. ESN staff verifies the destination and gives you the exact DNS record to add.</p>
        </button>
        <button className={mode==='hosting'?'active':''} onClick={()=>{setMode('hosting');setResult(null)}}>
          <span>FULL ESN WEB HOSTING</span><strong>PRICE PENDING</strong><p>Join the waitlist now. Paid file hosting activates after the ESN-owned hosting server is ready.</p>
        </button>
      </div>

      <div className="domains-builder">
        <div className="domains-preview">
          <span>{mode==='custom'?'CUSTOM DOMAIN':mode==='hosting'?'FUTURE ESN HOST':mode==='free'?'FREE ESN SUBDOMAIN':'YOUR ESN ADDRESS'}</span>
          <strong>{mode==='custom'?(normalizeDomain(customDomain)||'yourbusiness.com'):subdomain}</strong>
          <small>{mode==='hosting'?'Reserved request for the upcoming ESN-owned hosting server.':mode==='free'?'Free • automatic DNS creation after GitHub confirmation.':selectedPlan.label+' • Stripe checkout is provided after staff approval.'}</small>
        </div>

        <form onSubmit={buildRequest}>
          {(mode==='free'||mode==='subdomain'||mode==='hosting')&&<>
            <label>CHOOSE ESN SUBDOMAIN<div className="domains-domain-input"><input value={label} onChange={e=>{setLabel(cleanLabel(e.target.value));setEligibility(null)}} placeholder="yourname"/><span>.{ROOT_DOMAIN}</span></div></label>
            <button type="button" className="domains-check" onClick={checkName} disabled={!label}>CHECK NAME</button>
            {eligibility&&<div className={'domains-availability '+(eligibility.ok?'yes':'no')}><strong>{eligibility.title}</strong><span>{eligibility.copy}</span></div>}
          </>}

          {mode==='custom'&&<label>YOUR CUSTOM DOMAIN<input value={customDomain} onChange={e=>setCustomDomain(e.target.value)} placeholder="yourbusiness.com"/></label>}
          {(mode==='free'||mode==='subdomain'||mode==='custom')&&<label>{mode==='free'?'TARGET HOST / WEBSITE':'CURRENT WEBSITE / DESTINATION'}<input value={target} onChange={e=>setTarget(e.target.value)} placeholder={mode==='free'?'https://username.github.io':'https://your-current-site.com'}/></label>}
          {mode==='hosting'&&<label>WHAT DO YOU WANT ESN TO HOST?<textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="Describe the site, files, framework, storage needs, or project."/></label>}
          {mode!=='hosting'&&mode!=='free'&&<label>NOTES <textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="Optional details for ESN staff."/></label>}
          {mode!=='free'&&<label>CONTACT<input value={contact} onChange={e=>setContact(e.target.value)} placeholder="Discord username or email"/></label>}
          {mode==='free'&&<div className="domains-free-rules"><strong>FREE SUBDOMAIN RULES</strong><span>One active free subdomain per GitHub account. The target must be a real hostname. Phishing, malware, impersonation, spam, and abuse are not allowed.</span></div>}

          <div className="domains-order-summary">
            <div><span>PRICE</span><strong>{selectedPlan.label}</strong></div>
            <div><span>PAYMENT</span><strong>{mode==='free'?'None':mode==='hosting'?'Not open yet':'Stripe after approval'}</strong></div>
            <div><span>ACTIVATION</span><strong>{mode==='free'?'Automatic via Spaceship API':'After payment + DNS check'}</strong></div>
          </div>

          <button className="domains-submit" type="submit">{mode==='free'?'CREATE FREE SUBDOMAIN':mode==='hosting'?'JOIN HOSTING WAITLIST':'SUBMIT FOR STAFF REVIEW'}</button>
          {result&&<div className={'domains-result '+(result.ok?'ok':'error')}>
            <strong>{result.ok?'REQUEST READY':'FIX REQUEST'}</strong>
            <p>{result.message}</p>
            {result.ok&&result.free&&<>
              <small>{result.hostname} • FREE • one per GitHub account</small>
              <div className="domains-result-actions">
                <a href={result.issueUrl} target="_blank" rel="noreferrer">CONTINUE TO GITHUB →</a>
              </div>
              <small>Submit the pre-filled GitHub issue. The workflow will re-check the name and create the Spaceship CNAME automatically if it is available.</small>
            </>}
            {result.ok&&!result.free&&<>
              <small>Request ID: {result.request.id} • {result.request.priceLabel}</small>
              <div className="domains-result-actions">
                <button type="button" onClick={()=>copyRequest(result.request)}>{copied===result.request.id?'COPIED ✓':'COPY REQUEST'}</button>
                <a href={DISCORD_URL} target="_blank" rel="noreferrer">OPEN ESN DISCORD ↗</a>
              </div>
            </>}
          </div>}
        </form>
      </div>
    </div></section>

    <section className="section dark-section"><div className="shell">
      <div className="section-heading"><div><span className="eyebrow">FREE SUBDOMAIN FLOW</span><h2>Pick it. Confirm it. ESN creates it.</h2></div></div>
      <div className="domains-steps">
        <article><span>01</span><h3>Choose</h3><p>Enter an available-looking name and the hostname your subdomain should point to.</p></article>
        <article><span>02</span><h3>Confirm</h3><p>The site opens one pre-filled GitHub request. Your GitHub identity prevents completely anonymous DNS creation.</p></article>
        <article><span>03</span><h3>Create</h3><p>GitHub Actions checks the ESN reserved list and live Spaceship DNS, then creates the CNAME automatically.</p></article>
        <article><span>04</span><h3>Connect</h3><p>Add the new ESN hostname as a custom domain at your destination host so HTTPS and the website can load correctly.</p></article>
      </div>
    </div></section>

    <section className="section"><div className="shell">
      <div className="section-heading"><div><span className="eyebrow">PAID HOSTING FLOW</span><h2>Approval first. Payment second. Activation last.</h2></div></div>
      <div className="domains-steps">
        <article><span>01</span><h3>Request</h3><p>Customer chooses a plan and sends the generated request to ESN staff in Discord.</p></article>
        <article><span>02</span><h3>Approve</h3><p>Staff confirms the requested name, destination, and DNS setup before asking for money.</p></article>
        <article><span>03</span><h3>Pay</h3><p>Staff sends the verified Stripe checkout link. Payment is manually confirmed in Stripe during the beta.</p></article>
        <article><span>04</span><h3>Activate</h3><p>After payment, staff completes the one-record DNS setup, verifies HTTPS, and marks the request Active.</p></article>
      </div>
    </div></section>

    {requests.length>0&&<section className="section"><div className="shell">
      <div className="section-heading"><div><span className="eyebrow">THIS DEVICE</span><h2>Your recent hosting requests.</h2><p>These are saved only in this browser. The Discord handoff is still required because the current ESN site has no shared hosting database.</p></div></div>
      <div className="domains-request-list">
        {requests.slice(0,5).map(request=><article key={request.id}>
          <div><span>{request.typeLabel}</span><strong>{request.hostname||request.customDomain||'ESN Hosting'}</strong><small>{request.id} • {request.priceLabel} • {request.status}</small></div>
          <div className="domains-request-actions">
            {request.paymentLink&&request.status==='AWAITING PAYMENT'&&<a href={request.paymentLink} target="_blank" rel="noreferrer">PAY WITH STRIPE ↗</a>}
            <button type="button" onClick={()=>copyRequest(request)}>{copied===request.id?'COPIED ✓':'COPY'}</button>
          </div>
        </article>)}
      </div>
    </div></section>}

    {staff&&<section className="section"><div className="shell">
      <div className="section-heading"><div><span className="eyebrow">STAFF HOSTING CONTROL</span><h2>Payment + activation controls.</h2><p>Stripe payment status is manual in this beta. Never mark a request Paid unless the payment is visible in the official ESN Stripe account.</p></div></div>

      <div className="domains-staff-grid">
        <article><span>STEP 1</span><strong>Verify request</strong><p>Confirm the requested hostname or custom domain can be supported safely.</p></article>
        <article><span>STEP 2</span><strong>Attach Stripe</strong><p>Create the correct recurring Stripe Payment Link, then paste the real buy.stripe.com link below.</p></article>
        <article><span>STEP 3</span><strong>Confirm payment</strong><p>Check Stripe itself before moving a request from Awaiting Payment to Paid.</p></article>
        <article><span>STEP 4</span><strong>Activate</strong><p>Complete DNS/HTTPS and only then mark the request Active.</p></article>
      </div>

      <div className="domains-staff-requests">
        {requests.length===0?<div className="domains-staff-empty">No local hosting requests on this device yet.</div>:requests.map(request=><article key={request.id}>
          <div className="domains-staff-request-head">
            <div><span>{request.id}</span><strong>{request.hostname||request.customDomain||request.typeLabel}</strong><small>{request.typeLabel} • {request.priceLabel}</small></div>
            <em className={'status-'+request.status.toLowerCase().replaceAll(' ','-')}>{request.status}</em>
          </div>

          {request.type!=='hosting'&&<>
            <label>STRIPE PAYMENT LINK
              <input
                value={paymentInputs[request.id]??request.paymentLink??''}
                onChange={e=>setPaymentInputs(current=>({...current,[request.id]:e.target.value}))}
                placeholder="https://buy.stripe.com/..."
              />
            </label>
            {(paymentInputs[request.id]||request.paymentLink)&&!validStripeLink(paymentInputs[request.id]??request.paymentLink??'')&&<small className="domains-payment-warning">Only an official https://buy.stripe.com/ link can be attached.</small>}
            <div className="domains-staff-actions">
              <button type="button" onClick={()=>attachPayment(request)}>APPROVE + ATTACH STRIPE</button>
              {request.paymentLink&&<button type="button" onClick={()=>copyPayment(request)}>{copied==='pay-'+request.id?'PAYMENT MESSAGE COPIED ✓':'COPY PAYMENT MESSAGE'}</button>}
              {request.paymentLink&&<a href={request.paymentLink} target="_blank" rel="noreferrer">OPEN CHECKOUT ↗</a>}
            </div>
          </>}

          <div className="domains-status-controls">
            <button type="button" onClick={()=>updateRequest(request.id,{status:'READY FOR STAFF REVIEW'})}>STAFF REVIEW</button>
            {request.type!=='hosting'&&<button type="button" disabled={!request.paymentLink} onClick={()=>updateRequest(request.id,{status:'AWAITING PAYMENT'})}>AWAITING PAYMENT</button>}
            {request.type!=='hosting'&&<button type="button" disabled={!request.paymentLink} onClick={()=>updateRequest(request.id,{status:'PAID'})}>MARK PAID</button>}
            {request.type!=='hosting'&&<button type="button" disabled={request.status!=='PAID'&&request.status!=='ACTIVE'} onClick={()=>updateRequest(request.id,{status:'ACTIVE'})}>MARK ACTIVE</button>}
            {request.type==='hosting'&&<button type="button" onClick={()=>updateRequest(request.id,{status:'WAITLISTED'})}>WAITLISTED</button>}
          </div>
        </article>)}
      </div>

      <div className="domains-staff-note"><strong>LOCAL REQUESTS ON THIS DEVICE: {requests.length}</strong><span>These statuses do not sync between customer and staff devices yet. Discord + the official Stripe dashboard remain the source of truth during the manual beta.</span></div>
    </div></section>}

    {showStaff&&<div className="domains-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowStaff(false)}}><form className="domains-modal" onSubmit={unlockStaff}><span>ESN HOSTING // STAFF</span><h2>Unlock hosting controls.</h2><input type="password" inputMode="numeric" autoComplete="off" value={staffCode} onChange={e=>setStaffCode(e.target.value)} placeholder="STAFF ACCESS CODE"/><button type="submit">UNLOCK</button>{staffError&&<strong>{staffError}</strong>}<button type="button" className="cancel" onClick={()=>setShowStaff(false)}>CANCEL</button></form></div>}
  </>
}
