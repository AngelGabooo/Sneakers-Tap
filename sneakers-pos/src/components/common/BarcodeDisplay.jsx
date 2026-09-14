import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

/**
 * Muestra un código de barras generado con JsBarcode.
 * @param {string} value  - El valor a codificar (SKU, código numérico, etc.)
 * @param {string} format - 'CODE128' | 'EAN13' | 'UPC' (default: 'CODE128')
 */
export default function BarcodeDisplay({
  value,
  format = 'CODE128',
  height = 70,
  width = 2,
  fontSize = 14,
  displayValue = true,
  className = '',
}) {
  const svgRef = useRef(null)

  useEffect(() => {
    if (!svgRef.current || !value) return
    try {
      JsBarcode(svgRef.current, value, {
        format,
        height,
        width,
        fontSize,
        displayValue,
        margin: 8,
        lineColor: '#111827',
        background: '#FFFFFF',
        font: 'Inter, sans-serif',
        fontOptions: 'bold',
      })
    } catch (err) {
      console.warn('No se pudo generar el código de barras:', err)
    }
  }, [value, format, height, width, fontSize, displayValue])

  if (!value) {
    return (
      <div className={`flex items-center justify-center h-[110px] rounded-lg border border-dashed border-gray-200 dark:border-dark-border text-xs text-gray-400 dark:text-dark-muted ${className}`}>
        Sin código
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center bg-white rounded-lg p-2 ${className}`}>
      <svg ref={svgRef} />
    </div>
  )
}