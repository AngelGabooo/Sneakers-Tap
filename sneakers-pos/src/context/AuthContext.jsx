// src/context/AuthContext.jsx
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { hashPassword } from '../utils/password'

const AuthContext = createContext(null)

const USERS_KEY = 'sneakers-users'
const SESSION_KEY = 'sneakers-session'
const SESSIONS_LOG_KEY = 'sneakers-user-sessions'

function readUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') } catch { return [] }
}
function writeUsers(users) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)) } catch {}
}
function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
function writeSession(user) {
  try {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    else localStorage.removeItem(SESSION_KEY)
  } catch {}
}

function logSession(userId, entry) {
  try {
    const all = JSON.parse(localStorage.getItem(SESSIONS_LOG_KEY) || '{}')
    const list = all[userId] || []
    list.unshift(entry)
    all[userId] = list.slice(0, 50)
    localStorage.setItem(SESSIONS_LOG_KEY, JSON.stringify(all))
  } catch {}
}

function closeLastSession(userId, reason) {
  try {
    const all = JSON.parse(localStorage.getItem(SESSIONS_LOG_KEY) || '{}')
    const list = all[userId] || []
    const last = list.find((s) => !s.endedAt)
    if (last) {
      last.endedAt = new Date().toISOString()
      last.endReason = reason
      all[userId] = list
      localStorage.setItem(SESSIONS_LOG_KEY, JSON.stringify(all))
    }
  } catch {}
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession())

  const login = useCallback(async ({ email, password }) => {
    await new Promise((r) => setTimeout(r, 400))

    if (!email || !password) {
      return { ok: false, error: 'Correo y contraseña son obligatorios.' }
    }

    const users = readUsers()
    const found = users.find(
      (u) => (u.email || '').toLowerCase() === email.trim().toLowerCase(),
    )

    if (!found) {
      return { ok: false, error: 'Correo o contraseña incorrectos.' }
    }

    const incoming = hashPassword(password)
    if (found.password !== incoming) {
      return { ok: false, error: 'Correo o contraseña incorrectos.' }
    }

    if (found.status === 'inactive') {
      return { ok: false, error: 'Tu cuenta está desactivada. Contacta al administrador.' }
    }
    if (found.status === 'suspended') {
      return { ok: false, error: 'Tu cuenta está suspendida.' }
    }
    if (found.status === 'blocked') {
      return { ok: false, error: 'Tu cuenta está bloqueada.' }
    }
    if (found.status === 'pending') {
      return { ok: false, error: 'Tu cuenta aún no ha sido activada.' }
    }

    const now = new Date().toISOString()
    const updated = users.map((u) =>
      u.id === found.id
        ? { ...u, lastAccess: now, lastAccessRelative: 'Hace unos segundos' }
        : u,
    )
    writeUsers(updated)

    logSession(found.id, {
      id: `ses_${Date.now()}`,
      startedAt: now,
      device: navigator.userAgent,
      ip: null,
      endedAt: null,
      endReason: null,
    })

    const sessionUser = {
      id: found.id,
      name: found.fullName,
      email: found.email,
      role: found.role,
      branch: found.branch,
      employeeId: found.employeeId,
      avatarUrl: null,
    }
    setUser(sessionUser)
    writeSession(sessionUser)

    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    if (user?.id) {
      closeLastSession(user.id, 'Cierre de sesión')
    }
    setUser(null)
    writeSession(null)
  }, [user])

  const refreshUser = useCallback(() => {
    if (!user) return
    const users = readUsers()
    const found = users.find((u) => u.id === user.id)
    if (!found) {
      logout()
      return
    }
    if (['inactive', 'suspended', 'blocked', 'pending'].includes(found.status)) {
      logout()
      return
    }
    const sessionUser = {
      id: found.id,
      name: found.fullName,
      email: found.email,
      role: found.role,
      branch: found.branch,
      employeeId: found.employeeId,
      avatarUrl: null,
    }
    setUser(sessionUser)
    writeSession(sessionUser)
  }, [user, logout])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === USERS_KEY && user) refreshUser()
    }
    window.addEventListener('storage', handler)
    const interval = setInterval(() => { if (user) refreshUser() }, 30000)
    return () => {
      window.removeEventListener('storage', handler)
      clearInterval(interval)
    }
  }, [user, refreshUser])

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}