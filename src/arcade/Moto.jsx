import { useEffect, useMemo, useRef, useState } from 'react'
import GameFrame from './GameFrame'
import { readGame, saveGame, useArcadeProfile } from './profile'

const KEY='esn_moto_v2'
function obstacle(track,i){const x=Math.sin(track*999+i*77)*10000;return{at:120+i*130+Math.abs(Math.floor(x))%80,lane:Math.abs(Math.floor(x*7))%3}}

export default function MotoGame(){
  const {profile,earn}=useArcadeProfile()
  const [saved,setSaved]=useState(()=>readGame(KEY,{best:{}}))
  const [track,setTrack]=useState(1)
  const [r,setR]=useState({run:false,lane:1,d:0,speed:0,time:0,hit:false})
  const throttle=useRef(false)
  const obs=useMemo(()=>Array.from({length:7},(_,i)=>obstacle(track,i)),[track])
  useEffect(()=>saveGame(KEY,saved),[saved])
  useEffect(()=>{
    if(!r.run)return
    const t=setInterval(()=>setR(x=>{
      let speed=Math.max(0,Math.min(18,x.speed+(throttle.current?.75:-.45)))
      let d=x.d+speed
      const hit=obs.some(o=>Math.abs(o.at-d)<8&&o.lane===x.lane)
      if(hit)speed=Math.max(2,speed*.35)
      const time=x.time+.1
      if(d>=1000){
        const f=+time.toFixed(1)
        setSaved(s=>({best:{...s.best,[track]:!s.best[track]||f<s.best[track]?f:s.best[track]}}))
        earn(Math.max(50,Math.floor(700-f*10)),25)
        return{...x,run:false,d:1000,speed:0,time:f,hit:false}
      }
      return{...x,d,speed,time,hit}
    }),100)
    return()=>clearInterval(t)
  },[r.run,obs,track])
  const start=()=>setR({run:true,lane:1,d:0,speed:0,time:0,hit:false})
  const lane=n=>setR(x=>({...x,lane:Math.max(0,Math.min(2,n))}))
  return <GameFrame title="ES MOTO: Hyperlane" text="1,000 procedural tracks, hazards, touch controls, best times, and Arcade rewards." profile={profile}>
    <div className="moto-controls-top"><label>Track <input type="number" min="1" max="1000" value={track} onChange={e=>!r.run&&setTrack(Math.max(1,Math.min(1000,+e.target.value||1)))}/></label><span>Best: <b>{saved.best[track]?saved.best[track]+'s':'—'}</b></span><button className="button primary" onClick={start}>{r.run?'Restart':'Start race'}</button></div>
    <div className={'moto-road '+(r.hit?'crash':'')}><div className="finish-line">FINISH</div>{obs.map((o,i)=><span key={i} className={'moto-obstacle lane-'+o.lane} style={{bottom:Math.max(0,Math.min(100,100-(o.at-r.d)/10))+'%'}}>▲</span>)}<div className={'moto-bike lane-'+r.lane}>🏍️</div></div>
    <div className="moto-hud"><span>{Math.floor(r.d)}/1000m</span><span>{r.speed.toFixed(1)} speed</span><span>{r.time.toFixed(1)}s</span></div>
    <div className="mobile-race-controls"><button onClick={()=>lane(r.lane-1)}>←</button><button onPointerDown={()=>throttle.current=true} onPointerUp={()=>throttle.current=false} onPointerCancel={()=>throttle.current=false}>THROTTLE</button><button onClick={()=>lane(r.lane+1)}>→</button></div>
  </GameFrame>
}
