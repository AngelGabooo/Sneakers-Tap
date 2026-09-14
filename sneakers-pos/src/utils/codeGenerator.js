/**
 * Utilidades para generar SKU y códigos de barras/QR para productos Sneakers.
 * ⚠️ Todas las funciones devuelven STRING para que la comparación con el scanner sea 1:1.
 */

/**
 * Genera un SKU legible a partir de marca, nombre y un sufijo aleatorio.
 */
export function generateSku({ brand = '', name = '' } = {}) {
  const brandPart = String(brand || 'SNK')
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 3)
    .toUpperCase() || 'SNK'

  const namePart = String(name || 'PRD')
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
 * Genera un código de barras numérico único (13 dígitos, EAN-13-like).
 * SIEMPRE devuelve string.
 */
export function generateBarcode(sku = '') {
  const seed = String(sku || 'SNK')
    .replace(/[^A-Z0-9]/gi, '')
    .toUpperCase() || 'SNK'

  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 1_000_000_000_000
  }

  let base12 = String(hash).padStart(12, '0').slice(0, 12)
  // Evita que empiece con 0 (algunos lectores lo omiten)
  if (base12.startsWith('0')) base12 = '1' + base12.slice(1)

  const check = calculateEanCheckDigit(base12)
  return `${base12}${check}` // string de 13 dígitos
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
 */
export function generateInternalCode(prefix = 'SNK') {
  const random = Math.random().toString(36).slice(2, 10).toUpperCase()
  return `${prefix}-${random}`
}

/**
 * Genera un código de barras único para una variante.
 * baseSku  → SKU del producto padre
 * size     → talla
 * color    → color
 */
export function generateVariantBarcode(baseSku, size, color) {
  const seed = `${baseSku || 'SKU'}-${size}-${color}`
    .replace(/[^A-Z0-9]/gi, '')
    .toUpperCase()

  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 1_000_000_000_000
  }

  let base12 = String(hash).padStart(12, '0').slice(0, 12)
  if (base12.startsWith('0')) base12 = '1' + base12.slice(1)

  const check = calculateEanCheckDigit(base12)
  return `${base12}${check}`
}