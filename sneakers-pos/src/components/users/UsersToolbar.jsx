import { Search, SlidersHorizontal, Columns3 } from 'lucide-react'

export default function UsersToolbar({
  search,
  onSearchChange,
  onToggleFilters,
  filtersActive = false,
  onColumns,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-3">
      <div className="relative flex-1">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-muted pointer-events-none"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Buscar por nombre, correo, teléfono, empleado o usuario..."
          className="
            w-full h-11 pl-10 pr-4 rounded-lg
            bg-white dark:bg-dark-surface
            border border-gray-200 dark:border-dark-border
            text-sm text-brand-black dark:text-dark-text
            placeholder:text-gray-400 dark:placeholder:text-dark-muted
            focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue
            transition-colors
          "
          aria-label="Buscar usuarios"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleFilters}
          className={`
            inline-flex items-center gap-2 h-11 px-4 rounded-lg border text-sm font-medium transition-colors
            ${filtersActive
              ? 'bg-blue-50 border-brand-blue text-brand-blue dark:bg-blue-950/40 dark:border-blue-700 dark:text-blue-300'
              : 'bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border text-gray-700 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-card'}
          `}
        >
          <SlidersHorizontal size={16} strokeWidth={2} />
          Filtros
          {filtersActive && <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-brand-blue" />}
        </button>

        {onColumns && (
          <button
            type="button"
            onClick={onColumns}
            className="
              inline-flex items-center gap-2 h-11 px-3 rounded-lg border
              bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border
              text-gray-600 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-card
              text-sm font-medium transition-colors
            "
            aria-label="Configurar columnas"
          >
            <Columns3 size={16} strokeWidth={2} />
            <span className="hidden sm:inline">Columnas</span>
          </button>
        )}
      </div>
    </div>
  )
}