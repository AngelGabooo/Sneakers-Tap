import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from '../../common/Button'

export default function CashHistoryPagination({
  page = 1, perPage = 20, total = 0, onPageChange, onPerPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const start = total === 0 ? 0 : (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)

  const pages = []
  const maxButtons = 5
  let from = Math.max(1, page - Math.floor(maxButtons / 2))
  let to = Math.min(totalPages, from + maxButtons - 1)
  if (to - from + 1 < maxButtons) from = Math.max(1, to - maxButtons + 1)
  for (let i = from; i <= to; i++) pages.push(i)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-t border-gray-100 dark:border-dark-border">
      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-dark-muted">
        <span>
          Mostrando <span className="font-medium text-brand-black dark:text-dark-text">{start}</span>–<span className="font-medium text-brand-black dark:text-dark-text">{end}</span> de <span className="font-medium text-brand-black dark:text-dark-text">{total}</span> sesiones
        </span>

        <select
          value={perPage}
          onChange={(e) => onPerPageChange?.(Number(e.target.value))}
          className="h-8 px-2 rounded-lg text-xs font-medium bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-brand-black dark:text-dark-text outline-none cursor-pointer"
        >
          <option value={20}>20 por página</option>
          <option value={50}>50 por página</option>
          <option value={100}>100 por página</option>
        </select>
      </div>

      <div className="flex items-center gap-1">
        <Button size="sm" variant="secondary" icon={ChevronLeft} disabled={page <= 1} onClick={() => onPageChange?.(page - 1)}>
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        <div className="hidden sm:flex items-center gap-1">
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange?.(p)}
              className={`
                w-8 h-8 rounded-lg text-sm font-medium transition-colors
                ${p === page
                  ? 'bg-brand-blue text-white'
                  : 'text-gray-600 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-surface'}
              `}
            >
              {p}
            </button>
          ))}
        </div>

        <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange?.(page + 1)}>
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight size={16} className="sm:hidden" />
        </Button>
      </div>
    </div>
  )
}