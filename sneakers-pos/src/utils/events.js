// src/utils/events.js

export const VARIANT_STOCK_CHANGED = 'sneakers:variant-stock-changed'

/**
 * Notifica a toda la app que el stock de una o varias variantes cambió.
 * Se debe llamar después de una venta, ajuste o movimiento de inventario.
 */
export function notifyVariantStockChanged() {
  try {
    window.dispatchEvent(new CustomEvent(VARIANT_STOCK_CHANGED))
  } catch (err) {
    console.warn('Error emitiendo evento de cambio de stock:', err)
  }
}