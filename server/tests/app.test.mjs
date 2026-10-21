import test from 'node:test'
import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {createHash,createHmac} from 'node:crypto'
import {handler,initDb,PLANS,verifyStripe} from '../app.mjs'

const SOURCE='https://esnoffical.com'
const OWNER='1515077206886453469'
const CUSTOMER='123456789012345678'
const TEST_ENV={
  NODE_ENV:'test',PUBLIC_SITE_ORIGIN:SOURCE,API_PUBLIC_URL:'https://api.esnoffical.com',
  STAFF_DISCORD_IDS:OWNER,STRIPE_WEBHOOK_SECRET:'whsec_test_signature_only',
}
const digest=s=>createHash('sha256').update(s).digest('hex')
async function fixture(fn){
  const db=initDb()
  for(const id of [OWNER,CUSTOMER])
    db.prepare('INSERT INTO users(id,name,email,avatar,created) VALUES(?,?,?,?,?)').run(id,'Tester '+id,'tester@example.invalid',null,new Date().toISOString())
  db.prepare('INSERT INTO sessions(token,uid,csrf,expires) VALUES(?,?,?,?)').run(digest('owner-session'),OWNER,digest('owner-csrf'),Date.now()+120000)
  db.prepare('INSERT INTO sessions(token,uid,csrf,expires) VALUES(?,?,?,?)').run(digest('customer-session'),CUSTOMER,digest('customer-csrf'),Date.now()+120000)
  const server=createServer(handler(db,TEST_ENV))
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
  const base='http://127.0.0.1:'+server.address().port
  async function request(path,{method='GET',actor=null,json=null,headers={}}={}){
    const response=await fetch(base+path,{
      method,headers:{
        ...(actor?{Cookie:'__Host-esn_session='+actor+'-session'}:{}),
        ...(method==='GET'?{}:{Origin:SOURCE,'Content-Type':'application/json','X-ESN-CSRF':actor+'-csrf'}),
        ...headers
      },
      ...(json!==null?{body:JSON.stringify(json)}:{})
    })
    return {status:response.status,data:await response.json()}
  }
  try{await fn({db,request,base})}finally{await new Promise(resolve=>server.close(resolve));db.close()}
}

test('eleven monthly plans match approved price and limits',()=>{
  assert.equal(Object.keys(PLANS).length,11)
  assert.deepEqual(PLANS.Nano,{cents:50,ram:256,cpu:25,disk:1024})
  assert.deepEqual(PLANS.Pro,{cents:299,ram:3072,cpu:125,disk:12288})
  assert.deepEqual(PLANS.Gift,{cents:1699,ram:15360,cpu:450,disk:61440})
})
test('Stripe signature is checked against raw bytes, timestamp and HMAC',()=>{
  const payload=Buffer.from('{"id":"evt_test","type":"invoice.paid"}')
  const now=Date.now(),seconds=Math.floor(now/1000)
  const signature=createHmac('sha256',TEST_ENV.STRIPE_WEBHOOK_SECRET).update(seconds+'.').update(payload).digest('hex')
  assert.equal(verifyStripe(payload,'t='+seconds+',v1='+signature,TEST_ENV.STRIPE_WEBHOOK_SECRET,now),true)
  assert.equal(verifyStripe(Buffer.from('tampered'),'t='+seconds+',v1='+signature,TEST_ENV.STRIPE_WEBHOOK_SECRET,now),false)
  assert.equal(verifyStripe(payload,'t='+(seconds-900)+',v1='+signature,TEST_ENV.STRIPE_WEBHOOK_SECRET,now),false)
})
test('public catalog never reveals physical node inventory or secrets',async()=>{
  await fixture(async({request})=>{
    const r=await request('/v1/public')
    assert.equal(r.status,200)
    assert.equal(r.data.plans.Titan.price,12.99)
    assert.equal(r.data.integrations.stripe,false)
    assert.equal(r.data.integrations.provisioning,false)
    assert.equal(JSON.stringify(r.data).includes('PTERODACTYL_'),false)
    assert.equal(JSON.stringify(r.data).includes('node_id'),false)
    assert.equal(JSON.stringify(r.data).includes('stripeKey'),false)
  })
})
test('staff records require signed session AND backend allowlist',async()=>{
  await fixture(async({request})=>{
    assert.equal((await request('/v1/staff/overview')).status,401)
    assert.equal((await request('/v1/staff/overview',{actor:'customer'})).status,403)
    const owner=await request('/v1/staff/overview',{actor:'owner'})
    assert.equal(owner.status,200)
    assert.equal(owner.data.user.staff,true)
  })
})
test('CSRF and trusted Origin are enforced on all state mutations',async()=>{
  await fixture(async({request})=>{
    const path='/v1/staff/settings'
    assert.equal((await request(path,{method:'PATCH',actor:'owner',json:{headline:'New'},headers:{Origin:'https://untrusted.example'}})).status,403)
    const noCsrf=await request(path,{method:'PATCH',actor:'owner',json:{headline:'New'},headers:{'X-ESN-CSRF':'fake'}})
    assert.equal(noCsrf.status,403)
    const good=await request(path,{method:'PATCH',actor:'owner',json:{headline:'ESN New','staffPrivileges':true}})
    assert.equal(good.status,200)
    assert.equal(good.data.settings.headline,'ESN New')
    assert.equal(Object.hasOwn(good.data.settings,'staffPrivileges'),false)
  })
})
test('customer requests save in SQLite; another customer is not made staff',async()=>{
  await fixture(async({request})=>{
    const response=await request('/v1/requests',{method:'POST',actor:'customer',json:{
      kind:'Partner application',plan:'Pro',notes:'I run a creator Discord.'
    }})
    assert.equal(response.status,201)
    assert.equal(response.data.status,'pending')
    const history=await request('/v1/requests',{actor:'customer'})
    assert.equal(history.data.requests.length,1)
    assert.equal(history.data.requests[0].notes,'I run a creator Discord.')
    assert.equal((await request('/v1/staff/requests/'+response.data.id,{method:'PATCH',actor:'customer',json:{status:'approved'}})).status,403)
    assert.equal((await request('/v1/staff/requests/'+response.data.id,{method:'PATCH',actor:'owner',json:{status:'approved'}})).status,200)
  })
})
test('checkout and provisioning fail closed without payment/provider setup',async()=>{
  await fixture(async({request,db})=>{
    const checkout=await request('/v1/checkout',{method:'POST',actor:'customer',json:{plan:'Pro'}})
    assert.equal(checkout.status,503)
    const id='00000000-0000-4000-8000-000000000000'
    db.prepare('INSERT INTO orders(id,uid,plan,status,created,updated) VALUES(?,?,?,?,?,?)').run(id,CUSTOMER,'Pro','paid',new Date().toISOString(),new Date().toISOString())
    const provision=await request('/v1/staff/orders/'+id+'/provision',{method:'POST',actor:'owner',json:{}})
    assert.equal(provision.status,503)
    assert.equal(db.prepare('SELECT server_id FROM orders WHERE id=?').get(id).server_id,null)
  })
})
test('webhook events require Stripe signature and are idempotent',async()=>{
  await fixture(async({request,db,base})=>{
    const fake=await fetch(base+'/v1/stripe/webhook',{method:'POST',headers:{'stripe-signature':'t=1,v1=invalid'},body:'{}'})
    assert.equal(fake.status,400)
    const id='10000000-0000-4000-8000-000000000001'
    db.prepare('INSERT INTO orders(id,uid,plan,status,checkout_id,created,updated) VALUES(?,?,?,?,?,?,?)').run(id,CUSTOMER,'Pro','checkout_pending','cs_valid',new Date().toISOString(),new Date().toISOString())
    const ev={id:'evt_signed_1',type:'checkout.session.completed',data:{object:{
      id:'cs_valid',client_reference_id:id,mode:'subscription',payment_status:'paid',subscription:'sub_verified'
    }}}
    const payload=Buffer.from(JSON.stringify(ev)),t=Math.floor(Date.now()/1000)
    const sig=createHmac('sha256',TEST_ENV.STRIPE_WEBHOOK_SECRET).update(t+'.').update(payload).digest('hex')
    for(let i=0;i<2;i++){
      const r=await fetch(base+'/v1/stripe/webhook',{method:'POST',headers:{'stripe-signature':'t='+t+',v1='+sig},body:payload})
      assert.equal(r.status,200)
    }
    const order=db.prepare('SELECT status,subscription_id FROM orders WHERE id=?').get(id)
    assert.equal(order.status,'paid')
    assert.equal(order.subscription_id,'sub_verified')
    assert.equal(db.prepare('SELECT count(*) n FROM stripe_events WHERE id=?').get('evt_signed_1').n,1)
  })
})
