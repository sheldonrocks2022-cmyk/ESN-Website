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
    setG(s=>({...s,coins:s.coins-tower.cost,selectedNode:node,placed:{...s.placed,[node]:{type:s.selected,cool:0,level:1,aim:-18,targetId:null,shot:null}}}))
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
    // Fixed render cadence prevents the 2× mode from doubling React render frequency on phones.
    // Speed now changes simulation distance rather than making the UI timer itself run twice as often.
    const tick=64
    const step=tick/80
    const t=setInterval(()=>setG(s=>{
      let placed={...s.placed}
      let enemies=s.enemies.map(e=>({...e,t:e.t+.0045*s.speed*step*(e.boss?.62:e.elite?.82:1)}))

      for(const [nodeKey,p] of Object.entries(placed)){
        const node=nodes[+nodeKey],tower=TOWERS[p.type]
        const stats=towerStats(tower,p.level)
        const cool=Math.max(0,(p.cool||0)-s.speed*step)
        let target=-1,best=-1

        enemies.forEach((e,i)=>{
          if(e.hp<=0||e.t<0)return
          const [x,y]=lerpPath(e.t)
          const d=Math.hypot(x-node[0],y-node[1])
          if(d<stats.range&&e.t>best){best=e.t;target=i}
        })

        let updated={
          ...p,
          cool,
          shot:p.shot&&p.shot.life>1?{...p.shot,life:p.shot.life-1}:null,
        }

        if(target>=0){
          const enemy=enemies[target]
          const [ex,ey]=lerpPath(enemy.t)
          const aim=Math.atan2(ey-node[1],ex-node[0])*180/Math.PI
          updated.aim=aim
          updated.targetId=enemy.id

          if(cool<=0){
            const bossBonus=enemy.boss&&tower.name==='BOSS KILLER'?2.6:1
            const voidBonus=tower.name==='VOID'&&enemy.elite?1.5:1
            enemies[target]={...enemy,hp:enemy.hp-stats.damage*bossBonus*voidBonus}
            updated.cool=Math.max(1,Math.floor(12/stats.rate))
            updated.shot={x:ex,y:ey,life:3,targetId:enemy.id}
          }
        }else{
          updated.targetId=null
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
      <div className={'oa-td-board '+(g.running&&!g.paused?'is-live ':'')+(g.round%10===0?'is-boss':'')}>
        <div className="oa-td-battle-label"><span>{g.paused?'PAUSED':g.running?'WAVE ACTIVE':'BUILD PHASE'}</span><b>WAVE {g.round}</b></div>
        <svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="pathGlow"><feGaussianBlur stdDeviation="1.2" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <linearGradient id="tdTerrain" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#173b3a"/><stop offset="100%" stopColor="#081826"/></linearGradient>
            <linearGradient id="tdRoad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#725d49"/><stop offset="100%" stopColor="#3f3540"/></linearGradient>
            <radialGradient id="tdBaseGlow"><stop offset="0%" stopColor="#c5ffff"/><stop offset="100%" stopColor="#4de7f4" stopOpacity=".08"/></radialGradient>
          </defs>
          <rect width="160" height="100" fill="url(#tdTerrain)"/>
          <path d="M0 18 C30 8 55 24 82 12 S132 20 160 8 L160 0 L0 0 Z" fill="rgba(105,160,180,.07)"/>
          <path d="M0 88 C28 76 52 92 82 83 S130 89 160 76 L160 100 L0 100 Z" fill="rgba(1,8,14,.34)"/>
          {[20,54,92,128,148].map((x,i)=><g key={'rock-'+x} opacity=".32"><ellipse cx={x} cy={72-(i%2)*34} rx="5.5" ry="2.1" fill="rgba(0,0,0,.26)"/><path d={`M${x-3.5} ${70-(i%2)*34} L${x-.7} ${65-(i%2)*34} L${x+3.9} ${69-(i%2)*34} L${x+2.3} ${73-(i%2)*34} L${x-2.7} ${73-(i%2)*34} Z`} fill="#29453f"/></g>)}
          {[18,43,77,111,141].map((x,i)=><g key={'terrain-'+x} opacity=".28"><circle cx={x} cy={18+(i%3)*24} r={4+(i%2)*2} fill="#1f5a45"/><circle cx={x+4} cy={20+(i%3)*24} r="2.8" fill="#2b7458"/></g>)}
          <polyline points={path.map(([x,y])=>`${x*160},${y*100}`).join(' ')} fill="none" stroke="#181720" strokeWidth="9" strokeLinejoin="round"/>
          <polyline points={path.map(([x,y])=>`${x*160},${y*100}`).join(' ')} fill="none" stroke="url(#tdRoad)" strokeWidth="6.4" strokeLinejoin="round"/>
          <polyline points={path.map(([x,y])=>`${x*160},${y*100}`).join(' ')} fill="none" stroke="rgba(140,225,242,.32)" strokeWidth=".65" filter="url(#pathGlow)" strokeDasharray="2 1.5" strokeLinejoin="round"/>
          <g transform="translate(6.4 78)"><circle r="4.6" fill="#35193f" stroke="#b56cff" strokeWidth=".8"/><circle r="2.2" fill="#d38cff"/><text x="-2.8" y="8" fill="#f1c9ff" fontSize="3.2">SPAWN</text></g>
          <g transform="translate(153.6 58)"><rect x="-4" y="-5" width="8" height="10" rx="1.3" fill="#102d46" stroke="#a9fbff" strokeWidth=".7"/><circle r="7" fill="url(#tdBaseGlow)" opacity=".28"/><text x="-8" y="11" fill="#d9ffff" fontSize="3.2">BASE</text></g>
          {selectedPlaced&&selectedStats&&<ellipse cx={nodes[g.selectedNode][0]*160} cy={nodes[g.selectedNode][1]*100} rx={selectedStats.range*160} ry={selectedStats.range*100} fill="rgba(98,234,246,.05)" stroke="rgba(98,234,246,.28)" strokeWidth=".45" strokeDasharray="1.4 1.2"/>}
          {nodes.map(([x,y],i)=>{
            const placed=g.placed[i]
            const tower=placed?TOWERS[placed.type]:null
            const firing=Boolean(placed?.shot?.life>0)
            const tx=x*160,ty=y*100
            const logicalAim=Number.isFinite(placed?.aim)?placed.aim:-18
            const aim=Math.atan2(Math.sin(logicalAim*Math.PI/180)*100,Math.cos(logicalAim*Math.PI/180)*160)*180/Math.PI
            const aimRad=aim*Math.PI/180
            const barrelLength=tower?.name==='SNIPER'?7.4:tower?.name==='CANNON'?5.6:tower?.name==='BOSS KILLER'?6.8:tower?.name==='VOID'?6.3:5.2
            const barrelWidth=tower?.name==='CANNON'?1.35:tower?.name==='TANK'?1.25:.82
            const muzzleX=tx+Math.cos(aimRad)*barrelLength
            const muzzleY=ty+Math.sin(aimRad)*barrelLength
            const bodyColor=tower?.name==='VOID'?'#3b286d':tower?.name==='CANNON'?'#4a3826':tower?.name==='TANK'?'#334757':'#174657'
            return <g key={i} onClick={()=>place(i)} className={g.selectedNode===i?'oa-node selected':'oa-node'}>
              <circle cx={tx} cy={ty} r="8.2" fill="transparent" className="oa-td-hit-area"/>
              <ellipse cx={tx} cy={ty+4.2} rx="4.9" ry="1.8" fill="rgba(0,0,0,.34)"/>
              <circle cx={tx} cy={ty} r="5.15" fill={placed?'rgba(13,40,48,.97)':'rgba(8,20,34,.92)'} stroke={g.selectedNode===i?'#ffffff':'#62eaf6'} strokeWidth={placed?'.72':'.38'}/>
              {placed?<>
                {firing&&<g className="oa-td-shot">
                  <line x1={muzzleX} y1={muzzleY} x2={placed.shot.x*160} y2={placed.shot.y*100} stroke={tower.name==='VOID'?'#b88aff':'#d9fdff'} strokeWidth={tower.name==='SNIPER'?'.34':'.52'} strokeLinecap="round"/>
                  <circle cx={placed.shot.x*160} cy={placed.shot.y*100} r={tower.name==='CANNON'?'2.2':'1.35'} fill={tower.name==='VOID'?'rgba(174,117,255,.34)':'rgba(132,245,255,.3)'}/>
                </g>}
                <g className={firing?'oa-td-turret firing':'oa-td-turret'} transform={`translate(${tx} ${ty})`}>
                  <circle cx="0" cy="1.2" r="4.4" fill="#0b1b29" stroke="#507d8d" strokeWidth=".42"/>
                  <circle cx="0" cy=".8" r="3.35" fill={bodyColor} stroke="#b8edf5" strokeWidth=".34"/>
                  <path d="M-3.2 2.8 L-4.45 4.1 M3.2 2.8 L4.45 4.1" stroke="#5e7f8f" strokeWidth=".72" strokeLinecap="round"/>
                  <g className="oa-td-turret-head" transform={`rotate(${aim} 0 0)`}>
                    <rect x="-1.25" y={-barrelWidth/2} width={barrelLength+1.25} height={barrelWidth} rx=".42" fill={tower.name==='VOID'?'#9270e8':'#b8dbe3'} stroke="#edfefe" strokeWidth=".2"/>
                    {['RAPID','RAPID FIRE','FURY'].includes(tower.name)&&<rect x=".2" y={barrelWidth*.65} width={barrelLength*.82} height=".48" rx=".2" fill="#81b9c7"/>}
                    <rect x="-2.05" y="-1.65" width="3.7" height="3.3" rx="1" fill={bodyColor} stroke="#d0f7fb" strokeWidth=".28"/>
                    <circle cx="-.25" cy="0" r=".76" fill={tower.name==='VOID'?'#aa7bff':'#7cf5ff'} stroke="#eaffff" strokeWidth=".18"/>
                    {tower.name==='SNIPER'&&<rect x="-.45" y="-2.28" width="3.05" height=".46" rx=".2" fill="#6fd8e8"/>}
                    {firing&&<g className="oa-td-muzzle" transform={`translate(${barrelLength} 0)`}>
                      <circle r="1.65" fill="rgba(166,248,255,.25)"/>
                      <circle r=".72" fill="#ffffff"/>
                      <path d="M0 0 L2.7 0 M0 0 L1.75 -1.35 M0 0 L1.75 1.35" stroke="#dfffff" strokeWidth=".35" strokeLinecap="round"/>
                    </g>}
                  </g>
                  <text x="0" y="7" textAnchor="middle" fill="#93e9f4" fontSize="2.35">L{placed.level}</text>
                </g>
              </>:<text x={tx} y={ty+1.35} textAnchor="middle" fill="#8df4ff" fontSize="3.8">+</text>}
            </g>
          })}
          {g.enemies.filter(e=>e.t>=0).map(e=>{
            const [x,y]=lerpPath(e.t),cx=x*160,cy=y*100
            const size=e.boss?3.2:e.elite?2.45:1.9
            const body=e.boss?'#7651c9':e.elite?'#d98c2f':'#ced8df'
            return <g key={e.id} className={e.boss?'oa-td-enemy boss':e.elite?'oa-td-enemy elite':'oa-td-enemy'}>
              <ellipse cx={cx} cy={cy+size+1.2} rx={size*1.15} ry={size*.5} fill="rgba(0,0,0,.28)"/>
              <circle cx={cx} cy={cy} r={size+1.4} fill={e.boss?'rgba(151,89,255,.13)':e.elite?'rgba(255,184,77,.12)':'rgba(220,244,255,.07)'}/>
              <path d={`M${cx} ${cy-size} L${cx+size*.9} ${cy-size*.2} L${cx+size*.72} ${cy+size} L${cx-size*.72} ${cy+size} L${cx-size*.9} ${cy-size*.2} Z`} fill={body} stroke="#07111f" strokeWidth=".45"/>
              <rect x={cx-size*.55} y={cy-size*.15} width={size*1.1} height={size*.38} rx=".22" fill="#101a27"/>
              <circle cx={cx-size*.24} cy={cy+.02} r=".18" fill={e.boss?'#dfc6ff':'#8ff7ff'}/><circle cx={cx+size*.24} cy={cy+.02} r=".18" fill={e.boss?'#dfc6ff':'#8ff7ff'}/>
              <rect x={cx-2.8} y={cy-size-2.2} width="5.6" height=".72" rx=".22" fill="#14243b"/>
              <rect x={cx-2.8} y={cy-size-2.2} width={5.6*Math.max(0,e.hp/e.max)} height=".72" rx=".22" fill={e.boss?'#b277ff':e.elite?'#ffc45c':'#50e28c'}/>
            </g>
          })}
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
