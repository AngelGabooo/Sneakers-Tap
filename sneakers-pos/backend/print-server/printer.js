import { ThermalPrinter, PrinterTypes, CharacterSet } from 'node-thermal-printer'

/**
 * Configuración de la impresora GHIA GTP58B1.
 *
 * ⚠️ IMPORTANTE: Ajusta `interface` al puerto real de tu impresora.
 *
 * Opciones comunes en Windows:
 *  - 'printer:POS-58'          → si está instalada como impresora de Windows
 *  - 'printer:GTP58B1'         → si tiene ese nombre
 *  - 'usb://0x0416:0x5011'     → si la tienes por USB raw (VID:PID)
 *  - 'tcp://192.168.1.100:9100'→ si fuera red (no es tu caso)
 *
 * Para saber el nombre exacto:
 *  En Windows → Configuración → Impresoras
 *  Copia el nombre TAL CUAL aparece.
 */
export const PRINTER_CONFIG = {
  type: PrinterTypes.EPSON,
  interface: process.env.PRINTER_INTERFACE || 'printer:POS-58',
  characterSet: CharacterSet.PC437_USA,
  removeSpecialCharacters: false,
  lineCharacter: '=',
  width: 32, // 58mm → 32 caracteres por línea (48 para 80mm)
  options: {
    timeout: 5000,
  },
}

/**
 * Crea una instancia de la impresora.
 */
export function createPrinter() {
  return new ThermalPrinter(PRINTER_CONFIG)
}