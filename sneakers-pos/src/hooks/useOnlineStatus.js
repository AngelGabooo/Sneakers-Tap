// src/hooks/useOnlineStatus.js
import { useEffect, useState, useRef } from 'react'

const PING_URL = (import.meta.env.VITE_SUPABASE_URL || '') + '/rest/v1/'
const PING_INTERVAL_MS = 5 * 60 * 1000   // ⭐ 5 minutos (antes 30s)
const PING_TIMEOUT_MS = 5000

async function pingInternet() {
  if (!PING_URL.startsWith('http')) return false

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS)

  try {
    await fetch(PING_URL, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
      credentials: 'omit',
    })
    return true
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    let intervalId = null

    async function check() {
      // ⭐ No pingear si la pestaña no está visible
      if (document.hidden) return
      const ok = await pingInternet()
      if (mountedRef.current) setIsOnline(ok)
    }

    const handleOnline = () => check()
    const handleOffline = () => {
      if (mountedRef.current) setIsOnline(false)
    }
    const handleVisibility = () => {
      if (!document.hidden) check()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    document.addEventListener('visibilitychange', handleVisibility)

    check()
    intervalId = setInterval(check, PING_INTERVAL_MS)

    return () => {
      mountedRef.current = false
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('visibilitychange', handleVisibility)
      if (intervalId) clearInterval(intervalId)
    }
  }, [])

  return isOnline
}