import test from 'node:test'
import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {createHash} from 'node:crypto'
import {mkdtempSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {DatabaseSync} from 'node:sqlite'
import {handler,initDb} from '../app.mjs'

const SITE='https://esnoffical.com'
const OWNER='1515077206886453469',CUSTOMER='123456789012345678'
const tokenHash=value=>createHash('sha256').update(value).digest('hex')
const csrf='session-csrf-token-at-least-32-characters'
const NODE3_ENV={
  NODE_ENV:'test',
  PUBLIC_SITE_ORIGIN:SITE,
  API_PUBLIC_URL:'https://api.esnoffical.com',
  STAFF_DISCORD_IDS:OWNER,
  PTERODACTYL_URL:'https://panel.test.invalid',
  PTERODACTYL_API_KEY:'ptla_test_private_key_not_real',
  PTERODACTYL_NODE_ID:'3',
  PTERODACTYL_ALLOCATION_ID:'337',
  PTERODACTYL_NODEJS_EGG_ID:'16',
  PTERODACTYL_NODEJS_DOCKER_IMAGE:'ghcr.io/parkervcp/yolks:nodejs_24',
  PTERODACTYL_NODEJS_STARTUP:'node index.js',
  PTERODACTYL_NODEJS_ENV_JSON:'{}',
  PTERODACTYL_PYTHON_EGG_ID:'15',
  PTERODACTYL_PYTHON_DOCKER_IMAGE:'ghcr.io/parkervcp/yolks:python_3.13',
  PTERODACTYL_PYTHON_STARTUP:'python3 main.py',
  PTERODACTYL_PYTHON_ENV_JSON:'{}',
  PTERODACTYL_PROVISIONING_ENABLED:'false'
}
async function fixture(fn,override={}){
  const db=initDb()
  for(const uid of [OWNER,CUSTOMER]){
    db.prepare('INSERT INTO users(id,name,email,avatar,created) VALUES(?,?,?,?,?)')
      .run(uid,'Test '+uid,'verified@example.invalid',null,new Date().toISOString())
  }
  for(const [actor,uid] of [['owner',OWNER],['customer',CUSTOMER]]){
    db.prepare('INSERT INTO sessions(token,uid,csrf,expires) VALUES(?,?,?,?)')
      .run(tokenHash(actor+'-session'),uid,tokenHash(csrf),Date.now()+120000)
  }
  const server=createServer(handler(db,{...NODE3_ENV,...override}))
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
  const base='http://127.0.0.1:'+server.address().port
  async function request(path,{actor=null,method='GET',json=null,origin=SITE}={}){
    const r=await fetch(base+path,{method,headers:{
      ...(actor?{Cookie:'__Host-esn_session='+actor+'-session'}:{}),
      ...(method==='GET'?{}:{Origin:origin,'Content-Type':'application/json','X-ESN-CSRF':csrf})
    },...(json!==null?{body:JSON.stringify(json)}:{})})
    return {status:r.status,data:await r.json()}
  }
  try{await fn({db,request,base})}
  finally{await new Promise(resolve=>server.close(resolve));db.close()}
}
function paidOrder(db,id='10000000-0000-4000-8000-000000000002',status='paid'){
  const at=new Date().toISOString()
  db.prepare('INSERT INTO orders(id,uid,plan,status,created,updated) VALUES(?,?,?,?,?,?)')
    .run(id,CUSTOMER,'Pro',status,at,at)
  return id
}
test('existing SQLite orders gain nullable runtime without destroying data',()=>{
  const folder=mkdtempSync(join(tmpdir(),'esn-runtime-'))
  try{
    const file=join(folder,'business.sqlite')
    const old=new DatabaseSync(file)
    old.exec("CREATE TABLE orders(id TEXT PRIMARY KEY,uid TEXT NOT NULL,plan TEXT NOT NULL,status TEXT NOT NULL,checkout_id TEXT UNIQUE,subscription_id TEXT UNIQUE,server_id TEXT,error TEXT,created TEXT NOT NULL,updated TEXT NOT NULL)")
    old.exec("INSERT INTO orders(id,uid,plan,status,created,updated) VALUES('before-upgrade','123','Pro','paid','2026-01-01','2026-01-01')")
    old.close()
    const db=initDb(file)
    assert.equal(db.prepare('SELECT runtime FROM orders WHERE id=?').get('before-upgrade').runtime,null)
    assert.equal(db.prepare('SELECT count(*) n FROM orders').get().n,1)
    db.close()
    const after=initDb(file)
    assert.equal(after.prepare('SELECT count(*) n FROM orders').get().n,1)
    after.close()
  }finally{rmSync(folder,{recursive:true,force:true})}
})

test('staff chooses runtime only for verified paid unprovisioned orders',async()=>{
  await fixture(async({db,request})=>{
    const id=paidOrder(db)
    const path='/v1/staff/orders/'+id+'/runtime'
    assert.equal((await request(path,{method:'PATCH',json:{runtime:'nodejs'}})).status,401)
    assert.equal((await request(path,{method:'PATCH',actor:'customer',json:{runtime:'nodejs'}})).status,403)
    assert.equal((await request(path,{method:'PATCH',actor:'owner',json:{runtime:'php'}})).status,400)
    assert.equal((await request(path,{method:'PATCH',actor:'owner',json:{runtime:'nodejs'},origin:'https://attacker.invalid'})).status,403)
    assert.equal(db.prepare('SELECT runtime FROM orders WHERE id=?').get(id).runtime,null)
    assert.equal((await request(path,{method:'PATCH',actor:'owner',json:{runtime:'python'}})).status,200)
    assert.equal(db.prepare('SELECT runtime FROM orders WHERE id=?').get(id).runtime,'python')
    assert.equal((await request('/v1/staff/orders/'+id+'/provision',{actor:'owner',method:'POST',json:{}})).status,503)
    assert.equal(db.prepare('SELECT status,server_id FROM orders WHERE id=?').get(id).status,'paid')
    const overview=await request('/v1/staff/overview',{actor:'owner'})
    assert.equal(overview.data.integrations.provisioning,false)
    assert.equal(overview.data.orders[0].runtime,'python')
    db.prepare("UPDATE orders SET status='active',server_id='777' WHERE id=?").run(id)
    assert.equal((await request(path,{method:'PATCH',actor:'owner',json:{runtime:'nodejs'}})).status,409)
    assert.equal(db.prepare('SELECT runtime FROM orders WHERE id=?').get(id).runtime,'python')
  })
})

test('nonpaid orders cannot be assigned runtime',async()=>{
  await fixture(async({db,request})=>{
    const id=paidOrder(db,undefined,'initiated')
    assert.equal((await request('/v1/staff/orders/'+id+'/runtime',{actor:'owner',method:'PATCH',json:{runtime:'nodejs'}})).status,409)
  })
})

test('runtime-specific provisioning picks correct egg only when explicitly enabled and confirmed by staff',async()=>{
  for(const runtime of ['nodejs','python']){
    const originalFetch=globalThis.fetch
    let posted=null,mutations=0
    globalThis.fetch=async(input,init={})=>{
      const url=String(input)
      if(!url.startsWith('https://panel.test.invalid/'))return originalFetch(input,init)
      const pathname=new URL(url).pathname
      const method=init.method||'GET'
      assert.equal(init.headers.Authorization,'Bearer '+NODE3_ENV.PTERODACTYL_API_KEY)
      const json=(x,status=200)=>new Response(JSON.stringify(x),{status,headers:{'Content-Type':'application/json'}})
      if(pathname.startsWith('/api/application/servers/external/'))return json({error:'not found'},404)
      if(pathname==='/api/application/nodes/3/allocations')return json({data:[{attributes:{id:337,assigned:false}}]})
      if(pathname.startsWith('/api/application/users/external/'))return json({error:'not found'},404)
      if(pathname==='/api/application/users'&&method==='POST'){mutations++;return json({attributes:{id:71}})}
      if(pathname==='/api/application/servers'&&method==='POST'){
        mutations++;posted=JSON.parse(init.body);return json({attributes:{id:81}})
      }
      throw Error('Unexpected Pterodactyl request '+method+' '+pathname)
    }
    try{
      await fixture(async({db,request})=>{
        const id=paidOrder(db)
        assert.equal((await request('/v1/staff/orders/'+id+'/provision',{actor:'owner',method:'POST',json:{}})).status,409)
        assert.equal((await request('/v1/staff/orders/'+id+'/runtime',{actor:'owner',method:'PATCH',json:{runtime}})).status,200)
        const created=await request('/v1/staff/orders/'+id+'/provision',{actor:'owner',method:'POST',json:{}})
        assert.equal(created.status,200)
        assert.equal(created.data.status,'active')
        assert.equal(mutations,2)
        assert.equal(posted.egg,runtime==='nodejs'?16:15)
        assert.match(posted.docker_image,new RegExp(runtime==='nodejs'?'nodejs_24':'python_3.13'))
        assert.equal(posted.allocation.default,337)
        assert.equal(posted.limits.memory,3072)
        assert.equal(db.prepare('SELECT runtime,status,server_id FROM orders WHERE id=?').get(id).runtime,runtime)
        assert.equal(db.prepare('SELECT status FROM orders WHERE id=?').get(id).status,'active')
      },{PTERODACTYL_PROVISIONING_ENABLED:'true'})
    }finally{globalThis.fetch=originalFetch}
  }
})

test('occupied allocation fails closed without creating a user or server',async()=>{
  const originalFetch=globalThis.fetch
  let writes=0
  globalThis.fetch=async(input,init={})=>{
    const url=String(input)
    if(!url.startsWith('https://panel.test.invalid/'))return originalFetch(input,init)
    if((init.method||'GET')!=='GET')writes++
    if(url.includes('/servers/external/'))return new Response('{}',{status:404})
    if(url.includes('/nodes/3/allocations'))return new Response(JSON.stringify({data:[{attributes:{id:337,assigned:true}}]}),{status:200})
    throw Error('Unexpected remote call on occupied allocation')
  }
  try{
    await fixture(async({db,request})=>{
      const id=paidOrder(db)
      await request('/v1/staff/orders/'+id+'/runtime',{actor:'owner',method:'PATCH',json:{runtime:'nodejs'}})
      const r=await request('/v1/staff/orders/'+id+'/provision',{actor:'owner',method:'POST',json:{}})
      assert.equal(r.status,409)
      assert.equal(writes,0)
      assert.equal(db.prepare('SELECT status FROM orders WHERE id=?').get(id).status,'paid')
    },{PTERODACTYL_PROVISIONING_ENABLED:'true'})
  }finally{globalThis.fetch=originalFetch}
})
