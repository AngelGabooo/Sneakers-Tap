// src/services/sync/syncQueue.js
import { dbPromise, STORES } from '../../lib/db'
import { OP, STATUS, PRIORITY } from './operationTypes'
import { generateLocalId } from '../../lib/idGenerator'

/**
 * Cola de operaciones pendientes de sincronizar.
 *
 * Cada operación se guarda en IndexedDB con:
 *   - id            → ID único de la operación
 *   - type          → OP.CREATE_SALE, OP.UPDATE_SALE, etc.
 *   - entity        → 'sales', 'products', etc.
 *   - payload       → datos a enviar
 *   - status        → pending | syncing | synced | failed | conflict
 *   - priority      → 1..20
 *   - attempts      → cuántas veces se intentó
 *   - last_error    → último mensaje de error
 *   - created_at    → cuándo se creó
 *   - next_retry_at → cuándo reintentar (backoff exponencial)
 */

export const syncQueue = {
  /**
   * Agrega una operación a la cola.
   */
  async add({ type, entity, payload, priority = PRIORITY.NORMAL, id = null }) {
    const db = await dbPromise
    const op = {
      id: id || generateLocalId('op'),
      type,
      entity,
      payload,
      status: STATUS.PENDING,
      priority,
      attempts: 0,
      last_error: null,
      created_at: new Date().toISOString(),
      next_retry_at: new Date().toISOString(),
    }
    await db.put(STORES.SYNC_QUEUE, op)
    console.log(`📥 Encolada operación: ${type} (${op.id})`)
    return op
  },

  /**
   * Obtiene todas las operaciones pendientes (status = pending o failed).
   * Ordenadas por prioridad (mayor primero) y luego por fecha (más antigua primero).
   */
  async getPending() {
    const db = await dbPromise
    const all = await db.getAll(STORES.SYNC_QUEUE)

    return all
      .filter((op) => op.status === STATUS.PENDING || op.status === STATUS.FAILED)
      .filter((op) => {
        // No incluir operaciones cuyo next_retry_at esté en el futuro
        if (!op.next_retry_at) return true
        return new Date(op.next_retry_at) <= new Date()
      })
      .sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority
        return new Date(a.created_at) - new Date(b.created_at)
      })
  },

  /**
   * Obtiene todas las operaciones (para debug).
   */
  async getAll() {
    const db = await dbPromise
    return db.getAll(STORES.SYNC_QUEUE)
  },

  /**
   * Actualiza una operación.
   */
  async update(id, patch) {
    const db = await dbPromise
    const existing = await db.get(STORES.SYNC_QUEUE, id)
    if (!existing) return null
    const updated = { ...existing, ...patch }
    await db.put(STORES.SYNC_QUEUE, updated)
    return updated
  },

  /**
   * Marca una operación como exitosa (se puede borrar después).
   */
  async markSynced(id) {
    await this.update(id, {
      status: STATUS.SYNCED,
      synced_at: new Date().toISOString(),
    })
  },

  /**
   * Marca una operación como fallida con backoff exponencial.
   */
  async markFailed(id, errorMessage) {
    const db = await dbPromise
    const op = await db.get(STORES.SYNC_QUEUE, id)
    if (!op) return

    const attempts = (op.attempts || 0) + 1

    // Backoff exponencial: 2^attempts segundos (cap a 5 min)
    const delaySeconds = Math.min(Math.pow(2, attempts), 300)
    const nextRetry = new Date(Date.now() + delaySeconds * 1000)

    await this.update(id, {
      status: STATUS.FAILED,
      attempts,
      last_error: errorMessage || 'Error desconocido',
      last_attempt_at: new Date().toISOString(),
      next_retry_at: nextRetry.toISOString(),
    })
  },

  /**
   * Marca una operación como "syncing" (en proceso).
   */
  async markSyncing(id) {
    await this.update(id, {
      status: STATUS.SYNCING,
      last_attempt_at: new Date().toISOString(),
    })
  },

  /**
   * Marca una operación como conflicto.
   */
  async markConflict(id, reason) {
    await this.update(id, {
      status: STATUS.CONFLICT,
      last_error: reason || 'Conflicto detectado',
    })
  },

  /**
   * Elimina operaciones ya sincronizadas (limpieza).
   */
  async cleanup() {
    const db = await dbPromise
    const all = await db.getAll(STORES.SYNC_QUEUE)
    const toDelete = all.filter((op) => op.status === STATUS.SYNCED)

    for (const op of toDelete) {
      await db.delete(STORES.SYNC_QUEUE, op.id)
    }

    console.log(`🧹 Limpiadas ${toDelete.length} operaciones sincronizadas`)
    return toDelete.length
  },

  /**
   * Cuenta de operaciones pendientes.
   */
  async countPending() {
    const db = await dbPromise
    const all = await db.getAll(STORES.SYNC_QUEUE)
    return all.filter(
      (op) => op.status === STATUS.PENDING || op.status === STATUS.FAILED,
    ).length
  },

  /**
   * Elimina TODAS las operaciones (peligroso).
   */
  async clear() {
    const db = await dbPromise
    await db.clear(STORES.SYNC_QUEUE)
  },
}

export { OP, STATUS, PRIORITY }