import { X, AlertTriangle, Wallet } from 'lucide-react'
import Button from '../../common/Button'
import Badge from '../../common/Badge'

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX')}`

export default function CashCloseConfirmModal({
  open, session, expected, counted, onClose, onConfirm, submitting,
}) {
  if (!open || !session) return null

  const diff = counted - expected
  const matches = Math.abs(diff) < 0.01

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-cardHover">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border">
          <div className="flex items-center gap-2">
            <Wallet size={16} className="text-brand-blue" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
              ¿Cerrar {session.cashLabel}?
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-brand-black dark:hover:text-dark-text"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600 dark:text-dark-muted">
            Estás a punto de cerrar la sesión{' '}
            <span className="font-mono font-semibold text-brand-black dark:text-dark-text">
              {session.id}
            </span>. Después del cierre no podrás registrar nuevas ventas ni movimientos en esta sesión.
          </p>

          <div className="rounded-lg border border-gray-100 dark:border-dark-border p-3 space-y-2 text-sm">
            <Row label="Efectivo esperado" value={fmt(expected)} />
            <Row label="Efectivo contado"  value={fmt(counted)} />
            <Row
              label="Diferencia"
              value={`${diff >= 0 ? '+' : '-'}${fmt(diff)}`}
              tone={matches ? 'success' : diff > 0 ? 'warning' : 'danger'}
            />
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-dark-border">
              <span className="text-gray-500 dark:text-dark-muted">Estado</span>
              <Badge variant={matches ? 'success' : diff > 0 ? 'warning' : 'danger'}>
                {matches ? 'Conciliada' : diff > 0 ? 'Sobrante' : 'Faltante'}
              </Badge>
            </div>
          </div>

          {!matches && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle size={13} strokeWidth={2.2} className="mt-0.5 shrink-0" />
              <span>
                Esta caja se cerrará con una diferencia de {fmt(diff)}. La diferencia quedará registrada en el historial y en auditoría.
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onConfirm} loading={submitting}>
            {submitting ? 'Cerrando caja...' : 'Sí, cerrar caja'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, tone = 'neutral' }) {
  const tones = {
    neutral: 'text-brand-black dark:text-dark-text',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    danger:  'text-brand-red',
  }
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500 dark:text-dark-muted">{label}</span>
      <span className={`font-semibold ${tones[tone]}`}>{value}</span>
    </div>
  )
}