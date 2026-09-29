import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './homeControlCenter.css'

const RECENT_KEY='esn_recent_routes'
const FAVORITES_KEY='esn_favorites'

const ROUTES={
  '/':{label:'Home',category:'Network',to:'/'},
  '/serviceshowcase':{label:'Services',category:'Create',to:'/serviceshowcase'},
  '/store-ai':{label:'Store AI',category:'Create',to:'/store-ai'},
  '/hosting':{label:'Hosting',category:'Create',to:'/hosting'},
  '/site-builder':{label:'Website Builder',category:'Create',to:'/site-builder'},
  '/portfolio':{label:'Portfolio',category:'Create',to:'/portfolio'},
  '/testimonials':{label:'Verified Reviews',category:'Create',to:'/testimonials'},
  '/smpconnection':{label:'SMP Connection',category:'SMP',to:'/smpconnection'},
  '/smpconsole':{label:'Console Guide',category:'SMP',to:'/smpconsole'},
  '/smpplugin':{label:'ESNSMP Plugin',category:'SMP',to:'/smpplugin'},
  '/smpguide':{label:'SMP Encyclopedia',category:'SMP',to:'/smpguide'},
  '/storesmp':{label:'SMP Store',category:'SMP',to:'/storesmp'},
  '/arcade':{label:'Arcade',category:'Play',to:'/arcade'},
  '/estools':{label:'ES Tools',category:'Tools',to:'/estools'},
  '/status':{label:'Network Status',category:'Network',to:'/status'},
  '/updates':{label:'Release Center',category:'Network',to:'/updates'},
  '/explore':{label:'Explore ESN',category:'Network',to:'/explore'},
  '/gallery':{label:'Gallery',category:'Network',to:'/gallery'},
  '/support':{label:'Support',category:'Help',to:'/support'},
  '/about':{label:'About ESN',category:'About',to:'/about'},
  '/faq':{label:'FAQ',category:'Help',to:'/faq'},
  '/share':{label:'Share Deck',category:'Network',to:'/share'},
  '/nexus':{label:'Network Nexus',category:'Network',to:'/nexus'},
}

const QUICK=[
  {label:'Create',copy:'Services + website tools',to:'/serviceshowcase',mark:'◇'},
  {label:'Join SMP',copy:'Connection details',to:'/smpconnection',mark:'⬡'},
  {label:'ES Tools',copy:'Free browser utilities',to:'/estools',mark:'⌘'},
  {label:'Network',copy:'Status + releases',to:'/status',mark:'◎'},
]

function readList(key){
  try{
    const value=JSON.parse(localStorage.getItem(key)||'[]')
    return Array.isArray(value)?value:[]
  }catch{return[]}
}

function nextMoves(lastRoute){
  if(lastRoute?.startsWith('/smp')||lastRoute==='/storesmp'){
    return ['/smpguide','/storesmp','/status']
  }
  if(['/serviceshowcase','/portfolio','/site-builder','/store-ai','/hosting'].includes(lastRoute)){
    return ['/site-builder','/portfolio','/testimonials']
  }
  if(lastRoute==='/estools'){
    return ['/explore','/support','/updates']
  }
  if(lastRoute==='/status'||lastRoute==='/updates'||lastRoute==='/nexus'){
    return ['/updates','/explore','/share']
  }
  return ['/serviceshowcase','/smpconnection','/estools']
}

export default function HomeControlCenter(){
  const [tick,setTick]=useState(0)
  const [online,setOnline]=useState(()=>navigator.onLine)

  useEffect(()=>{
    const refresh=()=>setTick(value=>value+1)
    const onlineHandler=()=>setOnline(true)
    const offlineHandler=()=>setOnline(false)
    window.addEventListener('esn-history-change',refresh)
    window.addEventListener('storage',refresh)
    window.addEventListener('online',onlineHandler)
    window.addEventListener('offline',offlineHandler)
    return()=>{
      window.removeEventListener('esn-history-change',refresh)
      window.removeEventListener('storage',refresh)
      window.removeEventListener('online',onlineHandler)
      window.removeEventListener('offline',offlineHandler)
    }
  },[])

  const recent=useMemo(()=>readList(RECENT_KEY).filter(route=>ROUTES[route]&&route!=='/').slice(0,4),[tick])
  const favorites=useMemo(()=>readList(FAVORITES_KEY).filter(route=>ROUTES[route]).slice(0,4),[tick])
  const last=recent[0]
  const suggestions=useMemo(()=>nextMoves(last).map(route=>ROUTES[route]).filter(Boolean),[last])
  const mode=(document.documentElement.dataset.esnPower||'balanced')
  const theme=localStorage.getItem('esn_visual_theme')||'dynamic'
  const themeLabel=theme==='dynamic'?'Dynamic':theme.replace(/(^|-)\w/g,value=>value.toUpperCase())

  return (
    <section className="home-control-section" aria-labelledby="home-control-title">
      <div className="shell">
        <div className="home-control-shell">
          <header className="home-control-head">
            <div>
              <span className="eyebrow">MY ESN</span>
              <h2 id="home-control-title">Your network, ready when you are.</h2>
              <p>Recent places, saved destinations, quick actions, and device-aware network status — stored locally on this device.</p>
            </div>
            <div className="home-control-system">
              <span className={online?'online':'offline'}><i/>{online?'ONLINE':'OFFLINE'}</span>
              <span>{mode.toUpperCase()} RENDER</span>
              <span>{themeLabel.toUpperCase()} THEME</span>
            </div>
          </header>

          <div className="home-control-grid">
            <article className="home-control-primary">
              <div className="home-control-label"><span>CONTINUE</span><b>{recent.length ? recent.length+' RECENT' : 'NEW VISIT'}</b></div>
              {last&&ROUTES[last]?(
                <Link className="home-control-resume" to={last}>
                  <div><small>{ROUTES[last].category}</small><strong>{ROUTES[last].label}</strong><span>Pick up where you left off.</span></div>
                  <em>↗</em>
                </Link>
              ):(
                <Link className="home-control-resume empty" to="/explore">
                  <div><small>START HERE</small><strong>Explore ES Network</strong><span>Your recent destinations will appear here as you use the site.</span></div>
                  <em>↗</em>
                </Link>
              )}

              <div className="home-control-recent">
                {recent.slice(1).map(route=><Link to={route} key={route}><span>{ROUTES[route].category}</span><strong>{ROUTES[route].label}</strong><em>↗</em></Link>)}
                {!recent.slice(1).length&&<div className="home-control-empty-line">More recent destinations will appear here.</div>}
              </div>
            </article>

            <article className="home-control-favorites">
              <div className="home-control-label"><span>FAVORITES</span><b>{favorites.length}/4</b></div>
              <div className="home-control-favorite-list">
                {favorites.length?favorites.map(route=><Link to={route} key={route}><span>★</span><div><strong>{ROUTES[route].label}</strong><small>{ROUTES[route].category}</small></div><em>↗</em></Link>):(
                  <Link className="home-control-favorite-empty" to="/explore"><span>☆</span><div><strong>No favorites yet</strong><small>Save destinations from Explore ESN.</small></div><em>↗</em></Link>
                )}
              </div>
            </article>
          </div>

          <div className="home-control-actions">
            {QUICK.map(item=><Link to={item.to} key={item.label}><span>{item.mark}</span><div><strong>{item.label}</strong><small>{item.copy}</small></div><em>↗</em></Link>)}
          </div>

          <div className="home-control-next">
            <span>NEXT MOVES</span>
            <div>{suggestions.map(item=><Link to={item.to} key={item.to}><strong>{item.label}</strong><small>{item.category}</small><em>→</em></Link>)}</div>
            <Link className="home-control-all" to="/explore">Open full network map ↗</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
