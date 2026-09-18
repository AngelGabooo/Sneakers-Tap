// src/utils/offlineAuth.js
//
// Guarda un snapshot local del usuario autenticado para permitir
// entrar sin internet. NO reemplaza a Supabase: es solo un caché
// de confianza para reconexión.

const SNAPSHOT_KEY = 'sneakers-offline-user'
const CRED_KEY = 'sneakers-offline-cred'
const TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 días

/* ---------- Hashing (Web Crypto) ---------- */

async function sha256(text) {
  const buf = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Salt fijo por usuario (deriva del id). No es criptográficamente
 * perfecto, pero evita rainbow tables triviales.
 */
async function hashPassword(password, userId) {
  return sha256(`${userId}::${password}`)
}

/* ---------- Snapshot del usuario ---------- */

/**
 * Guarda el snapshot del usuario logueado.
 * Se llama SOLO tras login exitoso online.
 */
export async function saveOfflineSnapshot(user, password) {
  if (!user?.id) return
  try {
    const snapshot = {
      user,
      savedAt: Date.now(),
      expiresAt: Date.now() + TTL_MS,
    }
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot))

    if (password) {
      const pwdHash = await hashPassword(password, user.id)
      localStorage.setItem(CRED_KEY, JSON.stringify({ userId: user.id, pwdHash }))
    }
  } catch (err) {
    console.warn('⚠️ No se pudo guardar snapshot offline:', err)
  }
}

/**
 * Lee el snapshot si es válido (no expirado).
 */
export function readOfflineSnapshot() {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY)
    if (!raw) return null
    const snap = JSON.parse(raw)
    if (!snap?.user?.id) return null
    if (snap.expiresAt && snap.expiresAt < Date.now()) {
      clearOfflineSnapshot()
      return null
    }
    return snap
  } catch {
    return null
  }
}

export function clearOfflineSnapshot() {
  try {
    localStorage.removeItem(SNAPSHOT_KEY)
    localStorage.removeItem(CRED_KEY)
  } catch {}
}

/**
 * Valida email+password contra el snapshot local.
 * Devuelve el user si coincide, o null.
 */
export async function validateOfflineLogin(email, password) {
  const snap = readOfflineSnapshot()
  if (!snap) return { ok: false, error: 'No hay sesión guardada en este dispositivo.' }

  const user = snap.user
  const emailOk = (user.email || '').toLowerCase() === (email || '').toLowerCase()
  if (!emailOk) return { ok: false, error: 'Correo o contraseña incorrectos.' }

  try {
    const raw = localStorage.getItem(CRED_KEY)
    if (!raw) return { ok: false, error: 'Debes iniciar sesión al menos una vez con internet.' }
    const { userId, pwdHash } = JSON.parse(raw)
    if (userId !== user.id) return { ok: false, error: 'Credenciales no válidas en este dispositivo.' }

    const candidate = await hashPassword(password, user.id)
    if (candidate !== pwdHash) {
      return { ok: false, error: 'Correo o contraseña incorrectos.' }
    }
    return { ok: true, user }
  } catch {
    return { ok: false, error: 'No se pudo validar el acceso offline.' }
  }
}

/** ¿Hay snapshot guardado? (para mostrar hints en UI) */
export function hasOfflineSnapshot() {
  return !!readOfflineSnapshot()
}