import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import Card from '../common/Card'
import EmptyState from '../common/EmptyState'

export default function ReportsSalesChart({ data = [], compareData = [], showCompare }) {
  const hasData = data.length > 0

  return (
    <Card className="mb-5">
      <header className="mb-4">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Ventas por día
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Comportamiento diario en el periodo seleccionado.
        </p>
      </header>

      {!hasData ? (
        <EmptyState
          icon={BarChart3}
          title="Sin ventas en el periodo"
          description="No hay datos para mostrar en la gráfica."
        />
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 12, left: -6, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  new Intl.NumberFormat('es-MX', {
                    notation: 'compact',
                    style: 'currency',
                    currency: 'MXN',
                    maximumFractionDigits: 0,
                  }).format(v)
                }
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  fontSize: 12,
                }}
                formatter={(v) => `$${Number(v).toLocaleString('es-MX')}`}
              />
              {showCompare && <Legend wrapperStyle={{ fontSize: 12 }} />}
              <Line
                type="monotone"
                dataKey="netSales"
                name="Ventas netas"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#2563EB', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }}
              />
              {showCompare && compareData.length > 0 && (
                <Line
                  type="monotone"
                  dataKey="netSales"
                  data={compareData}
                  name="Periodo anterior"
                  stroke="#94A3B8"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}