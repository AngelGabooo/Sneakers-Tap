import { useEffect, useMemo, useState } from 'react'
import { X, Calculator, CheckCircle2, AlertTriangle } from 'lucide-react'
import Button from '../../common/Button'

const DENOMS = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1]

export default function CashCurrentCountModal({
  open,
  expected = 0,
  onClose,
  onConfirm,
  submitting,
}) {
  const [values, setValues] = useState({})

  useEffect(() => {
    if (open) setValues({})
  }, [open])

  const counted = useMemo(
    () =>
      Object.entries(values).reduce(
        (acc, [d, q]) => acc + Number(d) * (Number(q) || 0),
        0,
      ),
    [values],
  )

  if (!open) return null

  const diff = counted - expected
  const matches = Math.abs(diff) < 0.01

  const handleChange = (denom, value) => {
    setValues((v) => ({ ...v, [denom]: value }))
  }

  const handleConfirm = () => {
    onConfirm?.({ counted, difference: diff, values })
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-cardHover">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border shrink-0">
          <div className="flex items-center gap-2">
            <Calculator size={16} className="text-brand-blue" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
              Conteo parcial de efectivo
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-brand-black dark:hover:text-dark-text transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <p className="text-xs text-gray-500 dark:text-dark-muted">
            Este conteo no cierra la caja ni modifica automáticamente el saldo.
          </p>

          {/* Tabla de denominaciones */}
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
                  const q = Number(values[d]) || 0
                  const sub = q * d
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
                          onChange={(e) => handleChange(d, e.target.value)}
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
          <div className="rounded-lg border border-gray-100 dark:border-dark-border p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-dark-muted">Esperado</span>
              <span className="font-medium text-brand-black dark:text-dark-text">
                ${expected.toLocaleString('es-MX')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-dark-muted">Contado</span>
              <span className="font-medium text-brand-black dark:text-dark-text">
                ${counted.toLocaleString('es-MX')}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-gray-100 dark:border-dark-border">
              <span className="text-gray-500 dark:text-dark-muted">Diferencia</span>
              <span
                className={`font-bold ${
                  matches
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-brand-red'
                }`}
              >
                {diff >= 0 ? '+' : '-'}$
                {Math.abs(diff).toLocaleString('es-MX')}
              </span>
            </div>
          </div>

          {/* Estado del conteo */}
          {!matches && counted > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs">
              <AlertTriangle size={13} strokeWidth={2.2} className="mt-0.5 shrink-0" />
              <span>
                Se detectó una diferencia temporal. Este conteo no cierra la caja ni modifica el saldo.
              </span>
            </div>
          )}

          {matches && counted > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs">
              <CheckCircle2 size={13} strokeWidth={2.2} className="mt-0.5 shrink-0" />
              <span>El conteo coincide con el efectivo esperado.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border shrink-0">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            loading={submitting}
            disabled={counted === 0 || submitting}
          >
            {submitting ? 'Guardando...' : 'Guardar conteo'}
          </Button>
        </div>
      </div>
    </div>
  )
}