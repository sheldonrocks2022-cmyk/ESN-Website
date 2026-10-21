// Read-only ESN panel diagnostic. No server or allocation is created or changed.
// Lists available Node.js/Python eggs and verifies Node 3's intended allocation.
// Uses private VPS .env without printing credentials, IPs, or service secrets.
import {readFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const envFile=resolve(dirname(fileURLToPath(import.meta.url)),'../.env')
function fail(msg){console.error('CHECK FAILED: '+msg);process.exitCode=1}
function readEnv(){
  const values={}
  for(const line of readFileSync(envFile,'utf8').split(/\r?\n/)){
    const m=line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)$/)
    if(!m)continue
    let v=m[2].trim()
    if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1)
    values[m[1]]=v
  }
  return values
}
function title(v){return String(v||'').replace(/[\r\n\t]/g,' ').slice(0,70)}
let env
try{env=readEnv()}catch{fail('Unable to read private server/.env')}
if(env){
  if(env.PTERODACTYL_ALLOCATION_ID==='337')console.log('Node 3 allocation setting: 337 (saved)')
  else if(!env.PTERODACTYL_ALLOCATION_ID)console.log('Node 3 allocation setting: MISSING (sed may not have found the line)')
  else console.log('Node 3 allocation setting: '+(/^\d+$/.test(env.PTERODACTYL_ALLOCATION_ID)?env.PTERODACTYL_ALLOCATION_ID:'unexpected value'))
  try{
    const base=new URL(env.PTERODACTYL_URL||'')
    if(base.protocol!=='https:'||base.username||base.password||base.search||base.hash||base.pathname!=='/')throw Error('Invalid panel URL')
    if(!env.PTERODACTYL_API_KEY?.startsWith('ptla_'))throw Error('Application API key not configured')
    async function get(path){
      const response=await fetch(new URL(path,base),{headers:{
        Authorization:'Bearer '+env.PTERODACTYL_API_KEY,
        Accept:'Application/vnd.pterodactyl.v1+json'
      },signal:AbortSignal.timeout(15000)})
      if(!response.ok)throw Error('Panel read-only API returned HTTP '+response.status)
      return response.json()
    }
    async function list(path){
      const items=[]
      for(let page=1;page<=30;page++){
        const response=await get(path+(path.includes('?')?'&':'?')+'per_page=100&page='+page)
        if(!Array.isArray(response.data))throw Error('Unexpected list response')
        items.push(...response.data.map(item=>item.attributes||{}))
        const last=Number(response.meta?.pagination?.total_pages||1)
        if(page>=last)return items
      }
      throw Error('Too many API pages')
    }
    // Read-only verification that chosen allocation remains unassigned on Node 3.
    const a=await list('/api/application/nodes/3/allocations')
    const selected=a.find(x=>String(x.id)==='337')
    console.log('Allocation 337 on Node 3: '+(!selected?'NOT FOUND':selected.assigned===false?'UNASSIGNED (available)':'ALREADY ASSIGNED (do not use)'))
    const nests=await list('/api/application/nests')
    const eggs=[]
    for(const nest of nests){
      if(!/^\d+$/.test(String(nest.id)))continue
      const nestEggs=await list('/api/application/nests/'+nest.id+'/eggs')
      for(const egg of nestEggs)eggs.push({id:egg.id,name:title(egg.name),nest:title(nest.name),startup:String(egg.startup||''),images:Object.values(egg.docker_images||{})})
    }
    const matched=eggs.filter(x=>/node\s*\.?\s*js|nodejs|discord.?bot|python/i.test(x.name+' '+x.nest+' '+x.images.join(' ')))
    console.log('Panel eggs total: '+eggs.length)
    console.log('Potential Node.js / Python eggs:')
    if(!matched.length)console.log('No clear match; available egg names: '+eggs.slice(0,12).map(x=>x.name+' (ID '+x.id+')').join(', '))
    for(const egg of matched.slice(0,12)){
      console.log(' - Egg ID '+egg.id+' | '+egg.name+' | nest '+egg.nest)
      console.log('   Images: '+(egg.images.slice(0,2).map(title).join(', ')||'not provided'))
    }
    if(matched.length>12)console.log('...and '+(matched.length-12)+' more matching eggs')
    console.log('READ-ONLY COMPLETE: No allocations or customer servers changed.')
  }catch(e){fail(title(e?.message||'Unknown API error'))}
}
