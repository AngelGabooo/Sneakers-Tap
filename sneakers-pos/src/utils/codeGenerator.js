/**
 * Utilidades para generar SKU y códigos de barras/QR para productos Sneakers.
 */

/**
 * Genera un SKU legible a partir de marca, nombre y un sufijo aleatorio.
 * Ej: "Nike Air Max 270" + "Nike" -> "NIK-AIRMAX-4821"
 */
export function generateSku({ brand = '', name = '' } = {}) {
  const brandPart = (brand || 'SNK').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'SNK'
  const namePart = (name || 'PRD')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .slice(0, 6)
    .toUpperCase() || 'PRD'
  const random = Math.floor(1000 + Math.random() * 9000)
  return `${brandPart}-${namePart}-${random}`
}

/**
 * Genera un código numérico único (EAN-like) a partir del SKU.
 * Resultado: 12 dígitos + dígito verificador = 13 dígitos totales.
 * Ideal para códigos de barras Code128 o EAN-13.
 */
export function generateBarcode(sku = '') {
  const seed = sku.replace(/[^A-Z0-9]/gi, '').toUpperCase()
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 1_000_000_000_000
  }
  const base = String(hash).padStart(12, '0').slice(0, 12)
  return base + calculateEanCheckDigit(base)
}

/**
 * Calcula el dígito verificador EAN-13.
 */
function calculateEanCheckDigit(base12) {
  let sum = 0
  for (let i = 0; i < 12; i++) {
    const digit = Number(base12[i])
    sum += i % 2 === 0 ? digit : digit * 3
  }
  const check = (10 - (sum % 10)) % 10
  return String(check)
}

/**
 * Devuelve un identificador interno corto y único para usar como QR.
 * Ej: "SNK-A1B2C3D4"
 */
export function generateInternalCode(prefix = 'SNK') {
  const random = Math.random().toString(36).slice(2, 10).toUpperCase()
  return `${prefix}-${random}`
}