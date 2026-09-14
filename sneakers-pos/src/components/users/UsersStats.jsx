import { Users, UserCheck, UserX, Mail } from 'lucide-react'
import Card from '../common/Card'

export default function UsersStats({ metrics }) {
  const items = [
    { key: 'total', label: 'Usuarios totales', helper: 'Cuentas registradas', icon: Users, value: metrics?.total },
    { key: 'active', label: 'Activos', helper: 'Con acceso habilitado', icon: UserCheck, value: metrics?.active },
    { key: 'inactive', label: 'Inactivos', helper: 'Sin acceso actualmente', icon: UserX, value: metrics?.inactive },
    { key: 'pending', label: 'Invitaciones pendientes', helper: 'Esperando activación', icon: Mail, value: metrics?.pendingInvites, tone: 'warning' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {items.map(({ key, label, helper, icon: Icon, value, tone }) => (
        <Card key={key} className="!p-4">
          <div className="flex items-start gap-3">
            <div
              className={`
                w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                ${tone === 'warning'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-brand-blue'}
              `}
            >
              <Icon size={18} strokeWidth={1.9} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 dark:text-dark-muted truncate">{label}</p>
              <p className="text-xl font-bold text-brand-black dark:text-dark-text leading-tight mt-0.5">
                {value ?? 0}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-dark-muted mt-0.5 truncate">{helper}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}