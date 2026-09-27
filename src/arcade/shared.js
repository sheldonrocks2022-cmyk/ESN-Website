import { useCallback, useEffect, useState } from 'react'

const SHARED_KEY='esn_arcade_shared_original_v1'

export function loadLocal(key,fallback){
  try { return {...fallback,...JSON.parse(localStorage.getItem(key)||'{}')} }
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
    let ok=false
    setWallet(w=>{if(w.coins<amount)return w;ok=true;return{...w,coins:w.coins-amount}})
    return ok
  },[setWallet])
  return {wallet,setWallet,add,spend}
}

export const money=n=>Math.max(0,Math.floor(n)).toLocaleString()
