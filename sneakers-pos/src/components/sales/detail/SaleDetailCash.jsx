import { Store, ExternalLink } from 'lucide-react'
import Card from '../../common/Card'

export default function SaleDetailCash({ sale, onViewCash }) {
  return (
    <Card>
      <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text mb-4">
        Movimiento de caja
      </h2>

      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
          <Store size={16} className="text-brand-blue" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-brand-black dark:text-dark-text">
            {sale?.cashId || 'Caja #001'}
          </p>
          <p className="text-xs text-gray-500 dark:text-dark-muted">
            Entrada por venta
          </p>
        </div>
      </div>

      <ul className="space-y-2 text-sm">
        <Row label="Monto"    value={`+$${Number(sale?.total || 0).toLocaleString('es-MX')}`} emphasis />
        <Row label="Fecha"    value={sale?.createdAt ? new Date(sale.createdAt).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }) : '—'} />
        <Row label="Usuario"  value={sale?.cashier || '—'} />
      </ul>

      <button
        onClick={() => onViewCash?.()}
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
      >
        <ExternalLink size={11} strokeWidth={2.2} />
        Ver caja
      </button>
    </Card>
  )
}

function Row({ label, value, emphasis = false }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-gray-500 dark:text-dark-muted">{label}</span>
      <span className={`font-medium ${emphasis ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-black dark:text-dark-text'}`}>
        {value}
      </span>
    </li>
  )
}