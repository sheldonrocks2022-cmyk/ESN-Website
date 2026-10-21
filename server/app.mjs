import http from 'node:http'
import {DatabaseSync} from 'node:sqlite'
import {createHash,createHmac,randomBytes,randomUUID,timingSafeEqual} from 'node:crypto'
import {existsSync,mkdirSync,readFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

// ESN Business API: Node 24+, self-hosted behind TLS on an ESN-owned VPS.
// No API secrets, infrastructure inventory, or staff permissions are sent to the browser.
const HERE=dirname(fileURLToPath(import.meta.url))
const PAYMENT_LINKS=Object.freeze(JSON.parse(readFileSync(resolve(HERE,'stripe-payment-links.json'),'utf8')))
const VERIFIED_PRICES=Object.freeze(JSON.parse(readFileSync(resolve(HERE,'stripe-live-price-ids.json'),'utf8')))
const LINK_PLAN=Object.freeze(Object.fromEntries(Object.entries(PAYMENT_LINKS).map(([name,id])=>[id,name])))
const envPath=resolve(HERE,'.env')
if(existsSync(envPath))for(const line of readFileSync(envPath,'utf8').split(/\r?\n/)){
  const found=line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)$/)
  if(found&&process.env[found[1]]===undefined){
    let v=found[2].trim()
    if((v[0]==='"'&&v.at(-1)==='"')||(v[0]==="'"&&v.at(-1)==="'"))v=v.slice(1,-1)
    process.env[found[1]]=v
  }
}
export const PLANS=Object.freeze({
  Nano:{cents:50,ram:256,cpu:25,disk:1024},Starter:{cents:75,ram:512,cpu:35,disk:2048},
  Basic:{cents:99,ram:1024,cpu:50,disk:4096},Plus:{cents:149,ram:1536,cpu:75,disk:6144},
  Advanced:{cents:199,ram:2048,cpu:100,disk:8192},Pro:{cents:299,ram:3072,cpu:125,disk:12288},
  Elite:{cents:499,ram:4096,cpu:150,disk:15360},Ultra:{cents:799,ram:6144,cpu:200,disk:20480},
  Extreme:{cents:899,ram:8192,cpu:250,disk:30720},Titan:{cents:1299,ram:10240,cpu:300,disk:40960},
  Gift:{cents:1699,ram:15360,cpu:450,disk:61440},
})
const DEFAULT={
  headline:'Good hosting, without the headache.',introduction:'Hosting and community tools, built by real people.',
  featuredPlan:'Pro',supportMessage:'Open an official ESN Discord ticket for help.',
  maintenanceNotice:'',trialPlan:'Plus',trialDays:7,
  planFinderEnabled:true,compareEnabled:true,customerWorkspaceEnabled:true,
  trialsEnabled:false,partnerApplicationsEnabled:true,referralApplicationsEnabled:true,
  rewardsInfoEnabled:true,loyaltyInfoEnabled:true,milestoneEnabled:false,milestoneMembers:'',milestoneCustomers:'',
  rewardPolicy:'Verified rewards require staff approval.',loyaltyPolicy:'Loyalty benefits require verified renewals.',
}
const TYPES=new Set(['Hosting order','Server upgrade','Free trial','Partner application','Referral enquiry','Customer review','General support'])
const STATES=new Set(['reviewed','approved','rejected','completed'])
const RUNTIMES=new Set(['nodejs','python'])
const sha=v=>createHash('sha256').update(String(v)).digest('hex')
const random=()=>randomBytes(32).toString('base64url')
const secureEqual=(a,b)=>{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&timingSafeEqual(x,y)}
const iso=()=>new Date().toISOString()
const error=(status,message)=>Object.assign(new Error(message),{status})
const obj=(value,otherwise={})=>{try{const x=JSON.parse(value);return x&&typeof x==='object'&&!Array.isArray(x)?x:otherwise}catch{return otherwise}}
const trim=(v,n)=>typeof v==='string'?v.trim().slice(0,n):''
const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}
function send(res,status,data){res.writeHead(status,headers);res.end(JSON.stringify(data))}
function redirect(res,url){res.writeHead(302,{'Location':url,'Cache-Control':'no-store'});res.end()}
function cookieJar(req){
  const o={};for(const part of String(req.headers.cookie||'').split(';')){
    const i=part.indexOf('=');if(i>0)try{o[part.slice(0,i).trim()]=decodeURIComponent(part.slice(i+1).trim())}catch{}
  }return o
}
function cookie(res,name,value,maxAge){
  const current=res.getHeader('Set-Cookie')||[]
  res.setHeader('Set-Cookie',[...current,name+'='+encodeURIComponent(value)+'; Secure; HttpOnly; SameSite=Lax; Path=/; Max-Age='+maxAge])
}
async function raw(req,limit=65536){
  let size=0;const blocks=[]
  for await(const block of req){size+=block.length;if(size>limit)throw error(413,'body_too_large');blocks.push(block)}
  return Buffer.concat(blocks)
}
async function body(req){
  if(!String(req.headers['content-type']||'').startsWith('application/json'))throw error(415,'json_required')
  const data=obj((await raw(req)).toString('utf8'),null)
  if(!data)throw error(400,'invalid_json')
  return data
}
export function initDb(filename=':memory:'){
  if(filename!==':memory:')mkdirSync(dirname(filename),{recursive:true})
  const db=new DatabaseSync(filename)
  db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;')
  db.exec([
    'CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT,avatar TEXT,created TEXT NOT NULL)',
    'CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,uid TEXT NOT NULL,csrf TEXT NOT NULL,expires INTEGER NOT NULL)',
    'CREATE TABLE IF NOT EXISTS settings(id INTEGER PRIMARY KEY CHECK(id=1),config TEXT NOT NULL,updated TEXT NOT NULL)',
    'CREATE TABLE IF NOT EXISTS requests(id TEXT PRIMARY KEY,uid TEXT NOT NULL,kind TEXT NOT NULL,plan TEXT,notes TEXT NOT NULL,status TEXT NOT NULL,created TEXT NOT NULL,updated TEXT NOT NULL)',
    'CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY,uid TEXT NOT NULL,plan TEXT NOT NULL,status TEXT NOT NULL,checkout_id TEXT UNIQUE,subscription_id TEXT UNIQUE,server_id TEXT,error TEXT,created TEXT NOT NULL,updated TEXT NOT NULL)',
    'CREATE TABLE IF NOT EXISTS stripe_events(id TEXT PRIMARY KEY,kind TEXT NOT NULL,at TEXT NOT NULL)',
    'CREATE TABLE IF NOT EXISTS payment_link_orders(checkout_id TEXT PRIMARY KEY,link_id TEXT NOT NULL,subscription_id TEXT UNIQUE,plan TEXT NOT NULL,email TEXT NOT NULL,status TEXT NOT NULL,claimed_uid TEXT,created TEXT NOT NULL,updated TEXT NOT NULL)',
    'CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY AUTOINCREMENT,at TEXT NOT NULL,actor TEXT NOT NULL,event TEXT NOT NULL,target TEXT NOT NULL,details TEXT NOT NULL)',
  ].join(';')+';')
  // Preserve existing orders; older live SQLite databases lack runtime.
  if(!db.prepare('PRAGMA table_info(orders)').all().some(col=>col.name==='runtime'))
    db.exec('ALTER TABLE orders ADD COLUMN runtime TEXT')
  db.prepare('INSERT OR IGNORE INTO settings(id,config,updated) VALUES(1,?,?)').run(JSON.stringify(DEFAULT),iso())
  return db
}
function config(e){
  const api=String(e.API_PUBLIC_URL||'https://api.esnoffical.com').replace(/\/$/,'')
  const site=String(e.PUBLIC_SITE_ORIGIN||'https://esnoffical.com').replace(/\/$/,'')
  if(e.NODE_ENV==='production'&&(!api.startsWith('https://')||!site.startsWith('https://')))throw Error('HTTPS required')
  return {
    api,site,discordId:e.DISCORD_CLIENT_ID||'',discordSecret:e.DISCORD_CLIENT_SECRET||'',
    callback:e.DISCORD_REDIRECT_URI||api+'/v1/auth/discord/callback',
    staff:new Set((e.STAFF_DISCORD_IDS||'').split(',').map(s=>s.trim()).filter(Boolean)),
    stripeKey:e.STRIPE_SECRET_KEY||'',stripeWebhook:e.STRIPE_WEBHOOK_SECRET||'',
    prices:obj(e.STRIPE_PRICE_IDS_JSON||'{}'),
    panel:String(e.PTERODACTYL_URL||'').replace(/\/$/,''),
    panelKey:e.PTERODACTYL_API_KEY||'',
    node:Number(e.PTERODACTYL_NODE_ID)||0,
    allocation:Number(e.PTERODACTYL_ALLOCATION_ID)||0,
    // Staging either egg must NOT turn production provisioning on.
    manualProvisionEnabled:e.PTERODACTYL_PROVISIONING_ENABLED==='true',
    runtimes:Object.fromEntries(['nodejs','python'].map(runtime=>{
      const pre='PTERODACTYL_'+runtime.toUpperCase()+'_'
      return [runtime,{
        egg:Number(e[pre+'EGG_ID'])||0,
        image:e[pre+'DOCKER_IMAGE']||'',
        startup:e[pre+'STARTUP']||'',
        environment:obj(e[pre+'ENV_JSON']||'{}')
      }]
    })),
  }
}
const stripeReady=c=>Boolean(c.stripeKey&&c.stripeWebhook&&Object.keys(PLANS).every(k=>/^price_/.test(c.prices[k]||'')))
const pteroReady=c=>Boolean(c.manualProvisionEnabled&&c.panel.startsWith('https://')&&
  c.panelKey&&c.node===3&&c.allocation===337&&
  ['nodejs','python'].every(runtime=>{
    const v=c.runtimes[runtime]
    return v.egg===(runtime==='nodejs'?16:15)&&v.image&&v.startup&&v.environment
  }))
function audit(db,uid,event,target,details=''){
  db.prepare('INSERT INTO audit(at,actor,event,target,details) VALUES(?,?,?,?,?)').run(iso(),uid,event,target,trim(details,500))
}
function auth(db,req){
  const token=cookieJar(req)['__Host-esn_session']
  if(!token)throw error(401,'login_required')
  const row=db.prepare('SELECT u.*,s.csrf,s.expires FROM sessions s JOIN users u ON u.id=s.uid WHERE s.token=?').get(sha(token))
  if(!row||row.expires<Date.now())throw error(401,'session_expired')
  return row
}
function staff(db,req,c){const user=auth(db,req);if(!c.staff.has(user.id))throw error(403,'staff_permission_required');return user}
function csrf(req,user){
  const token=String(req.headers['x-esn-csrf']||'')
  if(token.length<32||!secureEqual(sha(token),user.csrf))throw error(403,'csrf_required')
}
function settings(db){return obj(db.prepare('SELECT config FROM settings WHERE id=1').get().config,DEFAULT)}
function sanitize(input){
  const safe={}
  for(const [key,value] of Object.entries(input)){
    if(!(key in DEFAULT))continue
    if(typeof DEFAULT[key]==='boolean'&&typeof value==='boolean')safe[key]=value
    else if(typeof DEFAULT[key]==='number'&&Number.isInteger(value))safe[key]=Math.max(1,Math.min(30,value))
    else if(typeof DEFAULT[key]==='string'&&typeof value==='string')safe[key]=value.slice(0,500)
  }
  if(safe.featuredPlan&&!PLANS[safe.featuredPlan])delete safe.featuredPlan
  if(safe.trialPlan&&!PLANS[safe.trialPlan])delete safe.trialPlan
  for(const key of ['milestoneMembers','milestoneCustomers'])if(safe[key])safe[key]=safe[key].replace(/\D/g,'').slice(0,10)
  return safe
}
export function verifyStripe(payload,signature,secret,now=Date.now()){
  if(!secret||!signature||!Buffer.isBuffer(payload))return false
  const fields=String(signature).split(',').map(s=>s.trim())
  const t=fields.find(s=>s.startsWith('t='))?.slice(2)
  const sigs=fields.filter(s=>s.startsWith('v1=')).map(s=>s.slice(3))
  if(!t||!/^\d+$/.test(t)||Math.abs(now/1000-Number(t))>300||!sigs.length)return false
  const expected=createHmac('sha256',secret).update(t+'.').update(payload).digest('hex')
  return sigs.some(sig=>secureEqual(expected,sig))
}
async function postStripe(c,fields,idempotency){
  const res=await fetch('https://api.stripe.com/v1/checkout/sessions',{
    method:'POST',
    headers:{'Authorization':'Bearer '+c.stripeKey,'Content-Type':'application/x-www-form-urlencoded','Idempotency-Key':idempotency},
    body:new URLSearchParams(fields),
  })
  const result=await res.json()
  if(!res.ok)throw error(502,'stripe_checkout_failed')
  return result
}
async function panel(c,path,method='GET',payload){
  const res=await fetch(c.panel+'/api/application'+path,{
    method,headers:{Authorization:'Bearer '+c.panelKey,Accept:'Application/vnd.pterodactyl.v1+json','Content-Type':'application/json'},
    ...(payload?{body:JSON.stringify(payload)}:{})
  })
  if(res.status===404)return null
  const result=await res.json().catch(()=>({}))
  if(!res.ok)throw error(502,'pterodactyl_operation_failed')
  return result
}
async function provision(db,c,id,actor){
  if(!pteroReady(c))throw error(503,'pterodactyl_not_connected')
  const order=db.prepare('SELECT * FROM orders WHERE id=?').get(id)
  if(!order)throw error(404,'order_not_found')
  if(order.server_id)return {status:'active'}
  if(!['paid','provision_error'].includes(order.status))throw error(409,'verified_payment_required')
  if(!RUNTIMES.has(order.runtime))throw error(409,'staff_must_choose_runtime')
  const runtime=c.runtimes[order.runtime]
  // One configured allocation only: recheck Pterodactyl's ownership at creation time.
  const allocRes=await panel(c,'/nodes/'+c.node+'/allocations?per_page=100')
  const chosen=allocRes?.data?.map(item=>item.attributes).find(item=>Number(item?.id)===c.allocation)
  if(!chosen||chosen.assigned!==false)throw error(409,'configured_allocation_not_available')
  // One configured allocation: fail closed instead of overselling server capacity.
  if(db.prepare("SELECT count(*) count FROM orders WHERE (server_id IS NOT NULL OR status='provisioning') AND id<>?").get(id).count>0)
    throw error(409,'allocation_requires_staff_review')
  const user=db.prepare('SELECT * FROM users WHERE id=?').get(order.uid)
  if(!user?.email)throw error(409,'verified_discord_email_required')
  const claimed=db.prepare("UPDATE orders SET status='provisioning',updated=? WHERE id=? AND status IN ('paid','provision_error') AND server_id IS NULL AND runtime IN ('nodejs','python') AND NOT EXISTS (SELECT 1 FROM orders AS other WHERE other.id<>? AND (other.server_id IS NOT NULL OR other.status='provisioning'))").run(iso(),id,id)
  if(!claimed.changes)throw error(409,'provision_in_progress')
  const existing=await panel(c,'/servers/external/'+encodeURIComponent(order.id))
  if(existing?.attributes?.id){
    db.prepare("UPDATE orders SET status='active',server_id=?,updated=? WHERE id=?").run(String(existing.attributes.id),iso(),id)
    return {status:'active'}
  }
  const external='esn-'+user.id
  let puser=await panel(c,'/users/external/'+external)
  if(!puser)puser=await panel(c,'/users','POST',{
    external_id:external,email:user.email,username:'esn'+user.id,
    first_name:'ESN',last_name:'Customer',password:random()+random(),
  })
  if(!puser?.attributes?.id)throw error(502,'pterodactyl_user_failed')
  const p=PLANS[order.plan]
  const server=await panel(c,'/servers','POST',{
    external_id:order.id,name:'ESN '+order.plan+' '+user.id,
    user:puser.attributes.id,egg:runtime.egg,docker_image:runtime.image,
    startup:runtime.startup,environment:runtime.environment,
    limits:{memory:p.ram,swap:0,disk:p.disk,io:500,cpu:p.cpu},
    feature_limits:{databases:0,allocations:1,backups:1},
    allocation:{default:c.allocation}
  })
  if(!server?.attributes?.id)throw error(502,'pterodactyl_create_failed')
  db.prepare("UPDATE orders SET status='active',server_id=?,error=NULL,updated=? WHERE id=?").run(String(server.attributes.id),iso(),id)
  audit(db,actor,'server.provisioned',id)
  return {status:'active'}
}
/**
 * Payment Links do not send our own customer order ID. Before accepting a
 * signed checkout event, cross-check the actual purchased recurring price
 * directly with Stripe. Payment Link metadata by itself is not proof of plan.
 */
async function verifyPaymentLinkPurchase(c,checkout){
  const plan=LINK_PLAN[checkout.payment_link]
  if(!plan||checkout.mode!=='subscription'||checkout.payment_status!=='paid'||!checkout.id||!checkout.subscription)return null
  const email=trim(checkout.customer_details?.email||checkout.customer_email,254).toLowerCase()
  if(!email||!email.includes('@'))throw error(422,'stripe_checkout_email_required')
  if(!c.stripeKey)throw error(503,'stripe_api_required_to_verify_link')
  const url='https://api.stripe.com/v1/checkout/sessions/'+encodeURIComponent(checkout.id)+'/line_items?limit=10'
  const response=await fetch(url,{headers:{Authorization:'Bearer '+c.stripeKey}})
  if(!response.ok)throw error(502,'stripe_line_item_verification_failed')
  const data=await response.json()
  const lines=data?.data
  if(data?.has_more||!Array.isArray(lines)||lines.length!==1||
     lines[0]?.price?.id!==VERIFIED_PRICES[plan]||
     lines[0]?.quantity!==1||
     lines[0]?.price?.currency!=='usd'||
     lines[0]?.price?.recurring?.interval!=='month'||
     lines[0]?.price?.recurring?.interval_count!==1)
    throw error(422,'stripe_link_plan_mismatch')
  return {checkout:checkout.id,link:checkout.payment_link,subscription:checkout.subscription,plan,email}
}
function applyStripe(db,event,verifiedLink=null){
  if(db.prepare('SELECT id FROM stripe_events WHERE id=?').get(event.id))return
  const o=event.data?.object||{}
  if(['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type)&&verifiedLink){
    const payment=verifiedLink
    db.prepare("INSERT OR IGNORE INTO payment_link_orders(checkout_id,link_id,subscription_id,plan,email,status,claimed_uid,created,updated) VALUES(?,?,?,?,?,'paid',NULL,?,?)").run(
      payment.checkout,payment.link,payment.subscription,payment.plan,payment.email,iso(),iso())
    audit(db,'stripe','payment_link.verified',payment.checkout,payment.plan)
  }
  if(event.type==='checkout.session.completed'&&o.client_reference_id&&o.mode==='subscription'&&o.payment_status==='paid'&&o.subscription){
    db.prepare("UPDATE orders SET status='paid',subscription_id=?,updated=? WHERE id=? AND checkout_id=? AND status IN ('checkout_pending','paid','provision_error')").run(o.subscription,iso(),o.client_reference_id,o.id)
  }else if(event.type==='invoice.paid'&&o.subscription){
    db.prepare("UPDATE payment_link_orders SET status='paid',updated=? WHERE subscription_id=? AND status!='canceled'").run(iso(),o.subscription)
    db.prepare("UPDATE orders SET status=CASE WHEN server_id IS NOT NULL THEN 'active' ELSE 'paid' END,updated=? WHERE subscription_id=? AND status!='canceled'").run(iso(),o.subscription)
  }else if(event.type==='invoice.payment_failed'&&o.subscription){
    db.prepare("UPDATE payment_link_orders SET status='past_due',updated=? WHERE subscription_id=?").run(iso(),o.subscription)
    db.prepare("UPDATE orders SET status='past_due',updated=? WHERE subscription_id=?").run(iso(),o.subscription)
  }else if(event.type==='customer.subscription.deleted'&&o.id){
    db.prepare("UPDATE payment_link_orders SET status='canceled',updated=? WHERE subscription_id=?").run(iso(),o.id)
    db.prepare("UPDATE orders SET status='canceled',updated=? WHERE subscription_id=?").run(iso(),o.id)
    // Staff must review paid access; never delete customer files automatically.
  }
  db.prepare('INSERT INTO stripe_events(id,kind,at) VALUES(?,?,?)').run(event.id,event.type,iso())
}
const rates=new Map()
function rate(key,max=40){
  const now=Date.now(),r=rates.get(key)||{start:now,count:0}
  if(now-r.start>60000){r.start=now;r.count=0}
  r.count++;rates.set(key,r)
  if(rates.size>10000)rates.clear()
  if(r.count>max)throw error(429,'rate_limited')
}
export function handler(db,env=process.env){
  const c=config(env)
  return async(req,res)=>{
    try{
      const origin=req.headers.origin
      if(origin===c.site){
        res.setHeader('Access-Control-Allow-Origin',c.site)
        res.setHeader('Access-Control-Allow-Credentials','true')
        res.setHeader('Access-Control-Allow-Headers','Content-Type,X-ESN-CSRF')
        res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,OPTIONS')
        res.setHeader('Vary','Origin')
      }
      if(req.method==='OPTIONS'){if(origin!==c.site)throw error(403,'origin_forbidden');res.writeHead(204);return res.end()}
      const path=new URL(req.url||'/',c.api).pathname
      const remote=req.socket.remoteAddress||'local'
      const realIp=(remote==='127.0.0.1'||remote==='::1'||remote==='::ffff:127.0.0.1')?
        trim(req.headers['x-real-ip'],65)||remote:remote
      rate(realIp+path,path.includes('/auth')?12:60)
      if(path==='/health'&&req.method==='GET')return send(res,200,{ok:true,service:'esn-business'})
      if(path==='/v1/public'&&req.method==='GET')return send(res,200,{
        settings:settings(db),plans:Object.fromEntries(Object.entries(PLANS).map(([name,p])=>[name,{
          price:p.cents/100,ramMb:p.ram,cpuPercent:p.cpu,storageMb:p.disk
        }])),
        integrations:{discord:!!(c.discordId&&c.discordSecret),stripe:stripeReady(c),provisioning:pteroReady(c)}
      })
      if(path==='/v1/stripe/webhook'&&req.method==='POST'){
        const data=await raw(req,1048576)
        if(!verifyStripe(data,req.headers['stripe-signature'],c.stripeWebhook))throw error(400,'invalid_stripe_signature')
        const event=obj(data.toString('utf8'),null)
        if(!event?.id||!event.type)throw error(400,'invalid_stripe_event')
        const checkout=['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type)?event.data?.object:null
        const verifiedLink=checkout?.payment_link?await verifyPaymentLinkPurchase(c,checkout):null
        db.exec('BEGIN IMMEDIATE')
        try{applyStripe(db,event,verifiedLink);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}
        return send(res,200,{received:true})
      }
      if(path==='/v1/auth/discord/start'&&req.method==='GET'){
        if(!c.discordId||!c.discordSecret)throw error(503,'discord_not_configured')
        const state=random(),verifier=random()
        cookie(res,'__Host-esn_oauth',state+'.'+verifier,600)
        const q=new URLSearchParams({
          client_id:c.discordId,redirect_uri:c.callback,response_type:'code',
          scope:'identify email',state,code_challenge:createHash('sha256').update(verifier).digest('base64url'),code_challenge_method:'S256'
        })
        // Encode the OAuth scope separator as %20; Discord may reject '+' as an invalid scope.
        return redirect(res,'https://discord.com/oauth2/authorize?'+q.toString().replace('scope=identify+email','scope=identify%20email'))
      }
      if(path==='/v1/auth/discord/callback'&&req.method==='GET'){
        const url=new URL(req.url,c.api),o=cookieJar(req)['__Host-esn_oauth']||''
        const [state,verifier]=o.split('.')
        cookie(res,'__Host-esn_oauth','',0)
        if(!state||!verifier||!secureEqual(state,url.searchParams.get('state')||'')||!url.searchParams.get('code'))
          throw error(400,'oauth_state_invalid')
        const tokenRes=await fetch('https://discord.com/api/v10/oauth2/token',{method:'POST',
          headers:{'Content-Type':'application/x-www-form-urlencoded'},
          body:new URLSearchParams({client_id:c.discordId,client_secret:c.discordSecret,grant_type:'authorization_code',
            code:url.searchParams.get('code'),redirect_uri:c.callback,code_verifier:verifier})
        })
        if(!tokenRes.ok)throw error(502,'discord_token_failed')
        const token=await tokenRes.json()
        const userRes=await fetch('https://discord.com/api/v10/users/@me',{headers:{Authorization:'Bearer '+token.access_token}})
        if(!userRes.ok)throw error(502,'discord_user_failed')
        const user=await userRes.json()
        if(!/^\d{15,22}$/.test(user.id||''))throw error(502,'discord_user_invalid')
        db.prepare('INSERT INTO users(id,name,email,avatar,created) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,email=excluded.email,avatar=excluded.avatar').run(
          user.id,trim(user.global_name||user.username,80),user.verified?user.email||null:null,user.avatar||null,iso())
        const session=random(),cs=random()
        db.prepare('INSERT INTO sessions(token,uid,csrf,expires) VALUES(?,?,?,?)').run(sha(session),user.id,sha(cs),Date.now()+604800000)
        cookie(res,'__Host-esn_session',session,604800)
        audit(db,user.id,'auth.login',user.id)
        return redirect(res,c.site+'/business/dashboard?login=success')
      }
      if(!['GET','HEAD'].includes(req.method)&&origin!==c.site)throw error(403,'origin_forbidden')
      if(path==='/v1/me'&&req.method==='GET'){
        const user=auth(db,req);return send(res,200,{user:{id:user.id,name:user.name,staff:c.staff.has(user.id)}})
      }
      if(path==='/v1/session/csrf'&&req.method==='GET'){
        const user=auth(db,req),secret=random()
        db.prepare('UPDATE sessions SET csrf=? WHERE token=?').run(sha(secret),sha(cookieJar(req)['__Host-esn_session']))
        return send(res,200,{csrf:secret,user:{id:user.id,name:user.name,staff:c.staff.has(user.id)}})
      }
      if(path==='/v1/auth/logout'&&req.method==='POST'){
        const user=auth(db,req);csrf(req,user)
        db.prepare('DELETE FROM sessions WHERE token=?').run(sha(cookieJar(req)['__Host-esn_session']))
        cookie(res,'__Host-esn_session','',0);return send(res,200,{ok:true})
      }
      if(path==='/v1/requests'&&req.method==='GET'){
        const user=auth(db,req);return send(res,200,{requests:db.prepare(
          'SELECT id,kind,plan,notes,status,created,updated FROM requests WHERE uid=? ORDER BY created DESC LIMIT 100'
        ).all(user.id)})
      }
      if(path==='/v1/requests'&&req.method==='POST'){
        const user=auth(db,req);csrf(req,user)
        const input=await body(req),kind=trim(input.kind,48),plan=trim(input.plan,30),notes=trim(input.notes,500)
        if(!TYPES.has(kind)||plan&&!PLANS[plan])throw error(400,'invalid_request')
        const cfg=settings(db)
        if(kind==='Free trial'&&!cfg.trialsEnabled)throw error(409,'trials_closed')
        if(kind==='Partner application'&&!cfg.partnerApplicationsEnabled)throw error(409,'partners_closed')
        if(kind==='Referral enquiry'&&!cfg.referralApplicationsEnabled)throw error(409,'referrals_closed')
        const count=db.prepare('SELECT count(*) n FROM requests WHERE uid=? AND created>?').get(user.id,new Date(Date.now()-3600000).toISOString()).n
        if(count>=5)throw error(429,'request_limit_reached')
        const id=randomUUID(),at=iso()
        db.prepare('INSERT INTO requests VALUES(?,?,?,?,?,?,?,?)').run(id,user.id,kind,plan||null,notes,'pending',at,at)
        audit(db,user.id,'request.created',id,kind)
        return send(res,201,{id,status:'pending'})
      }
      if(path==='/v1/payment-links/claim'&&req.method==='POST'){
        const user=auth(db,req);csrf(req,user)
        const email=trim(user.email,254).toLowerCase()
        if(!email)throw error(409,'verified_discord_email_required')
        const matches=db.prepare("SELECT checkout_id,subscription_id,plan FROM payment_link_orders WHERE email=? AND status='paid' AND claimed_uid IS NULL LIMIT 50").all(email)
        const at=iso();let count=0
        db.exec('BEGIN IMMEDIATE')
        try{
          for(const pay of matches){
            const claimed=db.prepare("UPDATE payment_link_orders SET claimed_uid=?,updated=? WHERE checkout_id=? AND claimed_uid IS NULL AND status='paid'").run(user.id,at,pay.checkout_id)
            if(!claimed.changes)continue
            db.prepare("INSERT INTO orders(id,uid,plan,status,checkout_id,subscription_id,created,updated) VALUES(?,?,?,?,?,?,?,?)").run(
              randomUUID(),user.id,pay.plan,'paid',pay.checkout_id,pay.subscription_id,at,at)
            audit(db,user.id,'payment_link.claimed',pay.checkout_id,pay.plan)
            count++
          }
          db.exec('COMMIT')
        }catch(e){db.exec('ROLLBACK');throw e}
        return send(res,200,{claimed:count,message:'Only webhook-verified payments matching your Discord-verified email can be linked.'})
      }
      if(path==='/v1/orders'&&req.method==='GET'){
        const user=auth(db,req);return send(res,200,{orders:db.prepare(
          'SELECT id,plan,runtime,status,created,updated FROM orders WHERE uid=? ORDER BY created DESC LIMIT 100'
        ).all(user.id)})
      }
      if(path==='/v1/checkout'&&req.method==='POST'){
        const user=auth(db,req);csrf(req,user)
        if(!stripeReady(c))throw error(503,'billing_not_configured')
        const input=await body(req),plan=trim(input.plan,30)
        if(!PLANS[plan])throw error(400,'invalid_plan')
        if(db.prepare('SELECT count(*) n FROM orders WHERE uid=? AND created>?').get(user.id,new Date(Date.now()-3600000).toISOString()).n>=5)
          throw error(429,'checkout_limit_reached')
        const id=randomUUID(),at=iso()
        db.prepare('INSERT INTO orders(id,uid,plan,status,created,updated) VALUES(?,?,?,?,?,?)').run(id,user.id,plan,'initiated',at,at)
        try{
          const result=await postStripe(c,{
            mode:'subscription','line_items[0][price]':c.prices[plan],'line_items[0][quantity]':'1',
            client_reference_id:id,success_url:c.site+'/business/dashboard?checkout=return',
            cancel_url:c.site+'/business/plans?checkout=cancelled',
            ...(user.email?{customer_email:user.email}:{}),
            'metadata[esn_order_id]':id,'metadata[esn_plan]':plan
          },'esn_checkout_'+id)
          if(!result.url||!result.id)throw error(502,'stripe_checkout_incomplete')
          db.prepare("UPDATE orders SET status='checkout_pending',checkout_id=?,updated=? WHERE id=?").run(result.id,iso(),id)
          audit(db,user.id,'checkout.created',id,plan)
          return send(res,201,{orderId:id,checkoutUrl:result.url})
        }catch(e){
          db.prepare("UPDATE orders SET status='checkout_error',error=?,updated=? WHERE id=?").run(trim(e.message,150),iso(),id)
          throw e
        }
      }
      if(path==='/v1/billing/portal'&&req.method==='POST'){
        const user=auth(db,req);csrf(req,user)
        if(!stripeReady(c))throw error(503,'billing_not_configured')
        const owned=db.prepare("SELECT checkout_id FROM orders WHERE uid=? AND checkout_id IS NOT NULL AND subscription_id IS NOT NULL ORDER BY created DESC LIMIT 1").get(user.id)
        if(!owned)throw error(404,'no_subscription_available')
        const sessionRes=await fetch('https://api.stripe.com/v1/checkout/sessions/'+encodeURIComponent(owned.checkout_id),{
          headers:{Authorization:'Bearer '+c.stripeKey}
        })
        if(!sessionRes.ok)throw error(502,'stripe_session_lookup_failed')
        const checkout=await sessionRes.json()
        if(checkout.mode!=='subscription'||!checkout.customer)throw error(409,'subscription_customer_unavailable')
        const portalRes=await fetch('https://api.stripe.com/v1/billing_portal/sessions',{
          method:'POST',
          headers:{Authorization:'Bearer '+c.stripeKey,'Content-Type':'application/x-www-form-urlencoded'},
          body:new URLSearchParams({customer:checkout.customer,return_url:c.site+'/business/dashboard'})
        })
        if(!portalRes.ok)throw error(502,'stripe_portal_not_available')
        const portal=await portalRes.json()
        if(!portal.url||!portal.url.startsWith('https://billing.stripe.com/'))throw error(502,'invalid_portal_url')
        audit(db,user.id,'billing.portal_opened',owned.checkout_id)
        return send(res,200,{portalUrl:portal.url})
      }
      if(path==='/v1/staff/overview'&&req.method==='GET'){
        const user=staff(db,req,c)
        return send(res,200,{user:{id:user.id,name:user.name,staff:true},settings:settings(db),
          requests:db.prepare('SELECT r.*,u.name username FROM requests r JOIN users u ON u.id=r.uid ORDER BY r.created DESC LIMIT 150').all(),
          orders:db.prepare('SELECT o.id,o.uid,o.plan,o.runtime,o.status,o.created,o.updated,u.name username FROM orders o JOIN users u ON u.id=o.uid ORDER BY o.created DESC LIMIT 150').all(),
          paymentLinks:db.prepare("SELECT checkout_id,plan,email,status,claimed_uid,created,updated FROM payment_link_orders ORDER BY created DESC LIMIT 150").all(),
          audit:db.prepare('SELECT at,actor,event,target,details FROM audit ORDER BY id DESC LIMIT 100').all(),
          integrations:{discord:!!c.discordSecret,stripe:stripeReady(c),provisioning:pteroReady(c)}})
      }
      if(path==='/v1/staff/settings'&&req.method==='PATCH'){
        const user=staff(db,req,c);csrf(req,user)
        const incoming=await body(req)
        const changed=sanitize(incoming),next={...settings(db),...changed}
        db.prepare('UPDATE settings SET config=?,updated=? WHERE id=1').run(JSON.stringify(next),iso())
        audit(db,user.id,'settings.updated','business',Object.keys(changed).join(','))
        return send(res,200,{settings:next})
      }
      const matchRequest=path.match(/^\/v1\/staff\/requests\/([a-f0-9-]{36})$/)
      if(matchRequest&&req.method==='PATCH'){
        const user=staff(db,req,c);csrf(req,user)
        const status=trim((await body(req)).status,20)
        if(!STATES.has(status))throw error(400,'invalid_status')
        const result=db.prepare("UPDATE requests SET status=?,updated=? WHERE id=? AND status NOT IN ('rejected','completed')").run(status,iso(),matchRequest[1])
        if(!result.changes)throw error(409,'request_not_open')
        audit(db,user.id,'request.'+status,matchRequest[1])
        return send(res,200,{status})
      }
      // Staff explicitly selects the runtime for each VERIFIED paid order.
      // Existing and Payment Link orders are initially null and can never be guessed.
      const matchRuntime=path.match(/^\/v1\/staff\/orders\/([a-f0-9-]{36})\/runtime$/)
      if(matchRuntime&&req.method==='PATCH'){
        const user=staff(db,req,c);csrf(req,user)
        const runtime=trim((await body(req)).runtime,20)
        if(!RUNTIMES.has(runtime))throw error(400,'invalid_hosting_runtime')
        const saved=db.prepare("UPDATE orders SET runtime=?,updated=? WHERE id=? AND status IN ('paid','provision_error') AND server_id IS NULL").run(runtime,iso(),matchRuntime[1])
        if(!saved.changes)throw error(409,'runtime_selection_requires_unprovisioned_paid_order')
        audit(db,user.id,'order.runtime_selected',matchRuntime[1],runtime)
        return send(res,200,{runtime})
      }
      const matchOrder=path.match(/^\/v1\/staff\/orders\/([a-f0-9-]{36})\/provision$/)
      if(matchOrder&&req.method==='POST'){
        const user=staff(db,req,c);csrf(req,user)
        try{return send(res,200,await provision(db,c,matchOrder[1],user.id))}
        catch(e){
          const order=db.prepare('SELECT status FROM orders WHERE id=?').get(matchOrder[1])
          // Preflight failures must not turn a good paid order into a failed order.
          if(order?.status==='provisioning')
            db.prepare("UPDATE orders SET status='provision_error',error=?,updated=? WHERE id=?").run(trim(e.message,160),iso(),matchOrder[1])
          throw e
        }
      }
      return send(res,404,{error:'not_found'})
    }catch(e){
      const status=e.status||500
      if(status===500)console.error('ESN API error',e.message)
      if(!res.headersSent)send(res,status,{error:status===500?'internal_error':e.message})
      else res.end()
    }
  }
}
export function start(){
  const db=initDb(process.env.DATABASE_FILE||resolve(HERE,'data/business.sqlite'))
  // Recover interrupted provision requests for staff reconciliation. The
  // Pterodactyl external ID check prevents recreating an existing server.
  db.prepare("UPDATE orders SET status='provision_error',error='interrupted_provision',updated=? WHERE status='provisioning'").run(iso())
  db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now())
  const server=http.createServer(handler(db))
  const port=Number(process.env.PORT||8787),host=process.env.HOST||'127.0.0.1'
  server.listen(port,host,()=>console.log('ESN Business API on '+host+':'+port))
  return {server,db}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))start()
