// src/utils/storageHelpers.js
/**
 * Extrae el `path` interno del bucket a partir de una URL pública de Supabase Storage.
 *
 * Las URLs públicas tienen este formato:
 *   https://<project>.supabase.co/storage/v1/object/public/<bucket>/<folder>/<file>
 *
 * Y necesitamos extraer: "<folder>/<file>"
 *
 * @param {string} url — URL pública de Supabase Storage
 * @param {string} bucket — nombre del bucket (default: 'product-images')
 * @returns {string|null} — path relativo dentro del bucket, o null si no aplica
 */
export function extractPathFromUrl(url, bucket = 'product-images') {
  if (!url || typeof url !== 'string') return null
  const marker = `/storage/v1/object/public/${bucket}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  const path = url.substring(idx + marker.length).split('?')[0] // quitar query strings
  return path || null
}

/**
 * Normaliza un array de imágenes para que SIEMPRE tengan { url, path, isPrimary }.
 * - Si ya tiene path, se respeta.
 * - Si no tiene path pero sí url, se intenta extraer desde la URL.
 * - Si es una imagen nueva (con .file), se deja sin path (se asignará al subir).
 */
export function normalizeImages(images = [], bucket = 'product-images') {
  return images.map((img) => ({
    ...img,
    path: img.path || (img.url ? extractPathFromUrl(img.url, bucket) : null),
    isPrimary: !!img.isPrimary,
  }))
}