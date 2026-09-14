import { X, AlertTriangle } from 'lucide-react'
import Button from '../../common/Button'

export default function CashCurrentRetiroConfirmModal({
  open,
  data,
  onClose,
  onConfirm,
  submitting,
}) {
  if (!open || !data) return null

  const { amount, currentExpected } = data
  const newExpected = Math.max(0, currentExpected - amount)

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-cardHover">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-brand-red" strokeWidth={2.2} />
            <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
              ¿Registrar retiro de ${amount.toLocaleString('es-MX')}?
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

        <div className="p-5 space-y-2 text-sm">
          <Row label="Efectivo esperado antes" value={currentExpected} />
          <Row label="Retiro" value={-amount} tone="danger" />
          <Row label="Efectivo esperado después" value={newExpected} emphasis />
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={submitting}>
            {submitting ? 'Registrando...' : 'Confirmar retiro'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, tone = 'neutral', emphasis = false }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500 dark:text-dark-muted">{label}</span>
      <span
        className={`font-medium ${
          tone === 'danger' ? 'text-brand-red' : 'text-brand-black dark:text-dark-text'
        } ${emphasis ? 'text-base font-bold' : ''}`}
      >
        ${Math.abs(value).toLocaleString('es-MX')}
      </span>
    </div>
  )
}