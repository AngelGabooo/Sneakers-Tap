import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function UsersPagination({
  page = 1,
  perPage = 10,
  total = 0,
  onPageChange,
  onPerPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const from = total === 0 ? 0 : (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)

  const pages = []
  for (let i = 1; i <= totalPages && i <= 5; i++) pages.push(i)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-dark-border">
      <p className="text-sm text-gray-500 dark:text-dark-muted">
        Mostrando{' '}
        <span className="font-medium text-brand-black dark:text-dark-text">{from}–{to}</span>{' '}
        de{' '}
        <span className="font-medium text-brand-black dark:text-dark-text">{total}</span> usuarios
      </p>

      <div className="flex items-center gap-3">
        <select
          value={perPage}
          onChange={(e) => onPerPageChange?.(Number(e.target.value))}
          className="h-9 px-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm text-brand-black dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          aria-label="Usuarios por página"
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>{n} / página</option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-dark-border text-gray-600 dark:text-dark-muted disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-dark-card transition-colors"
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
          </button>

          {pages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange?.(p)}
              className={`h-9 min-w-[36px] px-2 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-brand-blue text-white'
                  : 'border border-gray-200 dark:border-dark-border text-gray-700 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-card'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange?.(page + 1)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-dark-border text-gray-600 dark:text-dark-muted disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-dark-card transition-colors"
            aria-label="Página siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}