// src/components/common/Dropdown.jsx
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export default function Dropdown({ trigger, children, align = 'right', className = '' }) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 200, openUp: false })
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  // Calcular posición al abrir
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return

    const rect = triggerRef.current.getBoundingClientRect()
    const menuWidth = 200
    const menuHeight = 220 // estimado
    const margin = 8

    // Detectar si hay espacio abajo
    const spaceBelow = window.innerHeight - rect.bottom
    const openUp = spaceBelow < menuHeight + margin

    let left = align === 'right'
      ? rect.right - menuWidth
      : rect.left

    // Clamp horizontal (no salirse de la pantalla)
    if (left < margin) left = margin
    if (left + menuWidth > window.innerWidth - margin) {
      left = window.innerWidth - menuWidth - margin
    }

    setCoords({
      top: openUp ? 'auto' : rect.bottom + 4,
      bottom: openUp ? window.innerHeight - rect.top + 4 : 'auto',
      left,
      width: menuWidth,
      openUp,
    })
  }, [open, align])

  // Cerrar al hacer clic fuera, Esc, scroll o resize
  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    const handleEsc = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const handleScrollOrResize = () => setOpen(false)

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
    }
  }, [open])

  const handleToggle = (e) => {
    e.stopPropagation()
    setOpen((v) => !v)
  }

  return (
    <>
      <div
        ref={triggerRef}
        onClick={handleToggle}
        className={`inline-block ${className}`}
      >
        {trigger}
      </div>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: 'fixed',
              top: coords.top,
              bottom: coords.bottom,
              left: coords.left,
              width: coords.width,
              zIndex: 9999,
            }}
            className="
              py-1 rounded-xl
              bg-white dark:bg-dark-card
              border border-gray-200 dark:border-dark-border
              shadow-2xl shadow-black/10 dark:shadow-black/40
              animate-in fade-in zoom-in-95 duration-100
            "
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  )
}

export function DropdownItem({ icon: Icon, children, danger = false, onClick }) {
  return (
    <button
      type="button"
      role="menuitem"
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