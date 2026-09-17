// src/context/SalesContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { salesRepo } from '../repositories/salesRepo'
import { useNetwork } from './NetworkContext'
import { supabase } from '../lib/supabase'

const SalesContext = createContext(null)

export function SalesProvider({ children }) {
  const { isOnline } = useNetwork()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const mountedRef = useRef(true)
  const channelRef = useRef(null)

  // -------------------------------------------------------------
  // Carga local desde IndexedDB (rápida)
  // -------------------------------------------------------------
  const loadLocal = useCallback(async () => {
    try {
      const list = await salesRepo.getAllLocal()
      if (mountedRef.current) setSales(list)
      return list
    } catch (err) {
      console.error('❌ Error cargando ventas locales:', err)
      return []
    }
  }, [])

  // -------------------------------------------------------------
  // Sincronización remota (Supabase → IndexedDB → state)
  // ⭐ Es la ÚNICA que trae datos nuevos de la nube
  // -------------------------------------------------------------
  const syncRemote = useCallback(async () => {
    if (!isOnline) return
    setSyncing(true)
    try {
      await salesRepo.syncFromSupabase()
      await loadLocal()
    } catch (err) {
      console.warn('⚠️ Sync de ventas falló:', err.message)
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
    const timer = setTimeout(() => syncRemote(), 1500)
    return () => clearTimeout(timer)
  }, [isOnline, syncRemote])

  // ============================================================
  // ⭐ REALTIME: escucha cambios en `sales` y `sale_items`
  //    Cada evento dispara syncRemote() (con debounce) que:
  //      1. Baja datos nuevos de Supabase → IndexedDB
  //      2. Lee IndexedDB → state
  //      3. React re-renderiza
  // ============================================================
  useEffect(() => {
    if (!isOnline) return

    // ⭐ Debounce: agrupa ráfagas de eventos (venta + N items + update)
    //    en UNA sola sincronización 800ms después del último evento.
    let debounceTimer = null
    const scheduleRefresh = (reason) => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(async () => {
        console.log(`🔄 Realtime → syncRemote (${reason})`)
        await syncRemote()
      }, 800)
    }

    const channel = supabase
      .channel('sales-realtime')

      // ---------- INSERT sale ----------
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sales' },
        (payload) => {
          console.log('🆕 Realtime INSERT sale:', payload.new?.folio)
          scheduleRefresh('INSERT sale')
        },
      )

      // ---------- UPDATE sale (ej: cancelada) ----------
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sales' },
        (payload) => {
          console.log('🔄 Realtime UPDATE sale:', payload.new?.folio)
          scheduleRefresh('UPDATE sale')
        },
      )

      // ---------- DELETE sale ----------
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'sales' },
        (payload) => {
          console.log('🗑️ Realtime DELETE sale:', payload.old?.id)
          scheduleRefresh('DELETE sale')
        },
      )

      // ---------- INSERT sale_items (los items se insertan después) ----------
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sale_items' },
        () => {
          scheduleRefresh('INSERT sale_item')
        },
      )

      .subscribe((status) => {
        console.log('📡 Realtime sales status:', status)
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
  // API pública
  // -----------------------------------------------------------------

  const getSaleById = useCallback(
    (id) => sales.find((s) => s.id === id || s.folio === id) || null,
    [sales],
  )

  const getSalesByCashSession = useCallback(
    (cashSessionId) => sales.filter((s) => s.cashSessionId === cashSessionId),
    [sales],
  )

  const createSale = useCallback(async (payload) => {
    const folio = payload.folio || await salesRepo.nextLocalFolio()
    const created = await salesRepo.create({ ...payload, folio })
    setSales((list) => [created, ...list])
    return created
  }, [])

  const updateSale = useCallback(async (id, patch) => {
    const updated = await salesRepo.update(id, patch)
    setSales((list) => list.map((s) => (s.id === id ? updated : s)))
    return updated
  }, [])

  const cancelSale = useCallback(async (id, options) => {
    const updated = await salesRepo.cancel(id, options)
    setSales((list) => list.map((s) => (s.id === id ? updated : s)))
    return updated
  }, [])

  const deleteSale = useCallback(async (id) => {
    await salesRepo.delete(id)
    setSales((list) => list.filter((s) => s.id !== id))
  }, [])

  const refresh = useCallback(async () => {
    await loadLocal()
    await syncRemote()
  }, [loadLocal, syncRemote])

  const value = {
    sales,
    loading,
    syncing,
    getSaleById,
    getSalesByCashSession,
    createSale,
    updateSale,
    cancelSale,
    deleteSale,
    refresh,
  }

  return (
    <SalesContext.Provider value={value}>
      {children}
    </SalesContext.Provider>
  )
}

export function useSales() {
  const ctx = useContext(SalesContext)
  if (!ctx) throw new Error('useSales debe usarse dentro de <SalesProvider>')
  return ctx
}