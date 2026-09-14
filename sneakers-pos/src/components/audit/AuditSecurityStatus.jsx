import { ShieldCheck, AlertTriangle } from 'lucide-react'
import Card from '../common/Card'

export default function AuditSecurityStatus({ status }) {
  const items = [
    {
      key: 'compromised',
      label: 'Cuentas comprometidas detectadas',
      value: status?.compromised ?? 0,
      tone: status?.compromised > 0 ? 'danger' : 'success',
    },
    {
      key: 'failed',
      label: 'Intentos de acceso fallidos',
      value: status?.failedLogins ?? 0,
      tone: status?.failedLogins > 0 ? 'warning' : 'success',
    },
    {
      key: 'permissions',
      label: 'Cambios de permisos recientes',
      value: status?.recentPermissionChanges ?? 0,
      tone: status?.recentPermissionChanges > 0 ? 'info' : 'success',
    },
    {
      key: 'remote',
      label: 'Sesiones cerradas remotamente',
      value: status?.remoteLogouts ?? 0,
      tone: 'info',
    },
  ]

  return (
    <Card className="mb-5">
      <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text mb-3">
        Estado de seguridad
      </h3>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map(({ key, label, value, tone }) => (
          <li key={key} className="flex items-center gap-2 text-sm">
            {tone === 'success' ? (
              <ShieldCheck size={14} className="text-emerald-500" strokeWidth={2.2} />
            ) : tone === 'danger' ? (
              <AlertTriangle size={14} className="text-brand-red" strokeWidth={2.2} />
            ) : tone === 'warning' ? (
              <AlertTriangle size={14} className="text-amber-500" strokeWidth={2.2} />
            ) : (
              <ShieldCheck size={14} className="text-brand-blue" strokeWidth={2.2} />
            )}
            <span className="text-gray-500 dark:text-dark-muted">{label}:</span>
            <span className={`font-semibold ${
              tone === 'success' ? 'text-emerald-600 dark:text-emerald-400'
              : tone === 'danger' ? 'text-brand-red'
              : tone === 'warning' ? 'text-amber-600 dark:text-amber-400'
              : 'text-brand-black dark:text-dark-text'
            }`}>
              {value}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}