import fs from 'node:fs'

// Spaceship API key must have dnsrecords:read and dnsrecords:write permissions.
const ROOT_DOMAIN='esnoffical.com'
const ACTIVE_LABEL='free-subdomain-active'
const REJECTED_LABEL='free-subdomain-rejected'
const RESERVED=new Set(['www','api','admin','staff','store','store-ai','smp','status','support','mail','billing','domains','hosting','dns','ftp','cpanel','webmail','discord','nexus','arcade','tools','assets','cdn','static','auth','login','dashboard','root','esn','official','offical'])
const DOMAIN_RE=/^(?=.{3,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i
const LABEL_RE=/^[a-z0-9](?:[a-z0-9-]{0,46}[a-z0-9])?$/
const MULTI_SUBDOMAIN_ACCOUNTS=new Set(['sheldonrocks2022-cmyk'])

const event=JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH,'utf8'))
const issue=event.issue
if(!issue||!issue.title?.startsWith('[FREE-SUBDOMAIN]'))process.exit(0)

const repo=process.env.GITHUB_REPOSITORY
const token=process.env.GITHUB_TOKEN
const spaceshipKey=process.env.SPACESHIP_API_KEY
const spaceshipSecret=process.env.SPACESHIP_API_SECRET
if(!repo||!token)throw new Error('GitHub workflow context is incomplete.')

const [owner,name]=repo.split('/')
const actor=issue.user?.login||'unknown'
const body=issue.body||''
const issueNumber=issue.number

const subdomain=(body.match(/^Subdomain:\s*`?([a-z0-9-]+)`?\s*$/mi)?.[1]||'').toLowerCase()
const rawTarget=(body.match(/^Target:\s*`?([^\s`]+)`?\s*$/mi)?.[1]||'').trim().toLowerCase()
const agreed=/^Terms:\s*I agree to the ESN free subdomain rules\.\s*$/mi.test(body)
const hostReady=/^Host readiness:\s*I confirmed my destination host supports this custom domain and HTTPS\.\s*$/mi.test(body)

function targetHostname(value){
  if(!value)return ''
  try{
    const parsed=new URL(/^https?:\/\//i.test(value)?value:'https://'+value)
    if(parsed.username||parsed.password||parsed.port)return ''
    return parsed.hostname.replace(/\.$/,'').toLowerCase()
  }catch{return ''}
}
const target=targetHostname(rawTarget)

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
    const text=await response.text()
    throw new Error('GitHub API '+response.status+': '+text.slice(0,500))
  }
  if(response.status===204)return null
  return response.json()
}

async function ensureLabel(label,color,description){
  const response=await fetch(`https://api.github.com/repos/${repo}/labels/${encodeURIComponent(label)}`,{
    headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28'},
  })
  if(response.ok)return
  if(response.status!==404)throw new Error('Could not check GitHub label '+label)
  const create=await fetch(`https://api.github.com/repos/${repo}/labels`,{
    method:'POST',
    headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},
    body:JSON.stringify({name:label,color,description}),
  })
  if(!create.ok&&create.status!==422)throw new Error('Could not create GitHub label '+label)
}

async function comment(message){
  await gh(`/repos/${repo}/issues/${issueNumber}/comments`,{method:'POST',body:JSON.stringify({body:message})})
}
async function closeWith(label,titlePrefix,message){
  await ensureLabel(label,label===ACTIVE_LABEL?'0E8A16':'B60205',label===ACTIVE_LABEL?'Automatically provisioned ESN free subdomain':'Rejected ESN free subdomain request')
  await gh(`/repos/${repo}/issues/${issueNumber}/labels`,{method:'POST',body:JSON.stringify({labels:[label]})})
  await comment(message)
  await gh(`/repos/${repo}/issues/${issueNumber}`,{method:'PATCH',body:JSON.stringify({state:'closed',title:`${titlePrefix} ${subdomain||'request'}`})})
}
async function reject(reason){
  await closeWith(REJECTED_LABEL,'[FREE-SUBDOMAIN-REJECTED]',`❌ **ESN automatic subdomain request rejected**\n\n${reason}\n\nNo DNS record was created.`)
  process.exit(0)
}

if(!spaceshipKey||!spaceshipSecret){
  await comment('⚠️ **ESN automatic DNS is not activated yet.** The provisioning workflow is installed, but the Spaceship API credentials have not been connected to GitHub Secrets. No DNS record was created.')
  process.exit(1)
}
if(!agreed)await reject('The ESN free-subdomain terms marker is missing.')
if(!hostReady)await reject('Confirm that your destination host supports the requested custom domain and HTTPS before ESN creates DNS.')
if(!LABEL_RE.test(subdomain)||RESERVED.has(subdomain))await reject('That subdomain name is invalid or reserved by ESN.')
if(!DOMAIN_RE.test(target))await reject('The target must be a normal hostname such as `username.github.io` or `project.example.com`.')
if(target===ROOT_DOMAIN||target.endsWith('.'+ROOT_DOMAIN))await reject('A free subdomain cannot point back into the ESN domain because that can create routing loops.')

const existingForUser=await gh(`/repos/${repo}/issues?state=all&creator=${encodeURIComponent(actor)}&labels=${encodeURIComponent(ACTIVE_LABEL)}&per_page=100`)
if(!MULTI_SUBDOMAIN_ACCOUNTS.has(actor.toLowerCase())&&existingForUser.some(item=>item.number!==issueNumber)){
  await reject('Free ESN subdomains are limited to **one active subdomain per GitHub account**.')
}

const apiHeaders={
  'X-API-Key':spaceshipKey,
  'X-API-Secret':spaceshipSecret,
  Accept:'application/json',
}
const recordsUrl='https://spaceship.dev/api/v1/dns/records/'+ROOT_DOMAIN
const listResponse=await fetch(recordsUrl+'?take=500&skip=0&orderBy=name',{headers:apiHeaders})
if(!listResponse.ok){
  const text=await listResponse.text()
  throw new Error('Spaceship DNS read failed '+listResponse.status+': '+text.slice(0,500))
}
const zone=await listResponse.json()
const collision=(zone.items||[]).find(record=>String(record.name||'').toLowerCase()===subdomain)
if(collision)await reject(`${subdomain}.${ROOT_DOMAIN} is already in use.`)

const saveResponse=await fetch(recordsUrl,{
  method:'PUT',
  headers:{...apiHeaders,'Content-Type':'application/json'},
  body:JSON.stringify({
    force:false,
    items:[{type:'CNAME',name:subdomain,cname:target,ttl:3600}],
  }),
})
if(!saveResponse.ok){
  const text=await saveResponse.text()
  throw new Error('Spaceship DNS write failed '+saveResponse.status+': '+text.slice(0,1000))
}

await closeWith(
  ACTIVE_LABEL,
  '[FREE-SUBDOMAIN-ACTIVE]',
  `✅ **Your free ESN DNS record was created automatically.**\n\n**Address:** \`${subdomain}.${ROOT_DOMAIN}\`\n**CNAME target:** \`${target}\`\n\n**Important:** DNS creation does not guarantee the website or HTTPS certificate is ready yet. Your destination host must accept \`${subdomain}.${ROOT_DOMAIN}\` as a custom domain and finish SSL/HTTPS provisioning before browsers will show it securely.\n\nESN may remove free subdomains used for phishing, malware, impersonation, spam, or other abuse.`
)
