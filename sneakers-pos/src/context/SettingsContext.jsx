// src/context/SettingsContext.jsx
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { DEFAULT_SETTINGS, mergeSettings, settingsEqual } from '../data/settings'

const SettingsContext = createContext(null)

const STORAGE_KEY = 'sneakers-settings'

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [draft, setDraft] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Cargar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = mergeSettings(DEFAULT_SETTINGS, JSON.parse(raw))
        setSettings(parsed)
        setDraft(parsed)
      }
    } catch (e) {
      console.warn('No se pudo leer la configuración:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  // Persistir
  useEffect(() => {
    if (loading) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (e) {
      console.warn('No se pudo guardar la configuración:', e)
    }
  }, [settings, loading])

  const isDirty = !settingsEqual(settings, draft)

  /** Actualiza una sección del draft */
  const updateSection = useCallback((section, patch) => {
    setDraft((d) => ({
      ...d,
      [section]: { ...d[section], ...patch },
    }))
  }, [])

  /** Reemplaza todo el draft (por ejemplo al agregar sucursal) */
  const updateDraft = useCallback((updater) => {
    setDraft((d) => (typeof updater === 'function' ? updater(d) : updater))
  }, [])

  /** Descarta cambios */
  const discard = useCallback(() => {
    setDraft(settings)
  }, [settings])

  /** Guarda los cambios */
  const save = useCallback(async () => {
    setSaving(true)
    try {
      // TODO: reemplazar por fetch al backend
      await new Promise((r) => setTimeout(r, 500))
      setSettings(draft)
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e?.message || 'Error al guardar' }
    } finally {
      setSaving(false)
    }
  }, [draft])

  /** Reset completo (útil para pruebas) */
  const clearAll = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    setDraft(DEFAULT_SETTINGS)
  }, [])

  const value = {
    settings,
    draft,
    loading,
    saving,
    isDirty,
    updateSection,
    updateDraft,
    discard,
    save,
    clearAll,
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings debe usarse dentro de <SettingsProvider>')
  return ctx
}