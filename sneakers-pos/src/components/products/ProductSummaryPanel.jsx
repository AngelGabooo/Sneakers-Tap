import Card from '../common/Card'

export default function ProductSummaryPanel({ summary }) {
  const rows = [
    { label: 'Producto',   value: summary.name || '—' },
    { label: 'Categoría',  value: summary.category || '—' },
    { label: 'Marca',      value: summary.brand || '—' },
    { label: 'Precio',     value: summary.price || '—' },
    { label: 'Variantes',  value: summary.variantsCount ?? '—' },
    { label: 'Stock total', value: summary.totalStock ?? '—' },
  ]

  return (
    <Card>
      <header className="mb-4">
        <h2 className="text-base font-semibold text-brand-black dark:text-dark-text">
          Resumen
        </h2>
      </header>

      <ul className="space-y-2.5">
        {rows.map((r) => (
          <li key={r.label} className="flex items-start justify-between gap-3 text-sm">
            <span className="text-gray-500 dark:text-dark-muted shrink-0">{r.label}</span>
            <span className="font-medium text-brand-black dark:text-dark-text text-right truncate">
              {r.value}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}