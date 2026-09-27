import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  authConfigured,consumeRecoverySession,ensureSession,getProfile,getStoredSession,getUser,
  sendRecovery,signIn as apiSignIn,signOut as apiSignOut,signUp as apiSignUp,
  updateDisplayName as apiUpdateDisplayName,updatePassword as apiUpdatePassword
} from './authClient'

const AuthContext=createContext(null)

export function AuthProvider({children}){
  const [session,setSession]=useState(()=>getStoredSession())
  const [user,setUser]=useState(null)
  const [profile,setProfile]=useState(null)
  const [loading,setLoading]=useState(authConfigured)
  const [recovery,setRecovery]=useState(false)

  const hydrate=useCallback(async(nextSession)=>{
    if(!nextSession){setSession(null);setUser(null);setProfile(null);return null}
    const fresh=await ensureSession(nextSession)
    if(!fresh){setSession(null);setUser(null);setProfile(null);return null}
    const nextUser=await getUser(fresh)
    const nextProfile=nextUser?await getProfile(fresh,nextUser.id).catch(()=>null):null
    setSession(fresh);setUser(nextUser);setProfile(nextProfile)
    return {session:fresh,user:nextUser,profile:nextProfile}
  },[])

  useEffect(()=>{
    if(!authConfigured){setLoading(false);return}
    let active=true
    const recoverySession=consumeRecoverySession()
    setRecovery(recoverySession?.type==='recovery')
    hydrate(recoverySession||getStoredSession()).finally(()=>{if(active)setLoading(false)})
    return()=>{active=false}
  },[hydrate])

  useEffect(()=>{
    if(!authConfigured)return
    const onVisibility=()=>{if(document.visibilityState==='visible')hydrate(getStoredSession()).catch(()=>{})}
    document.addEventListener('visibilitychange',onVisibility)
    return()=>document.removeEventListener('visibilitychange',onVisibility)
  },[hydrate])

  const signIn=useCallback(async(email,password)=>{
    const next=await apiSignIn(email,password)
    return hydrate(next)
  },[hydrate])

  const signUp=useCallback(async(email,password,displayName)=>{
    const next=await apiSignUp(email,password,displayName)
    if(next?.access_token)return hydrate(next)
    return {session:null,user:next?.user||null,profile:null,confirmationRequired:true}
  },[hydrate])

  const signOut=useCallback(async()=>{
    await apiSignOut(session)
    setSession(null);setUser(null);setProfile(null);setRecovery(false)
  },[session])

  const recover=useCallback((email)=>sendRecovery(email),[])

  const changePassword=useCallback(async(password)=>{
    if(!session)throw new Error('No active recovery session.')
    await apiUpdatePassword(session,password)
    setRecovery(false)
  },[session])

  const updateDisplayName=useCallback(async(displayName)=>{
    if(!session||!user)throw new Error('Sign in first.')
    const next=await apiUpdateDisplayName(session,user.id,displayName)
    setProfile(next)
    return next
  },[session,user])

  const value=useMemo(()=>({
    configured:authConfigured,session,user,profile,loading,recovery,
    signIn,signUp,signOut,recover,changePassword,updateDisplayName,refresh:()=>hydrate(getStoredSession())
  }),[session,user,profile,loading,recovery,signIn,signUp,signOut,recover,changePassword,updateDisplayName,hydrate])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(){
  const value=useContext(AuthContext)
  if(!value)throw new Error('useAuth must be used inside AuthProvider')
  return value
}
