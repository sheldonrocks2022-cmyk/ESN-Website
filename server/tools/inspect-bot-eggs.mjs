// ESN safe preflight: examine Node 3 bot eggs and unassigned allocation.
// GET requests only. Never prints private API keys, IPs, customer data or variable defaults.
import {readFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const envFile=resolve(dirname(fileURLToPath(import.meta.url)),'../.env')
const clean=s=>String(s??'').replace(/[\r\n\t]/g,' ').slice(0,100)
function fail(msg){console.error('CHECK FAILED: '+clean(msg));process.exitCode=1}
function load(){
  const env={}
  for(const line of readFileSync(envFile,'utf8').split(/\r?\n/)){
    const m=line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)$/)
    if(!m)continue
    let value=m[2].trim()
    if((value.startsWith('"')&&value.endsWith('"'))||(value.startsWith("'")&&value.endsWith("'")))value=value.slice(1,-1)
    env[m[1]]=value
  }
  return env
}
let env
try{env=load()}catch{fail('Cannot read the private server/.env')}
if(env){
  try{
    const origin=new URL(env.PTERODACTYL_URL||'')
    if(origin.protocol!=='https:'||origin.username||origin.password||origin.search||origin.hash||origin.pathname!=='/')throw Error('Panel must be a plain HTTPS origin')
    if(!env.PTERODACTYL_API_KEY?.startsWith('ptla_'))throw Error('Pterodactyl Application API key missing')
    async function get(path){
      const response=await fetch(new URL(path,origin),{headers:{
        Authorization:'Bearer '+env.PTERODACTYL_API_KEY,
        Accept:'Application/vnd.pterodactyl.v1+json'
      },signal:AbortSignal.timeout(15000)})
      if(!response.ok)throw Error('Panel read-only request returned HTTP '+response.status)
      return response.json()
    }
    async function list(path){
      const results=[]
      for(let page=1;page<=30;page++){
        const result=await get(path+(path.includes('?')?'&':'?')+'per_page=100&page='+page)
        if(!Array.isArray(result.data))throw Error('Unexpected Pterodactyl list response')
        results.push(...result.data.map(x=>x.attributes||{}))
        if(page>=Number(result.meta?.pagination?.total_pages||1))return results
      }
      throw Error('Panel API list exceeded page limit')
    }
    const selected=Number(env.PTERODACTYL_ALLOCATION_ID||0)
    const allocations=await list('/api/application/nodes/3/allocations')
    const chosen=allocations.find(x=>Number(x.id)===selected)
    console.log('Node 3 allocation: '+(chosen?(chosen.assigned===false?'UNASSIGNED':'ASSIGNED'):'NOT FOUND')+' | configured ID '+(selected||'missing'))
    if(selected!==337||!chosen||chosen.assigned!==false)console.log('STOP: Selected allocation is not the expected free ID 337.')
    const nests=await list('/api/application/nests')
    for(const eggId of [16,15]){
      let found=null
      for(const nest of nests){
        const eggs=await list('/api/application/nests/'+Number(nest.id)+'/eggs')
        const egg=eggs.find(e=>Number(e.id)===eggId)
        if(egg){found={nest:nest.id};break}
      }
      if(!found){console.log('Egg '+eggId+': NOT FOUND');continue}
      const detail=await get('/api/application/nests/'+found.nest+'/eggs/'+eggId+'?include=variables')
      const e=detail.attributes||{}
      console.log('')
      console.log('Egg '+eggId+': '+clean(e.name)+' (nest '+found.nest+')')
      const images=Object.values(e.docker_images||{})
      console.log('Available images: '+(images.length?images.slice(0,5).map(clean).join(', '):'not reported'))
      console.log('Startup template available: '+(typeof e.startup==='string'&&e.startup.length>0?'YES':'NO'))
      const vars=detail.relationships?.variables?.data||[]
      console.log('Egg environment variables ('+vars.length+'):')
      if(!vars.length)console.log(' - No variables returned by API')
      for(const item of vars){
        const v=item.attributes||{}
        const rules=String(v.rules||'').split('|')
        const needs=rules.includes('required')&&(v.default_value===''||v.default_value===null||v.default_value===undefined)
        console.log(' - '+clean(v.env_variable||v.name)+' | '+(needs?'REQUIRED, NO DEFAULT':'has default or optional'))
      }
    }
    console.log('')
    console.log('READ-ONLY PREFLIGHT COMPLETE. No servers, allocations or .env settings changed.')
  }catch(e){fail(e?.message||'Panel request failed')}
}
