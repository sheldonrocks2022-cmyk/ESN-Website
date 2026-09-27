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
  const wheelSpin=(run.x*54+run.time*run.speed*80)%360
  const suspension=Math.sin(run.time*18)*Math.min(.7,run.speed*.16)
  const riderLean=Math.max(-13,Math.min(13,run.rotation*.42))
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
          <g className="oa-moto-bike" transform={`translate(${run.x} ${bikeY-4+suspension}) rotate(${run.rotation})`}>
            {input.current.boost&&run.active&&run.nitro>0&&<g className="oa-moto-exhaust">
              <path d="M-4.8 .2 L-9.2 -.8 L-7.4 .7 L-10.1 1.7 L-5.1 1.45 Z" fill="#77f6ff" opacity=".9"/>
              <path d="M-5.1 .5 L-7.8 .15 L-6.6 .9 L-8.2 1.25 L-5.2 1.15 Z" fill="#ffffff"/>
            </g>}
            <g className="oa-bike-wheel oa-bike-wheel-rear" transform={`translate(-3.25 2.65) rotate(${wheelSpin})`}>
              <circle r="2.65" fill="#02050a" stroke="#19283b" strokeWidth=".95"/>
              <circle r="1.85" fill="#07111c" stroke="#86f6ff" strokeWidth=".32"/>
              <circle r=".48" fill="#c8fbff"/>
              {[0,45,90,135].map(a=><line key={a} x1="-1.65" y1="0" x2="1.65" y2="0" transform={`rotate(${a})`} stroke="rgba(214,250,255,.72)" strokeWidth=".18"/>)}
            </g>
            <g className="oa-bike-wheel oa-bike-wheel-front" transform={`translate(3.85 2.65) rotate(${wheelSpin})`}>
              <circle r="2.65" fill="#02050a" stroke="#19283b" strokeWidth=".95"/>
              <circle r="1.85" fill="#07111c" stroke="#86f6ff" strokeWidth=".32"/>
              <circle r=".48" fill="#c8fbff"/>
              {[0,45,90,135].map(a=><line key={a} x1="-1.65" y1="0" x2="1.65" y2="0" transform={`rotate(${a})`} stroke="rgba(214,250,255,.72)" strokeWidth=".18"/>)}
            </g>
            <path d="M-3.1 1.8 L-.9 -1.05 L2.2 .95 L3.8 2.1 M-.9 -1.05 L.55 1.7 L-3.1 1.8 M.55 1.7 L2.2 .95" fill="none" stroke="#8cefff" strokeWidth=".72" strokeLinejoin="round"/>
            <path d="M-.95 -1.08 L1.35 -1.2 L2.45 -.42 L.15 -.2 Z" fill="#183752" stroke="#d9fbff" strokeWidth=".26"/>
            <path d="M2.25 -.4 L3.55 -2.15 L4.15 -2.2" fill="none" stroke="#bfeeff" strokeWidth=".42" strokeLinecap="round"/>
            <path d="M3.48 -2.1 L4.05 2.0" stroke="#9ecfe2" strokeWidth=".34"/>
            <rect x="-2.15" y=".15" width="2.35" height="1.35" rx=".35" fill="#142a3d" stroke="#79dceb" strokeWidth=".25"/>
            <circle cx="-1.3" cy=".82" r=".5" fill="#293e50" stroke="#9af7ff" strokeWidth=".18"/>
            <path d="M-3.9 .65 L-2.2 .5" stroke="#8a9eac" strokeWidth=".42" strokeLinecap="round"/>
            <g className="oa-moto-rider" transform={`rotate(${riderLean} .5 -2.4)`}>
              <path d="M-.15 -1.4 L.45 -4.1 L1.82 -4.0 L2.35 -1.65 Z" fill="#111a28" stroke="#9fdce9" strokeWidth=".28"/>
              <path d="M.15 -1.3 L-1.45 1.05" stroke="#d1dbe4" strokeWidth=".58" strokeLinecap="round"/>
              <path d="M1.65 -1.55 L2.45 .72" stroke="#d1dbe4" strokeWidth=".58" strokeLinecap="round"/>
              <path d="M.55 -3.78 L2.35 -2.48 L3.55 -2.18" fill="none" stroke="#d8e3eb" strokeWidth=".55" strokeLinecap="round"/>
              <path d="M.52 -3.68 L-.75 -2.35 L-.98 -.7" fill="none" stroke="#cbd9e4" strokeWidth=".55" strokeLinecap="round"/>
              <circle cx=".95" cy="-5.05" r="1.02" fill="#101722" stroke="#d5fbff" strokeWidth=".34"/>
              <path d="M.15 -5.12 Q1.05 -6 1.86 -5.22 L1.62 -4.72 L.18 -4.72 Z" fill="#2a6380"/>
              <path d="M1.02 -5.18 L1.82 -5.04" stroke="#8ef8ff" strokeWidth=".28" strokeLinecap="round"/>
              <path d="M.72 -4.12 L.88 -3.82" stroke="#d6e3ec" strokeWidth=".45"/>
            </g>
            <path d="M-4.15 .45 L-4.8 .45" stroke="#718598" strokeWidth=".4" strokeLinecap="round"/>
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
