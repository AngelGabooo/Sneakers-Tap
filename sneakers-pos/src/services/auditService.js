// src/services/auditService.js
import { supabase } from '../lib/supabase'

/**
 * Servicio de auditoría — conecta con `audit_log` de Supabase.
 */
export const auditService = {
  /**
   * Obtiene eventos de auditoría con filtros.
   */
  async getAll({ limit = 500, from, to, userId, action, entity } = {}) {
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

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  /**
   * Crea un evento de auditoría.
   */
  async create(event) {
    const payload = {
      user_id: event.userId || null,
      user_name: event.userName || null,
      user_role: event.userRole || null,
      action: event.action,
      entity: event.entity || null,
      entity_id: event.entityId || null,
      description: event.description || null,
      metadata: event.metadata || {},
      ip: event.ip || null,
      device: event.device || null,
    }

    const { data, error } = await supabase
      .from('audit_log')
      .insert(payload)
      .select()
      .single()

    if (error) throw error
    return data
  },
}