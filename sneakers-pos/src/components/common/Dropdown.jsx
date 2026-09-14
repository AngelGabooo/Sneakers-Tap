import { useEffect, useRef, useState } from 'react'

export default function Dropdown({ trigger, children, align = 'right', className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const handleEsc = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEsc)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [open])

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>

      {open && (
        <div
          className={`
            absolute z-30 mt-1 min-w-[180px] rounded-lg
            bg-white dark:bg-dark-card
            border border-gray-200 dark:border-dark-border
            shadow-cardHover py-1
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export function DropdownItem({ icon: Icon, children, danger = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left
        transition-colors
        ${danger
          ? 'text-brand-red hover:bg-red-50 dark:hover:bg-red-950/40'
          : 'text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface'}
      `}
    >
      {Icon && <Icon size={15} strokeWidth={2} />}
      {children}
    </button>
  )
}