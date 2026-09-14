import { ShoppingCart, UserPlus, User, Percent, StickyNote, Trash2, Save, X } from 'lucide-react'
import Button from '../common/Button'
import Card from '../common/Card'
import PosCartItem from './PosCartItem'
import PosEmptyCart from './PosEmptyCart'

export default function PosCart({
  items = [],
  totals,
  customer,
  onQuantityChange,
  onRemove,
  onClear,
  onOpenCustomer,
  onOpenDiscount,
  onOpenNote,
  onOpenSuspend,
  onCheckout,
  onClose,
  showCloseButton = false,
}) {
  const hasItems = items.length > 0

  return (
    <Card padded={false} className="flex flex-col h-full min-h-0">
      {/* Header del carrito */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 dark:border-dark-border shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingCart size={16} className="text-brand-blue" strokeWidth={2} />
          <span className="text-sm font-semibold text-brand-black dark:text-dark-text">
            Venta actual
          </span>
          <span className="text-xs text-gray-500 dark:text-dark-muted">
            ({items.length} {items.length === 1 ? 'producto' : 'productos'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasItems && (
            <button
              onClick={onClear}
              className="text-xs font-medium text-gray-500 hover:text-brand-red transition-colors inline-flex items-center gap-1"
            >
              <Trash2 size={12} strokeWidth={2.2} />
              Vaciar
            </button>
          )}

          {showCloseButton && (
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-brand-black dark:hover:text-dark-text transition-colors"
              aria-label="Cerrar carrito"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Cliente */}
      <button
        onClick={onOpenCustomer}
        className="
          flex items-center gap-2 px-4 py-2.5 shrink-0
          border-b border-gray-100 dark:border-dark-border
          hover:bg-gray-50 dark:hover:bg-dark-surface/50
          transition-colors text-left
        "
      >
        {customer ? (
          <>
            <div className="w-7 h-7 rounded-full bg-brand-blue text-white flex items-center justify-center text-[11px] font-semibold shrink-0">
              {customer.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-brand-black dark:text-dark-text truncate">
                {customer.name}
              </p>
              {customer.isWholesale && (
                <p className="text-[11px] text-brand-blue">
                  Mayorista {customer.level && `· ${customer.level}`}
                </p>
              )}
            </div>
            <User size={14} className="text-gray-400 shrink-0" strokeWidth={2} />
          </>
        ) : (
          <>
            <UserPlus size={16} className="text-gray-400 shrink-0" strokeWidth={2} />
            <span className="text-xs text-gray-500 dark:text-dark-muted flex-1">
              Venta general · Asignar cliente
            </span>
          </>
        )}
      </button>

      {/* Lista de items */}
      <div className="flex-1 overflow-y-auto px-4 divide-y divide-gray-100 dark:divide-dark-border min-h-0">
        {!hasItems ? (
          <PosEmptyCart />
        ) : (
          items.map((item) => (
            <PosCartItem
              key={item.key}
              item={item}
              onQuantityChange={onQuantityChange}
              onRemove={onRemove}
            />
          ))
        )}
      </div>

      {/* Acciones + Totales */}
      {hasItems && (
        <>
          <div className="px-4 py-2 border-t border-gray-100 dark:border-dark-border flex flex-wrap gap-2 shrink-0">
            <button
              onClick={onOpenDiscount}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-blue hover:underline"
            >
              <Percent size={12} strokeWidth={2.2} />
              Descuento
            </button>
            <button
              onClick={onOpenNote}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-blue hover:underline"
            >
              <StickyNote size={12} strokeWidth={2.2} />
              Nota
            </button>
            <button
              onClick={onOpenSuspend}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-brand-black dark:hover:text-dark-text transition-colors ml-auto"
            >
              <Save size={12} strokeWidth={2.2} />
              Suspender
            </button>
          </div>

          <div className="border-t border-gray-100 dark:border-dark-border p-4 space-y-3 shrink-0 bg-white dark:bg-dark-card">
            <div className="space-y-1.5">
              <Row label="Subtotal" value={totals.subtotal} />
              {totals.discountAmount > 0 && (
                <Row label="Descuento" value={-totals.discountAmount} tone="danger" />
              )}
              {totals.tax > 0 && <Row label="Impuestos" value={totals.tax} />}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-dark-border">
              <span className="text-sm font-medium text-gray-600 dark:text-dark-muted">
                Total
              </span>
              <span className="text-2xl font-bold text-brand-black dark:text-dark-text">
                ${totals.total.toLocaleString('es-MX')}
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full !h-12 text-base"
              onClick={onCheckout}
            >
              Cobrar ${totals.total.toLocaleString('es-MX')}
            </Button>
          </div>
        </>
      )}
    </Card>
  )
}

function Row({ label, value, tone = 'neutral' }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500 dark:text-dark-muted">{label}</span>
      <span className={`font-medium ${tone === 'danger' ? 'text-brand-red' : 'text-brand-black dark:text-dark-text'}`}>
        {value < 0 ? '-' : ''}${Math.abs(value).toLocaleString('es-MX')}
      </span>
    </div>
  )
}