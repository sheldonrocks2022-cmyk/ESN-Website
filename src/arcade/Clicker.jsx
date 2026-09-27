import { useEffect, useMemo, useRef, useState } from 'react'
import OriginalFrame from './OriginalFrame'
import { arcadeFeedback, money, useArcadeProgress, usePersistent } from './shared'

const tiers=['Bronze','Iron','Steel','Cobalt','Silver','Gold','Platinum','Sapphire','Ruby','Emerald','Obsidian']
const types=[
  ['Tap Core','CLICK POWER','COMMON',.9,15],
  ['Idle Relay','IDLE POWER','COMMON',.35,35],
  ['Crit Lens','CRIT CHANCE','RARE',.006,70],
  ['Burst Cell','BURST POWER','RARE',1.1,120],
  ['Nova Circuit','GLOBAL POWER','EPIC',.08,180],
  ['Pulse Core','CLICK POWER','EPIC',1.7,260],
  ['Quantum Coil','IDLE POWER','LEGENDARY',1.25,420],
  ['Overdrive Matrix','GLOBAL POWER','LEGENDARY',.14,650],
  ['Ascension Core','CLICK POWER','MYTHIC',3.5,950],
  ['Infinity Relay','IDLE POWER','MYTHIC',4,1400],
]
const upgrades=Array.from({length:110},(_,i)=>{
  const tier=tiers[Math.floor(i/10)%tiers.length],t=types[i%types.length]
  const scale=1+Math.floor(i/10)*.42
  return {id:i,name:`${tier} ${t[0]}`,tag:t[1],rarity:t[2],power:t[3]*scale,base:Math.floor(t[4]*Math.pow(1.24,Math.floor(i/10)))}
})

function upgradeCost(u,lv){return Math.floor(u.base*Math.pow(1.42,lv))}
function prestigeRequirement(prestige){return Math.floor(100000*Math.pow(2.25,prestige))}

export default function ClickerGame(){
  const arcade=useArcadeProgress()
  const [g,setG]=usePersistent('esn_clicker_original_v1',{
    balance:0,totalEarned:0,totalClicks:0,highest:0,clickPower:1,idle:0,
    crit:.02,burst:1.5,global:1,levels:{},prestige:0,prestigeEarned:0,
    overdriveCharge:0,bestCombo:0
  })
  const [combo,setCombo]=useState(0)
  const [bulk,setBulk]=useState(1)
  const [overdrive,setOverdrive]=useState(false)
  const lastTap=useRef(0)
  const comboTimer=useRef(null)

  const prestigeMult=1+(g.prestige||0)*.35
  const effectiveGlobal=g.global*prestigeMult*(overdrive?3:1)
  const requirement=prestigeRequirement(g.prestige||0)

  useEffect(()=>{
    if(g.idle<=0)return
    const t=setInterval(()=>setG(x=>{
      const prestige=1+(x.prestige||0)*.35
      const gain=x.idle*x.global*prestige*(overdrive?3:1)
      const balance=x.balance+gain
      return {...x,balance,totalEarned:x.totalEarned+gain,prestigeEarned:(x.prestigeEarned||0)+gain,highest:Math.max(x.highest,balance)}
    }),1000)
    return()=>clearInterval(t)
  },[g.idle,g.global,g.prestige,overdrive,setG])

  useEffect(()=>()=>clearTimeout(comboTimer.current),[])

  const tap=()=>{
    const now=performance.now()
    const nextCombo=now-lastTap.current<850?Math.min(75,combo+1):1
    lastTap.current=now
    setCombo(nextCombo)
    clearTimeout(comboTimer.current)
    comboTimer.current=setTimeout(()=>setCombo(0),1100)

    const comboMult=1+Math.min(50,nextCombo)*.02
    const crit=Math.random()<g.crit
    const burst=Math.random()<.06
    const gain=g.clickPower*effectiveGlobal*comboMult*(crit?2:1)*(burst?g.burst:1)
    if(crit||burst||nextCombo%5===0)arcadeFeedback(crit||burst?'power':'tap')
    setG(x=>{
      const balance=x.balance+gain
      return {
        ...x,balance,totalEarned:x.totalEarned+gain,totalClicks:x.totalClicks+1,
        prestigeEarned:(x.prestigeEarned||0)+gain,
        highest:Math.max(x.highest,balance),
        overdriveCharge:Math.min(100,(x.overdriveCharge||0)+3+(crit?2:0)),
        bestCombo:Math.max(x.bestCombo||0,nextCombo),
      }
    })
    if((g.totalClicks+1)%10===0)arcade.track('clickerTaps',10,nextCombo>=25?18:10,nextCombo>=25?'Clicker combo milestone':'10 ES Clicker taps')
    if(nextCombo>=25)arcade.unlock('clicker-combo-25','Clicker: 25 Tap Combo',120)
    if(g.totalClicks+1>=1000)arcade.unlock('clicker-1000','Clicker: 1,000 Taps',180)
  }

  const buy=u=>{
    let wanted=bulk==='MAX'?9999:bulk
    setG(x=>{
      let lv=x.levels[u.id]||0
      let balance=x.balance
      let count=0
      while(count<wanted){
        const cost=upgradeCost(u,lv)
        if(balance<cost)break
        balance-=cost
        lv+=1
        count+=1
      }
      if(!count)return x
      arcadeFeedback('buy')
      const next={...x,balance,levels:{...x.levels,[u.id]:lv}}
      const amount=u.power*count
      if(u.tag==='CLICK POWER')next.clickPower+=amount
      if(u.tag==='IDLE POWER')next.idle+=amount
      if(u.tag==='CRIT CHANCE')next.crit=Math.min(.55,next.crit+amount)
      if(u.tag==='BURST POWER')next.burst+=amount
      if(u.tag==='GLOBAL POWER')next.global+=amount
      return next
    })
  }

  const activateOverdrive=()=>{
    if(overdrive||(g.overdriveCharge||0)<100)return
    setG(x=>({...x,overdriveCharge:0}))
    setOverdrive(true)
    arcadeFeedback('power')
    arcade.gainXp(75,'Clicker Overdrive')
    arcade.unlock('clicker-overdrive','Clicker: Core Overdrive',100)
    setTimeout(()=>setOverdrive(false),10000)
  }

  const prestige=()=>{
    if((g.prestigeEarned||0)<requirement)return
    setG(x=>({
      ...x,
      balance:0,clickPower:1,idle:0,crit:.02,burst:1.5,global:1,levels:{},
      prestige:(x.prestige||0)+1,prestigeEarned:0,overdriveCharge:0,
    }))
    setCombo(0)
    arcadeFeedback('win')
    arcade.track('clickerPrestiges',1,350,'Clicker prestige')
    arcade.unlock('clicker-prestige','Clicker: First Prestige',250)
  }

  const visible=useMemo(()=>upgrades,[])
  const totalLevels=Object.values(g.levels||{}).reduce((a,b)=>a+b,0)

  return <OriginalFrame title="ES Clicker" subtitle="Combo economy • Overdrive • prestige • 110-upgrade Power Forge">
    <section className="oa-panel oa-stats">
      <div><span>LIVE BALANCE</span><b>{money(g.balance)} ES</b></div>
      <div><span>TOTAL EARNED</span><b>{money(g.totalEarned)}</b></div>
      <div><span>TOTAL CLICKS</span><b>{money(g.totalClicks)}</b></div>
      <div><span>ES / CLICK</span><b>{(g.clickPower*effectiveGlobal).toFixed(1)}</b></div>
      <div><span>ES / SECOND</span><b>{(g.idle*effectiveGlobal).toFixed(1)}</b></div>
      <div><span>PRESTIGE</span><b>{g.prestige||0} • {prestigeMult.toFixed(2)}×</b></div>
    </section>

    <section className="oa-panel oa-clicker-command">
      <div className="oa-clicker-combo"><span>LIVE COMBO</span><strong>{combo}×</strong><small>Best {g.bestCombo||0} • up to +100% tap power</small></div>
      <div className="oa-overdrive-control">
        <div><span>OVERDRIVE CHARGE</span><b>{Math.floor(g.overdriveCharge||0)}%</b></div>
        <div className="oa-mini-meter"><i style={{width:(g.overdriveCharge||0)+'%'}}/></div>
        <button onClick={activateOverdrive} disabled={overdrive||(g.overdriveCharge||0)<100}>{overdrive?'OVERDRIVE ACTIVE • 3×':'ACTIVATE 10S OVERDRIVE'}</button>
      </div>
    </section>

    <section className={'oa-panel oa-tap-zone '+(overdrive?'is-overdrive ':'')+(combo>=25?'is-combo':'')}>
      <span className="oa-kicker">TAP LOOP ZONE</span>
      <p>CHAIN FAST TAPS • CRITS CHARGE OVERDRIVE FASTER</p>
      <button className={overdrive?'oa-coin overdrive':'oa-coin'} onClick={tap}><small>{overdrive?'OVERDRIVE':'TAP FOR'}</small><strong>ES Coins</strong></button>
      <p>Combo multiplier rises while you keep tapping. Crits, bursts, prestige power, and Overdrive stack together.</p>
    </section>

    <section className="oa-panel oa-prestige-panel">
      <div>
        <span className="oa-kicker">ASCENSION SYSTEM</span>
        <h2>Prestige the clicker core.</h2>
        <p>Reset purchased power after earning enough this prestige to gain a permanent +35% multiplier.</p>
      </div>
      <div className="oa-prestige-progress">
        <span>{money(g.prestigeEarned||0)} / {money(requirement)} ES</span>
        <div className="oa-mini-meter"><i style={{width:Math.min(100,((g.prestigeEarned||0)/requirement)*100)+'%'}}/></div>
        <button onClick={prestige} disabled={(g.prestigeEarned||0)<requirement}>PRESTIGE • +35% PERMANENT</button>
      </div>
    </section>

    <section className="oa-glow-panel oa-clicker-forge">
      <span className="oa-kicker">PROGRESSION CORE</span>
      <h2>UPGRADE SHOP • POWER FORGE</h2>
      <p>110 upgrades remain infinitely purchasable, now with bulk buying and shared Arcade progression rewards.</p>
      <div className="oa-forge-toolbar">
        <div><span>OWNED LEVELS</span><b>{money(totalLevels)}</b></div>
        <div className="oa-choice-row">{[1,10,'MAX'].map(v=><button className={bulk===v?'active':''} onClick={()=>setBulk(v)} key={v}>BUY {v}</button>)}</div>
      </div>
      <div className="oa-upgrade-list">
        {visible.map(u=>{
          const lv=g.levels[u.id]||0,cost=upgradeCost(u,lv)
          return <article className="oa-upgrade" key={u.id}>
            <div><h3>{u.name}</h3><p>+{u.power.toFixed(u.power<1?2:1)} {u.tag==='CLICK POWER'?'ES per tap':u.tag==='IDLE POWER'?'ES per second':u.tag==='CRIT CHANCE'?'crit chance':u.tag==='BURST POWER'?'burst power':'global power'}</p></div>
            <div className="oa-tags"><span>{u.tag}</span><span>{u.rarity}</span></div>
            <div className="oa-buy-row"><span>LEVEL {lv}</span><span>FROM {money(cost)} ES</span><button onClick={()=>buy(u)} disabled={g.balance<cost}>BUY {bulk}</button></div>
          </article>
        })}
      </div>
    </section>
  </OriginalFrame>
}
