import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const MovementsContext = createContext(null)

const STORAGE_KEY = 'sneakers-movements'

/**
 * Bitácora de movimientos de inventario.
 * Los movimientos son INMUTABLES: no se editan ni se eliminan.
 * Si hay un error, se registra un nuevo movimiento correctivo.
 */
export function MovementsProvider({ children }) {
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)

  // Cargar de localStorage al arrancar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setMovements(JSON.parse(raw))
    } catch (e) {
      console.warn('No se pudo leer la bitácora de movimientos:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  // Persistir
  useEffect(() => {
    if (loading) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(movements))
    } catch (e) {
      console.warn('No se pudo guardar la bitácora de movimientos:', e)
    }
  }, [movements, loading])

  /**
   * Registra un movimiento.
   * @param {object} payload
   * @param {string} payload.productId
   * @param {string} payload.productName
   * @param {string} payload.variantId
   * @param {string} payload.variantLabel
   * @param {string} payload.sku
   * @param {string} payload.size
   * @param {string} payload.color
   * @param {number} payload.stockBefore
   * @param {number} payload.stockAfter
   * @param {number} payload.quantity - positivo o negativo
   * @param {'in'|'out'|'adjust'|'return'|'loss'|'damage'|'transfer'} payload.type
   * @param {string} payload.reason
   * @param {string} [payload.note]
   * @param {string} [payload.documentType]
   * @param {string} [payload.documentId]
   * @param {string} [payload.location]
   * @param {string} [payload.userName]
   * @param {string} [payload.userRole]
   */
  const registerMovement = useCallback((payload) => {
    const now = new Date().toISOString()
    const id = `MOV-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

    const movement = {
      id,
      createdAt: now,
      userName: 'Henry',
      userRole: 'Administrador',
      ...payload,
    }
    setMovements((list) => [movement, ...list])
    return movement
  }, [])

  const clearAll = useCallback(() => setMovements([]), [])

  const value = {
    movements,
    loading,
    registerMovement,
    clearAll,
  }

  return (
    <MovementsContext.Provider value={value}>
      {children}
    </MovementsContext.Provider>
  )
}

export function useMovements() {
  const ctx = useContext(MovementsContext)
  if (!ctx) throw new Error('useMovements debe usarse dentro de <MovementsProvider>')
  return ctx
}