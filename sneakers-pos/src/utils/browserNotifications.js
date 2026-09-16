// src/utils/browserNotifications.js

/**
 * ¿El navegador soporta Notification API?
 */
export function isSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

/**
 * Devuelve el estado actual del permiso:
 * 'default'  → nunca se ha preguntado
 * 'granted'  → permiso concedido
 * 'denied'   → permiso denegado
 * 'unsupported' → no soportado
 */
export function getPermission() {
  if (!isSupported()) return 'unsupported'
  return Notification.permission
}

/**
 * Solicita permiso al usuario.
 * Debe llamarse SIEMPRE desde un gesto del usuario (clic en botón),
 * sino los navegadores modernos lo bloquean.
 */
export async function requestPermission() {
  if (!isSupported()) return 'unsupported'
  try {
    const result = await Notification.requestPermission()
    return result
  } catch {
    return 'denied'
  }
}

/**
 * Muestra una notificación del navegador.
 *
 * @param {object} opts
 * @param {string} opts.title
 * @param {string} [opts.body]
 * @param {string} [opts.icon]        - Ruta al ícono (ej. '/favicon.ico')
 * @param {string} [opts.badge]       - Ícono pequeño (Android)
 * @param {string} [opts.tag]         - Etiqueta para agrupar/deduplicar
 * @param {boolean} [opts.requireInteraction] - No se cierra sola
 * @param {'default'|'critical'|'important'} [opts.priority]
 * @param {Function} [opts.onClick]   - Callback al hacer clic
 */
export function showBrowserNotification({
  title,
  body,
  icon = '/favicon.ico',
  badge,
  tag,
  priority = 'default',
  onClick,
}) {
  if (!isSupported()) return null
  if (Notification.permission !== 'granted') return null

  const requireInteraction = priority === 'critical'
  const silent = priority === 'default'

  try {
    const notif = new Notification(title, {
      body,
      icon,
      badge,
      tag,
      requireInteraction,
      silent,
    })

    if (typeof onClick === 'function') {
      notif.onclick = (e) => {
        e.preventDefault()
        try { window.focus() } catch {}
        onClick()
        notif.close()
      }
    }

    return notif
  } catch (err) {
    console.warn('No se pudo mostrar la notificación:', err)
    return null
  }
}