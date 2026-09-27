import { useCallback, useEffect, useState } from 'react'

export const SITE_RELEASE='ESN Live Experience 2026.09.27'
export const SMP_ADDRESS='esn.ggwp.cc'
export const SMP_PORT='17058'
export const DISCORD_INVITE='3gxA66KZ8'
export const DISCORD_URL='https://discord.gg/3gxA66KZ8'
export const PLUGIN_REPO='sheldonrocks2022-cmyk/ESNSMP'

const initial={
  loading:true,
  checkedAt:null,
  website:{status:'online'},
  arcade:{status:'operational',games:6},
  smp:{status:'checking',online:false,players:null,maxPlayers:null,version:null,software:null,motd:null,uptime:null},
  plugin:{status:'checking',version:null,publishedAt:null,url:null},
  discord:{status:'checking',members:null,onlineMembers:null,url:DISCORD_URL},
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

    const statusSources=[
      {
        name:'mcstatus-java',
        run:async()=>{
          const value=await fetchJson(`https://api.mcstatus.io/v2/status/java/${SMP_ADDRESS}:${SMP_PORT}?query=true&timeout=5`)
          return {
            source:'mcstatus-java',
            confirmed:true,
            online:Boolean(value.online),
            players:value.players?.online??null,
            maxPlayers:value.players?.max??null,
            version:value.version?.name_clean??value.version?.name_raw??null,
            software:value.software??null,
            motd:value.motd?.clean??null,
          }
        },
      },
      {
        name:'mcstatus-bedrock',
        run:async()=>{
          const value=await fetchJson(`https://api.mcstatus.io/v2/status/bedrock/${SMP_ADDRESS}:${SMP_PORT}?timeout=5`)
          return {
            source:'mcstatus-bedrock',
            confirmed:true,
            online:Boolean(value.online),
            players:value.players?.online??null,
            maxPlayers:value.players?.max??null,
            version:value.version?.name_clean??value.version?.name_raw??null,
            software:value.software??null,
            motd:value.motd?.clean??null,
          }
        },
      },
      {
        name:'mcsrvstat',
        run:async()=>{
          const value=await fetchJson(`https://api.mcsrvstat.us/3/${SMP_ADDRESS}:${SMP_PORT}`)
          return {
            source:'mcsrvstat',
            confirmed:true,
            online:Boolean(value.online),
            players:value.players?.online??null,
            maxPlayers:value.players?.max??null,
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
            const score=value=>Number(value.players!=null)+Number(value.maxPlayers!=null)+Number(Boolean(value.version))+Number(Boolean(value.software))
            return score(b)-score(a)
          })[0]

        return {
          status:'online',
          online:true,
          players:best.players,
          maxPlayers:best.maxPlayers,
          version:best.version,
          software:best.software,
          motd:best.motd,
          uptime:null,
          source:best.source,
          sourceCount:responses.length,
        }
      }

      // Avoid false OFFLINE states from one flaky or protocol-mismatched ping.
      // Require at least two independent sources to explicitly respond offline.
      if(offlineResponses.length>=2){
        const best=offlineResponses[0]
        return {
          status:'offline',
          online:false,
          players:best.players,
          maxPlayers:best.maxPlayers,
          version:best.version,
          software:best.software,
          motd:best.motd,
          uptime:null,
          source:'multiple-confirmed',
          sourceCount:responses.length,
        }
      }

      return {
        status:'unavailable',
        online:null,
        players:null,
        maxPlayers:null,
        version:null,
        software:null,
        motd:null,
        uptime:null,
        source:responses[0]?.source??null,
        sourceCount:responses.length,
      }
    })

    const pluginPromise=fetch(`https://api.github.com/repos/${PLUGIN_REPO}/releases/latest`,{
      headers:{Accept:'application/vnd.github+json'},
      cache:'no-store',
    }).then(async response=>{
      if(!response.ok)throw new Error('Plugin release unavailable')
      const value=await response.json()
      return {
        status:'available',
        version:value.tag_name||value.name||null,
        publishedAt:value.published_at||null,
        url:value.html_url||null,
      }
    }).catch(()=>({status:'unavailable',version:null,publishedAt:null,url:null}))

    const discordPromise=fetch(`https://discord.com/api/v10/invites/${DISCORD_INVITE}?with_counts=true&with_expiration=true`,{cache:'no-store'})
      .then(async response=>{
        if(!response.ok)throw new Error('Discord invite API unavailable')
        const value=await response.json()
        return {
          status:'available',
          members:value.approximate_member_count??null,
          onlineMembers:value.approximate_presence_count??null,
          url:DISCORD_URL,
        }
      })
      .catch(()=>({status:'configured',members:null,onlineMembers:null,url:DISCORD_URL}))

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
