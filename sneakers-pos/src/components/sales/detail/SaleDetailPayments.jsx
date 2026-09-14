import { Banknote, CreditCard, ArrowRightLeft, Smartphone, MoreHorizontal } from 'lucide-react'
import Card from '../../common/Card'
import Badge from '../../common/Badge'

const METHOD_ICON = {
  cash:     Banknote,
  card:     CreditCard,
  transfer: ArrowRightLeft,
  digital:  Smartphone,
  other:    MoreHorizontal,
}

export default function SaleDetailPayments({ sale }) {
  const payment = sale?.payment || {}
  const Icon = METHOD_ICON[payment.method] || Banknote

  return (
    <Card>
      <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text mb-4">
        Pagos
      </h2>

      <div className="rounded-lg border border-gray-100 dark:border-dark-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/60 dark:bg-dark-surface/60 border-b border-gray-100 dark:border-dark-border">
              {['Método', 'Monto', 'Referencia', 'Estado'].map((h) => (
                <th key={h} className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 dark:border-dark-border last:border-0">
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2 text-brand-black dark:text-dark-text font-medium">
                  <Icon size={14} strokeWidth={2.2} />
                  {payment.methodLabel || '—'}
                </div>
              </td>
              <td className="px-3 py-2.5 font-bold text-brand-black dark:text-dark-text">
                ${Number(sale.total || 0).toLocaleString('es-MX')}
              </td>
              <td className="px-3 py-2.5 text-gray-500 dark:text-dark-muted font-mono text-xs">
                {payment.reference || '—'}
              </td>
              <td className="px-3 py-2.5">
                <Badge variant="success">Pagado</Badge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Efectivo: recibido y cambio */}
      {payment.method === 'cash' && (
        <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
          <Detail label="Total"    value={`$${Number(sale.total).toLocaleString('es-MX')}`} />
          <Detail label="Recibido" value={`$${Number(payment.cashReceived || 0).toLocaleString('es-MX')}`} />
          <Detail label="Cambio"   value={`$${Number(payment.change || 0).toLocaleString('es-MX')}`} emphasis />
        </div>
      )}

      {/* Tarjeta: tipo y últimos 4 */}
      {payment.method === 'card' && (
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <Detail label="Tipo" value={payment.cardType === 'credit' ? 'Crédito' : 'Débito'} />
          <Detail label="Últimos 4" value={payment.reference ? `**** ${payment.reference}` : '—'} mono />
        </div>
      )}

      {/* Transferencia: referencia */}
      {payment.method === 'transfer' && payment.reference && (
        <div className="mt-3 text-sm">
          <Detail label="Referencia" value={payment.reference} mono />
        </div>
      )}
    </Card>
  )
}

function Detail({ label, value, emphasis = false, mono = false }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted">
        {label}
      </p>
      <p className={`mt-0.5 ${emphasis ? 'text-base font-bold text-brand-blue' : 'text-sm font-medium'} text-brand-black dark:text-dark-text ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </p>
    </div>
  )
}