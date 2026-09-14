import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const SalesContext = createContext(null)

const STORAGE_KEY = 'sneakers-sales'

/**
 * Historial de ventas.
 * Las ventas son INMUTABLES: si hay un error se crea una devolución o cancelación.
 */
export function SalesProvider({ children }) {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setSales(JSON.parse(raw))
    } catch (e) {
      console.warn('No se pudo leer el historial de ventas:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (loading) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sales))
    } catch (e) {
      console.warn('No se pudo guardar el historial de ventas:', e)
    }
  }, [sales, loading])

  const getSaleById = useCallback(
    (id) => sales.find((s) => s.id === id || s.folio === id) || null,
    [sales],
  )

  /**
   * Registra una venta nueva. Se llama desde el POS.
   */
  const createSale = useCallback((payload) => {
    const now = new Date().toISOString()
    const id = `sale_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const folio = `VTA-${String(Date.now()).slice(-6)}`

    const sale = {
      id,
      folio,
      createdAt: now,
      status: 'completed', // completed | partial_return | returned | cancelled
      ...payload,
    }
    setSales((list) => [sale, ...list])
    return sale
  }, [])

  /**
   * Actualiza el estado de una venta (devolución, cancelación, etc.)
   */
  const updateSale = useCallback((id, patch) => {
    let updated = null
    setSales((list) =>
      list.map((s) => {
        if (s.id !== id) return s
        updated = { ...s, ...patch, updatedAt: new Date().toISOString() }
        return updated
      }),
    )
    return updated
  }, [])

  const clearAll = useCallback(() => setSales([]), [])

  const value = {
    sales,
    loading,
    getSaleById,
    createSale,
    updateSale,
    clearAll,
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