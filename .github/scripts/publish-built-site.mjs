import fs from 'node:fs'

const ROOT_DOMAIN='esnoffical.com'
const ACTIVE_SUBDOMAIN_LABEL='free-subdomain-active'
const PUBLISHED_LABEL='site-builder-published'
const REJECTED_LABEL='site-builder-rejected'
const THEMES=new Set(['midnight','neon','clean','ember','ocean','void','aurora','forest','rose','gold','ice','sunset','mono','lime','royal','candy'])
const EXPERIENCE_PACKS=new Set(['essential','showcase','network','full'])
const SHAPES=new Set(['rounded','sharp','soft'])
const DENSITIES=new Set(['airy','balanced','dense'])
const MOTIONS=new Set(['calm','dynamic','cinematic'])
const LAYOUTS=new Set(['spotlight','split','editorial','flagship','stacked','poster','studio','dashboard'])
const STYLE_PRESETS=new Set(['studio','cyber','luxury','editorial','minimal','playful','brutalist','glass','retro','organic','arcade','cinematic'])
const BACKGROUNDS=new Set(['solid','gradient','mesh','grid','aurora','spotlight','paper','noise'])
const SURFACES=new Set(['solid','glass','frosted','outline','elevated','flat'])
const HERO_STYLES=new Set(['left','center','split','poster','stacked'])
const CARD_STYLES=new Set(['clean','glass','glow','outline','tiles','floating'])
const BUTTON_STYLES=new Set(['pill','rounded','square','outline','glow'])
const FX_STYLES=new Set(['none','glow','grain','scanlines','stars'])
const CONTRASTS=new Set(['soft','normal','high'])
const FONT_STYLES=new Set(['system','geometric','serif','mono','rounded','condensed'])
const HOME_SECTION_KEYS=['status','story','timeline','highlights','gallery','feature','testimonials','process','faq','socials','countdown','minecraft','visitor']
const BLOCKED=/password|passcode|seed phrase|wallet recovery|credit card|social security|bank login|verify your account|sign in to continue/i
const SLUG_RE=/^[a-z0-9](?:[a-z0-9-]{0,46}[a-z0-9])?$/

const event=JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH,'utf8'))
const issue=event.issue
if(!issue||!issue.title?.startsWith('[SITE-BUILD]'))process.exit(0)

const repo=process.env.GITHUB_REPOSITORY
const token=process.env.GITHUB_TOKEN
const actor=issue.user?.login||'unknown'
const issueNumber=issue.number
const body=issue.body||''
if(!repo||!token)throw new Error('GitHub workflow context missing.')

const slug=(body.match(/^Subdomain:\s*`?([a-z0-9-]+)`?\s*$/mi)?.[1]||'').toLowerCase()
const encoded=(body.match(/^Site payload:\s*`?([A-Za-z0-9_-]+)`?\s*$/mi)?.[1]||'')
const agreed=/^Terms:\s*I confirm this build does not request passwords, payment-card data, recovery phrases, or other sensitive credentials\.\s*$/mi.test(body)

async function gh(path,options={}){
  const response=await fetch('https://api.github.com'+path,{
    ...options,
    headers:{
      Accept:'application/vnd.github+json',
      Authorization:'Bearer '+token,
      'X-GitHub-Api-Version':'2022-11-28',
      'Content-Type':'application/json',
      ...(options.headers||{}),
    },
  })
  if(!response.ok){
    const message=await response.text()
    throw new Error('GitHub API '+response.status+': '+message.slice(0,800))
  }
  if(response.status===204)return null
  return response.json()
}
async function ensureLabel(label,color,description){
  const check=await fetch('https://api.github.com/repos/'+repo+'/labels/'+encodeURIComponent(label),{
    headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28'},
  })
  if(check.ok)return
  if(check.status!==404)throw new Error('Could not check label '+label)
  const create=await fetch('https://api.github.com/repos/'+repo+'/labels',{
    method:'POST',
    headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},
    body:JSON.stringify({name:label,color,description}),
  })
  if(!create.ok&&create.status!==422)throw new Error('Could not create label '+label)
}
async function comment(message){
  await gh('/repos/'+repo+'/issues/'+issueNumber+'/comments',{method:'POST',body:JSON.stringify({body:message})})
}
async function finish(label,title,message,stateReason){
  await ensureLabel(label,label===PUBLISHED_LABEL?'0E8A16':'B60205',label===PUBLISHED_LABEL?'Published ESN Website Builder site':'Rejected ESN Website Builder publish request')
  await gh('/repos/'+repo+'/issues/'+issueNumber+'/labels',{method:'POST',body:JSON.stringify({labels:[label]})})
  await comment(message)
  await gh('/repos/'+repo+'/issues/'+issueNumber,{method:'PATCH',body:JSON.stringify({state:'closed',state_reason:stateReason||'completed',title})})
}
async function reject(reason){
  await finish(REJECTED_LABEL,'[SITE-BUILD-REJECTED] '+(slug||'request'),'❌ **ESN Website Builder publish rejected**\n\n'+reason+'\n\nNo site data was published.','not_planned')
  process.exit(0)
}
function decodePayload(value){
  let normalized=value.replaceAll('-','+').replaceAll('_','/')
  while(normalized.length%4)normalized+='='
  const bytes=Buffer.from(normalized,'base64')
  return JSON.parse(bytes.toString('utf8'))
}
function text(value,max){return String(value||'').trim().slice(0,max)}
function url(value){
  try{
    const parsed=new URL(String(value||'').trim())
    return ['https:','http:'].includes(parsed.protocol)?parsed.toString():''
  }catch{return ''}
}
function image(value){
  const raw=String(value||'').trim()
  if(/^data:image\/(?:webp|png|jpeg);base64,[a-z0-9+/=]+$/i.test(raw)&&raw.length<=16000)return raw
  return url(raw)
}
function sanitize(site){
  const rawSections=site.sections&&typeof site.sections==='object'?site.sections:{}
  const rawVisual=site.visual&&typeof site.visual==='object'?site.visual:{}
  const hex=value=>/^#[0-9a-f]{6}$/i.test(String(value||'').trim())?String(value).trim():'#65e8ff'
  return {
    version:7,
    multiPage:site.multiPage===true,
    slug:String(site.slug||'').toLowerCase(),
    brand:text(site.brand,60),
    category:text(site.category,24),
    theme:THEMES.has(site.theme)?site.theme:'midnight',
    layout:LAYOUTS.has(site.layout)?site.layout:'spotlight',
    audience:text(site.audience,60),
    visual:{
      accent:hex(rawVisual.accent),
      shape:SHAPES.has(rawVisual.shape)?rawVisual.shape:'rounded',
      density:DENSITIES.has(rawVisual.density)?rawVisual.density:'balanced',
      motion:MOTIONS.has(rawVisual.motion)?rawVisual.motion:'dynamic',
      nav:['glass','minimal','rail'].includes(rawVisual.nav)?rawVisual.nav:'glass',
      type:['display','editorial','technical'].includes(rawVisual.type)?rawVisual.type:'display',
      font:FONT_STYLES.has(rawVisual.font)?rawVisual.font:'system',
      style:STYLE_PRESETS.has(rawVisual.style)?rawVisual.style:'studio',
      background:BACKGROUNDS.has(rawVisual.background)?rawVisual.background:'gradient',
      surface:SURFACES.has(rawVisual.surface)?rawVisual.surface:'elevated',
      hero:HERO_STYLES.has(rawVisual.hero)?rawVisual.hero:'left',
      cards:CARD_STYLES.has(rawVisual.cards)?rawVisual.cards:'clean',
      buttons:BUTTON_STYLES.has(rawVisual.buttons)?rawVisual.buttons:'rounded',
      fx:FX_STYLES.has(rawVisual.fx)?rawVisual.fx:'glow',
      contrast:CONTRASTS.has(rawVisual.contrast)?rawVisual.contrast:'normal',
    },
    pages:Array.isArray(site.pages)?site.pages.slice(0,3).map((page,index)=>({
      slug:String(page.slug||('page-'+(index+1))).toLowerCase().replace(/[^a-z0-9-]/g,'').slice(0,48),
      title:text(page.title,40),
      eyebrow:text(page.eyebrow,50),
      headline:text(page.headline,100),
      copy:text(page.copy,480),
      items:Array.isArray(page.items)?page.items.slice(0,3).map(item=>({title:text(item.title,80),copy:text(item.copy,260)})):[],
    })):[],
    seoTitle:text(site.seoTitle||site.brand,70),
    seoDescription:text(site.seoDescription||site.heroCopy,160),
    heroTitle:text(site.heroTitle,100),
    heroCopy:text(site.heroCopy,320),
    aboutTitle:text(site.aboutTitle,100),
    aboutCopy:text(site.aboutCopy,500),
    cards:Array.isArray(site.cards)?site.cards.slice(0,3).map(card=>({title:text(card.title,70),copy:text(card.copy,260)})):[],
    stats:Array.isArray(site.stats)?site.stats.slice(0,3).map(item=>({value:text(item.value,20),label:text(item.label,70)})):[],
    faq:Array.isArray(site.faq)?site.faq.slice(0,3).map(item=>({q:text(item.q,120),a:text(item.a,360)})):[],
    pack:EXPERIENCE_PACKS.has(site.pack)?site.pack:'full',
    sections:{
      announcement:rawSections.announcement!==false,
      status:rawSections.status!==false,
      timeline:rawSections.timeline!==false,
      testimonials:rawSections.testimonials!==false,
      gallery:rawSections.gallery!==false,
      socials:rawSections.socials!==false,
      countdown:rawSections.countdown===true,
      minecraft:rawSections.minecraft===true,
      visitor:rawSections.visitor===true,
    },
    announcement:{
      label:text(site.announcement?.label,24),
      title:text(site.announcement?.title,100),
      copy:text(site.announcement?.copy,240),
    },
    status:Array.isArray(site.status)?site.status.slice(0,3).map(item=>({label:text(item.label,60),value:text(item.value,30),state:['live','ready','offline'].includes(item.state)?item.state:'ready'})):[],
    timeline:Array.isArray(site.timeline)?site.timeline.slice(0,4).map(item=>({kicker:text(item.kicker,20),title:text(item.title,80),copy:text(item.copy,260)})):[],
    testimonials:Array.isArray(site.testimonials)?site.testimonials.slice(0,3).map(item=>({quote:text(item.quote,280),name:text(item.name,60),role:text(item.role,60)})):[],
    gallery:Array.isArray(site.gallery)?site.gallery.slice(0,4).map(item=>({title:text(item.title,80),copy:text(item.copy,220),image:image(item.image),alt:text(item.alt||item.title,100)})):[],
    socials:Array.isArray(site.socials)?site.socials.slice(0,3).map(item=>({label:text(item.label,40),url:url(item.url)})):[],
    galleryMode:['grid','carousel'].includes(site.galleryMode)?site.galleryMode:'grid',
    sectionOrder:(Array.isArray(site.sectionOrder)?site.sectionOrder:HOME_SECTION_KEYS).filter((key,index,array)=>HOME_SECTION_KEYS.includes(key)&&array.indexOf(key)===index).concat(HOME_SECTION_KEYS.filter(key=>!(Array.isArray(site.sectionOrder)?site.sectionOrder:[]).includes(key))).slice(0,HOME_SECTION_KEYS.length),
    countdown:{title:text(site.countdown?.title,80),target:text(site.countdown?.target,40),label:text(site.countdown?.label,30)},
    minecraft:{address:text(site.minecraft?.address,120).replace(/[^a-z0-9.\-_:]/gi,''),bedrock:site.minecraft?.bedrock===true,title:text(site.minecraft?.title,80)},
    visitor:{label:text(site.visitor?.label,60)},
    notFound:{title:text(site.notFound?.title,100),copy:text(site.notFound?.copy,300),buttonLabel:text(site.notFound?.buttonLabel,40)},
    ctaTitle:text(site.ctaTitle,100),
    ctaCopy:text(site.ctaCopy,260),
    ctaLabel:text(site.ctaLabel,50),
    ctaUrl:url(site.ctaUrl),
    footer:text(site.footer,100),
    publishedBy:actor,
    publishedAt:new Date().toISOString(),
  }
}

if(!agreed)await reject('The required safe-publishing confirmation is missing.')
if(!SLUG_RE.test(slug))await reject('The ESN subdomain name is invalid.')
if(!encoded||encoded.length>150000)await reject('The site payload is missing or too large.')

let decoded
try{decoded=decodePayload(encoded)}catch{await reject('The site payload could not be decoded.')}
const site=sanitize(decoded)
if(site.slug!==slug)await reject('The site payload does not match the requested ESN subdomain.')
if(!site.brand||!site.heroTitle||site.cards.length!==3||site.stats.length!==3||site.faq.length!==3||site.timeline.length!==4||site.gallery.length!==4||site.pages.length!==3||site.pages.some(page=>page.items.length!==3))await reject('The generated site is missing required content.')
if(BLOCKED.test(JSON.stringify(site)))await reject('This build contains wording associated with collecting sensitive credentials or payment information. ESN free sites cannot be used for that.')

const owned=await gh('/repos/'+repo+'/issues?state=all&creator='+encodeURIComponent(actor)+'&labels='+encodeURIComponent(ACTIVE_SUBDOMAIN_LABEL)+'&per_page=100')
const ownership=owned.some(item=>String(item.title||'').toLowerCase()==='[free-subdomain-active] '+slug)
if(!ownership)await reject('Your GitHub account does not have the active free subdomain `'+slug+'.'+ROOT_DOMAIN+'`. Claim the subdomain first, then publish the build from the same GitHub account.')

const path='public/generated-sites/'+slug+'.json'
let currentSha=''
const current=await fetch('https://api.github.com/repos/'+repo+'/contents/'+path+'?ref=main',{
  headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28'},
})
if(current.ok){
  const existing=await current.json()
  currentSha=existing.sha||''
}else if(current.status!==404){
  const details=await current.text()
  throw new Error('Could not inspect existing site file: '+current.status+' '+details.slice(0,500))
}

const json=JSON.stringify(site,null,2)+'\n'
const payload={
  message:(currentSha?'Update':'Publish')+' ESN site '+slug,
  content:Buffer.from(json,'utf8').toString('base64'),
  branch:'main',
}
if(currentSha)payload.sha=currentSha
await gh('/repos/'+repo+'/contents/'+path,{method:'PUT',body:JSON.stringify(payload)})

await finish(
  PUBLISHED_LABEL,
  '[SITE-BUILD-PUBLISHED] '+slug,
  '✅ **Your ESN Website Builder site was published.**\n\n**Public site:** https://'+ROOT_DOMAIN+'/sites/'+slug+'\n\nThe site is live after the main ESN Pages deployment finishes. For now, ESN Website Builder publishes use the `/sites/'+slug+'` address as the homepage. V6 multi-page builds can also publish pages such as `/sites/'+slug+'/about`.\n\nThe published site is structured and script-free.',
  'completed'
)
