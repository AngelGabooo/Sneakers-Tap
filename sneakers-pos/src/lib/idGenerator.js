// src/lib/idGenerator.js
import { dbPromise, STORES } from './db'

/**
 * Generador de IDs híbrido online/offline.
 *
 * - ONLINE  → usa UUID v4 normal (crypto.randomUUID)
 * - OFFLINE → usa ID temporal local_<timestamp>_<random>
 *             que se mapea a un UUID real al sincronizar
 *
 * El mapeo se guarda en IndexedDB (store `id_mappings`)
 * para no perder referencias entre entidades relacionadas
 * (ej. venta → items).
 */

const LOCAL_PREFIX = 'local_'

/**
 * Genera un ID único. Si hay internet, usa UUID v4.
 * Si no, genera un ID temporal.
 */
export function generateId(isOnline = true) {
  if (isOnline && typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return generateLocalId()
}

/**
 * Fuerza la generación de un ID temporal (para operaciones offline).
 */
export function generateLocalId(prefix = 'op') {
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 10)
  return `${LOCAL_PREFIX}${prefix}_${timestamp}_${random}`
}

/**
 * ¿Es un ID temporal (pendiente de sincronizar)?
 */
export function isLocalId(id) {
  return typeof id === 'string' && id.startsWith(LOCAL_PREFIX)
}

/**
 * Guarda el mapeo local_id → server_id.
 * Se usa cuando el server responde con el UUID definitivo.
 */
export async function mapLocalIdToServerId(localId, serverId) {
  try {
    const db = await dbPromise

    // Verificar que el store existe
    if (!db.objectStoreNames.contains(STORES.ID_MAPPINGS)) {
      console.warn('⚠️  Store id_mappings no existe, saltando mapeo')
      return
    }

    await db.put(STORES.ID_MAPPINGS, {
      local_id: localId,
      server_id: serverId,
      mapped_at: new Date().toISOString(),
    })
    console.log(`🔗 Mapeado: ${localId} → ${serverId}`)
  } catch (err) {
    console.error('❌ Error mapeando ID:', err)
  }
}

/**
 * Obtiene el server_id a partir de un local_id.
 * Si el ID no es local, lo devuelve tal cual.
 */
export async function resolveServerId(localId) {
  if (!isLocalId(localId)) return localId

  try {
    const db = await dbPromise
    if (!db.objectStoreNames.contains(STORES.ID_MAPPINGS)) return localId

    const record = await db.get(STORES.ID_MAPPINGS, localId)
    return record?.server_id || localId
  } catch {
    return localId
  }
}

/**
 * Obtiene el local_id a partir de un server_id.
 */
export async function resolveLocalId(serverId) {
  try {
    const db = await dbPromise
    if (!db.objectStoreNames.contains(STORES.ID_MAPPINGS)) return serverId

    const all = await db.getAll(STORES.ID_MAPPINGS)
    const found = all.find((m) => m.server_id === serverId)
    return found?.local_id || serverId
  } catch {
    return serverId
  }
}