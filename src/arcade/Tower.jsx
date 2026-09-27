import { useMemo, useState } from 'react'
import OriginalFrame from './OriginalFrame'
import { arcadeFeedback, money, useArcadeProgress, usePersistent, useSharedCoins } from './shared'

const floors=Array.from({length:122},(_,i)=>{
  const floor=i+1
  const hazard=Math.floor(floor/10)
  return {floor,mult:+((1+i*.06)*(1+hazard*.035)).toFixed(2),hazards:floor%10===0?2:1}
})

function dangerDoors(count){
  const set=new Set()
  while(set.size<count)set.add(Math.floor(Math.random()*3))
  return set
}

const defaultStats={runs:0,cashouts:0,busts:0,bestFloor:1,bestPayout:0,totalPaid:0,bestStreak:0,currentStreak:0}

export default function TowerGame(){
  const {wallet,add,spend}=useSharedCoins()
  const arcade=useArcadeProgress()
  const [stats,setStats]=usePersistent('esn_tower_stats_v2',defaultStats)
  const [wager,setWager]=useState(25)
  const [run,setRun]=useState(null)
  const [last,setLast]=useState('Pick a wager and begin a new tower run.')

  const currentFloor=run?.floor||1
  const floorData=floors[Math.min(121,currentFloor-1)]
  const multiplier=floorData.mult
  const potential=Math.floor(wager*multiplier)
  const successRate=Math.round(((3-floorData.hazards)/3)*100)

  const newGame=()=>{
    if(!spend(wager)){setLast('Not enough shared ES Coins.');return}
    const first=floors[0]
    arcadeFeedback('power')
    setRun({floor:1,dangers:dangerDoors(first.hazards),picked:null,busted:false,shield:0,safeChain:0})
    setStats(s=>({...s,runs:s.runs+1}))
    setLast(`Run started with ${wager} ES Coins.`)
  }

  const choose=i=>{
    if(!run||run.picked!==null||run.busted)return
    if(run.dangers.has(i)){
      if(run.shield>0){
        arcadeFeedback('safe')
    const nextFloor=Math.min(122,run.floor+1)
        const nextData=floors[nextFloor-1]
        setRun({...run,floor:nextFloor,dangers:dangerDoors(nextData.hazards),picked:null,shield:run.shield-1,safeChain:0})
        setLast(`Shield absorbed a danger door on Floor ${run.floor}. Advanced to Floor ${nextFloor}.`)
        arcade.gainXp(30,'Tower shield save')
        return
      }
      arcadeFeedback('danger')
      setRun({...run,picked:i,busted:true})
      setStats(s=>({...s,busts:s.busts+1,currentStreak:0,bestFloor:Math.max(s.bestFloor||1,run.floor)}))
      arcade.gainXp(Math.max(5,run.floor*2),'Tower run ended')
      setLast(`Danger door on Floor ${run.floor}. You lost ${wager} ES Coins.`)
      return
    }

    const nextFloor=Math.min(122,run.floor+1)
    const earnedShield=nextFloor%15===0&&run.shield<1
    const nextData=floors[nextFloor-1]
    const nextChain=(run.safeChain||0)+1
    setRun({
      floor:nextFloor,
      dangers:dangerDoors(nextData.hazards),
      picked:null,busted:false,
      shield:earnedShield?1:run.shield,
      safeChain:nextChain,
    })
    setStats(s=>({...s,bestFloor:Math.max(s.bestFloor||1,nextFloor)}))
    arcade.track('towerFloors',1,nextFloor%10===0?35:5,'Tower safe floor')
    if(nextFloor>=10)arcade.unlock('tower-floor-10','Tower: Reach Floor 10',150)
    if(nextFloor>=50)arcade.unlock('tower-floor-50','Tower: Reach Floor 50',300)
    if(nextFloor>=100)arcade.unlock('tower-floor-100','Tower: Reach Floor 100',500)
    setLast(earnedShield?`Safe path. Floor ${nextFloor} reached — checkpoint shield acquired.`:`Safe path. Advanced to Floor ${nextFloor}.`)
  }

  const cashOut=()=>{
    if(!run||run.busted)return
    add(potential)
    arcadeFeedback('win')
    const streak=(stats.currentStreak||0)+1
    setStats(s=>({
      ...s,cashouts:s.cashouts+1,totalPaid:s.totalPaid+potential,
      bestPayout:Math.max(s.bestPayout||0,potential),
      bestFloor:Math.max(s.bestFloor||1,run.floor),
      currentStreak:streak,bestStreak:Math.max(s.bestStreak||0,streak),
    }))
    arcade.track('towerCashouts',1,40+run.floor*3,'Tower cash out')
    if(streak>=3)arcade.unlock('tower-cash-streak','Tower: 3 Cash-Out Streak',220)
    setRun(null)
    setLast(`Cashed out ${money(potential)} ES Coins from Floor ${currentFloor}.`)
  }

  const ladderWindow=useMemo(()=>{
    if(!run)return floors
    const start=Math.max(0,run.floor-7)
    const end=Math.min(floors.length,start+18)
    return floors.slice(start,end)
  },[run])

  return <OriginalFrame title="ES Tower" subtitle="122 floors • hazard stages • shields • persistent run records">
    <section className="oa-panel oa-tower-career">
      <div><span>RUNS</span><b>{stats.runs}</b></div>
      <div><span>BEST FLOOR</span><b>{stats.bestFloor}</b></div>
      <div><span>CASH OUTS</span><b>{stats.cashouts}</b></div>
      <div><span>BEST PAYOUT</span><b>{money(stats.bestPayout)} ES</b></div>
      <div><span>WIN STREAK</span><b>{stats.currentStreak} / {stats.bestStreak}</b></div>
      <div><span>SHARED COINS</span><b>{money(wallet.coins)}</b></div>
    </section>

    <section className="oa-panel oa-tower-summary">
      <div className="oa-tower-stats">
        <div><span>CURRENT FLOOR</span><b>{run?run.floor:1}</b></div>
        <div><span>MULTIPLIER</span><b>{multiplier.toFixed(2)}X</b></div>
        <div><span>POTENTIAL WINNINGS</span><b>{run?money(potential):wager}</b></div>
        <div><span>HAZARD DOORS</span><b>{floorData.hazards} / 3</b></div>
        <div><span>SAFE ODDS</span><b>{successRate}%</b></div>
        <div><span>SHIELD</span><b>{run?.shield?'READY':'—'}</b></div>
      </div>
      {!run&&<><span className="oa-kicker oa-spaced">SET WAGER</span><div className="oa-choice-row">{[10,25,50,100,250].map(v=><button key={v} className={wager===v?'active':''} onClick={()=>setWager(v)}>{v}</button>)}</div></>}
    </section>

    <section className="oa-panel oa-tower-ladder-panel">
      <div className="oa-section-head"><div><span className="oa-kicker">FLOOR REWARD LADDER</span><p>Every 10th floor becomes a double-hazard stage. Every 15th reached floor grants one checkpoint shield.</p></div><div className="oa-pill">122 FLOORS</div></div>
      <div className="oa-ladder">
        {ladderWindow.map(f=><div key={f.floor} className={(run&&f.floor===run.floor?'active ':'')+(f.hazards===2?'hazard':'')}><span>Floor {f.floor}{f.hazards===2?' • HAZARD':''}</span><b>{f.mult.toFixed(2)}X</b></div>)}
      </div>
      {!run&&<p>Full 122-floor ladder becomes focused around your current run after starting.</p>}
    </section>

    <section className="oa-panel oa-tower-door-panel">
      <div className="oa-section-head"><h3>Pick one of three doors on Floor {run?.floor||1}</h3>{run?.busted&&<span className="oa-busted">BUSTED</span>}</div>
      {run&&<div className="oa-tower-run-strip"><span>SAFE CHAIN <b>{run.safeChain||0}</b></span><span>SHIELD <b>{run.shield?'READY':'EMPTY'}</b></span><span>HAZARD <b>{floorData.hazards===2?'DOUBLE':'STANDARD'}</b></span></div>}
      <div className="oa-doors">
        {[0,1,2].map(i=>{
          let state='Closed'
          let cls=''
          if(run?.picked===i&&run.busted){state='Danger Door';cls='danger'}
          return <button key={i} className={cls} onClick={()=>choose(i)} disabled={!run||run.picked!==null||run.busted}><span>DOOR {i+1}</span><b>{state}</b></button>
        })}
      </div>
      <div className="oa-mobile-only oa-tower-mobile-live">
        <span>FLOOR <b>{run?.floor||1}</b></span>
        <span>WIN <b>{run?money(potential):wager}</b></span>
        <span>SAFE <b>{successRate}%</b></span>
        <span>SHIELD <b>{run?.shield?'YES':'NO'}</b></span>
      </div>
      <button className="oa-primary-wide" onClick={cashOut} disabled={!run||run.busted}>CASH OUT {run?money(potential)+' ES':''}</button>
      <button className="oa-secondary-wide" onClick={newGame}>{run?'START NEW RUN':'NEW GAME'}</button>
      <div className="oa-subpanel"><p>{last}</p></div>
    </section>
  </OriginalFrame>
}
