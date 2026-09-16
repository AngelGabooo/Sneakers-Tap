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

const SalesContext = createContext(null)

/**
 * Historial de ventas con estrategia offline-first.
 *
 * - Al montar: carga ventas locales + sincroniza con Supabase en background
 * - Al crear/actualizar/cancelar: actualiza local + encola sync
 * - Al reconectar: re-sincroniza desde Supabase
 */
export function SalesProvider({ children }) {
  const { isOnline } = useNetwork()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const mountedRef = useRef(true)

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

  // -----------------------------------------------------------------
  // API
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
    // Genera folio local si no viene
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