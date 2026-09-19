// printer.js
import { writeFile, unlink } from 'fs/promises'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { tmpdir } from 'os'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const execFileAsync = promisify(execFile)
const __dirname = dirname(fileURLToPath(import.meta.url))

export const PRINTER_NAME = process.env.PRINTER_NAME || 'POS-80'
export const PRINTER_PORT = process.env.PRINTER_PORT || 'LPT1:'
export const LABEL_PRINTER_NAME = process.env.LABEL_PRINTER_NAME || 'Brother QL-800'

const PS_SCRIPT = join(__dirname, 'print-raw.ps1')

/**
 * Envia un Buffer RAW a la impresora usando PowerShell + winspool API.
 * 100% nativo de Windows, sin dependencias nativas de Node.
 */
export async function sendToPrinter(buffer) {
  const tmpFile = join(tmpdir(), `sneakers-ticket-${Date.now()}.bin`)
  await writeFile(tmpFile, buffer)

  try {
    const { stdout, stderr } = await execFileAsync('powershell.exe', [
      '-NoProfile',
      '-ExecutionPolicy', 'Bypass',
      '-File', PS_SCRIPT,
      '-FilePath', tmpFile,
      '-PrinterName', PRINTER_NAME,
    ], { windowsHide: true })

    if (stderr && stderr.trim()) {
      throw new Error(`PowerShell: ${stderr.trim()}`)
    }
    if (!stdout.includes('OK')) {
      throw new Error(`Respuesta inesperada de PowerShell: ${stdout}`)
    }
    return true
  } catch (err) {
    throw new Error(`Error enviando a impresora: ${err.message}`)
  } finally {
    await unlink(tmpFile).catch(() => {})
  }
}

// =====================================================================
// ESC/POS Builder
// =====================================================================
const ESC = 0x1b
const GS  = 0x1d
const LF  = 0x0a

class EscPosBuilder {
  constructor(width = 32) {
    this.width = width
    this.chunks = []
    this.init()
  }

  init() { return this.raw(ESC, 0x40) }

  raw(...bytes) {
    this.chunks.push(Buffer.from(bytes))
    return this
  }

  text(str) {
    const safe = this.normalize(str)
    this.chunks.push(Buffer.from(safe, 'latin1'))
    return this
  }

  normalize(str) {
    return String(str ?? '')
      .replace(/·/g, '-').replace(/—/g, '-').replace(/–/g, '-')
      .replace(/¡/g, '!').replace(/¿/g, '?')
      .replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i')
      .replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u').replace(/ñ/g, 'n')
      .replace(/[ÁÀÄ]/g, 'A').replace(/[ÉÈË]/g, 'E').replace(/[ÍÌÏ]/g, 'I')
      .replace(/[ÓÒÖ]/g, 'O').replace(/[ÚÙÜ]/g, 'U').replace(/Ñ/g, 'N')
  }

  alignLeft()   { return this.raw(ESC, 0x61, 0x00) }
  alignCenter() { return this.raw(ESC, 0x61, 0x01) }
  alignRight()  { return this.raw(ESC, 0x61, 0x02) }

  bold(on = true) { return this.raw(ESC, 0x45, on ? 0x01 : 0x00) }

  setTextSize(w = 0, h = 0) {
    const n = ((w & 0x07) << 4) | (h & 0x07)
    return this.raw(GS, 0x21, n)
  }

  newLine()         { return this.raw(LF) }
  println(str = '') { return this.text(str).newLine() }
  drawLine()        { return this.println('='.repeat(this.width)) }

  openCashDrawer(pin = 0) {
    return this.raw(ESC, 0x70, pin === 1 ? 0x01 : 0x00, 0x32, 0x32)
  }

  cut() { return this.raw(GS, 0x56, 0x00) }

  getBuffer() {
    this.raw(LF, LF, LF)
    return Buffer.concat(this.chunks)
  }
}

export function createPrinter() {
  return new EscPosBuilder(32)
}

// =====================================================================
// Brother QL-800 - impresion de etiquetas como IMAGEN
// =====================================================================

const PS_LABEL_SCRIPT = join(__dirname, 'print-label.ps1')

/**
 * Envia una imagen (Buffer PNG/JPG) a la impresora de etiquetas.
 * Usa el driver oficial de Brother en Windows via System.Drawing.Printing.
 *
 * IMPORTANTE: NO se define PaperSize ni Landscape. El driver ya tiene
 * configurado el rollo continuo 62mm x 29mm + corte automatico.
 * Si se define desde aqui, el driver no lo reconoce y sale en blanco.
 *
 * @param {Buffer} imageBuffer - Contenido binario de la imagen (PNG/JPG)
 * @param {Object} [opts]
 * @param {string} [opts.printerName] - Nombre de la impresora
 * @returns {Promise<boolean>}
 */
export async function sendImageToLabelPrinter(imageBuffer, opts = {}) {
  const { printerName = LABEL_PRINTER_NAME } = opts

  const tmpFile = join(tmpdir(), `sneakers-label-${Date.now()}.png`)
  await writeFile(tmpFile, imageBuffer)

  try {
    const args = [
      '-NoProfile',
      '-ExecutionPolicy', 'Bypass',
      '-File', PS_LABEL_SCRIPT,
      '-ImagePath', tmpFile,
      '-PrinterName', printerName,
    ]

    const { stdout, stderr } = await execFileAsync('powershell.exe', args, {
      windowsHide: true,
    })

    if (stderr && stderr.trim()) {
      throw new Error(`PowerShell: ${stderr.trim()}`)
    }
    if (!stdout.includes('OK')) {
      throw new Error(`Respuesta inesperada de PowerShell: ${stdout}`)
    }
    return true
  } catch (err) {
    throw new Error(`Error enviando etiqueta a impresora: ${err.message}`)
  } finally {
    await unlink(tmpFile).catch(() => {})
  }
}

/**
 * Decodifica un data URL ("data:image/png;base64,...") a Buffer.
 */
export function decodeDataUrl(dataUrl) {
  const m = /^data:image\/[a-z+]+;base64,(.+)$/i.exec(dataUrl || '')
  if (!m) throw new Error('data URL invalido')
  return Buffer.from(m[1], 'base64')
}