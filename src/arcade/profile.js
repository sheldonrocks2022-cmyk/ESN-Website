import { useEffect, useState } from 'react'

const KEY = 'esn_arcade_profile_v2'

function read() {
  try {
    return { coins: 250, xp: 0, level: 1, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return { coins: 250, xp: 0, level: 1 }
  }
}

export function useArcadeProfile() {
  const [profile, setProfile] = useState(read)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(profile))
  }, [profile])

  const earn = (coins, xp = 1) => setProfile((p) => {
    const nextXp = p.xp + xp
    return {
      ...p,
      coins: p.coins + coins,
      xp: nextXp,
      level: Math.max(p.level, 1 + Math.floor(Math.sqrt(nextXp / 75))),
    }
  })

  const spend = (coins) => {
    if (profile.coins < coins) return false
    setProfile((p) => ({ ...p, coins: Math.max(0, p.coins - coins) }))
    return true
  }

  return { profile, earn, spend }
}

export function readGame(key, fallback) {
  try { return { ...fallback, ...JSON.parse(localStorage.getItem(key) || '{}') } }
  catch { return fallback }
}

export function saveGame(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}
