import { DollarSign, Wallet, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import Card from '../../common/Card'

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 2 })}`

export default function CashCurrentStats({ stats }) {
  const items = [
    {
      key: 'sales',
      label: 'Ventas',
      value: fmt(stats?.totalSales),
      note: `${stats?.salesCount || 0} ventas`,
      icon: DollarSign,
      tone: 'info',
    },
    {
      key: 'expected',
      label: 'Efectivo esperado',
      value: fmt(stats?.expectedCash),
      note: 'fondo + movimientos de efectivo',
      icon: Wallet,
      tone: 'success',
    },
    {
      key: 'in',
      label: 'Efectivo ingresado',
      value: fmt(stats?.cashIn),
      note: 'incluye fondo inicial',
      icon: ArrowDownToLine,
      tone: 'info',
    },
    {
      key: 'out',
      label: 'Retiros',
      value: `-${fmt(stats?.cashOut)}`,
      note: `${stats?.withdrawalsCount || 0} ${stats?.withdrawalsCount === 1 ? 'movimiento' : 'movimientos'}`,
      icon: ArrowUpFromLine,
      tone: 'danger',
    },
  ]

  const tones = {
    info:    'bg-blue-50 dark:bg-blue-950/40 text-brand-blue',
    success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    danger:  'bg-red-50 dark:bg-red-950/40 text-brand-red',
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {items.map(({ key, label, value, note, icon: Icon, tone }) => (
        <Card key={key} className="!p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tones[tone]}`}>
              <Icon size={17} strokeWidth={1.9} />
            </div>
            <p className="text-xs text-gray-500 dark:text-dark-muted truncate">{label}</p>
          </div>
          <p className="text-xl font-bold text-brand-black dark:text-dark-text leading-tight truncate">
            {value}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-dark-muted mt-0.5">{note}</p>
        </Card>
      ))}
    </div>
  )
}