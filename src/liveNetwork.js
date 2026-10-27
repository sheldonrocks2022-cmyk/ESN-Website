import { useCallback, useEffect, useState } from 'react'

export const SITE_RELEASE='ESN Website • 2026.09.30'
export const SMP_ADDRESS='play.esnoffical.com'
export const SMP_JAVA_PORT='25565'
export const SMP_BEDROCK_PORT='19132'
export const SMP_PORT=SMP_JAVA_PORT
export const DISCORD_INVITE='RGPt3zEfGy'
export const DISCORD_URL='https://discord.gg/RGPt3zEfGy'
export const PLUGIN_REPO='sheldonrocks2022-cmyk/ESNSMP'

// ESN owner-confirmed operational state.
// GitHub Pages cannot directly TCP/UDP ping Minecraft; public status APIs are telemetry only.
export const SMP_ESN_CONFIRMED_LIVE=true

const initial={
  loading:true,
  checkedAt:null,
  website:{status:'online'},
  arcade:{status:'operational',games:6},
  smp:{status:'checking',online:false,players:null,maxPlayers:null,playerSample:[],version:null,software:null,motd:null,uptime:null},
  plugin:{status:'checking',version:null,publishedAt:null,url:null},
  discord:{status:'checking',members:null,onlineMembers:null,url:DISCORD_URL},
}

// Session cache for third-party, rate-limited APIs. A good answer is reused for
// ttlMs; a failure is remembered for failTtlMs so a blocked API isn't hammered.
// Many widgets use this hook at once, so one in-flight request is shared per key.
const inflight=new Map()
function cachedFetch(key,ttlMs,load,fallback,failTtlMs){
  try{
    const hit=JSON.parse(sessionStorage.getItem(key)||'null')
    if(hit&&Date.now()-hit.at<(hit.ok?ttlMs:failTtlMs))return Promise.resolve(hit.value)
  }catch{}
  if(inflight.has(key))return inflight.get(key)
  const run=(async()=>{
    let value=fallback,ok=false
    try{value=await load();ok=true}catch{}
    try{sessionStorage.setItem(key,JSON.stringify({at:Date.now(),ok,value}))}catch{}
    return value
  })().finally(()=>inflight.delete(key))
  inflight.set(key,run)
  return run
}

export function useLiveNetwork(){
  const [data,setData]=useState(initial)

  const refresh=useCallback(async()=>{
    const checkedAt=new Date().toISOString()
    const next={
      ...initial,
      loading:false,
      checkedAt,
      website:{status:navigator.onLine?'online':'connection-lost'},
      arcade:{status:'operational',games:6},
    }

    const fetchJson=async(url,timeoutMs=6500)=>{
      const controller=new AbortController()
      const timer=window.setTimeout(()=>controller.abort(),timeoutMs)
      try{
        const response=await fetch(url,{cache:'no-store',signal:controller.signal})
        if(!response.ok)throw new Error(`Status source failed (${response.status})`)
        return await response.json()
      }finally{
        window.clearTimeout(timer)
      }
    }

    const playerNames=value=>{
      const list=value?.players?.list??value?.players?.sample??[]
      if(!Array.isArray(list))return []
      return list.map(player=>typeof player==='string'?player:(player?.name_clean??player?.name_raw??player?.name??null)).filter(Boolean).slice(0,12)
    }

    const statusSources=[
      {
        name:'mcstatus-java',
        run:async()=>{
          const value=await fetchJson(`https://api.mcstatus.io/v2/status/java/${SMP_ADDRESS}:${SMP_JAVA_PORT}?query=true&timeout=5`)
          return {
            source:'mcstatus-java',
            confirmed:true,
            online:Boolean(value.online),
            players:value.players?.online??null,
            maxPlayers:value.players?.max??null,
            playerSample:playerNames(value),
            version:value.version?.name_clean??value.version?.name_raw??null,
            software:value.software??null,
            motd:value.motd?.clean??null,
          }
        },
      },
      {
        name:'mcstatus-bedrock',
        run:async()=>{
          const value=await fetchJson(`https://api.mcstatus.io/v2/status/bedrock/${SMP_ADDRESS}:${SMP_BEDROCK_PORT}?timeout=5`)
          return {
            source:'mcstatus-bedrock',
            confirmed:true,
            online:Boolean(value.online),
            players:value.players?.online??null,
            maxPlayers:value.players?.max??null,
            playerSample:playerNames(value),
            version:value.version?.name_clean??value.version?.name_raw??null,
            software:value.software??null,
            motd:value.motd?.clean??null,
          }
        },
      },
      {
        name:'mcsrvstat',
        run:async()=>{
          const value=await fetchJson(`https://api.mcsrvstat.us/3/${SMP_ADDRESS}:${SMP_JAVA_PORT}`)
          return {
            source:'mcsrvstat',
            confirmed:true,
            online:Boolean(value.online),
            players:value.players?.online??null,
            maxPlayers:value.players?.max??null,
            playerSample:playerNames(value),
            version:value.version??null,
            software:value.software??null,
            motd:Array.isArray(value.motd?.clean)?value.motd.clean.join(' '):(value.motd?.clean??null),
          }
        },
      },
    ]

    const smpPromise=Promise.allSettled(statusSources.map(source=>source.run())).then(results=>{
      const responses=results
        .filter(result=>result.status==='fulfilled')
        .map(result=>result.value)

      const onlineResponses=responses.filter(result=>result.online)
      const offlineResponses=responses.filter(result=>!result.online)

      if(onlineResponses.length){
        const best=onlineResponses
          .slice()
          .sort((a,b)=>{
            const score=value=>Number(value.players!=null)+Number(value.maxPlayers!=null)+Number((value.playerSample||[]).length>0)+Number(Boolean(value.version))+Number(Boolean(value.software))
            return score(b)-score(a)
          })[0]

        return {
          status:'online',
          online:true,
          players:best.players,
          maxPlayers:best.maxPlayers,
          playerSample:best.playerSample||[],
          version:best.version,
          software:best.software,
          motd:best.motd,
          uptime:null,
          source:best.source,
          sourceCount:responses.length,
          telemetry:'live',
          operationalSource:'public-ping',
        }
      }

      // Third-party Minecraft ping providers can false-negative this custom ESN setup.
      // ESN's owner-confirmed operational state takes priority over telemetry disagreement.
      if(offlineResponses.length>=2){
        const best=offlineResponses[0]
        if(SMP_ESN_CONFIRMED_LIVE){
          return {
            status:'online',
            online:true,
            players:null,
            maxPlayers:null,
            playerSample:[],
            version:null,
            software:null,
            motd:null,
            uptime:null,
            source:'esn-confirmed',
            sourceCount:responses.length,
            telemetry:'unavailable',
            operationalSource:'esn-owner-confirmed',
            telemetryConflict:true,
          }
        }
        return {
          status:'offline',
          online:false,
          players:best.players,
          maxPlayers:best.maxPlayers,
          playerSample:best.playerSample||[],
          version:best.version,
          software:best.software,
          motd:best.motd,
          uptime:null,
          source:'multiple-confirmed',
          sourceCount:responses.length,
          telemetry:'confirmed-offline',
          operationalSource:'public-ping',
        }
      }

      if(SMP_ESN_CONFIRMED_LIVE){
        return {
          status:'online',
          online:true,
          players:null,
          maxPlayers:null,
          version:null,
          software:null,
          motd:null,
          uptime:null,
          source:'esn-confirmed',
          sourceCount:responses.length,
          telemetry:'unavailable',
          operationalSource:'esn-owner-confirmed',
          telemetryConflict:false,
        }
      }

      return {
        status:'unavailable',
        online:null,
        players:null,
        maxPlayers:null,
        playerSample:[],
        version:null,
        software:null,
        motd:null,
        uptime:null,
        source:responses[0]?.source??null,
        sourceCount:responses.length,
        telemetry:'unavailable',
        operationalSource:'unknown',
      }
    })

    // GitHub (60 requests/hour per visitor) and Discord rate-limit unauthenticated
    // calls, so their answers are cached per tab instead of re-fetched every minute.
    const pluginPromise=cachedFetch('esn_plugin_release_v1',30*60*1000,()=>fetch(`https://api.github.com/repos/${PLUGIN_REPO}/releases/latest`,{
      headers:{Accept:'application/vnd.github+json'},
    }).then(async response=>{
      if(!response.ok)throw new Error('Plugin release unavailable')
      const value=await response.json()
      return {
        status:'available',
        version:value.tag_name||value.name||null,
        publishedAt:value.published_at||null,
        url:value.html_url||null,
      }
    }),{status:'unavailable',version:null,publishedAt:null,url:null},10*60*1000)

    const discordPromise=cachedFetch('esn_discord_invite_v1',5*60*1000,()=>fetch(`https://discord.com/api/v10/invites/${DISCORD_INVITE}?with_counts=true&with_expiration=true`)
      .then(async response=>{
        if(!response.ok)throw new Error('Discord invite API unavailable')
        const value=await response.json()
        return {
          status:'available',
          members:value.approximate_member_count??null,
          onlineMembers:value.approximate_presence_count??null,
          url:DISCORD_URL,
        }
      }),{status:'configured',members:null,onlineMembers:null,url:DISCORD_URL},2*60*1000)

    const [smp,plugin,discord]=await Promise.all([smpPromise,pluginPromise,discordPromise])
    setData({...next,smp,plugin,discord})
  },[])

  useEffect(()=>{
    let timer
    let active=true
    const run=()=>{if(active&&document.visibilityState==='visible')refresh()}
    run()
    timer=window.setInterval(run,60000)
    const visibility=()=>{if(document.visibilityState==='visible')run()}
    document.addEventListener('visibilitychange',visibility)
    return()=>{active=false;window.clearInterval(timer);document.removeEventListener('visibilitychange',visibility)}
  },[refresh])

  return {...data,refresh}
}
