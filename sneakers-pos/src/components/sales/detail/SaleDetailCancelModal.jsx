import { useEffect, useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import Button from '../../common/Button'

const REASONS = [
  { value: 'typo',        label: 'Error de captura' },
  { value: 'duplicate',   label: 'Venta duplicada' },
  { value: 'payment',     label: 'Error de pago' },
  { value: 'customer',    label: 'Solicitud del cliente' },
  { value: 'other',       label: 'Otro' },
]

export default function SaleDetailCancelModal({ open, sale, onClose, onConfirm, submitting }) {
  const [reason, setReason] = useState('customer')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (open) {
      setReason('customer')
      setNotes('')
    }
  }, [open])

  if (!open || !sale) return null

  const requiresNotes = reason === 'other'
  const canConfirm = !requiresNotes || notes.trim().length > 0

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-cardHover">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-brand-red" strokeWidth={2.2} />
            <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
              ¿Cancelar esta venta?
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
            Esta acción cambiará el estado de la venta y puede requerir revertir los movimientos asociados.
          </p>

          <div className="rounded-lg border border-gray-100 dark:border-dark-border p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-dark-muted">Venta</span>
              <span className="font-mono font-medium">{sale.folio}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-gray-500 dark:text-dark-muted">Total</span>
              <span className="font-bold">${Number(sale.total || 0).toLocaleString('es-MX')}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
              Motivo de cancelación <span className="text-brand-red">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-10 px-3 rounded-lg text-sm bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border focus:border-brand-blue outline-none"
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
              Notas {requiresNotes && <span className="text-brand-red">*</span>}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles adicionales..."
              className="w-full rounded-lg text-sm p-3 resize-none bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border focus:border-brand-blue outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => onConfirm({ reason, notes })}
            loading={submitting}
            disabled={!canConfirm || submitting}
          >
            {submitting ? 'Cancelando...' : 'Cancelar venta'}
          </Button>
        </div>
      </div>
    </div>
  )
}