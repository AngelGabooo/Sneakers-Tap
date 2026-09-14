/**
 * Comando ESC/POS para abrir el cajón de dinero.
 *
 * Formato: ESC p m t1 t2
 *  - 0x1B 0x70     → ESC p (comando de apertura de cajón)
 *  - 0x00 o 0x01   → m: qué pin del cajón activar
 *                    (0 = pin 2, 1 = pin 5)
 *  - t1            → tiempo encendido (en unidades de 2ms)
 *  - t2            → tiempo apagado (en unidades de 2ms)
 *
 * El cajón GHIA suele usar pin 2 (m = 0), pero algunos modelos
 * usan pin 5 (m = 1). Prueba con 0 primero.
 */
export const OPEN_DRAWER_PIN_2 = Buffer.from([0x1B, 0x70, 0x00, 0x32, 0x32])
export const OPEN_DRAWER_PIN_5 = Buffer.from([0x1B, 0x70, 0x01, 0x32, 0x32])

/**
 * Abre el cajón de dinero usando el comando ESC/POS.
 * @param {ThermalPrinter} printer - Instancia de la impresora.
 * @param {number} pin - 0 (pin 2) o 1 (pin 5). Por defecto 0.
 */
export function openCashDrawer(printer, pin = 0) {
  try {
    // El método nativo de node-thermal-printer
    printer.openCashDrawer()
    console.log('✅ Cajón abierto (pin por defecto)')
    return true
  } catch (err) {
    console.error('❌ Error al abrir el cajón:', err)
    return false
  }
}