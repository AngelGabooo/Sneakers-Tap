import { DollarSign, Boxes, Tags, TrendingUp } from 'lucide-react'
import Card from '../../common/Card'

export default function ProductDetailStats({ stats }) {
  const items = [
    {
      key: 'price',
      label: 'Precio de venta',
      value: stats?.price ? `$${Number(stats.price).toLocaleString('es-MX')}` : '—',
      icon: DollarSign,
      tone: 'info',
    },
    {
      key: 'stock',
      label: 'Stock total',
      value: stats?.totalStock ?? '—',
      icon: Boxes,
      tone: 'info',
    },
    {
      key: 'variants',
      label: 'Variantes activas',
      value: stats?.activeVariants ?? '—',
      icon: Tags,
      tone: 'info',
    },
    {
      key: 'sales',
      label: 'Ventas del mes',
      value: stats?.monthSales ?? '—',
      icon: TrendingUp,
      tone: 'info',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {items.map(({ key, label, value, icon: Icon, tone }) => (
        <Card key={key} className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
              <Icon size={17} className="text-brand-blue" strokeWidth={1.9} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-dark-muted truncate">{label}</p>
              <p className="text-base font-bold text-brand-black dark:text-dark-text leading-tight truncate">
                {value}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}