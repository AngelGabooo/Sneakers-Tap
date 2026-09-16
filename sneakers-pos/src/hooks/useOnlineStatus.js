// src/hooks/useOnlineStatus.js
import { useEffect, useState } from 'react'

/**
 * Hook que detecta si hay conexión REAL a internet.
 *
 * ⚠️  navigator.onLine NO es confiable (dice "true" si estás conectado
 *     al WiFi aunque el WiFi no tenga internet).
 *
 * Solución: hacemos un ping HTTP al endpoint /rest/v1/ de Supabase.
 * Si responde en < 5s → online. Si falla → offline.
 */

const PING_URL =
  (import.meta.env.VITE_SUPABASE_URL || '') + '/rest/v1/'

const PING_INTERVAL_MS = 30000   // 30 segundos
const PING_TIMEOUT_MS = 5000     // 5 segundos máximo

async function pingInternet() {
  if (!PING_URL.startsWith('http')) return false

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS)

  try {
    await fetch(PING_URL, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store',
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

  useEffect(() => {
    let mounted = true
    let intervalId = null

    async function check() {
      const ok = await pingInternet()
      if (mounted) setIsOnline(ok)
    }

    // Eventos del navegador (rápidos pero poco confiables)
    const handleOnline = () => check()
    const handleOffline = () => {
      if (mounted) setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Chequeo inicial + polling cada 30s
    check()
    intervalId = setInterval(check, PING_INTERVAL_MS)

    return () => {
      mounted = false
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (intervalId) clearInterval(intervalId)
    }
  }, [])

  return isOnline
}