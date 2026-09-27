const CACHE='esn-pwa-v1'
const CORE=['/','/offline.html','/esn-mark.svg','/esn-social-card.svg']

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()))
})

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  )
})

self.addEventListener('fetch',event=>{
  const request=event.request
  if(request.method!=='GET')return
  const url=new URL(request.url)
  if(url.origin!==self.location.origin)return

  if(request.mode==='navigate'){
    event.respondWith(
      fetch(request)
        .then(response=>response)
        .catch(()=>caches.match('/offline.html').then(match=>match||caches.match('/')))
    )
    return
  }

  if(url.pathname.startsWith('/assets/')||url.pathname.endsWith('.svg')){
    event.respondWith(
      caches.match(request).then(cached=>{
        const fresh=fetch(request).then(response=>{
          if(response.ok)caches.open(CACHE).then(cache=>cache.put(request,response.clone()))
          return response
        }).catch(()=>cached)
        return cached||fresh
      })
    )
  }
})
