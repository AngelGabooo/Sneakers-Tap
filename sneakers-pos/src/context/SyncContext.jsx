// src/context/SyncContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { processQueue, subscribe, forceSync } from '../services/sync/syncEngine'
import { syncQueue } from '../services/sync/syncQueue'
import { useNetwork } from './NetworkContext'

const SyncContext = createContext(null)

export function SyncProvider({ children }) {
  const { isOnline } = useNetwork()
  const [pending, setPending] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [lastSyncAt, setLastSyncAt] = useState(null)
  const [lastError, setLastError] = useState(null)

  /**
   * Refresca el contador de pendientes.
   */
  const refreshPending = useCallback(async () => {
    try {
      const count = await syncQueue.countPending()
      setPending(count)
    } catch (err) {
      console.warn('Error contando pendientes:', err)
    }
  }, [])

  /**
   * Sincronización manual.
   */
  const syncNow = useCallback(async () => {
    if (!isOnline) return { ok: false, error: 'Sin conexión' }
    const result = await processQueue()
    await refreshPending()
    return result
  }, [isOnline, refreshPending])

  // Suscribirse a eventos del motor
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      switch (event.type) {
        case 'start':
          setSyncing(true)
          setLastError(null)
          break
        case 'done':
          setSyncing(false)
          setLastSyncAt(new Date().toISOString())
          refreshPending()
          break
        case 'idle':
          setSyncing(false)
          break
        case 'error':
          setSyncing(false)
          setLastError(event.error)
          break
        default:
          break
      }
    })
    return unsubscribe
  }, [refreshPending])

  // Refrescar pendientes al montar
  useEffect(() => {
    refreshPending()
  }, [refreshPending])

  // Cuando vuelve internet → sincronizar automáticamente
  useEffect(() => {
    if (!isOnline) return

    let cancelled = false

    async function run() {
      if (cancelled) return
      try {
        await processQueue()
        if (!cancelled) {
          await refreshPending()
        }
      } catch (err) {
        console.warn('Sync auto falló:', err)
      }
    }

    // Pequeño delay para no bloquear el primer render
    const timer = setTimeout(run, 2000)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [isOnline, refreshPending])

  return (
    <SyncContext.Provider
      value={{
        pending,
        syncing,
        lastSyncAt,
        lastError,
        isOnline,
        syncNow,
        refreshPending,
      }}
    >
      {children}
    </SyncContext.Provider>
  )
}

export function useSync() {
  const ctx = useContext(SyncContext)
  if (!ctx) throw new Error('useSync debe usarse dentro de <SyncProvider>')
  return ctx
}