import { useMemo, useState } from 'react'
import OriginalFrame from './OriginalFrame'
import { arcadeFeedback, money, useArcadeProgress, usePersistent, useSharedCoins } from './shared'

function makeMineSet(count){
  const set=new Set()
  while(set.size<count)set.add(Math.floor(Math.random()*25))
  return set
}

function calcMultiplier(mines,safe){
  if(safe<=0)return 1
  let probability=1
  for(let i=0;i<safe;i++)probability*=(25-mines-i)/(25-i)
  return +Math.max(1,0.97/Math.max(.000001,probability)).toFixed(2)
}

const defaultStats={
  games:0,wins:0,losses:0,totalWagered:0,totalPaid:0,bestMultiplier:1,bestPayout:0,
  streak:0,bestStreak:0,safeTiles:0,history:[]
}

export default function MinesGame(){
  const {wallet,add,spend}=useSharedCoins()
  const arcade=useArcadeProgress()
  const [stats,setStats]=usePersistent('esn_mines_stats_v2',defaultStats)
  const [wager,setWager]=useState(10)
  const [mineCount,setMineCount]=useState(3)
  const [round,setRound]=useState(null)
  const [lastBoard,setLastBoard]=useState(null)
  const [message,setMessage]=useState('Set wager and mine count, then begin your tile-reveal risk round.')

  const potential=round?Math.floor(wager*round.multiplier):0
  const status=round?'ACTIVE':'WAITING'
  const board=useMemo(()=>Array.from({length:25},(_,i)=>i),[])
  const risk=round?Math.min(100,Math.round((mineCount/25)*70+(round.safe.size/(25-mineCount))*30)):Math.round((mineCount/25)*100)
  const winRate=stats.games?Math.round(stats.wins/stats.games*100):0

  const addHistory=(entry)=>setStats(s=>({...s,history:[entry,...(s.history||[])].slice(0,8)}))

  const start=()=>{
    if(!spend(wager)){setMessage('Not enough ES Coins for that wager.');return}
    arcadeFeedback('tap')
    setRound({mines:makeMineSet(mineCount),safe:new Set(),multiplier:1,startedAt:Date.now()})
    setLastBoard(null)
    setStats(s=>({...s,games:s.games+1,totalWagered:s.totalWagered+wager}))
    setMessage('Round active. Reveal safe tiles or cash out.')
  }

  const pick=i=>{
    if(!round||round.safe.has(i))return
    if(round.mines.has(i)){
      arcadeFeedback('danger')
      setLastBoard({mines:new Set(round.mines),safe:new Set(round.safe),hit:i})
      setRound(null)
      setStats(s=>({...s,losses:s.losses+1,streak:0,history:[{result:'MINE',wager,payout:0,mult:0,safe:round.safe.size,at:Date.now()},...(s.history||[])].slice(0,8)}))
      arcade.gainXp(Math.max(2,round.safe.size*2),'Mines run ended')
      setMessage(`Mine hit after ${round.safe.size} safe picks. You lost ${money(wager)} ES Coins.`)
      return
    }

    const safe=new Set(round.safe)
    safe.add(i)
    arcadeFeedback('safe')
    const multiplier=calcMultiplier(mineCount,safe.size)
    setRound({...round,safe,multiplier})
    setStats(s=>({...s,safeTiles:s.safeTiles+1,bestMultiplier:Math.max(s.bestMultiplier||1,multiplier)}))
    arcade.track('minesSafe',1,safe.size%5===0?10:2,'Mines safe tile')
    if(safe.size>=10)arcade.unlock('mines-ten-safe','Mines: 10 Safe Tiles',180)
    setMessage(`Safe pick ${safe.size}. Live multiplier x${multiplier.toFixed(2)}.`)
  }

  const cashOut=()=>{
    if(!round||round.safe.size===0)return
    const win=Math.floor(wager*round.multiplier)
    const nextStreak=(stats.streak||0)+1
    add(win)
    arcadeFeedback('win')
    setLastBoard({mines:new Set(round.mines),safe:new Set(round.safe),hit:null})
    setRound(null)
    setStats(s=>({
      ...s,wins:s.wins+1,totalPaid:s.totalPaid+win,streak:nextStreak,
      bestStreak:Math.max(s.bestStreak||0,nextStreak),
      bestMultiplier:Math.max(s.bestMultiplier||1,round.multiplier),
      bestPayout:Math.max(s.bestPayout||0,win),
      history:[{result:'CASH',wager,payout:win,mult:round.multiplier,safe:round.safe.size,at:Date.now()},...(s.history||[])].slice(0,8),
    }))
    arcade.track('minesCashouts',1,25+round.safe.size*6,'Mines cash out')
    if(nextStreak>=3)arcade.unlock('mines-streak-3','Mines: 3 Win Streak',220)
    if(round.multiplier>=5)arcade.unlock('mines-5x','Mines: 5× Cash Out',250)
    setMessage(`Cashed out ${money(win)} ES Coins at x${round.multiplier.toFixed(2)}.`)
  }

  const visibleMines=lastBoard?.mines||new Set()
  const visibleSafe=lastBoard?.safe||new Set()

  return <OriginalFrame title="ES Mines" subtitle="Virtual ES Coins • persistent stats • risk history • live probability scaling">
    <section className="oa-glow-panel oa-balance-card">
      <div className="oa-coin-icon">ES</div><div><span>ES COINS</span><b>{money(wallet.coins)}</b></div>
    </section>

    <section className="oa-panel oa-mines-career">
      <div><span>ROUNDS</span><b>{stats.games}</b></div>
      <div><span>WIN RATE</span><b>{winRate}%</b></div>
      <div><span>WIN STREAK</span><b>{stats.streak} / BEST {stats.bestStreak}</b></div>
      <div><span>BEST MULTIPLIER</span><b>{(stats.bestMultiplier||1).toFixed(2)}×</b></div>
      <div><span>BEST PAYOUT</span><b>{money(stats.bestPayout)} ES</b></div>
      <div><span>SAFE TILES</span><b>{money(stats.safeTiles)}</b></div>
    </section>

    <section className="oa-panel oa-mines-status-panel">
      <div className="oa-status-chip">{status}</div>
      <p>{message}</p>
      <div className="oa-mines-stats">
        <div><span>WAGER</span><b>{round?wager:0}</b></div>
        <div><span>MINES</span><b>{round?mineCount:0}</b></div>
        <div><span>SAFE PICKS</span><b>{round?round.safe.size:0}</b></div>
        <div><span>MULTIPLIER</span><b>X{round?round.multiplier.toFixed(2):'1.00'}</b></div>
        <div><span>POTENTIAL</span><b>{potential}</b></div>
        <div><span>RISK INDEX</span><b>{risk}%</b></div>
      </div>
      <div className="oa-mini-meter"><i style={{width:risk+'%'}}/></div>
    </section>

    <section className="oa-panel oa-mines-board-panel">
      <div className="oa-mines-board">
        {board.map(i=>{
          const opened=round?.safe.has(i)
          const previousSafe=!round&&visibleSafe.has(i)
          const mine=!round&&visibleMines.has(i)
          const hit=lastBoard?.hit===i
          const cls=opened||previousSafe?'safe':mine?(hit?'mine hit':'mine'):''
          return <button key={i} className={cls} onClick={()=>pick(i)} disabled={!round||opened}>{opened||previousSafe?'◇':mine?'◆':'?'}</button>
        })}
      </div>
      {!round&&lastBoard&&<p className="oa-board-caption">Previous round revealed • ◆ mine • ◇ safe tile</p>}
    </section>

    <section className="oa-panel oa-mines-controls-panel">
      <span className="oa-kicker">SET WAGER</span>
      <div className="oa-choice-row">{[10,25,50,100,250].map(v=><button key={v} className={wager===v?'active':''} disabled={!!round} onClick={()=>setWager(v)}>{v}</button>)}</div>
      <span className="oa-kicker oa-spaced">CHOOSE MINE COUNT</span>
      <div className="oa-choice-row">{[3,5,7,10].map(v=><button key={v} className={mineCount===v?'active':''} disabled={!!round} onClick={()=>setMineCount(v)}>{v}</button>)}</div>
      <button className="oa-primary-wide" onClick={start} disabled={!!round}>START GAME</button>
      <button className="oa-cash-wide" onClick={cashOut} disabled={!round||round.safe.size===0}>CASH OUT {round&&round.safe.size?money(potential)+' ES':''}</button>
    </section>

    <section className="oa-panel oa-history-panel">
      <div className="oa-section-head"><div><span className="oa-kicker">ROUND HISTORY</span><h2>Last eight runs.</h2></div></div>
      <div className="oa-history-list">
        {(stats.history||[]).length?(stats.history||[]).map((h,i)=><div key={h.at+'-'+i} className={h.result==='CASH'?'win':'loss'}><span>{h.result}</span><b>{h.safe} safe • {h.mult?h.mult.toFixed(2)+'×':'mine'}</b><small>{h.result==='CASH'?'+'+money(h.payout):'-'+money(h.wager)} ES</small></div>):<p>No completed rounds yet.</p>}
      </div>
    </section>
  </OriginalFrame>
}
