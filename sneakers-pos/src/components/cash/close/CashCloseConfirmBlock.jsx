import { AlertTriangle } from 'lucide-react'
import Card from '../../common/Card'
import Checkbox from '../../common/Checkbox'

export default function CashCloseConfirmBlock({ confirmed, onConfirmedChange }) {
  return (
    <Card>
      <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text mb-3">
        ¿Todo está correcto?
      </h2>

      <div className="flex items-start gap-3 p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 mb-4">
        <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" strokeWidth={2.2} />
        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          Al cerrar esta caja no podrás registrar nuevas ventas ni movimientos en esta sesión. Verifica que el conteo y la conciliación sean correctos antes de continuar.
        </p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <Checkbox
          checked={!!confirmed}
          onChange={(e) => onConfirmedChange?.(e.target.checked)}
          className="mt-0.5"
        />
        <span className="text-sm text-brand-black dark:text-dark-text">
          Confirmo que realicé el conteo físico y que la información mostrada es correcta.
        </span>
      </label>
    </Card>
  )
}