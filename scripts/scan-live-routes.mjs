import fs from 'node:fs'
import path from 'node:path'
import { SEO_ROUTES } from '../src/seo.js'

const BASE_URL='https://esnoffical.com'
const routes=new Set(Object.keys(SEO_ROUTES))

// Include every currently published ESN Builder site and its generated subpages.
const manifestPath=path.join('public','generated-sites','index.json')
if(fs.existsSync(manifestPath)){
  try{
    const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'))
    for(const site of manifest.sites||[]){
      if(!site?.slug)continue
      routes.add('/sites/'+site.slug)
      const sitePath=path.join('public','generated-sites',site.slug+'.json')
      if(!fs.existsSync(sitePath))continue
      try{
        const data=JSON.parse(fs.readFileSync(sitePath,'utf8'))
        for(const page of data.pages||[]){
          if(page?.slug)routes.add('/sites/'+site.slug+'/'+page.slug)
        }
      }catch(error){
        console.warn('Could not parse published site data:',site.slug,error.message)
      }
    }
  }catch(error){
    console.warn('Could not parse generated-sites manifest:',error.message)
  }
}

const targets=[...routes].sort()
const failures=[]
const results=[]

async function check(route){
  const url=BASE_URL+(route==='/'?'/':route)
  try{
    const response=await fetch(url,{redirect:'follow',headers:{'user-agent':'ESN-Live-Route-Scan/1.0','cache-control':'no-cache'}})
    const contentType=response.headers.get('content-type')||''
    let body=''
    if(contentType.includes('text/html'))body=await response.text()
    const badBody=/That page isn't here\.|Page Not Found \| ES Network/i.test(body)
    const ok=response.ok&&!badBody
    results.push({route,status:response.status,finalUrl:response.url,ok})
    if(!ok)failures.push({route,status:response.status,finalUrl:response.url,badBody})
  }catch(error){
    failures.push({route,status:'FETCH_ERROR',error:error.message})
  }
}

const workers=Math.min(8,targets.length)
let cursor=0
await Promise.all(Array.from({length:workers},async()=>{
  while(true){
    const index=cursor++
    if(index>=targets.length)break
    await check(targets[index])
  }
}))

results.sort((a,b)=>a.route.localeCompare(b.route))
for(const item of results){
  console.log(`${item.ok?'PASS':'FAIL'} ${String(item.status).padEnd(3)} ${item.route}${item.finalUrl&&item.finalUrl!==BASE_URL+item.route?' -> '+item.finalUrl:''}`)
}

if(failures.length){
  console.error('\nBroken live ESN routes:')
  for(const failure of failures)console.error('-',JSON.stringify(failure))
  process.exit(1)
}

console.log(`\nLive route scan passed for ${targets.length} deployed routes.`)
