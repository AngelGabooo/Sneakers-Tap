// src/repositories/promotionsRepo.js
import { promotionsService } from '../services/promotionsService'
import { logAudit } from '../utils/auditHelpers'

/**
 * Repositorio de promociones — online-only (no crítico offline).
 * Si no hay red, devuelve lo que tenga en memoria.
 */
let memoryCache = []

export const promotionsRepo = {
  async getAll() {
    try {
      const remote = await promotionsService.getAll()
      memoryCache = remote
      return remote
    } catch (err) {
      console.warn('⚠️ promotions getAll falló, usando cache:', err.message)
      return memoryCache
    }
  },

  async getActive() {
    try {
      const remote = await promotionsService.getActive()
      return remote
    } catch (err) {
      console.warn('⚠️ promotions getActive falló:', err.message)
      return memoryCache.filter((p) => p.active)
    }
  },

  async create({ promotion, createdBy }) {
    const created = await promotionsService.create({ promotion })

    await logAudit({
      action: 'create',
      module: 'promotions',
      entity: 'promotion',
      entityId: created.id,
      entityName: created.name,
      description: `Promoción creada: ${created.name}`,
      userId: createdBy?.id,
      userName: createdBy?.name,
      userRole: createdBy?.role,
      level: 'important',
    })

    memoryCache = [created, ...memoryCache]
    return created
  },

  async update(id, { promotion, updatedBy }) {
    const updated = await promotionsService.update(id, { promotion })

    await logAudit({
      action: 'update',
      module: 'promotions',
      entity: 'promotion',
      entityId: id,
      entityName: updated.name,
      description: `Promoción actualizada: ${updated.name}`,
      userId: updatedBy?.id,
      userName: updatedBy?.name,
      userRole: updatedBy?.role,
      level: 'info',
    })

    memoryCache = memoryCache.map((p) => (p.id === id ? updated : p))
    return updated
  },

  async toggleActive(id, active) {
    const updated = await promotionsService.toggleActive(id, active)
    memoryCache = memoryCache.map((p) =>
      p.id === id ? { ...p, active } : p,
    )
    return updated
  },

  async delete(id) {
    await promotionsService.delete(id)
    memoryCache = memoryCache.filter((p) => p.id !== id)
    return true
  },
}