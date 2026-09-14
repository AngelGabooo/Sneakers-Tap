import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import Card from '../common/Card'
import EmptyState from '../common/EmptyState'

export default function ReportDetailChart({
  title,
  subtitle,
  type = 'line',
  data = [],
  dataKey = 'value',
  xKey = 'label',
  color = '#2563EB',
  currency = true,
}) {
  const hasData = data.length > 0

  return (
    <Card className="mb-5">
      <header className="mb-4">
        <h3 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">{subtitle}</p>
        )}
      </header>

      {!hasData ? (
        <EmptyState
          icon={BarChart3}
          title="Sin datos"
          description="No hay información para mostrar en este periodo."
        />
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'bar' ? (
              <BarChart data={data} margin={{ top: 8, right: 12, left: -6, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    currency
                      ? new Intl.NumberFormat('es-MX', {
                          notation: 'compact',
                          style: 'currency',
                          currency: 'MXN',
                          maximumFractionDigits: 0,
                        }).format(v)
                      : v
                  }
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                  formatter={(v) => currency ? `$${Number(v).toLocaleString('es-MX')}` : v}
                />
                <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={data} margin={{ top: 8, right: 12, left: -6, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    currency
                      ? new Intl.NumberFormat('es-MX', {
                          notation: 'compact',
                          style: 'currency',
                          currency: 'MXN',
                          maximumFractionDigits: 0,
                        }).format(v)
                      : v
                  }
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                  formatter={(v) => currency ? `$${Number(v).toLocaleString('es-MX')}` : v}
                />
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: color, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: color, stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}