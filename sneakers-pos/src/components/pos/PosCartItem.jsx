import { Minus, Plus, Trash2, Package } from 'lucide-react'

export default function PosCartItem({ item, onQuantityChange, onRemove }) {
  const subtotal = Number(item.price) * Number(item.quantity)
  const canIncrease = item.quantity < item.stock
  const canDecrease = item.quantity > 1

  return (
    <div className="flex gap-3 py-3">
      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-dark-surface overflow-hidden shrink-0 flex items-center justify-center">
        {item.imageUrl
          ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
          : <Package size={18} className="text-gray-400" strokeWidth={1.8} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-brand-black dark:text-dark-text truncate">
              {item.productName}
            </p>
            <p className="text-xs text-gray-500 dark:text-dark-muted truncate">
              {item.variantLabel} · {item.sku}
            </p>
          </div>

          <button
            onClick={() => onRemove?.(item.key)}
            className="text-gray-400 hover:text-brand-red transition-colors shrink-0"
            aria-label="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 mt-2">
          {/* Cantidad */}
          <div className="inline-flex items-center rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
            <button
              onClick={() => onQuantityChange?.(item.key, item.quantity - 1)}
              disabled={!canDecrease}
              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-brand-black dark:hover:text-dark-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Reducir"
            >
              <Minus size={12} strokeWidth={2.4} />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-brand-black dark:text-dark-text">
              {item.quantity}
            </span>
            <button
              onClick={() => onQuantityChange?.(item.key, item.quantity + 1)}
              disabled={!canIncrease}
              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-brand-black dark:hover:text-dark-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Aumentar"
            >
              <Plus size={12} strokeWidth={2.4} />
            </button>
          </div>

          {/* Subtotal */}
          <p className="text-sm font-bold text-brand-black dark:text-dark-text">
            ${subtotal.toLocaleString('es-MX')}
          </p>
        </div>

        {item.quantity >= item.stock && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
            Stock máximo alcanzado ({item.stock})
          </p>
        )}
      </div>
    </div>
  )
}