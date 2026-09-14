import { MoreHorizontal, Warehouse, Pencil, History, Plus, Printer, Boxes, SlidersHorizontal } from 'lucide-react'
import Card from '../../common/Card'
import Badge from '../../common/Badge'
import Button from '../../common/Button'
import IconButton from '../../common/IconButton'
import Dropdown, { DropdownItem } from '../../common/Dropdown'

export default function ProductDetailVariantsTab({
  product,
  variants = [],
  onEditVariant,
  onViewInventory,
  onViewMovements,
  onAdjustStock,
  onAddStock,
  onPrintLabels,
}) {
  const min = Number(product?.minStock) || 3

  return (
    <Card padded={false}>
      <div className="p-5 lg:p-6 pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Variantes del producto
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Administra y consulta las variantes disponibles de {product?.name || 'este producto'}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            icon={SlidersHorizontal}
            onClick={() => onAdjustStock?.()}
            disabled={variants.length === 0}
          >
            Ajustar inventario
          </Button>
          <Button
            variant="secondary"
            icon={Printer}
            onClick={() => onPrintLabels?.()}
            disabled={variants.length === 0}
          >
            Imprimir etiquetas
          </Button>
        </div>
      </div>

      {variants.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-dark-muted px-5 lg:px-6 py-8">
          Este producto todavía no tiene variantes.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-y border-gray-100 dark:border-dark-border bg-gray-50/60 dark:bg-dark-surface/60">
                {['Variante', 'Talla', 'Color', 'SKU', 'Código', 'Stock', 'Mínimo', 'Estado', ''].map((h, i) => (
                  <th key={i} className="text-left px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted whitespace-nowrap">
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
                  : { label: 'Activo', variant: 'success' }
                return (
                  <tr key={v.id} className="border-b border-gray-100 dark:border-dark-border last:border-0">
                    <td className="px-5 py-3 text-brand-black dark:text-dark-text font-medium whitespace-nowrap">{v.label}</td>
                    <td className="px-5 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">{v.size}</td>
                    <td className="px-5 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">{v.color}</td>
                    <td className="px-5 py-3 text-gray-700 dark:text-dark-muted text-xs font-mono whitespace-nowrap">{v.sku || '—'}</td>
                    <td className="px-5 py-3 text-gray-700 dark:text-dark-muted text-xs font-mono whitespace-nowrap">{v.barcode || '—'}</td>
                    <td className="px-5 py-3 text-brand-black dark:text-dark-text font-semibold whitespace-nowrap">{v.stock}</td>
                    <td className="px-5 py-3 text-gray-700 dark:text-dark-muted whitespace-nowrap">{min}</td>
                    <td className="px-5 py-3 whitespace-nowrap"><Badge variant={badge.variant}>{badge.label}</Badge></td>
                    <td className="px-5 py-3">
                      <Dropdown
                        align="right"
                        trigger={<IconButton icon={MoreHorizontal} label="Acciones" />}
                      >
                        <DropdownItem icon={Warehouse} onClick={() => onViewInventory?.(v.id)}>Ver inventario</DropdownItem>
                        <DropdownItem icon={Pencil} onClick={() => onEditVariant?.(v.id)}>Editar variante</DropdownItem>
                        <DropdownItem icon={SlidersHorizontal} onClick={() => onAdjustStock?.(v.id)}>Ajustar inventario</DropdownItem>
                        <DropdownItem icon={History} onClick={() => onViewMovements?.(v.id)}>Ver movimientos</DropdownItem>
                      </Dropdown>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}