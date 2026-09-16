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

const PS_SCRIPT = join(__dirname, 'print-raw.ps1')

/**
 * Envía un Buffer RAW a la impresora usando PowerShell + winspool API.
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