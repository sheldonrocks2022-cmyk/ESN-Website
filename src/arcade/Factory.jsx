import { useEffect, useMemo, useState } from 'react'
import GameFrame from './GameFrame'
import { readGame, saveGame, useArcadeProfile } from './profile'

const KEY='esn_factory_v2'
const MACHINES=[
  ['extractor','Void Extractor',100,4],
  ['forge','Neon Forge',450,18],
  ['reactor','Storm Reactor',2500,110],
  ['nexus','Celestial Nexus',15000,800],
]

export default function FactoryGame(){
  const {profile,earn,spend}=useArcadeProfile()
  const [g,setG]=useState(()=>readGame(KEY,{machines:{},mult:1,level:0}))
  const rate=useMemo(()=>MACHINES.reduce((s,m)=>s+(g.machines[m[0]]||0)*m[3],0)*g.mult,[g])
  useEffect(()=>saveGame(KEY,g),[g])
  useEffect(()=>{
    if(!rate)return
    const t=setInterval(()=>earn(rate,Math.max(1,Math.floor(rate/25))),1000)
    return()=>clearInterval(t)
  },[rate])
  const buy=(m)=>{
    const n=g.machines[m[0]]||0
    const cost=Math.floor(m[2]*Math.pow(1.32,n))
    if(spend(cost))setG(x=>({...x,machines:{...x.machines,[m[0]]:n+1}}))
  }
  const upCost=1000*Math.pow(g.level+1,2)
  const upgrade=()=>{if(spend(upCost))setG(x=>({...x,mult:+(x.mult+.25).toFixed(2),level:x.level+1}))}
  return <GameFrame title="ES Factory: Neon Grid" text="Build a persistent production network that feeds your shared ES Coin wallet." profile={profile}>
    <div className="factory-head"><div><span>Production</span><strong>{Math.floor(rate).toLocaleString()} ES/sec</strong></div><div><span>Grid multiplier</span><strong>x{g.mult}</strong></div></div>
    <div className="machine-grid">{MACHINES.map(m=>{const n=g.machines[m[0]]||0,cost=Math.floor(m[2]*Math.pow(1.32,n));return <button key={m[0]} className="machine-card" onClick={()=>buy(m)} disabled={profile.coins<cost}><b>{m[1]}</b><small>{m[3]} ES/sec each</small><span>Owned: {n}</span><strong>{cost.toLocaleString()} ES</strong></button>})}</div>
    <button className="button primary factory-upgrade" onClick={upgrade} disabled={profile.coins<upCost}>Upgrade grid +25% — {upCost.toLocaleString()} ES</button>
  </GameFrame>
}
