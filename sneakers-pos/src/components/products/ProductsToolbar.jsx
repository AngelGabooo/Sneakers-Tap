import { Search, Filter, Download, List, LayoutGrid } from 'lucide-react'
import Button from '../common/Button'
import IconButton from '../common/IconButton'

export default function ProductsToolbar({
  search, onSearchChange,
  onToggleFilters, filtersActive = false,
  onExport,
  view, onViewChange,
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-3">
      {/* Búsqueda */}
      <div className="relative flex-1">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
          <Search size={17} strokeWidth={1.8} />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Buscar por nombre, SKU o código de barras..."
          className="
            w-full h-10 pl-9 pr-3 rounded-lg text-sm
            bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
            border border-gray-200 dark:border-dark-border
            focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40
            outline-none placeholder:text-gray-400 dark:placeholder:text-dark-muted
            transition-all duration-150
          "
        />
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={filtersActive ? 'outline' : 'secondary'}
          icon={Filter}
          onClick={onToggleFilters}
        >
          Filtros
        </Button>

        <Button variant="secondary" icon={Download} onClick={onExport}>
          <span className="hidden sm:inline">Exportar</span>
        </Button>

        {/* Vista Lista / Cuadrícula */}
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card p-0.5">
          <IconButton
            icon={List}
            size="sm"
            label="Vista lista"
            onClick={() => onViewChange?.('list')}
            className={view === 'list'
              ? '!bg-blue-50 !text-brand-blue dark:!bg-blue-950/40 dark:!text-blue-300'
              : ''}
          />
          <IconButton
            icon={LayoutGrid}
            size="sm"
            label="Vista cuadrícula"
            onClick={() => onViewChange?.('grid')}
            className={view === 'grid'
              ? '!bg-blue-50 !text-brand-blue dark:!bg-blue-950/40 dark:!text-blue-300'
              : ''}
          />
        </div>
      </div>
    </div>
  )
} 