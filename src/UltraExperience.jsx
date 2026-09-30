import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import './ultraExperience.css'

function routeZone(pathname) {
  if (pathname.startsWith('/smp') || pathname.startsWith('/store')) return 'smp'
  if (['/arcade','/esclicker','/esfactory','/esmines','/esmoto','/estower','/estowerdefense'].includes(pathname)) return 'arcade'
  if (pathname.startsWith('/site-builder') || pathname.startsWith('/services') || pathname === '/portfolio') return 'studio'
  if (pathname.startsWith('/staff') || pathname.startsWith('/operations') || pathname.startsWith('/diagnostics')) return 'ops'
  if (pathname.startsWith('/estools') || pathname.startsWith('/tools')) return 'tools'
  if (pathname.startsWith('/nexus') || pathname.startsWith('/vault')) return 'nexus'
  return 'network'
}

export default function UltraExperience() {
  const location = useLocation()
  const raf = useRef(0)

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('esn-ultra')
    return () => {
      root.classList.remove('esn-ultra')
      delete root.dataset.ultraZone
      root.style.removeProperty('--ultra-scroll')
      root.style.removeProperty('--ultra-x')
      root.style.removeProperty('--ultra-y')
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.ultraZone = routeZone(location.pathname)
    root.classList.remove('ultra-route-enter')
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => root.classList.add('ultra-route-enter'))
    const timer = window.setTimeout(() => root.classList.remove('ultra-route-enter'), 620)
    return () => {
      cancelAnimationFrame(raf.current)
      window.clearTimeout(timer)
    }
  }, [location.pathname])

  useEffect(() => {
    const root = document.documentElement
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    const syncScroll = () => {
      const doc = document.documentElement
      const max = Math.max(1, doc.scrollHeight - window.innerHeight)
      root.style.setProperty('--ultra-scroll', String(Math.min(1, Math.max(0, window.scrollY / max))))
    }

    const syncPointer = (event) => {
      root.style.setProperty('--ultra-x', `${event.clientX}px`)
      root.style.setProperty('--ultra-y', `${event.clientY}px`)
    }

    syncScroll()
    window.addEventListener('scroll', syncScroll, { passive: true })
    window.addEventListener('resize', syncScroll, { passive: true })
    if (finePointer && !reduceMotion) window.addEventListener('pointermove', syncPointer, { passive: true })

    return () => {
      window.removeEventListener('scroll', syncScroll)
      window.removeEventListener('resize', syncScroll)
      window.removeEventListener('pointermove', syncPointer)
    }
  }, [])

  useEffect(() => {
    const targets = [...document.querySelectorAll(
      'main .page-hero, main .section, main article, main .split-panel, main .connection-card, main .store-security'
    )]

    const mobile = window.matchMedia('(max-width: 860px), (pointer: coarse)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    targets.forEach((node, index) => {
      node.classList.add('esn-ultra-reveal')
      node.style.setProperty('--ultra-delay', `${Math.min(index % 5, 4) * 36}ms`)
    })

    // Never hide mobile sections behind IntersectionObserver. Mobile browsers
    // can change their visual viewport while ESN's fixed navigation is active,
    // which can leave valid sections permanently at opacity .001.
    if (mobile || reduced || !('IntersectionObserver' in window)) {
      targets.forEach(node => node.classList.add('is-ultra-visible'))
      return
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-ultra-visible')
        observer.unobserve(entry.target)
      })
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 })

    targets.forEach(node => observer.observe(node))
    return () => observer.disconnect()
  }, [location.pathname])

  return (
    <div className="esn-ultra-layer" aria-hidden="true">
      <div className="esn-ultra-progress" />
      <div className="esn-ultra-noise" />
      <div className="esn-ultra-aurora ultra-aurora-a" />
      <div className="esn-ultra-aurora ultra-aurora-b" />
      <div className="esn-ultra-pointer" />
    </div>
  )
}
