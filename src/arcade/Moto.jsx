import { useEffect, useMemo, useRef, useState } from 'react'
import OriginalFrame from './OriginalFrame'
import { arcadeFeedback, useArcadeProgress, usePersistent } from './shared'

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
function trackDifficulty(points){
  let total=0
  for(let i=1;i<points.length;i++)total+=Math.abs(points[i][1]-points[i-1][1])
  return Math.max(1,Math.min(10,Math.round(total/9)))
}
function dailyTrack(){
  const d=new Date()
  const key=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())/86400000
  return 1+(Math.floor(key*37)%1000)
}

export default function MotoGame(){
  const arcade=useArcadeProgress()
  const [saved,setSaved]=usePersistent('esn_moto_original_v1',{track:1,best:{},medals:{},finishes:0,golds:0})
  const [track,setTrack]=useState(saved.track||1)
  const [run,setRun]=useState({active:false,paused:false,x:0,speed:0,rotation:0,time:0,checkpoint:0,nitro:100})
  const [result,setResult]=useState(null)
  const input=useRef({throttle:false,brake:false,rotF:false,rotB:false,boost:false})
  const pts=useMemo(()=>terrain(track),[track])
  const difficulty=useMemo(()=>trackDifficulty(pts),[pts])
  const medalTimes=useMemo(()=>{
    const base=15+difficulty*1.8
    return {gold:+base.toFixed(1),silver:+(base*1.22).toFixed(1),bronze:+(base*1.48).toFixed(1)}
  },[difficulty])

  useEffect(()=>{
    const down=e=>{
      const key=e.key.toLowerCase()
      if(['w','arrowup'].includes(key))input.current.throttle=true
      if(['s','arrowdown'].includes(key))input.current.brake=true
      if(['d','arrowright'].includes(key))input.current.rotF=true
      if(['a','arrowleft'].includes(key))input.current.rotB=true
      if(key==='shift'||key===' ')input.current.boost=true
      if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ','shift'].includes(key))e.preventDefault()
    }
    const up=e=>{
      const key=e.key.toLowerCase()
      if(['w','arrowup'].includes(key))input.current.throttle=false
      if(['s','arrowdown'].includes(key))input.current.brake=false
      if(['d','arrowright'].includes(key))input.current.rotF=false
      if(['a','arrowleft'].includes(key))input.current.rotB=false
      if(key==='shift'||key===' ')input.current.boost=false
    }
    window.addEventListener('keydown',down,{passive:false})
    window.addEventListener('keyup',up)
    return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)}
  },[])

  useEffect(()=>{
    if(!run.active||run.paused)return
    const t=setInterval(()=>setRun(s=>{
      const boosting=input.current.boost&&input.current.throttle&&s.nitro>0
      const ahead=interpY(pts,Math.min(100,s.x+1.2))
      const behind=interpY(pts,Math.max(0,s.x-1.2))
      const slope=(ahead-behind)/2.4
      const slopePush=slope*.035
      let speed=s.speed+(input.current.throttle?.18:0)-(input.current.brake?.28:.035)+(boosting?.13:0)+slopePush
      speed=Math.max(0,Math.min(boosting?4.8:3.2,speed))
      const x=Math.min(100,s.x+speed*.22)
      const trackAngle=Math.max(-24,Math.min(24,Math.atan2(ahead-behind,2.4)*180/Math.PI))
      let rotation=s.rotation+(input.current.rotF?-4:0)+(input.current.rotB?4:0)
      rotation=rotation*.9+trackAngle*.1
      const time=s.time+.05
      const checkpoint=Math.max(s.checkpoint,Math.floor(x/20))
      const nitro=Math.max(0,Math.min(100,s.nitro+(boosting?-1.6:(speed<1.2?.45:.16))))

      if(x>=100){
        const final=+time.toFixed(2)
        const medal=final<=medalTimes.gold?'GOLD':final<=medalTimes.silver?'SILVER':final<=medalTimes.bronze?'BRONZE':'FINISH'
        const previous=saved.best[track]
        const isBest=!previous||final<previous
        setSaved(v=>({
          ...v,track,
          best:{...v.best,[track]:!v.best[track]||final<v.best[track]?final:v.best[track]},
          medals:{...v.medals,[track]:medal},
          finishes:(v.finishes||0)+1,
          golds:(v.golds||0)+(medal==='GOLD'&&v.medals?.[track]!=='GOLD'?1:0),
        }))
        setResult({time:final,medal,isBest,previous:previous||null})
        arcadeFeedback(medal==='GOLD'?'win':'impact')
        arcade.track('motoFinishes',1,medal==='GOLD'?120:medal==='SILVER'?80:50,'MOTO '+medal+' finish')
        if(medal==='GOLD'){
          arcade.track('motoGolds',1,0)
          arcade.unlock('moto-gold','MOTO: Gold Medal',220)
        }
        if((saved.finishes||0)+1>=10)arcade.unlock('moto-ten-finishes','MOTO: 10 Finishes',200)
        return {...s,active:false,x:100,speed:0,time:final,checkpoint:5,nitro}
      }
      return {...s,x,speed,rotation,time,checkpoint,nitro}
    }),50)
    return()=>clearInterval(t)
  },[run.active,run.paused,track,setSaved,medalTimes,saved.best,saved.medals,saved.finishes,arcade,pts])

  const start=()=>{
    setResult(null)
    arcadeFeedback('power')
    setRun({active:true,paused:false,x:0,speed:0,rotation:0,time:0,checkpoint:0,nitro:100})
  }
  const chooseTrack=n=>{
    const next=Math.max(1,Math.min(1000,n||1))
    setTrack(next);setSaved(v=>({...v,track:next}));setResult(null)
  }
  const bikeY=interpY(pts,run.x)
  const path=pts.map(p=>p.join(',')).join(' ')
  const button=(key,label)=><button
    onPointerDown={()=>{input.current[key]=true;arcadeFeedback(key==='boost'?'boost':'tap')}}
    onPointerUp={()=>input.current[key]=false}
    onPointerCancel={()=>input.current[key]=false}
    onPointerLeave={()=>input.current[key]=false}
  >{label}</button>

  return <OriginalFrame title="ES MOTO" subtitle="1,000 tracks • keyboard + touch • nitro • medals • daily challenge">
    <section className="oa-panel oa-moto-career">
      <div><span>FINISHES</span><b>{saved.finishes||0}</b></div>
      <div><span>GOLD MEDALS</span><b>{saved.golds||0}</b></div>
      <div><span>TRACK DIFFICULTY</span><b>{difficulty}/10</b></div>
      <div><span>CURRENT MEDAL</span><b>{saved.medals?.[track]||'—'}</b></div>
    </section>

    <section className="oa-panel oa-moto-intro oa-moto-showcase">
      <div className="oa-bike-mark"><span/><i/><i/></div>
      <div className="oa-glow-panel oa-daily-challenge">
        <span className="oa-kicker">DAILY TRACK</span>
        <h2>TRACK {dailyTrack()}</h2>
        <p>One deterministic daily challenge track shared by everyone visiting the Arcade that day.</p>
        <button onClick={()=>chooseTrack(dailyTrack())} disabled={run.active}>LOAD DAILY TRACK</button>
      </div>
    </section>

    <section className="oa-panel oa-moto-game-panel">
      <div className="oa-mobile-only oa-moto-mobile-quick">
        <span>TRACK <b>{track}</b></span>
        <span>BEST <b>{saved.best[track]?saved.best[track]+'s':'—'}</b></span>
        <span>CP <b>{run.checkpoint}/5</b></span>
        <button onClick={()=>chooseTrack(dailyTrack())} disabled={run.active}>DAILY</button>
      </div>

      <div className="oa-moto-toolbar">
        <label>TRACK <input type="number" min="1" max="1000" disabled={run.active} value={track} onChange={e=>chooseTrack(+e.target.value)}/></label>
        <span>BEST <b>{saved.best[track]?saved.best[track]+'s':'—'}</b></span>
        <span>CHECKPOINT <b>{run.checkpoint}/5</b></span>
        <button onClick={()=>setRun(s=>({...s,paused:!s.paused}))} disabled={!run.active}>PAUSE: {run.paused?'ON':'OFF'}</button>
      </div>

      <div className="oa-medal-targets">
        <span>GOLD ≤ <b>{medalTimes.gold}s</b></span><span>SILVER ≤ <b>{medalTimes.silver}s</b></span><span>BRONZE ≤ <b>{medalTimes.bronze}s</b></span>
      </div>

      <div className={'oa-moto-stage '+(run.active?'is-racing ':'')+(run.speed>2.25?'is-fast':'')}>
        <div className="oa-moto-stage-hud">
          <span><small>TIME</small><b>{run.time.toFixed(2)}s</b></span>
          <span><small>SPEED</small><b>{run.speed.toFixed(2)}</b></span>
          <span><small>NITRO</small><b>{Math.floor(run.nitro)}%</b></span>
        </div>
        <div className="oa-moto-speed-lines" style={{opacity:Math.min(.68,run.speed/5)}} aria-hidden="true"/>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="glow"><feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <linearGradient id="motoSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#102b54"/><stop offset="58%" stopColor="#173a63"/><stop offset="100%" stopColor="#071329"/></linearGradient>
            <linearGradient id="motoGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16233d"/><stop offset="100%" stopColor="#060a13"/></linearGradient>
            <radialGradient id="motoSun"><stop offset="0%" stopColor="#dffcff"/><stop offset="45%" stopColor="#70eaf4"/><stop offset="100%" stopColor="#70eaf4" stopOpacity="0"/></radialGradient>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill="url(#motoSky)"/>
          <circle cx="82" cy="18" r="11" fill="url(#motoSun)" opacity=".55"/>
          <polygon points={`0,100 ${path} 100,100`} fill="url(#motoGround)" opacity=".96"/>
          <polyline points={path} fill="none" stroke="#05070f" strokeWidth="2.6"/>
          <polyline points={path} fill="none" stroke="#65e8f4" strokeWidth=".72" filter="url(#glow)"/>
          {[20,40,60,80].map(x=><g key={x}><line x1={x} y1="16" x2={x} y2="90" stroke="rgba(100,232,244,.09)" strokeDasharray="2 2"/><rect x={x-.35} y="26" width=".7" height="10" fill="rgba(220,250,255,.34)"/><path d={`M${x} 26 L${x+4} 28 L${x} 30 Z`} fill="rgba(98,232,244,.55)"/></g>)}
          <g transform={`translate(${run.x} ${bikeY-4}) rotate(${run.rotation})`}>
            <circle cx="-2.5" cy="2.4" r="2.25" fill="#050914" stroke="#8af5ff" strokeWidth=".7"/>
            <circle cx="3.4" cy="2.4" r="2.25" fill="#050914" stroke="#8af5ff" strokeWidth=".7"/>
            <circle cx="-2.5" cy="2.4" r=".65" fill="#a9fbff"/><circle cx="3.4" cy="2.4" r=".65" fill="#a9fbff"/>
            <path d="M-2.2 1.3 L-.1 -1.1 L2.2 1.1 L4 1.1 M-.1 -1.1 L2.1 -2.3" fill="none" stroke="#eafcff" strokeWidth=".9" strokeLinecap="round"/>
            <path d="M.2 -1.2 L.7 -3.8 L1.6 -4.8 M.7 -3.8 L-1 -3.1" fill="none" stroke="#dcecff" strokeWidth=".72" strokeLinecap="round"/>
            <circle cx="1.7" cy="-5.2" r=".85" fill="#dffcff"/>
          </g>
        </svg>
      </div>

      <div className="oa-moto-hud">
        <span>TIME <b>{run.time.toFixed(2)}s</b></span><span>SPEED <b>{run.speed.toFixed(2)}</b></span><span>TRACK <b>{track}/1000</b></span><span>NITRO <b>{Math.floor(run.nitro)}%</b></span>
      </div>
      <div className="oa-mini-meter"><i style={{width:run.nitro+'%'}}/></div>

      <div className="oa-moto-controls">
        {button('brake','S / BRAKE')}
        {button('throttle','W / THROTTLE')}
        {button('rotB','A / ROTATE BACK')}
        {button('rotF','D / ROTATE FORWARD')}
        {button('boost','SHIFT / NITRO')}
      </div>
      <div className="oa-mobile-only oa-moto-touch-deck" aria-label="Mobile MOTO controls">
        <div className="oa-moto-steer-pad">
          {button('rotB','↶ LEAN')}
          {button('rotF','LEAN ↷')}
        </div>
        <div className="oa-moto-drive-pad">
          {button('brake','BRAKE')}
          {button('boost','NITRO')}
          {button('throttle','THROTTLE')}
        </div>
      </div>
      <button className="oa-primary-wide" onClick={start}>{run.active?'RESTART TRACK':'START TRACK'}</button>

      {result&&<div className={'oa-race-result '+result.medal.toLowerCase()}>
        <span>{result.medal}</span><strong>{result.time.toFixed(2)}s</strong><p>{result.isBest?'NEW PERSONAL BEST':result.previous?`Best: ${result.previous}s`:'Track complete'}</p>
      </div>}

      <div className="oa-subpanel"><span>CONTROLS</span><p>Desktop: W throttle, S brake, A/D rotate, Shift or Space for Nitro. Mobile uses the large touch controls above.</p></div>
    </section>
  </OriginalFrame>
}
