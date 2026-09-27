import { useEffect, useState } from 'react'
import GameFrame from './GameFrame'
import { readGame, saveGame, useArcadeProfile } from './profile'

const KEY='esn_clicker_v2'

export default function ClickerGame() {
  const { profile, earn, spend } = useArcadeProfile()
  const [g,setG]=useState(()=>readGame(KEY,{power:1,auto:0,powerLv:0,autoLv:0,taps:0}))
  useEffect(()=>saveGame(KEY,g),[g])
  useEffect(()=>{
    if(!g.auto)return
    const t=setInterval(()=>earn(g.auto,1),1000)
    return()=>clearInterval(t)
  },[g.auto])
  const pCost=Math.floor(30*Math.pow(1.6,g.powerLv))
  const aCost=Math.floor(120*Math.pow(1.7,g.autoLv))
  const tap=()=>{earn(g.power,1);setG(x=>({...x,taps:x.taps+1}))}
  const power=()=>{if(spend(pCost))setG(x=>({...x,powerLv:x.powerLv+1,power:x.power+1+Math.floor(x.powerLv/3)}))}
  const auto=()=>{if(spend(aCost))setG(x=>({...x,autoLv:x.autoLv+1,auto:x.auto+1+Math.floor(x.autoLv/2)}))}
  return <GameFrame title="ES Clicker: Overdrive" text="Tap, upgrade, automate, and grow one shared Arcade profile." profile={profile}>
    <div className="game-layout">
      <div className="game-stage center-stage">
        <button className="click-core" onClick={tap}><span>ES</span><small>+{g.power}</small></button>
        <div className="stat-row"><span>Power <b>{g.power}</b></span><span>Auto <b>{g.auto}/sec</b></span><span>Taps <b>{g.taps.toLocaleString()}</b></span></div>
      </div>
      <aside className="game-panel">
        <span className="eyebrow">UPGRADES</span>
        <button className="upgrade-card" onClick={power} disabled={profile.coins<pCost}><span><b>Core Power Lv. {g.powerLv}</b><small>Increase tap output</small></span><strong>{pCost} ES</strong></button>
        <button className="upgrade-card" onClick={auto} disabled={profile.coins<aCost}><span><b>Auto Miner Lv. {g.autoLv}</b><small>Passive ES Coins</small></span><strong>{aCost} ES</strong></button>
      </aside>
    </div>
  </GameFrame>
}
