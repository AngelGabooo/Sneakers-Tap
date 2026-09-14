import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ALL_PERMISSIONS, TOTAL_PERMISSIONS } from '../data/permissions'

const RolesContext = createContext(null)

const STORAGE_KEY = 'sneakers-roles'

/**
 * Roles del sistema. Persistencia local.
 * Reemplazar por API cuando conectes backend.
 */
export function RolesProvider({ children }) {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        setRoles(JSON.parse(raw))
      } else {
        setRoles(getDefaultRoles())
      }
    } catch (e) {
      console.warn('No se pudo leer los roles:', e)
      setRoles(getDefaultRoles())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (loading) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(roles))
    } catch (e) {
      console.warn('No se pudo guardar los roles:', e)
    }
  }, [roles, loading])

  const getRoleById = useCallback(
    (id) => roles.find((r) => r.id === id) || null,
    [roles],
  )

  const createRole = useCallback((payload) => {
    const now = new Date().toISOString()
    const id = `rol_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    const record = {
      id,
      name: payload.name || 'Nuevo rol',
      description: payload.description || '',
      type: 'custom', // 'system' | 'custom'
      status: payload.status || 'active',
      permissions: payload.permissions || [],
      scope: payload.scope || 'all', // 'all' | 'branch'
      branches: payload.branches || [],
      baseRoleId: payload.baseRoleId || null,
      createdAt: now,
      updatedAt: now,
      createdBy: 'Henry Sneakers',
    }
    setRoles((list) => [record, ...list])
    return record
  }, [])

  const updateRole = useCallback((id, patch) => {
    let updated = null
    setRoles((list) =>
      list.map((r) => {
        if (r.id !== id) return r
        updated = { ...r, ...patch, updatedAt: new Date().toISOString() }
        return updated
      }),
    )
    return updated
  }, [])

  const duplicateRole = useCallback((id, overrides = {}) => {
    const original = roles.find((r) => r.id === id)
    if (!original) return null
    const now = new Date().toISOString()
    const newId = `rol_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    const copy = {
      ...original,
      ...overrides,
      id: newId,
      name: overrides.name || `${original.name} (copia)`,
      type: 'custom',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }
    setRoles((list) => [copy, ...list])
    return copy
  }, [roles])

  const deleteRole = useCallback((id) => {
    setRoles((list) => list.filter((r) => r.id !== id))
  }, [])

  const metrics = useMemo(() => {
    const totalRoles = roles.length
    const totalPermissions = TOTAL_PERMISSIONS
    let criticalCount = 0
    roles.forEach((r) => {
      r.permissions?.forEach((p) => {
        const mod = ALL_PERMISSIONS.find((x) => x === p)
        // Los permisos críticos están definidos en data/permissions
      })
    })
    return { totalRoles, totalPermissions }
  }, [roles])

  const value = {
    roles,
    loading,
    getRoleById,
    createRole,
    updateRole,
    duplicateRole,
    deleteRole,
    metrics,
  }

  return <RolesContext.Provider value={value}>{children}</RolesContext.Provider>
}

export function useRoles() {
  const ctx = useContext(RolesContext)
  if (!ctx) throw new Error('useRoles debe usarse dentro de <RolesProvider>')
  return ctx
}

/**
 * Roles por defecto del sistema.
 */
function getDefaultRoles() {
  const now = new Date().toISOString()
  return [
    {
      id: 'sys_admin',
      name: 'Administrador',
      description: 'Acceso completo a la administración del sistema.',
      type: 'system',
      status: 'active',
      permissions: [...ALL_PERMISSIONS], // todos
      scope: 'all',
      branches: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sys_manager',
      name: 'Gerente',
      description: 'Administra la operación de una o varias sucursales según autorización.',
      type: 'system',
      status: 'active',
      permissions: ALL_PERMISSIONS.filter(
        (p) =>
          !p.startsWith('roles.') &&
          !p.startsWith('settings.') &&
          p !== 'users.suspend' &&
          p !== 'users.block',
      ),
      scope: 'branches',
      branches: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sys_seller',
      name: 'Vendedor',
      description: 'Realiza ventas y consulta información operativa del punto de venta.',
      type: 'system',
      status: 'active',
      permissions: [
        'dashboard.view',
        'pos.access',
        'pos.create_sale',
        'pos.modify_cart',
        'pos.apply_discount',
        'pos.suspend_sale',
        'pos.resume_sale',
        'pos.register_payment',
        'pos.reprint',
        'sales.view',
        'sales.view_detail',
        'products.view',
        'inventory.view',
        'customers.view',
        'customers.create',
      ],
      scope: 'branches',
      branches: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sys_warehouse',
      name: 'Almacén',
      description: 'Gestiona inventario y movimientos de existencias.',
      type: 'system',
      status: 'active',
      permissions: [
        'dashboard.view',
        'products.view',
        'products.create',
        'products.edit',
        'inventory.view',
        'inventory.cash_in',
        'inventory.cash_out',
        'inventory.adjust',
        'inventory.movements',
        'inventory.transfer',
        'purchases.view',
        'purchases.receive',
      ],
      scope: 'branches',
      branches: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sys_accounting',
      name: 'Contabilidad',
      description: 'Consulta información financiera y reportes autorizados.',
      type: 'system',
      status: 'active',
      permissions: [
        'dashboard.view',
        'dashboard.metrics',
        'sales.view',
        'sales.view_detail',
        'sales.view_financial',
        'reports.view',
        'reports.financial',
        'reports.sales',
        'reports.cash',
        'cash.view',
        'cash.history',
      ],
      scope: 'all',
      branches: [],
      createdAt: now,
      updatedAt: now,
    },
  ]
}