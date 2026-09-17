// src/context/WholesaleContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { wholesaleRepo } from '../repositories/wholesaleRepo'
import { useNetwork } from './NetworkContext'

const WholesaleContext = createContext(null)

export function WholesaleProvider({ children }) {
  const { isOnline } = useNetwork()
  const [wholesales, setWholesales] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const mountedRef = useRef(true)

  // ---------------------------------------------------------
  // Cargar locales
  // ---------------------------------------------------------
  const loadLocal = useCallback(async () => {
    try {
      const list = await wholesaleRepo.getAllLocal()
      if (mountedRef.current) setWholesales(list)
      return list
    } catch (err) {
      console.error('❌ Error cargando mayoristas locales:', err)
      return []
    }
  }, [])

  // ---------------------------------------------------------
  // Sync remoto
  // ---------------------------------------------------------
  const syncRemote = useCallback(async () => {
    if (!isOnline) return
    setSyncing(true)
    try {
      await wholesaleRepo.syncFromSupabase()
      await loadLocal()
    } catch (err) {
      console.warn('⚠️ Sync de mayoristas falló:', err.message)
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

  // ---------------------------------------------------------
  // API
  // ---------------------------------------------------------
  const getWholesaleById = useCallback(
    (id) => wholesales.find((w) => w.id === id) || null,
    [wholesales],
  )

  const getWholesaleByCode = useCallback(
    (code) =>
      wholesales.find(
        (w) => (w.code || '').toLowerCase() === (code || '').toLowerCase(),
      ) || null,
    [wholesales],
  )

  const createWholesale = useCallback(async (payload) => {
    const created = await wholesaleRepo.create(payload)
    setWholesales((list) => [created, ...list])
    return created
  }, [])

  const updateWholesale = useCallback(async (id, patch) => {
    const updated = await wholesaleRepo.update(id, patch)
    setWholesales((list) =>
      list.map((w) => (w.id === id ? { ...w, ...patch } : w)),
    )
    return updated
  }, [])

  const deleteWholesale = useCallback(async (id) => {
    await wholesaleRepo.delete(id)
    setWholesales((list) => list.filter((w) => w.id !== id))
  }, [])

  const refresh = useCallback(async () => {
    await loadLocal()
    await syncRemote()
  }, [loadLocal, syncRemote])

  const value = {
    wholesales,
    loading,
    syncing,
    getWholesaleById,
    getWholesaleByCode,
    createWholesale,
    updateWholesale,
    deleteWholesale,
    refresh,
  }

  return (
    <WholesaleContext.Provider value={value}>
      {children}
    </WholesaleContext.Provider>
  )
}

export function useWholesale() {
  const ctx = useContext(WholesaleContext)
  if (!ctx) throw new Error('useWholesale debe usarse dentro de <WholesaleProvider>')
  return ctx
}