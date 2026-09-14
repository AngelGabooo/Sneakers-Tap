import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const WholesaleContext = createContext(null)

const STORAGE_KEY = 'sneakers-wholesale'

/**
 * Directorio de clientes mayoristas.
 * Actualmente persiste en localStorage. Cuando conectes backend,
 * reemplaza el cuerpo de las funciones por llamadas HTTP.
 */
export function WholesaleProvider({ children }) {
  const [wholesales, setWholesales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setWholesales(JSON.parse(raw))
    } catch (e) {
      console.warn('No se pudo leer el directorio de mayoristas:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (loading) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wholesales))
    } catch (e) {
      console.warn('No se pudo guardar el directorio de mayoristas:', e)
    }
  }, [wholesales, loading])

  const getWholesaleById = useCallback(
    (id) => wholesales.find((w) => w.id === id) || null,
    [wholesales],
  )

  const createWholesale = useCallback((payload) => {
    const now = new Date().toISOString()
    const id = `MAY-${String(Date.now()).slice(-5)}`
    const record = {
      id,
      createdAt: now,
      updatedAt: now,
      status: 'active',
      ...payload,
    }
    setWholesales((list) => [record, ...list])
    return record
  }, [])

  const updateWholesale = useCallback((id, patch) => {
    let updated = null
    setWholesales((list) =>
      list.map((w) => {
        if (w.id !== id) return w
        updated = { ...w, ...patch, updatedAt: new Date().toISOString() }
        return updated
      }),
    )
    return updated
  }, [])

  const clearAll = useCallback(() => setWholesales([]), [])

  const value = {
    wholesales,
    loading,
    getWholesaleById,
    createWholesale,
    updateWholesale,
    clearAll,
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