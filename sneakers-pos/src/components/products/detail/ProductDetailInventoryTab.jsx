import { Warehouse, Plus } from 'lucide-react'
import Card from '../../common/Card'
import Badge from '../../common/Badge'
import Button from '../../common/Button'

export default function ProductDetailInventoryTab({
  product,
  variants = [],
  onViewMovements,
  onAdjustInventory,
}) {
  const min = Number(product?.minStock) || 3
  const totalStock = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
  const lowCount = variants.filter((v) => v.stock > 0 && v.stock <= min).length
  const outCount = variants.filter((v) => v.stock === 0).length

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricBox label="Stock total"  value={totalStock} tone="info" />
        <MetricBox label="Disponible"   value={totalStock} tone="info" />
        <MetricBox label="Reservado"    value={0}          tone="info" />
        <MetricBox label="Stock bajo"   value={`${lowCount} variante${lowCount === 1 ? '' : 's'}`} tone={lowCount ? 'warning' : 'info'} />
        <MetricBox label="Agotado"      value={`${outCount} variante${outCount === 1 ? '' : 's'}`} tone={outCount ? 'danger' : 'info'} />
      </div>

      <Card padded={false}>
        <div className="p-5 lg:p-6 pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
              Inventario por variante
            </h2>
            <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
              Consulta el stock, ubicación y último movimiento de cada variante.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" icon={Warehouse} onClick={onViewMovements}>Ver movimientos</Button>
            <Button variant="primary" icon={Plus} onClick={() => onAdjustInventory?.()}>Ajustar inventario</Button>
          </div>
        </div>

        {variants.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-dark-muted px-5 lg:px-6 py-8">
            Este producto no tiene inventario registrado.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]">
              <thead>
                <tr className="border-y border-gray-100 dark:border-dark-border bg-gray-50/60 dark:bg-dark-surface/60">
                  {['Variante', 'Ubicación', 'Stock', 'Mínimo', 'Último movimiento', 'Estado'].map((h) => (
                    <th key={h} className="text-left px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => {
                  const badge =
                    v.stock === 0 ? { label: 'Agotado', variant: 'danger' }
                    : v.stock <= min ? { label: 'Stock bajo', variant: 'warning' }
                    : { label: 'Normal', variant: 'success' }
                  return (
                    <tr
                      key={v.id}
                      className="border-b border-gray-100 dark:border-dark-border last:border-0 hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors"
                    >
                      <td className="px-5 py-3 text-brand-black dark:text-dark-text font-medium whitespace-nowrap">
                        <button
                          onClick={() => onAdjustInventory?.(v.id)}
                          className="hover:text-brand-blue transition-colors"
                          title="Ajustar inventario de esta variante"
                        >
                          {v.label}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">{product?.location || 'Sin asignar'}</td>
                      <td className="px-5 py-3 text-brand-black dark:text-dark-text font-semibold whitespace-nowrap">{v.stock}</td>
                      <td className="px-5 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">{min}</td>
                      <td className="px-5 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">—</td>
                      <td className="px-5 py-3 whitespace-nowrap"><Badge variant={badge.variant}>{badge.label}</Badge></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

function MetricBox({ label, value, tone = 'info' }) {
  const tones = {
    info:    'text-brand-blue bg-blue-50 dark:bg-blue-950/40',
    warning: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
    danger:  'text-brand-red bg-red-50 dark:bg-red-950/40',
  }
  return (
    <div className="rounded-lg border border-gray-100 dark:border-dark-border p-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${tones[tone]}`}>
        <Warehouse size={14} strokeWidth={2} />
      </div>
      <p className="text-xs text-gray-500 dark:text-dark-muted">{label}</p>
      <p className="text-base font-bold text-brand-black dark:text-dark-text leading-tight">{value}</p>
    </div>
  )
}