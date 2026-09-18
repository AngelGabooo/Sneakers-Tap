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
// ⭐ NUEVO: helpers de acceso offline
import {
  saveOfflineSnapshot,
  readOfflineSnapshot,
  clearOfflineSnapshot,
  validateOfflineLogin,
} from '../utils/offlineAuth'

const AuthContext = createContext(null)

const SESSION_KEY = 'sneakers-current-session-id'

/**
 * Mapea un perfil de Supabase a la estructura que usa la app.
 */
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

/**
 * Detecta el tipo de dispositivo a partir del user agent.
 */
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
  // ⭐ NUEVO: estado de conexión para exponerlo a la UI
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  )
  const sessionIdRef = useRef(null)

  // ⭐ NUEVO: escuchar cambios de red
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

  /**
   * Carga el perfil completo del usuario autenticado.
   */
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

  /**
   * ⭐ Registra una nueva sesión en Supabase.
   *    Guarda el sessionId para poder cerrarla en logout.
   *    `startedOffline` = true cuando la sesión se creó sin internet
   *    y se está sincronizando al volver la conexión.
   */
  const startSession = useCallback(async (userId, { startedOffline = false } = {}) => {
    try {
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : null
      const device = detectDevice(ua)

      const session = await usersService.startSession({
        userId,
        device,
        userAgent: ua,
        ip: null, // no lo tenemos desde el cliente
        startedOffline, // ⭐ NUEVO
      })

      if (session?.id) {
        sessionIdRef.current = session.id
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

  /**
   * ⭐ Cierra la sesión activa en Supabase.
   */
  const endSession = useCallback(async (reason = 'Logout') => {
    try {
      let sessionId = sessionIdRef.current
      if (!sessionId) {
        try { sessionId = sessionStorage.getItem(SESSION_KEY) } catch {}
      }
      if (!sessionId) return

      await usersService.endSession(sessionId, reason)
      sessionIdRef.current = null
      try { sessionStorage.removeItem(SESSION_KEY) } catch {}
      console.log('🔴 Sesión cerrada:', reason)
    } catch (err) {
      console.warn('⚠️ No se pudo cerrar la sesión:', err.message)
    }
  }, [])

  /**
   * ⭐ NUEVO: Login OFFLINE.
   *    Valida credenciales contra el snapshot guardado en el dispositivo.
   *    Se declara ANTES de `login` para que esté disponible cuando
   *    `login` la invoque.
   */
  const offlineLogin = useCallback(async ({ email, password }) => {
    const res = await validateOfflineLogin(email, password)
    if (!res.ok) return res

    // Cargamos el user guardado como sesión activa.
    setUser(res.user)
    // No creamos sesión en Supabase (no hay red).
    // Cuando vuelva la conexión, se puede registrar en background.
    return { ok: true, offline: true }
  }, [])

  /**
   * Login.
   */
  const login = useCallback(async ({ email, password }) => {
    if (!email || !password) {
      return { ok: false, error: 'Correo y contraseña son obligatorios.' }
    }

    // ⭐ NUEVO: si estamos offline, ir directo al login offline.
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

      // ⭐ NUEVO: guardar snapshot para futuros accesos offline.
      //    Se guarda DESPUÉS de loadProfile exitoso, con el user mapeado.
      try {
        await saveOfflineSnapshot(result.user, password)
      } catch (snapErr) {
        console.warn('⚠️ No se pudo guardar snapshot offline:', snapErr.message)
      }

      // ⭐ NUEVO: registrar sesión
      await startSession(authUser.id)

      // Actualizar last_access en background
      profilesService.touchLastAccess(authUser.id).catch(() => {})

      return { ok: true }
    } catch (err) {
      // ⭐ NUEVO: si el error es de red (no de credenciales),
      //    intentar login offline con el snapshot guardado.
      const msg = err?.message || ''
      const isNetworkError = /network|fetch|failed to fetch|load failed|networkerror/i.test(msg)

      if (isNetworkError) {
        console.warn('⚠️ Error de red en login, intentando offline:', msg)
        return offlineLogin({ email, password })
      }

      return { ok: false, error: err.message || 'Error al iniciar sesión.' }
    }
  }, [loadProfile, startSession, offlineLogin])

  /**
   * Logout.
   */
  const logout = useCallback(async () => {
    try {
      // ⭐ NUEVO: cerrar la sesión ANTES de signOut
      await endSession('Logout manual')
      await authService.signOut()
    } catch (err) {
      console.warn('Error al cerrar sesión:', err)
    }
    // ⭐ NUEVO: al hacer logout explícito, limpiar snapshot offline.
    //    El usuario quiere salir del dispositivo.
    clearOfflineSnapshot()
    setUser(null)
  }, [endSession])

  /**
   * Refrescar perfil manualmente.
   */
  const refreshUser = useCallback(async () => {
    // ⭐ NUEVO: sin red no podemos refrescar contra Supabase.
    if (typeof navigator !== 'undefined' && !navigator.onLine) return
    const authUser = await authService.getUser()
    if (authUser) await loadProfile(authUser)
  }, [loadProfile])

  /**
   * Al montar: verificar sesión existente.
   */
  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        // ⭐ NUEVO: envolvemos getSession en try/catch para que un fallo
        //    de red no rompa la inicialización. Si falla, caemos al snapshot.
        let session = null
        try {
          session = await authService.getSession()
        } catch (netErr) {
          console.warn('⚠️ getSession falló (probablemente offline):', netErr.message)
        }

        if (!mounted) return

        if (session?.user) {
          await loadProfile(session.user)

          // ⭐ Si había una sesión abierta en sessionStorage,
          //    significa que el usuario recargó. La reusamos.
          let existingSessionId = null
          try { existingSessionId = sessionStorage.getItem(SESSION_KEY) } catch {}

          if (existingSessionId) {
            sessionIdRef.current = existingSessionId
            console.log('♻️ Reusando sesión existente:', existingSessionId)
          } else {
            // No hay sesión previa (recarga con sesión perdida) → crear nueva
            await startSession(session.user.id)
          }
        } else {
          // ⭐ NUEVO: sin sesión de Supabase → probar snapshot offline.
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
        // ⭐ NUEVO: último intento, usar snapshot offline si existe.
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

    // Escuchar cambios de sesión
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (event === 'SIGNED_OUT') {
          setUser(null)
          // ⭐ Cerrar sesión activa si aún no se cerró
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

  /**
   * ⭐ NUEVO: cuando vuelve la red, si teníamos una sesión local
   *    que no se registró en Supabase (porque entramos offline),
   *    la registramos ahora. También refrescamos el perfil.
   */
  useEffect(() => {
    if (isOffline) return          // aún sin red, no hacer nada
    if (!user?.id) return          // sin usuario, no hacer nada
    if (sessionIdRef.current) return // ya hay sesión registrada, no duplicar

    let cancelled = false
    ;(async () => {
      try {
        console.log('🟡 Red recuperada: sincronizando sesión offline…')
        await startSession(user.id, { startedOffline: true })
        if (cancelled) return

        // Refrescar perfil para traer roles/permisos actualizados
        const authUser = await authService.getUser()
        if (authUser) {
          await loadProfile(authUser)
          // Actualizar last_access también
          profilesService.touchLastAccess(authUser.id).catch(() => {})
        }
      } catch (err) {
        console.warn('⚠️ No se pudo re-sincronizar sesión offline:', err.message)
      }
    })()

    return () => { cancelled = true }
  }, [isOffline, user?.id, startSession, loadProfile])

  /**
   * ⭐ Al cerrar/recargar la pestaña, marcar la sesión como cerrada.
   *    Usamos 'beforeunload' para intentar cerrarla.
   *    Nota: no es 100% confiable en móviles, pero ayuda.
   */
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleBeforeUnload = () => {
      const sessionId = sessionIdRef.current
      if (!sessionId) return

      // Usamos sendBeacon para asegurar que el request salga.
      // Si no, no se alcanza a hacer.
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_sessions?id=eq.${sessionId}`
        const body = JSON.stringify({
          ended_at: new Date().toISOString(),
          end_reason: 'Cierre de navegador',
        })
        const blob = new Blob([body], { type: 'application/json' })

        // ⚠️ sendBeacon no permite custom headers. Fallback a fetch.
        //    fetch con keepalive sí permite headers.
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

  // Auto-sanación de suscripción push
  useEffect(() => {
    if (!user?.id) return
    if (typeof window === 'undefined') return
    // ⭐ NUEVO: no intentar push si no hay red.
    if (typeof navigator !== 'undefined' && !navigator.onLine) return
    if (!('Notification' in window)) return
    if (!('serviceWorker' in navigator)) return

    let alive = true
    ;(async () => {
      try {
        const status = await getPushStatus()
        if (!alive) return
        if (status === 'granted') {
          console.log('🔄 Push sin suscripción activa, renovando…')
          await subscribeToPush(user.id)
        }
      } catch (err) {
        console.warn('⚠️ Error auto-sanando push:', err.message)
      }
    })()

    return () => { alive = false }
  }, [user?.id])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isOffline,          // ⭐ NUEVO: exponer estado de conexión
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