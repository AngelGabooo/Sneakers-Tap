/**
 * Constantes y helpers para la vista de Usuarios.
 * Los datos reales ahora vienen del UsersContext (localStorage).
 */

export const STATUS_CONFIG = {
  active:    { label: 'Activo',               variant: 'success' },
  pending:   { label: 'Invitación pendiente', variant: 'warning' },
  inactive:  { label: 'Inactivo',             variant: 'neutral' },
  suspended: { label: 'Suspendido',           variant: 'danger'  },
  blocked:   { label: 'Bloqueado',            variant: 'danger'  },
}

/**
 * Calcula las métricas del encabezado.
 */
export function computeMetrics(users = []) {
  const total = users.length
  const active = users.filter((u) => u.status === 'active').length
  const inactive = users.filter((u) => u.status === 'inactive').length
  const pendingInvites = users.filter((u) => u.status === 'pending').length
  return { total, active, inactive, pendingInvites }
}

/**
 * Calcula el resumen de actividad.
 */
export function computeActivitySummary(users = []) {
  const now = Date.now()
  const recentThreshold = 24 * 60 * 60 * 1000 // 24h

  const recentAccessCount = users.filter((u) => {
    if (!u.lastAccess) return false
    return now - new Date(u.lastAccess).getTime() < recentThreshold
  }).length

  const requireAttention = users.filter(
    (u) => u.status === 'pending' || u.status === 'suspended' || u.status === 'blocked',
  ).length

  // Último acceso más reciente
  const lastAccessDates = users
    .filter((u) => u.lastAccess)
    .map((u) => new Date(u.lastAccess).getTime())

  const lastAccessLabel = lastAccessDates.length
    ? new Date(Math.max(...lastAccessDates)).toLocaleString('es-MX', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : 'Sin registros'

  return {
    activeSessions: 0,           // 🚧 conectar cuando exista sesiones
    lastAccessLabel,
    recentAccessCount,
    requireAttention,
  }
}