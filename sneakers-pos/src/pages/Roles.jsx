import { useMemo, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import RolesHeader from '../components/roles/RolesHeader'
import RolesStats from '../components/roles/RolesStats'
import RolesToolbar from '../components/roles/RolesToolbar'
import RolesQuickFilters from '../components/roles/RolesQuickFilters'
import RolesTable from '../components/roles/RolesTable'
import RolesAccessStatus from '../components/roles/RolesAccessStatus'
import Toast from '../components/common/Toast'
import { useView } from '../context/ViewContext'
import { useRoles } from '../context/RolesContext'
import { useUsers } from '../context/UsersContext'
import { CRITICAL_PERMISSIONS, TOTAL_PERMISSIONS } from '../data/permissions'

export default function Roles() {
  const { navigate } = useView()
  const { roles, loading } = useRoles()
  const { users } = useUsers()

  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState('all')
  const [toast, setToast] = useState(null)

  // Cuenta de usuarios por rol
  const usersByRole = useMemo(() => {
    const map = {}
    users.forEach((u) => {
      const roleName = u.role || 'Sin rol'
      map[roleName] = (map[roleName] || 0) + 1
    })
    return map
  }, [users])

  // Métricas
  const metrics = useMemo(() => {
    let criticalCount = 0
    roles.forEach((r) => {
      (r.permissions || []).forEach((p) => {
        if (CRITICAL_PERMISSIONS.includes(p)) criticalCount++
      })
    })
    return {
      totalRoles: roles.length,
      totalUsers: users.length,
      totalPermissions: TOTAL_PERMISSIONS,
      criticalPermissions: CRITICAL_PERMISSIONS.length,
    }
  }, [roles, users])

  // Filtrado
  const filtered = useMemo(() => {
    let list = [...roles]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          (r.name || '').toLowerCase().includes(q) ||
          (r.description || '').toLowerCase().includes(q),
      )
    }

    if (quickFilter === 'system') list = list.filter((r) => r.type === 'system')
    else if (quickFilter === 'custom') list = list.filter((r) => r.type === 'custom')
    else if (quickFilter === 'active') list = list.filter((r) => r.status === 'active')
    else if (quickFilter === 'no-users') {
      list = list.filter((r) => !usersByRole[r.name])
    }

    return list
  }, [roles, search, quickFilter, usersByRole])

  const handleNavigate = (key) => navigate(key)

  const handleNew = () => navigate('role-new')
  const handleViewRole = (r) => navigate('role-edit', { id: r.id })
  const handleEditRole = (r) => navigate('role-edit', { id: r.id })
  const handleDuplicate = (r) => {
    setToast({
      title: 'Duplicar rol',
      description: `Función pendiente: duplicar "${r.name}".`,
    })
  }
  const handleViewUsers = (r) => navigate('users', { roleFilter: r.name })
  const handleViewActivity = (r) => {
    setToast({
      title: 'Actividad del rol',
      description: `Función pendiente: ver actividad de "${r.name}".`,
    })
  }
  const handleViewAudit = (r) => navigate('audit', { roleId: r.id })
  const handleToggleStatus = (r) => {
    setToast({
      title: 'Función pendiente',
      description: `Desactivar rol "${r.name}" requiere confirmación.`,
    })
  }
  const handleExport = () => {
    setToast({
      title: 'Exportación iniciada',
      description: 'Estamos preparando el archivo.',
    })
  }

  return (
    <DashboardLayout
      activeKey="roles"
      onNavigate={handleNavigate}
      period={undefined}
      onPeriodChange={undefined}
    >
      <RolesHeader onNew={handleNew} onExport={handleExport} />
      <RolesStats metrics={metrics} />

      <RolesToolbar
        search={search}
        onSearchChange={setSearch}
        onToggleFilters={() => {}}
      />

      <RolesQuickFilters active={quickFilter} onChange={setQuickFilter} />

      <RolesTable
        items={filtered}
        loading={loading}
        usersByRole={usersByRole}
        onViewRole={handleViewRole}
        onEditRole={handleEditRole}
        onDuplicate={handleDuplicate}
        onViewUsers={handleViewUsers}
        onViewActivity={handleViewActivity}
        onViewAudit={handleViewAudit}
        onToggleStatus={handleToggleStatus}
        onNew={handleNew}
      />

      <RolesAccessStatus roles={roles} users={users} usersByRole={usersByRole} />

      <Toast
        open={!!toast}
        variant="success"
        title={toast?.title}
        description={toast?.description}
        onClose={() => setToast(null)}
      />
    </DashboardLayout>
  )
}