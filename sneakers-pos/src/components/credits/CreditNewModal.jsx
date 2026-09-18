// src/components/credits/CreditNewModal.jsx
import { useEffect, useMemo, useState } from 'react'
import { X, HandCoins } from 'lucide-react'
import Button from '../common/Button'

export default function CreditNewModal({ open, onClose, onSubmit, submitting, customers = [] }) {
  const [customerId, setCustomerId] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (open) {
      setCustomerId('')
      setAmount('')
      setNotes('')
      // Por defecto, 30 días
      const d = new Date()
      d.setDate(d.getDate() + 30)
      setDueDate(d.toISOString().split('T')[0])
    }
  }, [open])

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === customerId) || null,
    [customers, customerId],
  )

  const limit = Number(selectedCustomer?.creditLimit) || 0
  const amountNum = Number(amount) || 0

  const canSubmit =
    customerId &&
    amountNum > 0 &&
    dueDate &&
    (!selectedCustomer || amountNum <= limit)

  if (!open) return null

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit?.({
      customerId,
      amount: amountNum,
      dueDate,
      notes: notes.trim() || null,
    })
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
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

        {/* Contenido */}
        <div className="p-5 space-y-4">
          {/* Cliente */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted mb-1.5">
              Cliente
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              disabled={submitting}
              className="
                w-full h-11 px-3 rounded-lg text-sm
                bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                border border-gray-200 dark:border-dark-border
                focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40
                outline-none
              "
            >
              <option value="">Selecciona un cliente…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — Límite ${Number(c.creditLimit || 0).toLocaleString('es-MX')}
                </option>
              ))}
            </select>
            {customers.length === 0 && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                No hay clientes con crédito habilitado y sin crédito activo.
              </p>
            )}
          </div>

          {/* Monto */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted mb-1.5">
              Monto a otorgar
            </label>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={submitting}
              className="
                w-full h-12 px-3 rounded-lg text-lg font-semibold text-center
                bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                border border-gray-200 dark:border-dark-border
                focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40
                outline-none
              "
            />
            {selectedCustomer && (
              <p className={`text-[11px] mt-1 ${
                amountNum > limit ? 'text-brand-red' : 'text-gray-500 dark:text-dark-muted'
              }`}>
                Límite disponible: ${limit.toLocaleString('es-MX')}
                {amountNum > limit && ' — El monto supera el límite.'}
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
            {submitting ? 'Otorgando…' : `Otorgar $${amountNum.toLocaleString('es-MX')}`}
          </Button>
        </div>
      </div>
    </div>
  )
}