import { useEffect, useRef, useState, useCallback } from 'react'
import { Search, ScanLine, X, Zap } from 'lucide-react'

export default function PosSearchBar({
  value,
  onChange,
  onScan,
  autoFocus = true,
  refocusOnIdle = true,
}) {
  const inputRef = useRef(null)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  useEffect(() => {
    if (!refocusOnIdle) return
    const refocus = () => {
      const active = document.activeElement
      const isTypingElsewhere =
        active &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName) &&
        active !== inputRef.current
      if (!isTypingElsewhere) inputRef.current?.focus()
    }
    const t = setInterval(refocus, 800)
    return () => clearInterval(t)
  }, [refocusOnIdle])

  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const code = String(value || '').trim()
      if (code) {
        onScan?.(code)
        onChange?.('')
        setFlash(true)
        setTimeout(() => setFlash(false), 300)
      }
      requestAnimationFrame(focusInput)
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
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        className="
          w-full h-12 pl-10 pr-28 rounded-lg text-[15px]
          bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
          border border-gray-200 dark:border-dark-border
          focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40
          outline-none placeholder:text-gray-400 dark:placeholder:text-dark-muted
          transition-all duration-150
        "
      />

      {value ? (
        <button
          type="button"
          onClick={() => { onChange?.(''); focusInput() }}
          className="absolute inset-y-0 right-24 pr-2 flex items-center text-gray-400 hover:text-brand-black dark:hover:text-dark-text transition-colors"
          aria-label="Limpiar"
        >
          <X size={16} />
        </button>
      ) : null}

      <span className="absolute inset-y-0 right-16 flex items-center">
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
          <Zap size={11} strokeWidth={2.4} />
          Listo
        </span>
      </span>

      <button
        type="button"
        onClick={focusInput}
        className="
          absolute inset-y-0 right-0 pr-3 flex items-center gap-1
          text-xs font-medium text-brand-blue hover:text-brand-blueDark transition-colors
        "
        title="Reactivar foco para escanear"
      >
        <ScanLine size={16} strokeWidth={2.2} />
        <span className="hidden sm:inline">Escanear</span>
      </button>
    </div>
  )
}