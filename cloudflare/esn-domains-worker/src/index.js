const RESERVED=new Set(['www','api','admin','staff','store','store-ai','smp','status','support','mail','billing','domains','dns','ftp','cpanel','webmail','discord','nexus','arcade','tools','assets','cdn','static','auth','login','dashboard','root','esn','official','offical','domains-api','domains-origin'])

const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8',...extra}})
const now=()=>Math.floor(Date.now()/1000)
const id=()=>crypto.randomUUID()
const cleanLabel=value=>String(value||'').toLowerCase().replace(/[^a-z0-9-]/g,'').replace(/^-+|-+$/g,'').slice(0,48)
const validLabel=value=>/^[a-z0-9](?:[a-z0-9-]{0,46}[a-z0-9])?$/.test(value)&&!RESERVED.has(value)
const validDomain=value=>/^(?=.{3,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(String(value||'').toLowerCase())
const cors=(env,request)=>{
  const origin=request.headers.get('origin')||''
  const allowed=(env.ALLOWED_ORIGINS||'https://esnoffical.com').split(',').map(x=>x.trim())
  return allowed.includes(origin)?{'access-control-allow-origin':origin,'vary':'origin','access-control-allow-headers':'content-type, authorization','access-control-allow-methods':'GET, POST, OPTIONS'}:{}
}
async function sha256(value){
  const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))
  return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('')
}
function normalizeTarget(value){
  try{
    const url=new URL(String(value||''))
    if(url.protocol!=='https:')return null
    const h=url.hostname.toLowerCase()
    if(!h||h==='localhost'||h.endsWith('.local')||h.endsWith('.internal')||/^\d+\.\d+\.\d+\.\d+$/.test(h))return null
    if(h==='esnoffical.com'||h.endsWith('.esnoffical.com'))return null
    url.hash=''
    return url.origin
  }catch{return null}
}
async function cf(env,path,init={}){
  if(!env.CLOUDFLARE_API_TOKEN)throw new Error('Cloudflare API token not configured')
  const res=await fetch('https://api.cloudflare.com/client/v4'+path,{...init,headers:{'authorization':'Bearer '+env.CLOUDFLARE_API_TOKEN,'content-type':'application/json',...(init.headers||{})}})
  const data=await res.json().catch(()=>({success:false,errors:[{message:'Invalid Cloudflare API response'}]}))
  if(!res.ok||data.success===false)throw new Error(data.errors?.map(x=>x.message).join('; ')||'Cloudflare API request failed')
  return data
}
async function attachWorkerDomain(env,hostname){
  return cf(env,'/accounts/'+env.CLOUDFLARE_ACCOUNT_ID+'/workers/domains',{method:'PUT',body:JSON.stringify({hostname,service:env.WORKER_SERVICE_NAME,zone_id:env.CLOUDFLARE_ZONE_ID,zone_name:env.ROOT_DOMAIN||'esnoffical.com'})})
}
async function createCustomHostname(env,hostname){
  return cf(env,'/zones/'+env.CLOUDFLARE_ZONE_ID+'/custom_hostnames',{method:'POST',body:JSON.stringify({hostname,ssl:{method:'txt',type:'dv'}})})
}
async function deleteCustomHostname(env,id){
  return cf(env,'/zones/'+env.CLOUDFLARE_ZONE_ID+'/custom_hostnames/'+id,{method:'DELETE'})
}
async function deleteWorkerDomain(env,hostname){
  const listed=await cf(env,'/accounts/'+env.CLOUDFLARE_ACCOUNT_ID+'/workers/domains?hostname='+encodeURIComponent(hostname))
  const found=listed.result?.find(x=>x.hostname===hostname)
  if(found?.id)await cf(env,'/accounts/'+env.CLOUDFLARE_ACCOUNT_ID+'/workers/domains/'+found.id,{method:'DELETE'})
}
async function getAdmin(request,env){
  const token=(request.headers.get('authorization')||'').replace(/^Bearer\s+/i,'').trim()
  if(!token)return null
  const hash=await sha256(token)
  const row=await env.DB.prepare('SELECT expires_at FROM admin_sessions WHERE token_hash=?').bind(hash).first()
  if(!row||Number(row.expires_at)<=now())return null
  return {token}
}
async function failedLogin(request,env){
  const ip=request.headers.get('cf-connecting-ip')||'unknown'
  const cutoff=now()-900
  await env.DB.prepare('DELETE FROM login_attempts WHERE attempted_at<?').bind(cutoff).run()
  const row=await env.DB.prepare('SELECT COUNT(*) AS c FROM login_attempts WHERE ip=? AND attempted_at>=?').bind(ip,cutoff).first()
  if(Number(row?.c||0)>=8)return true
  await env.DB.prepare('INSERT INTO login_attempts(ip,attempted_at) VALUES(?,?)').bind(ip,now()).run()
  return false
}
async function handleApi(request,env,url){
  const headers=cors(env,request)
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers})
  if(url.pathname==='/api/status'&&request.method==='GET'){
    const connected=Boolean(env.DB)
    const dns=String(env.ALLOW_DNS_MUTATIONS||'').toLowerCase()==='true'&&Boolean(env.CLOUDFLARE_API_TOKEN&&env.CLOUDFLARE_ACCOUNT_ID&&env.CLOUDFLARE_ZONE_ID)
    return json({ready:connected,connected,zone_connected:Boolean(env.CLOUDFLARE_ZONE_ID),dns_mutations:dns,pricing:{subdomain:Number(env.SUBDOMAIN_MONTHLY_CENTS||0),custom:Number(env.CUSTOM_DOMAIN_MONTHLY_CENTS||0)},message:dns?'Cloudflare control plane connected.':'Portal online; DNS activation remains locked until Cloudflare secrets are configured.'},200,headers)
  }
  if(url.pathname==='/api/check'&&request.method==='GET'){
    const label=cleanLabel(url.searchParams.get('label'))
    if(!validLabel(label))return json({available:false,reason:RESERVED.has(label)?'That name is reserved by ESN.':'Invalid subdomain label.'},200,headers)
    const hostname=label+'.'+(env.ROOT_DOMAIN||'esnoffical.com')
    const row=await env.DB.prepare("SELECT id,status FROM reservations WHERE hostname=? AND status NOT IN ('cancelled','expired','rejected') LIMIT 1").bind(hostname).first()
    return json({available:!row,hostname,reason:row?'That ESN subdomain is already reserved.':'Available for request.'},200,headers)
  }
  if(url.pathname==='/api/reservations'&&request.method==='POST'){
    const body=await request.json().catch(()=>null)
    if(!body)return json({ok:false,message:'Invalid request body.'},400,headers)
    const type=body.type==='custom'?'custom':'subdomain'
    const label=cleanLabel(body.label)
    const custom=type==='custom'?String(body.custom_domain||'').toLowerCase().trim():null
    const target=normalizeTarget(body.target_url)
    const contact=String(body.contact||'').trim().slice(0,120)
    if(!validLabel(label))return json({ok:false,available:false,message:'That ESN subdomain is invalid or reserved.'},400,headers)
    if(type==='custom'&&!validDomain(custom))return json({ok:false,message:'Enter a valid custom domain.'},400,headers)
    if(!target)return json({ok:false,message:'Destination must be a public HTTPS origin outside esnoffical.com.'},400,headers)
    if(!contact)return json({ok:false,message:'Contact is required.'},400,headers)
    const hostname=label+'.'+(env.ROOT_DOMAIN||'esnoffical.com')
    const exists=await env.DB.prepare("SELECT id FROM reservations WHERE (hostname=? OR custom_domain=?) AND status NOT IN ('cancelled','expired','rejected') LIMIT 1").bind(hostname,custom||'').first()
    if(exists)return json({ok:false,available:false,message:'That hostname is already reserved.'},409,headers)
    const requestId=id()
    const price=type==='custom'?Number(env.CUSTOM_DOMAIN_MONTHLY_CENTS||0):Number(env.SUBDOMAIN_MONTHLY_CENTS||0)
    const checkout=type==='custom'?env.CUSTOM_DOMAIN_PAYMENT_URL:env.SUBDOMAIN_PAYMENT_URL
    const state=checkout?'pending_payment':'pending_review'
    await env.DB.prepare('INSERT INTO reservations(id,type,label,hostname,custom_domain,target_url,contact,status,monthly_cents,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)').bind(requestId,type,label,hostname,custom,target,contact,state,price,now(),now()).run()
    return json({ok:true,request_id:requestId,status:state,checkout_url:checkout||null,message:checkout?'Your request is saved. Complete payment, then ESN staff can activate it.':'Your request is saved for ESN staff review. Billing has not been activated yet.'},201,headers)
  }
  if(url.pathname==='/api/admin/login'&&request.method==='POST'){
    if(await failedLogin(request,env))return json({ok:false,message:'Too many attempts. Try again later.'},429,headers)
    const body=await request.json().catch(()=>({}))
    if(!env.STAFF_CODE_HASH||await sha256(String(body.code||''))!==env.STAFF_CODE_HASH)return json({ok:false,message:'Access code rejected.'},401,headers)
    const tokenBytes=crypto.getRandomValues(new Uint8Array(32))
    const token=[...tokenBytes].map(x=>x.toString(16).padStart(2,'0')).join('')
    const hash=await sha256(token)
    const expires=now()+1800
    await env.DB.prepare('INSERT INTO admin_sessions(token_hash,expires_at) VALUES(?,?)').bind(hash,expires).run()
    return json({ok:true,token,expires_at:expires},200,headers)
  }
  if(url.pathname==='/api/admin/requests'&&request.method==='GET'){
    if(!await getAdmin(request,env))return json({ok:false,message:'Unauthorized.'},401,headers)
    const rows=await env.DB.prepare('SELECT * FROM reservations ORDER BY created_at DESC LIMIT 100').all()
    return json({ok:true,requests:rows.results||[]},200,headers)
  }
  const adminMatch=url.pathname.match(/^\/api\/admin\/requests\/([^/]+)\/(approve|suspend|renew)$/)
  if(adminMatch&&request.method==='POST'){
    if(!await getAdmin(request,env))return json({ok:false,message:'Unauthorized.'},401,headers)
    const row=await env.DB.prepare('SELECT * FROM reservations WHERE id=?').bind(adminMatch[1]).first()
    if(!row)return json({ok:false,message:'Request not found.'},404,headers)
    const action=adminMatch[2]
    if(action==='approve'){
      if(String(env.ALLOW_DNS_MUTATIONS||'').toLowerCase()!=='true')return json({ok:false,message:'DNS mutations are locked by configuration.'},409,headers)
      const workerDomain=await attachWorkerDomain(env,row.hostname)
      let customResult=null
      if(row.custom_domain)customResult=await createCustomHostname(env,row.custom_domain)
      const expiry=now()+30*86400
      const validation=customResult?.result?.ssl?.validation_records||customResult?.result?.ownership_verification||null
      await env.DB.prepare("UPDATE reservations SET status='active',worker_domain_id=?,custom_hostname_id=?,validation_json=?,activated_at=?,expires_at=?,updated_at=? WHERE id=?").bind(workerDomain?.result?.id||null,customResult?.result?.id||null,validation?JSON.stringify(validation):null,now(),expiry,now(),row.id).run()
      return json({ok:true,status:'active',hostname:row.hostname,custom_domain:row.custom_domain||null,validation},200,headers)
    }
    if(action==='suspend'){
      if(String(env.ALLOW_DNS_MUTATIONS||'').toLowerCase()==='true'){
        await deleteWorkerDomain(env,row.hostname).catch(()=>{})
        if(row.custom_hostname_id)await deleteCustomHostname(env,row.custom_hostname_id).catch(()=>{})
      }
      await env.DB.prepare("UPDATE reservations SET status='suspended',updated_at=? WHERE id=?").bind(now(),row.id).run()
      return json({ok:true,status:'suspended'},200,headers)
    }
    if(action==='renew'){
      const base=Math.max(now(),Number(row.expires_at||0))
      const expiry=base+30*86400
      await env.DB.prepare("UPDATE reservations SET expires_at=?,status=CASE WHEN status='expired' THEN 'active' ELSE status END,updated_at=? WHERE id=?").bind(expiry,now(),row.id).run()
      return json({ok:true,expires_at:expiry},200,headers)
    }
  }
  return json({ok:false,message:'Not found.'},404,headers)
}
async function proxySite(request,env,url){
  const host=url.hostname.toLowerCase()
  const row=await env.DB.prepare("SELECT target_url,status,expires_at FROM reservations WHERE (hostname=? OR custom_domain=?) LIMIT 1").bind(host,host).first()
  if(!row)return new Response('ESN Domains: hostname not active.',{status:404,headers:{'content-type':'text/plain; charset=utf-8'}})
  if(row.status!=='active')return new Response('ESN Domains: this rental is not active.',{status:423,headers:{'content-type':'text/plain; charset=utf-8'}})
  if(row.expires_at&&Number(row.expires_at)<=now()){
    await env.DB.prepare("UPDATE reservations SET status='expired',updated_at=? WHERE (hostname=? OR custom_domain=?)").bind(now(),host,host).run()
    return new Response('ESN Domains: this rental has expired.',{status:410,headers:{'content-type':'text/plain; charset=utf-8'}})
  }
  const origin=normalizeTarget(row.target_url)
  if(!origin)return new Response('ESN Domains: invalid destination.',{status:502})
  const target=new URL(url.pathname+url.search,origin)
  const headers=new Headers(request.headers)
  headers.delete('host');headers.delete('cf-connecting-ip');headers.delete('cf-ray');headers.set('x-esn-domain',host)
  return fetch(new Request(target.toString(),{method:request.method,headers,body:['GET','HEAD'].includes(request.method)?undefined:request.body,redirect:'manual'}))
}
export default {
  async fetch(request,env){
    const url=new URL(request.url)
    try{
      if(url.pathname.startsWith('/api/'))return handleApi(request,env,url)
      return proxySite(request,env,url)
    }catch(error){
      return json({ok:false,message:'ESN Domains backend error.',detail:env.EXPOSE_ERRORS==='true'?String(error?.message||error):undefined},500,cors(env,request))
    }
  },
  async scheduled(event,env){
    await env.DB.prepare("UPDATE reservations SET status='expired',updated_at=? WHERE status='active' AND expires_at IS NOT NULL AND expires_at<=?").bind(now(),now()).run()
    await env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at<=?').bind(now()).run()
    await env.DB.prepare('DELETE FROM login_attempts WHERE attempted_at<?').bind(now()-86400).run()
  }
}
