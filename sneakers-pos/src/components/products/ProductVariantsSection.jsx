import { Plus, X, Tags, Info, Boxes, Wand2, Printer } from 'lucide-react'
import { useState } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'
import VariantsLabelPrintModal from './VariantsLabelPrintModal'

const SIZE_OPTIONS = ['25', '26', '27', '28', '29', '30']
const COLOR_OPTIONS = ['Negro', 'Blanco', 'Gris', 'Rojo']

const COLOR_MAP = {
  Negro:  '#111827',
  Blanco: '#FFFFFF',
  Gris:   '#9CA3AF',
  Rojo:   '#DC2626',
}

/**
 * SKU único por variante.
 */
export function buildVariantSku(baseSku, size, color) {
  const colorCode = (color || 'GEN')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z]/g, '')
    .slice(0, 3)
    .toUpperCase() || 'GEN'

  const base = (baseSku || 'SKU').toUpperCase().replace(/\s+/g, '')
  return `${base}-${size}-${colorCode}`
}

/**
 * Código de barras único por variante.
 */
export function buildVariantBarcode(sku) {
  const seed = sku.replace(/[^A-Z0-9]/gi, '').toUpperCase()
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 1_000_000_000_000
  }
  const base12 = String(hash).padStart(12, '0').slice(0, 12)
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += i % 2 === 0 ? Number(base12[i]) : Number(base12[i]) * 3
  }
  return base12 + String((10 - (sum % 10)) % 10)
}

export default function ProductVariantsSection({
  sizes = [],
  colors = [],
  variants = [],
  baseSku = '',
  codeType = 'barcode',
  productName = '',
  productPrice = '',
  onChangeSizes,
  onChangeColors,
  onChangeVariantsBulk,
}) {
  const [newSize, setNewSize] = useState('')
  const [printOpen, setPrintOpen] = useState(false)

  // ---- Tallas ----
  const toggleSize = (s) => {
    const next = sizes.includes(s) ? sizes.filter((x) => x !== s) : [...sizes, s]
    onChangeSizes?.(next)
  }

  const addCustomSize = () => {
    const v = newSize.trim()
    if (!v || sizes.includes(v)) return
    onChangeSizes?.([...sizes, v])
    setNewSize('')
  }

  // ---- Colores ----
  const toggleColor = (c) => {
    const next = colors.includes(c) ? colors.filter((x) => x !== c) : [...colors, c]
    onChangeColors?.(next)
  }

  // ---- Stock masivo por talla ----
  const handleBulkStockBySize = (size, value) => {
    if (!onChangeVariantsBulk) return
    const num = Math.max(0, Number(value) || 0)
    onChangeVariantsBulk((list) =>
      list.map((v) => (v.size === size ? { ...v, stock: num } : v)),
    )
  }

  const handleStockByVariant = (id, value) => {
    if (!onChangeVariantsBulk) return
    const num = Math.max(0, Number(value) || 0)
    onChangeVariantsBulk((list) =>
      list.map((v) => (v.id === id ? { ...v, stock: num } : v)),
    )
  }

  // ---- Regenerar códigos ----
  const regenerateVariantCodes = (variant) => {
    if (!onChangeVariantsBulk) return
    const sku = buildVariantSku(baseSku, variant.size, variant.color)
    const barcode = buildVariantBarcode(sku)
    onChangeVariantsBulk((list) =>
      list.map((v) => (v.id === variant.id ? { ...v, sku, barcode } : v)),
    )
  }

  const regenerateAllCodes = () => {
    if (!baseSku || !onChangeVariantsBulk) return
    onChangeVariantsBulk((list) =>
      list.map((v) => {
        const sku = buildVariantSku(baseSku, v.size, v.color)
        return { ...v, sku, barcode: buildVariantBarcode(sku) }
      }),
    )
  }

  // Stock "compartido" por talla
  const stockBySize = {}
  sizes.forEach((size) => {
    const group = variants.filter((v) => v.size === size)
    if (group.length === 0) { stockBySize[size] = 0; return }
    const first = Number(group[0].stock) || 0
    stockBySize[size] = group.every((v) => (Number(v.stock) || 0) === first) ? first : ''
  })

  const totalStock = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)

  return (
    <>
      <Card>
        <header className="mb-5">
          <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Variantes del producto
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Selecciona varias tallas y colores. Cada combinación genera su propio SKU y código únicos.
          </p>
        </header>

        {!baseSku && (
          <div className="
            flex items-start gap-2 mb-5 p-3 rounded-lg
            bg-amber-50 dark:bg-amber-950/30
            border border-amber-200 dark:border-amber-900/50
            text-amber-800 dark:text-amber-300 text-xs
          ">
            <Info size={14} strokeWidth={2.2} className="mt-0.5 shrink-0" />
            <span>
              Primero define el <strong>SKU raíz</strong> en <strong>Identificación</strong>. Cada variante lo usará como base.
            </span>
          </div>
        )}

        {/* Tallas */}
        <div className="mb-5">
          <p className="text-sm font-medium text-brand-black dark:text-dark-text mb-2">
            Tallas
          </p>
          <div className="flex flex-wrap gap-2">
            {SIZE_OPTIONS.map((s) => {
              const active = sizes.includes(s)
              return (
                <button
                  key={s}
                  type="button"
                  disabled={!baseSku}
                  onClick={() => toggleSize(s)}
                  className={`
                    h-9 min-w-[44px] px-3 rounded-lg text-sm font-medium border
                    transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                    ${active
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-white dark:bg-dark-card text-gray-700 dark:text-dark-muted border-gray-200 dark:border-dark-border hover:border-brand-blue hover:text-brand-blue'}
                  `}
                >
                  {s}
                </button>
              )
            })}

            {sizes.filter((s) => !SIZE_OPTIONS.includes(s)).map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 h-9 px-3 rounded-lg text-sm font-medium bg-brand-blue text-white border border-brand-blue"
              >
                {s}
                <button
                  onClick={() => toggleSize(s)}
                  className="hover:bg-white/20 rounded p-0.5"
                  aria-label={`Quitar talla ${s}`}
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-3 max-w-xs">
            <input
              type="text"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSize())}
              placeholder="Agregar talla (ej. 31)"
              className="
                flex-1 h-9 px-3 rounded-lg text-sm
                bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                border border-gray-200 dark:border-dark-border
                focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40
                outline-none
              "
            />
            <Button size="sm" variant="secondary" icon={Plus} onClick={addCustomSize}>
              Agregar
            </Button>
          </div>
        </div>

        {/* Colores */}
        <div className="mb-5">
          <p className="text-sm font-medium text-brand-black dark:text-dark-text mb-2">
            Colores
          </p>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => {
              const active = colors.includes(c)
              return (
                <button
                  key={c}
                  type="button"
                  disabled={!baseSku}
                  onClick={() => toggleColor(c)}
                  className={`
                    inline-flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-medium border
                    transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                    ${active
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-white dark:bg-dark-card text-gray-700 dark:text-dark-muted border-gray-200 dark:border-dark-border hover:border-brand-blue hover:text-brand-blue'}
                  `}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/10"
                    style={{ backgroundColor: COLOR_MAP[c] || '#ccc' }}
                  />
                  {c}
                </button>
              )
            })}
          </div>
        </div>

        {/* Stock masivo por talla */}
        {sizes.length > 0 && colors.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <Boxes size={15} className="text-brand-blue" strokeWidth={2} />
              <p className="text-sm font-medium text-brand-black dark:text-dark-text">
                Inventario masivo por talla
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-dark-muted mb-3">
              Escribe los pares por talla. Se aplicará a todos los colores seleccionados.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {sizes.map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/40"
                >
                  <span className="inline-flex items-center justify-center h-9 min-w-[44px] px-2 rounded-md bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-sm font-semibold text-brand-black dark:text-dark-text">
                    {s}
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={stockBySize[s] ?? ''}
                    onChange={(e) => handleBulkStockBySize(s, e.target.value)}
                    placeholder="0"
                    className="
                      flex-1 h-9 px-2 rounded-md text-sm text-center font-semibold
                      bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                      border border-gray-200 dark:border-dark-border
                      focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40
                      outline-none
                    "
                  />
                  <span className="text-xs text-gray-400 dark:text-dark-muted shrink-0">pares</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Variantes generadas */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Tags size={15} className="text-brand-blue" strokeWidth={2} />
              <p className="text-sm font-medium text-brand-black dark:text-dark-text">
                Variantes generadas
              </p>
              <span className="text-xs text-gray-500 dark:text-dark-muted">
                ({variants.length})
              </span>
              {totalStock > 0 && (
                <span className="text-xs text-gray-500 dark:text-dark-muted">
                  · {totalStock} pares en total
                </span>
              )}
            </div>

            {variants.length > 0 && baseSku && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={regenerateAllCodes}
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
                >
                  <Wand2 size={12} strokeWidth={2.2} />
                  Regenerar códigos
                </button>
                <button
                  type="button"
                  onClick={() => setPrintOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
                >
                  <Printer size={12} strokeWidth={2.2} />
                  Imprimir etiquetas
                </button>
              </div>
            )}
          </div>

          {variants.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-dark-muted py-4">
              Selecciona tallas y colores para generar las variantes.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-dark-border">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="bg-gray-50/60 dark:bg-dark-surface/60 border-b border-gray-100 dark:border-dark-border">
                    {['Variante', 'SKU', 'Código', 'Stock', ''].map((h, i) => (
                      <th
                        key={i}
                        className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => (
                    <tr
                      key={v.id}
                      className="border-b border-gray-100 dark:border-dark-border last:border-0"
                    >
                      <td className="px-3 py-2 text-brand-black dark:text-dark-text font-medium whitespace-nowrap">
                        {v.label}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-dark-muted text-xs font-mono whitespace-nowrap">
                        {v.sku || '—'}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-dark-muted text-xs font-mono whitespace-nowrap">
                        {v.barcode || '—'}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={0}
                          value={v.stock}
                          onChange={(e) => handleStockByVariant(v.id, e.target.value)}
                          className="
                            w-20 h-8 px-2 rounded-md text-xs text-center font-semibold
                            bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                            border border-gray-200 dark:border-dark-border
                            focus:border-brand-blue outline-none
                          "
                        />
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => regenerateVariantCodes(v)}
                          disabled={!baseSku}
                          className="
                            inline-flex items-center gap-1 text-xs font-medium
                            text-brand-blue hover:underline
                            disabled:opacity-40 disabled:cursor-not-allowed
                          "
                          title={baseSku ? 'Regenerar SKU y código' : 'Falta SKU base'}
                        >
                          <Wand2 size={12} strokeWidth={2.2} />
                          Regenerar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Modal de impresión en lote */}
      <VariantsLabelPrintModal
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        product={{
          name: productName,
          salePrice: productPrice,
        }}
        variants={variants}
        codeType={codeType}
      />
    </>
  )
}