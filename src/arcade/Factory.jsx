import { useEffect, useMemo, useRef, useState } from 'react'
import OriginalFrame from './OriginalFrame'
import { arcadeFeedback, money, useArcadeProgress, usePersistent, useSharedCoins } from './shared'

const zoneNames=['Starter Foundry','Carbon Bay','Wireline District','Core Alloy Ridge','Circuit Wharf','Ion Inlet Yard','Copper Reach','Neon Mill','Steel Harbor','Quartz Works','Pulse Yard','Titan Forge','Nova Basin','Chrome Reach','Flux Quarter','Ember Point','Prism Yard','Vector Dock','Cinder Loop','Zenith Bay','Arc Works','Helix Yard','Meteor Plant','Ion Foundry','Atlas Forge','Circuit Basin','Static Reach','Vortex Yard','Echo Mill','Quantum Dock','Solar Foundry','Lumen Bay','Alloy Quarter','Volt Harbor','Plasma Works','Cobalt Reach','Aurora Yard','Rift Forge','Nexus Bay','Photon Mill','Radiant Dock','Obsidian Plant','Crown Foundry','Apex Works','Celestial Yard','Void Harbor','Storm Forge','Infinity Basin','Mythic Works','Ascendant Yard','Eternal Foundry','Prime Nexus','ES Core']
const machineKinds=['Assembler','Smelter','Press','Lathe','Refinery','Forge','Reactor','Fabricator']
const machines=Array.from({length:112},(_,i)=>{
  const zone=Math.min(53,1+Math.floor(i/3)),floor=Math.min(24,1+Math.floor(i/5))
  const roman=['I','II','III','IV','V','VI','VII','VIII'][i%8]
  const cps=+(1.25*Math.pow(1.075,i)).toFixed(2)
  return {id:i,name:`Mk-${roman} ${machineKinds[i%machineKinds.length]} ${i+1}`,zone,floor,cps,base:Math.floor(60+28*Math.pow(1.045,i))}
})
const researchDefs=[
  {key:'efficiency',name:'Efficiency Matrix',copy:'+12% all production per level',base:1800,mult:.12},
  {key:'logistics',name:'Logistics Grid',copy:'+7% floor bonus strength per level',base:2600,mult:.07},
  {key:'automation',name:'Automation Core',copy:'+4% machine output per level',base:4200,mult:.04},
]

function machineCost(m,n){return Math.floor(m.base*Math.pow(1.27,n))}

export default function FactoryGame(){
  const {wallet,add,spend}=useSharedCoins()
  const arcade=useArcadeProgress()
  const [g,setG]=usePersistent('esn_factory_original_v1',{
    unlockedZones:3,unlockedFloors:2,owned:{0:6,1:1,2:0},lastSync:Date.now(),
    research:{efficiency:0,logistics:0,automation:0},lifetimeMachines:7
  })
  const [filter,setFilter]=useState('AVAILABLE')
  const [zoneFilter,setZoneFilter]=useState('ALL')
  const [bulk,setBulk]=useState(1)
  const [surge,setSurge]=useState(false)
  const [surgeReady,setSurgeReady]=useState(true)
  const [notice,setNotice]=useState('Factory synchronized.')
  const offlineApplied=useRef(false)

  const floorBase=useMemo(()=>Array.from({length:g.unlockedFloors},(_,i)=>.04+Math.floor(i/2)*.01).reduce((a,b)=>a+b,0),[g.unlockedFloors])
  const research=g.research||{}
  const researchMult=1+(research.efficiency||0)*.12+(research.automation||0)*.04
  const floorBonus=1+floorBase*(1+(research.logistics||0)*.07)
  const baseRate=useMemo(()=>machines.reduce((sum,m)=>sum+(g.owned[m.id]||0)*m.cps,0),[g.owned])
  const rate=baseRate*floorBonus*researchMult*(surge?2:1)
  const totalOwned=Object.values(g.owned||{}).reduce((a,b)=>a+b,0)

  useEffect(()=>{
    if(offlineApplied.current)return
    offlineApplied.current=true
    const elapsed=Math.min(4*60*60,Math.max(0,(Date.now()-(g.lastSync||Date.now()))/1000))
    if(elapsed<30||rate<=0)return
    const offline=Math.floor(rate*elapsed*.55)
    if(offline>0){
      add(offline)
      setNotice(`Offline production recovered ${money(offline)} ES from ${Math.floor(elapsed/60)} minutes away.`)
      arcade.gainXp(Math.min(120,Math.floor(elapsed/60)),'Factory offline recovery')
    }
  },[rate,g.lastSync,add,arcade])

  useEffect(()=>{
    const t=setInterval(()=>{
      if(rate>0)add(rate)
      setG(x=>({...x,lastSync:Date.now()}))
    },1000)
    return()=>clearInterval(t)
  },[rate,add,setG])

  const unlockZone=i=>{
    const cost=Math.floor(280*Math.pow(1.45,i-3))
    if(spend(cost)){
      arcadeFeedback('power')
      setG(x=>({...x,unlockedZones:Math.max(x.unlockedZones,i)}))
      arcade.gainXp(35+i,'Factory zone '+i)
      if(i>=10)arcade.unlock('factory-zone-10','Factory: Zone 10 Online',180)
    }
  }
  const unlockFloor=i=>{
    const cost=Math.floor(865*Math.pow(1.36,i-3))
    if(spend(cost)){
      arcadeFeedback('power')
      setG(x=>({...x,unlockedFloors:Math.max(x.unlockedFloors,i)}))
      arcade.gainXp(45+​i*2,'Factory floor '+i)
    }
  }

  const buy=m=>{
    if(m.zone>g.unlockedZones||m.floor>g.unlockedFloors)return
    const start=g.owned[m.id]||0
    const limit=bulk==='MAX'?9999:bulk
    let count=0,total=0,n=start
    while(count<limit){
      const next=machineCost(m,n)
      if(total+next>wallet.coins)break
      total+=next;n+=1;count+=1
    }
    if(!count||!spend(total))return
    arcadeFeedback('buy')
    setG(x=>({...x,owned:{...x.owned,[m.id]:(x.owned[m.id]||0)+count},lifetimeMachines:(x.lifetimeMachines||0)+count}))
    arcade.track('factoryMachines',count,Math.min(60,count*2),'Factory machine purchase')
    if(totalOwned+count>=100)arcade.unlock('factory-100-machines','Factory: 100 Machines',220)
  }

  const buyResearch=def=>{
    const lv=research[def.key]||0
    const cost=Math.floor(def.base*Math.pow(1.72,lv))
    if(!spend(cost))return
    arcadeFeedback('buy')
    setG(x=>({...x,research:{...(x.research||{}),[def.key]:(x.research?.[def.key]||0)+1}}))
    arcade.track('factoryResearch',1,90,'Factory research: '+def.name)
    arcade.unlock('factory-research','Factory: Research Online',120)
  }

  const startSurge=()=>{
    if(!surgeReady||surge||totalOwned<10)return
    setSurge(true);setSurgeReady(false)
    arcadeFeedback('power')
    setNotice('Core Surge active: production doubled for 20 seconds.')
    arcade.gainXp(60,'Factory Core Surge')
    setTimeout(()=>setSurge(false),20000)
    setTimeout(()=>setSurgeReady(true),90000)
  }

  useEffect(()=>{
    if(rate>=1000)arcade.unlock('factory-1k-cps','Factory: 1,000 CPS',250)
  },[rate,arcade])

  const shown=machines.filter(m=>filter==='ALL'||(filter==='UNLOCKED ZONES'?m.zone<=g.unlockedZones:(m.zone<=g.unlockedZones&&m.floor<=g.unlockedFloors)))
  const zones=zoneNames.map((name,i)=>({name,n:i+1})).filter(z=>zoneFilter==='ALL'||(zoneFilter==='UNLOCKED'?z.n<=g.unlockedZones:z.n>g.unlockedZones))

  return <OriginalFrame title="ES Factory" subtitle="53 zones • research tech • offline production • 112-machine catalog">
    <section className="oa-panel oa-status-line">{notice} • auto-save active • up to 4h offline recovery at 55% efficiency.</section>

    <section className="oa-panel oa-factory-command">
      <div className="oa-factory-live">
        <span>FACTORY OUTPUT</span><strong>{rate.toFixed(2)} CPS</strong><small>{money(wallet.coins)} shared ES Coins • {money(totalOwned)} machines</small>
      </div>
      <div className="oa-overdrive-control">
        <div><span>CORE SURGE</span><b>{surge?'2× ACTIVE':surgeReady?'READY':'COOLING'}</b></div>
        <button onClick={startSurge} disabled={!surgeReady||surge||totalOwned<10}>20S PRODUCTION SURGE</button>
      </div>
    </section>

    <section className="oa-panel oa-factory-research">
      <div className="oa-section-head"><div><span className="oa-kicker">R&D LAB</span><h2>Permanent factory research.</h2><p>Research upgrades stack across every machine and production floor.</p></div></div>
      <div className="oa-research-grid">
        {researchDefs.map(def=>{
          const lv=research[def.key]||0
          const cost=Math.floor(def.base*Math.pow(1.72,lv))
          return <article key={def.key}><span>LEVEL {lv}</span><h3>{def.name}</h3><p>{def.copy}</p><b>{money(cost)} ES</b><button disabled={wallet.coins<cost} onClick={()=>buyResearch(def)}>RESEARCH</button></article>
        })}
      </div>
    </section>

    <section className="oa-panel oa-factory-zones">
      <div className="oa-section-head"><div><span className="oa-kicker">FACTORY ZONES</span><p>53 unlockable production sectors with staged progression.</p></div><div><b>{money(wallet.coins)} ES</b><small>{rate.toFixed(2)} CPS</small></div></div>
      <div className="oa-filter-row">{['ALL','UNLOCKED','LOCKED'].map(x=><button className={zoneFilter===x?'active':''} onClick={()=>setZoneFilter(x)} key={x}>{x}</button>)}</div>
      <div className="oa-zone-list">
        {zones.map(({name,n})=>{const open=n<=g.unlockedZones,cost=Math.floor(280*Math.pow(1.45,Math.max(0,n-3)));return <article className={open?'oa-zone active':'oa-zone'} key={name}><div><b>{n}. {name}</b><span>{open?'Unlocked':`Requires Lv.${Math.max(2,n-2)} • ${money(cost)} ES Coins`}</span></div><button disabled={open||wallet.coins<cost} onClick={()=>unlockZone(n)}>{open?'ONLINE':'UNLOCK'}</button></article>})}
      </div>
    </section>

    <section className="oa-panel oa-factory-floors">
      <div className="oa-section-head"><div><span className="oa-kicker">PRODUCTION FLOORS</span><p>Unlock floor tiers to stack output bonuses and push deeper factory scaling.</p></div></div>
      <div className="oa-floor-grid">
        {Array.from({length:8},(_,i)=>{const n=i+1,open=n<=g.unlockedFloors,bonus=4+Math.floor(i/2),cost=Math.floor(865*Math.pow(1.36,Math.max(0,n-3)));return <article key={n}><h3>Production Floor {n}</h3><p>Output bonus: +{bonus}%<br/>Zone requirement: {1+i*2}</p>{open?<div className="oa-online">ACTIVE <span>ONLINE</span></div>:<div className="oa-unlock-row"><b>{money(cost)} ES</b><button disabled={wallet.coins<cost} onClick={()=>unlockFloor(n)}>UNLOCK</button></div>}</article>})}
      </div>
    </section>

    <section className="oa-panel oa-factory-machines">
      <span className="oa-kicker">MACHINE SHOP</span>
      <p>112-machine catalog with bulk purchasing and live production calculations.</p>
      <div className="oa-forge-toolbar">
        <div className="oa-filter-row">{['AVAILABLE','UNLOCKED ZONES','ALL'].map(x=><button className={filter===x?'active':''} onClick={()=>setFilter(x)} key={x}>{x}</button>)}</div>
        <div className="oa-choice-row">{[1,10,'MAX'].map(v=><button className={bulk===v?'active':''} onClick={()=>setBulk(v)} key={v}>BUY {v}</button>)}</div>
      </div>
      <div className="oa-machine-list">{shown.map(m=>{const n=g.owned[m.id]||0,cost=machineCost(m,n),met=m.zone<=g.unlockedZones&&m.floor<=g.unlockedFloors;return <article className="oa-machine" key={m.id}><h3>{m.name}</h3><p>Zone {m.zone} • Floor {m.floor} • {m.cps.toFixed(2)} CPS each</p><p>Owned: {n}</p><span>FROM</span><b>{money(cost)} ES</b><div className={met?'oa-met':'oa-locked'}>{met?'REQUIREMENTS MET':'LOCKED REQUIREMENTS'}<button onClick={()=>buy(m)} disabled={!met||wallet.coins<cost}>BUY {bulk}</button></div></article>})}</div>
    </section>
  </OriginalFrame>
}
