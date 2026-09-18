// src/services/usersService.js
import { supabase } from '../lib/supabase'

/**
 * Servicio de usuarios — opera contra `profiles`.
 */
export const usersService = {
  async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        role:roles (id, name, permissions),
        branch:branches (id, name, code)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        role:roles (*),
        branch:branches (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getByEmail(email) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', (email || '').toLowerCase())
      .maybeSingle()

    if (error) throw error
    return data
  },

  async update(id, patch) {
    const payload = {}

    if (patch.fullName !== undefined) {
      payload.full_name = patch.fullName
      const parts = patch.fullName.trim().split(' ')
      payload.first_name = parts[0] || ''
      payload.last_name = parts.slice(1).join(' ') || ''
    }
    if (patch.email !== undefined)     payload.email = patch.email.toLowerCase()
    if (patch.phone !== undefined)     payload.phone = patch.phone
    if (patch.roleId !== undefined)    payload.role_id = patch.roleId
    if (patch.branchId !== undefined)  payload.branch_id = patch.branchId
    if (patch.status !== undefined)    payload.status = patch.status
    if (patch.avatarUrl !== undefined) payload.avatar_url = patch.avatarUrl
    if (patch.metadata !== undefined)  payload.metadata = patch.metadata

    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async changeStatus(id, status) {
    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', id)

    if (error) throw error
    return true
  },

  /**
   * ⭐ Elimina el usuario PERMANENTEMENTE de Auth + profile.
   *    Requiere una Edge Function con service_role para borrar de auth.users.
   */
  async delete(id) {
    // 1. Intentar borrar vía Edge Function (borra auth.users + profile por cascade)
    try {
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId: id },
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)

      console.log('✅ Usuario eliminado de Auth + profiles:', id)
      return true
    } catch (err) {
      console.warn('⚠️ No se pudo borrar de auth.users, borrando solo profile:', err.message)

      // Fallback: borrar solo el profile (el usuario queda huérfano en auth)
      const { error } = await supabase.from('profiles').delete().eq('id', id)
      if (error) throw error
      return true
    }
  },

  async nextEmployeeId() {
    const { data, error } = await supabase
      .from('profiles')
      .select('employee_id')
      .not('employee_id', 'is', null)
      .order('employee_id', { ascending: false })
      .limit(1)

    if (error) throw error

    const last = data?.[0]?.employee_id || 'EMP-00000'
    const num = parseInt(last.replace('EMP-', ''), 10) || 0
    return `EMP-${String(num + 1).padStart(5, '0')}`
  },

  /**
   * ⭐ Obtiene la actividad del usuario uniendo 3 fuentes:
   *    1. Ventas hechas (sales)
   *    2. Auditoría (audit_log)
   *    3. Sesiones (login/logout)
   */
  async getUserActivityMerged(userId, { limit = 100 } = {}) {
    const results = []

    // 1️⃣ Ventas
    try {
      const { data: sales } = await supabase
        .from('sales')
        .select('id, folio, total, created_at, status')
        .eq('seller_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      ;(sales || []).forEach((s) => {
        results.push({
          id: `sale-${s.id}`,
          type: 'sale',
          label: `Registró la venta ${s.folio} por $${Number(s.total || 0).toLocaleString('es-MX')}`,
          at: s.created_at,
          by: null,
          meta: { saleId: s.id, folio: s.folio, total: s.total, status: s.status },
        })
      })
    } catch (err) {
      console.warn('⚠️ Error cargando ventas para actividad:', err.message)
    }

    // 2️⃣ Auditoría
    try {
      const { data: audit } = await supabase
        .from('audit_log')
        .select('id, action, entity, description, created_at, metadata')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      ;(audit || []).forEach((a) => {
        results.push({
          id: `audit-${a.id}`,
          type: 'audit',
          label: a.description || `${a.action} en ${a.entity || 'sistema'}`,
          at: a.created_at,
          by: null,
          meta: { action: a.action, entity: a.entity, metadata: a.metadata },
        })
      })
    } catch (err) {
      console.warn('⚠️ Error cargando auditoría para actividad:', err.message)
    }

    // 3️⃣ Sesiones
    try {
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(30)

      ;(sessions || []).forEach((s) => {
        results.push({
          id: `session-start-${s.id}`,
          type: 'session',
          label: `Inició sesión`,
          at: s.started_at,
          by: null,
          meta: { device: s.device, userAgent: s.user_agent },
        })

        if (s.ended_at) {
          results.push({
            id: `session-end-${s.id}`,
            type: 'session',
            label: `Cerró sesión${s.end_reason ? ` · ${s.end_reason}` : ''}`,
            at: s.ended_at,
            by: null,
            meta: { device: s.device, userAgent: s.user_agent },
          })
        }
      })
    } catch (err) {
      console.warn('⚠️ Error cargando sesiones para actividad:', err.message)
    }

    // Ordenar por fecha descendente
    results.sort((a, b) => new Date(b.at) - new Date(a.at))

    return results.slice(0, limit)
  },

  /**
   * ⭐ Obtiene las sesiones del usuario desde Supabase.
   */
  async getUserSessions(userId) {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return (data || []).map((s) => ({
      id: s.id,
      userId: s.user_id,
      startedAt: s.started_at,
      endedAt: s.ended_at,
      endReason: s.end_reason,
      device: s.device,
      userAgent: s.user_agent,
      ip: s.ip,
    }))
  },

  /**
   * ⭐ Cierra una sesión remotamente (desde la vista de admin).
   */
  async closeSessionRemote(sessionId, reason = 'Cierre remoto por administrador') {
    const { error } = await supabase
      .from('user_sessions')
      .update({
        ended_at: new Date().toISOString(),
        end_reason: reason,
      })
      .eq('id', sessionId)
      .is('ended_at', null)

    if (error) throw error
    return true
  },

  /**
   * ⭐ Registra un inicio de sesión.
   */
  async startSession({ userId, device, userAgent, ip }) {
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        device: device || null,
        user_agent: userAgent || null,
        ip: ip || null,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * ⭐ Registra el cierre de sesión.
   */
  async endSession(sessionId, reason = 'Logout') {
    const { error } = await supabase
      .from('user_sessions')
      .update({
        ended_at: new Date().toISOString(),
        end_reason: reason,
      })
      .eq('id', sessionId)

    if (error) throw error
    return true
  },

  /**
   * ⭐ Actualiza `last_access` del profile.
   */
  async touchLastAccess(userId) {
    const { error } = await supabase
      .from('profiles')
      .update({ last_access: new Date().toISOString() })
      .eq('id', userId)

    if (error) throw error
    return true
  },
}