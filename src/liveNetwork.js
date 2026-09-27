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

    const smpPromise=fetch(`https://api.mcstatus.io/v2/status/java/${SMP_ADDRESS}:${SMP_PORT}?query=true&timeout=5`,{cache:'no-store'})
      .then(async response=>{
        if(!response.ok)throw new Error('SMP status unavailable')
        const value=await response.json()
        return {
          status:value.online?'online':'offline',
          online:Boolean(value.online),
          players:value.players?.online??null,
          maxPlayers:value.players?.max??null,
          version:value.version?.name_clean??null,
          software:value.software??null,
          motd:value.motd?.clean??null,
          uptime:null,
        }
      })
      .catch(()=>({status:'unavailable',online:false,players:null,maxPlayers:null,version:null,software:null,motd:null,uptime:null}))

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
