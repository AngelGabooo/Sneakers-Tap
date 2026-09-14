import { Search, Filter, RotateCcw, Columns } from 'lucide-react'
import Button from '../../common/Button'

export default function SalesHistoryToolbar({
  search, onSearchChange,
  onToggleFilters, filtersActive, onClearFilters,
  onToggleColumns,
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
          placeholder="Buscar por número de venta, cliente, teléfono, vendedor, producto, SKU o comprobante..."
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

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={filtersActive ? 'outline' : 'secondary'}
          icon={Filter}
          onClick={onToggleFilters}
        >
          Filtros
        </Button>

        <Button variant="secondary" icon={Columns} onClick={onToggleColumns}>
          <span className="hidden sm:inline">Columnas</span>
        </Button>

        {(search || filtersActive) && (
          <Button variant="ghost" icon={RotateCcw} onClick={onClearFilters}>
            Limpiar
          </Button>
        )}
      </div>
    </div>
  )
}