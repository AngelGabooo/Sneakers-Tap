/**
 * Cliente HTTP para el servidor local de impresión (backend/print-server).
 * Se comunica con http://localhost:3001.
 */

const BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PRINT_SERVER_URL) ||
  'http://localhost:3001'

/**
 * Comprueba si el servidor de impresión está disponible.
 */
export async function checkPrinterHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`, { method: 'GET' })
    if (!res.ok) return { ok: false }
    return await res.json()
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

/**
 * Abre el cajón de dinero GHIA.
 */
export async function openCashDrawer() {
  try {
    const res = await fetch(`${BASE_URL}/open-drawer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) {
      const txt = await res.text()
      return { ok: false, error: txt || 'Error del servidor' }
    }
    return await res.json()
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

/**
 * Imprime un ticket completo en la impresora GTP58B1.
 * La impresora también abre el cajón GHIA al terminar.
 */
export async function printReceipt(sale) {
  try {
    const res = await fetch(`${BASE_URL}/print-receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sale }),
    })
    if (!res.ok) {
      const txt = await res.text()
      return { ok: false, error: txt || 'Error del servidor' }
    }
    return await res.json()
  } catch (err) {
    return { ok: false, error: err.message }
  }
}