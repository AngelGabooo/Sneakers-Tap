// src/hooks/usePermissions.js
import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRoles } from '../context/RolesContext'
import {
  VIEW_PERMISSIONS,
  SUPER_PERMISSION,
  PUBLIC_VIEWS,
} from '../data/viewPermissions'
import { ALL_PERMISSIONS } from '../data/permissions'

/**
 * Hook central de permisos.
 */
export function usePermissions() {
  const { user } = useAuth()
  const { roles } = useRoles()

  return useMemo(() => {
    // Buscar rol por nombre (case-insensitive)
    const effectiveRole =
      roles.find(
        (r) =>
          r.name?.toLowerCase() === (user?.role || '').toLowerCase() &&
          r.status === 'active',
      ) || null

    const permissions = effectiveRole?.permissions || []

    // ¿Es administrador total?
    const isAdmin =
      permissions.length >= ALL_PERMISSIONS.length ||
      permissions.includes(SUPER_PERMISSION) ||
      effectiveRole?.name?.toLowerCase() === 'administrador'

    const can = (permKey) => {
      if (!permKey) return true
      if (!user) return false
      if (isAdmin) return true
      return permissions.includes(permKey)
    }

    const canView = (viewKey) => {
      if (!viewKey) return true
      if (PUBLIC_VIEWS.has(viewKey)) return true
      const required = VIEW_PERMISSIONS[viewKey]
      if (!required) return true
      return can(required)
    }

    return {
      role: effectiveRole,
      roleName: effectiveRole?.name || user?.role || 'Sin rol',
      permissions,
      isAdmin,
      can,
      canView,
    }
  }, [user, roles])
}