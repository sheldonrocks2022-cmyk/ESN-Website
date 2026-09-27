import { useEffect, useMemo } from 'react'
import OriginalFrame from './OriginalFrame'
import { money, usePersistent } from './shared'

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

export default function ClickerGame(){
  const [g,setG]=usePersistent('esn_clicker_original_v1',{
    balance:0,totalEarned:0,totalClicks:0,highest:0,clickPower:1,idle:0,
    crit:.02,burst:1.5,global:1,levels:{}
  })
  useEffect(()=>{
    if(g.idle<=0)return
    const t=setInterval(()=>setG(x=>{
      const gain=x.idle*x.global
      const balance=x.balance+gain
      return {...x,balance,totalEarned:x.totalEarned+gain,highest:Math.max(x.highest,balance)}
    }),1000)
    return()=>clearInterval(t)
  },[g.idle,g.global,setG])
  const tap=()=>{
    const crit=Math.random()<g.crit
    const burst=Math.random()<.06
    const gain=g.clickPower*g.global*(crit?2:1)*(burst?g.burst:1)
    setG(x=>{const balance=x.balance+gain;return{...x,balance,totalEarned:x.totalEarned+gain,totalClicks:x.totalClicks+1,highest:Math.max(x.highest,balance)}})
  }
  const buy=u=>{
    const lv=g.levels[u.id]||0
    const cost=Math.floor(u.base*Math.pow(1.42,lv))
    if(g.balance<cost)return
    setG(x=>{
      const next={...x,balance:x.balance-cost,levels:{...x.levels,[u.id]:lv+1}}
      if(u.tag==='CLICK POWER')next.clickPower+=u.power
      if(u.tag==='IDLE POWER')next.idle+=u.power
      if(u.tag==='CRIT CHANCE')next.crit=Math.min(.55,next.crit+u.power)
      if(u.tag==='BURST POWER')next.burst+=u.power
      if(u.tag==='GLOBAL POWER')next.global+=u.power
      return next
    })
  }
  const visible=useMemo(()=>upgrades.slice(0,18),[])
  return <OriginalFrame title="ES Clicker" subtitle="Tap economy • live progression • power forge">
    <section className="oa-panel oa-stats">
      <div><span>LIVE BALANCE</span><b>{money(g.balance)} ES</b></div>
      <div><span>TOTAL EARNED</span><b>{money(g.totalEarned)}</b></div>
      <div><span>TOTAL CLICKS</span><b>{money(g.totalClicks)}</b></div>
      <div><span>ES / CLICK</span><b>{g.clickPower.toFixed(1)}</b></div>
      <div><span>ES / SECOND</span><b>{g.idle.toFixed(1)}</b></div>
      <div><span>HIGHEST BALANCE</span><b>{money(g.highest)}</b></div>
    </section>

    <section className="oa-panel oa-tap-zone">
      <span className="oa-kicker">TAP LOOP ZONE</span>
      <p>HIGHER TIERS UNLOCK FASTER SCALING</p>
      <button className="oa-coin" onClick={tap}><small>TAP FOR</small><strong>ES Coins</strong></button>
      <p>Each tap can trigger crit and burst payouts while idle progression keeps your clicker game economy climbing.</p>
    </section>

    <section className="oa-glow-panel">
      <span className="oa-kicker">PROGRESSION CORE</span>
      <h2>UPGRADE SHOP • POWER FORGE</h2>
      <p>Buy and stack upgrades to strengthen tap value, boost idle income, and extend long-session incremental game progression.</p>
      <div className="oa-pill">RARITY • POWER • PRICE</div>
      <div className="oa-subpanel">
        <h3>UPGRADE CATALOG</h3>
        <p>110 upgrades are live and infinitely purchasable, supporting deep browser clicker progression with no level cap.</p>
      </div>
      <div className="oa-upgrade-list">
        {visible.map(u=>{
          const lv=g.levels[u.id]||0,cost=Math.floor(u.base*Math.pow(1.42,lv))
          return <article className="oa-upgrade" key={u.id}>
            <div><h3>{u.name}</h3><p>+{u.power.toFixed(u.power<1?2:1)} {u.tag==='CLICK POWER'?'ES per tap':u.tag==='IDLE POWER'?'ES per second':u.tag==='CRIT CHANCE'?'crit chance':u.tag==='BURST POWER'?'burst power':'global power'}</p></div>
            <div className="oa-tags"><span>{u.tag}</span><span>{u.rarity}</span></div>
            <div className="oa-buy-row"><span>LEVEL {lv}</span><span>PRICE {money(cost)} ES</span><button onClick={()=>buy(u)} disabled={g.balance<cost}>PURCHASE</button></div>
          </article>
        })}
      </div>
    </section>
  </OriginalFrame>
}
