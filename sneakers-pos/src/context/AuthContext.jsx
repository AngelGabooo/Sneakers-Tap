// src/context/AuthContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { authService } from '../services/authService'
import { profilesService } from '../services/profilesService'
import { usersService } from '../services/usersService'
import { getPushStatus, subscribeToPush } from '../utils/webPush'
import {
  saveOfflineSnapshot,
  readOfflineSnapshot,
  clearOfflineSnapshot,
  validateOfflineLogin,
} from '../utils/offlineAuth'

const AuthContext = createContext(null)

const SESSION_KEY = 'sneakers-current-session-id'

// ⭐ FIX: guard global para no re-suscribir push en cada render
let pushSubscribeInFlight = false
let pushSubscribeLastAt = 0
const PUSH_RESUBSCRIBE_COOLDOWN = 5 * 60 * 1000 // 5 minutos

function mapProfileToUser(profile, authUser) {
  if (!profile) return null
  return {
    id: profile.id,
    name: profile.full_name || authUser?.email?.split('@')[0] || 'Usuario',
    email: profile.email || authUser?.email || '',
    role: profile.role?.name || 'Sin rol',
    roleId: profile.role?.id || null,
    permissions: profile.role?.permissions || [],
    branch: profile.branch?.name || '—',
    branchId: profile.branch?.id || null,
    employeeId: profile.employee_id || null,
    phone: profile.phone || null,
    status: profile.status || 'active',
    avatarUrl: profile.avatar_url || null,
  }
}

function detectDevice(ua) {
  if (!ua) return 'Desconocido'
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua)
  const browser =
    /Edg\//.test(ua) ? 'Edge'
    : /Chrome\//.test(ua) ? 'Chrome'
    : /Firefox\//.test(ua) ? 'Firefox'
    : /Safari\//.test(ua) ? 'Safari'
    : 'Navegador'
  const os =
    /Windows/.test(ua) ? 'Windows'
    : /Mac OS/.test(ua) ? 'macOS'
    : /Android/.test(ua) ? 'Android'
    : /iPhone|iPad/.test(ua) ? 'iOS'
    : /Linux/.test(ua) ? 'Linux'
    : ''
  return `${browser}${os ? ` · ${os}` : ''}`
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  )
  const sessionIdRef = useRef(null)

  // ⭐ FIX: trackear el ID del último usuario para el que ya registramos sesión
  //    así evitamos crear sesiones duplicadas cuando loadProfile se re-ejecuta.
  const lastSessionUserIdRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onOnline = () => setIsOffline(false)
    const onOffline = () => setIsOffline(true)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  const loadProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null)
      return null
    }

    try {
      const profile = await profilesService.getById(authUser.id)

      if (['inactive', 'suspended', 'blocked', 'pending'].includes(profile.status)) {
        const messages = {
          inactive: 'Tu cuenta está desactivada. Contacta al administrador.',
          suspended: 'Tu cuenta está suspendida.',
          blocked: 'Tu cuenta está bloqueada.',
          pending: 'Tu cuenta aún no ha sido activada.',
        }
        console.warn('⚠️ Cuenta no activa:', profile.status)
        await authService.signOut()
        setUser(null)
        return { error: messages[profile.status] }
      }

      const mapped = mapProfileToUser(profile, authUser)
      setUser(mapped)
      return { user: mapped }
    } catch (err) {
      console.error('❌ Error cargando perfil:', err)
      setUser(null)
      return { error: 'No se pudo cargar tu perfil.' }
    }
  }, [])

  const startSession = useCallback(async (userId, { startedOffline = false } = {}) => {
    // ⭐ FIX: guard para no crear sesiones duplicadas para el mismo usuario.
    if (lastSessionUserIdRef.current === userId && sessionIdRef.current) {
      console.log('♻️ Sesión ya registrada para este usuario, omitiendo')
      return
    }
    // ⭐ FIX: guard adicional — si ya hay una sesión activa, no crear otra.
    if (sessionIdRef.current) {
      console.log('♻️ Sesión activa ya existe, omitiendo')
      return
    }

    try {
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : null
      const device = detectDevice(ua)

      const session = await usersService.startSession({
        userId,
        device,
        userAgent: ua,
        ip: null,
        startedOffline,
      })

      if (session?.id) {
        sessionIdRef.current = session.id
        lastSessionUserIdRef.current = userId
        try { sessionStorage.setItem(SESSION_KEY, session.id) } catch {}
        console.log(
          startedOffline ? '🟡 Sesión offline sincronizada:' : '🟢 Sesión registrada:',
          session.id,
          '·',
          device
        )
      }
    } catch (err) {
      console.warn('⚠️ No se pudo registrar la sesión:', err.message)
    }
  }, [])

  const endSession = useCallback(async (reason = 'Logout') => {
    try {
      let sessionId = sessionIdRef.current
      if (!sessionId) {
        try { sessionId = sessionStorage.getItem(SESSION_KEY) } catch {}
      }
      if (!sessionId) return

      await usersService.endSession(sessionId, reason)
      sessionIdRef.current = null
      lastSessionUserIdRef.current = null
      try { sessionStorage.removeItem(SESSION_KEY) } catch {}
      console.log('🔴 Sesión cerrada:', reason)
    } catch (err) {
      console.warn('⚠️ No se pudo cerrar la sesión:', err.message)
    }
  }, [])

  const offlineLogin = useCallback(async ({ email, password }) => {
    const res = await validateOfflineLogin(email, password)
    if (!res.ok) return res
    setUser(res.user)
    return { ok: true, offline: true }
  }, [])

  const login = useCallback(async ({ email, password }) => {
    if (!email || !password) {
      return { ok: false, error: 'Correo y contraseña son obligatorios.' }
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.log('🟡 Sin conexión: intentando login offline')
      return offlineLogin({ email, password })
    }

    try {
      const data = await authService.signIn(email, password)
      const authUser = data.user

      const result = await loadProfile(authUser)

      if (result?.error) {
        return { ok: false, error: result.error }
      }

      try {
        await saveOfflineSnapshot(result.user, password)
      } catch (snapErr) {
        console.warn('⚠️ No se pudo guardar snapshot offline:', snapErr.message)
      }

      await startSession(authUser.id)
      profilesService.touchLastAccess(authUser.id).catch(() => {})

      return { ok: true }
    } catch (err) {
      const msg = err?.message || ''
      const isNetworkError = /network|fetch|failed to fetch|load failed|networkerror/i.test(msg)

      if (isNetworkError) {
        console.warn('⚠️ Error de red en login, intentando offline:', msg)
        return offlineLogin({ email, password })
      }

      return { ok: false, error: err.message || 'Error al iniciar sesión.' }
    }
  }, [loadProfile, startSession, offlineLogin])

  const logout = useCallback(async () => {
    const online = typeof navigator === 'undefined' ? true : navigator.onLine

    try {
      await endSession('Logout manual')
      await authService.signOut()
    } catch (err) {
      console.warn('Error al cerrar sesión:', err)
    }

    if (online) {
      clearOfflineSnapshot()
    } else {
      console.log('🟡 Logout offline: conservando snapshot para permitir reentrada sin red')
    }

    setUser(null)
  }, [endSession])

  const refreshUser = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return
    const authUser = await authService.getUser()
    if (authUser) await loadProfile(authUser)
  }, [loadProfile])

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        let session = null
        try {
          session = await authService.getSession()
        } catch (netErr) {
          console.warn('⚠️ getSession falló (probablemente offline):', netErr.message)
        }

        if (!mounted) return

        if (session?.user) {
          await loadProfile(session.user)

          let existingSessionId = null
          try { existingSessionId = sessionStorage.getItem(SESSION_KEY) } catch {}

          if (existingSessionId) {
            sessionIdRef.current = existingSessionId
            lastSessionUserIdRef.current = session.user.id
            console.log('♻️ Reusando sesión existente:', existingSessionId)
          } else {
            await startSession(session.user.id)
          }
        } else {
          const snap = readOfflineSnapshot()
          if (snap?.user) {
            console.log('🟡 Entrando con snapshot offline de', snap.user.email)
            setUser(snap.user)
          } else {
            setUser(null)
          }
        }
      } catch (err) {
        console.error('❌ Error inicializando auth:', err)
        const snap = readOfflineSnapshot()
        if (snap?.user) {
          console.log('🟡 Recuperando sesión offline tras error')
          setUser(snap.user)
        } else {
          setUser(null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (event === 'SIGNED_OUT') {
          setUser(null)
          if (sessionIdRef.current) {
            await endSession('Sesión cerrada desde otro dispositivo')
          }
        } else if (event === 'SIGNED_IN' && session?.user) {
          await loadProfile(session.user)
        }
      },
    )

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [loadProfile, startSession, endSession])

  useEffect(() => {
    if (isOffline) return
    if (!user?.id) return
    if (sessionIdRef.current) return

    let cancelled = false
    ;(async () => {
      try {
        console.log('🟡 Red recuperada: sincronizando sesión offline…')
        await startSession(user.id, { startedOffline: true })
        if (cancelled) return

        const authUser = await authService.getUser()
        if (authUser) {
          await loadProfile(authUser)
          profilesService.touchLastAccess(authUser.id).catch(() => {})
        }
      } catch (err) {
        console.warn('⚠️ No se pudo re-sincronizar sesión offline:', err.message)
      }
    })()

    return () => { cancelled = true }
  }, [isOffline, user?.id, startSession, loadProfile])

  // ⭐ FIX: beforeunload — throttle para no disparar en cada cambio de foco.
  //    Solo se ejecuta si la sesión lleva >30s abierta.
  useEffect(() => {
    if (typeof window === 'undefined') return
    let lastSentAt = 0
    const MIN_INTERVAL = 30000

    const handleBeforeUnload = () => {
      const sessionId = sessionIdRef.current
      if (!sessionId) return

      const now = Date.now()
      if (now - lastSentAt < MIN_INTERVAL) return
      lastSentAt = now

      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_sessions?id=eq.${sessionId}`
        const body = JSON.stringify({
          ended_at: new Date().toISOString(),
          end_reason: 'Cierre de navegador',
        })

        fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal',
          },
          body,
          keepalive: true,
        }).catch(() => {})
      } catch {}
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // ⭐ FIX: auto-sanación de push — con guard global + cooldown.
  useEffect(() => {
    if (!user?.id) return
    if (typeof window === 'undefined') return
    if (typeof navigator !== 'undefined' && !navigator.onLine) return
    if (!('Notification' in window)) return
    if (!('serviceWorker' in navigator)) return

    // ⭐ No re-suscribir si ya lo hicimos hace <5 min.
    if (pushSubscribeInFlight) return
    if (Date.now() - pushSubscribeLastAt < PUSH_RESUBSCRIBE_COOLDOWN) return

    let alive = true
    ;(async () => {
      try {
        const status = await getPushStatus()
        if (!alive) return
        if (status === 'granted') {
          pushSubscribeInFlight = true
          console.log('🔄 Push sin suscripción activa, renovando…')
          await subscribeToPush(user.id)
          pushSubscribeLastAt = Date.now()
        }
      } catch (err) {
        console.warn('⚠️ Error auto-sanando push:', err.message)
      } finally {
        pushSubscribeInFlight = false
      }
    })()

    return () => { alive = false }
  }, [user?.id])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isOffline,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
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