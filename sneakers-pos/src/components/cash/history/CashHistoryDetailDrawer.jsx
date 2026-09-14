import {
  X, Store, User, Clock, Receipt, Activity, History, Wallet,
} from 'lucide-react'
import Badge from '../../common/Badge'
import Button from '../../common/Button'

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX')}`

function getResult(s) {
  if (!s || s.status === 'open') return null
  const diff = Number(s.closingFund || 0) - Number(s.expectedCash || 0)
  if (Math.abs(diff) < 0.01) return { key: 'reconciled', label: 'Conciliada', variant: 'success', diff }
  if (diff > 0) return { key: 'surplus', label: 'Sobrante', variant: 'warning', diff }
  return { key: 'shortage', label: 'Faltante', variant: 'danger', diff }
}

export default function CashHistoryDetailDrawer({
  open, session, onClose,
  onViewSales, onViewMovements, onViewAudit,
}) {
  if (!open || !session) return null

  const result = getResult(session)
  const opened = new Date(session.openedAt)
  const closed = session.closedAt ? new Date(session.closedAt) : null

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg h-full flex flex-col bg-white dark:bg-dark-card border-l border-gray-200 dark:border-dark-border shadow-cardHover overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border shrink-0">
          <div className="flex items-center gap-2">
            <Wallet size={16} className="text-brand-blue" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
              Detalle de sesión
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

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <p className="text-lg font-bold text-brand-black dark:text-dark-text">
              {session.cashLabel}
            </p>
            <p className="text-xs font-mono text-brand-blue mt-0.5">#{session.id}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={session.status === 'open' ? 'info' : 'neutral'}>
                {session.status === 'open' ? 'En curso' : 'Cerrada'}
              </Badge>
              {result && <Badge variant={result.variant}>{result.label}</Badge>}
            </div>
          </div>

          <ul className="space-y-2 text-sm">
            <Row icon={Store}    label="Sucursal"     value={session.branch} />
            <Row icon={User}     label="Responsable"  value={session.responsibleName} />
            <Row icon={Clock}    label="Apertura"     value={opened.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })} />
            {closed && <Row icon={Clock} label="Cierre" value={closed.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })} />}
          </ul>

          <div className="rounded-lg border border-gray-100 dark:border-dark-border p-4">
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted mb-2">
              Resumen financiero
            </p>
            <ul className="space-y-1.5 text-sm">
              <Row label="Ventas totales"    value={fmt(session.totalSales)} />
              <Row label="Fondo inicial"     value={fmt(session.initialFund)} />
              <Row label="Efectivo esperado" value={fmt(session.expectedCash)} />
              {closed && <Row label="Efectivo contado" value={fmt(session.closingFund)} />}
              {result && (
                <Row
                  label="Diferencia"
                  value={`${result.diff >= 0 ? '+' : '-'}${fmt(Math.abs(result.diff))}`}
                  tone={result.variant}
                />
              )}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border shrink-0">
          <Button variant="secondary" icon={Receipt} onClick={() => onViewSales?.(session)} size="sm">
            Ventas
          </Button>
          <Button variant="secondary" icon={Activity} onClick={() => onViewMovements?.(session)} size="sm">
            Movs.
          </Button>
          <Button variant="secondary" icon={History} onClick={() => onViewAudit?.(session)} size="sm">
            Auditoría
          </Button>
        </div>
      </div>
    </div>
  )
}

function Row({ icon: Icon, label, value, tone = 'neutral' }) {
  const tones = {
    neutral: 'text-brand-black dark:text-dark-text',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    danger:  'text-brand-red',
  }
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-gray-500 dark:text-dark-muted">
        {Icon && <Icon size={12} strokeWidth={2} className="text-gray-400" />}
        {label}
      </span>
      <span className={`font-semibold ${tones[tone]} truncate`}>{value || '—'}</span>
    </li>
  )
}