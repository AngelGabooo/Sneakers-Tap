// src/context/ProductsContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { productsRepo } from '../repositories/productsRepo'
import { useNetwork } from './NetworkContext'
import { VARIANT_STOCK_CHANGED } from '../utils/events'

const ProductsContext = createContext(null)

/**
 * Contexto de productos con estrategia offline-first.
 *
 * - Al montar: carga productos locales + sincroniza con Supabase
 * - Al crear/editar/borrar: actualiza local + encola sync
 * - Al vender (VARIANT_STOCK_CHANGED): recarga locales para reflejar stock
 * - Al volver internet: re-sincroniza
 */
export function ProductsProvider({ children }) {
  const { isOnline } = useNetwork()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const mountedRef = useRef(true)

  const loadLocal = useCallback(async () => {
    try {
      const list = await productsRepo.getAllLocal()
      if (mountedRef.current) setProducts(list)
      return list
    } catch (err) {
      console.error('❌ Error cargando productos locales:', err)
      return []
    }
  }, [])

  const syncRemote = useCallback(async () => {
    if (!isOnline) return
    setSyncing(true)
    try {
      await productsRepo.syncFromSupabase()
      await loadLocal()
    } catch (err) {
      console.warn('⚠️ Sync de productos falló:', err.message)
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

    return () => {
      mountedRef.current = false
    }
  }, [loadLocal, syncRemote, isOnline])

  // Al reconectar
  useEffect(() => {
    if (!isOnline) return
    const timer = setTimeout(() => syncRemote(), 1500)
    return () => clearTimeout(timer)
  }, [isOnline, syncRemote])

  // ⭐ Escuchar cambios de stock (disparados al vender/ajustar)
  useEffect(() => {
    const handler = () => {
      console.log('🔄 Refrescando productos por cambio de stock')
      loadLocal()
    }

    window.addEventListener(VARIANT_STOCK_CHANGED, handler)
    return () => window.removeEventListener(VARIANT_STOCK_CHANGED, handler)
  }, [loadLocal])

  // API
  const getProductById = useCallback(
    (id) => products.find((p) => p.id === id) || null,
    [products],
  )

  const getProductByCode = useCallback(
    (code) => {
      if (!code) return null
      return products.find((p) => p.sku === code || p.barcode === code) || null
    },
    [products],
  )

  const createProduct = useCallback(async (payload) => {
    const { variants, ...product } = payload
    const created = await productsRepo.create(product, variants || [])
    setProducts((list) => [created, ...list])
    return created
  }, [])

  const updateProduct = useCallback(async (id, payload) => {
    const { variants, ...product } = payload
    const updated = await productsRepo.update(id, product, variants)
    setProducts((list) => list.map((p) => (p.id === id ? updated : p)))
    return updated
  }, [])

  const deleteProduct = useCallback(async (id) => {
    await productsRepo.delete(id)
    setProducts((list) => list.filter((p) => p.id !== id))
  }, [])

  const toggleProductStatus = useCallback(async (id, status) => {
    const updated = await productsRepo.toggleStatus(id, status)
    setProducts((list) =>
      list.map((p) => (p.id === id ? { ...p, status } : p)),
    )
    return updated
  }, [])

  const refresh = useCallback(async () => {
    await loadLocal()
    await syncRemote()
  }, [loadLocal, syncRemote])

  const value = {
    products,
    loading,
    syncing,
    getProductById,
    getProductByCode,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    refresh,
  }

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts debe usarse dentro de <ProductsProvider>')
  return ctx
}