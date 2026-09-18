import { useMemo, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Printer, X, Tag, AlertTriangle, Loader2 } from 'lucide-react'
import Button from '../common/Button'
import BarcodeDisplay from '../common/BarcodeDisplay'
import QrCodeDisplay from '../common/QrCodeDisplay'

const PRINT_SERVER = 'http://localhost:3001'

// Etiqueta DK-1201: 29mm × 90mm → proporción 3.103 : 1
const LABEL_W = 360
const LABEL_H = 120  // un poco más alto para que respire

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
  const [confirmingLarge, setConfirmingLarge] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  // Un ref por cada etiqueta renderizada
  const labelRefs = useRef({})

  const labels = useMemo(() => expandVariantsToLabels(variants), [variants])
  const totalLabels = labels.length

  if (!open) return null

  const handlePrint = async () => {
    if (totalLabels > 200 && !confirmingLarge) {
      setConfirmingLarge(true)
      return
    }

    setError('')
    setLoading(true)
    setProgress({ current: 0, total: totalLabels })

    try {
      // 1) Convertir cada etiqueta a PNG (sin rotar; el driver rota)
      const images = []
      for (let i = 0; i < labels.length; i++) {
        const label = labels[i]
        const node = labelRefs.current[label.labelId]
        if (!node) continue

        const dataUrl = await toPng(node, {
          pixelRatio: 3,
          backgroundColor: '#ffffff',
          cacheBust: true,
          width: LABEL_W,
          height: LABEL_H,
        })
        images.push(dataUrl)
        setProgress({ current: i + 1, total: totalLabels })
      }

      if (images.length === 0) {
        throw new Error('No se pudo generar ninguna etiqueta')
      }

      // 2) Enviar todas al print server en un solo POST
      const res = await fetch(`${PRINT_SERVER}/print-label`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images }),
      })

      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Error al imprimir')

      onClose?.()
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
      setProgress({ current: 0, total: 0 })
    }
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
              Imprimir etiquetas (QL-800 · DK-1201)
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
              Vuelve a pulsar <strong>Confirmar impresión</strong> para continuar.
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

              {/* Grid de previews — cada uno con su ref para exportar a PNG */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {labels.map((v) => (
                  <div
                    key={v.labelId}
                    ref={(el) => { labelRefs.current[v.labelId] = el }}
                    style={{
                      width: `${LABEL_W}px`,
                      height: `${LABEL_H}px`,
                      background: '#ffffff',
                      color: '#111827',
                      padding: '12px 20px',
                      boxSizing: 'border-box',
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      overflow: 'hidden',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      margin: '0 auto',
                    }}
                  >
                    {/* Columna izquierda: info */}
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '2px',
                        paddingLeft: '4px',
                      }}
                    >
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
                        {product.name || 'Producto'}
                      </div>

                      <div
                        style={{
                          fontSize: '9px',
                          fontWeight: 600,
                          color: '#1E3A8A',
                          lineHeight: 1.1,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        Talla {v.size} · {v.color}
                      </div>

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
                        {v.sku || '—'}
                      </div>
                    </div>

                    {/* Separador */}
                    <div
                      style={{
                        width: '1px',
                        height: '75%',
                        background: '#e5e7eb',
                        flexShrink: 0,
                      }}
                    />

                    {/* Columna derecha: código + precio */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        flexShrink: 0,
                        width: '140px',
                        paddingRight: '4px',
                      }}
                    >
                      {codeType === 'qr' ? (
                        <QrCodeDisplay value={v.barcode} size={56} />
                      ) : (
                        <BarcodeDisplay
                          value={v.barcode}
                          format="CODE128"
                          height={36}
                          width={0.85}
                          fontSize={7}
                        />
                      )}

                      {product.salePrice != null && (
                        <div
                          style={{
                            fontSize: '15px',
                            fontWeight: 800,
                            color: '#111827',
                            lineHeight: 1,
                            marginTop: '4px',
                          }}
                        >
                          ${Number(product.salePrice).toLocaleString('es-MX')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border shrink-0">
          <p className="text-xs text-gray-500 dark:text-dark-muted">
            {hasLabels ? (
              loading ? (
                <>Generando imagen {progress.current}/{progress.total}…</>
              ) : (
                <>
                  Se imprimirán <strong>{totalLabels}</strong>{' '}
                  {totalLabels === 1 ? 'etiqueta' : 'etiquetas'} · DK-1201 (29×90 mm)
                </>
              )
            ) : (
              'Sin etiquetas para imprimir.'
            )}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              icon={loading ? Loader2 : Printer}
              onClick={handlePrint}
              disabled={!hasLabels || loading}
            >
              {loading
                ? 'Imprimiendo…'
                : confirmingLarge
                  ? 'Confirmar impresión'
                  : 'Imprimir todas'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="px-5 py-3 bg-red-50 dark:bg-red-950/30 border-t border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}