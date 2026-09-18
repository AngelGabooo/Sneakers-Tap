// src/repositories/usersRepo.js
import { dbPromise, STORES } from '../lib/db'
import { usersService } from '../services/usersService'
import { authService } from '../services/authService'
import { supabase } from '../lib/supabase'

function mapFromSupabase(row) {
  if (!row) return null
  return {
    id: row.id,
    employeeId: row.employee_id,
    fullName: row.full_name || '',
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    username: (row.email || '').split('@')[0] || '',
    email: row.email || '',
    phone: row.phone || '',
    roleId: row.role_id,
    role: row.role?.name || row.metadata?.roleName || 'Sin rol',
    branchId: row.branch_id,
    branch: row.branch?.name || '—',
    status: row.status || 'active',
    avatarUrl: row.avatar_url,
    lastAccess: row.last_access,
    lastAccessRelative: null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    metadata: row.metadata || {},
    syncStatus: 'synced',
  }
}

export const usersRepo = {
  async getAllLocal() {
    const db = await dbPromise
    const all = await db.getAll(STORES.PROFILES)
    return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  async getByIdLocal(id) {
    const db = await dbPromise
    return db.get(STORES.PROFILES, id)
  },

  async syncFromSupabase() {
    try {
      console.log('🔄 Sincronizando usuarios desde Supabase...')
      const remote = await usersService.getAll()
      const mapped = remote.map(mapFromSupabase)

      const db = await dbPromise
      for (const user of mapped) {
        await db.put(STORES.PROFILES, user)
      }

      console.log(`✅ ${mapped.length} usuarios sincronizados`)
      return mapped
    } catch (err) {
      console.error('❌ Error sincronizando usuarios:', err)
      throw err
    }
  },

  async create({ email, password, fullName, phone, roleId, branchId, status = 'active' }) {
    const authResult = await authService.signUpAdmin({
      email,
      password,
      metadata: {
        full_name: fullName,
        role_name: roleId?.name,
      },
    })

    const userId = authResult.user?.id
    if (!userId) throw new Error('No se pudo crear el usuario en Auth')

    const employeeId = await usersService.nextEmployeeId()

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        first_name: fullName.trim().split(' ')[0] || '',
        last_name: fullName.trim().split(' ').slice(1).join(' ') || '',
        phone: phone || null,
        employee_id: employeeId,
        role_id: roleId || null,
        branch_id: branchId || null,
        status,
      })
      .eq('id', userId)

    if (updateError) {
      console.warn('⚠️ Usuario creado en Auth, pero no se actualizó profile:', updateError)
    }

    const profile = await usersService.getById(userId)
    const mapped = mapFromSupabase(profile)

    const db = await dbPromise
    await db.put(STORES.PROFILES, mapped)

    console.log('✅ Usuario creado:', mapped.fullName, mapped.email)
    return mapped
  },

  async update(id, patch) {
    const updated = await usersService.update(id, patch)
    const db = await dbPromise
    const current = await db.get(STORES.PROFILES, id)
    const merged = { ...current, ...patch, updatedAt: new Date().toISOString() }
    await db.put(STORES.PROFILES, merged)
    return merged
  },

  async changeStatus(id, status) {
    await usersService.changeStatus(id, status)
    const db = await dbPromise
    const current = await db.get(STORES.PROFILES, id)
    if (current) {
      await db.put(STORES.PROFILES, { ...current, status })
    }
    return true
  },

  async delete(id) {
    await usersService.delete(id)
    const db = await dbPromise
    await db.delete(STORES.PROFILES, id)
    return true
  },

  /**
   * ⭐ NUEVO: obtiene la actividad del usuario combinando sales + audit + sessions.
   */
  async getUserActivityMerged(userId) {
    return await usersService.getUserActivityMerged(userId)
  },

  /**
   * ⭐ NUEVO: sesiones desde Supabase.
   */
  async getUserSessions(userId) {
    return await usersService.getUserSessions(userId)
  },

  async closeSessionRemote(sessionId, reason) {
    return await usersService.closeSessionRemote(sessionId, reason)
  },
}