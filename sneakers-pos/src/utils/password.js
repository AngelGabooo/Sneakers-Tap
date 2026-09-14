// src/utils/password.js

/**
 * Hash mock para localStorage.
 * ⚠️ Cuando conectes backend, ELIMINA esto y manda la contraseña al servidor.
 * NUNCA guardes contraseñas en texto plano en producción.
 */
export function hashPassword(plain) {
  if (!plain) return ''
  try {
    return btoa(unescape(encodeURIComponent(plain)))
  } catch {
    return btoa(plain)
  }
}

export function isHashed(value) {
  if (!value) return false
  try {
    atob(value)
    return true
  } catch {
    return false
  }
}