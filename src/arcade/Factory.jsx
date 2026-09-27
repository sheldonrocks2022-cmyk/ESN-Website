import { useEffect, useMemo, useState } from 'react'
import OriginalFrame from './OriginalFrame'
import { money, usePersistent, useSharedCoins } from './shared'

const zoneNames=['Starter Foundry','Carbon Bay','Wireline District','Core Alloy Ridge','Circuit Wharf','Ion Inlet Yard','Copper Reach','Neon Mill','Steel Harbor','Quartz Works','Pulse Yard','Titan Forge','Nova Basin','Chrome Reach','Flux Quarter','Ember Point','Prism Yard','Vector Dock','Cinder Loop','Zenith Bay','Arc Works','Helix Yard','Meteor Plant','Ion Foundry','Atlas Forge','Circuit Basin','Static Reach','Vortex Yard','Echo Mill','Quantum Dock','Solar Foundry','Lumen Bay','Alloy Quarter','Volt Harbor','Plasma Works','Cobalt Reach','Aurora Yard','Rift Forge','Nexus Bay','Photon Mill','Radiant Dock','Obsidian Plant','Crown Foundry','Apex Works','Celestial Yard','Void Harbor','Storm Forge','Infinity Basin','Mythic Works','Ascendant Yard','Eternal Foundry','Prime Nexus','ES Core']
const machineKinds=['Assembler','Smelter','Press','Lathe','Refinery','Forge','Reactor','Fabricator']
const machines=Array.from({length:112},(_,i)=>{
  const zone=Math.min(53,1+Math.floor(i/3)),floor=Math.min(24,1+Math.floor(i/5))
  const roman=['I','II','III','IV','V','VI','VII','VIII'][i%8]
  const cps=+(1.25*Math.pow(1.075,i)).toFixed(2)
  return {id:i,name:`Mk-${roman} ${machineKinds[i%machineKinds.length]} ${i+1}`,zone,floor,cps,base:Math.floor(60+28*Math.pow(1.045,i))}
})

export default function FactoryGame(){
  const {wallet,add,spend}=useSharedCoins()
  const [g,setG]=usePersistent('esn_factory_original_v1',{unlockedZones:3,unlockedFloors:2,owned:{0:6,1:1,2:0},lastSync:Date.now()})
  const [filter,setFilter]=useState('AVAILABLE')
  const [zoneFilter,setZoneFilter]=useState('ALL')
  const floorBonus=useMemo(()=>1+Array.from({length:g.unlockedFloors},(_,i)=>.04+Math.floor(i/2)*.01).reduce((a,b)=>a+b,0),[g.unlockedFloors])
  const rate=useMemo(()=>machines.reduce((sum,m)=>sum+(g.owned[m.id]||0)*m.cps,0)*floorBonus,[g.owned,floorBonus])
  useEffect(()=>{
    const t=setInterval(()=>{if(rate>0)add(rate);setG(x=>({...x,lastSync:Date.now()}))},1000)
    return()=>clearInterval(t)
  },[rate,add,setG])
  const unlockZone=i=>{
    const cost=Math.floor(280*Math.pow(1.45,i-3))
    if(spend(cost))setG(x=>({...x,unlockedZones:Math.max(x.unlockedZones,i)}))
  }
  const unlockFloor=i=>{
    const cost=Math.floor(865*Math.pow(1.36,i-3))
    if(spend(cost))setG(x=>({...x,unlockedFloors:Math.max(x.unlockedFloors,i)}))
  }
  const buy=m=>{
    const n=g.owned[m.id]||0,cost=Math.floor(m.base*Math.pow(1.27,n))
    if(m.zone>g.unlockedZones||m.floor>g.unlockedFloors||!spend(cost))return
    setG(x=>({...x,owned:{...x.owned,[m.id]:n+1}}))
  }
  const shown=machines.filter(m=>filter==='ALL'||(filter==='UNLOCKED ZONES'?m.zone<=g.unlockedZones:(m.zone<=g.unlockedZones&&m.floor<=g.unlockedFloors)))
  const zones=zoneNames.map((name,i)=>({name,n:i+1})).filter(z=>zoneFilter==='ALL'||(zoneFilter==='UNLOCKED'?z.n<=g.unlockedZones:z.n>g.unlockedZones))
  return <OriginalFrame title="ES Factory" subtitle="53 zones • production floors • 112-machine catalog">
    <section className="oa-panel oa-status-line">Live auto-save active • last sync {Math.max(0,Math.floor((Date.now()-g.lastSync)/1000))}s ago • no offline earnings.</section>
    <section className="oa-panel oa-factory-zones">
      <div className="oa-section-head"><div><span className="oa-kicker">FACTORY ZONES</span><p>Zone map for this browser factory game with 53 unlockable sectors and staged progression tied to factory level milestones.</p></div><div><b>{money(wallet.coins)} ES</b><small>{rate.toFixed(2)} CPS</small></div></div>
      <div className="oa-filter-row">{['ALL','UNLOCKED','LOCKED'].map(x=><button className={zoneFilter===x?'active':''} onClick={()=>setZoneFilter(x)} key={x}>{x}</button>)}</div>
      <div className="oa-zone-list">
        {zones.map(({name,n})=>{const open=n<=g.unlockedZones,cost=Math.floor(280*Math.pow(1.45,Math.max(0,n-3)));return <article className={open?'oa-zone active':'oa-zone'} key={name}><div><b>{n}. {name}</b><span>{open?'Unlocked':`Requires Lv.${Math.max(2,n-2)} • ${money(cost)} ES Coins`}</span></div><button disabled={open||wallet.coins<cost} onClick={()=>unlockZone(n)}>{open?'ONLINE':'UNLOCK'}</button></article>})}
      </div>
    </section>

    <section className="oa-panel oa-factory-floors">
      <div className="oa-section-head"><div><span className="oa-kicker">PRODUCTION FLOORS</span><p>Unlock floor tiers to stack output bonuses and push deeper incremental factory game scaling.</p></div></div>
      <div className="oa-floor-grid">
        {Array.from({length:8},(_,i)=>{const n=i+1,open=n<=g.unlockedFloors,bonus=4+Math.floor(i/2),cost=Math.floor(865*Math.pow(1.36,Math.max(0,n-3)));return <article key={n}><h3>Production Floor {n}</h3><p>Output bonus: +{bonus}%<br/>Zone requirement: {1+i*2}</p>{open?<div className="oa-online">ACTIVE <span>ONLINE</span></div>:<div className="oa-unlock-row"><b>{money(cost)} ES</b><button disabled={wallet.coins<cost} onClick={()=>unlockFloor(n)}>UNLOCK</button></div>}</article>})}
      </div>
    </section>

    <section className="oa-panel oa-factory-machines">
      <span className="oa-kicker">MACHINE SHOP</span>
      <p>Factory management game catalog with machine classes filtered by unlocked zones and production floor requirements.</p>
      <div className="oa-filter-row">{['AVAILABLE','UNLOCKED ZONES','ALL'].map(x=><button className={filter===x?'active':''} onClick={()=>setFilter(x)} key={x}>{x}</button>)}</div>
      <div className="oa-machine-list">{shown.map(m=>{const n=g.owned[m.id]||0,cost=Math.floor(m.base*Math.pow(1.27,n)),met=m.zone<=g.unlockedZones&&m.floor<=g.unlockedFloors;return <article className="oa-machine" key={m.id}><h3>{m.name}</h3><p>Zone {m.zone} • Floor {m.floor} • {m.cps.toFixed(2)} CPS each</p><p>Owned: {n}</p><span>COST</span><b>{money(cost)} ES</b><div className={met?'oa-met':'oa-locked'}>{met?'REQUIREMENTS MET':'LOCKED REQUIREMENTS'}<button onClick={()=>buy(m)} disabled={!met||wallet.coins<cost}>BUY</button></div></article>})}</div>
    </section>
  </OriginalFrame>
}
