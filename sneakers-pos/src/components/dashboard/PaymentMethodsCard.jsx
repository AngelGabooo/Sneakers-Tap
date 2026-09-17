import { CreditCard } from 'lucide-react'
import Card from '../common/Card'
import EmptyState from '../common/EmptyState'

export default function PaymentMethodsCard({ methods = [] }) {
  const hasData = methods.length > 0

  return (
    <Card className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Métodos de pago
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Distribución del período
        </p>
      </div>

      {hasData ? (
        <div className="flex-1 space-y-3">
          {methods.map((m) => (
            <div key={m.key}>
              <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                  <span className="font-medium text-brand-black dark:text-dark-text">
                    {m.label}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-dark-muted">
                  {m.pct.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-dark-surface overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{ width: `${m.pct}%`, backgroundColor: m.color }}
                  />
                </div>
                <span className="text-xs font-semibold text-brand-black dark:text-dark-text whitespace-nowrap">
                  {m.totalFormatted}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CreditCard}
          title="Sin ventas en el período"
          description="Los métodos de pago aparecerán aquí."
        />
      )}
    </Card>
  )
}