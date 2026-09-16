// src/services/profilesService.js
import { supabase } from '../lib/supabase'

/**
 * Servicio de perfiles de usuario (tabla `profiles`).
 */
export const profilesService = {
  /**
   * Obtiene el perfil de un usuario por su ID (auth.users.id),
   * incluyendo su rol y sucursal.
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        role:roles (
          id,
          name,
          permissions,
          scope,
          status
        ),
        branch:branches (
          id,
          name,
          code
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Actualiza el perfil de un usuario.
   */
  async update(id, patch) {
    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Actualiza `last_access` al iniciar sesión.
   */
  async touchLastAccess(id) {
    const { error } = await supabase
      .from('profiles')
      .update({ last_access: new Date().toISOString() })
      .eq('id', id)

    if (error) console.warn('No se pudo actualizar last_access:', error)
  },
}