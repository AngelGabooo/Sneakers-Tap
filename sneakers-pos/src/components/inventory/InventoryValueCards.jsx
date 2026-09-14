import { DollarSign, TrendingUp, Wallet } from 'lucide-react'
import Card from '../common/Card'

export default function InventoryValueCards({ values }) {
  const items = [
    {
      key: 'cost',
      label: 'Valor del inventario',
      value: values?.costValue ?? '—',
      note: 'Valor estimado a precio de compra',
      icon: Wallet,
    },
    {
      key: 'sale',
      label: 'Valor potencial de venta',
      value: values?.saleValue ?? '—',
      note: 'Valor estimado a precio de venta',
      icon: DollarSign,
    },
    {
      key: 'margin',
      label: 'Margen potencial',
      value: values?.marginValue ?? '—',
      note: 'Margen estimado del inventario',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
      {items.map(({ key, label, value, note, icon: Icon }) => (
        <Card key={key} className="!p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
              <Icon size={17} className="text-brand-blue" strokeWidth={1.9} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-dark-muted">{label}</p>
              <p className="text-lg font-bold text-brand-black dark:text-dark-text leading-tight mt-0.5">
                {value}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-dark-muted mt-0.5">{note}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}