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
    const insertPayload = {
      name: payload.name,
      description: payload.description || '',
      type: payload.type || 'custom',
      status: payload.status || 'active',
      permissions: payload.permissions || [],
      scope: payload.scope || 'all',
      branches: payload.branches || [],
    }

    console.log('📤 rolesService.create:', insertPayload.name, '·', insertPayload.permissions.length, 'permisos')

    const { data, error } = await supabase
      .from('roles')
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      console.error('❌ rolesService.create error:', error)
      throw error
    }

    console.log('✅ Rol creado en Supabase:', data.name)
    return data
  },

  /**
   * Actualiza un rol existente.
   */
  async update(id, patch) {
    // Solo enviamos los campos que Supabase conoce
    const updatePayload = {}
    if (patch.name !== undefined)        updatePayload.name = patch.name
    if (patch.description !== undefined) updatePayload.description = patch.description
    if (patch.status !== undefined)      updatePayload.status = patch.status
    if (patch.permissions !== undefined) updatePayload.permissions = patch.permissions
    if (patch.scope !== undefined)       updatePayload.scope = patch.scope
    if (patch.branches !== undefined)    updatePayload.branches = patch.branches
    if (patch.type !== undefined)        updatePayload.type = patch.type

    console.log('📤 rolesService.update:', {
      id,
      name: updatePayload.name,
      numPermissions: updatePayload.permissions?.length,
      keys: Object.keys(updatePayload),
    })

    const { data, error } = await supabase
      .from('roles')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ rolesService.update error:', error)
      throw error
    }

    console.log(
      '✅ Rol actualizado en Supabase:',
      data.name,
      '·',
      data.permissions?.length,
      'permisos',
    )
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