// src/context/RolesContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { rolesService } from '../services/rolesService'
import { TOTAL_PERMISSIONS } from '../data/permissions'

const RolesContext = createContext(null)

/**
 * Roles del sistema — conectado a Supabase.
 */
export function RolesProvider({ children }) {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // -------------------------------------------------------------
  // Cargar roles desde Supabase
  // -------------------------------------------------------------
  const loadRoles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await rolesService.getAll()
      setRoles(data)
      console.log(`✅ Roles cargados desde Supabase: ${data.length}`)
    } catch (err) {
      console.error('❌ Error cargando roles:', err)
      setError(err.message)
      setRoles([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRoles()
  }, [loadRoles])

  // -------------------------------------------------------------
  // Lectura
  // -------------------------------------------------------------
  const getRoleById = useCallback(
    (id) => roles.find((r) => r.id === id) || null,
    [roles],
  )

  const getRoleByName = useCallback(
    (name) =>
      roles.find(
        (r) => r.name?.toLowerCase() === (name || '').toLowerCase(),
      ) || null,
    [roles],
  )

  // -------------------------------------------------------------
  // Crear
  // -------------------------------------------------------------
  const createRole = useCallback(async (payload) => {
    const record = await rolesService.create(payload)
    setRoles((list) => [...list, record])
    return record
  }, [])

  // -------------------------------------------------------------
  // Actualizar
  // -------------------------------------------------------------
  const updateRole = useCallback(async (id, patch) => {
    const updated = await rolesService.update(id, patch)
    setRoles((list) => list.map((r) => (r.id === id ? updated : r)))
    return updated
  }, [])

  // -------------------------------------------------------------
  // Duplicar
  // -------------------------------------------------------------
  const duplicateRole = useCallback(
    async (id, overrides = {}) => {
      const original = roles.find((r) => r.id === id)
      if (!original) return null

      const copy = await rolesService.create({
        name: overrides.name || `${original.name} (copia)`,
        description: original.description,
        type: 'custom',
        status: 'active',
        permissions: original.permissions || [],
        scope: original.scope,
        branches: original.branches || [],
      })

      setRoles((list) => [...list, copy])
      return copy
    },
    [roles],
  )

  // -------------------------------------------------------------
  // Eliminar
  // -------------------------------------------------------------
  const deleteRole = useCallback(async (id) => {
    await rolesService.delete(id)
    setRoles((list) => list.filter((r) => r.id !== id))
  }, [])

  // -------------------------------------------------------------
  // Métricas
  // -------------------------------------------------------------
  const metrics = useMemo(() => {
    return {
      totalRoles: roles.length,
      totalPermissions: TOTAL_PERMISSIONS,
    }
  }, [roles])

  const value = {
    roles,
    loading,
    error,
    reload: loadRoles,
    getRoleById,
    getRoleByName,
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