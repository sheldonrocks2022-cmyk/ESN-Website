import { useMemo, useState } from 'react'
import OriginalFrame from './OriginalFrame'
import { money, useSharedCoins } from './shared'

function makeMineSet(count){
  const set=new Set()
  while(set.size<count)set.add(Math.floor(Math.random()*25))
  return set
}
function calcMultiplier(mines,safe){
  const base=1+(mines/25)*.72
  return +(Math.pow(base,safe)*1.01).toFixed(2)
}

export default function MinesGame(){
  const {wallet,add,spend}=useSharedCoins()
  const [wager,setWager]=useState(10)
  const [mineCount,setMineCount]=useState(3)
  const [round,setRound]=useState(null)
  const [message,setMessage]=useState('Set wager and mine count, then begin your tile-reveal risk round.')

  const potential=round?Math.floor(wager*round.multiplier):0
  const status=round?'ACTIVE':'WAITING'
  const board=useMemo(()=>Array.from({length:25},(_,i)=>i),[])

  const start=()=>{
    if(!spend(wager)){setMessage('Not enough ES Coins for that wager.');return}
    setRound({mines:makeMineSet(mineCount),safe:new Set(),multiplier:1})
    setMessage('Round active. Reveal safe tiles or cash out.')
  }
  const pick=i=>{
    if(!round||round.safe.has(i))return
    if(round.mines.has(i)){
      setRound(null);setMessage(`Mine hit. You lost ${money(wager)} ES Coins.`);return
    }
    const safe=new Set(round.safe);safe.add(i)
    const multiplier=calcMultiplier(mineCount,safe.size)
    setRound({...round,safe,multiplier})
    setMessage(`Safe pick ${safe.size}. Live multiplier x${multiplier.toFixed(2)}.`)
  }
  const cashOut=()=>{
    if(!round||round.safe.size===0)return
    const win=Math.floor(wager*round.multiplier)
    add(win);setRound(null);setMessage(`Cashed out ${money(win)} ES Coins.`)
  }

  return <OriginalFrame title="ES Mines" subtitle="Virtual ES Coins • tile reveal • live risk multiplier">
    <section className="oa-glow-panel oa-balance-card">
      <div className="oa-coin-icon">ES</div><div><span>ES COINS</span><b>{money(wallet.coins)}</b></div>
    </section>

    <section className="oa-glow-panel oa-discord-card">
      <span className="oa-kicker">DISCORD JOIN BONUS</span>
      <h2>ESN SERVICE BONUS</h2>
      <p>Join the official ES Network Discord for community support and service ordering.</p>
      <a href="https://discord.gg/3gxA66KZ8" target="_blank" rel="noreferrer">JOIN & OPEN TICKET</a>
    </section>

    <section className="oa-panel">
      <div className="oa-status-chip">{status}</div>
      <p>{message}</p>
      <div className="oa-mines-stats">
        <div><span>WAGER</span><b>{round?wager:0}</b></div>
        <div><span>MINES</span><b>{round?mineCount:0}</b></div>
        <div><span>SAFE PICKS</span><b>{round?round.safe.size:0}</b></div>
        <div><span>MULTIPLIER</span><b>X{round?round.multiplier.toFixed(2):'1.00'}</b></div>
        <div><span>POTENTIAL</span><b>{potential}</b></div>
        <div><span>BALANCE</span><b>{money(wallet.coins)}</b></div>
      </div>
    </section>

    <section className="oa-panel">
      <div className="oa-mines-board">
        {board.map(i=>{
          const opened=round?.safe.has(i)
          return <button key={i} className={opened?'safe':''} onClick={()=>pick(i)} disabled={!round||opened}>{opened?'◇':'?'}</button>
        })}
      </div>
    </section>

    <section className="oa-panel">
      <span className="oa-kicker">SET WAGER</span>
      <div className="oa-choice-row">{[10,25,50,100,250].map(v=><button key={v} className={wager===v?'active':''} disabled={!!round} onClick={()=>setWager(v)}>{v}</button>)}</div>
      <span className="oa-kicker oa-spaced">CHOOSE MINE COUNT</span>
      <div className="oa-choice-row">{[3,5,7,10].map(v=><button key={v} className={mineCount===v?'active':''} disabled={!!round} onClick={()=>setMineCount(v)}>{v}</button>)}</div>
      <button className="oa-primary-wide" onClick={start} disabled={!!round}>START GAME</button>
      <button className="oa-cash-wide" onClick={cashOut} disabled={!round||round.safe.size===0}>CASH OUT</button>
      <div className="oa-subpanel"><span>CURRENT ROUND SUMMARY</span><p>Your wager multiplied by live risk scaling as safe picks stack during an active round.</p></div>
    </section>
  </OriginalFrame>
}
