// src/components/credits/CreditsTable.jsx
import { ChevronLeft, ChevronRight, ArrowUpDown, AlertTriangle, CheckCircle2, Clock, Ban, Eye, HandCoins } from 'lucide-react'
import Card from '../common/Card'
import Badge from '../common/Badge'

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 2 })}`

const fmtDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

const daysUntil = (iso) => {
  if (!iso) return null
  const diff = Math.ceil((new Date(iso) - new Date()) / (1000 * 60 * 60 * 24))
  return diff
}

const STATUS_CONFIG = {
  active:    { label: 'Activo',    variant: 'info',    icon: Clock },
  overdue:   { label: 'Vencido',   variant: 'danger',  icon: AlertTriangle },
  paid:      { label: 'Pagado',    variant: 'success', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', variant: 'neutral', icon: Ban },
}

export default function CreditsTable({
  credits = [],
  loading,
  sort,
  onSortChange,
  onViewDetail,
  onPay,
  onViewCustomer,
  page,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const start = (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)

  const handleSort = (field) => {
    if (sort.field === field) {
      onSortChange?.({ field, direction: sort.direction === 'asc' ? 'desc' : 'asc' })
    } else {
      onSortChange?.({ field, direction: 'desc' })
    }
  }

  if (loading) {
    return (
      <Card padded={false}>
        <div className="p-6 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-gray-100 dark:bg-dark-surface animate-pulse" />
          ))}
        </div>
      </Card>
    )
  }

  if (credits.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <HandCoins size={32} className="mx-auto mb-3 text-gray-300 dark:text-dark-border" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
            Sin créditos registrados
          </p>
          <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">
            Otorga un crédito para empezar.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border">
            <tr>
              <Th onClick={() => handleSort('customerName')} sort={sort} field="customerName">Cliente</Th>
              <Th align="right" onClick={() => handleSort('amount')} sort={sort} field="amount">Otorgado</Th>
              <Th align="right">Pagado</Th>
              <Th align="right">Saldo</Th>
              <Th onClick={() => handleSort('dueDate')} sort={sort} field="dueDate">Vence</Th>
              <Th>Estado</Th>
              <Th align="right">Acciones</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
            {credits.map((c) => {
              const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.active
              const StatusIcon = cfg.icon
              const days = daysUntil(c.dueDate)
              const isOverdue = c.status === 'overdue'

              return (
                <tr
                  key={c.id}
                  className="hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onViewCustomer?.(c)}
                      className="text-left hover:text-brand-blue transition-colors"
                    >
                      <p className="font-semibold text-brand-black dark:text-dark-text">
                        {c.customerName}
                      </p>
                      {c.notes && (
                        <p className="text-[11px] text-gray-500 dark:text-dark-muted truncate max-w-xs mt-0.5">
                          {c.notes}
                        </p>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-brand-black dark:text-dark-text">
                    {fmt(c.amount)}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                    {fmt(c.paidAmount)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-brand-black dark:text-dark-text">
                    {fmt(c.balance)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-brand-black dark:text-dark-text">
                      {fmtDate(c.dueDate)}
                    </p>
                    {c.status !== 'paid' && c.status !== 'cancelled' && days !== null && (
                      <p className={`text-[11px] font-medium ${
                        isOverdue ? 'text-brand-red' : days <= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-dark-muted'
                      }`}>
                        {isOverdue
                          ? `Hace ${Math.abs(days)} días`
                          : days === 0 ? 'Vence hoy'
                          : `${days} días`}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={cfg.variant}>
                      <StatusIcon size={11} strokeWidth={2.4} />
                      {cfg.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onViewDetail?.(c)}
                        className="p-1.5 rounded-md text-gray-500 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                        title="Ver detalle"
                      >
                        <Eye size={15} />
                      </button>
                      {(c.status === 'active' || c.status === 'overdue') && (
                        <button
                          type="button"
                          onClick={() => onPay?.(c)}
                          className="
                            inline-flex items-center gap-1 h-7 px-2.5 rounded-md
                            text-[11px] font-semibold
                            text-white bg-brand-blue hover:bg-blue-700 transition-colors
                          "
                        >
                          <HandCoins size={11} strokeWidth={2.4} />
                          Cobrar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {total > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-dark-border">
          <div className="text-xs text-gray-500 dark:text-dark-muted">
            {start}–{end} de {total}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-md text-gray-500 hover:text-brand-black dark:hover:text-dark-text disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-medium text-brand-black dark:text-dark-text px-2">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-md text-gray-500 hover:text-brand-black dark:hover:text-dark-text disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}

function Th({ children, align = 'left', onClick, sort, field }) {
  const isSorted = sort?.field === field
  return (
    <th
      className={`
        px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider
        text-gray-500 dark:text-dark-muted
        ${align === 'right' ? 'text-right' : 'text-left'}
        ${onClick ? 'cursor-pointer select-none hover:text-brand-black dark:hover:text-dark-text' : ''}
      `}
      onClick={onClick}
    >
      <span className={`inline-flex items-center gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        {children}
        {onClick && (
          <ArrowUpDown
            size={11}
            className={isSorted ? 'text-brand-blue' : 'text-gray-400'}
          />
        )}
      </span>
    </th>
  )
}