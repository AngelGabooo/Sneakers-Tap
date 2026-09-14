import { Plus, FolderTree } from 'lucide-react'
import Button from '../common/Button'

export default function ProductsHeader({ onNew, onManageCatalog }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
          Productos
        </h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
          Administra el catálogo de productos de Sneakers
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          icon={FolderTree}
          onClick={onManageCatalog}
          className="hidden sm:inline-flex"
        >
          Categorías y marcas
        </Button>

        <Button variant="primary" icon={Plus} onClick={onNew}>
          Nuevo producto
        </Button>
      </div>
    </div>
  )
}