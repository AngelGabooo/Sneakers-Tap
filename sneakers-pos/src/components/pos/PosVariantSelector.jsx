import { useEffect, useMemo, useState } from 'react'
import { X, Package, PackageX } from 'lucide-react'
import Button from '../common/Button'

/**
 * Selector rápido de variante.
 * Se muestra al seleccionar un producto con variantes.
 * El usuario elige talla y color, luego agrega al carrito.
 */
export default function PosVariantSelector({ open, product, onClose, onSelect }) {
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')

  const variants = product?.variants || []

  const uniqueSizes = useMemo(
    () => Array.from(new Set(variants.map((v) => v.size))).filter(Boolean),
    [variants],
  )
  const uniqueColors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color))).filter(Boolean),
    [variants],
  )

  // Reset al abrir
  useEffect(() => {
    if (open) {
      setSize(uniqueSizes[0] || '')
      setColor(uniqueColors[0] || '')
    }
  }, [open, uniqueSizes, uniqueColors])

  // Variante seleccionada según talla + color
  const selectedVariant = useMemo(() => {
    return variants.find((v) => v.size === size && v.color === color)
  }, [variants, size, color])

  // Stock por talla+color para deshabilitar combinaciones agotadas
  const isCombinationAvailable = (s, c) => {
    const v = variants.find((x) => x.size === s && x.color === c)
    return v && Number(v.stock) > 0
  }

  if (!open || !product) return null

  const handleAdd = () => {
    if (!selectedVariant || Number(selectedVariant.stock) <= 0) return
    onSelect?.(product, selectedVariant, 1)
    onClose?.()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-cardHover">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-dark-surface overflow-hidden shrink-0 flex items-center justify-center">
              {product.images?.[0]?.url
                ? <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                : <Package size={18} className="text-gray-400" strokeWidth={1.8} />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text truncate">
                {product.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-dark-muted">
                Seleccionar variante
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-brand-black dark:hover:text-dark-text transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Colores */}
          {uniqueColors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-brand-black dark:text-dark-text mb-2">
                Color
              </p>
              <div className="flex flex-wrap gap-2">
                {uniqueColors.map((c) => {
                  const active = color === c
                  const anyAvail = uniqueSizes.some((s) => isCombinationAvailable(s, c))
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      disabled={!anyAvail}
                      className={`
                        inline-flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-medium border
                        transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                        ${active
                          ? 'bg-brand-blue text-white border-brand-blue'
                          : 'bg-white dark:bg-dark-card text-gray-700 dark:text-dark-muted border-gray-200 dark:border-dark-border hover:border-brand-blue hover:text-brand-blue'}
                      `}
                    >
                      {c}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tallas */}
          {uniqueSizes.length > 0 && (
            <div>
              <p className="text-sm font-medium text-brand-black dark:text-dark-text mb-2">
                Talla
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {uniqueSizes.map((s) => {
                  const v = variants.find((x) => x.size === s && x.color === color)
                  const stock = Number(v?.stock) || 0
                  const active = size === s
                  const unavailable = stock === 0
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      disabled={unavailable}
                      className={`
                        flex flex-col items-center justify-center py-2 rounded-lg border text-sm font-medium
                        transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                        ${active && !unavailable
                          ? 'bg-brand-blue text-white border-brand-blue'
                          : 'bg-white dark:bg-dark-card text-gray-700 dark:text-dark-muted border-gray-200 dark:border-dark-border hover:border-brand-blue hover:text-brand-blue'}
                      `}
                    >
                      <span>{s}</span>
                      <span className={`text-[10px] ${active && !unavailable ? 'text-white/80' : 'text-gray-400 dark:text-dark-muted'}`}>
                        {unavailable ? 'Agotado' : `${stock} disp.`}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Estado de la selección */}
          {selectedVariant && Number(selectedVariant.stock) > 0 ? (
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 p-3 text-xs text-brand-blue dark:text-blue-300">
              <strong>{selectedVariant.label}</strong> · SKU:{' '}
              <span className="font-mono">{selectedVariant.sku}</span> · {selectedVariant.stock} disponibles
            </div>
          ) : (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <PackageX size={13} strokeWidth={2.2} className="shrink-0" />
              <span>Selecciona una combinación disponible.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border shrink-0">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button
            variant="primary"
            onClick={handleAdd}
            disabled={!selectedVariant || Number(selectedVariant.stock) <= 0}
          >
            Agregar al carrito
          </Button>
        </div>
      </div>
    </div>
  )
}