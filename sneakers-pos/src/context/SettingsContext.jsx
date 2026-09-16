// src/context/SettingsContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { DEFAULT_SETTINGS, mergeSettings, settingsEqual } from '../data/settings'
import { settingsRepo } from '../repositories/settingsRepo'
import { useNetwork } from './NetworkContext'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const { isOnline } = useNetwork()
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [draft, setDraft] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const mountedRef = useRef(true)

  // -------------------------------------------------------------
  // Cargar local
  // -------------------------------------------------------------
  const loadLocal = useCallback(async () => {
    try {
      const local = await settingsRepo.getLocal()
      if (local && mountedRef.current) {
        const merged = mergeSettings(DEFAULT_SETTINGS, local)
        setSettings(merged)
        setDraft(merged)
      }
    } catch (err) {
      console.error('❌ Error cargando config local:', err)
    }
  }, [])

  // -------------------------------------------------------------
  // Sync remoto
  // -------------------------------------------------------------
  const syncRemote = useCallback(async () => {
    if (!isOnline) return
    setSyncing(true)
    try {
      const remote = await settingsRepo.syncFromSupabase()
      if (remote && mountedRef.current) {
        const merged = mergeSettings(DEFAULT_SETTINGS, remote)
        setSettings(merged)
        setDraft(merged)
      }
    } catch (err) {
      console.warn('⚠️ Sync de settings falló:', err.message)
    } finally {
      if (mountedRef.current) setSyncing(false)
    }
  }, [isOnline])

  // -------------------------------------------------------------
  // Al montar
  // -------------------------------------------------------------
  useEffect(() => {
    mountedRef.current = true

    async function init() {
      setLoading(true)
      await loadLocal()
      if (mountedRef.current) setLoading(false)

      // Sync remoto en background
      if (isOnline) syncRemote()
    }

    init()

    return () => {
      mountedRef.current = false
    }
  }, [loadLocal, syncRemote, isOnline])

  // -------------------------------------------------------------
  // Al reconectar
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isOnline) return
    const timer = setTimeout(() => syncRemote(), 1500)
    return () => clearTimeout(timer)
  }, [isOnline, syncRemote])

  // -------------------------------------------------------------
  // API
  // -------------------------------------------------------------

  const isDirty = !settingsEqual(settings, draft)

  const updateSection = useCallback((section, patch) => {
    setDraft((d) => ({
      ...d,
      [section]: { ...d[section], ...patch },
    }))
  }, [])

  const updateDraft = useCallback((updater) => {
    setDraft((d) => (typeof updater === 'function' ? updater(d) : updater))
  }, [])

  const discard = useCallback(() => {
    setDraft(settings)
  }, [settings])

  const save = useCallback(async () => {
    setSaving(true)
    try {
      await settingsRepo.save(draft)
      setSettings(draft)
      return { ok: true }
    } catch (e) {
      console.error('❌ Error al guardar configuración:', e)
      return { ok: false, error: e?.message || 'Error al guardar' }
    } finally {
      setSaving(false)
    }
  }, [draft])

  const refresh = useCallback(async () => {
    await loadLocal()
    await syncRemote()
  }, [loadLocal, syncRemote])

  const clearAll = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS)
    setDraft(DEFAULT_SETTINGS)
    await settingsRepo.save(DEFAULT_SETTINGS)
  }, [])

  const value = {
    settings,
    draft,
    loading,
    saving,
    syncing,
    isDirty,
    updateSection,
    updateDraft,
    discard,
    save,
    refresh,
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