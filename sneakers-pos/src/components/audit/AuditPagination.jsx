// src/components/audit/AuditPagination.jsx
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function AuditPagination({
  page = 1,
  perPage = 25,
  total = 0,
  onPageChange,
  onPerPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const from = total === 0 ? 0 : (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-dark-border">
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-dark-muted">
        <span>
          Mostrando <strong className="text-brand-black dark:text-dark-text">{from}-{to}</strong> de{' '}
          <strong className="text-brand-black dark:text-dark-text">{total}</strong>
        </span>
        <select
          value={perPage}
          onChange={(e) => onPerPageChange?.(Number(e.target.value))}
          className="h-8 px-2 rounded-md text-xs bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-brand-black dark:text-dark-text outline-none cursor-pointer"
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>{n} / pág.</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange?.(1)}
          disabled={page === 1}
          className="h-8 px-2 rounded-md text-xs border border-gray-200 dark:border-dark-border text-gray-600 dark:text-dark-muted disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-dark-surface"
        >
          «
        </button>
        <button
          type="button"
          onClick={() => onPageChange?.(Math.max(1, page - 1))}
          disabled={page === 1}
          className="h-8 px-2 rounded-md border border-gray-200 dark:border-dark-border text-gray-600 dark:text-dark-muted disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-dark-surface inline-flex items-center"
        >
          <ChevronLeft size={14} />
        </button>

        <span className="px-3 text-xs text-brand-black dark:text-dark-text">
          Página <strong>{page}</strong> de <strong>{totalPages}</strong>
        </span>

        <button
          type="button"
          onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="h-8 px-2 rounded-md border border-gray-200 dark:border-dark-border text-gray-600 dark:text-dark-muted disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-dark-surface inline-flex items-center"
        >
          <ChevronRight size={14} />
        </button>
        <button
          type="button"
          onClick={() => onPageChange?.(totalPages)}
          disabled={page === totalPages}
          className="h-8 px-2 rounded-md text-xs border border-gray-200 dark:border-dark-border text-gray-600 dark:text-dark-muted disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-dark-surface"
        >
          »
        </button>
      </div>
    </div>
  )
}