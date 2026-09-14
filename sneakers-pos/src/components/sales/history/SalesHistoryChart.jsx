import { BarChart3 } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import Card from '../../common/Card'
import EmptyState from '../../common/EmptyState'

export default function SalesHistoryChart({ data = [], metric = 'amount', onMetricChange }) {
  const hasData = data.length > 0

  return (
    <Card className="mb-5">
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Ventas por día
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Distribución en el periodo seleccionado.
          </p>
        </div>

        <select
          value={metric}
          onChange={(e) => onMetricChange?.(e.target.value)}
          className="
            h-8 px-2.5 rounded-lg text-xs font-medium
            bg-white dark:bg-dark-card
            border border-gray-200 dark:border-dark-border
            text-brand-black dark:text-dark-text
            outline-none cursor-pointer
          "
        >
          <option value="amount">Ingresos</option>
          <option value="count">Número de ventas</option>
        </select>
      </header>

      {hasData ? (
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                formatter={(v) =>
                  metric === 'amount'
                    ? `$${Number(v).toLocaleString('es-MX')}`
                    : v
                }
              />
              <Bar dataKey={metric} fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState
          icon={BarChart3}
          title="Sin ventas en el periodo"
          description="Registra ventas desde el punto de venta para ver la gráfica."
        />
      )}
    </Card>
  )
}