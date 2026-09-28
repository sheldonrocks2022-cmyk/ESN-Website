import { useState } from 'react'
import { Link } from 'react-router-dom'
import './smpStaffGate.css'

const SMP_ACCESS_SESSION_KEY='esn_smp_staff_access_v1'
const STAFF_CODE_HASH='645569b472b3670b547fd45aa2a626177a8fb71f722bb7c3dc07d0d670311cab'

async function sha256(value){
  const bytes=new TextEncoder().encode(value)
  const hash=await crypto.subtle.digest('SHA-256',bytes)
  return [...new Uint8Array(hash)].map(byte=>byte.toString(16).padStart(2,'0')).join('')
}

export default function SMPStaffGate({children,label='ESN SMP'}){
  const [authorized,setAuthorized]=useState(()=>sessionStorage.getItem(SMP_ACCESS_SESSION_KEY)==='1')
  const [code,setCode]=useState('')
  const [error,setError]=useState('')

  const unlock=async event=>{
    event.preventDefault()
    setError('')
    try{
      const digest=await sha256(code.trim())
      if(digest!==STAFF_CODE_HASH){
        setError('ACCESS CODE REJECTED')
        return
      }
      sessionStorage.setItem(SMP_ACCESS_SESSION_KEY,'1')
      setAuthorized(true)
      setCode('')
    }catch{
      setError('SECURE CHECK UNAVAILABLE')
    }
  }

  if(authorized)return children

  return <section className="smp-staff-lock">
    <div className="smp-staff-lock-card">
      <span>ESN SMP // STAFF LOCKED</span>
      <h1>{label}</h1>
      <p>This ESN SMP section is restricted to staff. Enter the staff access code to continue.</p>
      <form onSubmit={unlock}>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          value={code}
          onChange={event=>setCode(event.target.value)}
          placeholder="STAFF ACCESS CODE"
          aria-label="Staff access code"
        />
        <button type="submit">UNLOCK ESN SMP</button>
      </form>
      {error&&<strong>{error}</strong>}
      <div className="smp-staff-lock-actions">
        <Link to="/">RETURN HOME</Link>
        <Link to="/staff">STAFF DASHBOARD</Link>
      </div>
      <small>Access stays unlocked for this browser session only. Closing the session locks ESN SMP pages again.</small>
    </div>
  </section>
}

export function clearSMPStaffAccess(){
  try{sessionStorage.removeItem(SMP_ACCESS_SESSION_KEY)}catch{}
}
