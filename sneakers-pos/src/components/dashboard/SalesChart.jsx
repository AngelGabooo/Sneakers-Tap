import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import Card from '../common/Card'
import EmptyState from '../common/EmptyState'
import { BarChart3 } from 'lucide-react'

const CustomTooltip = ({ active, payload, label, currency = 'MXN' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-card px-3 py-2">
      <p className="text-xs text-gray-500 dark:text-dark-muted">{label}</p>
      <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
        {new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(payload[0].value)}
      </p>
    </div>
  )
}

export default function SalesChart({
  title = 'Resumen de ventas',
  subtitle = 'Ventas durante el período seleccionado',
  labels = [],
  series = [],
  currency = 'MXN',
  metric = 'sales',
  onMetricChange,
}) {
  const data = labels.map((label, i) => ({ label, value: series[i] ?? 0 }))
  const hasData = data.length > 0

  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <h3 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">{subtitle}</p>
        </div>

        <select
          value={metric}
          onChange={(e) => onMetricChange?.(e.target.value)}
          className="
            h-9 px-2.5 rounded-lg text-sm font-medium
            bg-white dark:bg-dark-card
            border border-gray-200 dark:border-dark-border
            text-brand-black dark:text-dark-text
            hover:border-brand-blue focus:border-brand-blue
            outline-none cursor-pointer
          "
        >
          <option value="sales">Ventas</option>
          <option value="profit">Ganancias</option>
          <option value="products">Productos vendidos</option>
        </select>
      </div>

      <div className="flex-1 min-h-[280px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  new Intl.NumberFormat('es-MX', {
                    notation: 'compact',
                    style: 'currency',
                    currency,
                    maximumFractionDigits: 0,
                  }).format(v)
                }
              />
              <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ stroke: '#2563EB', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#2563EB', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            icon={BarChart3}
            title="Aún no hay ventas en este período"
            description="Cuando se registren ventas, verás la gráfica aquí."
          />
        )}
      </div>
    </Card>
  )
}