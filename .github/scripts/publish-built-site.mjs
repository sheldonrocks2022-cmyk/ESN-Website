import fs from 'node:fs'

const ROOT_DOMAIN='esnoffical.com'
const ACTIVE_SUBDOMAIN_LABEL='free-subdomain-active'
const PUBLISHED_LABEL='site-builder-published'
const REJECTED_LABEL='site-builder-rejected'
const THEMES=new Set(['midnight','neon','clean','ember','ocean'])
const LAYOUTS=new Set(['spotlight','split','editorial'])
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
function sanitize(site){
  return {
    version:2,
    slug:String(site.slug||'').toLowerCase(),
    brand:text(site.brand,60),
    category:text(site.category,24),
    theme:THEMES.has(site.theme)?site.theme:'midnight',
    layout:LAYOUTS.has(site.layout)?site.layout:'spotlight',
    audience:text(site.audience,60),
    seoTitle:text(site.seoTitle||site.brand,70),
    seoDescription:text(site.seoDescription||site.heroCopy,160),
    heroTitle:text(site.heroTitle,100),
    heroCopy:text(site.heroCopy,320),
    aboutTitle:text(site.aboutTitle,100),
    aboutCopy:text(site.aboutCopy,500),
    cards:Array.isArray(site.cards)?site.cards.slice(0,3).map(card=>({title:text(card.title,70),copy:text(card.copy,260)})):[],
    stats:Array.isArray(site.stats)?site.stats.slice(0,3).map(item=>({value:text(item.value,20),label:text(item.label,70)})):[],
    faq:Array.isArray(site.faq)?site.faq.slice(0,3).map(item=>({q:text(item.q,120),a:text(item.a,360)})):[],
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
if(!encoded||encoded.length>24000)await reject('The site payload is missing or too large.')

let decoded
try{decoded=decodePayload(encoded)}catch{await reject('The site payload could not be decoded.')}
const site=sanitize(decoded)
if(site.slug!==slug)await reject('The site payload does not match the requested ESN subdomain.')
if(!site.brand||!site.heroTitle||site.cards.length!==3||site.stats.length!==3||site.faq.length!==3)await reject('The generated site is missing required content.')
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
  '✅ **Your ESN Website Builder site was published.**\n\n**Public site:** https://'+ROOT_DOMAIN+'/sites/'+slug+'\n\nThe site is live after the main ESN Pages deployment finishes. For now, ESN Website Builder publishes use the `/sites/'+slug+'` address as the public URL.\n\nThe published site is structured and script-free.',
  'completed'
)
