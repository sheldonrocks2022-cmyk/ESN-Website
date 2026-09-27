import { useEffect, useMemo, useState } from 'react'

const fortniteChallenges = [
  'Win a match using only weapons from the first POI you land at.',
  'No vehicles: rotate entirely on foot and survive to top 10.',
  'Carry one weapon slot only until you earn your first elimination.',
  'Land at the farthest named POI from the bus path and reach top 15.',
  'Play one match focused only on positioning: avoid unnecessary fights until late game.',
]
const creatorChallenges = [
  'Make a 15-second clip with a hook in the first 1.5 seconds.',
  'Create one short using only three cuts and one sound effect.',
  'Turn one old clip into a completely new post with a different hook.',
  'Write five titles for the same video and pick the strongest one.',
  'Create a thumbnail concept using only one subject and three words.',
]

function ToolCard({title,eyebrow,children}) { return <article className="tool-card"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{children}</article> }

export default function ESToolsSuite() {
  const [challengeType,setChallengeType]=useState('fortnite')
  const [challenge,setChallenge]=useState('Generate a challenge when you are ready.')
  const [seconds,setSeconds]=useState(300)
  const [remaining,setRemaining]=useState(300)
  const [running,setRunning]=useState(false)
  const [promptType,setPromptType]=useState('video')
  const [promptSubject,setPromptSubject]=useState('')
  const [prompt,setPrompt]=useState('')
  const [entries,setEntries]=useState('Option A\nOption B\nOption C')
  const [picked,setPicked]=useState('')
  const [coin,setCoin]=useState('—')
  const [die,setDie]=useState('—')
  const [siteType,setSiteType]=useState('starter')

  useEffect(()=>{
    if(!running)return
    const t=setInterval(()=>setRemaining(r=>{ if(r<=1){setRunning(false);return 0} return r-1 }),1000)
    return()=>clearInterval(t)
  },[running])
  useEffect(()=>{if(!running)setRemaining(seconds)},[seconds])

  const time=useMemo(()=>`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`,[remaining])
  const generateChallenge=()=>{ const list=challengeType==='fortnite'?fortniteChallenges:creatorChallenges; setChallenge(list[Math.floor(Math.random()*list.length)]) }
  const generatePrompt=()=>{
    const subject=promptSubject.trim()||'my project'
    const map={video:`Create a high-retention short-form video concept about ${subject}. Give me a hook, 5-beat structure, on-screen text, pacing notes, and a strong ending CTA.`,image:`Create a detailed image concept for ${subject}. Define the subject, environment, lighting, camera angle, composition, mood, and the exact visual details that should stand out.`,discord:`Design a clear Discord community setup for ${subject}. Include categories, channels, role structure, onboarding flow, moderation areas, and a clean member experience.`}
    setPrompt(map[promptType])
  }
  const randomPick=()=>{ const list=entries.split('\n').map(x=>x.trim()).filter(Boolean); setPicked(list.length?list[Math.floor(Math.random()*list.length)]:'Add at least one option.') }

  return <>
    <section className="page-hero tools-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">ES TOOLS</span><h1>Free utilities. No account wall.</h1><p>Fast browser tools for players and creators — challenges, focus, prompts, randomizers, quick rolls, and service estimates.</p></div><div className="page-hero-mark" aria-hidden="true"><span>ES</span><small>TOOLS</small></div></div></section>
    <section className="section compact-section"><div className="shell network-stat-grid tools-stat-grid"><div><strong>6</strong><span>Interactive utilities</span></div><div><strong>Free</strong><span>No paid tool access</span></div><div><strong>No account</strong><span>Open and use</span></div><div><strong>Browser</strong><span>Built for quick access</span></div></div></section>
    <section className="section tools-section"><div className="shell"><div className="section-heading"><div><span className="eyebrow">Utility Deck</span><h2>Pick a tool and get moving.</h2></div></div><div className="tools-grid">
      <ToolCard eyebrow="CHALLENGE GENERATOR" title="Fortnite / Creator Challenge">
        <div className="segmented"><button className={challengeType==='fortnite'?'active':''} onClick={()=>setChallengeType('fortnite')}>Fortnite</button><button className={challengeType==='creator'?'active':''} onClick={()=>setChallengeType('creator')}>Creator</button></div>
        <div className="tool-output">{challenge}</div><button className="button primary" onClick={generateChallenge}>Generate challenge</button>
      </ToolCard>
      <ToolCard eyebrow="FOCUS TIMER" title="Quick Timer">
        <div className="timer-readout">{time}</div><div className="segmented">{[60,300,600,1500].map(v=><button key={v} onClick={()=>{setRunning(false);setSeconds(v)}}>{v<60?v:`${v/60}m`}</button>)}</div>
        <div className="tool-actions"><button className="button primary" onClick={()=>setRunning(v=>!v)}>{running?'Pause':'Start'}</button><button className="button secondary" onClick={()=>{setRunning(false);setRemaining(seconds)}}>Reset</button></div>
      </ToolCard>
      <ToolCard eyebrow="PROMPT BUILDER" title="Prompt Generator">
        <select value={promptType} onChange={e=>setPromptType(e.target.value)}><option value="video">Video</option><option value="image">Image</option><option value="discord">Discord setup</option></select>
        <input value={promptSubject} onChange={e=>setPromptSubject(e.target.value)} placeholder="What are you creating?" />
        <button className="button primary" onClick={generatePrompt}>Build prompt</button>{prompt&&<div className="tool-output selectable">{prompt}</div>}
      </ToolCard>
      <ToolCard eyebrow="RANDOMIZER" title="Random Picker">
        <textarea rows="6" value={entries} onChange={e=>setEntries(e.target.value)} aria-label="Random picker options"/><button className="button primary" onClick={randomPick}>Pick one</button><div className="tool-output big-output">{picked||'—'}</div>
      </ToolCard>
      <ToolCard eyebrow="QUICK RANDOM" title="Coin Flip & Dice">
        <div className="random-pair"><div><span>Coin</span><strong>{coin}</strong><button onClick={()=>setCoin(Math.random()<.5?'Heads':'Tails')}>Flip</button></div><div><span>D6</span><strong>{die}</strong><button onClick={()=>setDie(String(1+Math.floor(Math.random()*6)))}>Roll</button></div></div>
      </ToolCard>
      <ToolCard eyebrow="SERVICE ESTIMATE" title="Website Estimate">
        <p className="muted">Restored from previously surfaced ES Tools estimate values. Final scope is still confirmed through ESN.</p>
        <div className="segmented"><button className={siteType==='starter'?'active':''} onClick={()=>setSiteType('starter')}>Starter</button><button className={siteType==='multi'?'active':''} onClick={()=>setSiteType('multi')}>Multi-page</button></div>
        <div className="estimate"><span>Estimated starting price</span><strong>{siteType==='starter'?'$180':'$320'}</strong></div>
      </ToolCard>
    </div></div></section>
  </>
}
