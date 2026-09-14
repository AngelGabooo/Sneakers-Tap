import { Shield, ShieldCheck, Users as UsersIcon, AlertTriangle } from 'lucide-react'
import Card from '../common/Card'
import Badge from '../common/Badge'
import EmptyState from '../common/EmptyState'
import RolesRowActions from './RolesRowActions'
import RolesTableSkeleton from './RolesTableSkeleton'
import { TOTAL_PERMISSIONS, CRITICAL_PERMISSIONS } from '../../data/permissions'

function countCritical(permSet = []) {
  return permSet.filter((p) => CRITICAL_PERMISSIONS.includes(p)).length
}

export default function RolesTable({
  items = [],
  loading = false,
  usersByRole = {},
  onViewRole,
  onEditRole,
  onDuplicate,
  onViewUsers,
  onViewActivity,
  onViewAudit,
  onToggleStatus,
  onNew,
}) {
  const hasItems = items.length > 0

  return (
    <Card padded={false} className="overflow-hidden">
      {loading && <RolesTableSkeleton rows={6} />}

      {!loading && !hasItems && (
        <EmptyState
          icon={Shield}
          title="No hay roles registrados"
          description="Crea el primer rol para comenzar a administrar el acceso del equipo."
          action={
            <button
              type="button"
              onClick={onNew}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-brand-blue text-white text-sm font-semibold hover:bg-brand-blueHover transition-colors"
            >
              + Nuevo rol
            </button>
          }
        />
      )}

      {!loading && hasItems && (
        <>
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50/60 dark:bg-dark-surface/60">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted min-w-[220px]">
                    Rol
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted">
                    Usuarios
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted">
                    Permisos
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted">
                    Críticos
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted">
                    Alcance
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted">
                    Tipo
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted">
                    Estado
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted w-[60px]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => {
                  const permCount = (r.permissions || []).length
                  const critical = countCritical(r.permissions || [])
                  const usersCount = usersByRole[r.name] || 0
                  const isSystem = r.type === 'system'

                  return (
                    <tr
                      key={r.id}
                      className="border-b border-gray-100 dark:border-dark-border last:border-0 hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                            {isSystem
                              ? <ShieldCheck size={17} className="text-brand-blue" strokeWidth={2} />
                              : <Shield size={17} className="text-brand-blue" strokeWidth={2} />}
                          </div>
                          <div className="min-w-0">
                            <button
                              onClick={() => onViewRole?.(r)}
                              className="text-sm font-semibold text-brand-black dark:text-dark-text hover:text-brand-blue truncate block text-left transition-colors"
                            >
                              {r.name}
                            </button>
                            <p className="text-xs text-gray-500 dark:text-dark-muted truncate max-w-[280px]">
                              {r.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-1.5 text-sm text-brand-black dark:text-dark-text">
                          <UsersIcon size={13} strokeWidth={2} className="text-gray-400" />
                          {usersCount}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-brand-black dark:text-dark-text">
                        {permCount} <span className="text-gray-400">/ {TOTAL_PERMISSIONS}</span>
                      </td>
                      <td className="px-4 py-3">
                        {critical > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                            <AlertTriangle size={12} strokeWidth={2.2} />
                            {critical}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-dark-muted whitespace-nowrap">
                        {r.scope === 'all' ? 'Todas las sucursales' : 'Sucursales asignadas'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={isSystem ? 'info' : 'neutral'}>
                          {isSystem ? 'Sistema' : 'Personalizado'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={r.status === 'active' ? 'success' : 'neutral'}>
                          {r.status === 'active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <RolesRowActions
                          role={r}
                          onViewRole={onViewRole}
                          onEditRole={onEditRole}
                          onDuplicate={onDuplicate}
                          onViewUsers={onViewUsers}
                          onViewActivity={onViewActivity}
                          onViewAudit={onViewAudit}
                          onToggleStatus={onToggleStatus}
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
            {items.map((r) => {
              const permCount = (r.permissions || []).length
              const critical = countCritical(r.permissions || [])
              const usersCount = usersByRole[r.name] || 0
              const isSystem = r.type === 'system'

              return (
                <div key={r.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                      <Shield size={18} className="text-brand-blue" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-brand-black dark:text-dark-text truncate">
                        {r.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-dark-muted line-clamp-2">
                        {r.description}
                      </p>
                    </div>
                    <RolesRowActions
                      role={r}
                      onViewRole={onViewRole}
                      onEditRole={onEditRole}
                      onDuplicate={onDuplicate}
                      onViewUsers={onViewUsers}
                      onViewActivity={onViewActivity}
                      onViewAudit={onViewAudit}
                      onToggleStatus={onToggleStatus}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pl-13">
                    <div>
                      <p className="text-gray-400 dark:text-dark-muted">Usuarios</p>
                      <p className="font-medium text-brand-black dark:text-dark-text">{usersCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 dark:text-dark-muted">Permisos</p>
                      <p className="font-medium text-brand-black dark:text-dark-text">
                        {permCount} / {TOTAL_PERMISSIONS}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 dark:text-dark-muted">Críticos</p>
                      <p className={`font-medium ${critical > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-brand-black dark:text-dark-text'}`}>
                        {critical}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 dark:text-dark-muted">Estado</p>
                      <Badge variant={r.status === 'active' ? 'success' : 'neutral'} className="mt-0.5">
                        {r.status === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </Card>
  )
}