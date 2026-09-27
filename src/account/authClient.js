const URL=(import.meta.env.VITE_SUPABASE_URL||'').replace(/\/$/,'')
const KEY=import.meta.env.VITE_SUPABASE_ANON_KEY||''
const STORAGE='esn_auth_session_v1'

export const authConfigured=Boolean(URL&&KEY)

function readSession(){
  try{return JSON.parse(localStorage.getItem(STORAGE)||'null')}catch{return null}
}
function writeSession(session){
  try{
    if(session)localStorage.setItem(STORAGE,JSON.stringify(session))
    else localStorage.removeItem(STORAGE)
  }catch{}
}

async function request(path,{method='GET',body,token,headers={}}={}){
  if(!authConfigured)throw new Error('ESN account backend is not connected yet.')
  const response=await fetch(`${URL}${path}`,{
    method,
    headers:{
      apikey:KEY,
      Authorization:`Bearer ${token||KEY}`,
      'Content-Type':'application/json',
      ...headers,
    },
    body:body===undefined?undefined:JSON.stringify(body),
  })
  const text=await response.text()
  let data=null
  try{data=text?JSON.parse(text):null}catch{data=text}
  if(!response.ok){
    const message=data?.msg||data?.message||data?.error_description||data?.error||`Request failed (${response.status})`
    throw new Error(message)
  }
  return data
}

export function getStoredSession(){return readSession()}

export function consumeRecoverySession(){
  const hash=new URLSearchParams(window.location.hash.replace(/^#/,''))
  const access_token=hash.get('access_token')
  const refresh_token=hash.get('refresh_token')
  const type=hash.get('type')
  const expires_in=Number(hash.get('expires_in')||3600)
  if(!access_token||!refresh_token)return null
  const session={access_token,refresh_token,expires_at:Math.floor(Date.now()/1000)+expires_in,token_type:'bearer',type}
  writeSession(session)
  history.replaceState(null,'',window.location.pathname+window.location.search)
  return session
}

export async function refreshSession(session){
  if(!session?.refresh_token)return null
  const next=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refresh_token}})
  writeSession(next)
  return next
}

export async function ensureSession(session=readSession()){
  if(!session)return null
  const now=Math.floor(Date.now()/1000)
  if(!session.expires_at||session.expires_at-now>90)return session
  try{return await refreshSession(session)}catch{writeSession(null);return null}
}

export async function signUp(email,password,displayName){
  const data=await request('/auth/v1/signup',{method:'POST',body:{email,password,data:{display_name:displayName}}})
  if(data?.access_token)writeSession(data)
  return data
}

export async function signIn(email,password){
  const data=await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password}})
  writeSession(data)
  return data
}

export async function signOut(session=readSession()){
  try{if(session?.access_token)await request('/auth/v1/logout',{method:'POST',token:session.access_token})}catch{}
  writeSession(null)
}

export async function sendRecovery(email){
  const redirectTo=`${window.location.origin}/account?mode=recovery`
  return request(`/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`,{method:'POST',body:{email}})
}

export async function updatePassword(session,password){
  const data=await request('/auth/v1/user',{method:'PUT',token:session.access_token,body:{password}})
  return data
}

export async function getUser(session){
  if(!session?.access_token)return null
  return request('/auth/v1/user',{token:session.access_token})
}

export async function getProfile(session,userId){
  if(!session?.access_token||!userId)return null
  const rows=await request(`/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=id,member_id,display_name,role,status,credits,created_at,updated_at`,{
    token:session.access_token,
    headers:{Accept:'application/json'},
  })
  return Array.isArray(rows)?rows[0]||null:null
}

export async function updateDisplayName(session,userId,displayName){
  const rows=await request(`/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=id,member_id,display_name,role,status,credits,created_at,updated_at`,{
    method:'PATCH',
    token:session.access_token,
    headers:{Prefer:'return=representation'},
    body:{display_name:displayName},
  })
  return Array.isArray(rows)?rows[0]||null:null
}
