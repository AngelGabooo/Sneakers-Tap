import { Pencil, Eye } from 'lucide-react'
import Card from '../../common/Card'
import Badge from '../../common/Badge'
import Button from '../../common/Button'

export default function ProductDetailSummaryTab({
  product,
  variants,
  onEdit,
  onViewVariantTab,
}) {
  const purchase = Number(product?.costPrice) || 0
  const sale = Number(product?.salePrice) || 0
  const margin = sale > 0 ? sale - purchase : 0
  const marginPct = sale > 0 ? ((margin / sale) * 100).toFixed(2) : '0.00'

  const totalStock = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Columna principal */}
      <div className="lg:col-span-2 space-y-5">
        {/* Información del producto */}
        <Card>
          <header className="flex items-start justify-between mb-4 gap-3">
            <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
              Información del producto
            </h2>
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
            >
              <Pencil size={12} strokeWidth={2.2} />
              Editar información
            </button>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Nombre"       value={product?.name} />
            <Field label="Categoría"    value={product?.category} />
            <Field label="Marca"        value={product?.brand} />
            <Field label="SKU principal" value={product?.sku} mono />
            <Field label="Código de barras" value={product?.barcode} mono />
            <Field label="Fecha de creación"
              value={product?.createdAt ? new Date(product.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
            />
            <Field label="Última actualización"
              value={product?.updatedAt ? new Date(product.updatedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
            />
            <Field label="Actualizado por" value={product?.updatedBy} />
          </div>

          {product?.description && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
              <p className="text-xs text-gray-500 dark:text-dark-muted mb-1">Descripción</p>
              <p className="text-sm text-brand-black dark:text-dark-text leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
        </Card>

        {/* Precios */}
        <Card>
          <header className="flex items-start justify-between mb-4 gap-3">
            <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
              Precios
            </h2>
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
            >
              <Pencil size={12} strokeWidth={2.2} />
              Editar precios
            </button>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PriceBox label="Precio de compra" value={purchase} />
            <PriceBox label="Precio de venta"  value={sale} accent />
            <PriceBox label="Precio de mayoreo" value={Number(product?.wholesalePrice) || 0} />
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-dark-muted">Margen estimado</p>
              <p className="text-lg font-bold text-brand-black dark:text-dark-text">
                ${margin.toLocaleString('es-MX')}{' '}
                <span className="text-sm font-medium text-brand-blue">({marginPct}%)</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Variantes destacadas */}
        <Card padded={false}>
          <div className="p-5 lg:p-6 pb-0 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
                Variantes
              </h2>
              <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
                {variants.length} {variants.length === 1 ? 'variante' : 'variantes'}
              </p>
            </div>
            {variants.length > 0 && (
              <button
                onClick={onViewVariantTab}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
              >
                <Eye size={12} strokeWidth={2.2} />
                Ver todas
              </button>
            )}
          </div>

          {variants.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-dark-muted px-5 lg:px-6 py-6">
              Este producto todavía no tiene variantes.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="border-y border-gray-100 dark:border-dark-border bg-gray-50/60 dark:bg-dark-surface/60">
                    {['Variante', 'SKU', 'Stock', 'Estado'].map((h) => (
                      <th key={h} className="text-left px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => {
                    const min = Number(product?.minStock) || 3
                    const badge =
                      v.stock === 0 ? { label: 'Agotado', variant: 'danger' }
                      : v.stock <= min ? { label: 'Stock bajo', variant: 'warning' }
                      : { label: 'Activo', variant: 'success' }
                    return (
                      <tr key={v.id} className="border-b border-gray-100 dark:border-dark-border last:border-0">
                        <td className="px-5 py-2.5 text-brand-black dark:text-dark-text font-medium whitespace-nowrap">{v.label}</td>
                        <td className="px-5 py-2.5 text-gray-700 dark:text-dark-muted text-xs font-mono whitespace-nowrap">{v.sku || '—'}</td>
                        <td className="px-5 py-2.5 text-brand-black dark:text-dark-text font-semibold whitespace-nowrap">{v.stock}</td>
                        <td className="px-5 py-2.5 whitespace-nowrap"><Badge variant={badge.variant}>{badge.label}</Badge></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Panel lateral */}
      <aside className="lg:col-span-1 space-y-5 lg:sticky lg:top-20 lg:self-start">
        {/* Inventario */}
        <Card>
          <header className="flex items-start justify-between mb-4 gap-3">
            <h2 className="text-base font-semibold text-brand-black dark:text-dark-text">Inventario</h2>
          </header>

          <ul className="space-y-2.5">
            <Row label="Stock total"      value={totalStock} />
            <Row label="Stock mínimo"     value={product?.minStock ?? 3} />
            <Row label="Variantes activas" value={variants.length} />
            <Row label="Ubicación"        value={product?.location || 'Sin asignar'} />
          </ul>

          <div className="mt-4">
            <Button variant="secondary" className="w-full" onClick={onViewVariantTab}>
              Ver inventario
            </Button>
          </div>
        </Card>

        {/* Proveedor */}
        <Card>
          <h2 className="text-base font-semibold text-brand-black dark:text-dark-text mb-3">
            Proveedor
          </h2>
          {product?.supplier ? (
            <>
              <p className="text-sm font-medium text-brand-black dark:text-dark-text">
                {product.supplier}
              </p>
              <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">
                Proveedor principal
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-dark-muted">
              Sin proveedor asignado
            </p>
          )}
        </Card>
      </aside>
    </div>
  )
}

function Field({ label, value, mono = false }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-gray-500 dark:text-dark-muted">{label}</p>
      <p className={`text-sm font-medium text-brand-black dark:text-dark-text truncate ${mono ? 'font-mono text-xs' : ''}`}>
        {value || '—'}
      </p>
    </div>
  )
}

function PriceBox({ label, value, accent = false }) {
  return (
    <div className={`rounded-lg border p-3 ${accent ? 'border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20' : 'border-gray-100 dark:border-dark-border'}`}>
      <p className="text-xs text-gray-500 dark:text-dark-muted">{label}</p>
      <p className={`text-lg font-bold mt-1 ${accent ? 'text-brand-blue' : 'text-brand-black dark:text-dark-text'}`}>
        ${Number(value).toLocaleString('es-MX')}
      </p>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <li className="flex items-center justify-between gap-3 text-sm">
      <span className="text-gray-500 dark:text-dark-muted">{label}</span>
      <span className="font-medium text-brand-black dark:text-dark-text">{value}</span>
    </li>
  )
}