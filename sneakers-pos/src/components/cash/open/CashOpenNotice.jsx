import { Info } from 'lucide-react'

export default function CashOpenNotice() {
  return (
    <div className="
      flex items-start gap-2.5 p-3.5 rounded-lg mb-5
      bg-blue-50 dark:bg-blue-950/30
      border border-blue-100 dark:border-blue-900/50
      text-blue-900 dark:text-blue-300
    ">
      <Info size={16} strokeWidth={2.2} className="mt-0.5 shrink-0" />
      <div className="text-xs leading-relaxed">
        <p className="font-medium">Antes de abrir la caja</p>
        <p className="text-blue-800/80 dark:text-blue-400 mt-0.5">
          Verifica que la caja esté cerrada y cuenta correctamente el efectivo que quedará disponible como fondo inicial. La apertura quedará registrada con tu usuario, fecha y hora.
        </p>
      </div>
    </div>
  )
}