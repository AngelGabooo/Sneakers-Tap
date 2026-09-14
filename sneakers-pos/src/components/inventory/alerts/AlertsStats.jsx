import { PackageX, AlertTriangle, TrendingDown, DollarSign } from 'lucide-react'
import Card from '../../common/Card'

export default function AlertsStats({ stats, onFilterClick }) {
  const items = [
    {
      key: 'out',
      label: 'Productos agotados',
      value: stats?.outOfStock ?? '—',
      icon: PackageX,
      tone: 'danger',
      clickable: true,
    },
    {
      key: 'low',
      label: 'Debajo del mínimo',
      value: stats?.lowStock ?? '—',
      icon: AlertTriangle,
      tone: 'warning',
      clickable: true,
    },
    {
      key: 'soon',
      label: 'Próximos a mínimo',
      value: stats?.soon ?? '—',
      icon: TrendingDown,
      tone: 'info',
      clickable: true,
    },
    {
      key: 'value',
      label: 'Costo estimado de reposición',
      value: stats?.restockValue ?? '—',
      icon: DollarSign,
      tone: 'info',
      clickable: false,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {items.map(({ key, label, value, icon: Icon, tone, clickable }) => (
        <button
          key={key + label}
          type="button"
          onClick={() => clickable && onFilterClick?.(key)}
          className={`text-left ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <Card className="!p-4 hover:shadow-cardHover transition-shadow h-full">
            <div className="flex items-center gap-3">
              <div className={`
                w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                ${tone === 'danger' ? 'bg-red-50 dark:bg-red-950/40 text-brand-red'
                  : tone === 'warning' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-brand-blue'}
              `}>
                <Icon size={17} strokeWidth={1.9} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-dark-muted truncate">{label}</p>
                <p className="text-lg font-bold text-brand-black dark:text-dark-text leading-tight">
                  {value}
                </p>
              </div>
            </div>
          </Card>
        </button>
      ))}
    </div>
  )
}