import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
import { SEO_ROUTES } from '../src/seo.js'

const BASE_URL='https://esnoffical.com'
const routes=new Set(Object.keys(SEO_ROUTES))

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
const browser=await chromium.launch({headless:true})

async function inspect(route,viewport,label){
  const url=BASE_URL+(route==='/'?'/':route)
  const context=await browser.newContext({viewport})
  const page=await context.newPage()
  const pageErrors=[]
  page.on('pageerror',error=>pageErrors.push(error.message))
  try{
    const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000})
    await page.waitForTimeout(900)
    const state=await page.evaluate(()=>{
      const root=document.querySelector('#root')
      const main=document.querySelector('main')
      const body=document.body
      const rootText=(root?.innerText||'').replace(/\s+/g,' ').trim()
      const mainText=(main?.innerText||'').replace(/\s+/g,' ').trim()
      const rootRect=root?.getBoundingClientRect()
      const mainRect=main?.getBoundingClientRect()
      const style=main?getComputedStyle(main):null
      return {
        title:document.title,
        rootTextLength:rootText.length,
        mainTextLength:mainText.length,
        rootHeight:rootRect?.height||0,
        mainHeight:mainRect?.height||0,
        mainDisplay:style?.display||'',
        mainVisibility:style?.visibility||'',
        bodyTextLength:(body?.innerText||'').replace(/\s+/g,' ').trim().length,
        notFound:/That page isn't here\.|Page Not Found \| ES Network/i.test(document.documentElement.innerText||document.title),
      }
    })
    const status=response?.status()||0
    const blank=state.rootTextLength<20||state.rootHeight<40||state.mainDisplay==='none'||state.mainVisibility==='hidden'
    const fatal=pageErrors.length>0
    const ok=status>=200&&status<400&&!state.notFound&&!blank&&!fatal
    const result={route,label,status,ok,blank,pageErrors,state}
    results.push(result)
    if(!ok)failures.push(result)
  }catch(error){
    const result={route,label,status:'BROWSER_ERROR',ok:false,blank:true,pageErrors,error:error.message}
    results.push(result)
    failures.push(result)
  }finally{
    await context.close()
  }
}

let cursor=0
const workers=Math.min(6,targets.length)
await Promise.all(Array.from({length:workers},async()=>{
  while(true){
    const index=cursor++
    if(index>=targets.length)break
    const route=targets[index]
    await inspect(route,{width:1365,height:900},'desktop')
    await inspect(route,{width:390,height:844},'mobile')
  }
}))


async function inspectInternalMobile(route){
  const context=await browser.newContext({
    viewport:{width:412,height:915},
    isMobile:true,
    hasTouch:true,
    userAgent:'Mozilla/5.0 (Linux; Android 16; Pixel 8a) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36'
  })
  const page=await context.newPage()
  const pageErrors=[]
  page.on('pageerror',error=>pageErrors.push(error.message))
  try{
    await page.goto(BASE_URL+'/',{waitUntil:'domcontentloaded',timeout:30000})
    await page.waitForTimeout(2400)
    await page.evaluate(target=>{
      history.pushState({},'',target)
      window.dispatchEvent(new PopStateEvent('popstate'))
    },route)
    await page.waitForTimeout(5400)
    const state=await page.evaluate(()=>{
      const root=document.querySelector('#root')
      const main=document.querySelector('main')
      const transition=document.querySelector('.route-transition')
      const rootText=(root?.innerText||'').replace(/\s+/g,' ').trim()
      const mainText=(main?.innerText||'').replace(/\s+/g,' ').trim()
      const rootRect=root?.getBoundingClientRect()
      const mainRect=main?.getBoundingClientRect()
      const mainStyle=main?getComputedStyle(main):null
      const center=document.elementFromPoint(Math.floor(innerWidth/2),Math.floor(innerHeight/2))
      return {
        path:location.pathname,
        rootTextLength:rootText.length,
        mainTextLength:mainText.length,
        rootHeight:rootRect?.height||0,
        mainHeight:mainRect?.height||0,
        mainDisplay:mainStyle?.display||'',
        mainVisibility:mainStyle?.visibility||'',
        transitionPresent:Boolean(transition),
        transitionLocked:document.documentElement.classList.contains('route-transition-locked'),
        centerTag:center?.tagName||'',
        centerClass:center?.className||'',
      }
    })
    const blank=state.rootTextLength<20||state.rootHeight<40||state.mainDisplay==='none'||state.mainVisibility==='hidden'
    const stuck=state.transitionPresent||state.transitionLocked
    const ok=!blank&&!stuck&&pageErrors.length===0&&state.path===route
    const result={route,label:'mobile-nav',status:200,ok,blank,stuck,pageErrors,state}
    results.push(result)
    if(!ok)failures.push(result)
  }catch(error){
    const result={route,label:'mobile-nav',status:'BROWSER_ERROR',ok:false,blank:true,stuck:false,pageErrors,error:error.message}
    results.push(result);failures.push(result)
  }finally{await context.close()}
}

let navCursor=0
const navWorkers=Math.min(8,targets.length)
await Promise.all(Array.from({length:navWorkers},async()=>{
  while(true){
    const index=navCursor++
    if(index>=targets.length)break
    await inspectInternalMobile(targets[index])
  }
}))

await browser.close()

fs.writeFileSync('route-scan-results.json',JSON.stringify({generatedAt:new Date().toISOString(),targetCount:targets.length,failures,results},null,2))

for(const item of results){
  const note=item.pageErrors?.length?' pageerror='+item.pageErrors.join(' | '):''
  console.log(`${item.ok?'PASS':'FAIL'} ${String(item.status).padEnd(3)} ${item.label.padEnd(7)} ${item.route}${item.blank?' BLANK':''}${note}`)
}

if(failures.length){
  console.error('\nBroken rendered ESN routes:')
  for(const failure of failures)console.error('-',JSON.stringify(failure))
  process.exit(1)
}

console.log(`\nRendered route scan passed for ${targets.length} deployed routes on desktop and mobile.`)
