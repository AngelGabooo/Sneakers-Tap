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
import { useAuth } from './AuthContext'
import { VARIANT_STOCK_CHANGED } from '../utils/events'
import { supabase } from '../lib/supabase'

const ProductsContext = createContext(null)

/**
 * Contexto de productos con estrategia offline-first.
 *
 * - Al montar: carga productos locales + sincroniza con Supabase
 * - Al crear/editar/borrar: actualiza local + encola sync
 * - Al vender (VARIANT_STOCK_CHANGED): recarga locales para reflejar stock
 * - Al volver internet: re-sincroniza
 * - ⭐ Realtime: escucha cambios en `products` y `product_variants`
 *    para que la UI se actualice al instante entre dispositivos.
 */
export function ProductsProvider({ children }) {
  const { isOnline } = useNetwork()
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const mountedRef = useRef(true)
  const channelRef = useRef(null)

  // ⭐ FIX: ref para mantener syncRemote accesible dentro del useEffect
  //    sin tener que ponerlo en las dependencias (lo que recrea el canal).
  const syncRemoteRef = useRef(null)

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

  // ⭐ FIX: mantener la ref actualizada SIN disparar el efecto de Realtime
  useEffect(() => {
    syncRemoteRef.current = syncRemote
  }, [syncRemote])

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

  // ⭐ Escuchar cambios de stock locales (disparados al vender/ajustar en ESTE dispositivo)
  useEffect(() => {
    const handler = () => {
      console.log('🔄 Refrescando productos por cambio de stock (local)')
      loadLocal()
    }

    window.addEventListener(VARIANT_STOCK_CHANGED, handler)
    return () => window.removeEventListener(VARIANT_STOCK_CHANGED, handler)
  }, [loadLocal])

  // ⭐ ============================================================
  // ⭐ REALTIME: escucha cambios en `products` y `product_variants`
  //    para actualizar la UI al instante cuando OTRO dispositivo
  //    cambie stock (ej: venta desde otra caja, ajuste manual, etc.)
  // ============================================================
  useEffect(() => {
    if (!isOnline) return
    if (!user) return

    let debounceTimer = null
    const scheduleRefresh = (reason) => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(async () => {
        console.log(`🔄 Realtime products → syncRemote (${reason})`)
        // ⭐ Usar la ref, NO syncRemote directamente
        if (syncRemoteRef.current) {
          await syncRemoteRef.current()
        }
      }, 800)
    }

    // ⭐ Nombre único para evitar conflictos si hay re-montajes
    const channelName = `products-realtime-${Date.now()}`

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('📦 Realtime products:', payload.eventType)
          scheduleRefresh(`products ${payload.eventType}`)
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product_variants' },
        (payload) => {
          console.log('🎨 Realtime product_variants:', payload.eventType)
          scheduleRefresh(`product_variants ${payload.eventType}`)
        },
      )
      .subscribe((status) => {
        console.log('📡 Realtime products status:', status)
      })

    channelRef.current = channel

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  // ⭐ FIX: quitar syncRemote de las deps. Solo dependemos de isOnline y user.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, user])

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