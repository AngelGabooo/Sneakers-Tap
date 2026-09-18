// src/components/wholesale/detail/CreditGrantModal.jsx
import { useEffect, useState } from 'react'
import { X, HandCoins } from 'lucide-react'
import Button from '../../common/Button'

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX')}`

export default function CreditGrantModal({
  open,
  customer,
  onClose,
  onSubmit,
  submitting,
}) {
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (open && customer) {
      setAmount('')
      setNotes('')
      const days = Number(customer.creditDays) || 30
      const d = new Date()
      d.setDate(d.getDate() + days)
      setDueDate(d.toISOString().split('T')[0])
    }
  }, [open, customer])

  const limit = Number(customer?.creditLimit) || 0
  const amountNum = Number(amount) || 0
  const exceedsLimit = amountNum > limit

  const canSubmit = amountNum > 0 && dueDate && !exceedsLimit

  if (!open || !customer) return null

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit?.({
      amount: amountNum,
      dueDate,
      notes: notes.trim() || null,
    })
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-cardHover">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border">
          <div className="flex items-center gap-2">
            <HandCoins size={16} className="text-brand-blue" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
              Otorgar crédito
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

        {/* Info del cliente */}
        <div className="px-5 py-3 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/50">
          <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
            {customer.name}
          </p>
          <p className="text-[11px] text-gray-600 dark:text-dark-muted mt-0.5">
            Límite autorizado: <span className="font-bold">{fmt(limit)}</span>
            {' · '}
            Plazo: <span className="font-bold">{customer.creditDays} días</span>
          </p>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-4">
          {/* Monto */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted mb-1.5">
              Monto a otorgar
            </label>
            <input
              type="number"
              min={0}
              max={limit}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={submitting}
              autoFocus
              className="
                w-full h-12 px-3 rounded-lg text-lg font-semibold text-center
                bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                border border-gray-200 dark:border-dark-border
                focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40
                outline-none
              "
            />
            {exceedsLimit && (
              <p className="text-[11px] text-brand-red mt-1">
                ⚠️ El monto supera el límite autorizado de {fmt(limit)}.
              </p>
            )}
            {amountNum > 0 && !exceedsLimit && (
              <p className="text-[11px] text-gray-500 dark:text-dark-muted mt-1">
                Quedará un saldo disponible de {fmt(limit - amountNum)} para futuros créditos.
              </p>
            )}
          </div>

          {/* Fecha de vencimiento */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted mb-1.5">
              Fecha de vencimiento
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={submitting}
              className="
                w-full h-11 px-3 rounded-lg text-sm
                bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                border border-gray-200 dark:border-dark-border
                focus:border-brand-blue outline-none
              "
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted mb-1.5">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              disabled={submitting}
              placeholder="Motivo, acuerdo, etc."
              className="
                w-full px-3 py-2 rounded-lg text-sm resize-none
                bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                border border-gray-200 dark:border-dark-border
                focus:border-brand-blue outline-none
              "
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
            disabled={!canSubmit || submitting}
          >
            {submitting ? 'Otorgando…' : `Otorgar ${fmt(amountNum)}`}
          </Button>
        </div>
      </div>
    </div>
  )
}