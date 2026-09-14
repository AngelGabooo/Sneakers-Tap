import { ShoppingCart, ArrowRight } from 'lucide-react'

export default function PosCartMobileBar({ count, total, onOpen, hidden }) {
  if (hidden || count === 0) return null

  return (
    <button
      type="button"
      onClick={onOpen}
      className="
        lg:hidden fixed bottom-4 left-4 right-4 z-50
        flex items-center justify-between gap-3
        h-14 px-4 rounded-xl
        bg-brand-blue text-white
        shadow-2xl
        hover:bg-brand-blueHover active:bg-brand-blueDark
        transition-colors
      "
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <ShoppingCart size={20} strokeWidth={2.2} />
          <span className="
            absolute -top-1.5 -right-1.5
            min-w-[18px] h-[18px] px-1
            flex items-center justify-center
            rounded-full bg-white text-brand-blue
            text-[10px] font-bold
          ">
            {count}
          </span>
        </div>
        <div className="text-left">
          <p className="text-[11px] text-white/80 leading-none">Ver carrito</p>
          <p className="text-base font-bold leading-tight">
            ${total.toLocaleString('es-MX')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-sm font-semibold">
        Cobrar
        <ArrowRight size={16} strokeWidth={2.4} />
      </div>
    </button>
  )
}