
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { SITE_RELEASE, SMP_ADDRESS, SMP_PORT, useLiveNetwork } from './liveNetwork'

const templates=[
  {id:'smp',type:'ESN SMP',title:'JOIN ESN SMP',subtitle:SMP_ADDRESS+' • PORT '+SMP_PORT,body:'Custom survival, progression, events, bosses, crates, and ESN systems.',link:'/smpconnection',accent:'#45e59d'},
  {id:'arcade',type:'ESN ARCADE',title:'PLAY THE ESN ARCADE',subtitle:'6 ORIGINAL BROWSER GAMES',body:'Clicker • Factory • Mines • MOTO • Tower • Tower Defense',link:'/arcade',accent:'#a75dff'},
  {id:'services',type:'ES NETWORK',title:'BUILD WITH ESN',subtitle:'CREATOR • GAMING • COMMUNITY',body:'Fortnite coaching, editing, Discord setups, website projects, and selected digital services.',link:'/serviceshowcase',accent:'#5aa9ff'},
  {id:'release',type:'ESN UPDATE',title:'WHAT CHANGED?',subtitle:SITE_RELEASE,body:'See current website upgrades, ESNSMP releases, Arcade work, live systems, and roadmap candidates.',link:'/updates',accent:'#70d8ff'},
  {id:'realm',type:'ESN SMP STORE',title:'20 REALM 100 KEYS',subtitle:'$1.25',body:'Twenty Realm 100 keys through the official ESN SMP store.',link:'/storesmp#product-20-realm-100-keys',accent:'#f4c35e'},
  {id:'relic',type:'ESN SMP STORE',title:'SEASON PASS RELIC BUNDLE',subtitle:'$0.50',body:'Angel Wings • Inferno Scepter • Storm Crystal • Tideheart • Void Relic • Celestial Star',link:'/storesmp#product-esn-season-pass-relic-bundle',accent:'#77f3ff'},
  {id:'riftwalker',type:'ESN SMP STORE',title:'RIFTWALKER BUNDLE',subtitle:'$0.50',body:'Riftblade • Rift Wings • Phase Boots • Rift Bow • Rift Core • Void Compass',link:'/storesmp#product-esn-riftwalker-bundle',accent:'#925cff'},
  {id:'warden',type:'ESN SMP STORE',title:'IMMORTAL WARDEN BUNDLE',subtitle:'$1.30',body:'Full Warden-themed armor, weapons, core, and totem bundle.',link:'/storesmp#product-esn-immortal-warden-bundle',accent:'#30d5c8'},
  {id:'void',type:'ESN SMP STORE',title:'VOID WARRIOR BUNDLE',subtitle:'$0.50',body:'Void Blade and full Void armor set. Checkout link currently pending.',link:'/storesmp#product-void-warrior-bundle',accent:'#7c48ff'},
]

function wrapText(ctx,text,maxWidth){
  const words=text.split(' ')
  const lines=[]
  let line=''
  for(const word of words){
    const test=line?line+' '+word:word
    if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word}
    else line=test
  }
  if(line)lines.push(line)
  return lines
}

function drawCard(canvas,item,live){
  const ctx=canvas.getContext('2d')
  const W=1200,H=630
  canvas.width=W
  canvas.height=H

  const grad=ctx.createLinearGradient(0,0,W,H)
  grad.addColorStop(0,'#071120')
  grad.addColorStop(.55,'#040914')
  grad.addColorStop(1,'#02050c')
  ctx.fillStyle=grad
  ctx.fillRect(0,0,W,H)

  const glow=ctx.createRadialGradient(920,120,20,920,120,440)
  glow.addColorStop(0,item.accent+'55')
  glow.addColorStop(1,item.accent+'00')
  ctx.fillStyle=glow
  ctx.fillRect(0,0,W,H)

  ctx.strokeStyle='rgba(255,255,255,.06)'
  ctx.lineWidth=1
  for(let x=0;x<W;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
  for(let y=0;y<H;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}

  ctx.fillStyle=item.accent
  ctx.fillRect(64,64,6,500)

  ctx.font='800 24px Arial'
  ctx.fillStyle='#7f94b2'
  ctx.fillText(item.type,98,98)

  ctx.font='900 72px Arial'
  ctx.fillStyle='#f4f8ff'
  const titleLines=wrapText(ctx,item.title,820).slice(0,2)
  titleLines.forEach((line,i)=>ctx.fillText(line,98,190+i*78))

  const subY=190+titleLines.length*78+24
  ctx.font='800 28px Arial'
  ctx.fillStyle=item.accent
  ctx.fillText(item.subtitle,98,subY)

  ctx.font='500 28px Arial'
  ctx.fillStyle='#a9b7ca'
  wrapText(ctx,item.body,780).slice(0,3).forEach((line,i)=>ctx.fillText(line,98,subY+62+i*38))

  ctx.fillStyle='rgba(255,255,255,.045)'
  ctx.fillRect(885,350,245,155)
  ctx.font='900 54px Arial'
  ctx.fillStyle='#ffffff'
  ctx.fillText('ES',920,425)
  ctx.font='800 19px Arial'
  ctx.fillStyle='#71839d'
  ctx.fillText('ES NETWORK',920,460)

  ctx.font='700 18px Arial'
  ctx.fillStyle='#6e819e'
  ctx.fillText('esnoffical.com'+item.link.split('#')[0],98,565)

  ctx.fillStyle=live.smp.status==='online'?'#72f0a4':'#8ea0b9'
  ctx.beginPath()
  ctx.arc(925,545,7,0,Math.PI*2)
  ctx.fill()
  ctx.fillStyle='#8ea0b9'
  ctx.fillText(live.smp.status==='online'?'ESN NETWORK LIVE':'ESN NETWORK',945,552)
}

export default function ShareCenter(){
  const live=useLiveNetwork()
  const [selected,setSelected]=useState('smp')
  const [notice,setNotice]=useState('')
  const canvasRef=useRef(null)
  const item=useMemo(()=>templates.find(x=>x.id===selected)||templates[0],[selected])

  useEffect(()=>{
    if(canvasRef.current)drawCard(canvasRef.current,item,live)
  },[item,live.smp.status,live.smp.players,live.smp.maxPlayers])

  const ensureCanvas=()=>{
    drawCard(canvasRef.current,item,live)
    return canvasRef.current
  }

  const savePng=()=>{
    const canvas=ensureCanvas()
    const link=document.createElement('a')
    link.download='ESN-'+item.id+'-share-card.png'
    link.href=canvas.toDataURL('image/png')
    link.click()
    setNotice('PNG saved.')
  }

  const shareCard=async()=>{
    const canvas=ensureCanvas()
    const url=window.location.origin+item.link
    const text=item.title+' — '+item.subtitle+'\n'+item.body+'\n'+url
    try{
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'))
      const file=blob?new File([blob],'ESN-'+item.id+'.png',{type:'image/png'}):null
      if(file&&navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
        await navigator.share({title:item.title,text,files:[file]})
        setNotice('Share sheet opened.')
        return
      }
      if(navigator.share){
        await navigator.share({title:item.title,text,url})
        setNotice('Share sheet opened.')
        return
      }
      await navigator.clipboard.writeText(text)
      setNotice('Share text copied to clipboard.')
    }catch(error){
      if(error&&error.name!=='AbortError')setNotice('Sharing was unavailable. Use Save PNG instead.')
    }
  }

  return <>
    <section className="page-hero share-hero">
      <div className="shell page-hero-inner">
        <div className="page-hero-copy">
          <span className="eyebrow">ESN SHARE DECK</span>
          <h1>Turn ESN into something worth sharing.</h1>
          <p>Generate branded 1200×630 cards from current ESN information, then share them through your phone or save the PNG.</p>
        </div>
        <div className="page-hero-mark" aria-hidden="true"><span>↗</span><small>SHARE</small></div>
      </div>
    </section>

    <section className="section share-center-section">
      <div className="shell share-center-layout">
        <aside className="share-template-list">
          <span className="eyebrow">CARD LIBRARY</span>
          {templates.map(template=><button className={selected===template.id?'active':''} type="button" key={template.id} onClick={()=>{setSelected(template.id);setNotice('')}}>
            <span>{template.type}</span><strong>{template.title}</strong><small>{template.subtitle}</small>
          </button>)}
        </aside>

        <div className="share-workbench">
          <div className="share-preview-shell"><canvas ref={canvasRef} className="share-preview-canvas"/></div>
          <div className="share-workbench-meta">
            <div><span>SELECTED</span><strong>{item.title}</strong><small>{item.subtitle}</small></div>
            <div className="share-actions">
              <button className="button primary" type="button" onClick={shareCard}>Share card</button>
              <button className="button secondary" type="button" onClick={savePng}>Save PNG</button>
              <Link className="button secondary" to={item.link}>Open destination</Link>
            </div>
          </div>
          {notice&&<div className="share-notice">{notice}</div>}
          <p className="share-source-note">Cards are generated locally in your browser from the ESN information shown on this website. No customer claims or fake statistics are added.</p>
        </div>
      </div>
    </section>
  </>
}
