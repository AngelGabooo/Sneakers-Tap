// src/components/credits/CreditPaymentModal.jsx
import { useEffect, useState } from 'react'
import { X, Banknote, CreditCard, ArrowRightLeft } from 'lucide-react'
import Button from '../common/Button'

const METHODS = [
  { key: 'cash',     label: 'Efectivo',      icon: Banknote },
  { key: 'card',     label: 'Tarjeta',       icon: CreditCard },
  { key: 'transfer', label: 'Transferencia', icon: ArrowRightLeft },
]

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 2 })}`

export default function CreditPaymentModal({ open, credit, onClose, onSubmit, submitting }) {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('cash')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (open && credit) {
      // ⭐ Default: la deuda pendiente (outstanding)
      setAmount(String(credit.outstanding || ''))
      setMethod('cash')
      setNotes('')
    }
  }, [open, credit])

  const outstanding = Number(credit?.outstanding) || 0
  const available = Number(credit?.available) || 0
  const amountNum = Number(amount) || 0

  const canSubmit = amountNum > 0 && amountNum <= outstanding

  const isFullPayment = Math.abs(amountNum - outstanding) < 0.01

  if (!open || !credit) return null

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit?.({
      creditId: credit.id,
      amount: amountNum,
      method,
      notes: notes.trim() || null,
    })
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-cardHover">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border">
          <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
            Registrar pago
          </h3>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-brand-black dark:hover:text-dark-text transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Resumen del crédito */}
        <div className="px-5 py-4 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/50">
          <p className="text-xs text-brand-blue dark:text-blue-300 font-semibold">
            {credit.customerName}
          </p>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <p className="text-[10px] uppercase text-gray-500 dark:text-dark-muted">Deuda pendiente</p>
              <p className="text-lg font-bold text-brand-blueDark dark:text-blue-200">{fmt(outstanding)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-gray-500 dark:text-dark-muted">Disponible</p>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{fmt(available)}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-dark-muted mt-2">
            Usado: {fmt(credit.used)} · Pagado: {fmt(credit.paidAmount)}
          </p>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-4">
          {/* Monto */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
                Monto a pagar
              </label>
              <button
                type="button"
                onClick={() => setAmount(String(outstanding))}
                className="text-[11px] font-semibold text-brand-blue hover:underline"
              >
                Pagar todo
              </button>
            </div>
            <input
              type="number"
              min={0}
              max={outstanding}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={submitting}
              className="
                w-full h-12 px-3 rounded-lg text-lg font-semibold text-center
                bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                border border-gray-200 dark:border-dark-border
                focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40
                outline-none
              "
            />
            {amountNum > outstanding && (
              <p className="text-[11px] text-brand-red mt-1">
                El monto supera la deuda pendiente.
              </p>
            )}
            {isFullPayment && amountNum > 0 && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                ✅ Liquidarás la deuda por completo.
              </p>
            )}
            {amountNum > 0 && !isFullPayment && (
              <p className="text-[11px] text-gray-500 dark:text-dark-muted mt-1">
                Quedará un saldo pendiente de {fmt(outstanding - amountNum)}.
              </p>
            )}
          </div>

          {/* Método */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted mb-1.5">
              Método de pago
            </label>
            <div className="grid grid-cols-3 gap-2">
              {METHODS.map(({ key, label, icon: Icon }) => {
                const active = method === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMethod(key)}
                    disabled={submitting}
                    className={`
                      flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border
                      transition-colors
                      ${active
                        ? 'bg-brand-blue text-white border-brand-blue'
                        : 'bg-white dark:bg-dark-card text-gray-700 dark:text-dark-muted border-gray-200 dark:border-dark-border hover:border-brand-blue hover:text-brand-blue'}
                    `}
                  >
                    <Icon size={18} strokeWidth={2} />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                )
              })}
            </div>
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
              placeholder="Ej. Pago parcial acordado"
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
            {submitting ? 'Procesando…' : `Cobrar ${fmt(amountNum)}`}
          </Button>
        </div>
      </div>
    </div>
  )
}