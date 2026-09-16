// src/services/usersService.js
import { supabase } from '../lib/supabase'

/**
 * Servicio de usuarios — opera contra `profiles`.
 */
export const usersService = {
  /**
   * Obtiene todos los usuarios con rol y sucursal.
   */
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

  /**
   * Actualiza un perfil.
   */
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

  async delete(id) {
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) throw error
    return true
  },

  /**
   * Genera el siguiente employee_id.
   */
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
}