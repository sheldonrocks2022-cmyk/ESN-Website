import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ESN_DISCORD_URL, ESN_NETWORK_LINKS, ESN_PANEL_URL, ESN_PLANS_URL, ESN_SMP_STORE_URL, ESN_STATUS_JSON, ESN_STATUS_URL, summariseStatus } from './esnNetwork'
import './esnNetwork.css'

const CACHE_KEY='esn_network_status_v1'
const CACHE_MS=60000
let inflight=null

function readCache(){
  try{const raw=sessionStorage.getItem(CACHE_KEY);if(!raw)return null;const value=JSON.parse(raw);return Date.now()-value.at<CACHE_MS?value.summary:null}catch{return null}
}

function loadStatus(){
  if(inflight)return inflight
  inflight=(async()=>{
    const controller=typeof AbortController==='function'?new AbortController():null
    const timer=setTimeout(()=>controller?.abort(),8000)
    try{
      const response=await fetch(ESN_STATUS_JSON,{cache:'no-store',signal:controller?.signal})
      if(!response.ok)return null
      const summary=summariseStatus(await response.json())
      if(summary)try{sessionStorage.setItem(CACHE_KEY,JSON.stringify({at:Date.now(),summary}))}catch{}
      return summary
    }catch{return null}
    finally{clearTimeout(timer);setTimeout(()=>{inflight=null},1000)}
  })()
  return inflight
}

export function useEsnStatus(){
  const [summary,setSummary]=useState(null)
  useEffect(()=>{
    let alive=true
    const cached=readCache()
    if(cached){setSummary(cached);return()=>{alive=false}}
    loadStatus().then(value=>{if(alive&&value)setSummary(value)})
    const interval=setInterval(()=>loadStatus().then(value=>{if(alive&&value)setSummary(value)}),120000)
    return()=>{alive=false;clearInterval(interval)}
  },[])
  return summary
}

export function StatusPill({ className='' }){
  const summary=useEsnStatus()
  if(!summary)return null
  const label=summary.ok?'All systems operational':`${summary.issues||1} ${summary.issues===1?'issue':'issues'}`
  return <a className={`esn-net-pill ${summary.ok?'is-ok':'is-issue'} ${className}`} href={ESN_STATUS_URL} target="_blank" rel="noreferrer" aria-label={`ESN status: ${label}. Open the status page`}>
    <i aria-hidden="true"/><span>{label}</span>
  </a>
}

function NetLink({ item, className }){
  if(item.internal)return <Link className={className} to={item.href}>{item.label}</Link>
  return <a className={className} href={item.href} target="_blank" rel="noreferrer">{item.label}</a>
}

export function NetworkBar(){
  return <div className="esn-net-bar" role="navigation" aria-label="ESN network">
    <div className="esn-net-bar-inner">
      <span className="esn-net-bar-label">ESN NETWORK</span>
      <div className="esn-net-bar-links">
        {ESN_NETWORK_LINKS.map(item=><NetLink key={item.id} item={item} className="esn-net-bar-link"/>)}
      </div>
      <StatusPill className="esn-net-bar-pill"/>
    </div>
  </div>
}

export function NetworkFooterRow(){
  return <div className="shell esn-net-footer" role="navigation" aria-label="ESN network sites">
    <div className="esn-net-footer-head"><span>THE ESN NETWORK</span><StatusPill/></div>
    <div className="esn-net-footer-links">
      {ESN_NETWORK_LINKS.map(item=><NetLink key={item.id} item={item} className="esn-net-footer-link"/>)}
    </div>
  </div>
}

export function HeroNetworkActions(){
  return <div className="esn-net-hero-actions">
    <a className="button secondary esn-net-cta" href={ESN_PANEL_URL} target="_blank" rel="noreferrer"><span className="esn-net-long">Open the </span>Panel <span aria-hidden="true">↗</span></a>
    <a className="button secondary esn-net-cta" href={ESN_SMP_STORE_URL} target="_blank" rel="noreferrer">SMP Store <span aria-hidden="true">↗</span></a>
    <a className="button secondary esn-net-cta" href={ESN_DISCORD_URL} target="_blank" rel="noreferrer"><span className="esn-net-long">Join </span>Discord <span aria-hidden="true">↗</span></a>
  </div>
}

const CARD_ICONS={home:'⌂',panel:'▣',plans:'$',store:'◆',docs:'≡',status:'●',discord:'✦',rules:'§'}

export function HomeNetworkSection(){
  const cards=ESN_NETWORK_LINKS.filter(item=>item.id!=='home')
  return <section className="section esn-net-section" aria-labelledby="esn-net-title">
    <div className="shell">
      <div className="esn-net-section-head">
        <div><span className="eyebrow">ONE NETWORK</span><h2 id="esn-net-title">Everything ESN, one tap away.</h2><p>Buy and manage hosting, shop the SMP, read the guides and check live uptime. Every ESN site, in one place.</p></div>
        <StatusPill className="esn-net-pill-large"/>
      </div>
      <div className="esn-net-grid">
        {cards.map((item,index)=>{
          const body=<><span className="esn-net-card-icon" aria-hidden="true">{CARD_ICONS[item.id]}</span><span className="esn-net-card-text"><strong>{item.label}</strong><small>{item.copy}</small></span><b aria-hidden="true">{item.internal?'→':'↗'}</b></>
          const style={'--esn-net-i':index}
          return item.internal
            ?<Link key={item.id} className="esn-net-card" to={item.href} style={style}>{body}</Link>
            :<a key={item.id} className="esn-net-card" href={item.href} target="_blank" rel="noreferrer" style={style}>{body}</a>
        })}
      </div>
      <div className="esn-net-section-cta">
        <a className="button primary" href={ESN_PLANS_URL} target="_blank" rel="noreferrer">See hosting plans <span aria-hidden="true">↗</span></a>
        <span>Bot hosting from $0.50/mo. Checkout through Stripe, set up automatically.</span>
      </div>
    </div>
  </section>
}
