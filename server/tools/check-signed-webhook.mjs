// Simple, safe Node 3 diagnostic. Does not charge anyone or create an order.
// Sends a signed NON-PAYMENT event through public HTTPS to verify that
// the running API uses the same signing secret saved in server/.env.
// This is NOT a substitute for a genuine Stripe-origin webhook test.
import {createHmac,randomBytes} from 'node:crypto'
import {readFileSync} from 'node:fs'

const path=new URL('../.env',import.meta.url)
let contents
try{contents=readFileSync(path,'utf8')}catch{
  console.error('FAIL: Cannot read private server/.env. Run from Node 3.')
  process.exit(1)
}
const line=contents.split(/\r?\n/).find(x=>/^STRIPE_WEBHOOK_SECRET\s*=/.test(x))
let secret=line?.split('=').slice(1).join('=').trim()||''
if((secret.startsWith('"')&&secret.endsWith('"'))||(secret.startsWith("'")&&secret.endsWith("'")))secret=secret.slice(1,-1)
if(!secret.startsWith('whsec_')||secret.length<20){
  console.error('FAIL: Webhook signing secret missing or incomplete. No secret displayed.')
  process.exit(1)
}

const now=Math.floor(Date.now()/1000).toString()
const event={
  id:'evt_esn_diagnostic_'+randomBytes(12).toString('hex'),
  type:'esn.diagnostic_non_payment',
  created:Number(now),
  data:{object:{}}
}
const payload=JSON.stringify(event)
const sig=createHmac('sha256',secret).update(now+'.'+payload).digest('hex')
try{
  const res=await fetch('https://api.esnoffical.com/v1/stripe/webhook',{
    method:'POST',
    headers:{'Content-Type':'application/json','Stripe-Signature':'t='+now+',v1='+sig},
    body:payload,
    signal:AbortSignal.timeout(15000)
  })
  if(res.status===200){
    console.log('PASS: HTTPS webhook accepted a correctly signed non-payment event (HTTP 200).')
    console.log('No customer charged. No server created. Stripe-origin delivery still needs separate verification.')
  }else{
    console.log('FAIL: HTTPS webhook returned HTTP '+res.status+'.')
    console.log('Check that the API was restarted after saving the signing secret.')
    process.exitCode=1
  }
}catch{
  console.error('FAIL: Could not reach HTTPS webhook. Check DNS, Nginx, and the API service.')
  process.exitCode=1
}
