// src/components/users/UsersTable.jsx
import { ArrowUp, ArrowDown, Users as UsersIcon } from 'lucide-react'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Checkbox from '../common/Checkbox'
import EmptyState from '../common/EmptyState'
import UsersRowActions from './UsersRowActions'
import UsersTableSkeleton from './UsersTableSkeleton'
import UsersPagination from './UsersPagination'
import { STATUS_CONFIG } from '../../data/users'

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default function UsersTable({
  items = [],
  loading = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  sort,
  onSortChange,
  onViewProfile,
  onEdit,
  onViewActivity,
  onViewSessions,
  onChangeStatus,
  onResetAccess,
  onResendInvite,
  onViewRole,
  onViewAudit,
  onDelete,                                  // ⭐ NUEVO
  onNew,
  searchQuery = '',
  onClearSearch,
  page,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
}) {
  const hasItems = items.length > 0
  const allSelected = hasItems && selectedIds.length === items.length
  const someSelected = selectedIds.length > 0 && !allSelected

  const SortIndicator = ({ field }) => {
    if (sort?.field !== field) {
      return <ArrowUp size={12} className="opacity-0 group-hover:opacity-40" />
    }
    return sort.direction === 'asc'
      ? <ArrowUp size={12} className="text-brand-blue" />
      : <ArrowDown size={12} className="text-brand-blue" />
  }

  const ThSortable = ({ field, children, className = '' }) => (
    <th className={`text-left px-4 py-3 ${className}`}>
      <button
        type="button"
        onClick={() =>
          onSortChange?.(field, sort?.field === field && sort.direction === 'asc' ? 'desc' : 'asc')
        }
        className="group inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted hover:text-brand-blue transition-colors"
      >
        {children}
        <SortIndicator field={field} />
      </button>
    </th>
  )

  return (
    <Card padded={false} className="overflow-hidden">
      {loading && <UsersTableSkeleton rows={6} />}

      {!loading && !hasItems && searchQuery && (
        <EmptyState
          icon={UsersIcon}
          title="No encontramos usuarios"
          description="Prueba con otro nombre, correo, rol o filtro."
          action={
            <button type="button" onClick={onClearSearch} className="text-sm font-medium text-brand-blue hover:underline">
              Limpiar filtros
            </button>
          }
        />
      )}

      {!loading && !hasItems && !searchQuery && (
        <EmptyState
          icon={UsersIcon}
          title="No hay usuarios registrados"
          description="Crea el primer usuario para comenzar a administrar el acceso a Sneakers."
          action={
            <button
              type="button"
              onClick={onNew}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-brand-blue text-white text-sm font-semibold hover:bg-brand-blueHover transition-colors"
            >
              + Nuevo empleado
            </button>
          }
        />
      )}

      {!loading && hasItems && (
        <>
          {/* Desktop / tablet */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50/60 dark:bg-dark-surface/60">
                  <th className="w-10 px-4 py-3">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={(e) => onToggleSelectAll?.(e.target.checked)}
                      aria-label="Seleccionar todos"
                    />
                  </th>
                  <ThSortable field="name" className="min-w-[220px]">Empleado</ThSortable>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted min-w-[180px]">
                    Usuario / correo
                  </th>
                  <ThSortable field="role">Rol</ThSortable>
                  <ThSortable field="branch">Sucursal</ThSortable>
                  <ThSortable field="lastAccess">Último acceso</ThSortable>
                  <ThSortable field="status">Estado</ThSortable>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted w-[60px]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => {
                  const selected = selectedIds.includes(u.id)
                  const statusCfg = STATUS_CONFIG[u.status] || STATUS_CONFIG.inactive

                  return (
                    <tr
                      key={u.id}
                      className={`
                        border-b border-gray-100 dark:border-dark-border last:border-0 transition-colors
                        ${selected ? 'bg-blue-50/60 dark:bg-blue-950/20' : 'hover:bg-gray-50 dark:hover:bg-dark-surface/50'}
                      `}
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selected}
                          onChange={() => onToggleSelect?.(u.id)}
                          aria-label={`Seleccionar ${u.fullName}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-semibold shrink-0">
                            {getInitials(u.fullName)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-brand-black dark:text-dark-text truncate">{u.fullName}</p>
                            <p className="text-xs text-gray-500 dark:text-dark-muted">{u.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-brand-black dark:text-dark-text truncate">{u.username}</p>
                        {u.status === 'pending' ? (
                          <p className="text-xs text-amber-600 dark:text-amber-400">Invitación pendiente</p>
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-dark-muted truncate">{u.email}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="info">{u.role}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-brand-black dark:text-dark-text">
                          {u.branchCount > 1 ? `${u.branchCount} sucursales` : u.branch}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-brand-black dark:text-dark-text">{u.lastAccess}</p>
                        {u.lastAccessRelative && u.status !== 'pending' && (
                          <p className="text-xs text-gray-400 dark:text-dark-muted">{u.lastAccessRelative}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <UsersRowActions
                          user={u}
                          onViewProfile={onViewProfile}
                          onEdit={onEdit}
                          onViewActivity={onViewActivity}
                          onViewSessions={onViewSessions}
                          onChangeStatus={onChangeStatus}
                          onResetAccess={onResetAccess}
                          onResendInvite={onResendInvite}
                          onViewRole={onViewRole}
                          onViewAudit={onViewAudit}
                          onDelete={onDelete}             
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-dark-border">
            {items.map((u) => {
              const selected = selectedIds.includes(u.id)
              const statusCfg = STATUS_CONFIG[u.status] || STATUS_CONFIG.inactive

              return (
                <div key={u.id} className={`p-4 space-y-3 ${selected ? 'bg-blue-50/60 dark:bg-blue-950/20' : ''}`}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selected}
                      onChange={() => onToggleSelect?.(u.id)}
                      aria-label={`Seleccionar ${u.fullName}`}
                      className="mt-1"
                    />
                    <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-semibold shrink-0">
                      {getInitials(u.fullName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-brand-black dark:text-dark-text">{u.fullName}</p>
                      <p className="text-xs text-gray-500 dark:text-dark-muted">{u.employeeId}</p>
                    </div>
                    <UsersRowActions
                      user={u}
                      onViewProfile={onViewProfile}
                      onEdit={onEdit}
                      onViewActivity={onViewActivity}
                      onViewSessions={onViewSessions}
                      onChangeStatus={onChangeStatus}
                      onResetAccess={onResetAccess}
                      onResendInvite={onResendInvite}
                      onViewRole={onViewRole}
                      onViewAudit={onViewAudit}
                      onDelete={onDelete}                   
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm pl-8">
                    <div>
                      <p className="text-xs text-gray-400 dark:text-dark-muted">Rol</p>
                      <Badge variant="info" className="mt-0.5">{u.role}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-dark-muted">Estado</p>
                      <Badge variant={statusCfg.variant} className="mt-0.5">{statusCfg.label}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-dark-muted">Sucursal</p>
                      <p className="text-brand-black dark:text-dark-text">{u.branch}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-dark-muted">Último acceso</p>
                      <p className="text-brand-black dark:text-dark-text">{u.lastAccess}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <UsersPagination
            page={page}
            perPage={perPage}
            total={total}
            onPageChange={onPageChange}
            onPerPageChange={onPerPageChange}
          />
        </>
      )}
    </Card>
  )
}