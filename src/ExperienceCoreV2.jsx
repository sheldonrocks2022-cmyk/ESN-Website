import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './experienceCoreV2.css'

const ARCADE_ROUTES = new Set([
  '/arcade','/esclicker','/esfactory','/esmines','/esmoto','/estower','/estowerdefense'
])

function slugify(value='section') {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g,'')
    .trim()
    .replace(/\s+/g,'-')
    .replace(/-+/g,'-')
    .slice(0,52) || 'section'
}

function powerProfile() {
  if (typeof window === 'undefined') return 'balanced'
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const saveData = Boolean(navigator.connection?.saveData)
  const memory = Number(navigator.deviceMemory || 8)
  const cores = Number(navigator.hardwareConcurrency || 8)
  const narrow = window.matchMedia('(max-width: 720px)').matches
  if (reduce || saveData || memory <= 3 || cores <= 4) return 'lite'
  if (narrow || memory <= 5 || cores <= 6) return 'balanced'
  return 'max'
}

export default function ExperienceCoreV2() {
  const location = useLocation()
  const [sections,setSections] = useState([])
  const [activeId,setActiveId] = useState('')
  const [open,setOpen] = useState(false)
  const [power,setPower] = useState('balanced')
  const panelRef = useRef(null)

  const disabled = location.pathname.startsWith('/sites/') || ARCADE_ROUTES.has(location.pathname)

  useEffect(() => {
    if (disabled) return

    const root = document.documentElement
    let mounted = true
    let battery = null
    let batteryHandler = null

    const sync = () => {
      const profile = powerProfile()
      if (!mounted) return
      setPower(profile)
      root.dataset.esnPower = profile
      root.dataset.esnNetwork = navigator.onLine ? 'online' : 'offline'
    }

    const visibility = () => {
      root.classList.toggle('esn-background-paused', document.hidden)
    }

    const network = () => {
      root.dataset.esnNetwork = navigator.onLine ? 'online' : 'offline'
    }

    sync()
    visibility()

    window.addEventListener('resize', sync, { passive:true })
    window.addEventListener('online', network)
    window.addEventListener('offline', network)
    document.addEventListener('visibilitychange', visibility)

    if (navigator.getBattery) {
      navigator.getBattery().then(value => {
        if (!mounted) return
        battery = value
        batteryHandler = () => {
          const forcedLite = battery.level < .18 && !battery.charging
          if (forcedLite) {
            setPower('lite')
            root.dataset.esnPower = 'lite'
          } else sync()
        }
        battery.addEventListener('levelchange', batteryHandler)
        battery.addEventListener('chargingchange', batteryHandler)
        batteryHandler()
      }).catch(()=>{})
    }

    return () => {
      mounted = false
      window.removeEventListener('resize', sync)
      window.removeEventListener('online', network)
      window.removeEventListener('offline', network)
      document.removeEventListener('visibilitychange', visibility)
      battery?.removeEventListener('levelchange', batteryHandler)
      battery?.removeEventListener('chargingchange', batteryHandler)
      delete root.dataset.esnPower
      delete root.dataset.esnNetwork
      root.classList.remove('esn-background-paused')
    }
  }, [disabled])

  useEffect(() => {
    setOpen(false)
    setSections([])
    setActiveId('')
    if (disabled) return

    let observer
    const timer = window.setTimeout(() => {
      const main = document.getElementById('main-content') || document.querySelector('main')
      if (!main) return

      const candidates = [
        ...main.querySelectorAll('.page-hero h1, .hero h1, section .section-heading h2, section > .shell > h2, section > h2')
      ]

      const unique = []
      const seen = new Set()
      candidates.forEach((heading,index) => {
        if (!heading?.textContent?.trim()) return
        if (heading.closest('[data-esn-smartnav="off"]')) return
        if (unique.length >= 10) return

        const text = heading.textContent.trim().replace(/\s+/g,' ')
        const container = heading.closest('section, .page-hero, .hero') || heading
        let id = container.id
        if (!id) {
          const base = 'esn-' + slugify(text)
          id = base
          let n = 2
          while (document.getElementById(id) && document.getElementById(id) !== container) {
            id = `${base}-${n++}`
          }
          container.id = id
          container.dataset.esnSmartId = '1'
        }

        if (seen.has(id)) return
        seen.add(id)
        unique.push({ id, label:text, node:container, index })
      })

      setSections(unique.map(({id,label}) => ({id,label})))
      if (unique[0]) setActiveId(unique[0].id)

      observer = new IntersectionObserver(entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a,b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))
        if (visible[0]) setActiveId(visible[0].target.id)
      }, { rootMargin:'-18% 0px -62% 0px', threshold:[0,.01,.2] })

      unique.forEach(item => observer.observe(item.node))
    }, 180)

    return () => {
      window.clearTimeout(timer)
      observer?.disconnect()
      document.querySelectorAll('[data-esn-smart-id="1"]').forEach(node => {
        node.removeAttribute('id')
        delete node.dataset.esnSmartId
      })
    }
  }, [location.pathname, disabled])

  useEffect(() => {
    if (disabled) return
    const key = event => {
      if (event.altKey && event.key.toLowerCase() === 'j') {
        event.preventDefault()
        setOpen(value => !value)
      }
      if (event.key === 'Escape') setOpen(false)
    }
    const outside = event => {
      if (!open || panelRef.current?.contains(event.target)) return
      setOpen(false)
    }
    window.addEventListener('keydown',key)
    document.addEventListener('pointerdown',outside)
    return () => {
      window.removeEventListener('keydown',key)
      document.removeEventListener('pointerdown',outside)
    }
  }, [disabled,open])

  const activeIndex = Math.max(0, sections.findIndex(section => section.id === activeId))
  const current = sections[activeIndex] || sections[0]
  const progress = sections.length > 1 ? activeIndex / (sections.length - 1) : 0

  const jump = id => {
    const node = document.getElementById(id)
    if (!node) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    node.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block:'start' })
    setActiveId(id)
    setOpen(false)
  }

  const statusText = useMemo(() => {
    if (power === 'lite') return 'Efficiency'
    if (power === 'max') return 'Ultra'
    return 'Balanced'
  },[power])

  if (disabled || sections.length < 2) return null

  return (
    <aside className="esn-smartnav" ref={panelRef} aria-label="Page navigation">
      <div className="esn-smartnav-rail" aria-hidden="true">
        <span style={{'--smart-progress':progress}} />
      </div>

      <button
        className="esn-smartnav-trigger"
        type="button"
        aria-expanded={open}
        aria-controls="esn-smartnav-panel"
        onClick={() => setOpen(value => !value)}
      >
        <span className="esn-smartnav-kicker">YOU ARE HERE</span>
        <strong>{current?.label || 'Explore'}</strong>
        <span className="esn-smartnav-count">{activeIndex + 1}/{sections.length}</span>
      </button>

      {open && (
        <div className="esn-smartnav-panel" id="esn-smartnav-panel">
          <div className="esn-smartnav-head">
            <div>
              <span>PAGE MAP</span>
              <strong>Jump anywhere.</strong>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close page map">×</button>
          </div>

          <div className="esn-smartnav-list">
            {sections.map((section,index) => (
              <button
                type="button"
                key={section.id}
                className={section.id === activeId ? 'is-active' : ''}
                onClick={() => jump(section.id)}
              >
                <span>{String(index + 1).padStart(2,'0')}</span>
                <strong>{section.label}</strong>
              </button>
            ))}
          </div>

          <div className="esn-smartnav-meta">
            <span className={navigator.onLine ? 'is-online' : 'is-offline'}>
              <i /> {navigator.onLine ? 'Online' : 'Offline'}
            </span>
            <span>{statusText} rendering</span>
            <span className="esn-smartnav-shortcut">Alt + J</span>
          </div>
        </div>
      )}
    </aside>
  )
}
