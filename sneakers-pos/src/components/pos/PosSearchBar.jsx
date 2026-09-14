import { useEffect, useRef, useState } from 'react'
import { Search, ScanLine, X } from 'lucide-react'

/**
 * Barra de búsqueda + scanner.
 * El input captura automáticamente el código del lector de barras/QR
 * (los lectores escriben como si fuera un teclado y terminan con Enter).
 */
export default function PosSearchBar({
  value,
  onChange,
  onScan,        // se dispara al recibir un código escaneado (con Enter)
  autoFocus = true,
}) {
  const inputRef = useRef(null)
  const [flash, setFlash] = useState(false)

  // Foco automático al montar y cuando se limpia
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault()
      onScan?.(value.trim())
      onChange?.('')
      // Feedback visual breve
      setFlash(true)
      setTimeout(() => setFlash(false), 250)
    }
  }

  return (
    <div className={`
      relative rounded-lg transition-all duration-150
      ${flash ? 'ring-2 ring-brand-blue' : ''}
    `}>
      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
        <Search size={18} strokeWidth={1.9} />
      </span>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Buscar producto, SKU o escanear código de barras..."
        autoComplete="off"
        className="
          w-full h-12 pl-10 pr-24 rounded-lg text-[15px]
          bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
          border border-gray-200 dark:border-dark-border
          focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40
          outline-none placeholder:text-gray-400 dark:placeholder:text-dark-muted
          transition-all duration-150
        "
      />

      {/* Botón para pegar/limpiar */}
      {value ? (
        <button
          type="button"
          onClick={() => { onChange?.(''); inputRef.current?.focus() }}
          className="absolute inset-y-0 right-14 pr-2 flex items-center text-gray-400 hover:text-brand-black dark:hover:text-dark-text transition-colors"
          aria-label="Limpiar"
        >
          <X size={16} />
        </button>
      ) : null}

      {/* Scanner */}
      <button
        type="button"
        onClick={() => {
          inputRef.current?.focus()
          onScan?.(null)
        }}
        className="
          absolute inset-y-0 right-0 pr-3 flex items-center gap-1
          text-xs font-medium text-brand-blue hover:text-brand-blueDark transition-colors
        "
        title="El lector escribe automáticamente. Solo escanea."
      >
        <ScanLine size={16} strokeWidth={2.2} />
        <span className="hidden sm:inline">Escanear</span>
      </button>
    </div>
  )
}