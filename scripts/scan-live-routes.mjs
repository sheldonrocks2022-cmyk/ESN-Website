import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
import { SEO_ROUTES } from '../src/seo.js'
import { NETWORK_TAKEOVER } from '../src/networkEvolutionConfig.js'

const BASE_URL='https://esnoffical.com'
const ROUTE_ALIASES={
  '/domains':'/hosting',
  '/store':'/storesmp',
  '/store/smp':'/storesmp',
  '/storeai':'/store-ai',
  '/tools':'/estools',
}
const expectedPath=route=>ROUTE_ALIASES[route]||route
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
    let response=null
    for(let attempt=1;attempt<=3;attempt+=1){
      response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000})
      const status=response?.status()||0
      if(status<500||attempt===3)break
      await page.waitForTimeout(500*attempt)
    }
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
        appMounted:Boolean(document.querySelector('#root .site main#main-content')),
        rootTextLength:rootText.length,
        mainTextLength:mainText.length,
        rootHeight:rootRect?.height||0,
        mainHeight:mainRect?.height||0,
        mainDisplay:style?.display||'',
        mainVisibility:style?.visibility||'',
        bodyTextLength:(body?.innerText||'').replace(/\s+/g,' ').trim().length,
        notFound:/That page isn't here\.|Page Not Found \| ESN Systems/i.test(document.documentElement.innerText||document.title),
        builder:location.pathname==='/site-builder'?(()=>{
          const hero=document.querySelector('.builder-hero')
          const section=document.querySelector('.builder-hero + .section')
          const layout=document.querySelector('.builder-layout')
          const controls=document.querySelector('.builder-controls')
          const panel=document.querySelector('.builder-controls .builder-panel')
          const preview=document.querySelector('.builder-preview-column')
          const info=node=>{
            if(!node)return null
            const r=node.getBoundingClientRect()
            const s=getComputedStyle(node)
            return {top:r.top,bottom:r.bottom,height:r.height,width:r.width,display:s.display,visibility:s.visibility,opacity:s.opacity,position:s.position}
          }
          return {scrollY,innerHeight,hero:info(hero),section:info(section),layout:info(layout),controls:info(controls),panel:info(panel),preview:info(preview)}
        })():null,
      }
    })
    const status=response?.status()||0
    const blank=!state.appMounted||state.rootTextLength<20||state.mainTextLength<20||state.rootHeight<40||state.mainDisplay==='none'||state.mainVisibility==='hidden'
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
const workers=Math.min(4,targets.length)
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
        appMounted:Boolean(document.querySelector('#root .site main#main-content')),
        rootTextLength:rootText.length,
        mainTextLength:mainText.length,
        rootHeight:rootRect?.height||0,
        mainHeight:mainRect?.height||0,
        mainDisplay:mainStyle?.display||'',
        mainVisibility:mainStyle?.visibility||'',
        transitionPresent:Boolean(transition),
        transitionPointerEvents:transition?getComputedStyle(transition).pointerEvents:'',
        transitionLocked:document.documentElement.classList.contains('route-transition-locked'),
        centerTag:center?.tagName||'',
        centerClass:center?.className||'',
      }
    })
    const blank=!state.appMounted||state.rootTextLength<20||state.mainTextLength<20||state.rootHeight<40||state.mainDisplay==='none'||state.mainVisibility==='hidden'
    const stuck=state.transitionLocked||(state.transitionPresent&&state.transitionPointerEvents!=='none')
    const expected=expectedPath(route)
    const ok=!blank&&!stuck&&pageErrors.length===0&&state.path===expected
    const result={route,expectedPath:expected,label:'mobile-nav',status:200,ok,blank,stuck,pageErrors,state}
    results.push(result)
    if(!ok)failures.push(result)
  }catch(error){
    const result={route,label:'mobile-nav',status:'BROWSER_ERROR',ok:false,blank:true,stuck:false,pageErrors,error:error.message}
    results.push(result);failures.push(result)
  }finally{await context.close()}
}

let navCursor=0
const navWorkers=Math.min(6,targets.length)
await Promise.all(Array.from({length:navWorkers},async()=>{
  while(true){
    const index=navCursor++
    if(index>=targets.length)break
    await inspectInternalMobile(targets[index])
  }
}))

async function inspectCoreOverlays(){
  const context=await browser.newContext({
    viewport:{width:412,height:915},
    isMobile:true,
    hasTouch:true,
    userAgent:'Mozilla/5.0 (Linux; Android 16; Pixel 8a) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36'
  })
  await context.addInitScript(takeoverId=>{
    try{localStorage.setItem('esn_takeover_seen',takeoverId)}catch{}
  },NETWORK_TAKEOVER.id)
  const page=await context.newPage()
  const pageErrors=[]
  page.on('pageerror',error=>pageErrors.push(error.message))
  try{
    await page.goto(BASE_URL+'/',{waitUntil:'domcontentloaded',timeout:30000})
    // Wait for the real mobile controls. The one-time Network Takeover is pre-acknowledged
    // in this smoke test so it cannot intentionally cover the controls being tested.
    // Modern ESN calm-theme intentionally hides its legacy mobile command strip.
    // When those controls are hidden, exercise the real mobile header instead.
    const legacyControlsVisible=await page.locator('.mobile-network-strip-actions').isVisible()
    if(!legacyControlsVisible){
      await page.waitForSelector('#main-content h1',{state:'visible',timeout:10000})
      const toggle=page.locator('.site-header .menu-toggle')
      await toggle.click({timeout:5000})
      await page.waitForSelector('.site-header .nav.open',{state:'visible',timeout:5000})
      const linkVisible=await page.locator('.site-header .nav.open a.nav-direct').first().isVisible()
      const result={route:'/',label:'mobile-menu-smoke',status:200,ok:linkVisible&&pageErrors.length===0,blank:false,stuck:false,pageErrors:[...pageErrors],state:{menuOpened:true,linkVisible}}
      results.push(result)
      if(!result.ok)failures.push(result)
      return
    }
    await page.waitForSelector('.mobile-bottom-nav',{state:'visible',timeout:8000})

    // Test the actual mobile controls instead of only dispatching synthetic events.
    let terminalTap=false
    let terminalRun=false
    let terminalError=''
    try{
      const terminalButton=page.locator('.mobile-network-strip-actions button').filter({hasText:'Terminal'}).first()
      await terminalButton.click({timeout:5000})
      await page.waitForSelector('.ev-terminal-modal',{state:'visible',timeout:4000})
      terminalTap=true
      const input=page.locator('.ev-terminal-input input')
      await input.fill('help')
      await page.locator('.ev-terminal-input button[type="submit"]').click()
      await page.waitForFunction(()=>[...document.querySelectorAll('.ev-terminal-output div')].some(node=>node.textContent?.includes('> help')),{timeout:4000})
      terminalRun=true
    }catch(error){terminalError=error.message}
    {
      const result={route:'/',label:'tap-terminal',status:200,ok:terminalTap&&terminalRun&&pageErrors.length===0,blank:false,stuck:false,pageErrors:[...pageErrors],state:{terminalTap,terminalRun,terminalError}}
      results.push(result)
      if(!result.ok)failures.push(result)
    }
    await page.keyboard.press('Escape').catch(()=>{})
    await page.waitForTimeout(180)

    let commandCenterTap=false
    let terminalFromMore=false
    let moreTerminalError=''
    try{
      const more=page.locator('.mobile-bottom-nav button').filter({hasText:'More'}).first()
      await more.click({timeout:5000})
      await page.waitForSelector('.premium-command.open',{state:'visible',timeout:5000})
      commandCenterTap=true
      const terminalUtility=page.locator('.premium-command.open .mobile-network-utilities button').filter({hasText:'Terminal'}).first()
      await terminalUtility.click({timeout:5000})
      await page.waitForSelector('.ev-terminal-modal',{state:'visible',timeout:5000})
      terminalFromMore=true
    }catch(error){moreTerminalError=error.message}
    {
      const result={route:'/',label:'tap-more-terminal',status:200,ok:commandCenterTap&&terminalFromMore&&pageErrors.length===0,blank:false,stuck:false,pageErrors:[...pageErrors],state:{commandCenterTap,terminalFromMore,moreTerminalError}}
      results.push(result)
      if(!result.ok)failures.push(result)
    }
    await page.keyboard.press('Escape').catch(()=>{})
    await page.waitForTimeout(180)

    const checks=[
      ['notifications','esn-open-notifications','.notification-panel.open'],
    ]

    for(const [name,eventName,selector] of checks){
      await page.evaluate(eventName=>window.dispatchEvent(new Event(eventName)),eventName)
      let visible=false
      try{
        await page.waitForSelector(selector,{state:'visible',timeout:4000})
        visible=true
      }catch{}
      const result={route:'/',label:'interaction-'+name,status:200,ok:visible&&pageErrors.length===0,blank:false,stuck:false,pageErrors:[...pageErrors],state:{selector,visible}}
      results.push(result)
      if(!result.ok)failures.push(result)
      await page.keyboard.press('Escape').catch(()=>{})
      await page.waitForTimeout(120)
    }
  }catch(error){
    const result={route:'/',label:'interaction-smoke',status:'BROWSER_ERROR',ok:false,blank:false,stuck:false,pageErrors,error:error.message}
    results.push(result);failures.push(result)
  }finally{
    await context.close()
  }
}

await inspectCoreOverlays()

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
