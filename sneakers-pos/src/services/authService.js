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
   * Registra un usuario nuevo.
   * ⚠️ Nota: en Supabase Auth, signUp() inicia sesión automáticamente.
   * Para crear usuarios SIN cambiar la sesión actual, usar `signUpAdmin` con Admin API.
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
   * Crea un usuario desde el panel de admin SIN cerrar la sesión actual.
   * Usa una Edge Function con service_role para crear usuarios.
   *
   * ⚠️ Requiere que exista la Edge Function `create-user` deployada.
   */
  async signUpAdmin({ email, password, metadata = {} }) {
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: {
        email: email.trim().toLowerCase(),
        password,
        metadata,
      },
    })

    if (error) throw new Error(error.message || 'Error al crear usuario')
    if (data?.error) throw new Error(data.error)

    return data
  },

  /**
   * Cierra la sesión actual.
   */
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

  /**
   * Actualiza la contraseña del usuario autenticado.
   */
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