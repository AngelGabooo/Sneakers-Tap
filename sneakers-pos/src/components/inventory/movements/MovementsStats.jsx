import { Activity, ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal } from 'lucide-react'
import Card from '../../common/Card'

export default function MovementsStats({ stats }) {
  const items = [
    { key: 'count',    label: 'Movimientos de hoy', value: stats?.todayCount ?? '—', icon: Activity },
    { key: 'in',       label: 'Unidades recibidas', value: stats?.inQty != null ? `+${stats.inQty}` : '—', icon: ArrowDownToLine, tone: 'success' },
    { key: 'out',      label: 'Unidades descontadas', value: stats?.outQty != null ? `-${stats.outQty}` : '—', icon: ArrowUpFromLine, tone: 'danger' },
    { key: 'adjust',   label: 'Correcciones realizadas', value: stats?.adjustCount ?? '—', icon: SlidersHorizontal, tone: 'warning' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {items.map(({ key, label, value, icon: Icon, tone }) => (
        <Card key={key} className="!p-4">
          <div className="flex items-center gap-3">
            <div
              className={`
                w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                ${tone === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : tone === 'danger' ? 'bg-red-50 dark:bg-red-950/40 text-brand-red'
                  : tone === 'warning' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-brand-blue'}
              `}
            >
              <Icon size={17} strokeWidth={1.9} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-dark-muted truncate">{label}</p>
              <p className="text-lg font-bold text-brand-black dark:text-dark-text leading-tight">{value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}