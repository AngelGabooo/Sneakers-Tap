import { Plus, Download, MoreHorizontal } from 'lucide-react'
import Button from '../common/Button'

export default function UsersHeader({ onNew, onExport, onMore }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-dark-muted mb-2" aria-label="Breadcrumb">
          <span>Usuarios</span>
          <span className="text-gray-300 dark:text-dark-border">/</span>
          <span className="text-brand-black dark:text-dark-text font-medium">Usuarios y empleados</span>
        </nav>
        <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
          Usuarios y empleados
        </h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-1 max-w-xl">
          Administra las cuentas de acceso y la información de los empleados de Sneakers.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button variant="secondary" icon={Download} onClick={onExport} className="hidden sm:inline-flex">
          Exportar
        </Button>
        <Button variant="primary" icon={Plus} onClick={onNew}>
          Nuevo empleado
        </Button>
        {onMore && (
          <button
            type="button"
            onClick={onMore}
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-600 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-card transition-colors"
            aria-label="Más acciones"
          >
            <MoreHorizontal size={18} />
          </button>
        )}
      </div>
    </div>
  )
}