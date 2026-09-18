// src/components/pos/PosCheckoutModal.jsx
import { useEffect, useMemo, useState } from 'react'
import {
  X, Banknote, CreditCard, ArrowRightLeft, Smartphone, MoreHorizontal,
  CheckCircle2, HandCoins, AlertTriangle,
} from 'lucide-react'
import Button from '../common/Button'

const METHODS = [
  { key: 'cash',     label: 'Efectivo',      icon: Banknote },
  { key: 'card',     label: 'Tarjeta',       icon: CreditCard },
  { key: 'transfer', label: 'Transferencia', icon: ArrowRightLeft },
  { key: 'digital',  label: 'Pago digital',  icon: Smartphone },
  { key: 'other',    label: 'Otro',          icon: MoreHorizontal },
]

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX')}`

export default function PosCheckoutModal({
  open,
  totals,
  onClose,
  onConfirm,
  submitting,
  // ⭐ NUEVO: cliente + su crédito activo
  customer,
  activeCredit,
}) {
  const [method, setMethod] = useState('cash')
  const [cashReceived, setCashReceived] = useState('')
  const [cardType, setCardType] = useState('debit')
  const [reference, setReference] = useState('')

  useEffect(() => {
    if (open) {
      setMethod('cash')
      setCashReceived('')
      setCardType('debit')
      setReference('')
    }
  }, [open])

  const total = Number(totals?.total) || 0

  const quickAmounts = useMemo(() => {
    if (total <= 0) return []
    const base = Math.ceil(total / 100) * 100
    return [base, base + 100, base + 500, base + 1000]
  }, [total])

  const received = Number(cashReceived) || 0
  const change = Math.max(0, received - total)

  // ⭐ ¿Este cliente puede usar crédito?
  const canUseCredit =
    customer?.isWholesale &&
    activeCredit &&
    activeCredit.status === 'active' &&
    Number(activeCredit.balance) > 0

  const creditBalance = canUseCredit ? Number(activeCredit.balance) : 0
  const creditCoversSale = canUseCredit && creditBalance >= total

  // ⭐ Métodos disponibles según el cliente
  const availableMethods = useMemo(() => {
    const list = [...METHODS]
    if (canUseCredit) {
      // Insertar "Crédito" al inicio si está disponible
      list.unshift({
        key: 'credit',
        label: 'Crédito',
        icon: HandCoins,
      })
    }
    return list
  }, [canUseCredit])

  const canConfirm = useMemo(() => {
    if (method === 'credit') return creditCoversSale
    if (method === 'cash') return received >= total
    return true
  }, [method, received, total, creditCoversSale])

  if (!open) return null

  const handleConfirm = () => {
    if (!canConfirm) return
    onConfirm?.({
      method,
      cashReceived: method === 'cash' ? received : null,
      change: method === 'cash' ? change : 0,
      cardType: method === 'card' ? cardType : null,
      reference: reference || null,
      // ⭐ Si es crédito, incluir el creditId
      creditId: method === 'credit' ? activeCredit.id : null,
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
            {fmt(total)}
          </p>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Info del crédito activo */}
          {canUseCredit && (
            <div className="
              flex items-start gap-3 p-3 rounded-lg
              bg-emerald-50 dark:bg-emerald-950/30
              border border-emerald-200 dark:border-emerald-900/50
            ">
              <HandCoins size={16} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Crédito activo disponible
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Saldo: <span className="font-bold">{fmt(creditBalance)}</span> · Vence{' '}
                  {new Date(activeCredit.dueDate).toLocaleDateString('es-MX', {
                    day: '2-digit', month: 'short',
                  })}
                </p>
              </div>
            </div>
          )}

          {/* ⚠️ Cliente con crédito activo pero saldo insuficiente */}
          {canUseCredit && !creditCoversSale && (
            <div className="
              flex items-start gap-3 p-3 rounded-lg
              bg-amber-50 dark:bg-amber-950/30
              border border-amber-200 dark:border-amber-900/50
            ">
              <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                El saldo del crédito ({fmt(creditBalance)}) es menor al total de la venta. No se puede cobrar completo con crédito.
              </p>
            </div>
          )}

          {/* Métodos */}
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted mb-2">
              Método de pago
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableMethods.map(({ key, label, icon: Icon }) => {
                const active = method === key
                const disabled = key === 'credit' && !creditCoversSale
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => !disabled && setMethod(key)}
                    disabled={disabled}
                    className={`
                      flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border
                      transition-colors
                      ${active
                        ? 'bg-brand-blue text-white border-brand-blue'
                        : disabled
                          ? 'bg-gray-50 dark:bg-dark-surface text-gray-300 dark:text-dark-border border-gray-200 dark:border-dark-border cursor-not-allowed'
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
                      {fmt(amt)}
                    </button>
                  ))}
                </div>
              )}

              {received > 0 && (
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-3">
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    Cambio:{' '}
                    <span className="text-lg font-bold">{fmt(change)}</span>
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

          {/* Crédito */}
          {method === 'credit' && (
            <div className="
              p-4 rounded-lg bg-blue-50/60 dark:bg-blue-950/20
              border border-blue-200 dark:border-blue-900/40
            ">
              <p className="text-sm font-semibold text-brand-black dark:text-dark-text mb-2">
                Detalles del cargo a crédito
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-muted">Saldo actual:</span>
                  <span className="font-semibold text-brand-black dark:text-dark-text">
                    {fmt(creditBalance)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-muted">Esta venta:</span>
                  <span className="font-semibold text-brand-red">-{fmt(total)}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-blue-200 dark:border-blue-900/40">
                  <span className="font-semibold text-brand-black dark:text-dark-text">Nuevo saldo:</span>
                  <span className="font-bold text-brand-blueDark dark:text-blue-200">
                    {fmt(creditBalance - total)}
                  </span>
                </div>
              </div>
            </div>
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