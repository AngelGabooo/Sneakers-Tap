import { BarChart3 } from 'lucide-react'
import Card from '../common/Card'

export default function ReportsEmpty({ onClearFilters }) {
  return (
    <Card>
      <div className="flex flex-col items-center text-center py-12 px-6">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-surface flex items-center justify-center mb-4">
          <BarChart3 size={26} className="text-gray-400 dark:text-dark-muted" strokeWidth={1.8} />
        </div>
        <h3 className="text-base font-semibold text-brand-black dark:text-dark-text">
          No hay datos para este periodo
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-2 max-w-sm">
          Prueba con un periodo diferente o modifica los filtros.
        </p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-5 text-sm font-medium text-brand-blue hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </Card>
  )
}