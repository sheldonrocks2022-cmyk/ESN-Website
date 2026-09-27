import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)


if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      await registration.update()

      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data?.type !== 'ESN_SW_UPDATED') return
        if (sessionStorage.getItem('esn_sw_reload_once') === '1') return
        sessionStorage.setItem('esn_sw_reload_once', '1')
        window.location.reload()
      })

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (sessionStorage.getItem('esn_sw_controller_reload') === '1') return
        sessionStorage.setItem('esn_sw_controller_reload', '1')
        window.location.reload()
      })
    } catch {}
  })
}
