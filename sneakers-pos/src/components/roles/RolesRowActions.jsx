import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  MoreHorizontal, Eye, Pencil, Copy, Users, Activity, History, Power,
} from 'lucide-react'

export default function RolesRowActions({
  role,
  onViewRole,
  onEditRole,
  onDuplicate,
  onViewUsers,
  onViewActivity,
  onViewAudit,
  onToggleStatus,
}) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, openUp: false })
  const buttonRef = useRef(null)
  const menuRef = useRef(null)

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const menuWidth = 240
    const margin = 8
    const spaceBelow = window.innerHeight - rect.bottom
    const openUp = spaceBelow < 320

    let left = rect.right - menuWidth
    if (left < margin) left = margin
    if (left + menuWidth > window.innerWidth - margin) {
      left = window.innerWidth - menuWidth - margin
    }

    setCoords({
      top: openUp ? rect.top - margin : rect.bottom + margin,
      left,
      openUp,
    })
  }, [open])

  useEffect(() => {
    if (!open) return
    const closeOnClick = (e) => {
      if (menuRef.current?.contains(e.target)) return
      if (buttonRef.current?.contains(e.target)) return
      setOpen(false)
    }
    const closeOnEsc = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', closeOnClick)
    document.addEventListener('keydown', closeOnEsc)
    window.addEventListener('scroll', () => setOpen(false), true)
    window.addEventListener('resize', () => setOpen(false))
    return () => {
      document.removeEventListener('mousedown', closeOnClick)
      document.removeEventListener('keydown', closeOnEsc)
    }
  }, [open])

  const isSystem = role?.type === 'system'

  const items = [
    { key: 'view',      label: 'Ver permisos',   icon: Eye,      onClick: () => onViewRole?.(role) },
  ]

  if (!isSystem) {
    items.push({ key: 'edit',      label: 'Editar rol',      icon: Pencil,   onClick: () => onEditRole?.(role) })
    items.push({ key: 'duplicate', label: 'Duplicar rol',    icon: Copy,     onClick: () => onDuplicate?.(role) })
  } else {
    items.push({ key: 'duplicate', label: 'Duplicar rol',    icon: Copy,     onClick: () => onDuplicate?.(role) })
  }

  items.push({ key: 'users',     label: 'Ver usuarios',      icon: Users,    onClick: () => onViewUsers?.(role) })
  items.push({ key: 'activity',  label: 'Ver actividad',     icon: Activity, onClick: () => onViewActivity?.(role) })
  items.push({ key: 'audit',     label: 'Ver auditoría',     icon: History,  onClick: () => onViewAudit?.(role) })

  if (!isSystem) {
    items.push({
      key: 'toggle',
      label: role?.status === 'active' ? 'Desactivar rol' : 'Activar rol',
      icon: Power,
      danger: role?.status === 'active',
      onClick: () => onToggleStatus?.(role),
    })
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-card hover:text-brand-black dark:hover:text-dark-text transition-colors"
        aria-label="Acciones del rol"
        aria-expanded={open}
      >
        <MoreHorizontal size={18} />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          role="menu"
          style={{
            position: 'fixed',
            top: coords.openUp ? 'auto' : coords.top,
            bottom: coords.openUp ? window.innerHeight - coords.top : 'auto',
            left: coords.left,
            width: 240,
            zIndex: 9999,
          }}
          className="py-1.5 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xl"
        >
          {items.map(({ key, label, icon: Icon, onClick, danger }) => (
            <button
              key={key}
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); onClick?.() }}
              className={`
                w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors
                ${danger
                  ? 'text-brand-red hover:bg-red-50 dark:hover:bg-red-950/30'
                  : 'text-gray-700 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-surface hover:text-brand-black dark:hover:text-dark-text'}
              `}
            >
              <Icon size={15} strokeWidth={1.9} />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  )
}