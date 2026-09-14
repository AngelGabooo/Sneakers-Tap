import { Activity, ExternalLink } from 'lucide-react'
import Card from '../../common/Card'

export default function SaleDetailAudit({ sale, onViewAudit }) {
  const created = sale?.createdAt ? new Date(sale.createdAt) : null

  const events = [
    created && {
      id: 'created',
      icon: '🟢',
      title: 'Venta creada',
      who: sale?.cashier,
      at: created,
    },
    created && {
      id: 'payment',
      icon: '💳',
      title: 'Pago registrado',
      description: `${sale?.payment?.methodLabel || '—'} · $${Number(sale?.total || 0).toLocaleString('es-MX')}`,
      at: created,
    },
    created && {
      id: 'receipt',
      icon: '🧾',
      title: 'Comprobante generado',
      description: `Ticket TKT-${String(sale?.folio || '').replace('VTA-', '')}`,
      at: created,
    },
  ].filter(Boolean)

  return (
    <Card>
      <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text mb-4 flex items-center gap-2">
        <Activity size={16} className="text-brand-blue" strokeWidth={2} />
        Actividad y auditoría
      </h2>

      <ul className="space-y-4">
        {events.map((e) => (
          <li key={e.id} className="flex items-start gap-3">
            <span className="text-base shrink-0">{e.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-brand-black dark:text-dark-text">
                {e.title}
              </p>
              {e.description && (
                <p className="text-xs text-gray-500 dark:text-dark-muted">
                  {e.description}
                </p>
              )}
              <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">
                {e.who && `${e.who} · `}
                {e.at && new Date(e.at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <button
        onClick={onViewAudit}
        className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
      >
        <ExternalLink size={11} strokeWidth={2.2} />
        Ver historial completo
      </button>
    </Card>
  )
}