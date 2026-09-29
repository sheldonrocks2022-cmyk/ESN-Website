import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './storeAi.css'

const DISCORD_URL='https://discord.gg/3gxA66KZ8'
const STAFF_CODE_HASH='645569b472b3670b547fd45aa2a626177a8fb71f722bb7c3dc07d0d670311cab'
const STAFF_SESSION_KEY='esn_staff_session_v1'
const STORE_AI_STAFF_KEY='esn_store_ai_staff_v1'
const DRAFT_KEY='esn_store_ai_drafts_v1'
const CHAT_KEY='esn_store_ai_chat_v1'

const CATALOG=[
  {
    id:'realm-100-keys',kind:'SMP',name:'20 Realm 100 Keys',price:1.25,priceLabel:'$1.25',
    checkout:'https://buy.stripe.com/4gM14o5pxgaP9Nl2dNdnW00',status:'AVAILABLE',
    summary:'Twenty Realm 100 keys delivered through the ESN SMP purchase system.',
    items:['20 × Realm 100 Keys'],
    delivery:'Enter the exact Minecraft Username at checkout, include the leading "." if your server username uses it, and be online on the SMP when possible for automatic delivery.',
    tags:['keys','realm','realm 100','minecraft','smp'],
  },
  {
    id:'season-relics',kind:'SMP',name:'ESN Season Pass Relic Bundle',price:.50,priceLabel:'$0.50',
    checkout:'https://buy.stripe.com/bJe14o8BJbUz4t1dWvdnW01',status:'AVAILABLE',
    summary:'A six-item Season Pass relic bundle built from existing ESN SMP items.',
    items:['Angel Wings','Inferno Scepter','Storm Crystal','Tideheart','Void Relic','Celestial Star'],
    delivery:'Enter the exact Minecraft Username at checkout, include the leading "." if your server username uses it, and be online on the SMP when possible for automatic delivery.',
    tags:['relic','season pass','angel wings','scepter','crystal','tideheart','void relic','celestial star'],
  },
  {
    id:'riftwalker',kind:'SMP',name:'ESN Riftwalker Bundle',price:.50,priceLabel:'$0.50',
    checkout:'https://buy.stripe.com/00w3cw6tB7Ej9Nl19JdnW02',status:'AVAILABLE',
    summary:'A six-item mobility and utility bundle centered around rift abilities.',
    items:['Riftblade — Rift Dash + bonus strike','Rift Wings — unbreakable Elytra + flight boost','Phase Boots — Speed I + Phase Step','Rift Bow — Slowness II arrows + Rift Burst','Rift Core — Resistance II + Absorption','Void Compass — tracks last death'],
    delivery:'Enter the exact Minecraft Username at checkout, include the leading "." if your server username uses it, and be online on the SMP when possible for automatic delivery.',
    tags:['riftwalker','rift','mobility','elytra','bow','phase','core','compass'],
  },
  {
    id:'warden',kind:'SMP',name:'ESN Immortal Warden Bundle',price:1.30,priceLabel:'$1.30',
    checkout:'https://buy.stripe.com/bJefZi9FN9Mr6B905FdnW03',status:'AVAILABLE',
    summary:'A full eight-item Warden-themed combat bundle.',
    items:['Immortal Warden Helmet','Immortal Warden Chestplate','Immortal Warden Leggings','Immortal Warden Boots','Warden Blade','Warden Longbow','Immortal Core','Warden Totem'],
    delivery:'Enter the exact Minecraft Username at checkout, include the leading "." if your server username uses it, and be online on the SMP when possible for automatic delivery.',
    tags:['warden','immortal','combat','armor','blade','longbow','totem'],
  },
  {
    id:'void-warrior',kind:'SMP',name:'Void Warrior Bundle',price:.50,priceLabel:'$0.50',
    checkout:null,status:'CHECKOUT NOT CONNECTED',
    summary:'A high-end Void set with mobility, durability, combat bonuses, and full-set effects.',
    items:['Void Blade','Void Crown','Void Chestplate','Void Leggings','Void Boots'],
    delivery:'Checkout is not connected on the current website catalog, so Store AI will not invent a purchase link.',
    tags:['void','warrior','armor','blade','combat'],
  },
  {
    id:'fortnite-coaching',kind:'SERVICE',name:'Fortnite Coaching',price:null,priceLabel:'QUOTE THROUGH ESN',
    checkout:null,status:'DISCORD ORDER',
    summary:'Focused coaching built around practical improvement, stronger decision-making, and better in-game consistency.',
    items:['Competitive gaming coaching','Practical improvement','Decision-making support'],
    delivery:'Open an ESN Discord ticket and provide what you want help with. Staff confirms scope and price.',
    tags:['fortnite','coaching','gaming','competitive'],
  },
  {
    id:'editing',kind:'SERVICE',name:'Editing Services',price:null,priceLabel:'QUOTE THROUGH ESN',
    checkout:null,status:'DISCORD ORDER',
    summary:'Editing support for creators who want sharper, cleaner content built for their platform and audience.',
    items:['Creator editing','Gaming edits','Anime / TV / movie editing support'],
    delivery:'Open an ESN Discord ticket with the content type, length, style, and deadline. Staff confirms scope and price.',
    tags:['editing','video','creator','gaming','anime','tv','movie'],
  },
  {
    id:'discord-setup',kind:'SERVICE',name:'Discord Server Setups',price:null,priceLabel:'QUOTE THROUGH ESN',
    checkout:null,status:'DISCORD ORDER',
    summary:'Structured Discord setups designed around roles, channels, moderation, onboarding, and community growth.',
    items:['Roles','Channels','Moderation structure','Onboarding','Community setup'],
    delivery:'Open an ESN Discord ticket and describe the server size and features you need. Staff confirms scope and price.',
    tags:['discord','server','setup','roles','channels','moderation'],
  },
  {
    id:'website',kind:'SERVICE',name:'Website Creation',price:null,priceLabel:'ESTIMATE / QUOTE',
    checkout:null,status:'DISCORD ORDER',
    summary:'Website Creation includes Basic, Startup, and Enterprise options. ES Tools previously surfaced $180 starter and $320 multi-page starting estimates; final scope is confirmed through ESN.',
    items:['Basic options','Startup options','Enterprise options','$180 starter estimate previously surfaced','$320 multi-page estimate previously surfaced'],
    delivery:'Use ES Tools for an estimate or open a Discord ticket for the final scope and price.',
    tags:['website','web','site','basic','startup','enterprise'],
  },
  {
    id:'memberships',kind:'SERVICE',name:'Memberships',price:null,priceLabel:'PRICE NOT VERIFIED',
    checkout:null,status:'ASK STAFF',
    summary:'Existing ESN membership offers are part of the Service Showcase, but the current catalog does not provide a verified price.',
    items:['ESN membership offers'],
    delivery:'Ask ESN staff in Discord for the current verified membership options and pricing.',
    tags:['membership','memberships'],
  },
  {
    id:'hashtag-packs',kind:'SERVICE',name:'Hashtag Packs',price:null,priceLabel:'PRICE NOT VERIFIED',
    checkout:null,status:'ASK STAFF',
    summary:'Creator-growth hashtag pack services are listed by ESN. Exact current package details and pricing are not verified in the website catalog.',
    items:['Creator growth support','Hashtag packs'],
    delivery:'Ask ESN staff in Discord for the current package and price.',
    tags:['hashtag','hashtags','growth','creator'],
  },
  {
    id:'stream-branding',kind:'SERVICE',name:'Stream Branding',price:null,priceLabel:'PRICE NOT VERIFIED',
    checkout:null,status:'ASK STAFF',
    summary:'Branding work for streams and creator channels.',
    items:['Stream branding','Creator branding'],
    delivery:'Open an ESN Discord ticket with your platform and the branding assets you need.',
    tags:['stream','branding','creator','twitch','youtube'],
  },
  {
    id:'custom-services',kind:'SERVICE',name:'Custom Services',price:null,priceLabel:'CUSTOM QUOTE',
    checkout:null,status:'DISCORD ORDER',
    summary:'Custom ESN projects that do not fit a standard package.',
    items:['Custom digital projects','Custom service requests'],
    delivery:'Open an ESN Discord ticket and describe the project. Staff confirms whether ESN can take it and provides a quote.',
    tags:['custom','project','service'],
  },
  {
    id:'esn-domains',kind:'SERVICE',name:'ESN Domains',price:null,priceLabel:'PRICING NOT ACTIVATED',
    checkout:null,status:'SETUP MODE',
    summary:'Choose an esnoffical.com subdomain or connect a domain you already own through the ESN Domains control layer.',
    items:['ESN subdomain rental','Custom-domain connection','Managed routing and HTTPS after activation'],
    delivery:'Open the ESN Domains page to check names and connection status. Paid activation stays disabled until Cloudflare and billing are configured.',
    tags:['domain','domains','subdomain','dns','custom domain','hosting'],
  },
]

function readJson(key,fallback){try{const value=JSON.parse(localStorage.getItem(key)||'null');return value==null?fallback:value}catch{return fallback}}
function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
function currency(value){return '$'+Number(value).toFixed(2)}
function normalize(value){return String(value||'').toLowerCase().replace(/[^a-z0-9.$ ]/g,' ').replace(/\s+/g,' ').trim()}
function words(value){return normalize(value).split(' ').filter(Boolean)}
function productText(item){return normalize([item.name,item.kind,item.summary,...item.items,...item.tags].join(' '))}
function findMatches(query){
  const q=normalize(query)
  const tokens=words(q).filter(t=>t.length>2)
  return CATALOG.map(item=>{
    const text=productText(item)
    let score=0
    if(q&&text.includes(q))score+=20
    for(const token of tokens)if(text.includes(token))score+=3
    if(q.includes('smp')&&item.kind==='SMP')score+=5
    if(q.includes('service')&&item.kind==='SERVICE')score+=5
    return {item,score}
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).map(x=>x.item)
}
function budgetFrom(query){
  const match=String(query).match(/\$\s*(\d+(?:\.\d{1,2})?)|(?:under|below|less than|for|budget(?: of)?)\s*(\d+(?:\.\d{1,2})?)/i)
  if(!match)return null
  const value=Number(match[1]||match[2])
  return Number.isFinite(value)?value:null
}
function cartLine(item){return item.name+' — '+item.priceLabel}

function visitorAnswer(query){
  const q=normalize(query)
  const matches=findMatches(query)
  const budget=budgetFrom(query)
  const priced=CATALOG.filter(item=>item.price!=null&&item.status==='AVAILABLE').sort((a,b)=>a.price-b.price)

  if(!q)return {text:'Ask me about ESN products, services, prices, bundles, delivery, or checkout.',items:[]}
  if(/what.*sell|what.*store|show.*everything|catalog|all products|all services/.test(q)){
    return {text:'ESN currently has SMP products plus creator and digital services. I only show verified catalog details and I mark missing prices or checkout links instead of inventing them.',items:CATALOG}
  }
  if(/cheapest|lowest price|least expensive/.test(q)){
    const min=Math.min(...priced.map(x=>x.price))
    const items=priced.filter(x=>x.price===min)
    return {text:'The cheapest currently verified purchasable items are '+items.map(cartLine).join(' and ')+'.',items}
  }
  if(budget!=null){
    const items=priced.filter(item=>item.price<=budget)
    return items.length
      ? {text:'With a budget of '+currency(budget)+', these currently verified checkout items fit your budget:',items}
      : {text:'I do not have a verified direct-checkout product at or below '+currency(budget)+'. Some ESN services use custom quotes through Discord.',items:[]}
  }
  if(/delivery|deliver|minecraft username|username|period|prefix|dot/.test(q)){
    return {text:'For ESN SMP purchases, enter your exact Minecraft Username at Stripe checkout. If the server shows a leading "." in your username, include that "." at the beginning. Be online on the SMP when possible for automatic delivery.',items:CATALOG.filter(x=>x.kind==='SMP'&&x.status==='AVAILABLE')}
  }
  if(/compare|versus|\bvs\b|difference/.test(q)&&matches.length>=2){
    const items=matches.slice(0,3)
    return {text:'Here is the closest catalog comparison. I am comparing only details currently stored on the ESN website.',items}
  }
  if(/checkout|buy|purchase|order|link/.test(q)&&matches.length){
    const item=matches[0]
    if(item.checkout)return {text:item.name+' has a verified direct Stripe checkout at '+item.priceLabel+'.',items:[item]}
    if(item.kind==='SERVICE')return {text:item.name+' is ordered through ESN Discord. The current catalog does not have a direct checkout link for it.',items:[item]}
    return {text:item.name+' is listed, but its checkout is not connected. I will not invent a payment link.',items:[item]}
  }
  if(/website|web site|web project/.test(q)){
    const item=CATALOG.find(x=>x.id==='website')
    return {text:'Website Creation is quote-based. ES Tools previously surfaced $180 starter and $320 multi-page starting estimates, but the final scope and price must be confirmed through ESN.',items:[item]}
  }
  if(/smp|minecraft|bundle|keys|relic|warden|rift|void/.test(q)){
    const items=matches.length?matches.slice(0,5):CATALOG.filter(x=>x.kind==='SMP')
    return {text:'These are the closest ESN SMP catalog matches. Direct checkout is shown only where a verified Stripe link exists.',items}
  }
  if(/service|editing|coaching|discord|branding|hashtag|membership|custom/.test(q)){
    const items=matches.length?matches.slice(0,5):CATALOG.filter(x=>x.kind==='SERVICE')
    return {text:'These are the closest ESN service matches. Services without a verified fixed price are clearly marked as quote-based or price-not-verified.',items}
  }
  if(matches.length){
    return {text:'I found these ESN catalog matches:',items:matches.slice(0,4)}
  }
  return {text:'I could not match that to a verified ESN store item or service. Try asking for “all products,” “services,” “cheapest product,” “what can I get for $1,” or a specific product name.',items:[]}
}

function staffAnswer(query,drafts){
  const q=normalize(query)
  const missingCheckout=CATALOG.filter(x=>x.kind==='SMP'&&!x.checkout)
  const missingPrices=CATALOG.filter(x=>x.price==null)
  const direct=CATALOG.filter(x=>x.checkout)
  if(/health|audit|check store|problems/.test(q)){
    return {text:'STORE HEALTH // '+CATALOG.length+' core catalog entries • '+direct.length+' verified direct checkout links • '+missingCheckout.length+' SMP listing missing checkout • '+missingPrices.length+' listings without verified fixed prices • '+drafts.length+' local staff drafts.',items:[...missingCheckout,...missingPrices.slice(0,4)]}
  }
  if(/missing.*link|checkout.*missing/.test(q))return {text:'These SMP listings are missing a connected checkout link:',items:missingCheckout}
  if(/missing.*price|price.*missing|unverified price/.test(q))return {text:'These listings do not have a verified fixed price in the current catalog:',items:missingPrices}
  if(/stripe|payment link|checkout links/.test(q))return {text:'Verified direct checkout products:',items:direct}
  if(/announcement/.test(q)){
    const available=CATALOG.filter(x=>x.status==='AVAILABLE')
    return {text:'STAFF COPY DRAFT\n\n@everyone\n\n**ESN Store Update**\n\nThe ESN Store currently has '+available.length+' verified direct-checkout products available. Visit https://esnoffical.com/store-ai to ask Store AI about products, prices, delivery, and checkout.\n\nSMP buyers: enter your exact Minecraft Username and include the leading "." if your server username uses it.',items:available.slice(0,4)}
  }
  if(/product card|card copy|description/.test(q)){
    const match=findMatches(query)[0]
    if(match)return {text:match.name+'\n'+match.priceLabel+'\n'+match.summary+'\n'+(match.checkout?'Verified checkout connected.':'No direct checkout connected.'),items:[match]}
    return {text:'Name a catalog product after “product card” and I’ll build copy from its verified details.',items:[]}
  }
  return visitorAnswer(query)
}

async function sha256(value){
  const bytes=new TextEncoder().encode(value)
  const hash=await crypto.subtle.digest('SHA-256',bytes)
  return [...new Uint8Array(hash)].map(byte=>byte.toString(16).padStart(2,'0')).join('')
}

function ProductCard({item,compact=false}){
  return <article className={'store-ai-product '+(compact?'compact':'')}>
    <div className="store-ai-product-top"><span>{item.kind}</span><b>{item.status}</b></div>
    <h3>{item.name}</h3>
    <strong className="store-ai-price">{item.priceLabel}</strong>
    <p>{item.summary}</p>
    {!compact&&<ul>{item.items.slice(0,8).map(entry=><li key={entry}>{entry}</li>)}</ul>}
    <div className="store-ai-product-actions">
      {item.checkout?<a href={item.checkout} target="_blank" rel="noreferrer">CHECKOUT ↗</a>:item.kind==='SERVICE'?<a href={DISCORD_URL} target="_blank" rel="noreferrer">OPEN DISCORD ↗</a>:<span>NO CHECKOUT LINK</span>}
    </div>
  </article>
}

export default function StoreAIPage(){
  const initial=[{id:'hello',role:'ai',text:'Welcome to ESN Store AI. Ask about any ESN product or service, compare bundles, give me a budget, ask about delivery, or ask for a checkout link.',items:[]}]
  const [messages,setMessages]=useState(()=>readJson(CHAT_KEY,initial))
  const [query,setQuery]=useState('')
  const [mode,setMode]=useState(()=>sessionStorage.getItem(STORE_AI_STAFF_KEY)==='1'||sessionStorage.getItem(STAFF_SESSION_KEY)==='1'?'staff':'visitor')
  const [showUnlock,setShowUnlock]=useState(false)
  const [code,setCode]=useState('')
  const [error,setError]=useState('')
  const [filter,setFilter]=useState('ALL')
  const [drafts,setDrafts]=useState(()=>readJson(DRAFT_KEY,[]))
  const [draft,setDraft]=useState({name:'',kind:'SERVICE',price:'',checkout:'',summary:''})

  const visibleCatalog=useMemo(()=>filter==='ALL'?CATALOG:CATALOG.filter(item=>item.kind===filter),[filter])

  const send=()=>{
    const clean=query.trim()
    if(!clean)return
    const result=mode==='staff'?staffAnswer(clean,drafts):visitorAnswer(clean)
    const next=[...messages,{id:'u-'+Date.now(),role:'user',text:clean,items:[]},{id:'a-'+Date.now(),role:'ai',text:result.text,items:result.items||[]}].slice(-30)
    setMessages(next);writeJson(CHAT_KEY,next);setQuery('')
  }

  const quick=value=>{setQuery(value);setTimeout(()=>{},0)}
  const unlock=async event=>{
    event.preventDefault();setError('')
    try{
      if(await sha256(code.trim())!==STAFF_CODE_HASH){setError('ACCESS CODE REJECTED');return}
      sessionStorage.setItem(STORE_AI_STAFF_KEY,'1')
      setMode('staff');setShowUnlock(false);setCode('')
      const next=[...messages,{id:'staff-'+Date.now(),role:'ai',text:'STAFF MODE UNLOCKED // Store health, checkout audits, price audits, product-card copy, announcement drafts, and local product drafts are available.',items:[]}].slice(-30)
      setMessages(next);writeJson(CHAT_KEY,next)
    }catch{setError('SECURE CHECK UNAVAILABLE')}
  }
  const leaveStaff=()=>{sessionStorage.removeItem(STORE_AI_STAFF_KEY);setMode('visitor')}
  const saveDraft=()=>{
    if(!draft.name.trim())return
    const item={id:'draft-'+Date.now(),...draft,name:draft.name.trim(),priceLabel:draft.price?draft.price:'NOT SET',status:'LOCAL STAFF DRAFT',items:[],tags:[]}
    const next=[item,...drafts].slice(0,30)
    setDrafts(next);writeJson(DRAFT_KEY,next);setDraft({name:'',kind:'SERVICE',price:'',checkout:'',summary:''})
  }
  const removeDraft=id=>{const next=drafts.filter(x=>x.id!==id);setDrafts(next);writeJson(DRAFT_KEY,next)}

  return <>
    <section className="page-hero store-ai-hero"><div className="shell page-hero-inner">
      <div className="page-hero-copy"><span className="eyebrow">ESN STORE AI</span><h1>Ask the store before you buy.</h1><p>One catalog-aware assistant for ESN SMP products and ESN services. It uses verified website data, marks unknown prices honestly, and never invents checkout links.</p></div>
      <div className="page-hero-mark"><span>{mode==='staff'?'STAFF':'AI'}</span><small>{mode==='staff'?'STORE OPS':'VISITOR MODE'}</small></div>
    </div></section>

    <section className="section store-ai-main"><div className="shell store-ai-layout">
      <div className="store-ai-chat">
        <div className="store-ai-chat-head"><div><span>ESN STORE INTELLIGENCE</span><strong>{mode==='staff'?'Staff Mode':'Visitor Mode'}</strong></div><div>{mode==='staff'?<button onClick={leaveStaff}>EXIT STAFF MODE</button>:<button onClick={()=>setShowUnlock(true)}>STAFF MODE</button>}</div></div>
        <div className="store-ai-quick">
          {(mode==='staff'?['store health check','show missing checkout links','show unverified prices','make a store announcement']:['show me all products','what is the cheapest product?','what can I get for $1?','how does SMP delivery work?']).map(item=><button key={item} onClick={()=>setQuery(item)}>{item}</button>)}
        </div>
        <div className="store-ai-messages">{messages.map(message=><article className={message.role} key={message.id}><span>{message.role==='ai'?'STORE AI':'YOU'}</span><p>{message.text}</p>{message.items?.length>0&&<div className="store-ai-inline-products">{message.items.slice(0,5).map(item=><ProductCard item={item} compact key={item.id}/>)}</div>}</article>)}</div>
        <div className="store-ai-input"><textarea value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} placeholder={mode==='staff'?'Ask Store AI to audit, check, compare, or draft…':'Ask about products, services, prices, delivery, or checkout…'}/><button onClick={send}>ASK STORE AI</button></div>
        <small className="store-ai-truth-note">Current Store AI runs locally from the verified ESN website catalog. A secure AI backend can later replace the local response engine without changing this interface.</small>
      </div>

      <aside className="store-ai-side">
        <span className="noacct-kicker">CATALOG STATUS</span><strong>{CATALOG.length} listings</strong>
        <div><b>{CATALOG.filter(x=>x.checkout).length}</b><small>verified checkout links</small></div>
        <div><b>{CATALOG.filter(x=>x.price!=null).length}</b><small>verified fixed prices</small></div>
        <div><b>{CATALOG.filter(x=>x.kind==='SERVICE').length}</b><small>ESN services</small></div>
        <div><b>{CATALOG.filter(x=>x.kind==='SMP').length}</b><small>SMP products</small></div>
        <a href={DISCORD_URL} target="_blank" rel="noreferrer">ESN DISCORD ↗</a>
      </aside>
    </div></section>

    {mode==='staff'&&<section className="section dark-section"><div className="shell">
      <div className="section-heading"><div><span className="eyebrow">STAFF STORE WORKSPACE</span><h2>Audit the catalog and create local drafts.</h2><p>Drafts stay on this browser until staff intentionally moves verified information into the real website catalog.</p></div></div>
      <div className="store-ai-staff-grid">
        <article className="noacct-panel">
          <span className="noacct-kicker">STORE HEALTH</span><h2>{CATALOG.filter(x=>x.checkout).length}/{CATALOG.length}</h2><p>Direct checkout coverage. Services are normally Discord/quote based, so this is not expected to be 100%.</p>
          <div className="store-ai-audit-list">{CATALOG.filter(x=>!x.checkout||x.price==null).map(item=><div key={item.id}><strong>{item.name}</strong><small>{item.price==null?'NO VERIFIED FIXED PRICE':'PRICE OK'} • {item.checkout?'CHECKOUT OK':'NO DIRECT CHECKOUT'}</small></div>)}</div>
        </article>
        <article className="noacct-panel">
          <span className="noacct-kicker">NEW PRODUCT DRAFT</span>
          <label>NAME<input value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value.slice(0,80)})}/></label>
          <label>TYPE<select value={draft.kind} onChange={e=>setDraft({...draft,kind:e.target.value})}><option>SERVICE</option><option>SMP</option></select></label>
          <label>PRICE LABEL<input value={draft.price} onChange={e=>setDraft({...draft,price:e.target.value.slice(0,30)})} placeholder="$0.00 or CUSTOM QUOTE"/></label>
          <label>CHECKOUT LINK<input value={draft.checkout} onChange={e=>setDraft({...draft,checkout:e.target.value.slice(0,220)})} placeholder="Optional"/></label>
          <label>DESCRIPTION<textarea value={draft.summary} onChange={e=>setDraft({...draft,summary:e.target.value.slice(0,400)})}/></label>
          <button className="store-ai-primary" onClick={saveDraft}>SAVE LOCAL DRAFT</button>
        </article>
      </div>
      <div className="store-ai-drafts">{drafts.map(item=><article key={item.id}><span>LOCAL DRAFT</span><h3>{item.name}</h3><strong>{item.priceLabel}</strong><p>{item.summary||'No description yet.'}</p><button onClick={()=>removeDraft(item.id)}>REMOVE</button></article>)}</div>
    </div></section>}

    <section className="section"><div className="shell">
      <div className="section-heading"><div><span className="eyebrow">FULL STORE CATALOG</span><h2>Everything Store AI currently knows.</h2></div><div className="store-ai-filters">{['ALL','SMP','SERVICE'].map(value=><button className={filter===value?'active':''} onClick={()=>setFilter(value)} key={value}>{value}</button>)}</div></div>
      <div className="store-ai-catalog">{visibleCatalog.map(item=><ProductCard item={item} key={item.id}/>)}</div>
    </div></section>

    {showUnlock&&<div className="store-ai-lock-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowUnlock(false)}}><form className="store-ai-lock" onSubmit={unlock}><span>ESN STORE AI // STAFF</span><h2>Unlock Store Staff Mode.</h2><p>Use the same ESN staff access code.</p><input type="password" inputMode="numeric" autoComplete="off" value={code} onChange={e=>setCode(e.target.value)} placeholder="STAFF ACCESS CODE"/><button type="submit">UNLOCK STAFF MODE</button>{error&&<strong>{error}</strong>}<button className="store-ai-cancel" type="button" onClick={()=>setShowUnlock(false)}>CANCEL</button></form></div>}
  </>
}
