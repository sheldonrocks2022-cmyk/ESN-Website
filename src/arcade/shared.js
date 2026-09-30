import { useCallback, useEffect, useMemo, useState } from 'react'

const SHARED_KEY='esn_arcade_shared_original_v1'
const ARCADE_PROGRESS_KEY='esn_arcade_progress_v2'
const ARCADE_PROGRESS_EVENT='esn-arcade-progress'

function arcadeXpMultiplier(){
  const day=new Date().getDay()
  return day===0||day===5||day===6?2:1
}

export function loadLocal(key,fallback){
  try {
    const parsed=JSON.parse(localStorage.getItem(key)||'{}')
    if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))return fallback
    const next={...fallback,...parsed}
    if(Array.isArray(fallback?.recent))next.recent=Array.isArray(parsed.recent)?parsed.recent:fallback.recent
    if(fallback?.totals&&typeof fallback.totals==='object')next.totals=parsed.totals&&typeof parsed.totals==='object'&&!Array.isArray(parsed.totals)?{...fallback.totals,...parsed.totals}:fallback.totals
    if(fallback?.achievements&&typeof fallback.achievements==='object')next.achievements=parsed.achievements&&typeof parsed.achievements==='object'&&!Array.isArray(parsed.achievements)?parsed.achievements:fallback.achievements
    return next
  }
  catch { return fallback }
}
export function saveLocal(key,value){ try { localStorage.setItem(key,JSON.stringify(value)) } catch {} }

export function usePersistent(key,fallback){
  const [state,setState]=useState(()=>loadLocal(key,fallback))
  useEffect(()=>saveLocal(key,state),[key,state])
  return [state,setState]
}

export function useSharedCoins(){
  const [wallet,setWallet]=usePersistent(SHARED_KEY,{coins:1000,highest:1000})
  const add=useCallback((amount)=>setWallet(w=>{const coins=Math.max(0,w.coins+amount);return{...w,coins,highest:Math.max(w.highest||0,coins)}}),[setWallet])
  const spend=useCallback((amount)=>{
    if(wallet.coins<amount)return false
    setWallet(w=>({...w,coins:Math.max(0,w.coins-amount)}))
    return true
  },[wallet.coins,setWallet])
  return {wallet,setWallet,add,spend}
}

const defaultProgress={
  xp:0,
  achievements:{},
  totals:{
    clickerTaps:0,
    clickerPrestiges:0,
    factoryMachines:0,
    factoryResearch:0,
    minesSafe:0,
    minesCashouts:0,
    motoFinishes:0,
    motoGolds:0,
    towerFloors:0,
    towerCashouts:0,
    tdWaves:0,
    tdBosses:0,
  },
  recent:[],
}

export function arcadeLevelFromXp(xp){
  return Math.max(1,Math.floor(Math.sqrt(Math.max(0,xp)/220))+1)
}
export function arcadeLevelFloor(level){
  return Math.pow(Math.max(0,level-1),2)*220
}
export function arcadeLevelCeil(level){
  return Math.pow(level,2)*220
}

export function useArcadeProgress(){
  const [progress,setProgress]=useState(()=>loadLocal(ARCADE_PROGRESS_KEY,defaultProgress))

  useEffect(()=>{
    saveLocal(ARCADE_PROGRESS_KEY,progress)
  },[progress])

  useEffect(()=>{
    const sync=e=>{
      if(e.detail)setProgress(e.detail)
      else setProgress(loadLocal(ARCADE_PROGRESS_KEY,defaultProgress))
    }
    window.addEventListener(ARCADE_PROGRESS_EVENT,sync)
    return()=>window.removeEventListener(ARCADE_PROGRESS_EVENT,sync)
  },[])

  const commit=useCallback(updater=>{
    setProgress(current=>{
      const next=typeof updater==='function'?updater(current):updater
      saveLocal(ARCADE_PROGRESS_KEY,next)
      queueMicrotask(()=>window.dispatchEvent(new CustomEvent(ARCADE_PROGRESS_EVENT,{detail:next})))
      return next
    })
  },[])

  const gainXp=useCallback((amount,label='Arcade activity')=>{
    const value=Math.max(0,Math.floor(amount))*arcadeXpMultiplier()
    if(!value)return
    commit(p=>({
      ...p,
      xp:(p.xp||0)+value,
      recent:[{label,xp:value,at:Date.now()},...(p.recent||[])].slice(0,8),
    }))
  },[commit])

  const track=useCallback((stat,amount=1,xp=0,label='')=>{
    commit(p=>({
      ...p,
      xp:(p.xp||0)+Math.max(0,Math.floor(xp))*arcadeXpMultiplier(),
      totals:{...(p.totals||defaultProgress.totals),[stat]:Math.max(0,(p.totals?.[stat]||0)+amount)},
      recent:xp>0?[{label:label||stat,xp:Math.floor(xp)*arcadeXpMultiplier(),at:Date.now()},...(p.recent||[])].slice(0,8):(p.recent||[]),
    }))
  },[commit])

  const unlock=useCallback((id,label,xp=100)=>{
    let unlocked=false
    commit(p=>{
      if(p.achievements?.[id])return p
      unlocked=true
      return {
        ...p,
        xp:(p.xp||0)+xp*arcadeXpMultiplier(),
        achievements:{...(p.achievements||{}),[id]:{label,at:Date.now(),xp:xp*arcadeXpMultiplier()}},
        recent:[{label:'Achievement: '+label,xp:xp*arcadeXpMultiplier(),at:Date.now()},...(p.recent||[])].slice(0,8),
      }
    })
    return unlocked
  },[commit])

  const level=arcadeLevelFromXp(progress.xp||0)
  const floor=arcadeLevelFloor(level)
  const ceil=arcadeLevelCeil(level)
  const levelProgress=Math.max(0,Math.min(1,((progress.xp||0)-floor)/Math.max(1,ceil-floor)))
  const achievementCount=Object.keys(progress.achievements||{}).length

  return useMemo(()=>({
    progress,
    level,
    levelProgress,
    achievementCount,
    gainXp,
    track,
    unlock,
  }),[progress,level,levelProgress,achievementCount,gainXp,track,unlock])
}

export const money=n=>Math.max(0,Math.floor(n)).toLocaleString()


export function arcadeFeedback(type='tap'){
  try{
    const patterns={
      tap:8,
      buy:[8,18,10],
      safe:[10,20,14],
      danger:[34,28,52],
      boost:[12,12,12],
      impact:[24,18,28],
      wave:[14,14,14,14,20],
      win:[18,14,28,14,42],
      power:[16,12,16,12,36],
    }
    if(typeof navigator!=='undefined'&&navigator.vibrate&&matchMedia('(pointer: coarse)').matches){
      navigator.vibrate(patterns[type]||patterns.tap)
    }
    window.dispatchEvent(new CustomEvent('esn-arcade-fx',{detail:{type,at:Date.now()}}))
  }catch{}
}
