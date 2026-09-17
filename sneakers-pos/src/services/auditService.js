// src/services/auditService.js
import { supabase } from '../lib/supabase'

/**
 * Servicio de auditoría — conecta con `audit_log` de Supabase.
 *
 * La tabla solo tiene: id, user_id, user_name, user_role, action,
 * entity, entity_id, description, metadata (jsonb), ip, device, created_at.
 *
 * Todo lo que sobra (module, level, result, branch, reason, origin,
 * entityName) se guarda DENTRO de metadata para no migrar el schema.
 */
export const auditService = {
  /**
   * Obtiene eventos de auditoría con filtros.
   */
  async getAll({
    limit = 500,
    from,
    to,
    userId,
    action,
    entity,
    level,
    module: mod,
  } = {}) {
    let query = supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })

    if (limit) query = query.limit(limit)
    if (from) query = query.gte('created_at', from)
    if (to) query = query.lte('created_at', to)
    if (userId) query = query.eq('user_id', userId)
    if (action) query = query.eq('action', action)
    if (entity) query = query.eq('entity', entity)
    if (level) query = query.eq('metadata->>level', level)
    if (mod) query = query.eq('metadata->>module', mod)

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  /**
   * Crea un evento de auditoría.
   */
  async create(event) {
    const device =
      event.device ||
      (typeof navigator !== 'undefined'
        ? navigator.userAgent?.slice(0, 250)
        : null)

    const enrichedMetadata = {
      ...(event.metadata || {}),
      module: event.module || 'system',
      entityName: event.entityName || event.entityId || null,
      level: event.level || 'info',
      result: event.result || 'success',
      branch: event.branch || 'Tienda principal',
      reason: event.reason || null,
      origin: event.origin || null,
    }

    const payload = {
      user_id: event.userId || null,
      user_name: event.userName || null,
      user_role: event.userRole || null,
      action: event.action,
      entity: event.entity || null,
      entity_id: event.entityId || null,
      description: event.description || null,
      metadata: enrichedMetadata,
      ip: event.ip || null,
      device,
    }

    const { data, error } = await supabase
      .from('audit_log')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('❌ auditService.create error:', error)
      throw error
    }
    return data
  },

  /**
   * Elimina eventos antiguos (más de N días) — opcional, para mantenimiento.
   */
  async purgeOlderThan(days = 90) {
    const cutoff = new Date(
      Date.now() - days * 24 * 60 * 60 * 1000,
    ).toISOString()

    const { error } = await supabase
      .from('audit_log')
      .delete()
      .lt('created_at', cutoff)

    if (error) throw error
    return true
  },
}