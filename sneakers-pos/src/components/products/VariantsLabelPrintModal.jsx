import { useMemo, useRef, useState } from 'react'
import { Printer, X, Tag, AlertTriangle } from 'lucide-react'
import Button from '../common/Button'
import BarcodeDisplay from '../common/BarcodeDisplay'
import QrCodeDisplay from '../common/QrCodeDisplay'

/**
 * Expande cada variante en tantas etiquetas como stock tenga.
 * Ej: variante 25/Negro con stock 50 => 50 etiquetas idénticas.
 * Las variantes con stock 0 no generan etiquetas.
 */
function expandVariantsToLabels(variants = []) {
  const labels = []
  variants.forEach((v) => {
    const qty = Math.max(0, Number(v.stock) || 0)
    for (let i = 0; i < qty; i++) {
      labels.push({
        ...v,
        labelId: `${v.id}__${i + 1}`,
        copyNumber: i + 1,
      })
    }
  })
  return labels
}

export default function VariantsLabelPrintModal({
  open,
  onClose,
  product = {},
  variants = [],
  codeType = 'barcode',
}) {
  const printRef = useRef(null)
  const [confirmingLarge, setConfirmingLarge] = useState(false)

  const labels = useMemo(() => expandVariantsToLabels(variants), [variants])
  const totalLabels = labels.length

  if (!open) return null

  const handlePrint = () => {
    if (totalLabels > 200 && !confirmingLarge) {
      setConfirmingLarge(true)
      return
    }

    const content = printRef.current?.innerHTML
    if (!content) return

    const printWindow = window.open('', '_blank', 'width=800,height=900')
    printWindow.document.write(`
      <html>
        <head>
          <title>Etiquetas — ${product.name || 'Producto'}</title>
          <style>
            @page { size: A4; margin: 8mm; }
            * { box-sizing: border-box; }
            body {
              font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
              margin: 0;
              padding: 0;
              background: #fff;
              color: #111827;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 6mm;
            }
            .label {
              width: 60mm;
              height: 40mm;
              border: 1px dashed #d1d5db;
              border-radius: 3mm;
              padding: 3mm 4mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              page-break-inside: avoid;
            }
            .brand {
              font-size: 8px;
              font-weight: 800;
              letter-spacing: 1px;
              color: #2563EB;
              text-transform: uppercase;
              margin-bottom: 1mm;
            }
            .name {
              font-size: 11px;
              font-weight: 700;
              line-height: 1.15;
              max-width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .variant {
              font-size: 10px;
              font-weight: 700;
              color: #1E3A8A;
              margin: 1mm 0 2mm;
            }
            .code svg { display: block; margin: 0 auto; max-width: 100%; }
            .sku {
              font-size: 8px;
              font-family: monospace;
              color: #374151;
              margin-top: 1mm;
            }
            @media print {
              .label { border: 1px solid #e5e7eb; }
            }
          </style>
        </head>
        <body>
          <div class="grid">${content}</div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 350)
  }

  const hasLabels = totalLabels > 0
  const variantsWithStock = variants.filter((v) => Number(v.stock) > 0)

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="
        w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl overflow-hidden
        bg-white dark:bg-dark-card
        border border-gray-200 dark:border-dark-border
        shadow-cardHover
      ">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border shrink-0">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-brand-blue" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
              Imprimir etiquetas
            </h3>
            <span className="text-xs text-gray-500 dark:text-dark-muted">
              ({totalLabels} {totalLabels === 1 ? 'etiqueta' : 'etiquetas'})
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-brand-black dark:hover:text-dark-text transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Aviso de muchas etiquetas */}
        {confirmingLarge && (
          <div className="
            flex items-start gap-2 px-5 py-3
            bg-amber-50 dark:bg-amber-950/30
            border-b border-amber-200 dark:border-amber-900/50
            text-amber-800 dark:text-amber-300 text-xs
          ">
            <AlertTriangle size={14} strokeWidth={2.2} className="mt-0.5 shrink-0" />
            <span>
              Vas a imprimir <strong>{totalLabels}</strong> etiquetas. Esto puede tardar unos segundos.
              Vuelve a pulsar <strong>Imprimir todas</strong> para continuar.
            </span>
          </div>
        )}

        {/* Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-surface">
          {!hasLabels ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-sm text-gray-500 dark:text-dark-muted">
                No hay etiquetas para imprimir.
              </p>
              <p className="text-xs text-gray-400 dark:text-dark-muted">
                Asigna stock a las variantes en la sección <strong>Variantes</strong> para generar etiquetas.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-500 dark:text-dark-muted mb-4">
                Se imprimirá una etiqueta por cada par en stock.
                {variantsWithStock.length > 0 && (
                  <>
                    {' '}Desglose:{' '}
                    {variantsWithStock.map((v, i) => (
                      <span key={v.id}>
                        {i > 0 && ' · '}
                        <strong>{v.label}</strong> × {v.stock}
                      </span>
                    ))}
                  </>
                )}
              </p>

              <div
                ref={printRef}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {labels.map((v) => (
                  <div
                    key={v.labelId}
                    className="
                      bg-white dark:bg-white rounded-lg border border-gray-200 p-4
                      flex flex-col items-center text-center
                    "
                  >
                    <p className="text-[10px] font-bold tracking-wider text-brand-blue uppercase">
                      SNEAKERS
                    </p>
                    <p className="text-sm font-bold text-brand-black leading-tight mt-0.5 max-w-full truncate">
                      {product.name || 'Producto'}
                    </p>
                    <p className="text-xs font-bold text-brand-blueDark mt-1">
                      Talla {v.size} · {v.color}
                    </p>

                    <div className="my-2">
                      {codeType === 'qr' ? (
                        <QrCodeDisplay value={v.barcode} size={90} />
                      ) : (
                        <BarcodeDisplay
                          value={v.barcode}
                          format="CODE128"
                          height={45}
                          width={1.2}
                          fontSize={9}
                        />
                      )}
                    </div>

                    <p className="text-[10px] font-mono text-gray-700">
                      {v.sku}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border shrink-0">
          <p className="text-xs text-gray-500 dark:text-dark-muted">
            {hasLabels
              ? <>Se imprimirán <strong>{totalLabels}</strong> {totalLabels === 1 ? 'etiqueta' : 'etiquetas'} (60×40 mm · A4 · 3 por fila).</>
              : 'Sin etiquetas para imprimir.'}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              icon={Printer}
              onClick={handlePrint}
              disabled={!hasLabels}
            >
              {confirmingLarge ? 'Confirmar impresión' : 'Imprimir todas'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}