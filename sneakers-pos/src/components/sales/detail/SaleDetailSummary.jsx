import Card from '../../common/Card'

export default function SaleDetailSummary({ sale }) {
  const totals = sale?.totals || { subtotal: 0, discountAmount: 0, tax: 0, total: 0 }

  return (
    <Card>
      <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text mb-4">
        Resumen de la venta
      </h2>

      <div className="space-y-2">
        <Row label="Subtotal"   value={totals.subtotal} />
        {totals.discountAmount > 0 && (
          <Row label="Descuentos" value={-totals.discountAmount} tone="danger" />
        )}
        {totals.tax > 0 && (
          <Row label="Impuestos" value={totals.tax} />
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
        <span className="text-base font-medium text-gray-600 dark:text-dark-muted">
          Total
        </span>
        <span className="text-2xl font-bold text-brand-black dark:text-dark-text">
          ${Number(totals.total || 0).toLocaleString('es-MX')}
        </span>
      </div>
    </Card>
  )
}

function Row({ label, value, tone = 'neutral' }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500 dark:text-dark-muted">{label}</span>
      <span className={`font-medium ${tone === 'danger' ? 'text-brand-red' : 'text-brand-black dark:text-dark-text'}`}>
        {value < 0 ? '-' : ''}${Math.abs(value).toLocaleString('es-MX')}
      </span>
    </div>
  )
}