import { CheckCircle2, AlertTriangle } from 'lucide-react'
import Card from '../../common/Card'
import Badge from '../../common/Badge'

export default function CashCurrentReconciliation({ status }) {
  const hasDiff = status?.hasDifference

  return (
    <Card>
      <h2 className="text-base font-semibold text-brand-black dark:text-dark-text mb-3">
        Estado de caja
      </h2>

      {!hasDiff ? (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
          <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2.2} />
          <div>
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
              Caja en operación
            </p>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400 mt-0.5">
              No hay diferencias registradas.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
          <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" strokeWidth={2.2} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Requiere revisión
              </p>
              <Badge variant="warning">Diferencia</Badge>
            </div>
            <p className="text-xs text-amber-700/80 dark:text-amber-400 mt-0.5">
              Se detectó una diferencia temporal de ${Number(status.difference || 0).toLocaleString('es-MX')} en el último conteo.
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}