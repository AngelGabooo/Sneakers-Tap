import { useRef } from 'react'
import { Printer, X } from 'lucide-react'
import Button from './Button'
import BarcodeDisplay from './BarcodeDisplay'
import QrCodeDisplay from './QrCodeDisplay'

/**
 * Modal para imprimir la etiqueta del producto.
 * Muestra un preview y abre el diálogo de impresión del navegador.
 */
export default function LabelPrintModal({
  open,
  onClose,
  product = {},
  code = '',
  codeType = 'barcode', // 'barcode' | 'qr'
}) {
  const printRef = useRef(null)

  if (!open) return null

  const handlePrint = () => {
    const content = printRef.current?.innerHTML
    if (!content) return

    const printWindow = window.open('', '_blank', 'width=400,height=600')
    printWindow.document.write(`
      <html>
        <head>
          <title>Etiqueta — ${product.name || 'Producto'}</title>
          <style>
            @page { size: 60mm 40mm; margin: 0; }
            body {
              font-family: Inter, -apple-system, sans-serif;
              margin: 0;
              padding: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: #fff;
            }
            .label {
              width: 54mm;
              text-align: center;
              color: #111827;
            }
            .label .brand {
              font-size: 9px;
              font-weight: 700;
              letter-spacing: 0.5px;
              color: #2563EB;
              margin-bottom: 2px;
              text-transform: uppercase;
            }
            .label .name {
              font-size: 11px;
              font-weight: 700;
              line-height: 1.15;
              margin-bottom: 2px;
            }
            .label .meta {
              font-size: 9px;
              color: #374151;
              margin-bottom: 4px;
            }
            .label .price {
              font-size: 14px;
              font-weight: 800;
              margin-top: 3px;
            }
            .label svg { display: block; margin: 0 auto; }
            @media print {
              body { padding: 0; }
              button { display: none !important; }
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 250)
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="
        w-full max-w-md rounded-xl overflow-hidden
        bg-white dark:bg-dark-card
        border border-gray-200 dark:border-dark-border
        shadow-cardHover
      ">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border">
          <div className="flex items-center gap-2">
            <Printer size={16} className="text-brand-blue" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
              Imprimir etiqueta
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-brand-black dark:hover:text-dark-text transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Preview */}
        <div className="p-6 bg-gray-50 dark:bg-dark-surface">
          <div
            ref={printRef}
            className="
              mx-auto max-w-[260px] bg-white rounded-lg p-4
              border border-gray-200 dark:border-dark-border text-center
            "
          >
            <div className="label">
              <p className="brand text-[10px] font-bold tracking-wider text-brand-blue uppercase">
                SNEAKERS
              </p>
              <p className="name text-sm font-bold text-brand-black leading-tight">
                {product.name || 'Nombre del producto'}
              </p>
              <p className="meta text-xs text-gray-600 mt-0.5">
                {product.brand || 'Marca'} · {product.category || 'Categoría'}
              </p>

              {codeType === 'qr' ? (
                <div className="flex justify-center my-2">
                  <QrCodeDisplay value={code} size={120} />
                </div>
              ) : (
                <div className="flex justify-center my-2">
                  <BarcodeDisplay value={code} format="CODE128" height={55} width={1.6} fontSize={11} />
                </div>
              )}

              <p className="text-[10px] text-gray-500 mt-1">
                SKU: {product.sku || '—'}
              </p>
              {product.salePrice && (
                <p className="price text-base font-extrabold text-brand-black mt-1.5">
                  ${Number(product.salePrice).toLocaleString('es-MX')}
                </p>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-gray-500 dark:text-dark-muted mt-4">
            Se abrirá el diálogo de impresión del navegador. Recomendado: etiqueta de 60×40 mm.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" icon={Printer} onClick={handlePrint}>
            Imprimir
          </Button>
        </div>
      </div>
    </div>
  )
}