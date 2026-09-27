import { useEffect, useState } from 'react'
import GameFrame from './GameFrame'
import { useArcadeProfile } from './profile'

export default function TowerGame(){
  const {profile,earn}=useArcadeProfile()
  const [g,setG]=useState({run:false,pos:0,width:72,dir:1,stack:[],score:0})
  useEffect(()=>{
    if(!g.run)return
    const t=setInterval(()=>setG(x=>{
      let p=x.pos+x.dir*3.2,d=x.dir
      if(p<0||p>100-x.width){d*=-1;p=Math.max(0,Math.min(100-x.width,p))}
      return{...x,pos:p,dir:d}
    }),30)
    return()=>clearInterval(t)
  },[g.run])
  const start=()=>setG({run:true,pos:0,width:72,dir:1,stack:[],score:0})
  const drop=()=>setG(x=>{
    if(!x.run)return x
    const prev=x.stack.length?x.stack[x.stack.length-1]:{pos:14,width:72}
    const left=Math.max(x.pos,prev.pos),right=Math.min(x.pos+x.width,prev.pos+prev.width),width=right-left
    if(width<=1){earn(x.score*5,Math.max(1,x.score));return{...x,run:false}}
    const score=x.score+1
    if(score%10===0)earn(75,15)
    return{...x,pos:Math.random()*Math.max(1,100-width),width,stack:[...x.stack,{pos:left,width}],score,dir:x.dir*-1}
  })
  return <GameFrame title="ES Tower: Skyline" text="Stack precision blocks and chase a cleaner, taller run." profile={profile}>
    <div className="tower-wrap">
      <div className="tower-stage" onClick={drop} role="button" tabIndex="0" onKeyDown={e=>e.key===' '&&drop()}>
        <div className="tower-moving" style={{left:g.pos+'%',width:g.width+'%'}}/>
        <div className="tower-stack">{g.stack.slice(-14).map((b,i)=><div key={i} style={{marginLeft:b.pos+'%',width:b.width+'%'}}/>)}</div>
      </div>
      <div className="tower-side"><span className="eyebrow">SCORE</span><strong>{g.score}</strong><p>{g.run?'Tap the tower to drop the moving block.':'Start a tower and build a streak.'}</p><button className="button primary" onClick={start}>{g.run?'Restart':'Start tower'}</button></div>
    </div>
  </GameFrame>
}
