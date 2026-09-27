import { useState } from 'react'
import GameFrame from './GameFrame'
import { useArcadeProfile } from './profile'

function makeMines(){const s=new Set();while(s.size<5)s.add(Math.floor(Math.random()*25));return s}

export default function MinesGame(){
  const {profile,earn,spend}=useArcadeProfile()
  const [stake,setStake]=useState(25)
  const [round,setRound]=useState(null)
  const [msg,setMsg]=useState('Choose a virtual ES Coin stake.')
  const start=()=>{
    if(!spend(stake)){setMsg('Not enough ES Coins.');return}
    setRound({mines:makeMines(),open:new Set(),mult:1})
    setMsg('Find safe cells and cash out before a mine.')
  }
  const open=i=>{
    if(!round||round.open.has(i))return
    if(round.mines.has(i)){setRound(null);setMsg('Mine hit. Round over.');return}
    const o=new Set(round.open);o.add(i)
    setRound({...round,open:o,mult:+(1+o.size*.25).toFixed(2)})
  }
  const cash=()=>{
    if(!round)return
    const pay=Math.floor(stake*round.mult)
    earn(pay,round.open.size*2)
    setRound(null)
    setMsg('Cashed out '+pay+' ES Coins.')
  }
  return <GameFrame title="ES Mines: Riftfield" text="Virtual ES Coins only — no real-money wagering, purchases, or cash value." profile={profile}>
    <div className="mines-toolbar">
      {[25,100,500].map(v=><button key={v} className={stake===v?'active':''} onClick={()=>!round&&setStake(v)}>{v} ES</button>)}
      <button className="button primary" onClick={start} disabled={!!round||profile.coins<stake}>Start</button>
      <button className="button secondary" onClick={cash} disabled={!round||round.open.size===0}>Cash out {round?'x'+round.mult:''}</button>
    </div>
    <p className="game-message">{msg}</p>
    <div className="mines-grid">{Array.from({length:25},(_,i)=>{const safe=round?.open.has(i);return <button key={i} className={safe?'safe':''} disabled={!round||safe} onClick={()=>open(i)}>{safe?'◆':'?'}</button>})}</div>
  </GameFrame>
}
