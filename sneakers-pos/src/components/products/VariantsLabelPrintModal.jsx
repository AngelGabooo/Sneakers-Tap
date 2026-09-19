import { useMemo, useRef, useState, useEffect } from 'react'
import { toPng } from 'html-to-image'
import {
  Printer,
  X,
  Tag,
  AlertTriangle,
  Loader2,
  CheckSquare,
  Square,
  Barcode as BarcodeIcon,
  QrCode as QrCodeIcon,
} from 'lucide-react'
import Button from '../common/Button'
import BarcodeDisplay from '../common/BarcodeDisplay'
import QrCodeDisplay from '../common/QrCodeDisplay'

const PRINT_SERVER = 'http://localhost:3001'

// Etiqueta DK-1201: 29mm × 90mm → proporción 3.103 : 1
const LABEL_W = 360
const LABEL_H = 120

// Cuántas copias idénticas caben en la MISMA etiqueta
const COPIES_PER_LABEL = 3

/**
 * Agrupa los bloques en etiquetas físicas.
 * Cada etiqueta contiene COPIES_PER_LABEL copias IDÉNTICAS de la MISMA variante.
 */
function buildSheets(variants = [], copiesByVariantId = {}, perSheet = 3) {
  const sheets = []

  variants.forEach((v) => {
    const totalCopies = Math.max(0, Number(copiesByVariantId[v.id]) || 0)
    if (totalCopies === 0) return

    for (let i = 0; i < totalCopies; i += perSheet) {
      const chunkSize = Math.min(perSheet, totalCopies - i)
      const sheet = []
      for (let j = 0; j < chunkSize; j++) {
        sheet.push({
          ...v,
          blockId: `${v.id}__${i + j + 1}`,
          copyNumber: i + j + 1,
        })
      }
      sheets.push(sheet)
    }
  })

  return sheets
}

/**
 * Un bloque individual: marca + producto + talla + color + SKU + código.
 */
function CodeBlock({ v, product, codeType }) {
  return (
    <div
      style={{
        flex: '1 1 0',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '1px',
        padding: '0 2px',
        textAlign: 'center',
      }}
    >
      {/* Marca tienda */}
      <div
        style={{
          fontSize: '6px',
          fontWeight: 800,
          letterSpacing: '0.8px',
          color: '#2563EB',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}
      >
        SNEAKERS
      </div>

      {/* Nombre del producto */}
      <div
        style={{
          fontSize: '8px',
          fontWeight: 700,
          color: '#111827',
          lineHeight: 1.1,
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {product.name || 'Producto'}
      </div>

      {/* Talla · Color */}
      <div
        style={{
          fontSize: '7px',
          fontWeight: 700,
          color: '#1E3A8A',
          lineHeight: 1.1,
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        Talla {v.size} · {v.color}
      </div>

      {/* SKU */}
      <div
        style={{
          fontSize: '5.5px',
          color: '#6B7280',
          fontFamily: 'ui-monospace, monospace',
          lineHeight: 1.1,
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {v.sku || '—'}
      </div>

      {/* Código */}
      <div
        style={{
          marginTop: '2px',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {codeType === 'qr' ? (
          <QrCodeDisplay value={v.barcode} size={58} />
        ) : (
          <BarcodeDisplay
            value={v.barcode}
            format="CODE128"
            height={32}
            width={1.0}
            fontSize={6}
          />
        )}
      </div>
    </div>
  )
}

/**
 * Una etiqueta física con N bloques (todos de la MISMA variante).
 */
function LabelContent({ sheet, product, codeType }) {
  return (
    <div
      style={{
        width: `${LABEL_W}px`,
        height: `${LABEL_H}px`,
        background: '#ffffff',
        color: '#111827',
        padding: '6px 8px',
        boxSizing: 'border-box',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'space-around',
        gap: '4px',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        borderRadius: '4px',
      }}
    >
      {sheet.map((v, i) => (
        <div
          key={v.blockId}
          style={{
            flex: '1 1 0',
            minWidth: 0,
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'center',
            borderLeft: i > 0 ? '1px dashed #d1d5db' : 'none',
            paddingLeft: i > 0 ? '4px' : 0,
          }}
        >
          <CodeBlock v={v} product={product} codeType={codeType} />
        </div>
      ))}
    </div>
  )
}

export default function VariantsLabelPrintModal({
  open,
  onClose,
  product = {},
  variants = [],
  codeType: initialCodeType = 'barcode',
}) {
  const [confirmingLarge, setConfirmingLarge] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const [codeType, setCodeType] = useState(initialCodeType)

  const [selection, setSelection] = useState({})
  const [bulkCopies, setBulkCopies] = useState(1)

  const sheetRefs = useRef({})

  // Sincronizar codeType inicial
  useEffect(() => {
    setCodeType(initialCodeType)
  }, [initialCodeType])

  // Inicializa la selección cuando se abre el modal o cambian las variantes
  useEffect(() => {
    if (!open) return
    const next = {}
    variants.forEach((v) => {
      const stock = Math.max(0, Number(v.stock) || 0)
      next[v.id] = {
        selected: stock > 0,
        copies: 1, // 1 = 1 etiqueta física (con 3 bloques idénticos)
      }
    })
    setSelection(next)
  }, [open, variants])

  // Total de etiquetas físicas (suma de copias seleccionadas)
  const totalLabels = useMemo(() => {
    return Object.values(selection).reduce((acc, s) => {
      return acc + (s.selected ? Math.max(0, Number(s.copies) || 0) : 0)
    }, 0)
  }, [selection])

  // Etiquetas físicas armadas (cada una con 3 copias idénticas)
  const sheets = useMemo(() => {
    const copiesByVariantId = {}
    Object.entries(selection).forEach(([id, s]) => {
      if (s.selected) copiesByVariantId[id] = s.copies
    })
    const selectedVariants = variants.filter((v) => selection[v.id]?.selected)
    return buildSheets(selectedVariants, copiesByVariantId, COPIES_PER_LABEL)
  }, [variants, selection])

  const allSelected = variants.length > 0 && variants.every((v) => selection[v.id]?.selected)

  const toggleAll = () => {
    const next = { ...selection }
    const target = !allSelected
    variants.forEach((v) => {
      next[v.id] = {
        ...next[v.id],
        selected: target,
        copies: next[v.id]?.copies || 1,
      }
    })
    setSelection(next)
  }

  const toggleOne = (id) => {
    setSelection((prev) => ({
      ...prev,
      [id]: { ...prev[id], selected: !prev[id]?.selected },
    }))
  }

  const setCopies = (id, value) => {
    const num = Math.max(0, Math.min(999, Number(value) || 0))
    setSelection((prev) => ({
      ...prev,
      [id]: { ...prev[id], copies: num, selected: num > 0 ? true : prev[id]?.selected },
    }))
  }

  const applyBulkCopies = () => {
    const num = Math.max(1, Math.min(999, Number(bulkCopies) || 1))
    setSelection((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((id) => {
        next[id] = { ...next[id], copies: num }
      })
      return next
    })
  }

  if (!open) return null

  const handlePrint = async () => {
    if (totalLabels === 0) {
      setError('Selecciona al menos una variante con copias > 0')
      return
    }
    if (totalLabels > 100 && !confirmingLarge) {
      setConfirmingLarge(true)
      return
    }

    setError('')
    setLoading(true)
    setProgress({ current: 0, total: totalLabels })

    try {
      // 🔑 Esperar a que el navegador pinte los QR/barcodes del contenedor oculto
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      )
      // 🔑 Delay extra para SVGs complejos (QR grandes)
      await new Promise((r) => setTimeout(r, 350))

      const images = []
      for (let i = 0; i < sheets.length; i++) {
        const sheet = sheets[i]
        const sheetKey = sheet.map((s) => s.blockId).join('|')
        const node = sheetRefs.current[sheetKey]
        if (!node) {
          console.warn('⚠️ No se encontró nodo para sheet', sheetKey)
          continue
        }

        // 🔍 DEBUG: cuántos SVGs hay en cada sheet
        const svgCount = node.querySelectorAll('svg').length
        console.log(`📸 Sheet ${i} — ${svgCount} SVG(s)`)

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

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="
        w-full max-w-6xl max-h-[92vh] flex flex-col rounded-xl overflow-hidden
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
              ({totalLabels} {totalLabels === 1 ? 'etiqueta' : 'etiquetas'} ·{' '}
              {COPIES_PER_LABEL} copias por etiqueta)
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

        {/* Barra de acciones */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card shrink-0">
          {/* Tipo de código */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600 dark:text-dark-muted">
              Tipo de código:
            </span>
            <div className="inline-flex rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card p-0.5">
              <button
                type="button"
                onClick={() => setCodeType('barcode')}
                className={`
                  inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium transition-colors
                  ${codeType === 'barcode'
                    ? 'bg-brand-blue text-white'
                    : 'text-gray-600 dark:text-dark-muted hover:text-brand-blue'}
                `}
              >
                <BarcodeIcon size={13} strokeWidth={2} />
                Código de barras
              </button>
              <button
                type="button"
                onClick={() => setCodeType('qr')}
                className={`
                  inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium transition-colors
                  ${codeType === 'qr'
                    ? 'bg-brand-blue text-white'
                    : 'text-gray-600 dark:text-dark-muted hover:text-brand-blue'}
                `}
              >
                <QrCodeIcon size={13} strokeWidth={2} />
                QR
              </button>
            </div>
          </div>

          <span className="text-xs text-gray-300 dark:text-dark-border hidden sm:inline">|</span>

          <button
            type="button"
            onClick={toggleAll}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-blue hover:underline"
          >
            {allSelected ? <CheckSquare size={14} /> : <Square size={14} />}
            {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
          </button>

          <span className="text-xs text-gray-300 dark:text-dark-border hidden sm:inline">|</span>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 dark:text-dark-muted">
              Etiquetas para todas:
            </label>
            <input
              type="number"
              min={1}
              max={999}
              value={bulkCopies}
              onChange={(e) => setBulkCopies(e.target.value)}
              className="
                w-14 h-8 px-2 rounded-md text-xs text-center font-semibold
                bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                border border-gray-200 dark:border-dark-border
                focus:border-brand-blue outline-none
              "
            />
            <button
              type="button"
              onClick={applyBulkCopies}
              className="
                h-8 px-3 rounded-md text-xs font-medium
                bg-brand-blue text-white hover:bg-blue-700 transition-colors
              "
            >
              Aplicar
            </button>
          </div>

          <span className="text-xs text-gray-500 dark:text-dark-muted ml-auto">
            {Object.values(selection).filter((s) => s.selected).length} de {variants.length} seleccionadas
          </span>
        </div>

        {/* Aviso */}
        {confirmingLarge && (
          <div className="
            flex items-start gap-2 px-5 py-3
            bg-amber-50 dark:bg-amber-950/30
            border-b border-amber-200 dark:border-amber-900/50
            text-amber-800 dark:text-amber-300 text-xs
          ">
            <AlertTriangle size={14} strokeWidth={2.2} className="mt-0.5 shrink-0" />
            <span>
              Vas a imprimir <strong>{totalLabels}</strong> etiquetas físicas. Vuelve a pulsar{' '}
              <strong>Confirmar impresión</strong> para continuar.
            </span>
          </div>
        )}

        {/* Cuerpo */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-dark-surface">
          {variants.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-sm text-gray-500 dark:text-dark-muted">
                No hay variantes para imprimir.
              </p>
            </div>
          ) : (
            <div className="p-5 space-y-3">
              {variants.map((v) => {
                const sel = selection[v.id] || { selected: false, copies: 1 }
                const stock = Number(v.stock) || 0
                return (
                  <div
                    key={v.id}
                    className={`
                      flex flex-col lg:flex-row gap-3 p-4 rounded-xl border
                      bg-white dark:bg-dark-card transition-colors
                      ${sel.selected
                        ? 'border-brand-blue ring-1 ring-brand-blue/30'
                        : 'border-gray-200 dark:border-dark-border'}
                    `}
                  >
                    {/* Preview de un bloque individual */}
                    <div className="shrink-0 flex items-center justify-center lg:justify-start">
                      <div
                        style={{
                          width: '110px',
                          height: `${LABEL_H}px`,
                          background: '#ffffff',
                          color: '#111827',
                          padding: '6px 8px',
                          boxSizing: 'border-box',
                          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                        }}
                      >
                        <CodeBlock v={v} product={product} codeType={codeType} />
                      </div>
                    </div>

                    {/* Controles */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleOne(v.id)}
                          className="shrink-0 mt-0.5 text-brand-blue"
                          aria-label={sel.selected ? 'Deseleccionar' : 'Seleccionar'}
                        >
                          {sel.selected
                            ? <CheckSquare size={20} />
                            : <Square size={20} className="text-gray-400" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
                            Talla {v.size} · {v.color}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-dark-muted font-mono truncate">
                            {v.sku || '—'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
                            Stock: <strong className="text-brand-black dark:text-dark-text">{stock}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-7">
                        <label className="text-xs text-gray-500 dark:text-dark-muted">
                          Etiquetas a imprimir:
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={999}
                          value={sel.copies}
                          onChange={(e) => setCopies(v.id, e.target.value)}
                          disabled={!sel.selected}
                          className="
                            w-20 h-9 px-2 rounded-md text-sm text-center font-semibold
                            bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                            border border-gray-200 dark:border-dark-border
                            focus:border-brand-blue outline-none
                            disabled:opacity-40
                          "
                        />
                        {sel.selected && sel.copies > 0 && (
                          <span className="text-xs text-gray-500 dark:text-dark-muted">
                            → {sel.copies} {sel.copies === 1 ? 'etiqueta' : 'etiquetas'} ·{' '}
                            {sel.copies * COPIES_PER_LABEL} códigos en total
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border shrink-0">
          <p className="text-xs text-gray-500 dark:text-dark-muted">
            {loading ? (
              <>Generando etiqueta {progress.current}/{progress.total}…</>
            ) : totalLabels > 0 ? (
              <>
                Se imprimirán <strong>{totalLabels}</strong>{' '}
                {totalLabels === 1 ? 'etiqueta' : 'etiquetas'} físicas, cada una con{' '}
                <strong>{COPIES_PER_LABEL} copias idénticas</strong> · DK-1201 (29×90 mm) ·{' '}
                <strong>{codeType === 'qr' ? 'QR' : 'Código de barras'}</strong>
              </>
            ) : (
              'Selecciona al menos una variante.'
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
              disabled={totalLabels === 0 || loading}
            >
              {loading
                ? 'Imprimiendo…'
                : confirmingLarge
                  ? 'Confirmar impresión'
                  : 'Imprimir seleccionadas'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="px-5 py-3 bg-red-50 dark:bg-red-950/30 border-t border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Contenedor oculto: etiquetas físicas completas (3 copias idénticas cada una) */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: '-99999px',
            top: 0,
            pointerEvents: 'none',
          }}
        >
          {sheets.map((sheet) => {
            const sheetKey = sheet.map((s) => s.blockId).join('|')
            return (
              <div
                key={sheetKey}
                ref={(el) => { sheetRefs.current[sheetKey] = el }}
              >
                <LabelContent sheet={sheet} product={product} codeType={codeType} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}