import { useEffect, useState } from 'react'

export default function StartupIntro(){
  const [phase,setPhase]=useState('boot')

  useEffect(()=>{
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches
    const fade=window.setTimeout(()=>setPhase('exit'),reduce?420:1650)
    const done=window.setTimeout(()=>setPhase('done'),reduce?650:2050)
    return()=>{clearTimeout(fade);clearTimeout(done)}
  },[])

  if(phase==='done')return null

  return <div className={phase==='exit'?'startup-intro exit':'startup-intro'} aria-label="ES Network loading">
    <div className="startup-grid" aria-hidden="true"/>
    <div className="startup-beam" aria-hidden="true"/>
    <div className="startup-core">
      <div className="startup-logo-wrap">
        <div className="startup-ring ring-a"/>
        <div className="startup-ring ring-b"/>
        <div className="startup-logo">ES</div>
      </div>
      <span className="startup-kicker">ES NETWORK // SYSTEM STARTUP</span>
      <h1>Initializing ESN</h1>
      <div className="startup-modules">
        <span>NETWORK</span><i/>
        <span>ARCADE</span><i/>
        <span>SMP</span><i/>
        <span>TOOLS</span>
      </div>
      <div className="startup-progress"><span/></div>
      <small>LOADING LIVE EXPERIENCE</small>
    </div>
    <div className="startup-corner tl">ESN // 2026</div>
    <div className="startup-corner br">SECURE EXPERIENCE LAYER</div>
  </div>
}
