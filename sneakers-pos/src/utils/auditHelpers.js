// src/utils/auditHelpers.js
import { auditRepo } from '../repositories/auditRepo'

export async function logAudit({
  action,
  module = 'system',
  entity,
  entityId = null,
  entityName = null,
  description = '',
  user = null,
  userName = null,
  userRole = null,
  branch = 'Tienda principal',
  level = 'info',
  result = 'success',
  reason = null,
  metadata = {},
  origin = null,
}) {
  try {
    if (!action) {
      console.warn('⚠️ logAudit: falta "action"')
      return null
    }

    const event = {
      action,
      module,
      entity,
      entityId,
      entityName: entityName || entityId,
      description,
      userId: user?.id || null,
      userName: user?.name || userName || 'Sistema',
      userRole: user?.role || userRole || 'Sistema',
      branch,
      level,
      result,
      reason,
      metadata,
      origin,
    }

    const created = await auditRepo.create(event)
    console.log(`📋 Audit [${level}] ${action} → ${description}`)
    return created
  } catch (err) {
    console.warn('⚠️ Error registrando auditoría:', err)
    return null
  }
}

// Helpers rápidos por nivel
export const auditInfo = (opts) => logAudit({ ...opts, level: 'info' })
export const auditImportant = (opts) =>
  logAudit({ ...opts, level: 'important' })
export const auditCritical = (opts) =>
  logAudit({ ...opts, level: 'critical' })