import Card from '../../common/Card'

export default function ProductDetailSalesTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label="Unidades vendidas" value="—" />
        <Metric label="Ingresos"          value="—" />
        <Metric label="Ticket promedio"   value="—" />
        <Metric label="Ventas este mes"   value="—" />
      </div>

      <Card>
        <header className="mb-4">
          <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Ventas en el tiempo
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Últimos 30 días
          </p>
        </header>

        <div className="flex items-center justify-center h-64 rounded-lg border border-dashed border-gray-200 dark:border-dark-border">
          <p className="text-sm text-gray-500 dark:text-dark-muted">
            Aún no hay datos de ventas para este producto.
          </p>
        </div>
      </Card>

      <Card padded={false}>
        <div className="p-5 lg:p-6 pb-0">
          <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Rendimiento por variante
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Distribución de ventas por talla y color.
          </p>
        </div>

        <p className="text-sm text-gray-500 dark:text-dark-muted px-5 lg:px-6 py-8">
          Sin datos para mostrar.
        </p>
      </Card>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <Card className="!p-4">
      <p className="text-xs text-gray-500 dark:text-dark-muted">{label}</p>
      <p className="text-lg font-bold text-brand-black dark:text-dark-text mt-1">{value}</p>
    </Card>
  )
}