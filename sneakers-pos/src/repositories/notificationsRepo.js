// src/repositories/notificationsRepo.js
import { notificationsService } from '../services/notificationsService'

const STORAGE_KEY = 'sneakers-notifications-cache'

function readCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function writeCache(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 100)))
  } catch {}
}

function mapFromSupabase(row) {
  if (!row) return null
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    priority: row.priority || 'normal',
    read: !!row.read,
    actorName: row.actor_name,
    actorRole: row.actor_role,
    entityId: row.entity_id,
    meta: row.meta || {},
    createdAt: row.created_at,
    syncStatus: 'synced',
  }
}

export const notificationsRepo = {
  getLocal() {
    return readCache()
  },

  async syncFromSupabase() {
    try {
      console.log('🔄 Sincronizando notificaciones desde Supabase...')
      const remote = await notificationsService.getAll({ limit: 100 })
      const mapped = remote.map(mapFromSupabase)
      writeCache(mapped)
      console.log(`✅ ${mapped.length} notificaciones sincronizadas`)
      return mapped
    } catch (err) {
      console.error('❌ Error sincronizando notificaciones:', err)
      throw err
    }
  },

  /**
   * Crea una notificación local (cache) + intenta Supabase.
   */
  async create(notif) {
    const entry = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      read: false,
      priority: 'normal',
      ...notif,
      syncStatus: 'pending',
    }

    // Guardar en cache
    const current = readCache()
    const next = [entry, ...current].slice(0, 100)
    writeCache(next)

    // Intentar Supabase (si falla, no importa — el syncEngine lo reintentará)
    try {
      const created = await notificationsService.create(entry)
      // Actualizar el cache con el ID real
      const updated = next.map((n) =>
        n.id === entry.id ? { ...n, id: created.id, syncStatus: 'synced' } : n,
      )
      writeCache(updated)
      return mapFromSupabase(created)
    } catch (err) {
      console.warn('⚠️ No se pudo guardar notif en Supabase, queda en cache:', err.message)
      return entry
    }
  },

  async markAsRead(id) {
    const current = readCache()
    const next = current.map((n) => (n.id === id ? { ...n, read: true } : n))
    writeCache(next)
    try {
      await notificationsService.markAsRead(id)
    } catch (err) {
      console.warn('⚠️ No se pudo marcar como leída en Supabase:', err.message)
    }
  },

  async markAllAsRead() {
    const current = readCache()
    const next = current.map((n) => ({ ...n, read: true }))
    writeCache(next)
    try {
      await notificationsService.markAllAsRead()
    } catch (err) {
      console.warn('⚠️ No se pudo marcar todas en Supabase:', err.message)
    }
  },

  async clearAll() {
    writeCache([])
    try {
      await notificationsService.clearAll()
    } catch (err) {
      console.warn('⚠️ No se pudo limpiar en Supabase:', err.message)
    }
  },
}