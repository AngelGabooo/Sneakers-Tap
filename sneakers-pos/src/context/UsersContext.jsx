// src/context/UsersContext.jsx
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { hashPassword, isHashed } from '../utils/password'
import { seedUsers } from '../data/seed'

const UsersContext = createContext(null)

const STORAGE_KEY = 'sneakers-users'
const SESSIONS_KEY = 'sneakers-user-sessions'
const ACTIVITY_KEY = 'sneakers-user-activity'

export function UsersProvider({ children }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUsers(parsed)
          return
        }
      }
      // Sin usuarios → sembrar admin por defecto
      const seeded = seedUsers()
      setUsers(seeded)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
    } catch (e) {
      console.warn('No se pudo leer los usuarios:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (loading) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
    } catch (e) {
      console.warn('No se pudo guardar los usuarios:', e)
    }
  }, [users, loading])

  /* ---------------------------------------------------------- */
  /* Lectura                                                    */
  /* ---------------------------------------------------------- */
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

  /* ---------------------------------------------------------- */
  /* Crear                                                      */
  /* ---------------------------------------------------------- */
  const createUser = useCallback((payload) => {
    const now = new Date().toISOString()
    const id = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    const employeeId = `EMP-${String(users.length + 1).padStart(5, '0')}`

    const record = {
      id,
      employeeId,
      fullName: payload.fullName || '',
      firstName: (payload.fullName || '').split(' ')[0] || '',
      lastName: (payload.fullName || '').split(' ').slice(1).join(' ') || '',
      username: payload.username || (payload.email || '').split('@')[0] || '',
      email: (payload.email || '').toLowerCase(),
      phone: payload.phone || '',
      password: payload.password ? hashPassword(payload.password) : '',
      role: payload.role || 'Vendedor',
      branch: payload.branch || 'Tienda principal',
      department: payload.department || '',
      status: payload.status || 'active',
      lastAccess: null,
      lastAccessRelative: null,
      createdAt: now,
      createdBy: payload.createdBy || 'Sistema',
      updatedAt: now,
    }

    setUsers((list) => [record, ...list])
    return record
  }, [users.length])

  /* ---------------------------------------------------------- */
  /* Actualizar                                                 */
  /* ---------------------------------------------------------- */
  const updateUser = useCallback((id, patch) => {
    let updated = null
    setUsers((list) =>
      list.map((u) => {
        if (u.id !== id) return u
        const normalized = { ...patch }

        if (normalized.email) {
          normalized.email = normalized.email.trim().toLowerCase()
        }

        if (normalized.password && !isHashed(normalized.password)) {
          normalized.password = hashPassword(normalized.password)
        }

        if (normalized.fullName && normalized.fullName !== u.fullName) {
          normalized.firstName = normalized.fullName.split(' ')[0] || ''
          normalized.lastName = normalized.fullName.split(' ').slice(1).join(' ') || ''
        }

        updated = { ...u, ...normalized, updatedAt: new Date().toISOString() }
        return updated
      }),
    )
    return updated
  }, [])

  /* ---------------------------------------------------------- */
  /* Cambiar estado                                             */
  /* ---------------------------------------------------------- */
  const changeStatus = useCallback((id, status) => {
    let updated = null
    setUsers((list) =>
      list.map((u) => {
        if (u.id !== id) return u
        updated = { ...u, status, updatedAt: new Date().toISOString() }
        return updated
      }),
    )
    return updated
  }, [])

  /* ---------------------------------------------------------- */
  /* Restablecer acceso                                         */
  /* ---------------------------------------------------------- */
  const resetAccess = useCallback((id, newPassword) => {
    let updated = null
    setUsers((list) =>
      list.map((u) => {
        if (u.id !== id) return u
        updated = {
          ...u,
          password: hashPassword(newPassword),
          mustChangePassword: true,
          updatedAt: new Date().toISOString(),
        }
        return updated
      }),
    )
    return updated
  }, [])

  /* ---------------------------------------------------------- */
  /* Eliminar                                                   */
  /* ---------------------------------------------------------- */
  const deleteUser = useCallback((id) => {
    setUsers((list) => list.filter((u) => u.id !== id))
  }, [])

  const clearAll = useCallback(() => setUsers([]), [])

  /* ---------------------------------------------------------- */
  /* Sesiones                                                   */
  /* ---------------------------------------------------------- */
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

  /* ---------------------------------------------------------- */
  /* Actividad                                                  */
  /* ---------------------------------------------------------- */
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

  const value = {
    users,
    loading,
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
  }

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
}

export function useUsers() {
  const ctx = useContext(UsersContext)
  if (!ctx) throw new Error('useUsers debe usarse dentro de <UsersProvider>')
  return ctx
}