// Read-only Pterodactyl diagnostic for ESN Node 3.
// Lists unassigned Pterodactyl allocations. Never creates, assigns, or alters servers.
// Does not print API keys, server data, IP addresses, or full HTTP error bodies.
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {dirname,join} from 'node:path'

function fail(message){console.error('CHECK FAILED: '+message);process.exitCode=1}
function settings(){
  const envPath=join(dirname(fileURLToPath(import.meta.url)),'..','.env')
  const map={}
  for(const line of readFileSync(envPath,'utf8').split(/\r?\n/)){
    const match=line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/)
    if(!match)continue
    let value=match[2].trim()
    if((value.startsWith('"')&&value.endsWith('"'))||(value.startsWith("'")&&value.endsWith("'")))value=value.slice(1,-1)
    map[match[1]]=value
  }
  return map
}
async function run(){
  let env
  try{env=settings()}catch{fail('Unable to read private server/.env.');return}
  const rawBase=env.PTERODACTYL_URL||''
  let base
  try{
    base=new URL(rawBase)
    if(base.protocol!=='https:'||base.username||base.password||base.search||base.hash||base.pathname!=='/')throw Error()
  }catch{fail('PTERODACTYL_URL must be an HTTPS origin.');return}
  const token=env.PTERODACTYL_API_KEY||''
  if(!token.startsWith('ptla_')){fail('Private Application API key missing or wrong type.');return}
  async function get(path){
    const res=await fetch(new URL(path,base),{
      headers:{Authorization:'Bearer '+token,Accept:'Application/vnd.pterodactyl.v1+json'},
      signal:AbortSignal.timeout(15000)
    })
    if(!res.ok)throw Error('Read-only panel API returned HTTP '+res.status)
    return res.json()
  }
  async function all(path){
    const out=[]
    for(let page=1;page<=30;page++){
      const sep=path.includes('?')?'&':'?'
      const result=await get(path+sep+'per_page=100&page='+page)
      if(!Array.isArray(result.data))throw Error('Unexpected Pterodactyl API response')
      out.push(...result.data.map(item=>item.attributes||{}))
      const pagination=result.meta?.pagination
      if(pagination&&page<Number(pagination.total_pages))continue
      if(!pagination&&result.links?.next)continue
      return out
    }
    throw Error('Too many Pterodactyl API pages to safely enumerate')
  }
  try{
    const nodes=await all('/api/application/nodes')
    const matchNode=node=>{
      const name=String(node.name||'')
      const fqdn=String(node.fqdn||'')
      return /(?:^|[^a-z0-9])(?:node|esn)[\s_-]*0*3(?:$|[^0-9])/i.test(name) ||
        fqdn.toLowerCase()==='node3.esnoffical.com' ||
        fqdn.toLowerCase()==='esn3.esnoffical.com'
    }
    const matches=nodes.filter(matchNode)
    if(matches.length!==1){
      console.log('NODE 3: not uniquely identified (matches: '+matches.length+').')
      console.log('Available node names and IDs (no IP addresses):')
      nodes.forEach(n=>console.log(' - '+String(n.name||'Unnamed').slice(0,70)+' | ID '+n.id))
      console.log('No changes made. Specify the correct Node 3 ID before configuring allocations.')
      return
    }
    const node=matches[0]
    const allocations=await all('/api/application/nodes/'+encodeURIComponent(node.id)+'/allocations')
    const free=allocations.filter(a=>a.assigned===false && Number.isInteger(Number(a.id)) && Number.isInteger(Number(a.port)))
    console.log('Node 3: '+String(node.name).slice(0,70)+' (ID '+node.id+')')
    console.log('Unassigned Pterodactyl allocations: '+free.length)
    if(free.length){
      console.log('Available allocation IDs and ports (first 5):')
      free.slice(0,5).forEach(a=>console.log(' - ID '+a.id+' | port '+a.port))
    }else{
      console.log('No free Pterodactyl allocation found. Do not reuse an assigned allocation.')
    }
    console.log('READ-ONLY CHECK COMPLETE. No servers or allocations changed.')
  }catch(e){
    // Show short error category, never print full response or headers with secrets.
    fail(String(e.message||'Request failed').slice(0,120))
  }
}
await run()
