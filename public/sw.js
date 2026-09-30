const CACHE='esn-pwa-v4'
const CORE=['/','/offline.html','/esn-mark.svg','/esn-social-card.svg']

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(CORE))
      .then(()=>self.skipWaiting())
  )
})

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
      .then(()=>self.clients.matchAll({type:'window',includeUncontrolled:true}))
      .then(clients=>clients.forEach(client=>client.postMessage({type:'ESN_SW_UPDATED'})))
  )
})

self.addEventListener('fetch',event=>{
  const request=event.request
  if(request.method!=='GET')return
  const url=new URL(request.url)
  if(url.origin!==self.location.origin)return

  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const response=await fetch(request,{cache:'no-store'})
        // GitHub Pages returns a 404 document for client-side/dynamic routes.
        // Serve the app shell instead so BrowserRouter can render the requested URL.
        if(response.status===404){
          const shell=await fetch('/',{cache:'no-store'})
          if(shell.ok)return shell
        }
        return response
      }catch{
        const shell=await caches.match('/')
        return shell||caches.match('/offline.html')
      }
    })())
    return
  }

  // Never let stale JS/CSS keep an old ESN build alive.
  if(url.pathname.startsWith('/assets/')||url.pathname.endsWith('.js')||url.pathname.endsWith('.css')){
    event.respondWith(fetch(request,{cache:'no-store'}))
    return
  }

  if(url.pathname.endsWith('.svg')){
    event.respondWith(
      fetch(request,{cache:'no-store'})
        .then(response=>{
          if(response.ok)caches.open(CACHE).then(cache=>cache.put(request,response.clone()))
          return response
        })
        .catch(()=>caches.match(request))
    )
  }
})
