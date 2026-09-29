import { useEffect, useMemo, useState } from 'react'
import './domains.css'

const ROOT_DOMAIN='esnoffical.com'
const API_BASE=(import.meta.env.VITE_ESN_DOMAINS_API||'https://domains-api.esnoffical.com').replace(/\/$/,'')
const STAFF_HASH='645569b472b3670b547fd45aa2a626177a8fb71f722bb7c3dc07d0d670311cab'
const RESERVED=new Set(['www','api','admin','staff','store','store-ai','smp','status','support','mail','billing','domains','dns','ftp','cpanel','webmail','discord','nexus','arcade','tools','assets','cdn','static','auth','login','dashboard','root','esn','official','offical'])

async function sha256(value){
  const bytes=new TextEncoder().encode(value)
  const hash=await crypto.subtle.digest('SHA-256',bytes)
  return [...new Uint8Array(hash)].map(byte=>byte.toString(16).padStart(2,'0')).join('')
}
function cleanLabel(value){return value.toLowerCase().replace(/[^a-z0-9-]/g,'').replace(/^-+|-+$/g,'').slice(0,48)}
function validLabel(value){return /^[a-z0-9](?:[a-z0-9-]{0,46}[a-z0-9])?$/.test(value)&&!RESERVED.has(value)}
function validDomain(value){
  const v=value.toLowerCase().trim().replace(/^https?:\/\//,'').replace(/\/$/,'')
  return /^(?=.{3,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(v)
}
function normalizeDomain(value){return value.toLowerCase().trim().replace(/^https?:\/\//,'').replace(/\/.*$/,'').replace(/\.$/,'')}
function normalizeTarget(value){
  const raw=value.trim()
  if(!raw)return ''
  try{
    const url=new URL(/^https?:\/\//i.test(raw)?raw:'https://'+raw)
    return url.toString().replace(/\/$/,'')
  }catch{return ''}
}
function money(cents){return Number(cents)>0?'$'+(Number(cents)/100).toFixed(2)+'/mo':'Pricing not activated'}

export default function DomainsPage(){
  const [status,setStatus]=useState({ready:false,connected:false,pricing:{subdomain:0,custom:0},message:'Checking ESN Domains backend…'})
  const [mode,setMode]=useState('subdomain')
  const [label,setLabel]=useState('')
  const [customDomain,setCustomDomain]=useState('')
  const [target,setTarget]=useState('')
  const [contact,setContact]=useState('')
  const [availability,setAvailability]=useState(null)
  const [checking,setChecking]=useState(false)
  const [submitting,setSubmitting]=useState(false)
  const [result,setResult]=useState(null)
  const [staff,setStaff]=useState(false)
  const [showStaff,setShowStaff]=useState(false)
  const [staffCode,setStaffCode]=useState('')
  const [staffError,setStaffError]=useState('')

  useEffect(()=>{
    if(!API_BASE){setStatus({ready:false,connected:false,pricing:{subdomain:0,custom:0},message:'Cloudflare activation is not connected yet.'});return}
    fetch(API_BASE+'/api/status',{headers:{Accept:'application/json'}})
      .then(r=>r.ok?r.json():Promise.reject())
      .then(data=>setStatus({...data,connected:true}))
      .catch(()=>setStatus({ready:false,connected:false,pricing:{subdomain:0,custom:0},message:'ESN Domains backend is currently unreachable.'}))
  },[])

  const subdomain=useMemo(()=>label?cleanLabel(label)+'.'+ROOT_DOMAIN:'yourname.'+ROOT_DOMAIN,[label])
  const selectedPrice=mode==='subdomain'?status.pricing?.subdomain:status.pricing?.custom

  const check=async()=>{
    const clean=cleanLabel(label)
    setLabel(clean)
    setAvailability(null);setResult(null)
    if(!validLabel(clean)){setAvailability({available:false,reason:RESERVED.has(clean)?'That name is reserved by ESN.':'Use 1–48 lowercase letters, numbers, or hyphens.'});return}
    if(!API_BASE||!status.connected){setAvailability({available:null,reason:'Live availability checking will activate after Cloudflare is connected.'});return}
    setChecking(true)
    try{
      const r=await fetch(API_BASE+'/api/check?label='+encodeURIComponent(clean))
      const data=await r.json()
      setAvailability(data)
    }catch{setAvailability({available:null,reason:'Could not reach ESN Domains.'})}
    setChecking(false)
  }

  const submit=async event=>{
    event.preventDefault();setResult(null)
    const clean=cleanLabel(label)
    const destination=normalizeTarget(target)
    const domain=normalizeDomain(customDomain)
    if(!validLabel(clean)){setResult({ok:false,message:'Choose a valid ESN subdomain first.'});return}
    if(!destination){setResult({ok:false,message:'Enter a valid HTTPS website destination.'});return}
    if(mode==='custom'&&!validDomain(domain)){setResult({ok:false,message:'Enter a valid custom domain.'});return}
    if(!contact.trim()){setResult({ok:false,message:'Enter a Discord username or email so ESN staff can identify the request.'});return}
    if(!API_BASE||!status.ready){setResult({ok:false,message:'Reservations are not live until the ESN Cloudflare backend is activated.'});return}
    setSubmitting(true)
    try{
      const r=await fetch(API_BASE+'/api/reservations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        type:mode,
        label:clean,
        custom_domain:mode==='custom'?domain:null,
        target_url:destination,
        contact:contact.trim().slice(0,120),
      })})
      const data=await r.json()
      setResult(data)
      if(data.available===false)setAvailability(data)
    }catch{setResult({ok:false,message:'Could not submit the reservation request.'})}
    setSubmitting(false)
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
      <div className="page-hero-copy"><span className="eyebrow">ESN DOMAINS</span><h1>Your name. Your domain. Powered through ESN.</h1><p>Choose an <strong>esnoffical.com</strong> subdomain or connect a domain you already own. ESN handles the control layer while Cloudflare provides DNS, routing, and certificates behind the scenes.</p></div>
      <div className="page-hero-mark"><span>DNS</span><small>{status.ready?'SYSTEM READY':'SETUP MODE'}</small></div>
    </div></section>

    <section className="section"><div className="shell">
      <div className={'domains-system-banner '+(status.ready?'ready':'setup')}><div><span>ESN DOMAINS STATUS</span><strong>{status.ready?'RESERVATIONS ONLINE':'CLOUDFLARE ACTIVATION REQUIRED'}</strong><small>{status.message||'ESN Domains backend status.'}</small></div><button onClick={()=>setShowStaff(true)}>STAFF</button></div>

      <div className="domains-plan-grid">
        <button className={mode==='subdomain'?'active':''} onClick={()=>setMode('subdomain')}><span>ESN SUBDOMAIN</span><strong>{money(status.pricing?.subdomain)}</strong><p>Reserve a name like <b>yourname.{ROOT_DOMAIN}</b>.</p></button>
        <button className={mode==='custom'?'active':''} onClick={()=>setMode('custom')}><span>CUSTOM DOMAIN</span><strong>{money(status.pricing?.custom)}</strong><p>Connect a domain you already own and route it through ESN.</p></button>
      </div>

      <div className="domains-builder">
        <div className="domains-preview">
          <span>YOUR ESN ADDRESS</span>
          <strong>{subdomain}</strong>
          <small>{mode==='custom'&&customDomain?normalizeDomain(customDomain)+' → '+subdomain:'Choose your subdomain below.'}</small>
        </div>

        <form onSubmit={submit}>
          <label>CHOOSE SUBDOMAIN<div className="domains-domain-input"><input value={label} onChange={e=>{setLabel(cleanLabel(e.target.value));setAvailability(null)}} placeholder="yourname"/><span>.{ROOT_DOMAIN}</span></div></label>
          <button type="button" className="domains-check" onClick={check} disabled={checking||!label}>{checking?'CHECKING…':'CHECK AVAILABILITY'}</button>
          {availability&&<div className={'domains-availability '+(availability.available===true?'yes':availability.available===false?'no':'unknown')}><strong>{availability.available===true?'AVAILABLE':availability.available===false?'NOT AVAILABLE':'SETUP REQUIRED'}</strong><span>{availability.reason||availability.hostname||''}</span></div>}

          {mode==='custom'&&<label>YOUR CUSTOM DOMAIN<input value={customDomain} onChange={e=>setCustomDomain(e.target.value)} placeholder="yourbusiness.com"/></label>}
          <label>WEBSITE DESTINATION<input value={target} onChange={e=>setTarget(e.target.value)} placeholder="https://your-current-site.com"/></label>
          <label>CONTACT<input value={contact} onChange={e=>setContact(e.target.value)} placeholder="Discord username or email"/></label>

          <div className="domains-order-summary">
            <div><span>PLAN</span><strong>{mode==='subdomain'?'ESN Subdomain':'Custom Domain Connection'}</strong></div>
            <div><span>PRICE</span><strong>{money(selectedPrice)}</strong></div>
            <div><span>ACTIVATION</span><strong>Staff approval required</strong></div>
          </div>

          <button className="domains-submit" type="submit" disabled={submitting||!status.ready}>{submitting?'SUBMITTING…':status.ready?'REQUEST DOMAIN':'CLOUDFLARE SETUP REQUIRED'}</button>
          {result&&<div className={'domains-result '+(result.ok?'ok':'error')}><strong>{result.ok?'REQUEST CREATED':'REQUEST NOT CREATED'}</strong><p>{result.message}</p>{result.checkout_url&&<a href={result.checkout_url} target="_blank" rel="noreferrer">CONTINUE TO PAYMENT ↗</a>}{result.request_id&&<small>Request ID: {result.request_id}</small>}</div>}
        </form>
      </div>
    </div></section>

    <section className="section dark-section"><div className="shell">
      <div className="section-heading"><div><span className="eyebrow">HOW IT WORKS</span><h2>ESN handles the customer experience.</h2></div></div>
      <div className="domains-steps">
        <article><span>01</span><h3>Choose</h3><p>Pick an available ESN subdomain, and optionally enter a domain you already own.</p></article>
        <article><span>02</span><h3>Request</h3><p>Choose the destination website and submit the rental request. Nothing is activated before staff approval.</p></article>
        <article><span>03</span><h3>Verify</h3><p>Custom-domain customers receive the DNS verification values required to prove control of their domain.</p></article>
        <article><span>04</span><h3>Go live</h3><p>Once approved and paid, ESN activates routing and HTTPS. Expired or cancelled rentals can be suspended without deleting the customer’s original site.</p></article>
      </div>
    </div></section>

    {staff&&<section className="section"><div className="shell">
      <div className="section-heading"><div><span className="eyebrow">STAFF DOMAIN CONTROL</span><h2>Deployment readiness.</h2><p>This page never stores Cloudflare API secrets in the browser or GitHub source.</p></div></div>
      <div className="domains-staff-grid">
        <article><span>FRONTEND</span><strong>READY</strong><p>Public domain search, rental request UI, custom-domain flow, and protected-name rules are installed.</p></article>
        <article><span>BACKEND</span><strong>{status.connected?'CONNECTED':'NOT CONNECTED'}</strong><p>{API_BASE||'Set VITE_ESN_DOMAINS_API after the Worker is deployed.'}</p></article>
        <article><span>DNS WRITES</span><strong>{status.dns_mutations?'ENABLED':'LOCKED'}</strong><p>DNS/domain activation stays locked until the Worker has a Cloudflare API token and ALLOW_DNS_MUTATIONS is enabled.</p></article>
        <article><span>BILLING</span><strong>{Number(status.pricing?.subdomain)>0||Number(status.pricing?.custom)>0?'CONFIGURED':'NOT SET'}</strong><p>Rental prices and payment links remain inactive until ESN staff configures them.</p></article>
      </div>
    </div></section>}

    {showStaff&&<div className="domains-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowStaff(false)}}><form className="domains-modal" onSubmit={unlockStaff}><span>ESN DOMAINS // STAFF</span><h2>Unlock domain controls.</h2><input type="password" inputMode="numeric" autoComplete="off" value={staffCode} onChange={e=>setStaffCode(e.target.value)} placeholder="STAFF ACCESS CODE"/><button type="submit">UNLOCK</button>{staffError&&<strong>{staffError}</strong>}<button type="button" className="cancel" onClick={()=>setShowStaff(false)}>CANCEL</button></form></div>}
  </>
}
