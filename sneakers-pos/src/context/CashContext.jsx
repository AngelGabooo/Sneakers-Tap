// src/context/CashContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { cashRepo } from '../repositories/cashRepo'
import { useNetwork } from './NetworkContext'
import { supabase } from '../lib/supabase'  // ⭐ NUEVO

const CashContext = createContext(null)

export function CashProvider({ children }) {
  const { isOnline } = useNetwork()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const mountedRef = useRef(true)
  const channelRef = useRef(null)  // ⭐ NUEVO

  const loadLocal = useCallback(async () => {
    try {
      const list = await cashRepo.getAllLocal()
      if (mountedRef.current) setSessions(list)
      return list
    } catch (err) {
      console.error('❌ Error cargando cajas locales:', err)
      return []
    }
  }, [])

  const syncRemote = useCallback(async () => {
    if (!isOnline) return
    setSyncing(true)
    try {
      await cashRepo.syncFromSupabase()
      await loadLocal()
    } catch (err) {
      console.warn('⚠️ Sync de cajas falló:', err.message)
    } finally {
      if (mountedRef.current) setSyncing(false)
    }
  }, [isOnline, loadLocal])

  useEffect(() => {
    mountedRef.current = true
    async function init() {
      setLoading(true)
      await loadLocal()
      if (mountedRef.current) setLoading(false)
      if (isOnline) syncRemote()
    }
    init()
    return () => { mountedRef.current = false }
  }, [loadLocal, syncRemote, isOnline])

  useEffect(() => {
    if (!isOnline) return
    const timer = setTimeout(() => syncRemote(), 1500)
    return () => clearTimeout(timer)
  }, [isOnline, syncRemote])

  // ⭐ ============================================================
  // ⭐ REALTIME para cajas
  // ⭐ ============================================================
  useEffect(() => {
    if (!isOnline) return

    let debounceTimer = null
    const scheduleRefresh = (reason) => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(async () => {
        console.log(`🔄 Realtime cash → syncRemote (${reason})`)
        await syncRemote()
      }, 800)
    }

    const channel = supabase
      .channel('cash-realtime')

      // Apertura / cierre de caja
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cash_sessions' },
        (payload) => {
          console.log('💰 Realtime cash_sessions:', payload.eventType)
          scheduleRefresh(`cash_sessions ${payload.eventType}`)
        },
      )

      // Movimientos de caja
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cash_movements' },
        (payload) => {
          console.log('💵 Realtime cash_movements:', payload.eventType)
          scheduleRefresh(`cash_movements ${payload.eventType}`)
        },
      )

      .subscribe((status) => {
        console.log('📡 Realtime cash status:', status)
      })

    channelRef.current = channel

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [isOnline, syncRemote])

  // -----------------------------------------------------------------
  // API
  // -----------------------------------------------------------------

  const getOpenSession = useCallback(
    (cashId) =>
      sessions.find((s) => s.cashId === cashId && s.status === 'open') || null,
    [sessions],
  )

  const getAnyOpenSession = useCallback(
    () => sessions.find((s) => s.status === 'open') || null,
    [sessions],
  )

  const getSessionById = useCallback(
    (id) => sessions.find((s) => s.id === id) || null,
    [sessions],
  )

  const openCash = useCallback(async (payload) => {
    const session = await cashRepo.open(payload)
    setSessions((list) => [session, ...list])
    return session
  }, [])

  const closeCash = useCallback(async (sessionId, payload = {}) => {
    const updated = await cashRepo.close(sessionId, payload)
    setSessions((list) =>
      list.map((s) => (s.id === sessionId ? updated : s)),
    )
    return updated
  }, [])

  const addMovement = useCallback(async (payload) => {
    const movement = await cashRepo.addMovement(payload)
    setSessions((list) =>
      list.map((s) => {
        if (s.id !== payload.sessionId) return s
        return { ...s, movements: [...(s.movements || []), movement] }
      }),
    )
    return movement
  }, [])

  const refresh = useCallback(async () => {
    await loadLocal()
    await syncRemote()
  }, [loadLocal, syncRemote])

  const value = {
    sessions,
    loading,
    syncing,
    getOpenSession,
    getAnyOpenSession,
    getSessionById,
    openCash,
    closeCash,
    addMovement,
    refresh,
  }

  return <CashContext.Provider value={value}>{children}</CashContext.Provider>
}

export function useCash() {
  const ctx = useContext(CashContext)
  if (!ctx) throw new Error('useCash debe usarse dentro de <CashProvider>')
  return ctx
}