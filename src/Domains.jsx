import { useMemo, useState } from 'react'
import './domains.css'

const ROOT_DOMAIN='esnoffical.com'
const DISCORD_URL='https://discord.gg/3gxA66KZ8'
const STAFF_HASH='645569b472b3670b547fd45aa2a626177a8fb71f722bb7c3dc07d0d670311cab'
const REQUEST_KEY='esn_hosting_requests_v1'
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
function readRequests(){
  try{
    const value=JSON.parse(localStorage.getItem(REQUEST_KEY)||'[]')
    return Array.isArray(value)?value.slice(0,25):[]
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
    'Contact: '+request.contact,
  ]
  if(request.hostname)lines.push('Requested ESN subdomain: '+request.hostname)
  if(request.customDomain)lines.push('Custom domain: '+request.customDomain)
  if(request.target)lines.push('Current website / destination: '+request.target)
  if(request.details)lines.push('Project details: '+request.details)
  lines.push('Activation: Manual ESN staff review')
  lines.push('Nameserver change requested: NO')
  return lines.join('\n')
}

export default function DomainsPage(){
  const [mode,setMode]=useState('subdomain')
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

  const subdomain=useMemo(()=>label?cleanLabel(label)+'.'+ROOT_DOMAIN:'yourname.'+ROOT_DOMAIN,[label])

  const checkName=()=>{
    const clean=cleanLabel(label)
    setLabel(clean)
    setResult(null)
    if(!clean){setEligibility({ok:false,title:'ENTER A NAME',copy:'Choose the subdomain you want first.'});return}
    if(RESERVED.has(clean)){setEligibility({ok:false,title:'RESERVED BY ESN',copy:'That name is protected and cannot be rented.'});return}
    if(!validLabel(clean)){setEligibility({ok:false,title:'INVALID NAME',copy:'Use 1–48 lowercase letters, numbers, or hyphens.'});return}
    setEligibility({ok:true,title:'NAME FORMAT OK',copy:'Final availability is confirmed manually by ESN staff before activation.'})
  }

  const buildRequest=event=>{
    event.preventDefault()
    setResult(null)
    const clean=cleanLabel(label)
    const hostname=clean?clean+'.'+ROOT_DOMAIN:''
    const domain=normalizeDomain(customDomain)
    const destination=normalizeTarget(target)

    if((mode==='subdomain'||mode==='hosting')&&!validLabel(clean)){
      setResult({ok:false,message:'Choose a valid ESN subdomain first.'});return
    }
    if(mode==='custom'&&!validDomain(domain)){
      setResult({ok:false,message:'Enter a valid custom domain, such as yourbusiness.com.'});return
    }
    if((mode==='subdomain'||mode==='custom')&&!destination){
      setResult({ok:false,message:'Enter the website or hosting destination ESN should connect.'});return
    }
    if(mode==='hosting'&&!details.trim()){
      setResult({ok:false,message:'Tell ESN what website or project you want hosted.'});return
    }
    if(!contact.trim()){
      setResult({ok:false,message:'Enter a Discord username or email so ESN staff can identify the request.'});return
    }

    const request={
      id:'ESN-'+Date.now().toString(36).toUpperCase(),
      type:mode,
      typeLabel:mode==='subdomain'?'ESN Subdomain Rental':mode==='custom'?'Custom Domain Connection':'ESN Web Hosting Waitlist',
      hostname:(mode==='subdomain'||mode==='hosting')?hostname:'',
      customDomain:mode==='custom'?domain:'',
      target:mode==='hosting'?'':destination,
      contact:contact.trim().slice(0,120),
      details:details.trim().slice(0,600),
      createdAt:new Date().toISOString(),
      status:'READY FOR STAFF REVIEW',
    }
    const next=[request,...requests].slice(0,25)
    setRequests(next)
    saveRequests(next)
    setResult({ok:true,request,message:'Request built. Copy it and send it in the ESN Discord so staff can activate it manually.'})
  }

  const copyRequest=async request=>{
    const ok=await copyText(requestText(request))
    setCopied(ok?request.id:'error')
    window.setTimeout(()=>setCopied(''),1800)
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
        <span className="eyebrow">ESN HOSTING // MANUAL BETA</span>
        <h1>Choose an ESN subdomain or connect your own domain.</h1>
        <p>ESN keeps <strong>{ROOT_DOMAIN}</strong> on its current Spaceship nameservers. Customer activations are handled one DNS record at a time, so the main ESN website does not need another nameserver switch.</p>
      </div>
      <div className="page-hero-mark"><span>WEB</span><small>MANUAL ACTIVATION</small></div>
    </div></section>

    <section className="section"><div className="shell">
      <div className="domains-system-banner ready">
        <div><span>ESN HOSTING STATUS</span><strong>MANUAL ACTIVATION BETA</strong><small>No ESN nameserver change required. Pricing is confirmed by staff before payment.</small></div>
        <button onClick={()=>setShowStaff(true)}>STAFF</button>
      </div>

      <div className="domains-safety-strip">
        <strong>NO NAMESERVER CHANGE</strong>
        <span>ESN stays on Spaceship DNS. Staff only adds or edits the specific record needed for an approved customer.</span>
      </div>

      <div className="domains-plan-grid three">
        <button className={mode==='subdomain'?'active':''} onClick={()=>{setMode('subdomain');setResult(null)}}>
          <span>ESN SUBDOMAIN RENTAL</span><strong>yourname.{ROOT_DOMAIN}</strong><p>Choose an ESN address and connect it to an existing compatible website or host.</p>
        </button>
        <button className={mode==='custom'?'active':''} onClick={()=>{setMode('custom');setResult(null)}}>
          <span>CONNECT YOUR DOMAIN</span><strong>yourbusiness.com</strong><p>Use a domain you already own. ESN staff verifies the destination and gives you the exact record to add.</p>
        </button>
        <button className={mode==='hosting'?'active':''} onClick={()=>{setMode('hosting');setResult(null)}}>
          <span>FULL ESN WEB HOSTING</span><strong>SERVER WAITLIST</strong><p>Request full file hosting now. Activation begins when the ESN hosting server is ready.</p>
        </button>
      </div>

      <div className="domains-builder">
        <div className="domains-preview">
          <span>{mode==='custom'?'CUSTOM DOMAIN':mode==='hosting'?'FUTURE ESN HOST':'YOUR ESN ADDRESS'}</span>
          <strong>{mode==='custom'?(normalizeDomain(customDomain)||'yourbusiness.com'):subdomain}</strong>
          <small>{mode==='hosting'?'Reserved request for the upcoming ESN-owned hosting server.':'Manual staff activation keeps the main ESN site isolated from customer changes.'}</small>
        </div>

        <form onSubmit={buildRequest}>
          {(mode==='subdomain'||mode==='hosting')&&<>
            <label>CHOOSE ESN SUBDOMAIN<div className="domains-domain-input"><input value={label} onChange={e=>{setLabel(cleanLabel(e.target.value));setEligibility(null)}} placeholder="yourname"/><span>.{ROOT_DOMAIN}</span></div></label>
            <button type="button" className="domains-check" onClick={checkName} disabled={!label}>CHECK NAME</button>
            {eligibility&&<div className={'domains-availability '+(eligibility.ok?'yes':'no')}><strong>{eligibility.title}</strong><span>{eligibility.copy}</span></div>}
          </>}

          {mode==='custom'&&<label>YOUR CUSTOM DOMAIN<input value={customDomain} onChange={e=>setCustomDomain(e.target.value)} placeholder="yourbusiness.com"/></label>}
          {(mode==='subdomain'||mode==='custom')&&<label>CURRENT WEBSITE / DESTINATION<input value={target} onChange={e=>setTarget(e.target.value)} placeholder="https://your-current-site.com"/></label>}
          {mode==='hosting'&&<label>WHAT DO YOU WANT ESN TO HOST?<textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="Describe the site, files, framework, storage needs, or project."/></label>}
          {mode!=='hosting'&&<label>NOTES <textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="Optional details for ESN staff."/></label>}
          <label>CONTACT<input value={contact} onChange={e=>setContact(e.target.value)} placeholder="Discord username or email"/></label>

          <div className="domains-order-summary">
            <div><span>ACTIVATION</span><strong>Manual ESN staff review</strong></div>
            <div><span>DNS</span><strong>Spaceship record only</strong></div>
            <div><span>PRICE</span><strong>Confirmed before payment</strong></div>
          </div>

          <button className="domains-submit" type="submit">{mode==='hosting'?'JOIN HOSTING WAITLIST':'BUILD ACTIVATION REQUEST'}</button>
          {result&&<div className={'domains-result '+(result.ok?'ok':'error')}>
            <strong>{result.ok?'REQUEST READY':'FIX REQUEST'}</strong>
            <p>{result.message}</p>
            {result.ok&&<>
              <small>Request ID: {result.request.id}</small>
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
      <div className="section-heading"><div><span className="eyebrow">HOW IT WORKS</span><h2>One safe change at a time.</h2></div></div>
      <div className="domains-steps">
        <article><span>01</span><h3>Choose</h3><p>Pick an ESN subdomain, connect a domain you own, or request future full ESN web hosting.</p></article>
        <article><span>02</span><h3>Send</h3><p>Build the request here, copy it, and send it to ESN staff through the official Discord.</p></article>
        <article><span>03</span><h3>Activate</h3><p>Staff checks availability and destination support, then changes only the DNS record needed for that customer.</p></article>
        <article><span>04</span><h3>Verify</h3><p>ESN confirms routing and HTTPS before calling the request active. The main ESN nameservers stay untouched.</p></article>
      </div>
    </div></section>

    {requests.length>0&&<section className="section"><div className="shell">
      <div className="section-heading"><div><span className="eyebrow">THIS DEVICE</span><h2>Your recent activation requests.</h2><p>These are saved only in this browser. Sending the copied request in Discord is what gets it in front of ESN staff.</p></div></div>
      <div className="domains-request-list">
        {requests.slice(0,5).map(request=><article key={request.id}>
          <div><span>{request.typeLabel}</span><strong>{request.hostname||request.customDomain||'ESN Hosting'}</strong><small>{request.id} • {request.status}</small></div>
          <button type="button" onClick={()=>copyRequest(request)}>{copied===request.id?'COPIED ✓':'COPY'}</button>
        </article>)}
      </div>
    </div></section>}

    {staff&&<section className="section"><div className="shell">
      <div className="section-heading"><div><span className="eyebrow">STAFF HOSTING CONTROL</span><h2>Manual activation checklist.</h2><p>This is the safe beta workflow. It never changes ESN nameservers.</p></div></div>
      <div className="domains-staff-grid">
        <article><span>STEP 1</span><strong>Verify request</strong><p>Confirm the requested name is not reserved and no current Spaceship DNS record already uses it.</p></article>
        <article><span>STEP 2</span><strong>Verify destination</strong><p>Make sure the customer host supports the requested hostname and can provide HTTPS before routing traffic.</p></article>
        <article><span>STEP 3</span><strong>Add one record</strong><p>Create only the required A, AAAA, or CNAME record in Spaceship DNS. Do not replace ESN nameservers.</p></article>
        <article><span>STEP 4</span><strong>Confirm live</strong><p>Test the hostname over HTTPS, then confirm activation and pricing/payment status with the customer.</p></article>
      </div>
      <div className="domains-staff-note"><strong>LOCAL REQUESTS ON THIS DEVICE: {requests.length}</strong><span>Customer requests are not globally synced because the current ESN site is static. Customers must send the copied request through Discord.</span></div>
    </div></section>}

    {showStaff&&<div className="domains-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowStaff(false)}}><form className="domains-modal" onSubmit={unlockStaff}><span>ESN HOSTING // STAFF</span><h2>Unlock hosting controls.</h2><input type="password" inputMode="numeric" autoComplete="off" value={staffCode} onChange={e=>setStaffCode(e.target.value)} placeholder="STAFF ACCESS CODE"/><button type="submit">UNLOCK</button>{staffError&&<strong>{staffError}</strong>}<button type="button" className="cancel" onClick={()=>setShowStaff(false)}>CANCEL</button></form></div>}
  </>
}
