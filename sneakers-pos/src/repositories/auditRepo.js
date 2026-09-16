// src/repositories/auditRepo.js
import { dbPromise, STORES } from '../lib/db'
import { auditService } from '../services/auditService'
import { syncQueue } from '../services/sync/syncQueue'
import { OP, PRIORITY } from '../services/sync/operationTypes'
import { generateLocalId } from '../lib/idGenerator'

function mapFromSupabase(row) {
  if (!row) return null
  return {
    id: row.id,
    auditId: `AUD-${(row.entity || 'EVT').toUpperCase()}-${String(row.id).slice(-8).toUpperCase()}`,
    userId: row.user_id,
    userName: row.user_name,
    userRole: row.user_role,
    action: row.action,
    module: row.metadata?.module || 'system',
    entity: row.entity,
    entityId: row.entity_id,
    entityName: row.metadata?.entityName || row.entity_id,
    description: row.description,
    level: row.metadata?.level || 'info',
    result: row.metadata?.result || 'success',
    branch: row.metadata?.branch || 'Tienda principal',
    reason: row.metadata?.reason,
    user: { name: row.user_name, role: row.user_role },
    origin: row.metadata?.origin || null,
    createdAt: row.created_at,
    syncStatus: 'synced',
    metadata: row.metadata || {},
  }
}

export const auditRepo = {
  async getAllLocal() {
    const db = await dbPromise
    const all = await db.getAll(STORES.AUDIT_LOG)
    return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  async syncFromSupabase() {
    try {
      console.log('🔄 Sincronizando auditoría desde Supabase...')
      const remote = await auditService.getAll({ limit: 500 })
      const mapped = remote.map(mapFromSupabase)

      const db = await dbPromise
      for (const event of mapped) {
        await db.put(STORES.AUDIT_LOG, event)
      }

      console.log(`✅ ${mapped.length} eventos de auditoría sincronizados`)
      return mapped
    } catch (err) {
      console.error('❌ Error sincronizando auditoría:', err)
      throw err
    }
  },

  /**
   * Crea un evento de auditoría local + encola sync.
   */
  async create(event) {
    const isOnline = navigator.onLine
    const id = isOnline && crypto?.randomUUID
      ? crypto.randomUUID()
      : generateLocalId('aud')

    const now = new Date().toISOString()

    const local = {
      id,
      auditId: `AUD-${(event.entity || 'EVT').toUpperCase()}-${String(id).slice(-8).toUpperCase()}`,
      userId: event.userId || null,
      userName: event.userName || null,
      userRole: event.userRole || null,
      action: event.action,
      module: event.module || 'system',
      entity: event.entity || null,
      entityId: event.entityId || null,
      entityName: event.entityName || event.entityId || null,
      description: event.description || null,
      level: event.level || 'info',
      result: event.result || 'success',
      branch: event.branch || 'Tienda principal',
      reason: event.reason || null,
      user: { name: event.userName, role: event.userRole },
      origin: event.origin || null,
      metadata: event.metadata || {},
      createdAt: now,
      syncStatus: 'pending',
    }

    const db = await dbPromise
    await db.put(STORES.AUDIT_LOG, local)

    await syncQueue.add({
      type: OP.CREATE_AUDIT_LOG,
      entity: 'audit_log',
      payload: { event: local },
      priority: PRIORITY.NORMAL,
    })

    return local
  },
}