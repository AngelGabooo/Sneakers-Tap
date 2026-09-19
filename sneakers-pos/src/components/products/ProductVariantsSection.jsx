// src/components/products/ProductVariantsSection.jsx
import { Plus, X, Tags, Info, Boxes, Wand2, Printer, Trash2 } from 'lucide-react'
import { useState } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'
import VariantsLabelPrintModal from './VariantsLabelPrintModal'

const SIZE_OPTIONS = ['25', '26', '27', '28', '29', '30']
const COLOR_OPTIONS = ['Negro', 'Blanco', 'Gris', 'Rojo']

// Mapa de colores predefinidos → hex
const COLOR_MAP = {
  Negro:  '#111827',
  Blanco: '#FFFFFF',
  Gris:   '#9CA3AF',
  Rojo:   '#DC2626',
}

/**
 * Paleta de colores disponibles para colores personalizados.
 * Se asignan de forma determinista por hash del nombre.
 */
const CUSTOM_COLOR_PALETTE = [
  '#1E40AF', // azul marino
  '#0891B2', // cyan
  '#047857', // verde oscuro
  '#65A30D', // verde lima
  '#CA8A04', // mostaza
  '#EA580C', // naranja
  '#BE185D', // rosa
  '#7C3AED', // violeta
  '#78350F', // café
  '#A16207', // dorado
  '#0F766E', // teal
  '#4338CA', // índigo
  '#B45309', // ámbar
  '#15803D', // verde
  '#831843', // vino
  '#1F2937', // gris oscuro
]

/**
 * Devuelve un color HEX determinista para un nombre de color.
 */
function getColorHex(name) {
  if (COLOR_MAP[name]) return COLOR_MAP[name]
  if (!name) return '#ccc'
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return CUSTOM_COLOR_PALETTE[hash % CUSTOM_COLOR_PALETTE.length]
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
  variantsBySize = {},
  variants = [],
  baseSku = '',
  codeType = 'barcode',
  productName = '',
  productPrice = '',
  onChangeVariantsBySize,
  onChangeVariantsBulk,
}) {
  const [newSize, setNewSize] = useState('')
  const [printOpen, setPrintOpen] = useState(false)

  // Estado para el input de color personalizado por talla
  // { [size]: string }
  const [customColorBySize, setCustomColorBySize] = useState({})

  const sizes = Object.keys(variantsBySize)

  // -------------------------------------------------------------
  // Tallas
  // -------------------------------------------------------------
  const addSize = (size) => {
    if (!size || variantsBySize[size]) return
    onChangeVariantsBySize?.({
      ...variantsBySize,
      [size]: [],
    })
  }

  const toggleSizeOption = (size) => {
    if (variantsBySize[size]) {
      const next = { ...variantsBySize }
      delete next[size]
      onChangeVariantsBySize?.(next)
    } else {
      addSize(size)
    }
  }

  const addCustomSize = () => {
    const v = newSize.trim()
    if (!v || variantsBySize[v]) return
    addSize(v)
    setNewSize('')
  }

  const removeSize = (size) => {
    const next = { ...variantsBySize }
    delete next[size]
    onChangeVariantsBySize?.(next)
  }

  // -------------------------------------------------------------
  // Colores por talla
  // -------------------------------------------------------------
  const toggleColorInSize = (size, color) => {
    const current = variantsBySize[size] || []
    const nextColors = current.includes(color)
      ? current.filter((c) => c !== color)
      : [...current, color]
    onChangeVariantsBySize?.({
      ...variantsBySize,
      [size]: nextColors,
    })
  }

  const setAllColorsForSize = (size, colorsList) => {
    onChangeVariantsBySize?.({
      ...variantsBySize,
      [size]: colorsList,
    })
  }

  const addCustomColorToSize = (size) => {
    const raw = (customColorBySize[size] || '').trim()
    if (!raw) return

    // Normaliza: primera letra mayúscula, resto minúscula (excepto si son siglas)
    const normalized = raw
      .split(' ')
      .map((word) =>
        word.length > 3
          ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          : word.toUpperCase()
      )
      .join(' ')

    const current = variantsBySize[size] || []
    if (current.includes(normalized)) {
      // Ya existe → limpia el input
      setCustomColorBySize((prev) => ({ ...prev, [size]: '' }))
      return
    }

    onChangeVariantsBySize?.({
      ...variantsBySize,
      [size]: [...current, normalized],
    })
    setCustomColorBySize((prev) => ({ ...prev, [size]: '' }))
  }

  const removeCustomColorFromSize = (size, color) => {
    const current = variantsBySize[size] || []
    onChangeVariantsBySize?.({
      ...variantsBySize,
      [size]: current.filter((c) => c !== color),
    })
  }

  const handleCustomColorKeyDown = (e, size) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustomColorToSize(size)
    }
  }

  // -------------------------------------------------------------
  // Stock
  // -------------------------------------------------------------
  const stockBySize = {}
  sizes.forEach((size) => {
    const colorsInSize = variantsBySize[size] || []
    const group = variants.filter((v) => v.size === size && colorsInSize.includes(v.color))
    if (group.length === 0) { stockBySize[size] = ''; return }
    const first = Number(group[0].stock) || 0
    stockBySize[size] = group.every((v) => (Number(v.stock) || 0) === first) ? first : ''
  })

  const handleBulkStockBySize = (size, value) => {
    if (!onChangeVariantsBulk) return
    const num = Math.max(0, Number(value) || 0)
    const colorsInSize = variantsBySize[size] || []
    onChangeVariantsBulk((list) =>
      list.map((v) =>
        v.size === size && colorsInSize.includes(v.color) ? { ...v, stock: num } : v,
      ),
    )
  }

  const handleStockByVariant = (id, value) => {
    if (!onChangeVariantsBulk) return
    const num = Math.max(0, Number(value) || 0)
    onChangeVariantsBulk((list) =>
      list.map((v) => (v.id === id ? { ...v, stock: num } : v)),
    )
  }

  // -------------------------------------------------------------
  // Regenerar códigos
  // -------------------------------------------------------------
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

  const totalStock = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)

  return (
    <>
      <Card>
        <header className="mb-5">
          <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Variantes del producto
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Agrega tallas y asígnales sus colores. Cada combinación genera su propio SKU y código.
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
            Agregar tallas
          </p>
          <div className="flex flex-wrap gap-2">
            {SIZE_OPTIONS.filter((s) => !variantsBySize[s]).map((s) => (
              <button
                key={s}
                type="button"
                disabled={!baseSku}
                onClick={() => toggleSizeOption(s)}
                className="
                  h-9 min-w-[44px] px-3 rounded-lg text-sm font-medium border
                  bg-white dark:bg-dark-card text-gray-700 dark:text-dark-muted
                  border-gray-200 dark:border-dark-border
                  hover:border-brand-blue hover:text-brand-blue
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-colors
                "
              >
                + {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-3 max-w-xs">
            <input
              type="text"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSize())}
              placeholder="Agregar talla (ej. 31)"
              disabled={!baseSku}
              className="
                flex-1 h-9 px-3 rounded-lg text-sm
                bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                border border-gray-200 dark:border-dark-border
                focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40
                outline-none disabled:opacity-40
              "
            />
            <Button size="sm" variant="secondary" icon={Plus} onClick={addCustomSize} disabled={!baseSku}>
              Agregar
            </Button>
          </div>
        </div>

        {/* Bloque por talla con sus colores */}
        {sizes.length > 0 && (
          <div className="mb-5 space-y-3">
            <p className="text-sm font-medium text-brand-black dark:text-dark-text">
              Colores por talla
            </p>

            {sizes.map((size) => {
              const colorsInSize = variantsBySize[size] || []
              const predefinedActive = COLOR_OPTIONS.filter((c) => colorsInSize.includes(c))
              const customActive = colorsInSize.filter((c) => !COLOR_OPTIONS.includes(c))
              const inputValue = customColorBySize[size] || ''

              return (
                <div
                  key={size}
                  className="rounded-lg border border-gray-200 dark:border-dark-border p-4 bg-gray-50/50 dark:bg-dark-surface/40"
                >
                  {/* Header de la talla */}
                  <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center h-8 min-w-[44px] px-3 rounded-md bg-brand-blue text-white text-sm font-bold">
                        {size}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-dark-muted">
                        {colorsInSize.length === 0
                          ? 'Sin colores — agrega al menos uno'
                          : `${colorsInSize.length} color${colorsInSize.length > 1 ? 'es' : ''}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAllColorsForSize(size, [...COLOR_OPTIONS])}
                        className="text-xs font-medium text-brand-blue hover:underline"
                      >
                        Todos
                      </button>
                      <button
                        type="button"
                        onClick={() => setAllColorsForSize(size, [])}
                        className="text-xs font-medium text-gray-500 dark:text-dark-muted hover:underline"
                      >
                        Ninguno
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSize(size)}
                        className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-brand-red hover:underline"
                      >
                        <Trash2 size={12} />
                        Quitar talla
                      </button>
                    </div>
                  </div>

                  {/* Colores predefinidos */}
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((c) => {
                      const active = colorsInSize.includes(c)
                      return (
                        <button
                          key={c}
                          type="button"
                          disabled={!baseSku}
                          onClick={() => toggleColorInSize(size, c)}
                          className={`
                            inline-flex items-center gap-2 h-8 px-3 rounded-lg text-xs font-medium border
                            transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                            ${active
                              ? 'bg-brand-blue text-white border-brand-blue'
                              : 'bg-white dark:bg-dark-card text-gray-700 dark:text-dark-muted border-gray-200 dark:border-dark-border hover:border-brand-blue hover:text-brand-blue'}
                          `}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/10"
                            style={{ backgroundColor: COLOR_MAP[c] || '#ccc' }}
                          />
                          {c}
                        </button>
                      )
                    })}
                  </div>

                  {/* Agregar color personalizado */}
                  {baseSku && (
                    <div className="mt-3 flex items-center gap-2 max-w-md">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) =>
                          setCustomColorBySize((prev) => ({ ...prev, [size]: e.target.value }))
                        }
                        onKeyDown={(e) => handleCustomColorKeyDown(e, size)}
                        placeholder="Otro color (ej. Azul marino)"
                        className="
                          flex-1 h-8 px-3 rounded-lg text-xs
                          bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                          border border-gray-200 dark:border-dark-border
                          focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40
                          outline-none
                        "
                      />
                      <button
                        type="button"
                        onClick={() => addCustomColorToSize(size)}
                        disabled={!inputValue.trim()}
                        className="
                          inline-flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-medium
                          bg-white dark:bg-dark-card text-brand-blue
                          border border-gray-200 dark:border-dark-border
                          hover:border-brand-blue hover:bg-blue-50 dark:hover:bg-blue-950/30
                          disabled:opacity-40 disabled:cursor-not-allowed
                          transition-colors
                        "
                      >
                        <Plus size={12} strokeWidth={2.2} />
                        Agregar color
                      </button>
                    </div>
                  )}

                  {/* Colores personalizados agregados */}
                  {customActive.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {customActive.map((c) => (
                        <span
                          key={c}
                          className="
                            inline-flex items-center gap-2 h-8 pl-3 pr-2 rounded-lg text-xs font-medium
                            bg-brand-blue/10 dark:bg-brand-blue/20
                            text-brand-blue
                            border border-brand-blue/30
                          "
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/10"
                            style={{ backgroundColor: getColorHex(c) }}
                          />
                          {c}
                          <button
                            type="button"
                            onClick={() => removeCustomColorFromSize(size, c)}
                            className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-brand-blue/20 transition-colors"
                            aria-label={`Quitar ${c}`}
                          >
                            <X size={10} strokeWidth={2.5} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Stock masivo por talla */}
        {sizes.some((s) => (variantsBySize[s] || []).length > 0) && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <Boxes size={15} className="text-brand-blue" strokeWidth={2} />
              <p className="text-sm font-medium text-brand-black dark:text-dark-text">
                Inventario masivo por talla
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-dark-muted mb-3">
              Escribe los pares por talla. Se aplicará a <strong>todos los colores</strong> de esa talla.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {sizes
                .filter((s) => (variantsBySize[s] || []).length > 0)
                .map((s) => (
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
              Agrega tallas y asígnales colores para generar las variantes.
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
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: getColorHex(v.color) }}
                          />
                          {v.label}
                        </span>
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