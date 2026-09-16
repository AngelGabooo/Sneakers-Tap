// src/components/reports/ReportPrintDocument.jsx
import { forwardRef } from 'react'
import { useSettings } from '../../context/SettingsContext'

const ReportPrintDocument = forwardRef(function ReportPrintDocument(
  {
    categoryLabel,
    reportTitle,
    periodLabel,
    filtersLabel,
    generatedAt,
    generatedBy,
    kpis = [],
    tableColumns = [],
    tableRows = [],
    chartSvg = null,
  },
  ref,
) {
  const { settings } = useSettings()
  const { store, ticket } = settings

  // Datos de la tienda con fallbacks limpios
  const storeName    = ticket.header.name || store.commercialName || ''
  const storeTagline = ticket.header.tagline || ''
  const storeAddress = [
    store.address?.street,
    store.address?.exteriorNumber,
    store.address?.neighborhood,
    store.address?.city,
    store.address?.state,
  ].filter(Boolean).join(', ')
  const storePhone = store.phone || ''
  const storeRfc   = store.rfc || ''

  const is58 = ticket.width === 58

  return (
    <div
      ref={ref}
      style={{
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        padding: '12mm 14mm',
        backgroundColor: '#ffffff',
        color: '#111827',
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        fontSize: '11px',
        lineHeight: 1.4,
        colorScheme: 'light',
      }}
    >
      {/* ======================= ENCABEZADO ======================= */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '12px', borderBottom: '2px solid #2563EB' }}>
        <div>
          {/* Logo opcional */}
          {ticket.header.showLogo && store.logoUrl && (
            <img
              src={store.logoUrl}
              alt="Logo"
              style={{ maxHeight: '60px', maxWidth: '180px', marginBottom: '6px' }}
            />
          )}

          {/* Nombre de la tienda (SOLO si está configurado) */}
          {storeName && (
            <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '0.5px', color: '#2563EB' }}>
              {storeName}
            </div>
          )}

          {/* Tagline (opcional) */}
          {storeTagline && (
            <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '2px' }}>
              {storeTagline}
            </div>
          )}

          {/* Dirección (opcional) */}
          {storeAddress && (
            <div style={{ fontSize: '10px', color: '#6B7280' }}>
              {storeAddress}
            </div>
          )}

          {/* Teléfono (opcional) */}
          {storePhone && (
            <div style={{ fontSize: '10px', color: '#6B7280' }}>
              Tel: {storePhone}
            </div>
          )}

          {/* RFC (opcional) */}
          {storeRfc && (
            <div style={{ fontSize: '10px', color: '#6B7280' }}>
              RFC: {storeRfc}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', color: '#6B7280', fontWeight: 600 }}>
            Reporte generado
          </div>
          <div style={{ fontSize: '11px', fontWeight: 700, marginTop: '2px' }}>
            {generatedAt.date}
          </div>
          <div style={{ fontSize: '11px', color: '#374151' }}>
            {generatedAt.time}
          </div>
          <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '6px' }}>
            Por: <span style={{ fontWeight: 600, color: '#111827' }}>{generatedBy}</span>
          </div>
        </div>
      </header>

      {/* ======================= TÍTULO DEL REPORTE ======================= */}
      <section style={{ marginTop: '16px' }}>
        <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', color: '#6B7280', fontWeight: 600 }}>
          {categoryLabel}
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '2px 0 4px' }}>
          {reportTitle}
        </h1>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
          <Chip label="Periodo" value={periodLabel} />
          {filtersLabel && <Chip label="Filtros" value={filtersLabel} />}
        </div>
      </section>

      {/* ======================= KPIs ======================= */}
      {kpis.length > 0 && (
        <section style={{ marginTop: '16px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(kpis.length, 4)}, 1fr)`,
              gap: '8px',
            }}
          >
            {kpis.map((kpi) => (
              <div
                key={kpi.key}
                style={{
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  backgroundColor: '#F8FAFC',
                }}
              >
                <div style={{ fontSize: '9px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                  {kpi.label}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginTop: '3px' }}>
                  {kpi.value ?? '—'}
                </div>
                {kpi.helper && (
                  <div style={{ fontSize: '9px', color: '#6B7280', marginTop: '1px' }}>
                    {kpi.helper}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ======================= GRÁFICO ======================= */}
      {chartSvg && (
        <section style={{ marginTop: '18px', pageBreakInside: 'avoid' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
            Gráfico
          </div>
          <div
            style={{
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              padding: '8px',
              backgroundColor: '#FFFFFF',
            }}
          >
            {chartSvg}
          </div>
        </section>
      )}

      {/* ======================= TABLA ======================= */}
      {tableColumns.length > 0 && tableRows.length > 0 && (
        <section style={{ marginTop: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
            Detalle del reporte
          </div>

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '10px',
              border: '1px solid #E5E7EB',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC' }}>
                {tableColumns.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      padding: '6px 8px',
                      textAlign: col.align === 'right' ? 'right' : 'left',
                      borderBottom: '1px solid #E5E7EB',
                      fontSize: '9px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#6B7280',
                      fontWeight: 700,
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, idx) => (
                <tr
                  key={row.id ?? idx}
                  style={{
                    backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFB',
                    pageBreakInside: 'avoid',
                  }}
                >
                  {tableColumns.map((col) => {
                    const rawValue = row[col.key]
                    const displayValue =
                      col.render && typeof col.render === 'function'
                        ? col.renderPrint
                          ? col.renderPrint(row)
                          : rawValue
                        : rawValue

                    return (
                      <td
                        key={col.key}
                        style={{
                          padding: '6px 8px',
                          textAlign: col.align === 'right' ? 'right' : 'left',
                          borderBottom: '1px solid #F3F4F6',
                          color: col.emphasis ? '#111827' : '#374151',
                          fontWeight: col.emphasis ? 600 : 400,
                        }}
                      >
                        {displayValue ?? '—'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ fontSize: '9px', color: '#6B7280', marginTop: '6px', textAlign: 'right' }}>
            {tableRows.length} registros
          </div>
        </section>
      )}

      {/* ======================= PIE DE PÁGINA ======================= */}
      <footer
        style={{
          marginTop: '24px',
          paddingTop: '8px',
          borderTop: '1px solid #E5E7EB',
          fontSize: '9px',
          color: '#6B7280',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>
          {storeName ? `${storeName} · Reporte generado automáticamente` : 'Reporte generado automáticamente'}
        </span>
        <span>{generatedAt.date} · {generatedAt.time}</span>
      </footer>
    </div>
  )
})

export default ReportPrintDocument

/* ------------------------------------------------------------------ */
/* Subcomponentes                                                     */
/* ------------------------------------------------------------------ */

function Chip({ label, value }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        borderRadius: '999px',
        border: '1px solid #E5E7EB',
        backgroundColor: '#F8FAFC',
        fontSize: '9px',
        color: '#374151',
      }}
    >
      <span style={{ color: '#6B7280', fontWeight: 600 }}>{label}:</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  )
}