import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const CashContext = createContext(null)

const STORAGE_KEY = 'sneakers-cash-sessions'

/**
 * Sesiones de caja.
 * Una sesión representa una jornada de operación en una caja específica.
 */
export function CashProvider({ children }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setSessions(JSON.parse(raw))
    } catch (e) {
      console.warn('No se pudo leer las sesiones de caja:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (loading) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
    } catch (e) {
      console.warn('No se pudo guardar las sesiones de caja:', e)
    }
  }, [sessions, loading])

  /** Devuelve la sesión abierta de una caja concreta, si existe. */
  const getOpenSession = useCallback(
    (cashId) =>
      sessions.find((s) => s.cashId === cashId && s.status === 'open') || null,
    [sessions],
  )

  /** Devuelve cualquier sesión abierta en el sistema (la primera que encuentre). */
  const getAnyOpenSession = useCallback(
    () => sessions.find((s) => s.status === 'open') || null,
    [sessions],
  )

  const getSessionById = useCallback(
    (id) => sessions.find((s) => s.id === id) || null,
    [sessions],
  )

  /**
   * Abre una caja: crea una sesión nueva con estado 'open'.
   */
  const openCash = useCallback((payload) => {
    const now = new Date().toISOString()
    const id = `CAJ-${String(Date.now()).slice(-6)}`

    const session = {
      id,
      cashId: payload.cashId,
      cashLabel: payload.cashLabel,
      branch: payload.branch,
      responsibleId: payload.responsibleId || null,
      responsibleName: payload.responsibleName,
      responsibleRole: payload.responsibleRole,
      openedAt: now,
      openedBy: payload.openedBy || payload.responsibleName,
      initialFund: Number(payload.initialFund) || 0,
      breakdown: payload.breakdown || null,
      note: payload.note || '',
      status: 'open',
      closedAt: null,
      closedBy: null,
      sales: [],
      movements: [
        {
          type: 'opening',
          label: 'Apertura de caja',
          amount: Number(payload.initialFund) || 0,
          at: now,
          by: payload.responsibleName,
        },
      ],
    }

    setSessions((list) => [session, ...list])
    return session
  }, [])

  /**
   * Cierra una sesión de caja.
   */
  const closeCash = useCallback((sessionId, payload = {}) => {
    const now = new Date().toISOString()
    let updated = null
    setSessions((list) =>
      list.map((s) => {
        if (s.id !== sessionId) return s
        updated = {
          ...s,
          status: 'closed',
          closedAt: now,
          closedBy: payload.closedBy || s.responsibleName,
          closingFund: Number(payload.closingFund) || null,
          closingNotes: payload.notes || '',
        }
        return updated
      }),
    )
    return updated
  }, [])

  const clearAll = useCallback(() => setSessions([]), [])

  const value = {
    sessions,
    loading,
    getOpenSession,
    getAnyOpenSession,
    getSessionById,
    openCash,
    closeCash,
    clearAll,
  }

  return <CashContext.Provider value={value}>{children}</CashContext.Provider>
}

export function useCash() {
  const ctx = useContext(CashContext)
  if (!ctx) throw new Error('useCash debe usarse dentro de <CashProvider>')
  return ctx
}