import { Package, Plus } from 'lucide-react'

export default function PosProductCard({ product, onClick }) {
  const totalStock = (product.variants || []).reduce(
    (acc, v) => acc + (Number(v.stock) || 0),
    0,
  )
  const hasVariants = (product.variants || []).length > 0
  const stock = hasVariants ? totalStock : Number(product.initialStock) || 0
  const outOfStock = stock === 0

  return (
    <button
      type="button"
      onClick={() => !outOfStock && onClick?.(product)}
      disabled={outOfStock}
      className={`
        group text-left rounded-xl border bg-white dark:bg-dark-card overflow-hidden
        transition-all duration-150
        ${outOfStock
          ? 'opacity-60 cursor-not-allowed border-gray-200 dark:border-dark-border'
          : 'border-gray-200 dark:border-dark-border hover:border-brand-blue hover:shadow-cardHover cursor-pointer'}
      `}
    >
      <div className="aspect-square bg-gray-50 dark:bg-dark-surface relative overflow-hidden">
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={26} className="text-gray-300 dark:text-dark-border" strokeWidth={1.4} />
          </div>
        )}

        {outOfStock && (
          <div className="absolute inset-0 bg-white/70 dark:bg-dark-surface/70 flex items-center justify-center">
            <span className="text-[11px] font-semibold text-brand-red">Agotado</span>
          </div>
        )}

        {!outOfStock && (
          <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Plus size={13} strokeWidth={2.4} />
          </span>
        )}

        {/* Stock badge */}
        <span className={`
          absolute top-2 left-2 text-[10px] font-semibold px-1.5 py-0.5 rounded
          ${outOfStock
            ? 'bg-red-100 text-brand-red'
            : stock <= 3
              ? 'bg-amber-100 text-amber-700'
              : 'bg-white/90 dark:bg-dark-card/90 text-gray-700 dark:text-dark-muted'}
        `}>
          {outOfStock ? '0' : stock}
        </span>
      </div>

      <div className="p-2.5">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-dark-muted truncate">
          {product.brand || '—'}
        </p>
        <p className="text-[13px] font-semibold text-brand-black dark:text-dark-text truncate mt-0.5 leading-tight">
          {product.name}
        </p>
        <p className="text-sm font-bold text-brand-black dark:text-dark-text mt-1.5">
          ${Number(product.salePrice || 0).toLocaleString('es-MX')}
        </p>
      </div>
    </button>
  )
}