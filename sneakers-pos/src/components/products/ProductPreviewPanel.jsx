import { Package } from 'lucide-react'
import Card from '../common/Card'
import Badge from '../common/Badge'

export default function ProductPreviewPanel({ preview }) {
  const statusLabel =
    preview.status === 'active'   ? 'Activo'
    : preview.status === 'draft'  ? 'Borrador'
    : 'Inactivo'

  const statusVariant =
    preview.status === 'active' ? 'success'
    : preview.status === 'draft' ? 'warning'
    : 'neutral'

  return (
    <Card>
      <header className="mb-4">
        <h2 className="text-base font-semibold text-brand-black dark:text-dark-text">
          Vista previa
        </h2>
      </header>

      <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-dark-border">
        <div className="aspect-square bg-gray-50 dark:bg-dark-surface flex items-center justify-center">
          {preview.imageUrl ? (
            <img src={preview.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <Package size={36} className="text-gray-300 dark:text-dark-border" strokeWidth={1.5} />
          )}
        </div>
      </div>

      <div className="mt-3">
        <p className="text-sm font-semibold text-brand-black dark:text-dark-text truncate">
          {preview.name || 'Nombre del producto'}
        </p>
        <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
          {preview.brand || 'Marca'}
        </p>
        <p className="text-base font-bold text-brand-black dark:text-dark-text mt-1.5">
          {preview.price || '$0.00'}
        </p>
        <div className="mt-2">
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </div>
      </div>
    </Card>
  )
}