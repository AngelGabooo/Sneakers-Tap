// src/context/UsersContext.jsx
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { usersRepo } from '../repositories/usersRepo'
import { useNetwork } from './NetworkContext'

const UsersContext = createContext(null)

// Claves de localStorage para lo que aún no migramos
const SESSIONS_KEY = 'sneakers-user-sessions'
const ACTIVITY_KEY = 'sneakers-user-activity'

export function UsersProvider({ children }) {
  const { isOnline } = useNetwork()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const mountedRef = useRef(true)

  // ---------------------------------------------------------
  // Cargar usuarios locales
  // ---------------------------------------------------------
  const loadLocal = useCallback(async () => {
    try {
      const list = await usersRepo.getAllLocal()
      if (mountedRef.current) setUsers(list)
      return list
    } catch (err) {
      console.error('❌ Error cargando usuarios locales:', err)
      return []
    }
  }, [])

  // ---------------------------------------------------------
  // Sync desde Supabase
  // ---------------------------------------------------------
  const syncRemote = useCallback(async () => {
    if (!isOnline) return
    setSyncing(true)
    try {
      await usersRepo.syncFromSupabase()
      await loadLocal()
    } catch (err) {
      console.warn('⚠️ Sync de usuarios falló:', err.message)
    } finally {
      if (mountedRef.current) setSyncing(false)
    }
  }, [isOnline, loadLocal])

  // Al montar
  useEffect(() => {
    mountedRef.current = true
    async function init() {
      setLoading(true)
      await loadLocal()
      if (mountedRef.current) setLoading(false)
      if (isOnline) syncRemote()
    }
    init()
    return () => { mountedRef.current = false }
  }, [loadLocal, syncRemote, isOnline])

  // Al reconectar
  useEffect(() => {
    if (!isOnline) return
    const t = setTimeout(() => syncRemote(), 1500)
    return () => clearTimeout(t)
  }, [isOnline, syncRemote])

  // ---------------------------------------------------------
  // Lectura
  // ---------------------------------------------------------
  const getUserById = useCallback(
    (id) => users.find((u) => u.id === id) || null,
    [users],
  )

  const getUserByEmail = useCallback(
    (email) =>
      users.find(
        (u) => (u.email || '').toLowerCase() === (email || '').trim().toLowerCase(),
      ) || null,
    [users],
  )

  // ---------------------------------------------------------
  // Crear
  // ---------------------------------------------------------
  const createUser = useCallback(async (payload) => {
    const created = await usersRepo.create(payload)
    setUsers((list) => [created, ...list])
    return created
  }, [])

  // ---------------------------------------------------------
  // Actualizar
  // ---------------------------------------------------------
  const updateUser = useCallback(async (id, patch) => {
    const updated = await usersRepo.update(id, patch)
    setUsers((list) =>
      list.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    )
    return updated
  }, [])

  // ---------------------------------------------------------
  // Cambiar estado
  // ---------------------------------------------------------
  const changeStatus = useCallback(async (id, status) => {
    await usersRepo.changeStatus(id, status)
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, status } : u)))
    return true
  }, [])

  // ---------------------------------------------------------
  // Restablecer acceso (contraseña)
  // ---------------------------------------------------------
  const resetAccess = useCallback(async (id, newPassword) => {
    try {
      const { authService } = await import('../services/authService')
      // Nota: solo funciona para el propio usuario; para otros requiere Admin API
      // Aquí lo dejamos como "pendiente" si es otro usuario
      console.warn('⚠️ resetAccess: pendiente de implementar con Admin API')
      return { ok: false, reason: 'no-implementado' }
    } catch (err) {
      console.error('Error resetAccess:', err)
      return { ok: false, reason: err.message }
    }
  }, [])

  // ---------------------------------------------------------
  // Eliminar
  // ---------------------------------------------------------
  const deleteUser = useCallback(async (id) => {
    await usersRepo.delete(id)
    setUsers((list) => list.filter((u) => u.id !== id))
  }, [])

  const clearAll = useCallback(() => setUsers([]), [])

  // ---------------------------------------------------------
  // Sesiones (SIGUE EN LOCALSTORAGE POR AHORA)
  // ---------------------------------------------------------
  const getUserSessions = useCallback((userId) => {
    try {
      const all = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '{}')
      return all[userId] || []
    } catch { return [] }
  }, [])

  const closeRemoteSession = useCallback((userId, sessionId, reason = 'Cierre remoto por administrador') => {
    try {
      const all = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '{}')
      const list = all[userId] || []
      all[userId] = list.map((s) =>
        s.id === sessionId && !s.endedAt
          ? { ...s, endedAt: new Date().toISOString(), endReason: reason }
          : s,
      )
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(all))
      return true
    } catch { return false }
  }, [])

  // ---------------------------------------------------------
  // Actividad (SIGUE EN LOCALSTORAGE POR AHORA)
  // ---------------------------------------------------------
  const getUserActivity = useCallback((userId) => {
    try {
      const all = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '{}')
      return all[userId] || []
    } catch { return [] }
  }, [])

  const logActivity = useCallback((userId, activity) => {
    try {
      const all = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '{}')
      const list = all[userId] || []
      list.unshift({
        id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        at: new Date().toISOString(),
        ...activity,
      })
      all[userId] = list.slice(0, 100)
      localStorage.setItem(ACTIVITY_KEY, JSON.stringify(all))
    } catch (e) {
      console.warn('No se pudo registrar actividad:', e)
    }
  }, [])

  // ---------------------------------------------------------
  // Refresh manual
  // ---------------------------------------------------------
  const refresh = useCallback(async () => {
    await loadLocal()
    await syncRemote()
  }, [loadLocal, syncRemote])

  // ---------------------------------------------------------
  // Value expuesto
  // ---------------------------------------------------------
  const value = {
    users,
    loading,
    syncing,
    getUserById,
    getUserByEmail,
    createUser,
    updateUser,
    changeStatus,
    resetAccess,
    deleteUser,
    clearAll,
    getUserSessions,
    closeRemoteSession,
    getUserActivity,
    logActivity,
    refresh,
  }

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
}

export function useUsers() {
  const ctx = useContext(UsersContext)
  if (!ctx) throw new Error('useUsers debe usarse dentro de <UsersProvider>')
  return ctx
}