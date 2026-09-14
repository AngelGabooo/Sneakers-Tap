import { Receipt, ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal } from 'lucide-react'
import Card from '../../common/Card'
import Badge from '../../common/Badge'

const TIPO_META = {
  sale:      { label: 'Venta',       icon: Receipt,          variant: 'success' },
  in:        { label: 'Entrada',     icon: ArrowDownToLine,  variant: 'info' },
  out:       { label: 'Retiro',      icon: ArrowUpFromLine,  variant: 'danger' },
  adjust:    { label: 'Ajuste',      icon: SlidersHorizontal,variant: 'warning' },
  opening:   { label: 'Apertura',    icon: ArrowDownToLine,  variant: 'info' },
}

export default function CashCurrentMovementsTable({ movements = [], onViewAll }) {
  const rows = movements.slice(0, 10)

  return (
    <Card padded={false}>
      <div className="p-5 pb-0 flex items-center justify-between">
        <div>
          <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Movimientos recientes
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Últimos movimientos de efectivo de esta sesión.
          </p>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-medium text-brand-blue hover:underline"
          >
            Ver todos
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-dark-muted px-5 py-6">
          Aún no hay movimientos registrados.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-y border-gray-100 dark:border-dark-border bg-gray-50/60 dark:bg-dark-surface/60">
                {['Hora', 'Tipo', 'Concepto', 'Importe', 'Usuario', 'Efectivo resultante'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((m, i) => {
                const meta = TIPO_META[m.type] || TIPO_META.adjust
                const Icon = meta.icon
                const isPositive = Number(m.amount) > 0
                return (
                  <tr
                    key={m.id || i}
                    className="border-b border-gray-100 dark:border-dark-border last:border-0"
                  >
                    <td className="px-5 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap text-xs">
                      {new Date(m.at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Icon size={12} strokeWidth={2.2} className="text-gray-400" />
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-brand-black dark:text-dark-text truncate max-w-[240px]">
                      {m.label || '—'}
                    </td>
                    <td className={`px-5 py-3 font-semibold whitespace-nowrap ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-red'}`}>
                      {isPositive ? '+' : ''}${Number(m.amount || 0).toLocaleString('es-MX')}
                    </td>
                    <td className="px-5 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap text-xs">
                      {m.by || '—'}
                    </td>
                    <td className="px-5 py-3 font-medium text-brand-black dark:text-dark-text whitespace-nowrap">
                      ${Number(m.after || 0).toLocaleString('es-MX')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}