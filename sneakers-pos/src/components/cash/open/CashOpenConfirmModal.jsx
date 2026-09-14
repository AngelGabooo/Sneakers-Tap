import { X, Wallet } from 'lucide-react'
import Button from '../../common/Button'

export default function CashOpenConfirmModal({ open, cash, user, date, initialFund, onClose, onConfirm, submitting }) {
  if (!open || !cash) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-cardHover">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border">
          <div className="flex items-center gap-2">
            <Wallet size={16} className="text-brand-blue" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
              ¿Abrir {cash.label}?
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-brand-black dark:hover:text-dark-text transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600 dark:text-dark-muted">
            Estás a punto de iniciar una nueva sesión de caja con un fondo inicial de{' '}
            <span className="font-semibold text-brand-black dark:text-dark-text">
              ${Number(initialFund).toLocaleString('es-MX')}
            </span>.
          </p>

          <div className="rounded-lg border border-gray-100 dark:border-dark-border p-3 space-y-2 text-sm">
            <Row label="Caja" value={cash.label} />
            <Row label="Sucursal" value={cash.branch} />
            <Row label="Responsable" value={user?.name || '—'} />
            <Row label="Fecha" value={date.toLocaleDateString('es-MX')} />
            <Row label="Hora" value={date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} />
            <Row
              label="Fondo inicial"
              value={`$${Number(initialFund).toLocaleString('es-MX')}`}
              emphasis
            />
          </div>

          <p className="text-xs text-gray-500 dark:text-dark-muted">
            Una vez abierta, la caja estará disponible para registrar ventas y movimientos. La apertura quedará registrada en el historial y auditoría.
          </p>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Volver
          </Button>
          <Button variant="primary" onClick={onConfirm} loading={submitting}>
            {submitting ? 'Abriendo caja...' : 'Confirmar apertura'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, emphasis = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gray-500 dark:text-dark-muted">{label}</span>
      <span className={`font-medium text-brand-black dark:text-dark-text ${emphasis ? 'text-base' : ''}`}>
        {value}
      </span>
    </div>
  )
}