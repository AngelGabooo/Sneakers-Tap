import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const ThemeContext = createContext(null)

const STORAGE_KEY = 'sneakers-theme' // 'light' | 'dark' | null (null = automático)

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  // 'light' | 'dark' | 'system'
  const [mode, setMode] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored || 'system'
  })

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
    return getSystemTheme()
  })

  // Aplica la clase al <html> cuando cambia el tema resuelto
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', resolvedTheme === 'dark')
    root.style.colorScheme = resolvedTheme
  }, [resolvedTheme])

  // Escucha cambios del sistema operativo cuando el modo es 'system'
  useEffect(() => {
    if (mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setResolvedTheme(e.matches ? 'dark' : 'light')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mode])

  // Cuando el usuario cambia manualmente
  const setTheme = useCallback((newMode) => {
    setMode(newMode)
    if (newMode === 'system') {
      localStorage.removeItem(STORAGE_KEY)
      setResolvedTheme(getSystemTheme())
    } else {
      localStorage.setItem(STORAGE_KEY, newMode)
      setResolvedTheme(newMode)
    }
  }, [])

  // Alterna rápido: si está claro → oscuro y viceversa
  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>')
  return ctx
}