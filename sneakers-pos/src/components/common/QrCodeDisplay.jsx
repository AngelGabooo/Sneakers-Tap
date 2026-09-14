import { QRCodeSVG } from 'qrcode.react'

/**
 * Muestra un código QR generado.
 * @param {string} value - El valor a codificar
 */
export default function QrCodeDisplay({
  value,
  size = 140,
  level = 'M',
  includeMargin = false,
  className = '',
}) {
  if (!value) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-gray-200 dark:border-dark-border text-xs text-gray-400 dark:text-dark-muted ${className}`}
        style={{ width: size, height: size }}
      >
        Sin código
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center bg-white rounded-lg p-2 ${className}`}>
      <QRCodeSVG
        value={value}
        size={size}
        level={level}
        includeMargin={includeMargin}
        bgColor="#FFFFFF"
        fgColor="#111827"
      />
    </div>
  )
}