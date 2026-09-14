import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  /**
   * Simula el login. Reemplazar por llamada real al backend.
   * @param {{email: string, password: string}} credentials
   * @returns {Promise<{ok: boolean, error?: string}>}
   */
  const login = useCallback(async ({ email, password }) => {
    // ⚠️ MOCK — reemplazar por fetch a tu API
    await new Promise((r) => setTimeout(r, 1200))

    if (!email || !password) {
      return { ok: false, error: 'Credenciales incompletas.' }
    }

    // Acepta cualquier credencial para pruebas (cámbialo cuando conectes backend)
    setUser({
      id: 'u_001',
      name: 'Henry Sneakers',
      email,
      role: 'Administrador',
      avatarUrl: null,
    })
    return { ok: true }
  }, [])

  const logout = useCallback(() => setUser(null), [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}