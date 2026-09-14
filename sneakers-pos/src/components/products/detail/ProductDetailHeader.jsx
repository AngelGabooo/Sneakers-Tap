import { ChevronRight, PackageX, Pencil, Warehouse, MoreHorizontal, Copy, Power, History, Trash2 } from 'lucide-react'
import Badge from '../../common/Badge'
import Button from '../../common/Button'
import IconButton from '../../common/IconButton'
import Dropdown, { DropdownItem } from '../../common/Dropdown'

const STATUS_VARIANT = {
  active:   { label: 'Activo',   variant: 'success' },
  draft:    { label: 'Borrador', variant: 'warning' },
  inactive: { label: 'Inactivo', variant: 'neutral' },
}

export default function ProductDetailHeader({
  product,
  onBack,
  onEdit,
  onViewInventory,
  onDuplicate,
  onToggleActive,
  onViewHistory,
  onDelete,
}) {
  const status = STATUS_VARIANT[product?.status] || STATUS_VARIANT.active
  const images = product?.images || []
  const mainImage = images[0]?.url

  return (
    <div className="mb-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm mb-4">
        <button
          onClick={onBack}
          className="text-gray-500 dark:text-dark-muted hover:text-brand-blue transition-colors font-medium"
        >
          Productos
        </button>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-brand-black dark:text-dark-text font-medium truncate max-w-[200px] sm:max-w-none">
          {product?.name || 'Detalle del producto'}
        </span>
      </nav>

      {/* Card principal del header */}
      <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-card overflow-hidden">
        <div className="p-5 lg:p-6">
          <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
            {/* Galería */}
            <div className="shrink-0 mx-auto lg:mx-0">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-xl overflow-hidden bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border flex items-center justify-center">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={product?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <PackageX size={36} className="text-gray-300 dark:text-dark-border" strokeWidth={1.4} />
                )}
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-1.5 mt-2 w-32 lg:w-40">
                  {images.slice(1, 5).map((img, i) => (
                    <div
                      key={img.id || i}
                      className="aspect-square rounded-md overflow-hidden bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border"
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info + acciones */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                {/* Título y meta */}
                <div className="min-w-0 text-center sm:text-left">
                  <h1 className="text-xl lg:text-2xl font-bold text-brand-black dark:text-dark-text tracking-tight break-words">
                    {product?.name || 'Sin nombre'}
                  </h1>

                  <div className="flex items-center gap-2 mt-2 flex-wrap justify-center sm:justify-start">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    {product?.category && (
                      <>
                        <span className="text-xs text-gray-400 dark:text-dark-muted">·</span>
                        <span className="text-xs text-gray-500 dark:text-dark-muted">
                          {product.category}
                        </span>
                      </>
                    )}
                    {product?.brand && (
                      <>
                        <span className="text-xs text-gray-400 dark:text-dark-muted">·</span>
                        <span className="text-xs text-gray-500 dark:text-dark-muted">
                          {product.brand}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 justify-center sm:justify-end shrink-0 flex-wrap">
                  <Button variant="primary" icon={Pencil} onClick={onEdit} size="md">
                    <span className="hidden sm:inline">Editar producto</span>
                    <span className="sm:hidden">Editar</span>
                  </Button>

                  <Button
                    variant="secondary"
                    icon={Warehouse}
                    onClick={onViewInventory}
                    size="md"
                  >
                    <span className="hidden sm:inline">Ver inventario</span>
                    <span className="sm:hidden">Inventario</span>
                  </Button>

                  <Dropdown
                    trigger={<IconButton icon={MoreHorizontal} label="Más acciones" />}
                  >
                    <DropdownItem icon={Copy}    onClick={onDuplicate}>Duplicar producto</DropdownItem>
                    <DropdownItem icon={Power}   onClick={onToggleActive}>
                      {product?.status === 'active' ? 'Desactivar producto' : 'Activar producto'}
                    </DropdownItem>
                    <DropdownItem icon={History} onClick={onViewHistory}>Ver historial</DropdownItem>
                    <DropdownItem icon={Trash2}  danger onClick={onDelete}>Eliminar producto</DropdownItem>
                  </Dropdown>
                </div>
              </div>

              {/* Datos clave */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 mt-5 pt-4 border-t border-gray-100 dark:border-dark-border">
                <InfoRow label="SKU" value={product?.sku} mono />
                <InfoRow label="Código de barras" value={product?.barcode} mono />
                <InfoRow
                  label="Precio de venta"
                  value={product?.salePrice ? `$${Number(product.salePrice).toLocaleString('es-MX')}` : null}
                  emphasis
                />
                <InfoRow
                  label="Stock total"
                  value={(() => {
                    const total = (product?.variants || []).reduce(
                      (acc, v) => acc + (Number(v.stock) || 0),
                      0,
                    )
                    return `${total} unidades`
                  })()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, mono = false, emphasis = false }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-dark-muted">
        {label}
      </p>
      <p
        className={`
          mt-0.5 truncate
          ${emphasis
            ? 'text-base font-bold text-brand-black dark:text-dark-text'
            : 'text-sm font-medium text-brand-black dark:text-dark-text'}
          ${mono ? 'font-mono text-xs' : ''}
        `}
      >
        {value || '—'}
      </p>
    </div>
  )
}