const CACHE='esn-pwa-v2'
const CORE=['/offline.html','/esn-mark.svg','/esn-social-card.svg']

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
    event.respondWith(
      fetch(request,{cache:'no-store'})
        .catch(()=>caches.match('/offline.html'))
    )
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
