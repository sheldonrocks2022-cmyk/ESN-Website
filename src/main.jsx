import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'

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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ESNErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ESNErrorBoundary>
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then(registration=>registration.update().catch(()=>{}))
      .catch(() => {})
  })
}
