// src/components/cash/open/CashOpenSuccessModal.jsx
import { CheckCircle2, Wallet, ShoppingCart } from 'lucide-react'
import Button from '../../common/Button'

export default function CashOpenSuccessModal({ open, session, onGoToCash, onGoToPos }) {
  if (!open || !session) return null

  const cashLabel = session.cashLabel || session.cash_label || 'Caja'
  const initialFund = Number(session.initialFund ?? session.initial_fund) || 0
  const responsibleName = session.responsibleName || session.responsible_name || '—'
  const openedAt = session.openedAt || session.opened_at

  const dateLabel = openedAt
    ? new Date(openedAt).toLocaleString('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—'

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-cardHover">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 size={28} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-bold text-brand-black dark:text-dark-text">
            Caja abierta correctamente
          </h3>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-2">
            La {cashLabel} está lista para comenzar operaciones.
          </p>

          <div className="mt-4 space-y-1.5 text-sm">
            <Row label="Sesión" value={session.id || '—'} mono />
            <Row
              label="Fondo inicial"
              value={`$${initialFund.toLocaleString('es-MX')}`}
              emphasis
            />
            <Row label="Responsable" value={responsibleName} />
            <Row label="Fecha" value={dateLabel} />
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-dark-border p-4 space-y-2">
          <Button variant="primary" icon={Wallet} className="w-full" onClick={onGoToCash}>
            Ir a caja actual
          </Button>
          <Button variant="secondary" icon={ShoppingCart} className="w-full" onClick={onGoToPos}>
            Ir al punto de venta
          </Button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, mono = false, emphasis = false }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-gray-500 dark:text-dark-muted">{label}</span>
      <span className={`font-semibold text-brand-black dark:text-dark-text ${mono ? 'font-mono text-xs' : ''} ${emphasis ? 'text-base' : ''}`}>
        {value}
      </span>
    </div>
  )
}