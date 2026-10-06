import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './analytics.css'

const API=(import.meta.env.VITE_ESN_ANALYTICS_API||'https://analytics-api.esnoffical.com').replace(/\/$/,'')
const VISITOR_KEY='esn_analytics_visitor_v1'
const SESSION_KEY='esn_analytics_session_v1'
const TOKEN_KEY='esn_analytics_admin_token_v1'

const id=()=>crypto.randomUUID?.()||`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
function storageId(key,storage){
  try{
    let value=storage.getItem(key)
    if(!value){value=id();storage.setItem(key,value)}
    return value
  }catch{return id()}
}
function visitorId(){return storageId(VISITOR_KEY,localStorage)}
function sessionId(){return storageId(SESSION_KEY,sessionStorage)}
function safePath(){return location.pathname+location.search.slice(0,160)}
function payload(type,extra={}){
  return {
    type,
    path:safePath(),
    visitor_id:visitorId(),
    session_id:sessionId(),
    referrer:document.referrer||'',
    title:document.title||'',
    language:navigator.language||'',
    screen:`${screen.width}x${screen.height}`,
    timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||'',
    ...extra,
  }
}
async function send(type,extra={}){
  const body=JSON.stringify(payload(type,extra))
  try{
    await fetch(API+'/api/collect',{method:'POST',headers:{'content-type':'application/json'},body,keepalive:true,mode:'cors'})
  }catch{
    try{
      const q=JSON.parse(localStorage.getItem('esn_analytics_queue_v1')||'[]')
      q.push(JSON.parse(body))
      localStorage.setItem('esn_analytics_queue_v1',JSON.stringify(q.slice(-25)))
    }catch{}
  }
}
async function flush(){
  let q=[]
  try{q=JSON.parse(localStorage.getItem('esn_analytics_queue_v1')||'[]')}catch{}
  if(!q.length)return
  try{
    const res=await fetch(API+'/api/collect/batch',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({events:q}),keepalive:true,mode:'cors'})
    if(res.ok)localStorage.removeItem('esn_analytics_queue_v1')
  }catch{}
}

export function AnalyticsTracker(){
  const location=useLocation()
  useEffect(()=>{
    flush()
    const started=Date.now()
    let maxScroll=0
    const scroll=()=>{
      const doc=document.documentElement
      const total=Math.max(1,doc.scrollHeight-window.innerHeight)
      maxScroll=Math.max(maxScroll,Math.round((window.scrollY/total)*100))
    }
    const click=e=>{
      const a=e.target.closest?.('a[href]')
      if(!a)return
      let url
      try{url=new URL(a.href,window.location.href)}catch{return}
      if(a.hasAttribute('download')||/\/downloads\//i.test(url.pathname)){
        send('download',{target:url.pathname})
      }else if(url.origin!==window.location.origin){
        send('outbound_click',{target:url.hostname+url.pathname.slice(0,120)})
      }
    }
    const error=e=>send('client_error',{message:String(e.message||'error').slice(0,180)})
    const unhandled=e=>send('client_error',{message:String(e.reason?.message||e.reason||'promise rejection').slice(0,180)})
    window.addEventListener('scroll',scroll,{passive:true})
    document.addEventListener('click',click,true)
    window.addEventListener('error',error)
    window.addEventListener('unhandledrejection',unhandled)
    send('pageview')
    const timer=window.setInterval(()=>send('engagement',{duration_ms:Date.now()-started,max_scroll:maxScroll}),30000)
    return ()=>{
      clearInterval(timer)
      window.removeEventListener('scroll',scroll)
      document.removeEventListener('click',click,true)
      window.removeEventListener('error',error)
      window.removeEventListener('unhandledrejection',unhandled)
      send('engagement',{duration_ms:Date.now()-started,max_scroll:maxScroll})
    }
  },[location.pathname,location.search])
  return null
}

const fmt=n=>new Intl.NumberFormat().format(Number(n||0))
const pct=n=>`${Math.round(Number(n||0)*100)}%`
function Metric({label,value,sub}){return <article className="analytics-metric"><span>{label}</span><strong>{value}</strong>{sub&&<small>{sub}</small>}</article>}
function BarList({title,rows=[],valueKey='count',labelKey='label'}){
  const max=Math.max(1,...rows.map(r=>Number(r[valueKey]||0)))
  return <section className="analytics-panel"><div className="analytics-panel-head"><h2>{title}</h2></div><div className="analytics-bars">
    {rows.length?rows.map((r,i)=><div className="analytics-bar-row" key={(r[labelKey]||'unknown')+i}>
      <div><strong>{r[labelKey]||'Direct / Unknown'}</strong><span>{fmt(r[valueKey])}</span></div>
      <i style={{'--bar':`${Math.max(3,Math.round(Number(r[valueKey]||0)/max*100))}%`}}/>
    </div>):<p className="analytics-empty">No data in this range yet.</p>}
  </div></section>
}

export function AnalyticsDashboard(){
  const [token,setToken]=useState(()=>{try{return sessionStorage.getItem(TOKEN_KEY)||''}catch{return''}})
  const [code,setCode]=useState('')
  const [days,setDays]=useState(30)
  const [data,setData]=useState(null)
  const [live,setLive]=useState(null)
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)

  const headers=useMemo(()=>token?{authorization:`Bearer ${token}`}:{},[token])
  const login=async e=>{
    e.preventDefault();setError('');setLoading(true)
    try{
      const res=await fetch(API+'/api/admin/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({code})})
      const json=await res.json()
      if(!res.ok)throw new Error(json.message||'Login failed')
      setToken(json.token);sessionStorage.setItem(TOKEN_KEY,json.token);setCode('')
    }catch(err){setError(err.message)}finally{setLoading(false)}
  }
  const load=async()=>{
    if(!token)return
    setLoading(true);setError('')
    try{
      const [s,l]=await Promise.all([
        fetch(API+`/api/admin/summary?days=${days}`,{headers}),
        fetch(API+'/api/admin/realtime',{headers}),
      ])
      if(s.status===401||l.status===401){sessionStorage.removeItem(TOKEN_KEY);setToken('');throw new Error('Analytics session expired.')}
      const summary=await s.json(), realtime=await l.json()
      if(!s.ok)throw new Error(summary.message||'Could not load analytics')
      setData(summary);setLive(realtime)
    }catch(err){setError(err.message)}finally{setLoading(false)}
  }
  useEffect(()=>{load()},[token,days])
  useEffect(()=>{
    if(!token)return
    const t=setInterval(()=>fetch(API+'/api/admin/realtime',{headers}).then(r=>r.json()).then(setLive).catch(()=>{}),20000)
    return()=>clearInterval(t)
  },[token,headers])

  if(!token)return <section className="analytics-page"><div className="analytics-login">
    <span>ESN // PRIVATE ANALYTICS</span><h1>Website Intelligence Center</h1>
    <p>Real ESN traffic data. The access code is verified by the analytics backend, not stored in this page.</p>
    <form onSubmit={login}><input type="password" inputMode="numeric" autoComplete="off" value={code} onChange={e=>setCode(e.target.value)} placeholder="STAFF ACCESS CODE"/><button disabled={loading}>{loading?'CHECKING…':'OPEN ANALYTICS'}</button></form>
    {error&&<strong className="analytics-error">{error}</strong>}
  </div></section>

  const s=data?.summary||{}
  return <section className="analytics-page">
    <div className="analytics-shell">
      <header className="analytics-hero">
        <div><span>ESN // FIRST-PARTY ANALYTICS</span><h1>Website Intelligence Center</h1><p>Privacy-aware traffic, engagement, discovery and conversion signals owned by ESN.</p></div>
        <div className="analytics-actions">
          <select value={days} onChange={e=>setDays(Number(e.target.value))}><option value={1}>24 hours</option><option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option></select>
          <button onClick={load} disabled={loading}>{loading?'REFRESHING…':'REFRESH'}</button>
          <button className="ghost" onClick={()=>{sessionStorage.removeItem(TOKEN_KEY);setToken('')}}>LOCK</button>
        </div>
      </header>
      {error&&<div className="analytics-error-banner">{error}</div>}
      <div className="analytics-live"><i/><strong>{fmt(live?.active_visitors)} active visitor{Number(live?.active_visitors)===1?'':'s'}</strong><span>last 5 minutes</span></div>
      <div className="analytics-metrics">
        <Metric label="Page Views" value={fmt(s.pageviews)}/>
        <Metric label="Unique Visitors" value={fmt(s.unique_visitors)}/>
        <Metric label="Sessions" value={fmt(s.sessions)}/>
        <Metric label="Pages / Session" value={Number(s.pages_per_session||0).toFixed(2)}/>
        <Metric label="Avg Engagement" value={`${Math.round(Number(s.avg_engagement_ms||0)/1000)}s`}/>
        <Metric label="Downloads" value={fmt(s.downloads)}/>
        <Metric label="Outbound Clicks" value={fmt(s.outbound_clicks)}/>
        <Metric label="Bounce Rate" value={pct(s.bounce_rate)}/>
      </div>
      <section className="analytics-panel analytics-trend">
        <div className="analytics-panel-head"><h2>Traffic trend</h2><span>{days} day view</span></div>
        <div className="analytics-trend-grid">{(data?.trend||[]).map(d=><div key={d.day} title={`${d.day}: ${d.pageviews} views`}><i style={{'--h':`${Math.max(4,Math.round((d.pageviews/Math.max(1,...(data.trend||[]).map(x=>x.pageviews)))*100))}%`}}/><span>{d.day.slice(5)}</span></div>)}</div>
      </section>
      <div className="analytics-grid">
        <BarList title="Top pages" rows={data?.top_pages} labelKey="path"/>
        <BarList title="Top referrers" rows={data?.referrers} labelKey="referrer"/>
        <BarList title="Devices" rows={data?.devices}/>
        <BarList title="Browsers" rows={data?.browsers}/>
        <BarList title="Countries" rows={data?.countries}/>
        <BarList title="Events" rows={data?.events}/>
      </div>
      <section className="analytics-panel">
        <div className="analytics-panel-head"><h2>Live activity</h2><span>last 5 minutes</span></div>
        <div className="analytics-live-list">{(live?.recent||[]).map((r,i)=><div key={i}><strong>{r.path}</strong><span>{r.event_type}</span><small>{r.country||'—'} • {r.device||'unknown'}</small></div>)}</div>
      </section>
      <p className="analytics-privacy">ESN Analytics does not store raw visitor IP addresses. Unique visitors use one-way hashed browser IDs; analytics data is retained for a limited period by the ESN analytics backend.</p>
    </div>
  </section>
}
