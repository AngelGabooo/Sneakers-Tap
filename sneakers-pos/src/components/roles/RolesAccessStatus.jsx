import { ShieldCheck, AlertTriangle } from 'lucide-react'
import Card from '../common/Card'
import { CRITICAL_PERMISSIONS, ALL_PERMISSIONS } from '../../data/permissions'

export default function RolesAccessStatus({ roles = [], users = [], usersByRole = {} }) {
  const usersWithoutRole = users.filter((u) => !u.role).length
  const rolesWithCritical = roles.filter((r) =>
    (r.permissions || []).some((p) => CRITICAL_PERMISSIONS.includes(p)),
  ).length
  const rolesWithoutUsers = roles.filter((r) => !usersByRole[r.name]).length

  const items = [
    {
      key: 'without-role',
      label: 'Usuarios sin rol',
      value: usersWithoutRole,
      tone: usersWithoutRole > 0 ? 'danger' : 'success',
    },
    {
      key: 'roles-without-users',
      label: 'Roles sin usuarios',
      value: rolesWithoutUsers,
      tone: rolesWithoutUsers > 0 ? 'warning' : 'success',
    },
    {
      key: 'roles-critical',
      label: 'Roles con permisos críticos',
      value: rolesWithCritical,
      tone: rolesWithCritical > 0 ? 'warning' : 'success',
    },
  ]

  return (
    <Card className="mt-5">
      <header className="mb-4">
        <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
          Estado de acceso
        </h3>
        <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
          Verifica que no existan configuraciones inconsistentes.
        </p>
      </header>

      <ul className="space-y-2">
        {items.map(({ key, label, value, tone }) => (
          <li key={key} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-gray-500 dark:text-dark-muted">
              {tone === 'success' ? (
                <ShieldCheck size={13} className="text-emerald-500" strokeWidth={2.2} />
              ) : tone === 'danger' ? (
                <AlertTriangle size={13} className="text-brand-red" strokeWidth={2.2} />
              ) : (
                <AlertTriangle size={13} className="text-amber-500" strokeWidth={2.2} />
              )}
              {label}
            </span>
            <span className={`font-semibold ${
              tone === 'success' ? 'text-emerald-600 dark:text-emerald-400'
              : tone === 'danger' ? 'text-brand-red'
              : 'text-amber-600 dark:text-amber-400'
            }`}>
              {value}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}