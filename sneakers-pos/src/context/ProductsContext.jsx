import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const ProductsContext = createContext(null)

const STORAGE_KEY = 'sneakers-products'

/**
 * Contexto de productos.
 * Actualmente usa localStorage como almacén temporal para pruebas locales.
 * Cuando conectes el backend, solo reemplaza el cuerpo de las funciones
 * por llamadas fetch/axios y mantén la misma firma.
 */
export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Cargar de localStorage al arrancar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setProducts(JSON.parse(raw))
    } catch (e) {
      console.warn('No se pudo leer el almacén de productos:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  // Persistir cada vez que cambian
  useEffect(() => {
    if (loading) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
    } catch (e) {
      console.warn('No se pudo guardar el almacén de productos:', e)
    }
  }, [products, loading])

  // -------------------------------------------------------------
  // API expuesta
  // -------------------------------------------------------------

  const getProductById = useCallback(
    (id) => products.find((p) => p.id === id) || null,
    [products],
  )

  const createProduct = useCallback((payload) => {
    const now = new Date().toISOString()
    const id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const product = {
      id,
      createdAt: now,
      updatedAt: now,
      updatedBy: 'Henry',
      ...payload,
    }
    setProducts((list) => [product, ...list])
    return product
  }, [])

  const updateProduct = useCallback((id, payload) => {
    let updated = null
    setProducts((list) =>
      list.map((p) => {
        if (p.id !== id) return p
        updated = {
          ...p,
          ...payload,
          updatedAt: new Date().toISOString(),
          updatedBy: 'Henry',
        }
        return updated
      }),
    )
    return updated
  }, [])

  const deleteProduct = useCallback((id) => {
    setProducts((list) => list.filter((p) => p.id !== id))
  }, [])

  const clearAll = useCallback(() => setProducts([]), [])

  const value = {
    products,
    loading,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    clearAll,
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