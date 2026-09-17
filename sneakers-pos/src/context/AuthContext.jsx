// src/context/AuthContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { authService } from '../services/authService'
import { profilesService } from '../services/profilesService'
import { getPushStatus, subscribeToPush } from '../utils/webPush'

const AuthContext = createContext(null)

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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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

      // Verificar estado de la cuenta
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
   * Login.
   */
  const login = useCallback(async ({ email, password }) => {
    if (!email || !password) {
      return { ok: false, error: 'Correo y contraseña son obligatorios.' }
    }

    try {
      const data = await authService.signIn(email, password)
      const authUser = data.user

      const result = await loadProfile(authUser)

      if (result?.error) {
        return { ok: false, error: result.error }
      }

      // Actualizar last_access en background
      profilesService.touchLastAccess(authUser.id).catch(() => {})

      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.message || 'Error al iniciar sesión.' }
    }
  }, [loadProfile])

  /**
   * Logout.
   */
  const logout = useCallback(async () => {
    try {
      await authService.signOut()
    } catch (err) {
      console.warn('Error al cerrar sesión:', err)
    }
    setUser(null)
  }, [])

  /**
   * Refrescar perfil manualmente.
   */
  const refreshUser = useCallback(async () => {
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
        const session = await authService.getSession()
        if (!mounted) return

        if (session?.user) {
          await loadProfile(session.user)
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error('❌ Error inicializando auth:', err)
        setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    // Escuchar cambios de sesión (login, logout, refresh)
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        if (event === 'SIGNED_OUT') {
          setUser(null)
        } else if (event === 'SIGNED_IN' && session?.user) {
          await loadProfile(session.user)
        }
      },
    )

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [loadProfile])

  // ⭐ NUEVO: auto-sanación de suscripción push
  // Si el usuario ya dio permiso pero la suscripción se perdió
  // (pasa en Android/Chrome y al reinstalar la PWA en iOS), la renovamos.
  useEffect(() => {
    if (!user?.id) return
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return
    if (!('serviceWorker' in navigator)) return

    let alive = true
    ;(async () => {
      try {
        const status = await getPushStatus()
        if (!alive) return

        // Caso típico: permiso concedido, pero sin suscripción activa
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