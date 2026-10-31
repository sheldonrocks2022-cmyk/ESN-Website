import { useEffect, useRef, useState } from 'react'
import './smpCopy.css'

const SMP_HOST='play.esnoffical.com'
const SMP_BEDROCK_PORT='19132'

export const SMP_COPY_TARGETS=[
  { id:'java', label:'Java', value:SMP_HOST },
  { id:'bedrock', label:'Bedrock', value:`${SMP_HOST}:${SMP_BEDROCK_PORT}` },
]

async function writeClipboard(text){
  try{
    if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);return true}
  }catch{}
  try{
    const area=document.createElement('textarea')
    area.value=text
    area.setAttribute('readonly','')
    area.style.position='fixed'
    area.style.top='-1000px'
    area.style.opacity='0'
    document.body.appendChild(area)
    area.select()
    const ok=document.execCommand('copy')
    document.body.removeChild(area)
    return ok
  }catch{return false}
}

// One-tap copy buttons for the ESN SMP address (Java and Bedrock).
export function SmpCopyButtons({ className='' }){
  const [copied,setCopied]=useState('')
  const timer=useRef(null)
  useEffect(()=>()=>clearTimeout(timer.current),[])
  const copy=async target=>{
    const ok=await writeClipboard(target.value)
    setCopied(ok?target.id:`fail:${target.id}`)
    clearTimeout(timer.current)
    timer.current=setTimeout(()=>setCopied(''),1800)
  }
  return <div className={`smp-copy ${className}`} role="group" aria-label="Copy the ESN SMP address">
    {SMP_COPY_TARGETS.map(target=>{
      const done=copied===target.id
      const failed=copied===`fail:${target.id}`
      return <button key={target.id} type="button" className={`smp-copy-btn${done?' is-copied':''}`} onClick={()=>copy(target)} title={`Copy ${target.value}`}>
        <span className="smp-copy-label">{target.label}</span>
        <code className="smp-copy-value">{target.value}</code>
        <span className="smp-copy-state" aria-hidden="true">{done?'Copied ✓':failed?'Select & copy':'Copy'}</span>
      </button>
    })}
    <span className="smp-copy-live" aria-live="polite">{copied&&!copied.startsWith('fail:')?`Copied ${SMP_COPY_TARGETS.find(t=>t.id===copied)?.value||''}`:''}</span>
  </div>
}
