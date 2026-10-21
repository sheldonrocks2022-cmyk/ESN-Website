// Stage verified Node 3 Node.js/Python egg settings without enabling provisioning.
// Makes only read-only panel API requests, then atomically updates private server/.env.
// Does not create a user/server, assign a port, restart services, or show secrets.
import {readFileSync,lstatSync,openSync,writeSync,closeSync,chownSync,renameSync,unlinkSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const envFile=resolve(dirname(fileURLToPath(import.meta.url)),'../.env')
const keys=['PTERODACTYL_NODE_ID',
 'PTERODACTYL_NODEJS_EGG_ID','PTERODACTYL_NODEJS_DOCKER_IMAGE','PTERODACTYL_NODEJS_STARTUP',
 'PTERODACTYL_NODEJS_ENV_JSON',
 'PTERODACTYL_PYTHON_EGG_ID','PTERODACTYL_PYTHON_DOCKER_IMAGE','PTERODACTYL_PYTHON_STARTUP',
 'PTERODACTYL_PYTHON_ENV_JSON']
const fail=message=>{console.error('SAFE CONFIG FAILED: '+message);process.exitCode=1}
const singleLine=v=>typeof v==='string'&&v.length>0&&v.length<2000&&!/[\r\n\0]/.test(v)
const parse=text=>{
  const cfg={}
  for(const line of text.split(/\r?\n/)){
    const m=line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)$/)
    if(!m)continue
    let value=m[2].trim()
    if((value.startsWith('"')&&value.endsWith('"'))||(value.startsWith("'")&&value.endsWith("'")))value=value.slice(1,-1)
    cfg[m[1]]=value
  }
  return cfg
}
async function run(){
  let data,meta,cfg
  try{
    meta=lstatSync(envFile)
    if(!meta.isFile()||meta.isSymbolicLink())throw Error('Invalid private .env file')
    data=readFileSync(envFile,'utf8')
    cfg=parse(data)
  }catch{fail('Cannot safely open private server/.env');return}
  if(cfg.PTERODACTYL_ALLOCATION_ID!=='337'){fail('Allocation setting is not 337');return}
  // The production backend still supports just one generic egg. Do not accidentally
  // mark it connected or expose an untested Provision button for live paid orders.
  if(cfg.PTERODACTYL_EGG_ID||cfg.PTERODACTYL_DOCKER_IMAGE||cfg.PTERODACTYL_STARTUP){
    fail('Active single-egg settings already present. No changes made.');return
  }
  let base
  try{
    base=new URL(cfg.PTERODACTYL_URL)
    if(base.protocol!=='https:'||base.username||base.password||base.search||base.hash||base.pathname!=='/')throw Error()
  }catch{fail('Panel URL is not a plain HTTPS origin');return}
  if(!cfg.PTERODACTYL_API_KEY?.startsWith('ptla_')){fail('Panel Application API key missing');return}
  async function get(path){
    const resp=await fetch(new URL(path,base),{
      headers:{Authorization:'Bearer '+cfg.PTERODACTYL_API_KEY,Accept:'Application/vnd.pterodactyl.v1+json'},
      signal:AbortSignal.timeout(15000)
    })
    if(!resp.ok)throw Error('Panel read-only API HTTP '+resp.status)
    return resp.json()
  }
  let stage
  try{
    const allocs=await get('/api/application/nodes/3/allocations?per_page=100&page=1')
    if(!Array.isArray(allocs.data))throw Error('Unexpected allocation response')
    const allocation=allocs.data.map(x=>x.attributes).find(x=>Number(x?.id)===337)
    if(!allocation||allocation.assigned!==false)throw Error('Allocation 337 is not confirmed unassigned on Node 3')
    const specs=[{type:'NODEJS',id:16,preference:/nodejs_24$/,fallback:/nodejs_22$/},
                 {type:'PYTHON',id:15,preference:/python_3\.13$/,fallback:/python_3\.12$/}]
    stage={PTERODACTYL_NODE_ID:'3'}
    for(const s of specs){
      const result=await get('/api/application/nests/5/eggs/'+s.id+'?include=variables')
      const egg=result.attributes||{}
      if(Number(egg.id)!==s.id||typeof egg.name!=='string')throw Error('Expected egg ID '+s.id+' not returned')
      if(!singleLine(egg.startup))throw Error('Startup template unavailable for egg '+s.id)
      const images=Object.values(egg.docker_images||{}).filter(singleLine)
      const image=images.find(x=>s.preference.test(x))||images.find(x=>s.fallback.test(x))
      if(!image)throw Error('No approved container image found for egg '+s.id)
      // Pterodactyl 1.x Fractal API nests included relationships under attributes.
      const variables=result.attributes?.relationships?.variables?.data ?? result.relationships?.variables?.data
      if(!Array.isArray(variables))throw Error('Egg '+s.id+' did not return an accessible variable list')
      const defaults={}
      for(const item of variables){
        const variable=item.attributes||{}
        const key=String(variable.env_variable||'')
        if(!/^[A-Z][A-Z0-9_]*$/.test(key))throw Error('Egg '+s.id+' has a malformed environment variable')
        const value=variable.default_value===null||variable.default_value===undefined?'':String(variable.default_value)
        if(String(variable.rules||'').split('|').includes('required')&&!value.trim()){
          throw Error('Egg '+s.id+' has required variables with no default; manual review needed')
        }
        if(value){
          if(value.includes('\\0'))throw Error('Egg '+s.id+' has an invalid variable default')
          defaults[key]=value
        }
      }
      stage['PTERODACTYL_'+s.type+'_EGG_ID']=String(s.id)
      stage['PTERODACTYL_'+s.type+'_DOCKER_IMAGE']=image
      stage['PTERODACTYL_'+s.type+'_STARTUP']=egg.startup
      stage['PTERODACTYL_'+s.type+'_ENV_JSON']=JSON.stringify(defaults)
    }
  }catch(e){fail(String(e?.message||'Panel read-only check failed').slice(0,120));return}
  const lines=data.split(/\r?\n/)
  if(lines.at(-1)==='')lines.pop()
  for(const [key,value] of Object.entries(stage)){
    if(!singleLine(value))throw Error('Unsafe egg value for '+key)
    const old=lines.findIndex(l=>new RegExp('^'+key+'=').test(l))
    if(old>=0)lines[old]=key+'='+value
    else lines.push(key+'='+value)
  }
  const output=lines.join('\n')+'\n'
  // Preserve file owner/mode across atomic replacement (service runs as esnbusiness).
  const tmp=envFile+'.staging-'+process.pid
  try{
    const fd=openSync(tmp,'wx',0o600)
    try{writeSync(fd,output,'utf8')}finally{closeSync(fd)}
    chownSync(tmp,meta.uid,meta.gid)
    renameSync(tmp,envFile)
  }catch{
    try{unlinkSync(tmp)}catch{}
    fail('Private config update failed; previous file preserved')
    return
  }
  console.log('STAGED: Node 3 allocation 337 is free.')
  console.log('STAGED: Node.js egg 16 with verified image/startup.')
  console.log('STAGED: Python egg 15 with verified image/startup.')
  console.log('Provisioning NOT enabled: backend runtime selection still needs implementation and testing.')
  console.log('No existing customer servers or allocations changed. No service restart needed.')
}
await run()
