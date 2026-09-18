// src/context/CreditContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { creditRepo } from '../repositories/creditRepo'
import { useNetwork } from './NetworkContext'
import { supabase } from '../lib/supabase'

const CreditContext = createContext(null)

export function CreditProvider({ children }) {
  const { isOnline } = useNetwork()
  const [credits, setCredits] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const mountedRef = useRef(true)
  const channelRef = useRef(null)

  const loadLocal = useCallback(async () => {
    try {
      const list = await creditRepo.getAllLocal()
      if (mountedRef.current) setCredits(list)
      return list
    } catch (err) {
      console.error('❌ Error cargando créditos locales:', err)
      return []
    }
  }, [])

  const syncRemote = useCallback(async () => {
    if (!isOnline) return
    setSyncing(true)
    try {
      await creditRepo.syncFromSupabase()
      await loadLocal()
    } catch (err) {
      console.warn('⚠️ Sync de créditos falló:', err.message)
    } finally {
      if (mountedRef.current) setSyncing(false)
    }
  }, [isOnline, loadLocal])

  // Al montar
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

  // Al reconectar
  useEffect(() => {
    if (!isOnline) return
    const t = setTimeout(() => syncRemote(), 1500)
    return () => clearTimeout(t)
  }, [isOnline, syncRemote])

  // ⭐ Realtime
  useEffect(() => {
    if (!isOnline) return

    let debounceTimer = null
    const scheduleRefresh = (reason) => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(async () => {
        console.log(`🔄 Realtime credit → syncRemote (${reason})`)
        await syncRemote()
      }, 800)
    }

    const channel = supabase
      .channel('credit-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customer_credits' },
        (payload) => {
          console.log('💳 Realtime customer_credits:', payload.eventType)
          scheduleRefresh(`customer_credits ${payload.eventType}`)
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'credit_payments' },
        (payload) => {
          console.log('💰 Realtime credit_payments:', payload.eventType)
          scheduleRefresh(`credit_payments ${payload.eventType}`)
        },
      )
      .subscribe((status) => {
        console.log('📡 Realtime credit status:', status)
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

  const getCreditById = useCallback(
    (id) => credits.find((c) => c.id === id) || null,
    [credits],
  )

  const getActiveByCustomer = useCallback(
    (customerId) => credits.find(
      (c) => c.customerId === customerId && (c.status === 'active' || c.status === 'overdue'),
    ) || null,
    [credits],
  )

  const getByCustomer = useCallback(
    (customerId) => credits.filter((c) => c.customerId === customerId),
    [credits],
  )

  const createCredit = useCallback(async ({ credit, receivedBy }) => {
    const created = await creditRepo.create({ credit, receivedBy })
    setCredits((list) => [created, ...list])
    return created
  }, [])

  // ⭐ NUEVO: registrar un CARGO (venta a crédito)
  const registerCharge = useCallback(async ({ charge, receivedBy }) => {
    const updated = await creditRepo.registerCharge({ charge, receivedBy })
    setCredits((list) =>
      list.map((c) => (c.id === updated.id ? updated : c)),
    )
    return updated
  }, [])

  const registerPayment = useCallback(async ({ payment, receivedBy }) => {
    const result = await creditRepo.registerPayment({ payment, receivedBy })
    setCredits((list) =>
      list.map((c) => (c.id === result.credit.id ? result.credit : c)),
    )
    return result
  }, [])

  const cancelCredit = useCallback(async (id, options) => {
    const updated = await creditRepo.cancel(id, options)
    setCredits((list) => list.map((c) => (c.id === id ? updated : c)))
    return updated
  }, [])

  const refresh = useCallback(async () => {
    await loadLocal()
    await syncRemote()
  }, [loadLocal, syncRemote])

  // -----------------------------------------------------------------
  // Stats calculados
  // -----------------------------------------------------------------
  const stats = useMemo(() => {
    const active = credits.filter((c) => c.status === 'active')
    const overdue = credits.filter((c) => c.status === 'overdue')
    const paid = credits.filter((c) => c.status === 'paid')

    const totalLent = credits
      .filter((c) => c.status !== 'cancelled')
      .reduce((a, c) => a + Number(c.amount || 0), 0)
    const totalCollected = credits
      .filter((c) => c.status !== 'cancelled')
      .reduce((a, c) => a + Number(c.paidAmount || 0), 0)
    const totalPending = active.concat(overdue)
      .reduce((a, c) => a + Number(c.outstanding || 0), 0)

    return {
      activeCount: active.length,
      overdueCount: overdue.length,
      paidCount: paid.length,
      totalLent,
      totalCollected,
      totalPending,
    }
  }, [credits])

  // Cuentas vencidas (para badge en Sidebar)
  const overdueCount = useMemo(
    () => credits.filter((c) => c.status === 'overdue').length,
    [credits],
  )

  const value = {
    credits,
    loading,
    syncing,
    stats,
    overdueCount,
    getCreditById,
    getActiveByCustomer,
    getByCustomer,
    createCredit,
    registerCharge,        // ⭐ NUEVO
    registerPayment,
    cancelCredit,
    refresh,
  }

  return <CreditContext.Provider value={value}>{children}</CreditContext.Provider>
}

export function useCredit() {
  const ctx = useContext(CreditContext)
  if (!ctx) throw new Error('useCredit debe usarse dentro de <CreditProvider>')
  return ctx
}