import { useEffect, useMemo, useState } from 'react'
import {
  X, Banknote, CreditCard, ArrowRightLeft, Smartphone, MoreHorizontal, CheckCircle2,
} from 'lucide-react'
import Button from '../common/Button'

const METHODS = [
  { key: 'cash',     label: 'Efectivo',      icon: Banknote },
  { key: 'card',     label: 'Tarjeta',       icon: CreditCard },
  { key: 'transfer', label: 'Transferencia', icon: ArrowRightLeft },
  { key: 'digital',  label: 'Pago digital',  icon: Smartphone },
  { key: 'other',    label: 'Otro',          icon: MoreHorizontal },
]

/**
 * Modal de cobro.
 * ⚠️ Todos los hooks van ANTES del `if (!open) return null`.
 */
export default function PosCheckoutModal({ open, totals, onClose, onConfirm, submitting }) {
  // ---- 1. Hooks de estado (siempre en el mismo orden) ----
  const [method, setMethod] = useState('cash')
  const [cashReceived, setCashReceived] = useState('')
  const [cardType, setCardType] = useState('debit')
  const [reference, setReference] = useState('')

  // ---- 2. useEffect (reset al abrir) ----
  useEffect(() => {
    if (open) {
      setMethod('cash')
      setCashReceived('')
      setCardType('debit')
      setReference('')
    }
  }, [open])

  // ---- 3. useMemo (ANTES del return) ----
  const total = Number(totals?.total) || 0

  const quickAmounts = useMemo(() => {
    if (total <= 0) return []
    const base = Math.ceil(total / 100) * 100
    return [base, base + 100, base + 500, base + 1000]
  }, [total])

  const received = Number(cashReceived) || 0
  const change = Math.max(0, received - total)

  const canConfirm =
    (method === 'cash' && received >= total) ||
    method === 'card' ||
    method === 'transfer' ||
    method === 'digital' ||
    method === 'other'

  // ---- 4. AHORA SÍ: return condicional (después de todos los hooks) ----
  if (!open) return null

  const handleConfirm = () => {
    if (!canConfirm) return
    onConfirm?.({
      method,
      cashReceived: method === 'cash' ? received : null,
      change: method === 'cash' ? change : 0,
      cardType: method === 'card' ? cardType : null,
      reference: reference || null,
    })
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-cardHover">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border">
          <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
            Cobrar venta
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

        {/* Total */}
        <div className="px-5 py-4 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/50">
          <p className="text-xs text-brand-blue dark:text-blue-300">Total a pagar</p>
          <p className="text-3xl font-bold text-brand-blueDark dark:text-blue-200 mt-1">
            ${total.toLocaleString('es-MX')}
          </p>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Métodos */}
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted mb-2">
              Método de pago
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {METHODS.map(({ key, label, icon: Icon }) => {
                const active = method === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMethod(key)}
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

          {/* Efectivo */}
          {method === 'cash' && (
            <>
              <div>
                <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
                  Monto recibido
                </label>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0.00"
                  className="
                    w-full h-12 px-3 rounded-lg text-lg font-semibold text-center
                    bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                    border border-gray-200 dark:border-dark-border
                    focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40
                    outline-none
                  "
                />
              </div>

              {quickAmounts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashReceived(String(amt))}
                      className="h-9 px-3 rounded-lg text-sm font-medium bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-dark-text hover:bg-brand-blue hover:text-white transition-colors"
                    >
                      ${amt.toLocaleString('es-MX')}
                    </button>
                  ))}
                </div>
              )}

              {received > 0 && (
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-3">
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    Cambio:{' '}
                    <span className="text-lg font-bold">
                      ${change.toLocaleString('es-MX')}
                    </span>
                  </p>
                </div>
              )}

              {received > 0 && received < total && (
                <p className="text-xs text-brand-red">
                  El monto recibido es menor al total.
                </p>
              )}
            </>
          )}

          {/* Tarjeta */}
          {method === 'card' && (
            <>
              <div>
                <p className="text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
                  Tipo
                </p>
                <div className="flex gap-2">
                  {['debit', 'credit'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCardType(t)}
                      className={`
                        h-9 px-3 rounded-lg text-sm font-medium border transition-colors
                        ${cardType === t
                          ? 'bg-brand-blue text-white border-brand-blue'
                          : 'bg-white dark:bg-dark-card text-gray-700 dark:text-dark-muted border-gray-200 dark:border-dark-border hover:border-brand-blue'}
                      `}
                    >
                      {t === 'debit' ? 'Débito' : 'Crédito'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
                  Últimos 4 dígitos <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={reference}
                  onChange={(e) => setReference(e.target.value.replace(/\D/g, ''))}
                  placeholder="1234"
                  className="w-full h-11 px-3 rounded-lg text-sm bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border focus:border-brand-blue outline-none"
                />
              </div>
            </>
          )}

          {/* Transferencia / Digital / Otro */}
          {(method === 'transfer' || method === 'digital' || method === 'other') && (
            <div>
              <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
                Referencia <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ej. REF-12345"
                className="w-full h-11 px-3 rounded-lg text-sm bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border focus:border-brand-blue outline-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border shrink-0">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            icon={CheckCircle2}
            onClick={handleConfirm}
            loading={submitting}
            disabled={!canConfirm || submitting}
          >
            {submitting ? 'Procesando...' : 'Confirmar venta'}
          </Button>
        </div>
      </div>
    </div>
  )
}