// src/pages/Users.jsx
import { useMemo, useState, useCallback } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import UsersHeader from '../components/users/UsersHeader'
import UsersStats from '../components/users/UsersStats'
import UsersActivitySummary from '../components/users/UsersActivitySummary'
import UsersToolbar from '../components/users/UsersToolbar'
import UsersQuickFilters from '../components/users/UsersQuickFilters'
import UsersBulkBar from '../components/users/UsersBulkBar'
import UsersTable from '../components/users/UsersTable'
import ConfirmModal from '../components/common/ConfirmModal'          // ⭐ NUEVO
import { useView } from '../context/ViewContext'
import { useUsers } from '../context/UsersContext'
import { useAuth } from '../context/AuthContext'
import { computeMetrics, computeActivitySummary } from '../data/users'

export default function Users() {
  const { navigate } = useView()
  const { user: currentUser } = useAuth()
  const {
    users, loading,
    changeStatus, resetAccess, logActivity,
    deleteUser,                                                        // ⭐ NUEVO
  } = useUsers()

  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState([])
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [sort, setSort] = useState({ field: 'name', direction: 'asc' })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)               // ⭐ NUEVO
  const [deleting, setDeleting] = useState(false)                      // ⭐ NUEVO

  const metrics = useMemo(() => computeMetrics(users), [users])
  const activitySummary = useMemo(() => computeActivitySummary(users), [users])

  const filtered = useMemo(() => {
    let list = [...users]

    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((u) => {
        const haystack = [
          u.fullName, u.firstName, u.lastName, u.email, u.phone, u.username, u.employeeId,
        ].filter(Boolean).join(' ').toLowerCase()
        return haystack.includes(q)
      })
    }

    switch (quickFilter) {
      case 'active':    list = list.filter((u) => u.status === 'active');    break
      case 'pending':   list = list.filter((u) => u.status === 'pending');   break
      case 'inactive':  list = list.filter((u) => u.status === 'inactive');  break
      case 'suspended': list = list.filter((u) => u.status === 'suspended'); break
      case 'admin':     list = list.filter((u) => u.role === 'Administrador'); break
      case 'seller':    list = list.filter((u) => u.role === 'Vendedor');    break
      case 'no-recent':
        list = list.filter(
          (u) => u.status === 'inactive' ||
            (u.lastAccessRelative && String(u.lastAccessRelative).includes('días')),
        )
        break
      default: break
    }

    list.sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1
      let va = a[sort.field]
      let vb = b[sort.field]
      if (sort.field === 'name') { va = a.fullName; vb = b.fullName }
      if (va == null) va = ''
      if (vb == null) vb = ''
      if (typeof va === 'string') return va.localeCompare(vb, 'es') * dir
      return (va > vb ? 1 : -1) * dir
    })

    return list
  }, [users, search, quickFilter, sort])

  const total = filtered.length

  const paged = useMemo(() => {
    const start = (page - 1) * perPage
    return filtered.slice(start, start + perPage)
  }, [filtered, page, perPage])

  const handleNavigate = useCallback((key) => navigate(key), [navigate])

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const handleToggleSelectAll = (checked) => {
    setSelectedIds(checked ? paged.map((u) => u.id) : [])
  }

  const handleSortChange = (field, direction) => setSort({ field, direction })
  const handleNew = () => navigate('user-new')

  /* ------------------------------------------------------- */
  /* Acciones reales                                          */
  /* ------------------------------------------------------- */

  const handleExport = () => console.log('[Users] Exportar')

  const handleViewProfile = (user) => navigate('user-edit', { id: user.id })
  const handleEdit = (user) => navigate('user-edit', { id: user.id })
  const handleViewActivity = (user) => navigate('user-activity', { id: user.id })
  const handleViewSessions = (user) => navigate('user-sessions', { id: user.id })

  const handleChangeStatus = (user, action) => {
    const map = {
      activate: 'active',
      deactivate: 'inactive',
      suspend: 'suspended',
      block: 'blocked',
      reactivate: 'active',
    }
    const status = map[action]
    if (!status) return

    if (['deactivate', 'suspend', 'block'].includes(action)) {
      const labels = { deactivate: 'desactivar', suspend: 'suspender', block: 'bloquear' }
      const ok = window.confirm(
        `¿${labels[action].charAt(0).toUpperCase()}${labels[action].slice(1)} a ${user.fullName}?`,
      )
      if (!ok) return
    }

    changeStatus(user.id, status)
    logActivity(user.id, {
      type: 'status',
      label: `Estado cambiado a "${status}"`,
      by: currentUser?.name || 'Administrador',
    })
  }

  const handleResetAccess = (user) => {
    const tempPassword = window.prompt(
      `Nueva contraseña temporal para ${user.fullName} (mínimo 6 caracteres):`,
      '',
    )
    if (!tempPassword) return
    if (tempPassword.length < 6) {
      window.alert('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    resetAccess(user.id, tempPassword)
    logActivity(user.id, {
      type: 'reset',
      label: 'Contraseña restablecida',
      by: currentUser?.name || 'Administrador',
    })
    window.alert(
      `Acceso restablecido.\n\nNueva contraseña temporal: ${tempPassword}\n\nCompártela con ${user.fullName}.`,
    )
  }

  const handleResendInvite = (user) => {
    logActivity(user.id, {
      type: 'invite',
      label: `Invitación reenviada a ${user.email}`,
      by: currentUser?.name || 'Administrador',
    })
    window.alert(`Invitación reenviada a ${user.email}`)
  }

  const handleViewRole = (user) => {
    navigate('roles', { filter: user.role })
  }

  const handleViewAudit = (user) => {
    navigate('audit', { user: user.fullName })
  }

  /* ------------------------------------------------------- */
  /* ⭐ NUEVO: Eliminar empleado                               */
  /* ------------------------------------------------------- */

  const handleDelete = (user) => {
    // No permitir eliminarse a sí mismo
    if (user.id === currentUser?.id) {
      window.alert('No puedes eliminar tu propio usuario.')
      return
    }
    setDeleteTarget(user)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteUser(deleteTarget.id)
      logActivity(deleteTarget.id, {
        type: 'delete',
        label: 'Usuario eliminado permanentemente',
        by: currentUser?.name || 'Administrador',
      })
      setDeleting(false)
      setDeleteTarget(null)
    } catch (err) {
      console.error('❌ Error eliminando usuario:', err)
      setDeleting(false)
      window.alert('Error al eliminar: ' + err.message)
    }
  }

  return (
    <DashboardLayout activeKey="users" onNavigate={handleNavigate}>
      <UsersHeader onNew={handleNew} onExport={handleExport} />
      <UsersStats metrics={metrics} />
      <UsersActivitySummary summary={activitySummary} />

      <UsersToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        onToggleFilters={() => setFiltersOpen((v) => !v)}
        filtersActive={filtersOpen}
        onColumns={() => console.log('[Users] Columnas')}
      />

      {filtersOpen && (
        <div className="mb-4 p-4 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface">
          <p className="text-sm text-gray-500 dark:text-dark-muted mb-3">
            Filtros avanzados (Estado, Rol, Sucursal, Departamento, Último acceso, Tipo de cuenta).
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="text-sm font-medium text-gray-600 dark:text-dark-muted hover:text-brand-black dark:hover:text-dark-text"
            >
              Limpiar filtros
            </button>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="text-sm font-medium text-brand-blue hover:underline"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      )}

      <UsersQuickFilters
        active={quickFilter}
        onChange={(v) => { setQuickFilter(v); setPage(1) }}
      />

      <UsersBulkBar
        count={selectedIds.length}
        onClear={() => setSelectedIds([])}
        onExport={() => console.log('[Users] Exportar seleccionados')}
        onActivate={() => {
          selectedIds.forEach((id) => {
            changeStatus(id, 'active')
            logActivity(id, {
              type: 'status',
              label: 'Activado (masivo)',
              by: currentUser?.name || 'Administrador',
            })
          })
          setSelectedIds([])
        }}
        onDeactivate={() => {
          if (!window.confirm(`¿Desactivar ${selectedIds.length} usuario(s)?`)) return
          selectedIds.forEach((id) => {
            changeStatus(id, 'inactive')
            logActivity(id, {
              type: 'status',
              label: 'Desactivado (masivo)',
              by: currentUser?.name || 'Administrador',
            })
          })
          setSelectedIds([])
        }}
        onInvite={() => console.log('[Users] Enviar invitación')}
      />

      <UsersTable
        items={paged}
        loading={loading}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        sort={sort}
        onSortChange={handleSortChange}
        onViewProfile={handleViewProfile}
        onEdit={handleEdit}
        onViewActivity={handleViewActivity}
        onViewSessions={handleViewSessions}
        onChangeStatus={handleChangeStatus}
        onResetAccess={handleResetAccess}
        onResendInvite={handleResendInvite}
        onViewRole={handleViewRole}
        onViewAudit={handleViewAudit}
        onDelete={handleDelete}                                        
        onNew={handleNew}
        searchQuery={search}
        onClearSearch={() => { setSearch(''); setQuickFilter('all') }}
        page={page}
        perPage={perPage}
        total={total}
        onPageChange={setPage}
        onPerPageChange={(n) => { setPerPage(n); setPage(1) }}
      />

      {/* ⭐ NUEVO: Modal de confirmación para eliminar */}
      <ConfirmModal
        open={!!deleteTarget}
        title="¿Eliminar empleado permanentemente?"
        description={
          deleteTarget
            ? `"${deleteTarget.fullName}" será eliminado junto con su historial de ventas, sesiones y auditoría. Esta acción NO se puede deshacer.`
            : ''
        }
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        tone="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </DashboardLayout>
  )
}