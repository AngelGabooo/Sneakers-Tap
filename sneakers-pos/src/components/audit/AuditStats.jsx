import { History, ShieldCheck, AlertTriangle, Users } from 'lucide-react'
import Card from '../common/Card'

export default function AuditStats({ stats }) {
  const items = [
    { key: 'total',    label: 'Eventos registrados',     value: stats?.total ?? 0,      helper: 'En el periodo',                icon: History,        tone: 'info' },
    { key: 'admin',    label: 'Acciones administrativas',value: stats?.admin ?? 0,      helper: 'Cambios de configuración',     icon: ShieldCheck,    tone: 'info' },
    { key: 'critical', label: 'Eventos críticos',        value: stats?.critical ?? 0,   helper: 'Requieren atención',           icon: AlertTriangle,  tone: stats?.critical > 0 ? 'warning' : 'info' },
    { key: 'users',    label: 'Usuarios activos',        value: stats?.activeUsers ?? 0,helper: 'Con actividad registrada',     icon: Users,          tone: 'info' },
  ]

  const tones = {
    info:    'bg-blue-50 dark:bg-blue-950/40 text-brand-blue',
    warning: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {items.map(({ key, label, value, helper, icon: Icon, tone }) => (
        <Card key={key} className="!p-4">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tones[tone]}`}>
              <Icon size={17} strokeWidth={1.9} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-dark-muted truncate">{label}</p>
              <p className="text-xl font-bold text-brand-black dark:text-dark-text leading-tight mt-0.5">
                {value}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-dark-muted mt-0.5 truncate">{helper}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}