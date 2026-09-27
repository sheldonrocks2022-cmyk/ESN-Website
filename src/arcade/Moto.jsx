import { useEffect, useMemo, useRef, useState } from 'react'
import OriginalFrame from './OriginalFrame'
import { usePersistent } from './shared'

function terrain(track){
  const pts=[]
  let y=72
  for(let i=0;i<=24;i++){
    const s=Math.sin(track*0.71+i*.87)+Math.sin(track*1.91+i*.31)*.55
    y=Math.max(34,Math.min(82,y+s*2.6))
    pts.push([i*(100/24),y])
  }
  return pts
}
function interpY(points,x){
  const i=Math.min(points.length-2,Math.max(0,Math.floor(x/100*(points.length-1))))
  const a=points[i],b=points[i+1],t=(x-a[0])/(b[0]-a[0]||1)
  return a[1]+(b[1]-a[1])*t
}

export default function MotoGame(){
  const [saved,setSaved]=usePersistent('esn_moto_original_v1',{track:1,best:{}})
  const [track,setTrack]=useState(saved.track||1)
  const [run,setRun]=useState({active:false,paused:false,x:0,speed:0,rotation:0,time:0,checkpoint:0})
  const input=useRef({throttle:false,brake:false,rotF:false,rotB:false})
  const pts=useMemo(()=>terrain(track),[track])

  useEffect(()=>{
    if(!run.active||run.paused)return
    const t=setInterval(()=>setRun(s=>{
      let speed=s.speed+(input.current.throttle?.18:0)-(input.current.brake?.28:.035)
      speed=Math.max(0,Math.min(3.2,speed))
      const x=Math.min(100,s.x+speed*.22)
      let rotation=s.rotation+(input.current.rotF?-4:0)+(input.current.rotB?4:0)
      rotation*=.985
      const time=s.time+.05
      const checkpoint=Math.max(s.checkpoint,Math.floor(x/20))
      if(x>=100){
        const final=+time.toFixed(2)
        setSaved(v=>({...v,track,best:{...v.best,[track]:!v.best[track]||final<v.best[track]?final:v.best[track]}}))
        return {...s,active:false,x:100,speed:0,time:final,checkpoint:5}
      }
      return {...s,x,speed,rotation,time,checkpoint}
    }),50)
    return()=>clearInterval(t)
  },[run.active,run.paused,track,setSaved])

  const start=()=>setRun({active:true,paused:false,x:0,speed:0,rotation:0,time:0,checkpoint:0})
  const bikeY=interpY(pts,run.x)
  const path=pts.map(p=>p.join(',')).join(' ')
  const button=(key,label)=><button
    onPointerDown={()=>input.current[key]=true}
    onPointerUp={()=>input.current[key]=false}
    onPointerCancel={()=>input.current[key]=false}
    onPointerLeave={()=>input.current[key]=false}
  >{label}</button>

  return <OriginalFrame title="ES MOTO" subtitle="1,000+ tracks • checkpoints • touch controls • best times">
    <section className="oa-panel oa-moto-intro">
      <div className="oa-bike-mark"><span/><i/><i/></div>
      <div className="oa-glow-panel oa-discord-card">
        <span className="oa-kicker">DISCORD GAMEPLAY BONUS</span>
        <h2>ESN COMMUNITY ACCESS</h2>
        <p>Join the official ES Network Discord for service support and community updates.</p>
        <a href="https://discord.gg/3gxA66KZ8" target="_blank" rel="noreferrer">JOIN OFFICIAL DISCORD</a>
      </div>
    </section>

    <section className="oa-panel">
      <div className="oa-moto-toolbar">
        <label>TRACK <input type="number" min="1" max="1000" disabled={run.active} value={track} onChange={e=>{const n=Math.max(1,Math.min(1000,+e.target.value||1));setTrack(n);setSaved(v=>({...v,track:n}))}}/></label>
        <span>BEST <b>{saved.best[track]?saved.best[track]+'s':'—'}</b></span>
        <span>CHECKPOINT <b>{run.checkpoint}/5</b></span>
        <button onClick={()=>setRun(s=>({...s,paused:!s.paused}))} disabled={!run.active}>PAUSE: {run.paused?'ON':'OFF'}</button>
      </div>

      <div className="oa-moto-stage">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs><filter id="glow"><feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
          <polyline points={path} fill="none" stroke="#17185c" strokeWidth="1.1"/>
          <polyline points={path} fill="none" stroke="#65e8f4" strokeWidth=".65" filter="url(#glow)"/>
          {[20,40,60,80].map(x=><line key={x} x1={x} y1="20" x2={x} y2="90" stroke="rgba(100,232,244,.12)" strokeDasharray="2 2"/>)}
          <g transform={`translate(${run.x} ${bikeY-4}) rotate(${run.rotation})`}>
            <circle cx="-2.2" cy="2.2" r="2" fill="#071124" stroke="#62efff" strokeWidth=".8"/>
            <circle cx="3.1" cy="2.2" r="2" fill="#071124" stroke="#62efff" strokeWidth=".8"/>
            <path d="M-2 1 L0 -1 L2 1 L4 1 M0 -1 L2 -2" fill="none" stroke="#eafcff" strokeWidth=".9" strokeLinecap="round"/>
          </g>
        </svg>
      </div>
      <div className="oa-moto-hud"><span>TIME <b>{run.time.toFixed(2)}s</b></span><span>SPEED <b>{run.speed.toFixed(2)}</b></span><span>TRACK <b>{track}/1000</b></span></div>
      <div className="oa-moto-controls">
        {button('brake','LEFT / BRAKE')}
        {button('throttle','RIGHT / THROTTLE')}
        {button('rotF','ROTATE FORWARD')}
        {button('rotB','ROTATE BACKWARD')}
      </div>
      <button className="oa-primary-wide" onClick={start}>{run.active?'RESTART TRACK':'START TRACK'}</button>
      <div className="oa-subpanel"><span>GAME PANELS</span><p>Desktop: W accelerates, A/D rotate, S brakes in the original control model. Mobile uses the four large touch buttons shown above.</p></div>
    </section>
  </OriginalFrame>
}
