import { useEffect, useMemo, useRef, useState } from 'react'
import OriginalFrame from './OriginalFrame'
import { arcadeFeedback, useArcadeProgress, usePersistent } from './shared'

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
function towerStats(tower,level){
  const lv=Math.max(1,level||1)
  return {
    damage:tower.damage*(1+(lv-1)*.42),
    range:tower.range*(1+(lv-1)*.055),
    rate:tower.rate*(1+(lv-1)*.18),
  }
}
function upgradeCost(tower,level){return Math.floor(tower.cost*.7*Math.pow(1.55,Math.max(1,level)))}
const defaultCareer={bestRound:1,waves:0,kills:0,bosses:0,upgrades:0,completions:0}

export default function TowerDefenseGame(){
  const arcade=useArcadeProgress()
  const [career,setCareer]=usePersistent('esn_td_career_v2',defaultCareer)
  const [g,setG]=useState({
    coins:1500,round:1,base:150,selected:0,selectedNode:null,placed:{},enemies:[],
    running:false,paused:false,speed:1,sessionKills:0,sessionBosses:0,wavesCleared:0,completed:false
  })
  const [msg,setMsg]=useState('Build towers, upgrade them, then launch the next wave.')
  const [pulseReady,setPulseReady]=useState(true)
  const selected=TOWERS[g.selected]
  const placedList=useMemo(()=>Object.entries(g.placed).map(([k,v])=>({node:+k,...v})),[g.placed])
  const lastCounts=useRef({kills:0,bosses:0,waves:0})

  useEffect(()=>{
    const dk=g.sessionKills-lastCounts.current.kills
    const db=g.sessionBosses-lastCounts.current.bosses
    const dw=g.wavesCleared-lastCounts.current.waves
    if(dk>0){
      setCareer(c=>({...c,kills:c.kills+dk}))
      arcade.gainXp(Math.min(30,dk*2),'Tower Defense eliminations')
    }
    if(db>0){
      setCareer(c=>({...c,bosses:c.bosses+db}))
      arcade.track('tdBosses',db,90*db,'Tower Defense boss defeated')
      arcade.unlock('td-first-boss','Tower Defense: Boss Down',180)
    }
    if(dw>0){
      setCareer(c=>({...c,waves:c.waves+dw,bestRound:Math.max(c.bestRound,g.round)}))
      arcade.track('tdWaves',dw,25*dw,'Tower Defense wave clear')
    }
    lastCounts.current={kills:g.sessionKills,bosses:g.sessionBosses,waves:g.wavesCleared}
  },[g.sessionKills,g.sessionBosses,g.wavesCleared,g.round,setCareer,arcade])

  useEffect(()=>{
    if(career.bestRound>=10)arcade.unlock('td-wave-10','Tower Defense: Wave 10',180)
    if(career.bestRound>=50)arcade.unlock('td-wave-50','Tower Defense: Wave 50',350)
    if(career.bestRound>=100)arcade.unlock('td-wave-100','Tower Defense: Wave 100',500)
  },[career.bestRound,arcade])

  const place=node=>{
    if(g.placed[node]){
      setG(s=>({...s,selectedNode:node}))
      return
    }
    const tower=TOWERS[g.selected]
    if(g.coins<tower.cost)return
    arcadeFeedback('buy')
    setG(s=>({...s,coins:s.coins-tower.cost,selectedNode:node,placed:{...s.placed,[node]:{type:s.selected,cool:0,level:1}}}))
  }

  const startWave=()=>{
    if(g.running||g.completed)return
    arcadeFeedback('wave')
    const count=6+Math.min(24,g.round)
    const bossRound=g.round%10===0
    const eliteRound=g.round%5===0
    setG(s=>({...s,running:true,paused:false,enemies:Array.from({length:count},(_,i)=>{
      const boss=bossRound&&i===count-1
      const elite=!boss&&eliteRound&&i%4===3
      const max=(25+s.round*5)*(boss?4.8:elite?1.8:1)
      return {id:Date.now()+i,t:-i*.055,hp:max,max,boss,elite}
    })}))
    setMsg(`Wave ${g.round} launched${bossRound?' • BOSS INCOMING':eliteRound?' • ELITE ENEMIES':''}.`)
  }

  useEffect(()=>{
    if(!g.running||g.paused)return
    const tick=Math.max(32,80/g.speed)
    const t=setInterval(()=>setG(s=>{
      let placed={...s.placed}
      let enemies=s.enemies.map(e=>({...e,t:e.t+.0045*s.speed*(e.boss?.62:e.elite?.82:1)}))

      for(const [nodeKey,p] of Object.entries(placed)){
        const node=nodes[+nodeKey],tower=TOWERS[p.type]
        const stats=towerStats(tower,p.level)
        const cool=Math.max(0,(p.cool||0)-s.speed)
        let updated={...p,cool}
        if(cool<=0){
          let target=-1,best=-1
          enemies.forEach((e,i)=>{
            if(e.hp<=0||e.t<0)return
            const [x,y]=lerpPath(e.t),d=Math.hypot(x-node[0],y-node[1])
            if(d<stats.range&&e.t>best){best=e.t;target=i}
          })
          if(target>=0){
            const enemy=enemies[target]
            const bossBonus=enemy.boss&&tower.name==='BOSS KILLER'?2.6:1
            const voidBonus=tower.name==='VOID'&&enemy.elite?1.5:1
            enemies[target]={...enemy,hp:enemy.hp-stats.damage*bossBonus*voidBonus}
            updated.cool=Math.max(1,Math.floor(12/stats.rate))
          }
        }
        placed[nodeKey]=updated
      }

      const killedNow=enemies.filter(e=>e.hp<=0)
      const reached=enemies.filter(e=>e.t>=1&&e.hp>0)
      const base=Math.max(0,s.base-reached.reduce((a,e)=>a+(e.boss?24:e.elite?8:5),0))
      enemies=enemies.filter(e=>e.hp>0&&e.t<1)
      const bossKills=killedNow.filter(e=>e.boss).length
      const coins=s.coins+killedNow.reduce((sum,e)=>sum+(e.boss?180:e.elite?36:18),0)

      if(enemies.length===0){
        const completed=s.round>=200
        const bonus=completed?1000:60+s.round*12
        const next=completed?200:s.round+1
        setMsg(base<=0?'Base destroyed. Restart defense to continue.':completed?'All 200 waves cleared. ESN Defense complete.':`Wave ${s.round} cleared • +${bonus} wave bonus. Next: ${next}/200.`)
        if(completed)setCareer(c=>({...c,completions:(c.completions||0)+1,bestRound:200}))
        return {
          ...s,coins:coins+bonus,base,round:next,placed,running:false,paused:false,enemies:[],
          sessionKills:s.sessionKills+killedNow.length,
          sessionBosses:s.sessionBosses+bossKills,
          wavesCleared:s.wavesCleared+1,
          completed,
        }
      }
      return {
        ...s,coins,base,placed,enemies,
        sessionKills:s.sessionKills+killedNow.length,
        sessionBosses:s.sessionBosses+bossKills,
      }
    }),tick)
    return()=>clearInterval(t)
  },[g.running,g.paused,g.speed,setCareer])

  const upgradeSelected=()=>{
    if(g.selectedNode==null)return
    const p=g.placed[g.selectedNode]
    if(!p)return
    const tower=TOWERS[p.type]
    const cost=upgradeCost(tower,p.level)
    if(g.coins<cost||p.level>=8)return
    arcadeFeedback('buy')
    setG(s=>({...s,coins:s.coins-cost,placed:{...s.placed,[s.selectedNode]:{...s.placed[s.selectedNode],level:s.placed[s.selectedNode].level+1}}}))
    setCareer(c=>({...c,upgrades:(c.upgrades||0)+1}))
    arcade.gainXp(35,'Tower Defense upgrade')
  }

  const sellSelected=()=>{
    if(g.selectedNode==null)return
    const p=g.placed[g.selectedNode]
    if(!p)return
    const tower=TOWERS[p.type]
    const refund=Math.floor(tower.cost*(.55+.08*(p.level-1)))
    setG(s=>{
      const placed={...s.placed};delete placed[s.selectedNode]
      return {...s,coins:s.coins+refund,placed,selectedNode:null}
    })
    setMsg(`${tower.name} sold for ${refund} coins.`)
  }

  const pulse=()=>{
    if(!pulseReady||!g.running)return
    setG(s=>({...s,enemies:s.enemies.map(e=>({...e,hp:e.hp-(e.boss?45:80+s.round*1.5)}))}))
    arcadeFeedback('power')
    setPulseReady(false)
    setMsg('ESN Pulse deployed across the battlefield.')
    arcade.gainXp(45,'Tower Defense ESN Pulse')
    setTimeout(()=>setPulseReady(true),30000)
  }

  const repair=()=>{
    if(g.coins<220||g.base>=150)return
    setG(s=>({...s,coins:s.coins-220,base:Math.min(150,s.base+35)}))
    arcadeFeedback('safe')
    setMsg('Base repaired by 35 HP.')
  }

  const reset=()=>{
    lastCounts.current={kills:0,bosses:0,waves:0}
    setG({coins:1500,round:1,base:150,selected:0,selectedNode:null,placed:{},enemies:[],running:false,paused:false,speed:1,sessionKills:0,sessionBosses:0,wavesCleared:0,completed:false})
    setPulseReady(true)
    setMsg('Defense reset. Build your loadout.')
  }

  const selectedPlaced=g.selectedNode!=null?g.placed[g.selectedNode]:null
  const selectedPlacedTower=selectedPlaced?TOWERS[selectedPlaced.type]:null
  const selectedStats=selectedPlaced?towerStats(selectedPlacedTower,selectedPlaced.level):null

  return <OriginalFrame title="ES Tower Defense" subtitle="200 rounds • tower upgrades • bosses • active abilities • persistent records">
    <section className="oa-panel oa-td-career">
      <div><span>BEST ROUND</span><b>{career.bestRound} / 200</b></div>
      <div><span>WAVES CLEARED</span><b>{career.waves}</b></div>
      <div><span>ENEMIES DEFEATED</span><b>{career.kills}</b></div>
      <div><span>BOSSES DEFEATED</span><b>{career.bosses}</b></div>
      <div><span>TOWER UPGRADES</span><b>{career.upgrades||0}</b></div>
      <div><span>COMPLETIONS</span><b>{career.completions||0}</b></div>
    </section>

    <section className="oa-panel oa-td-overview-panel">
      <div className="oa-td-actions">
        <button className="oa-primary-wide" onClick={startWave} disabled={g.running||g.base<=0||g.completed}>START WAVE</button>
        <button className="oa-secondary-wide" onClick={()=>setG(s=>({...s,paused:!s.paused}))} disabled={!g.running}>{g.paused?'RESUME':'PAUSE'}</button>
        <button className="oa-secondary-wide" onClick={()=>setG(s=>({...s,speed:s.speed===1?2:1}))}>{g.speed}× SPEED</button>
        <button className="oa-secondary-wide" onClick={reset}>RESET DEFENSE</button>
      </div>
      <div className="oa-preview">
        <span>WAVE {String(g.round).padStart(2,'0')}</span><b>{g.round%10===0?'BOSS PATH':g.round%5===0?'ELITE PATH':'SYSTEM STATUS'}</b><h2>TOWER DEFENSE<br/>COMMAND GRID</h2><p>{msg}</p>
      </div>
      <div className="oa-mines-stats"><div><span>TOWERS</span><b>{placedList.length} Active</b></div><div><span>WAVES</span><b>{g.round} / 200</b></div><div><span>BASE HEALTH</span><b>{g.base}</b></div><div><span>COINS</span><b>{g.coins}</b></div><div><span>SPEED</span><b>{g.speed}×</b></div><div><span>ENEMIES</span><b>{g.enemies.filter(e=>e.t>=0).length}</b></div></div>
    </section>

    <section className="oa-panel oa-td-abilities">
      <article><span>ACTIVE ABILITY</span><h3>ESN Pulse</h3><p>Hits every active enemy. Bosses resist most of the pulse damage.</p><button onClick={pulse} disabled={!pulseReady||!g.running}>{pulseReady?'DEPLOY PULSE':'30S COOLDOWN'}</button></article>
      <article><span>BASE SYSTEM</span><h3>Emergency Repair</h3><p>Restore 35 base HP up to the 150 HP cap.</p><button onClick={repair} disabled={g.coins<220||g.base>=150}>REPAIR • 220C</button></article>
    </section>

    <section className="oa-panel oa-td-board-panel">
      <div className="oa-td-hud"><span>COINS: <b>{g.coins}</b></span><span>ROUND: <b>{g.round} / 200</b></span><span>BASE HP: <b>{g.base}</b></span><span>{g.paused?'PAUSED':g.running?'WAVE ACTIVE':'BUILD PHASE'}</span></div>
      <div className="oa-mobile-only oa-td-mobile-command">
        <div className="oa-td-mobile-actions">
          <button onClick={startWave} disabled={g.running||g.base<=0||g.completed}>{g.running?'WAVE LIVE':'START'}</button>
          <button onClick={()=>setG(s=>({...s,paused:!s.paused}))} disabled={!g.running}>{g.paused?'RESUME':'PAUSE'}</button>
          <button onClick={()=>setG(s=>({...s,speed:s.speed===1?2:1}))}>{g.speed}×</button>
          <button onClick={pulse} disabled={!pulseReady||!g.running}>{pulseReady?'PULSE':'COOL'}</button>
          <button onClick={repair} disabled={g.coins<220||g.base>=150}>REPAIR</button>
        </div>
        <div className="oa-td-mobile-towers">
          {TOWERS.map((t,i)=><button className={g.selected===i?'active':''} key={'mobile-'+t.name} onClick={()=>setG(s=>({...s,selected:i}))}><b>{t.mark}</b><span>{t.name}</span><small>{t.cost}C</small></button>)}
        </div>
        {selectedPlaced&&<div className="oa-td-mobile-selected">
          <div><span>SELECTED</span><b>{selectedPlacedTower.name} L{selectedPlaced.level}</b><small>DMG {selectedStats.damage.toFixed(1)} • RNG {Math.round(selectedStats.range*100)}</small></div>
          <button onClick={upgradeSelected} disabled={selectedPlaced.level>=8||g.coins<upgradeCost(selectedPlacedTower,selectedPlaced.level)}>{selectedPlaced.level>=8?'MAX':'UP '+upgradeCost(selectedPlacedTower,selectedPlaced.level)+'C'}</button>
          <button onClick={sellSelected}>SELL</button>
        </div>}
      </div>
      <div className="oa-td-board">
        <div className="oa-td-battle-label"><span>{g.paused?'PAUSED':g.running?'WAVE ACTIVE':'BUILD PHASE'}</span><b>WAVE {g.round}</b></div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="pathGlow"><feGaussianBlur stdDeviation="1.2" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <linearGradient id="tdTerrain" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#173b3a"/><stop offset="100%" stopColor="#081826"/></linearGradient>
            <linearGradient id="tdRoad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#725d49"/><stop offset="100%" stopColor="#3f3540"/></linearGradient>
            <radialGradient id="tdBaseGlow"><stop offset="0%" stopColor="#c5ffff"/><stop offset="100%" stopColor="#4de7f4" stopOpacity=".08"/></radialGradient>
          </defs>
          <rect width="100" height="100" fill="url(#tdTerrain)"/>
          {[12,27,48,69,88].map((x,i)=><g key={'terrain-'+x} opacity=".3"><circle cx={x} cy={18+(i%3)*24} r={4+(i%2)*2} fill="#1f5a45"/><circle cx={x+4} cy={20+(i%3)*24} r="2.8" fill="#2b7458"/></g>)}
          <polyline points={path.map(([x,y])=>`${x*100},${y*100}`).join(' ')} fill="none" stroke="#181720" strokeWidth="9" strokeLinejoin="round"/>
          <polyline points={path.map(([x,y])=>`${x*100},${y*100}`).join(' ')} fill="none" stroke="url(#tdRoad)" strokeWidth="6.4" strokeLinejoin="round"/>
          <polyline points={path.map(([x,y])=>`${x*100},${y*100}`).join(' ')} fill="none" stroke="rgba(140,225,242,.32)" strokeWidth=".65" filter="url(#pathGlow)" strokeDasharray="2 1.5" strokeLinejoin="round"/>
          <g transform="translate(4 78)"><circle r="4.6" fill="#35193f" stroke="#b56cff" strokeWidth=".8"/><circle r="2.2" fill="#d38cff"/><text x="-2.8" y="8" fill="#f1c9ff" fontSize="3.2">SPAWN</text></g>
          <g transform="translate(96 58)"><rect x="-4" y="-5" width="8" height="10" rx="1.3" fill="#102d46" stroke="#a9fbff" strokeWidth=".7"/><circle r="7" fill="url(#tdBaseGlow)" opacity=".28"/><text x="-8" y="11" fill="#d9ffff" fontSize="3.2">BASE</text></g>
          {selectedPlaced&&selectedStats&&<circle cx={nodes[g.selectedNode][0]*100} cy={nodes[g.selectedNode][1]*100} r={selectedStats.range*100} fill="rgba(98,234,246,.055)" stroke="rgba(98,234,246,.35)" strokeWidth=".45" strokeDasharray="1.4 1.2"/>}
          {nodes.map(([x,y],i)=><g key={i} onClick={()=>place(i)} className={g.selectedNode===i?'oa-node selected':'oa-node'}>
            <circle cx={x*100} cy={y*100} r="6.9" fill={g.placed[i]?'rgba(22,59,67,.92)':'rgba(8,20,34,.92)'} stroke={g.selectedNode===i?'#ffffff':'#62eaf6'} strokeWidth={g.placed[i]?'1':'.45'}/>
            {g.placed[i]?<><circle cx={x*100} cy={y*100} r="3.7" fill="#173a55" stroke="#b8fbff" strokeWidth=".5"/><rect x={x*100-.7} y={y*100-5.1} width="1.4" height="5" rx=".5" fill="#c4fbff"/><text x={x*100} y={y*100+1.25} textAnchor="middle" fill="#efffff" fontSize="3.6">{TOWERS[g.placed[i].type].mark}</text><text x={x*100} y={y*100+8.2} textAnchor="middle" fill="#8ddff0" fontSize="2.5">L{g.placed[i].level}</text></>:<text x={x*100} y={y*100+1.6} textAnchor="middle" fill="#8df4ff" fontSize="4.8">+</text>}
          </g>)}
          {g.enemies.filter(e=>e.t>=0).map(e=>{const [x,y]=lerpPath(e.t);const size=e.boss?2.8:e.elite?2.15:1.7;return <g key={e.id}>
            <circle cx={x*100} cy={y*100} r={size+1.1} fill={e.boss?'rgba(159,89,255,.16)':e.elite?'rgba(255,184,77,.13)':'rgba(230,246,255,.1)'}/>
            <circle cx={x*100} cy={y*100} r={size} fill={e.boss?'#9a63ff':e.elite?'#ffb84d':'#e8f4ff'} stroke="#061224" strokeWidth=".45"/>
            <rect x={x*100-2.6} y={y*100-4.2} width="5.2" height=".65" rx=".2" fill="#1a2847"/>
            <rect x={x*100-2.6} y={y*100-4.2} width={5.2*Math.max(0,e.hp/e.max)} height=".65" rx=".2" fill={e.boss?'#b277ff':e.elite?'#ffc45c':'#50e28c'}/>
          </g>})}
        </svg>
      </div>
    </section>

    <section className="oa-panel oa-td-loadout-panel">
      <span className="oa-kicker">TOWER LOADOUT</span><p>10 TOWER ROSTER • 8 LEVELS EACH</p>
      <div className="oa-tower-roster">{TOWERS.map((t,i)=><button className={g.selected===i?'active':''} key={t.name} onClick={()=>setG(s=>({...s,selected:i}))}><b>{t.name}</b><span>{t.cost}C</span><small>DMG {t.damage} • RNG {Math.round(t.range*100)}</small></button>)}</div>
      <div className="oa-subpanel"><b>BUILD SELECTED: {selected.name}</b><p>Tap an empty + node to place the selected tower. Tap an existing tower to open its upgrade controls.</p></div>
    </section>

    {selectedPlaced&&<section className="oa-panel oa-td-upgrade-panel">
      <div><span className="oa-kicker">SELECTED TOWER</span><h2>{selectedPlacedTower.name} • LEVEL {selectedPlaced.level}</h2><p>Damage {selectedStats.damage.toFixed(1)} • Range {Math.round(selectedStats.range*100)} • Rate {selectedStats.rate.toFixed(1)}</p></div>
      <div className="oa-td-upgrade-actions">
        <button onClick={upgradeSelected} disabled={selectedPlaced.level>=8||g.coins<upgradeCost(selectedPlacedTower,selectedPlaced.level)}>{selectedPlaced.level>=8?'MAX LEVEL':'UPGRADE • '+upgradeCost(selectedPlacedTower,selectedPlaced.level)+'C'}</button>
        <button onClick={sellSelected}>SELL TOWER</button>
      </div>
    </section>}
  </OriginalFrame>
}
