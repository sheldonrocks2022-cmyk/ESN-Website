import { useEffect, useState } from 'react'
import GameFrame from './GameFrame'
import { useArcadeProfile } from './profile'

export default function TowerDefenseGame(){
  const {profile,earn}=useArcadeProfile()
  const [g,setG]=useState({run:false,wave:0,energy:100,base:10,turrets:[0,0,0],enemies:[]})
  useEffect(()=>{
    if(!g.run)return
    const t=setInterval(()=>setG(s=>{
      let enemies=s.enemies.map(e=>({...e,pos:e.pos+1.6}))
      enemies=enemies.map(e=>s.turrets[e.lane]&&e.pos>25&&e.pos<90?{...e,hp:e.hp-s.turrets[e.lane]*1.4}:e)
      const killed=enemies.filter(e=>e.hp<=0).length
      if(killed)earn(killed*8,killed)
      const reached=enemies.filter(e=>e.pos>=100&&e.hp>0).length
      enemies=enemies.filter(e=>e.hp>0&&e.pos<100)
      const base=s.base-reached
      return{...s,run:base>0,base:Math.max(0,base),energy:Math.min(150,s.energy+2),enemies}
    }),160)
    return()=>clearInterval(t)
  },[g.run])
  const wave=()=>setG(s=>{
    if(s.base<=0)return{run:true,wave:1,energy:100,base:10,turrets:[0,0,0],enemies:Array.from({length:5},(_,i)=>({lane:i%3,pos:-i*12,hp:20}))}
    const n=s.wave+1
    return{...s,run:true,wave:n,enemies:[...s.enemies,...Array.from({length:4+n},(_,i)=>({lane:(i+n)%3,pos:-i*10,hp:18+n*4}))]}
  })
  const turret=lane=>setG(s=>{
    const cost=35+s.turrets[lane]*25
    if(s.energy<cost)return s
    const t=[...s.turrets];t[lane]+=1
    return{...s,energy:s.energy-cost,turrets:t}
  })
  return <GameFrame title="ES Tower Defense: Rift Siege" text="Defend three lanes, upgrade turrets, and survive escalating waves." profile={profile}>
    <div className="td-head"><span>Wave <b>{g.wave}</b></span><span>Base <b>{g.base}/10</b></span><span>Energy <b>{Math.floor(g.energy)}</b></span><button className="button primary" onClick={wave}>{g.wave===0||g.base===0?'Start defense':'Send next wave'}</button></div>
    <div className="td-board">{[0,1,2].map(l=><div className="td-lane" key={l}><button className="turret-slot" onClick={()=>turret(l)}>⚡ Lv.{g.turrets[l]}</button>{g.enemies.filter(e=>e.lane===l).map((e,i)=><span key={i} className="enemy" style={{left:e.pos+'%'}}>◆<small>{Math.max(0,Math.ceil(e.hp))}</small></span>)}</div>)}</div>
    <p className="muted">Turrets use in-game energy. Defeated enemies reward ES Coins.</p>
  </GameFrame>
}
