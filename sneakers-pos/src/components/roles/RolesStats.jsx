import { Shield, Users, KeyRound, AlertTriangle } from 'lucide-react'
import Card from '../common/Card'

export default function RolesStats({ metrics }) {
  const items = [
    {
      key: 'roles',
      label: 'Roles configurados',
      value: metrics?.totalRoles ?? 0,
      icon: Shield,
      tone: 'info',
    },
    {
      key: 'users',
      label: 'Usuarios con rol',
      value: metrics?.totalUsers ?? 0,
      icon: Users,
      tone: 'info',
    },
    {
      key: 'perms',
      label: 'Permisos disponibles',
      value: metrics?.totalPermissions ?? 0,
      icon: KeyRound,
      tone: 'info',
    },
    {
      key: 'critical',
      label: 'Requieren mayor control',
      value: metrics?.criticalPermissions ?? 0,
      icon: AlertTriangle,
      tone: 'warning',
    },
  ]

  const tones = {
    info:    'bg-blue-50 dark:bg-blue-950/40 text-brand-blue',
    warning: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {items.map(({ key, label, value, icon: Icon, tone }) => (
        <Card key={key} className="!p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tones[tone]}`}>
              <Icon size={17} strokeWidth={1.9} />
            </div>
            <p className="text-xs text-gray-500 dark:text-dark-muted truncate">{label}</p>
          </div>
          <p className="text-xl font-bold text-brand-black dark:text-dark-text leading-tight">
            {value}
          </p>
        </Card>
      ))}
    </div>
  )
}