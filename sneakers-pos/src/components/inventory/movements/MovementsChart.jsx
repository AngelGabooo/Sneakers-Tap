import { BarChart3 } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts'
import Card from '../../common/Card'
import EmptyState from '../../common/EmptyState'

export default function MovementsChart({ data = [] }) {
  const hasData = data.length > 0

  return (
    <Card className="mb-5">
      <header className="mb-4">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Actividad de inventario
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Entradas y salidas por día en el periodo seleccionado.
        </p>
      </header>

      {hasData ? (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="in"  name="Entradas" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="out" name="Salidas"  fill="#DC2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState
          icon={BarChart3}
          title="Sin actividad en el periodo"
          description="Registra movimientos para ver la gráfica."
        />
      )}
    </Card>
  )
}