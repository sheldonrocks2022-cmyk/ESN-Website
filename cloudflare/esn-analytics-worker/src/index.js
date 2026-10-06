const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}})
const now=()=>Math.floor(Date.now()/1000)
const allowTypes=new Set(['pageview','engagement','download','outbound_click','client_error'])
const enc=new TextEncoder()

async function sha256(value){
  const hash=await crypto.subtle.digest('SHA-256',enc.encode(String(value)))
  return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('')
}
function cors(env,request){
  const origin=request.headers.get('origin')||''
  const allowed=(env.ALLOWED_ORIGINS||'https://esnoffical.com').split(',').map(x=>x.trim()).filter(Boolean)
  if(!origin)return {}
  if(allowed.includes(origin)||(/^http:\/\/localhost(?::\d+)?$/.test(origin)&&env.ALLOW_LOCALHOST==='true')){
    return {'access-control-allow-origin':origin,'vary':'origin','access-control-allow-headers':'content-type, authorization','access-control-allow-methods':'GET, POST, OPTIONS'}
  }
  return {}
}
function cleanText(value,max=180){return String(value||'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max)}
function cleanPath(value){
  let path=cleanText(value,300)
  if(!path.startsWith('/'))path='/'
  const q=path.indexOf('?')
  if(q>=0)path=path.slice(0,q)
  return path||'/'
}
function refHost(value){
  try{return new URL(String(value||'')).hostname.toLowerCase().slice(0,180)}catch{return ''}
}
function parseUA(ua=''){
  const s=String(ua)
  const device=/bot|crawler|spider|crawling/i.test(s)?'bot':/ipad|tablet|kindle|silk/i.test(s)?'tablet':/mobile|iphone|android/i.test(s)?'mobile':'desktop'
  const browser=/edg\//i.test(s)?'Edge':/opr\//i.test(s)?'Opera':/firefox\//i.test(s)?'Firefox':/chrome\//i.test(s)?'Chrome':/safari\//i.test(s)&&!/chrome/i.test(s)?'Safari':'Other'
  const os=/windows/i.test(s)?'Windows':/android/i.test(s)?'Android':/iphone|ipad|ios/i.test(s)?'iOS':/mac os|macintosh/i.test(s)?'macOS':/linux/i.test(s)?'Linux':'Other'
  return {device,browser,os}
}
async function eventRow(body,request,env){
  const type=cleanText(body?.type,40)
  if(!allowTypes.has(type))return null
  const visitor=cleanText(body?.visitor_id,120)
  const session=cleanText(body?.session_id,120)
  if(!visitor||!session)return null
  const visitorHash=await sha256(visitor+'|'+(env.ANALYTICS_SALT||'esn-analytics'))
  const ua=parseUA(request.headers.get('user-agent')||'')
  const occurred=now()
  const day=new Date(occurred*1000).toISOString().slice(0,10)
  const metadata={
    title:cleanText(body?.title,180),
    language:cleanText(body?.language,32),
    screen:cleanText(body?.screen,32),
    timezone:cleanText(body?.timezone,64),
    target:cleanText(body?.target,220),
    message:type==='client_error'?cleanText(body?.message,220):undefined,
    max_scroll:Number.isFinite(Number(body?.max_scroll))?Math.max(0,Math.min(100,Number(body.max_scroll))):undefined,
  }
  return {
    occurred,day,visitorHash,session:session.slice(0,120),type,path:cleanPath(body?.path),
    referrer:refHost(body?.referrer)||'Direct',
    device:ua.device,browser:ua.browser,os:ua.os,
    country:cleanText(request.cf?.country||'',8)||'—',
    duration:Math.max(0,Math.min(6*60*60*1000,Number(body?.duration_ms)||0)),
    metadata:JSON.stringify(metadata),
  }
}
async function insertEvent(row,env){
  return env.DB.prepare(`INSERT INTO analytics_events
    (occurred_at,day,visitor_hash,session_id,event_type,path,referrer_host,device,browser,os,country,duration_ms,metadata_json)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(row.occurred,row.day,row.visitorHash,row.session,row.type,row.path,row.referrer,row.device,row.browser,row.os,row.country,row.duration,row.metadata).run()
}
async function admin(request,env){
  const raw=(request.headers.get('authorization')||'').replace(/^Bearer\s+/i,'').trim()
  if(!raw)return false
  const hash=await sha256(raw)
  const row=await env.DB.prepare('SELECT expires_at FROM analytics_admin_sessions WHERE token_hash=?').bind(hash).first()
  return Boolean(row&&Number(row.expires_at)>now())
}
async function loginBlocked(request,env){
  const ip=request.headers.get('cf-connecting-ip')||'unknown'
  const ipHash=await sha256(ip+'|'+(env.ANALYTICS_SALT||'esn-analytics'))
  const cutoff=now()-900
  await env.DB.prepare('DELETE FROM analytics_login_attempts WHERE attempted_at<?').bind(cutoff).run()
  const row=await env.DB.prepare('SELECT COUNT(*) c FROM analytics_login_attempts WHERE ip_hash=? AND attempted_at>=?').bind(ipHash,cutoff).first()
  if(Number(row?.c||0)>=8)return true
  await env.DB.prepare('INSERT INTO analytics_login_attempts(ip_hash,attempted_at) VALUES(?,?)').bind(ipHash,now()).run()
  return false
}
async function rows(env,sql,...binds){
  const result=await env.DB.prepare(sql).bind(...binds).all()
  return result.results||[]
}
async function handle(request,env,url){
  const headers=cors(env,request)
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers})
  if(url.pathname==='/api/health')return json({ok:true,service:'ESN Analytics',database:Boolean(env.DB)},200,headers)

  if(url.pathname==='/api/collect'&&request.method==='POST'){
    const body=await request.json().catch(()=>null)
    const row=body&&await eventRow(body,request,env)
    if(!row)return json({ok:false,message:'Invalid analytics event.'},400,headers)
    await insertEvent(row,env)
    return json({ok:true},202,headers)
  }
  if(url.pathname==='/api/collect/batch'&&request.method==='POST'){
    const body=await request.json().catch(()=>({}))
    const events=Array.isArray(body.events)?body.events.slice(0,25):[]
    let accepted=0
    for(const e of events){
      const row=await eventRow(e,request,env)
      if(!row)continue
      await insertEvent(row,env);accepted++
    }
    return json({ok:true,accepted},202,headers)
  }
  if(url.pathname==='/api/admin/login'&&request.method==='POST'){
    if(await loginBlocked(request,env))return json({ok:false,message:'Too many attempts. Try again later.'},429,headers)
    const body=await request.json().catch(()=>({}))
    if(!env.STAFF_CODE_HASH||await sha256(String(body.code||'').trim())!==env.STAFF_CODE_HASH){
      return json({ok:false,message:'Access code rejected.'},401,headers)
    }
    const bytes=crypto.getRandomValues(new Uint8Array(32))
    const token=[...bytes].map(x=>x.toString(16).padStart(2,'0')).join('')
    const tokenHash=await sha256(token)
    const expires=now()+1800
    await env.DB.prepare('INSERT INTO analytics_admin_sessions(token_hash,expires_at) VALUES(?,?)').bind(tokenHash,expires).run()
    return json({ok:true,token,expires_at:expires},200,headers)
  }

  if(url.pathname==='/api/admin/summary'&&request.method==='GET'){
    if(!await admin(request,env))return json({ok:false,message:'Unauthorized.'},401,headers)
    const days=Math.max(1,Math.min(90,Number(url.searchParams.get('days'))||30))
    const cutoff=now()-days*86400
    const total=await env.DB.prepare(`SELECT
      SUM(CASE WHEN event_type='pageview' THEN 1 ELSE 0 END) pageviews,
      COUNT(DISTINCT CASE WHEN event_type='pageview' THEN visitor_hash END) unique_visitors,
      COUNT(DISTINCT CASE WHEN event_type='pageview' THEN session_id END) sessions,
      SUM(CASE WHEN event_type='download' THEN 1 ELSE 0 END) downloads,
      SUM(CASE WHEN event_type='outbound_click' THEN 1 ELSE 0 END) outbound_clicks
      FROM analytics_events WHERE occurred_at>=?`).bind(cutoff).first()
    const engagement=await env.DB.prepare(`SELECT AVG(mx) avg_engagement_ms FROM (
      SELECT MAX(duration_ms) mx FROM analytics_events WHERE occurred_at>=? AND event_type='engagement' GROUP BY session_id
    )`).bind(cutoff).first()
    const sessionPages=await env.DB.prepare(`SELECT AVG(c) pages_per_session FROM (
      SELECT COUNT(*) c FROM analytics_events WHERE occurred_at>=? AND event_type='pageview' GROUP BY session_id
    )`).bind(cutoff).first()
    const bounced=await env.DB.prepare(`SELECT
      AVG(CASE WHEN c=1 THEN 1.0 ELSE 0 END) bounce_rate FROM (
        SELECT COUNT(*) c FROM analytics_events WHERE occurred_at>=? AND event_type='pageview' GROUP BY session_id
      )`).bind(cutoff).first()
    const trend=await rows(env,`SELECT day,COUNT(*) pageviews,COUNT(DISTINCT visitor_hash) visitors
      FROM analytics_events WHERE occurred_at>=? AND event_type='pageview' GROUP BY day ORDER BY day ASC`,cutoff)
    const top_pages=await rows(env,`SELECT path,COUNT(*) count FROM analytics_events
      WHERE occurred_at>=? AND event_type='pageview' GROUP BY path ORDER BY count DESC LIMIT 15`,cutoff)
    const referrers=await rows(env,`SELECT referrer_host referrer,COUNT(*) count FROM analytics_events
      WHERE occurred_at>=? AND event_type='pageview' GROUP BY referrer_host ORDER BY count DESC LIMIT 12`,cutoff)
    const devices=await rows(env,`SELECT device label,COUNT(*) count FROM analytics_events
      WHERE occurred_at>=? AND event_type='pageview' GROUP BY device ORDER BY count DESC`,cutoff)
    const browsers=await rows(env,`SELECT browser label,COUNT(*) count FROM analytics_events
      WHERE occurred_at>=? AND event_type='pageview' GROUP BY browser ORDER BY count DESC LIMIT 10`,cutoff)
    const countries=await rows(env,`SELECT country label,COUNT(*) count FROM analytics_events
      WHERE occurred_at>=? AND event_type='pageview' GROUP BY country ORDER BY count DESC LIMIT 12`,cutoff)
    const events=await rows(env,`SELECT event_type label,COUNT(*) count FROM analytics_events
      WHERE occurred_at>=? GROUP BY event_type ORDER BY count DESC`,cutoff)
    return json({ok:true,days,summary:{
      pageviews:Number(total?.pageviews||0),unique_visitors:Number(total?.unique_visitors||0),sessions:Number(total?.sessions||0),
      pages_per_session:Number(sessionPages?.pages_per_session||0),avg_engagement_ms:Number(engagement?.avg_engagement_ms||0),
      downloads:Number(total?.downloads||0),outbound_clicks:Number(total?.outbound_clicks||0),bounce_rate:Number(bounced?.bounce_rate||0)
    },trend,top_pages,referrers,devices,browsers,countries,events},200,headers)
  }

  if(url.pathname==='/api/admin/realtime'&&request.method==='GET'){
    if(!await admin(request,env))return json({ok:false,message:'Unauthorized.'},401,headers)
    const cutoff=now()-300
    const active=await env.DB.prepare(`SELECT COUNT(DISTINCT visitor_hash) c FROM analytics_events
      WHERE occurred_at>=? AND event_type IN ('pageview','engagement')`).bind(cutoff).first()
    const recent=await rows(env,`SELECT event_type,path,country,device,occurred_at FROM analytics_events
      WHERE occurred_at>=? ORDER BY occurred_at DESC LIMIT 30`,cutoff)
    return json({ok:true,active_visitors:Number(active?.c||0),recent},200,headers)
  }

  return json({ok:false,message:'Not found.'},404,headers)
}
export default {
  async fetch(request,env){
    const url=new URL(request.url)
    try{return await handle(request,env,url)}
    catch(error){return json({ok:false,message:'ESN Analytics backend error.',detail:env.EXPOSE_ERRORS==='true'?String(error?.message||error):undefined},500,cors(env,request))}
  },
  async scheduled(event,env){
    const current=now()
    const retention=Math.max(30,Math.min(365,Number(env.RETENTION_DAYS)||180))
    await env.DB.prepare('DELETE FROM analytics_events WHERE occurred_at<?').bind(current-retention*86400).run()
    await env.DB.prepare('DELETE FROM analytics_admin_sessions WHERE expires_at<=?').bind(current).run()
    await env.DB.prepare('DELETE FROM analytics_login_attempts WHERE attempted_at<?').bind(current-86400).run()
  }
}
