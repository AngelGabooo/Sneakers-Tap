import { useMemo } from 'react'
import { Calculator } from 'lucide-react'
import Card from '../../common/Card'

const BILLETES = [1000, 500, 200, 100, 50, 20]
const MONEDAS  = [10, 5, 2, 1]

export default function CashCloseCount({ values = {}, onChangeValue }) {
  const counted = useMemo(
    () => Object.entries(values).reduce(
      (acc, [d, q]) => acc + Number(d) * (Number(q) || 0),
      0,
    ),
    [values],
  )

  const renderTable = (denoms) => (
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
          {denoms.map((d) => {
            const q = Number(values[d]) || 0
            return (
              <tr key={d} className="border-b border-gray-100 dark:border-dark-border last:border-0">
                <td className="px-3 py-2 text-gray-700 dark:text-dark-muted whitespace-nowrap">
                  ${d.toLocaleString('es-MX')}
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={values[d] ?? ''}
                    onChange={(e) => onChangeValue?.(d, e.target.value)}
                    placeholder="0"
                    className="w-20 h-8 px-2 rounded-md text-xs text-center bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border focus:border-brand-blue outline-none"
                  />
                </td>
                <td className="px-3 py-2 font-semibold text-brand-black dark:text-dark-text whitespace-nowrap">
                  ${(q * d).toLocaleString('es-MX')}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )

  return (
    <Card>
      <header className="mb-4">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Conteo de efectivo
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Cuenta físicamente el efectivo disponible en la caja e ingresa las cantidades por denominación.
        </p>
      </header>

      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted mb-2">
            Billetes
          </p>
          {renderTable(BILLETES)}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted mb-2">
            Monedas
          </p>
          {renderTable(MONEDAS)}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600 dark:text-dark-muted flex items-center gap-2">
          <Calculator size={14} strokeWidth={2} />
          Total contado
        </span>
        <span className="text-2xl font-bold text-brand-black dark:text-dark-text">
          ${counted.toLocaleString('es-MX')}
        </span>
      </div>
    </Card>
  )
}