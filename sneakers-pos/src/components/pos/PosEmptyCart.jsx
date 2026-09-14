import { ShoppingCart } from 'lucide-react'

export default function PosEmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center px-4">
      <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-dark-surface flex items-center justify-center mb-3">
        <ShoppingCart size={22} className="text-gray-400 dark:text-dark-muted" strokeWidth={1.8} />
      </div>
      <p className="text-sm font-medium text-brand-black dark:text-dark-text">
        Tu carrito está vacío
      </p>
      <p className="text-xs text-gray-500 dark:text-dark-muted mt-1 max-w-[200px]">
        Busca un producto o escanea un código de barras para comenzar.
      </p>
    </div>
  )
}