// src/utils/sessionKey.js

/**
 * Genera una clave de almacenamiento aislada por usuario.
 * Usa sessionStorage por defecto (aislada por pestaña).
 *
 *   storageKey('cart', userId)  → 'sneakers-cart:usr_123'
 */
export function storageKey(namespace, userId) {
  const uid = userId || 'anon'
  return `sneakers-${namespace}:${uid}`
}

/**
 * Lee un valor JSON de sessionStorage sin romper si está corrupto.
 */
export function readSessionJSON(key) {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Guarda un valor JSON en sessionStorage.
 */
export function writeSessionJSON(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignora cuota llena o modo privado
  }
}

/**
 * Lee de localStorage (para datos persistentes como carrito suspendido).
 */
export function readLocalJSON(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeLocalJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}