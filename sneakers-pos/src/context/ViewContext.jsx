// src/context/ViewContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

const ViewContext = createContext(null)

export function ViewProvider({ children, defaultView = 'dashboard' }) {
  const [activeView, setActiveView] = useState(defaultView)
  const [viewParams, setViewParams] = useState({})

  /**
   * Navegación simple entre vistas.
   */
  const navigate = (view, params = {}) => {
    setActiveView(view)
    setViewParams(params)
  }

  // ⭐ Exponer navigate globalmente para el Service Worker
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__viewNavigate = (view, params = {}) => {
        console.log('🔔 Navegando por notificación a:', view)
        navigate(view, params)
      }
    }
    return () => {
      delete window.__viewNavigate
    }
  }, [])

  // ⭐ Leer vista pendiente al montar (app abierta por click en notif)
  useEffect(() => {
    const pending = sessionStorage.getItem('pendingNotificationView')
    if (pending) {
      sessionStorage.removeItem('pendingNotificationView')
      console.log('🔔 Vista pendiente:', pending)
      setActiveView(pending)
    }
  }, [])

  return (
    <ViewContext.Provider value={{ activeView, viewParams, setActiveView, navigate }}>
      {children}
    </ViewContext.Provider>
  )
}

export function useView() {
  const ctx = useContext(ViewContext)
  if (!ctx) throw new Error('useView debe usarse dentro de <ViewProvider>')
  return ctx
}