import { createContext, useContext, useState } from 'react'

const ViewContext = createContext(null)

export function ViewProvider({ children, defaultView = 'dashboard' }) {
  const [activeView, setActiveView] = useState(defaultView)
  const [viewParams, setViewParams] = useState({})

  /**
   * Navegación simple entre vistas (mientras migramos a React Router).
   * @param {string} view    - clave de la vista ('dashboard', 'products', etc.)
   * @param {object} params  - parámetros opcionales (ej. { id: 'p_123' })
   */
  const navigate = (view, params = {}) => {
    setActiveView(view)
    setViewParams(params)
  }

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