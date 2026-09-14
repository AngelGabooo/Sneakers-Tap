import { Search, Filter, RotateCcw, List, LayoutGrid } from 'lucide-react'
import Button from '../common/Button'
import IconButton from '../common/IconButton'

export default function WholesaleToolbar({
  search, onSearchChange,
  onToggleFilters, filtersActive, onClearFilters,
  view, onViewChange,
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-3">
      <div className="relative flex-1">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
          <Search size={17} strokeWidth={1.8} />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Buscar por nombre, empresa, teléfono, correo o número de cliente..."
          className="w-full h-10 pl-9 pr-3 rounded-lg text-sm bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 outline-none placeholder:text-gray-400 dark:placeholder:text-dark-muted transition-all duration-150"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={filtersActive ? 'outline' : 'secondary'}
          icon={Filter}
          onClick={onToggleFilters}
        >
          Filtrar
        </Button>

        {(search || filtersActive) && (
          <Button variant="ghost" icon={RotateCcw} onClick={onClearFilters}>
            Limpiar
          </Button>
        )}

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
            label="Vista tarjetas"
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