import { Receipt, DollarSign, Percent, TrendingUp } from 'lucide-react'
import Card from '../../common/Card'

export default function SalesHistoryStats({ stats }) {
  const items = [
    {
      key: 'count',
      label: 'Ventas',
      value: stats?.count ?? '—',
      note: 'ventas en el periodo',
      icon: Receipt,
      tone: 'info',
    },
    {
      key: 'gross',
      label: 'Ingresos brutos',
      value: stats?.gross ?? '—',
      note: 'antes de devoluciones',
      icon: DollarSign,
      tone: 'info',
    },
    {
      key: 'discount',
      label: 'Descuentos',
      value: stats?.discount ?? '—',
      note: 'descuentos aplicados',
      icon: Percent,
      tone: 'warning',
    },
    {
      key: 'net',
      label: 'Ventas netas',
      value: stats?.net ?? '—',
      note: 'después de descuentos',
      icon: TrendingUp,
      tone: 'success',
    },
  ]

  const tones = {
    info:    'bg-blue-50 dark:bg-blue-950/40 text-brand-blue',
    warning: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
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
          <p className="text-xl font-bold text-brand-black dark:text-dark-text leading-tight">
            {value}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-dark-muted mt-0.5">{note}</p>
        </Card>
      ))}

      {stats?.avgTicket && (
        <p className="col-span-2 lg:col-span-4 text-xs text-gray-500 dark:text-dark-muted -mt-2">
          Ticket promedio: <span className="font-medium text-brand-black dark:text-dark-text">{stats.avgTicket}</span>
        </p>
      )}
    </div>
  )
}