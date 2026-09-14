import { useMemo, useState } from 'react'
import { Search, X, Package, ChevronDown } from 'lucide-react'
import Card from '../../common/Card'
import SelectField from '../../common/SelectField'

/**
 * Sección de selección de producto y variante.
 * - Búsqueda con dropdown de productos.
 * - Select de variantes (o mensaje si no hay variantes).
 * - Select de ubicación.
 */
export default function AdjustProductSection({
  products = [],
  selectedProductId,
  selectedVariantId,
  location,
  locations = [],
  errors,
  onSelectProduct,
  onSelectVariant,
  onChangeLocation,
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const selectedProduct = products.find((p) => p.id === selectedProductId) || null
  const variants = selectedProduct?.variants || []

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products.slice(0, 8)
    return products
      .filter((p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.barcode || '').toLowerCase().includes(q),
      )
      .slice(0, 8)
  }, [products, query])

  const handleSelectProduct = (product) => {
    onSelectProduct?.(product.id)
    setQuery('')
    setOpen(false)
  }

  const handleClearProduct = () => {
    onSelectProduct?.(null)
    onSelectVariant?.(null)
  }

  return (
    <Card>
      <header className="mb-5">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Producto
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Selecciona el producto y la variante que deseas modificar.
        </p>
      </header>

      <div className="space-y-4">
        {/* Producto */}
        <div>
          <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
            Producto <span className="text-brand-red">*</span>
          </label>

          {selectedProduct ? (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-dark-surface overflow-hidden shrink-0 flex items-center justify-center">
                {selectedProduct.images?.[0]?.url
                  ? <img src={selectedProduct.images[0].url} alt="" className="w-full h-full object-cover" />
                  : <Package size={18} className="text-gray-400" strokeWidth={1.8} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-brand-black dark:text-dark-text truncate">
                  {selectedProduct.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-muted truncate">
                  {selectedProduct.sku}
                  {selectedProduct.brand && ` · ${selectedProduct.brand}`}
                  {selectedProduct.category && ` · ${selectedProduct.category}`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearProduct}
                className="text-gray-400 hover:text-brand-red transition-colors"
                aria-label="Cambiar producto"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <Search size={17} strokeWidth={1.8} />
              </span>
              <input
                type="text"
                value={query}
                onFocus={() => setOpen(true)}
                onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
                placeholder="Buscar producto por nombre, SKU o código de barras..."
                className={`
                  w-full h-11 pl-10 pr-3 rounded-lg text-sm
                  bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                  border transition-colors outline-none
                  placeholder:text-gray-400 dark:placeholder:text-dark-muted
                  ${errors?.productId
                    ? 'border-brand-red focus:border-brand-red focus:ring-2 focus:ring-red-100'
                    : 'border-gray-200 dark:border-dark-border focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40'}
                `}
              />

              {open && results.length > 0 && (
                <div className="
                  absolute z-20 mt-1 w-full max-h-80 overflow-y-auto rounded-lg
                  bg-white dark:bg-dark-card
                  border border-gray-200 dark:border-dark-border
                  shadow-cardHover py-1
                ">
                  {results.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectProduct(p)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors"
                    >
                      <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-dark-surface overflow-hidden shrink-0 flex items-center justify-center">
                        {p.images?.[0]?.url
                          ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                          : <Package size={14} className="text-gray-400" strokeWidth={1.8} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-brand-black dark:text-dark-text truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-dark-muted truncate">
                          {p.sku}{p.brand && ` · ${p.brand}`}{p.category && ` · ${p.category}`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {open && results.length === 0 && query && (
                <div className="
                  absolute z-20 mt-1 w-full rounded-lg p-4 text-sm
                  bg-white dark:bg-dark-card
                  border border-gray-200 dark:border-dark-border
                  shadow-cardHover
                  text-gray-500 dark:text-dark-muted text-center
                ">
                  No se encontraron productos.
                </div>
              )}
            </div>
          )}

          {errors?.productId && (
            <p className="mt-1.5 text-xs text-brand-red">{errors.productId}</p>
          )}
        </div>

        {/* Variante */}
        {selectedProduct && (
          <div>
            {variants.length === 0 ? (
              <div className="
                flex items-start gap-2 p-3 rounded-lg
                bg-amber-50 dark:bg-amber-950/30
                border border-amber-200 dark:border-amber-900/50
                text-amber-800 dark:text-amber-300 text-xs
              ">
                <span>
                  Este producto no tiene variantes registradas. Edita el producto para agregar tallas y colores.
                </span>
              </div>
            ) : (
              <SelectField
                id="variant"
                label="Variante"
                required
                value={selectedVariantId || ''}
                onChange={(e) => onSelectVariant?.(e.target.value || null)}
                placeholder="Seleccionar variante"
                options={variants.map((v) => ({
                  value: v.id,
                  label: `${v.label} — ${v.sku || 'Sin SKU'} — Stock: ${v.stock || 0}`,
                }))}
                error={errors?.variantId}
              />
            )}
          </div>
        )}

        {/* Ubicación */}
        {selectedProduct && (
          <SelectField
            id="location"
            label="Ubicación"
            required
            value={location || ''}
            onChange={(e) => onChangeLocation?.(e.target.value)}
            placeholder="Seleccionar ubicación"
            options={locations}
            error={errors?.location}
          />
        )}
      </div>
    </Card>
  )
}