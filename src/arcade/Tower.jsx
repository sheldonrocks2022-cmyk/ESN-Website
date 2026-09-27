import { useMemo, useState } from 'react'
import OriginalFrame from './OriginalFrame'
import { money, useSharedCoins } from './shared'

const floors=Array.from({length:122},(_,i)=>({floor:i+1,mult:+(1+i*.055).toFixed(2)}))

export default function TowerGame(){
  const {wallet,add,spend}=useSharedCoins()
  const [wager,setWager]=useState(25)
  const [run,setRun]=useState(null)
  const [last,setLast]=useState('Pick a wager and begin a new tower run.')

  const currentFloor=run?.floor||1
  const multiplier=floors[Math.min(121,currentFloor-1)].mult
  const potential=Math.floor(wager*multiplier)

  const newGame=()=>{
    if(!spend(wager)){setLast('Not enough shared ES Coins.');return}
    setRun({floor:1,danger:Math.floor(Math.random()*3),picked:null,busted:false})
    setLast(`Run started with ${wager} ES Coins.`)
  }
  const choose=i=>{
    if(!run||run.picked!==null||run.busted)return
    if(i===run.danger){
      setRun({...run,picked:i,busted:true})
      setLast(`Danger door on Floor ${run.floor}. You lost ${wager} ES Coins.`)
      return
    }
    const nextFloor=Math.min(122,run.floor+1)
    setRun({floor:nextFloor,danger:Math.floor(Math.random()*3),picked:null,busted:false})
    setLast(`Safe path. Advanced to Floor ${nextFloor}.`)
  }
  const cashOut=()=>{
    if(!run||run.busted)return
    add(potential);setRun(null);setLast(`Cashed out ${money(potential)} ES Coins.`)
  }

  return <OriginalFrame title="ES Tower" subtitle="122 floors • three doors • shared ES Coins">
    <section className="oa-panel oa-tower-summary">
      <div className="oa-tower-stats">
        <div><span>CURRENT FLOOR</span><b>{run?run.floor:1}</b></div>
        <div><span>MULTIPLIER</span><b>{multiplier.toFixed(2)}X</b></div>
        <div><span>POTENTIAL WINNINGS</span><b>{run?money(potential):wager}</b></div>
        <div><span>CURRENT WAGER</span><b>{wager}</b></div>
        <div><span>SHARED ES COINS</span><b>{money(wallet.coins)}</b></div>
      </div>
      {!run&&<><span className="oa-kicker oa-spaced">SET WAGER</span><div className="oa-choice-row">{[10,25,50,100,250].map(v=><button key={v} className={wager===v?'active':''} onClick={()=>setWager(v)}>{v}</button>)}</div></>}
    </section>

    <section className="oa-panel oa-tower-ladder-panel">
      <div className="oa-section-head"><div><span className="oa-kicker">FLOOR REWARD LADDER</span></div><div className="oa-pill">122 FLOORS</div></div>
      <div className="oa-ladder">
        {floors.slice(0,16).map(f=><div key={f.floor} className={run&&f.floor===run.floor?'active':''}><span>Floor {f.floor}</span><b>{f.mult.toFixed(2)}X</b></div>)}
      </div>
      <p>SCROLL TO VIEW ALL FLOORS. CURRENT FLOOR STAYS HIGHLIGHTED.</p>
    </section>

    <section className="oa-panel oa-tower-door-panel">
      <div className="oa-section-head"><h3>Pick one of three doors on Floor {run?.floor||1}</h3>{run?.busted&&<span className="oa-busted">BUSTED</span>}</div>
      <div className="oa-doors">
        {[0,1,2].map(i=>{
          let state='Closed'
          let cls=''
          if(run?.picked===i&&run.busted){state='Danger Door';cls='danger'}
          return <button key={i} className={cls} onClick={()=>choose(i)} disabled={!run||run.picked!==null||run.busted}><span>DOOR {i+1}</span><b>{state}</b></button>
        })}
      </div>
      <button className="oa-primary-wide" onClick={cashOut} disabled={!run||run.busted}>CASH OUT</button>
      <button className="oa-secondary-wide" onClick={newGame}>NEW GAME</button>
      <div className="oa-subpanel"><p>{last}</p></div>
    </section>
  </OriginalFrame>
}
