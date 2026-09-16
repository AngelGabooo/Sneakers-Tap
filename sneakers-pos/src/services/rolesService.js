// src/services/rolesService.js
import { supabase } from '../lib/supabase'

/**
 * Servicio de roles — conecta con la tabla `roles` de Supabase.
 */
export const rolesService = {
  /**
   * Obtiene todos los roles.
   */
  async getAll() {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  },

  /**
   * Obtiene un rol por ID.
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Crea un rol nuevo.
   */
  async create(payload) {
    const { data, error } = await supabase
      .from('roles')
      .insert({
        name: payload.name,
        description: payload.description || '',
        type: payload.type || 'custom',
        status: payload.status || 'active',
        permissions: payload.permissions || [],
        scope: payload.scope || 'all',
        branches: payload.branches || [],
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Actualiza un rol existente.
   */
  async update(id, patch) {
    const { data, error } = await supabase
      .from('roles')
      .update(patch)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Elimina un rol.
   */
  async delete(id) {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },
}