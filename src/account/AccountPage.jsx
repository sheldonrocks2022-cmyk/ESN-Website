import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './AuthProvider'

function Field({label,type='text',value,onChange,autoComplete,placeholder,disabled}){
  return <label className="account-field">
    <span>{label}</span>
    <input type={type} value={value} onChange={onChange} autoComplete={autoComplete} placeholder={placeholder} disabled={disabled}/>
  </label>
}

function AuthMessage({type='info',children}){
  if(!children)return null
  return <div className={`account-message ${type}`}>{children}</div>
}

export default function AccountPage(){
  const auth=useAuth()
  const [mode,setMode]=useState('signin')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [displayName,setDisplayName]=useState('')
  const [newPassword,setNewPassword]=useState('')
  const [confirmPassword,setConfirmPassword]=useState('')
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')
  const [editing,setEditing]=useState(false)
  const [profileName,setProfileName]=useState('')

  const profile=auth.profile
  const user=auth.user
  const name=profile?.display_name||user?.user_metadata?.display_name||user?.email?.split('@')[0]||'ESN Member'
  const initials=useMemo(()=>name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()).join('')||'ES',[name])
  const joined=profile?.created_at||user?.created_at
  const memberId=profile?.member_id||'Pending profile sync'
  const role=(profile?.role||'member').replaceAll('_',' ')
  const status=profile?.status||'active'
  const credits=Number(profile?.credits||0)

  const clearFeedback=()=>{setMessage('');setError('')}

  const submit=async(e)=>{
    e.preventDefault();clearFeedback();setBusy(true)
    try{
      if(mode==='signin'){
        await auth.signIn(email.trim(),password)
        setMessage('Signed in to your ESN account.')
      }else if(mode==='signup'){
        if(displayName.trim().length<2)throw new Error('Display name must be at least 2 characters.')
        if(password.length<8)throw new Error('Password must be at least 8 characters.')
        const result=await auth.signUp(email.trim(),password,displayName.trim())
        setMessage(result?.confirmationRequired?'Account created. Check your email to confirm it, then sign in.':'Your ESN account is ready.')
      }else if(mode==='recover'){
        await auth.recover(email.trim())
        setMessage('Recovery email sent. Open the link in that email to continue.')
      }
    }catch(err){setError(err.message||'Account request failed.')}
    finally{setBusy(false)}
  }

  const submitRecovery=async(e)=>{
    e.preventDefault();clearFeedback()
    if(newPassword.length<8){setError('New password must be at least 8 characters.');return}
    if(newPassword!==confirmPassword){setError('Passwords do not match.');return}
    setBusy(true)
    try{
      await auth.changePassword(newPassword)
      setMessage('Password updated. Your ESN account is ready.')
      setNewPassword('');setConfirmPassword('')
    }catch(err){setError(err.message||'Could not update the password.')}
    finally{setBusy(false)}
  }

  const saveName=async()=>{
    clearFeedback()
    if(profileName.trim().length<2){setError('Display name must be at least 2 characters.');return}
    setBusy(true)
    try{
      await auth.updateDisplayName(profileName.trim())
      setEditing(false)
      setMessage('Profile updated.')
    }catch(err){setError(err.message||'Profile update failed.')}
    finally{setBusy(false)}
  }

  if(auth.loading){
    return <section className="account-page"><div className="shell account-loading"><div className="account-spinner"/><span>Loading ESN account…</span></div></section>
  }

  if(!auth.configured){
    return <>
      <section className="page-hero account-hero">
        <div className="shell page-hero-inner">
          <div className="page-hero-copy">
            <span className="eyebrow">ESN Accounts</span>
            <h1>Your ESN identity.</h1>
            <p>The secure account interface is built and ready for the ESN authentication backend. Passwords and admin roles will never be faked or stored in static website code.</p>
          </div>
          <div className="page-hero-mark" aria-hidden="true"><span>ES</span><small>ACCOUNT</small></div>
        </div>
      </section>
      <section className="section">
        <div className="shell account-offline-card">
          <div className="account-offline-icon">◎</div>
          <div>
            <span className="eyebrow">Backend connection required</span>
            <h2>Account UI is ready. Secure auth is the last connection.</h2>
            <p>ES Network accounts need the connected authentication/database backend before registration can safely go live. ES Tools remains fully usable without an account.</p>
            <div className="account-feature-pills"><span>Native ESN login</span><span>Member ID</span><span>Profiles</span><span>Roles</span><span>Credits-ready</span><span>Recovery</span></div>
          </div>
        </div>
      </section>
    </>
  }

  if(auth.recovery){
    return <>
      <section className="page-hero account-hero"><div className="shell page-hero-inner"><div className="page-hero-copy"><span className="eyebrow">Account Recovery</span><h1>Set a new password.</h1><p>Your secure recovery session is active.</p></div><div className="page-hero-mark" aria-hidden="true"><span>ES</span><small>RECOVERY</small></div></div></section>
      <section className="section"><div className="shell account-auth-shell single">
        <form className="account-auth-card" onSubmit={submitRecovery}>
          <div className="account-form-head"><span className="eyebrow">Secure reset</span><h2>Choose your new password</h2></div>
          <Field label="New password" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} autoComplete="new-password"/>
          <Field label="Confirm password" type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} autoComplete="new-password"/>
          <AuthMessage type="error">{error}</AuthMessage><AuthMessage type="success">{message}</AuthMessage>
          <button className="button primary account-submit" disabled={busy}>{busy?'Updating…':'Update password'}</button>
        </form>
      </div></section>
    </>
  }

  if(user){
    return <>
      <section className="page-hero account-hero signed-in">
        <div className="shell page-hero-inner">
          <div className="page-hero-copy">
            <span className="eyebrow">ESN Member Dashboard</span>
            <h1>Welcome, {name}.</h1>
            <p>Your ES Network identity, member details, role, and account status in one place.</p>
          </div>
          <div className="account-profile-orb"><span>{initials}</span><i/></div>
        </div>
      </section>

      <section className="section compact-section"><div className="shell network-stat-grid account-stat-grid">
        <div><strong>{credits.toLocaleString()}</strong><span>ESN Credits</span></div>
        <div><strong>{role.toUpperCase()}</strong><span>Account role</span></div>
        <div><strong>{status.toUpperCase()}</strong><span>Account status</span></div>
        <div><strong>{joined?new Date(joined).toLocaleDateString():'—'}</strong><span>Member since</span></div>
      </div></section>

      <section className="section account-dashboard-section">
        <div className="shell account-dashboard-grid">
          <article className="account-profile-card">
            <div className="account-profile-top">
              <div className="account-avatar">{initials}</div>
              <div><span className="eyebrow">Member Profile</span><h2>{name}</h2><p>{user.email}</p></div>
            </div>
            <div className="account-detail-grid">
              <div><span>MEMBER ID</span><strong>{memberId}</strong></div>
              <div><span>ROLE</span><strong>{role}</strong></div>
              <div><span>STATUS</span><strong>{status}</strong></div>
              <div><span>EMAIL</span><strong>{user.email}</strong></div>
            </div>
            {editing?<div className="account-inline-edit">
              <Field label="Display name" value={profileName} onChange={e=>setProfileName(e.target.value)} autoComplete="nickname"/>
              <div><button className="button primary" type="button" disabled={busy} onClick={saveName}>Save profile</button><button className="button secondary" type="button" onClick={()=>setEditing(false)}>Cancel</button></div>
            </div>:<button className="button secondary" type="button" onClick={()=>{setProfileName(name);setEditing(true)}}>Edit display name</button>}
          </article>

          <aside className="account-side-stack">
            <article className="account-side-card"><span className="eyebrow">ESN Credits</span><h3>{credits.toLocaleString()} credits</h3><p>The dashboard is ready for server-controlled balances and transaction history once the account backend is connected.</p></article>
            <article className="account-side-card"><span className="eyebrow">Account Security</span><h3>Session protected</h3><p>Your password is handled by the authentication backend. The website never stores your raw password.</p></article>
            {(role==='owner'||role==='admin'||role==='staff')&&<article className="account-side-card elevated"><span className="eyebrow">Staff Access</span><h3>{role} permissions</h3><p>Your account is marked for privileged ESN features. Server policies still control what actions are allowed.</p></article>}
          </aside>
        </div>

        <div className="shell account-actions-row">
          <AuthMessage type="error">{error}</AuthMessage><AuthMessage type="success">{message}</AuthMessage>
          <Link className="button secondary" to="/">Return home</Link>
          <button className="button account-signout" type="button" onClick={()=>auth.signOut()}>Sign out</button>
        </div>
      </section>
    </>
  }

  return <>
    <section className="page-hero account-hero">
      <div className="shell page-hero-inner">
        <div className="page-hero-copy"><span className="eyebrow">ESN Accounts</span><h1>One login. Your ESN identity.</h1><p>Create a native ES Network account for your member profile, future credits, account status, and secure ESN features. ES Tools still does not require an account.</p></div>
        <div className="page-hero-mark" aria-hidden="true"><span>ES</span><small>MEMBER</small></div>
      </div>
    </section>

    <section className="section account-auth-section">
      <div className="shell account-auth-shell">
        <div className="account-auth-visual">
          <span className="eyebrow">Member Network</span><h2>Built for the ESN ecosystem.</h2><p>Accounts connect your identity to member features without forcing login onto free public tools.</p>
          <div className="account-feature-list"><div><b>01</b><span><strong>Native ESN account</strong><small>No Google account required.</small></span></div><div><b>02</b><span><strong>Member profile</strong><small>Display name, Member ID, role, and status.</small></span></div><div><b>03</b><span><strong>Credits-ready</strong><small>Backend-controlled balance and history.</small></span></div><div><b>04</b><span><strong>Secure recovery</strong><small>Email-based password recovery.</small></span></div></div>
        </div>

        <form className="account-auth-card" onSubmit={submit}>
          <div className="account-auth-tabs">
            <button type="button" className={mode==='signin'?'active':''} onClick={()=>{setMode('signin');clearFeedback()}}>Sign in</button>
            <button type="button" className={mode==='signup'?'active':''} onClick={()=>{setMode('signup');clearFeedback()}}>Create account</button>
            <button type="button" className={mode==='recover'?'active':''} onClick={()=>{setMode('recover');clearFeedback()}}>Recover</button>
          </div>

          <div className="account-form-head"><span className="eyebrow">{mode==='signup'?'Join ESN':mode==='recover'?'Account Recovery':'Welcome Back'}</span><h2>{mode==='signup'?'Create your ESN account':mode==='recover'?'Reset your password':'Sign in to ES Network'}</h2></div>

          {mode==='signup'&&<Field label="Display name" value={displayName} onChange={e=>setDisplayName(e.target.value)} autoComplete="nickname" placeholder="Your ESN display name"/>}
          <Field label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com"/>
          {mode!=='recover'&&<Field label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode==='signup'?'new-password':'current-password'} placeholder={mode==='signup'?'8+ characters':'Your password'}/>}

          <AuthMessage type="error">{error}</AuthMessage><AuthMessage type="success">{message}</AuthMessage>

          <button className="button primary account-submit" disabled={busy}>{busy?'Working…':mode==='signup'?'Create ESN account':mode==='recover'?'Send recovery email':'Sign in'}</button>
          <p className="account-privacy-note">Passwords are sent only to the secure authentication backend. ESN does not store raw passwords in website code.</p>
        </form>
      </div>
    </section>
  </>
}
