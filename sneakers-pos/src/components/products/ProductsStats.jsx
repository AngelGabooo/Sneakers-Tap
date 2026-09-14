import { Package, CheckCircle2, AlertTriangle, PackageX } from 'lucide-react'
import Card from '../common/Card'

export default function ProductsStats({ stats }) {
  const items = [
    { key: 'total',      label: 'Total de productos', icon: Package,       value: stats?.total?.value },
    { key: 'active',     label: 'Productos activos',  icon: CheckCircle2,  value: stats?.active?.value },
    { key: 'lowStock',   label: 'Stock bajo',         icon: AlertTriangle, value: stats?.lowStock?.value, tone: 'warning' },
    { key: 'outOfStock', label: 'Agotados',           icon: PackageX,      value: stats?.outOfStock?.value, tone: 'danger' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {items.map(({ key, label, icon: Icon, value, tone }) => (
        <Card key={key} className="!p-4">
          <div className="flex items-center gap-3">
            <div
              className={`
                w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                ${tone === 'danger'
                  ? 'bg-red-50 dark:bg-red-950/40 text-brand-red'
                  : tone === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                    : 'bg-blue-50 dark:bg-blue-950/40 text-brand-blue'}
              `}
            >
              <Icon size={18} strokeWidth={1.9} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-dark-muted truncate">{label}</p>
              <p className="text-lg font-bold text-brand-black dark:text-dark-text leading-tight">
                {value ?? '—'}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}