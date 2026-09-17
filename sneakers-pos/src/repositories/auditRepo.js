// src/repositories/auditRepo.js
import { dbPromise, STORES } from '../lib/db'
import { auditService } from '../services/auditService'
import { syncQueue } from '../services/sync/syncQueue'
import { OP, PRIORITY } from '../services/sync/operationTypes'
import { generateLocalId } from '../lib/idGenerator'

function mapFromSupabase(row) {
  if (!row) return null
  const meta = row.metadata || {}
  return {
    id: row.id,
    auditId: `AUD-${(row.entity || 'EVT').toUpperCase()}-${String(row.id).slice(-8).toUpperCase()}`,
    userId: row.user_id,
    userName: row.user_name,
    userRole: row.user_role,
    action: row.action,
    module: meta.module || 'system',
    entity: row.entity,
    entityId: row.entity_id,
    entityName: meta.entityName || row.entity_id,
    description: row.description,
    level: meta.level || 'info',
    result: meta.result || 'success',
    branch: meta.branch || 'Tienda principal',
    reason: meta.reason || null,
    origin: meta.origin || null,
    user: { name: row.user_name, role: row.user_role },
    createdAt: row.created_at,
    syncStatus: 'synced',
    metadata: meta,
    ip: row.ip || null,
    device: row.device || null,
  }
}

export const auditRepo = {
  async getAllLocal() {
    const db = await dbPromise
    const all = await db.getAll(STORES.AUDIT_LOG)
    return all.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    )
  },

  async getByIdLocal(id) {
    const db = await dbPromise
    return db.get(STORES.AUDIT_LOG, id)
  },

  async syncFromSupabase(filters = {}) {
    try {
      console.log('🔄 Sincronizando auditoría desde Supabase...')
      const remote = await auditService.getAll({
        limit: 500,
        ...filters,
      })
      const mapped = remote.map(mapFromSupabase)

      const db = await dbPromise
      for (const event of mapped) {
        // ⭐ No pisar eventos locales que aún están pendientes de sync
        const existing = await db.get(STORES.AUDIT_LOG, event.id)
        if (existing?.syncStatus === 'pending') continue
        await db.put(STORES.AUDIT_LOG, event)
      }

      console.log(`✅ ${mapped.length} eventos de auditoría sincronizados`)
      return mapped
    } catch (err) {
      console.error('❌ Error sincronizando auditoría:', err)
      throw err
    }
  },

  async create(event) {
    // ⭐ SIEMPRE ID temporal local. NUNCA el UUID del navegador.
    //    Motivo: si dos dispositivos offline generan UUIDs distintos para
    //    el mismo evento, no colisionan. Además, el syncEngine se encarga
    //    de reemplazar este ID por el UUID real de Supabase al sincronizar.
    const id = generateLocalId('aud')
    const now = new Date().toISOString()

    const local = {
      id,
      auditId: `AUD-${(event.entity || 'EVT').toUpperCase()}-${String(id).slice(-8).toUpperCase()}`,
      userId: event.userId || null,
      userName: event.userName || 'Sistema',
      userRole: event.userRole || 'Sistema',
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
      origin: event.origin || null,
      metadata: event.metadata || {},
      user: { name: event.userName, role: event.userRole },
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

  async purgeOlderThan(days = 90) {
    const db = await dbPromise
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
    const all = await db.getAll(STORES.AUDIT_LOG)
    let deleted = 0
    for (const ev of all) {
      if (
        ev.syncStatus === 'synced' &&
        new Date(ev.createdAt).getTime() < cutoff
      ) {
        await db.delete(STORES.AUDIT_LOG, ev.id)
        deleted++
      }
    }
    console.log(`🧹 ${deleted} eventos purgados`)
    return deleted
  },
}