import { useEffect, useMemo, useState } from 'react'
import OriginalFrame from './OriginalFrame'

const TOWERS=[
  {name:'BASIC',cost:80,damage:5,range:.16,rate:5,mark:'B'},
  {name:'RAPID',cost:90,damage:3,range:.15,rate:9,mark:'R'},
  {name:'CANNON',cost:130,damage:10,range:.14,rate:3,mark:'C'},
  {name:'SNIPER',cost:160,damage:18,range:.24,rate:2,mark:'S'},
  {name:'FURY',cost:280,damage:9,range:.17,rate:7,mark:'F'},
  {name:'POISON',cost:120,damage:4,range:.16,rate:5,mark:'P'},
  {name:'BOSS KILLER',cost:220,damage:24,range:.18,rate:2,mark:'K'},
  {name:'RAPID FIRE',cost:140,damage:4,range:.18,rate:11,mark:'F'},
  {name:'TANK',cost:260,damage:14,range:.13,rate:4,mark:'T'},
  {name:'VOID',cost:420,damage:30,range:.21,rate:4,mark:'V'},
]
const nodes=[
  [.16,.34],[.32,.15],[.29,.54],[.52,.48],[.57,.73],[.71,.49],[.75,.13],[.91,.27]
]
const path=[
  [.04,.78],[.18,.78],[.18,.31],[.39,.31],[.39,.67],[.64,.67],[.64,.24],[.82,.24],[.82,.58],[.96,.58]
]
function lerpPath(t){
  const seg=(path.length-1)*Math.max(0,Math.min(.999,t)),i=Math.floor(seg),f=seg-i
  return [path[i][0]+(path[i+1][0]-path[i][0])*f,path[i][1]+(path[i+1][1]-path[i][1])*f]
}

export default function TowerDefenseGame(){
  const [g,setG]=useState({coins:1500,round:1,base:150,selected:0,placed:{},enemies:[],running:false})
  const [msg,setMsg]=useState('Build towers, then launch the next wave.')
  const selected=TOWERS[g.selected]
  const placedList=useMemo(()=>Object.entries(g.placed).map(([k,v])=>({node:+k,...v})),[g.placed])

  const place=node=>{
    const tower=TOWERS[g.selected]
    if(g.placed[node]||g.coins<tower.cost)return
    setG(s=>({...s,coins:s.coins-tower.cost,placed:{...s.placed,[node]:{type:s.selected,cool:0}}}))
  }
  const startWave=()=>{
    if(g.running)return
    const count=6+Math.min(22,g.round)
    setG(s=>({...s,running:true,enemies:Array.from({length:count},(_,i)=>({id:Date.now()+i,t:-i*.055,hp:25+s.round*5,max:25+s.round*5,boss:s.round%10===0&&i===count-1}))}))
    setMsg(`Wave ${g.round} launched.`)
  }

  useEffect(()=>{
    if(!g.running)return
    const t=setInterval(()=>setG(s=>{
      let placed={...s.placed}
      let enemies=s.enemies.map(e=>({...e,t:e.t+.0045*(e.boss?.62:1)}))
      for(const [nodeKey,p] of Object.entries(placed)){
        const node=nodes[+nodeKey],tower=TOWERS[p.type]
        const cool=Math.max(0,(p.cool||0)-1)
        let updated={...p,cool}
        if(cool===0){
          let target=-1,best=999
          enemies.forEach((e,i)=>{
            if(e.hp<=0||e.t<0)return
            const [x,y]=lerpPath(e.t),d=Math.hypot(x-node[0],y-node[1])
            if(d<tower.range&&e.t<best){best=e.t;target=i}
          })
          if(target>=0){
            enemies[target]={...enemies[target],hp:enemies[target].hp-tower.damage*(enemies[target].boss&&tower.name==='BOSS KILLER'?2.4:1)}
            updated.cool=Math.max(1,Math.floor(12/tower.rate))
          }
        }
        placed[nodeKey]=updated
      }
      const killed=enemies.filter(e=>e.hp<=0).length
      const reached=enemies.filter(e=>e.t>=1&&e.hp>0)
      const base=Math.max(0,s.base-reached.reduce((a,e)=>a+(e.boss?20:5),0))
      enemies=enemies.filter(e=>e.hp>0&&e.t<1)
      const coins=s.coins+killed*18
      if(enemies.length===0){
        const next=Math.min(200,s.round+1)
        setMsg(base<=0?'Base destroyed. Restart defense to continue.':`Wave ${s.round} cleared. Next: ${next}/200.`)
        return {...s,coins,base,round:next,placed,running:false,enemies:[]}
      }
      return {...s,coins,base,placed,enemies}
    }),80)
    return()=>clearInterval(t)
  },[g.running])

  const reset=()=>{setG({coins:1500,round:1,base:150,selected:0,placed:{},enemies:[],running:false});setMsg('Defense reset. Build your loadout.')}

  return <OriginalFrame title="ES Tower Defense" subtitle="200 rounds • path defense • 10-tower roster">
    <section className="oa-panel oa-td-overview-panel">
      <div className="oa-td-actions"><button className="oa-primary-wide" onClick={startWave} disabled={g.running||g.base<=0}>PLAY DEFENSE</button><button className="oa-secondary-wide" onClick={reset}>RESET DEFENSE</button></div>
      <div className="oa-preview">
        <span>WAVE {String(g.round).padStart(2,'0')}</span><b>{g.round%10===0?'BOSS PATH':'SYSTEM STATUS'}</b><h2>TOWER DEFENSE<br/>PREVIEW READY</h2><p>{msg}</p>
      </div>
      <div className="oa-mines-stats"><div><span>TOWERS</span><b>{placedList.length} Active</b></div><div><span>WAVES</span><b>{g.round} / 200</b></div><div><span>BASE HEALTH</span><b>{g.base}</b></div><div><span>COINS</span><b>{g.coins}</b></div></div>
    </section>

    <section className="oa-panel oa-td-board-panel">
      <div className="oa-td-hud"><span>COINS: <b>{g.coins}</b></span><span>ROUND: <b>{g.round} / 200</b></span><span>BASE HP: <b>{g.base}</b></span></div>
      <div className="oa-td-board">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs><filter id="pathGlow"><feGaussianBlur stdDeviation="1.2" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
          <polyline points={path.map(([x,y])=>`${x*100},${y*100}`).join(' ')} fill="none" stroke="rgba(164,210,229,.35)" strokeWidth="7" strokeLinejoin="round"/>
          <polyline points={path.map(([x,y])=>`${x*100},${y*100}`).join(' ')} fill="none" stroke="rgba(140,225,242,.34)" strokeWidth="3" filter="url(#pathGlow)" strokeLinejoin="round"/>
          <text x="4" y="84" fill="#ffb62f" fontSize="4">SPAWN</text><text x="85" y="63" fill="#d9ffff" fontSize="4">BASE</text>
          {nodes.map(([x,y],i)=><g key={i} onClick={()=>place(i)} className="oa-node"><circle cx={x*100} cy={y*100} r="6.6" fill={g.placed[i]?'rgba(64,177,194,.32)':'#0c1833'} stroke="#62eaf6" strokeWidth={g.placed[i]?'1':'.35'}/><text x={x*100} y={y*100+1.3} textAnchor="middle" fill="#dffcff" fontSize="4">{g.placed[i]?TOWERS[g.placed[i].type].mark:'+'}</text></g>)}
          {g.enemies.filter(e=>e.t>=0).map(e=>{const [x,y]=lerpPath(e.t);return <g key={e.id}><rect x={x*100-1.8} y={y*100-1.8} width="3.6" height="3.6" rx=".5" fill={e.boss?'#9a63ff':'#e8f4ff'} stroke="#061224" strokeWidth=".4"/><rect x={x*100-2.2} y={y*100-3.1} width="4.4" height=".55" fill="#1a2847"/><rect x={x*100-2.2} y={y*100-3.1} width={4.4*Math.max(0,e.hp/e.max)} height=".55" fill="#50e28c"/></g>})}
        </svg>
      </div>
    </section>

    <section className="oa-panel oa-td-loadout-panel">
      <span className="oa-kicker">TOWER LOADOUT</span><p>10 TOWER ROSTER</p>
      <div className="oa-tower-roster">{TOWERS.map((t,i)=><button className={g.selected===i?'active':''} key={t.name} onClick={()=>setG(s=>({...s,selected:i}))}><b>{t.name}</b><span>{t.cost}C</span><small>DMG {t.damage} • RNG {Math.round(t.range*100)}</small></button>)}</div>
      <div className="oa-subpanel"><b>SELECTED: {selected.name}</b><p>Tap an empty + node on the battlefield to place this tower. Defeated enemies return defense coins for more placements.</p></div>
    </section>
  </OriginalFrame>
}
