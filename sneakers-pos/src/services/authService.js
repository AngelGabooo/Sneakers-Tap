// src/services/authService.js
import { supabase } from '../lib/supabase'

export const authService = {
  /**
   * Inicia sesión con email y contraseña.
   */
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      const messages = {
        'Invalid login credentials': 'Correo o contraseña incorrectos.',
        'Email not confirmed': 'Debes confirmar tu correo antes de iniciar sesión.',
        'Too many requests': 'Demasiados intentos. Espera unos minutos.',
      }
      const msg = messages[error.message] || error.message
      throw new Error(msg)
    }

    return data
  },

  /**
   * Registra un usuario nuevo (uso personal).
   */
  async signUp({ email, password, metadata = {} }) {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/`,
      },
    })

    if (error) throw error
    return data
  },

  /**
   * ⭐ Crea un usuario desde el panel de admin SIN cerrar la sesión actual.
   */
  async signUpAdmin({ email, password, metadata = {} }) {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!session?.access_token) {
        throw new Error('No hay sesión activa. Vuelve a iniciar sesión.')
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      if (!supabaseUrl || !anonKey) {
        throw new Error('Faltan las variables de entorno de Supabase.')
      }

      const url = `${supabaseUrl}/functions/v1/create-user`

      console.log('📤 Llamando create-user con:', { email, metadata })

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          metadata,
        }),
      })

      const text = await res.text()
      let data = null
      try {
        data = text ? JSON.parse(text) : null
      } catch {
        data = { error: text || 'Respuesta inválida del servidor' }
      }

      if (!res.ok) {
        const errorMsg = data?.error || `Error ${res.status}: ${res.statusText}`
        console.error('❌ create-user error:', errorMsg, data)
        throw new Error(errorMsg)
      }

      if (data?.error) {
        throw new Error(data.error)
      }

      console.log('✅ Usuario creado en Auth:', data?.user?.email)
      return data
    } catch (err) {
      console.error('❌ signUpAdmin error:', err)
      throw err
    }
  },

  /**
   * ⭐ Restablece la contraseña de otro usuario (solo admin/gerente).
   * Usa la Edge Function `reset-password`.
   */
  async resetUserPassword({ userId, newPassword }) {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!session?.access_token) {
        throw new Error('No hay sesión activa. Vuelve a iniciar sesión.')
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      if (!supabaseUrl || !anonKey) {
        throw new Error('Faltan las variables de entorno de Supabase.')
      }

      const url = `${supabaseUrl}/functions/v1/reset-password`

      console.log('📤 Llamando reset-password para user:', userId)

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({ userId, newPassword }),
      })

      const text = await res.text()
      let data = null
      try {
        data = text ? JSON.parse(text) : null
      } catch {
        data = { error: text || 'Respuesta inválida del servidor' }
      }

      if (!res.ok) {
        const errorMsg = data?.error || `Error ${res.status}: ${res.statusText}`
        console.error('❌ reset-password error:', errorMsg, data)
        throw new Error(errorMsg)
      }

      if (data?.error) {
        throw new Error(data.error)
      }

      console.log('✅ Contraseña restablecida para:', data?.user?.email)
      return data
    } catch (err) {
      console.error('❌ resetUserPassword error:', err)
      throw err
    }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return true
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return data.user
  },

  async sendPasswordReset(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
    return true
  },

  async updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
    return data
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },
}