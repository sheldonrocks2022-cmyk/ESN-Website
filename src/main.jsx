import React from 'react'
import ReactDOM from 'react-dom/client'
import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'
import './editorial-polish.css'
import './calm-theme.css'
import './refresh.css'

// Page-wide styling class (also managed by UltraExperience) is set before the first render so the page does not shift when it is added.
if (!window.location.pathname.startsWith('/sites/')) document.documentElement.classList.add('esn-ultra')

class ESNErrorBoundary extends React.Component {
  constructor(props){
    super(props)
    this.state={error:null}
  }

  static getDerivedStateFromError(error){
    return {error}
  }

  componentDidCatch(error,info){
    console.error('ESN page render failure',error,info)
  }

  render(){
    if(!this.state.error)return this.props.children
    return (
      <main style={{minHeight:'100svh',display:'grid',placeItems:'center',padding:'24px',background:'#02050d',color:'#fff',fontFamily:'system-ui,sans-serif'}}>
        <section style={{width:'min(640px,100%)',padding:'28px',border:'1px solid rgba(120,160,230,.22)',borderRadius:'24px',background:'#081224'}}>
          <small style={{letterSpacing:'.16em',fontWeight:900,color:'#7f95b8'}}>ESN // PAGE RECOVERY</small>
          <h1 style={{fontSize:'clamp(2rem,8vw,4rem)',margin:'.7rem 0'}}>This page hit an error.</h1>
          <p style={{color:'#aebbd0',lineHeight:1.6}}>ES Network stopped the failed view instead of leaving a blank screen. Reload the page or return home.</p>
          <div style={{display:'flex',gap:'10px',flexWrap:'wrap',marginTop:'20px'}}>
            <button type="button" onClick={()=>window.location.reload()} style={{minHeight:'46px',padding:'0 18px',borderRadius:'12px',border:'0',fontWeight:900,cursor:'pointer'}}>Reload page</button>
            <button type="button" onClick={()=>window.location.assign('/')} style={{minHeight:'46px',padding:'0 18px',borderRadius:'12px',border:'1px solid rgba(255,255,255,.18)',background:'transparent',color:'#fff',fontWeight:900,cursor:'pointer'}}>Return home</button>
          </div>
        </section>
      </main>
    )
  }
}

// Recover from any stale interaction locks left by an older SPA build.
document.documentElement.classList.remove('route-transition-locked')
document.documentElement.style.removeProperty('touch-action')
document.body.style.removeProperty('touch-action')

// Tells the page loader that React is attached, so a tap made while the page was still loading can be replayed.
function ReadySignal() {
  useEffect(() => {
    window.__esnReady = true
    window.dispatchEvent(new Event('esn:ready'))
  }, [])
  return null
}

const rootElement = document.getElementById('root')
const tree = (
  <React.StrictMode>
    <ESNErrorBoundary>
      <BrowserRouter>
        <App />
        <ReadySignal />
      </BrowserRouter>
    </ESNErrorBoundary>
  </React.StrictMode>
)

// Pages are pre-rendered at build time. Attach to that markup instead of drawing the page again;
// if a part differs (for example saved local progress), React quietly redraws just that part.
if (rootElement.hasAttribute('data-prerendered')) {
  ReactDOM.hydrateRoot(rootElement, tree, { onRecoverableError: (error) => { if (window.ESN_DEBUG_HYDRATION) console.warn('hydration', error) } })
} else {
  ReactDOM.createRoot(rootElement).render(tree)
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const hadController = Boolean(navigator.serviceWorker.controller)
    let reloadingForUpdate = false

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // A first-time install should never interrupt the page that just loaded.
      // Only refresh an already-controlled tab when a newer worker takes over.
      if (!hadController || reloadingForUpdate) return
      reloadingForUpdate = true
      window.location.reload()
    })

    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then(registration => registration.update().catch(() => {}))
      .catch(() => {})
  })
}
