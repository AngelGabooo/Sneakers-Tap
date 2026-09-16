// src/services/storageService.js
import { supabase } from '../lib/supabase'

const BUCKET = 'product-images'

/**
 * Servicio de almacenamiento de imágenes en Supabase Storage.
 */
export const storageService = {
  /**
   * Sube un archivo (File o Blob) al bucket.
   */
  async upload(file, { folder = 'products', filename } = {}) {
    const ext = file.name?.split('.').pop()?.toLowerCase() || 'jpg'
    const name =
      filename ||
      `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const path = `${folder}/${name}`

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg',
      })

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(data.path)

    return {
      url: urlData.publicUrl,
      path: data.path,
    }
  },

  /**
   * Sube múltiples imágenes.
   * Solo sube items que tengan `.file` (los que ya están subidos se ignoran).
   *
   * @param {Array}  items   — [{ file, isPrimary, id }]
   * @param {string} folder  — carpeta destino
   */
  async uploadMany(items, folder = 'products') {
    const results = []
    for (const item of items) {
      if (!item.file) {
        // Ya estaba subido (tiene url de Supabase), conservarlo
        results.push({
          url: item.url,
          path: item.path || null,
          isPrimary: !!item.isPrimary,
        })
        continue
      }

      try {
        const uploaded = await this.upload(item.file, { folder })
        results.push({
          url: uploaded.url,
          path: uploaded.path,
          isPrimary: !!item.isPrimary,
        })
      } catch (err) {
        console.error('❌ Error subiendo imagen:', err)
        // continuar con las demás
      }
    }
    return results
  },

  /**
   * Elimina una imagen por su path.
   */
  async remove(path) {
    if (!path) return true
    const { error } = await supabase.storage.from(BUCKET).remove([path])
    if (error) throw error
    return true
  },

  /**
   * Elimina múltiples imágenes.
   */
  async removeMany(paths = []) {
    const validPaths = paths.filter(Boolean)
    if (validPaths.length === 0) return true
    const { error } = await supabase.storage.from(BUCKET).remove(validPaths)
    if (error) throw error
    return true
  },
}