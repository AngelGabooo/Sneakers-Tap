import { X, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Button from '../../common/Button'

export default function AdjustConfirmModal({ open, data, onClose, onConfirm, submitting }) {
  if (!open || !data) return null

  const { productName, variantLabel, stockBefore, delta, stockAfter, reasonLabel } = data
  const isCritical = Number(delta) < 0

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-cardHover">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border">
          <div className="flex items-center gap-2">
            {isCritical
              ? <AlertTriangle size={16} className="text-brand-red" strokeWidth={2} />
              : <CheckCircle2 size={16} className="text-brand-blue" strokeWidth={2} />}
            <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
              ¿Registrar este ajuste?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-brand-black dark:hover:text-dark-text transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600 dark:text-dark-muted">
            Estás a punto de modificar el inventario de{' '}
            <span className="font-semibold text-brand-black dark:text-dark-text">{productName}</span>
            {' · '}
            <span className="font-semibold text-brand-black dark:text-dark-text">{variantLabel}</span>.
          </p>

          <div className="rounded-lg border border-gray-100 dark:border-dark-border p-4">
            <div className="flex items-center justify-between">
              <Stat label="Stock actual" value={stockBefore} />
              <span className="text-gray-300 dark:text-dark-muted">→</span>
              <Stat
                label="Movimiento"
                value={`${Number(delta) >= 0 ? '+' : ''}${delta}`}
                tone={Number(delta) > 0 ? 'success' : Number(delta) < 0 ? 'danger' : 'neutral'}
              />
              <span className="text-gray-300 dark:text-dark-muted">→</span>
              <Stat label="Nuevo stock" value={stockAfter} emphasis />
            </div>
            <p className="text-xs text-gray-500 dark:text-dark-muted mt-3 text-center">
              Motivo: <span className="font-medium">{reasonLabel}</span>
            </p>
          </div>

          <p className="text-xs text-gray-500 dark:text-dark-muted">
            Esta acción generará un movimiento permanente en el historial de inventario.
          </p>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant={isCritical ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={submitting}
          >
            {submitting ? 'Registrando...' : 'Confirmar ajuste'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, tone = 'neutral', emphasis = false }) {
  const tones = {
    success: 'text-emerald-600 dark:text-emerald-400',
    danger:  'text-brand-red',
    neutral: 'text-brand-black dark:text-dark-text',
  }
  return (
    <div className="text-center">
      <p className="text-[11px] text-gray-500 dark:text-dark-muted">{label}</p>
      <p className={`${emphasis ? 'text-xl font-bold' : 'text-base font-semibold'} ${tones[tone]} mt-0.5`}>
        {value}
      </p>
    </div>
  )
}