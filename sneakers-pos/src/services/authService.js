// src/services/authService.js
import { supabase } from '../lib/supabase'

/**
 * Servicio de autenticación con Supabase Auth.
 */
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
   * Cierra la sesión actual.
   */
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return true
  },

  /**
   * Obtiene la sesión actual.
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  /**
   * Obtiene el usuario autenticado actual.
   */
  async getUser() {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return data.user
  },

  /**
   * Envía correo de recuperación de contraseña.
   */
  async sendPasswordReset(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
    return true
  },

  /**
   * Suscribirse a cambios de sesión.
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },
}