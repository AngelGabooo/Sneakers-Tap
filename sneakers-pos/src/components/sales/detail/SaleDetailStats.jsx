import { DollarSign, Package, User, Wallet, Store } from 'lucide-react'
import Card from '../../common/Card'

export default function SaleDetailStats({ sale }) {
  const items = sale?.items || []
  const totalQty = items.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0)

  const stats = [
    {
      key: 'total',
      label: 'Total',
      value: sale?.total ? `$${Number(sale.total).toLocaleString('es-MX')}` : '—',
      icon: DollarSign,
      tone: 'info',
    },
    {
      key: 'products',
      label: 'Productos',
      value: totalQty,
      icon: Package,
      tone: 'info',
    },
    {
      key: 'customer',
      label: 'Cliente',
      value: sale?.customerName || 'Venta general',
      icon: User,
      tone: 'info',
    },
    {
      key: 'payment',
      label: 'Método de pago',
      value: sale?.payment?.methodLabel || '—',
      icon: Wallet,
      tone: 'info',
    },
    {
      key: 'cash',
      label: 'Caja',
      value: sale?.cashId || '—',
      icon: Store,
      tone: 'info',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
      {stats.map(({ key, label, value, icon: Icon }) => (
        <Card key={key} className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
              <Icon size={17} className="text-brand-blue" strokeWidth={1.9} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-dark-muted truncate">{label}</p>
              <p className="text-sm lg:text-base font-bold text-brand-black dark:text-dark-text leading-tight truncate">
                {value}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}