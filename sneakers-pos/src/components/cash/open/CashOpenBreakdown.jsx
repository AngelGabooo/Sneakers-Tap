import { CheckCircle2, AlertTriangle } from 'lucide-react'
import Card from '../../common/Card'
import Checkbox from '../../common/Checkbox'

const DENOMS = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1]

export default function CashOpenBreakdown({
  enabled,
  onToggle,
  values = {},       // { [denom]: cantidad }
  onChangeValue,
  total,             // total contado
  declared,          // monto declarado
}) {
  const declaredNum = Number(declared) || 0
  const diff = total - declaredNum
  const matches = Math.abs(diff) < 0.01

  return (
    <Card>
      <header className="mb-4">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Desglose de efectivo
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Cuenta el efectivo por denominación para verificar el fondo inicial.
        </p>
      </header>

      <label className="flex items-center gap-2 cursor-pointer mb-4">
        <Checkbox
          checked={!!enabled}
          onChange={(e) => onToggle?.(e.target.checked)}
        />
        <span className="text-sm font-medium text-brand-black dark:text-dark-text">
          Contar efectivo por denominación
        </span>
      </label>

      {enabled && (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-dark-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/60 dark:bg-dark-surface/60 border-b border-gray-100 dark:border-dark-border">
                  {['Denominación', 'Cantidad', 'Subtotal'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DENOMS.map((d) => {
                  const qty = Number(values[d]) || 0
                  const sub = qty * d
                  return (
                    <tr
                      key={d}
                      className="border-b border-gray-100 dark:border-dark-border last:border-0"
                    >
                      <td className="px-3 py-2 text-gray-700 dark:text-dark-muted whitespace-nowrap">
                        ${d.toLocaleString('es-MX')}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={0}
                          value={values[d] ?? ''}
                          onChange={(e) => onChangeValue?.(d, e.target.value)}
                          placeholder="0"
                          className="w-20 h-8 px-2 rounded-md text-xs text-center bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border focus:border-brand-blue outline-none"
                        />
                      </td>
                      <td className="px-3 py-2 font-semibold text-brand-black dark:text-dark-text whitespace-nowrap">
                        ${sub.toLocaleString('es-MX')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Comparación */}
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-dark-muted">Monto declarado</span>
              <span className="font-medium text-brand-black dark:text-dark-text">
                ${declaredNum.toLocaleString('es-MX')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-dark-muted">Monto contado</span>
              <span className="font-medium text-brand-black dark:text-dark-text">
                ${total.toLocaleString('es-MX')}
              </span>
            </div>
          </div>

          <div className={`
            mt-3 flex items-start gap-2 p-3 rounded-lg text-xs
            ${matches
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-brand-red'}
          `}>
            {matches ? (
              <>
                <CheckCircle2 size={14} strokeWidth={2.2} className="mt-0.5 shrink-0" />
                <span>El conteo coincide con el monto inicial.</span>
              </>
            ) : (
              <>
                <AlertTriangle size={14} strokeWidth={2.2} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">El conteo no coincide</p>
                  <p className="mt-0.5">
                    Diferencia: {diff < 0 ? '-' : '+'}${Math.abs(diff).toLocaleString('es-MX')}
                  </p>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </Card>
  )
}