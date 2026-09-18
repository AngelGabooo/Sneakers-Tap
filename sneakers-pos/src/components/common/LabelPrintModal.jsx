import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Printer, X, Loader2 } from 'lucide-react'
import Button from './Button'
import BarcodeDisplay from './BarcodeDisplay'
import QrCodeDisplay from './QrCodeDisplay'

const PRINT_SERVER = 'http://localhost:3001'

// Etiqueta DK-1201: 29mm × 90mm → proporción 3.103 : 1
const LABEL_W = 360
const LABEL_H = 116  // 360 / 3.103 ≈ 116

export default function LabelPrintModal({
  open,
  onClose,
  product = {},
  code = '',
  codeType = 'barcode',
}) {
  const printRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const handlePrint = async () => {
    setError('')
    setLoading(true)
    try {
      const dataUrl = await toPng(printRef.current, {
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        cacheBust: true,
        width: LABEL_W,
        height: LABEL_H,
      })

      const res = await fetch(`${PRINT_SERVER}/print-label`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl: dataUrl }),
      })

      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Error al imprimir')

      onClose?.()
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-cardHover">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border">
          <div className="flex items-center gap-2">
            <Printer size={16} className="text-brand-blue" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
              Imprimir etiqueta (QL-800 · DK-1201)
            </h3>
            <span className="text-[10px] text-gray-400 dark:text-dark-muted">
              29 × 90 mm
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

        {/* Preview */}
        <div className="p-6 bg-gray-50 dark:bg-dark-surface flex items-center justify-center">
          {/*
            Este div es EXACTAMENTE lo que se exporta.
            Fondo blanco forzado, tipografía sans, layout horizontal.
          */}
          <div
            ref={printRef}
            style={{
              width: `${LABEL_W}px`,
              height: `${LABEL_H}px`,
              background: '#ffffff',
              color: '#111827',
              padding: '8px 14px',
              boxSizing: 'border-box',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              overflow: 'hidden',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
            }}
          >
            {/* ─── Columna izquierda: info del producto ─── */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '2px',
              }}
            >
              {/* Marca */}
              <div
                style={{
                  fontSize: '8px',
                  fontWeight: 800,
                  letterSpacing: '0.8px',
                  color: '#2563EB',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}
              >
                SNEAKERS
              </div>

              {/* Nombre del producto (máx 2 líneas) */}
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  lineHeight: 1.15,
                  color: '#111827',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {product.name || 'Nombre del producto'}
              </div>

              {/* Marca · Categoría */}
              <div
                style={{
                  fontSize: '9px',
                  color: '#374151',
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {product.brand || 'Marca'} · {product.category || 'Categoría'}
              </div>

              {/* SKU */}
              <div
                style={{
                  fontSize: '8px',
                  color: '#6B7280',
                  fontFamily: 'ui-monospace, monospace',
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                SKU: {product.sku || '—'}
              </div>
            </div>

            {/* ─── Separador vertical ─── */}
            <div
              style={{
                width: '1px',
                height: '80%',
                background: '#e5e7eb',
                flexShrink: 0,
              }}
            />

            {/* ─── Columna derecha: código + precio ─── */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                flexShrink: 0,
              }}
            >
              {codeType === 'qr' ? (
                <QrCodeDisplay value={code} size={64} />
              ) : (
                <BarcodeDisplay
                  value={code}
                  format="CODE128"
                  height={40}
                  width={1}
                  fontSize={8}
                />
              )}

              {product.salePrice != null && (
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: '#111827',
                    lineHeight: 1,
                    marginTop: '2px',
                  }}
                >
                  ${Number(product.salePrice).toLocaleString('es-MX')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info inferior */}
        <div className="px-6 pb-4 text-center">
          <p className="text-xs text-gray-500 dark:text-dark-muted">
            Se imprimirá directo en la <strong>Brother QL-800</strong> · rollo DK-1201 (29×90 mm).
          </p>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            icon={loading ? Loader2 : Printer}
            onClick={handlePrint}
            disabled={loading}
          >
            {loading ? 'Imprimiendo…' : 'Imprimir'}
          </Button>
        </div>
      </div>
    </div>
  )
}