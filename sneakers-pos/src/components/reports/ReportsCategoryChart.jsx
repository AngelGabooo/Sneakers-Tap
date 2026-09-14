import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { Package } from 'lucide-react'
import Card from '../common/Card'
import EmptyState from '../common/EmptyState'

export default function ReportsCategoryChart({ data = [], onCategoryClick }) {
  const hasData = data.length > 0

  return (
    <Card>
      <header className="mb-4">
        <h3 className="text-base font-semibold text-brand-black dark:text-dark-text">
          Ventas por categoría
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Ingresos por categoría de producto.
        </p>
      </header>

      {!hasData ? (
        <EmptyState
          icon={Package}
          title="Sin datos"
          description="No hay ventas por categoría en el periodo."
        />
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
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
                contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                formatter={(v) => `$${Number(v).toLocaleString('es-MX')}`}
              />
              <Bar
                dataKey="value"
                fill="#2563EB"
                radius={[4, 4, 0, 0]}
                onClick={(entry) => onCategoryClick?.(entry?.label)}
                cursor={onCategoryClick ? 'pointer' : 'default'}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}