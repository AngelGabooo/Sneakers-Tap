// src/services/notificationsService.js
import { supabase } from '../lib/supabase'

export const notificationsService = {
  async getAll({ limit = 100 } = {}) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  async create(notif) {
    const payload = {
      type: notif.type,
      title: notif.title,
      description: notif.description || null,
      priority: notif.priority || 'normal',
      read: false,
      actor_name: notif.actorName || null,
      actor_role: notif.actorRole || null,
      entity_id: notif.entityId || null,
      meta: notif.meta || {},
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert(payload)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async markAsRead(id) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)

    if (error) throw error
  },

  async markAllAsRead() {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false)

    if (error) throw error
  },

  async clearAll() {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .not('id', 'is', null)

    if (error) throw error
  },
}