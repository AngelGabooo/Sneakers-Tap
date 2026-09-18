// src/components/users/UsersRowActions.jsx
import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  MoreHorizontal, Eye, Pencil, Activity, Monitor,
  KeyRound, Mail, Shield, History, Ban, CheckCircle, XCircle,
  Trash2,                                    // ⭐ NUEVO
} from 'lucide-react'

export default function UsersRowActions({
  user,
  onViewProfile,
  onEdit,
  onViewActivity,
  onViewSessions,
  onChangeStatus,
  onResetAccess,
  onResendInvite,
  onViewRole,
  onViewAudit,
  onDelete,                                  // ⭐ NUEVO
}) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const buttonRef = useRef(null)
  const menuRef = useRef(null)

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const menuWidth = 220
    const margin = 8

    const spaceBelow = window.innerHeight - rect.bottom
    const openUp = spaceBelow < 300

    let left = rect.right - menuWidth
    if (left < margin) left = margin
    if (left + menuWidth > window.innerWidth - margin) {
      left = window.innerWidth - menuWidth - margin
    }

    setCoords({
      top: openUp ? rect.top - margin : rect.bottom + margin,
      left,
      width: menuWidth,
      openUp,
    })
  }, [open])

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    const handleScrollOrResize = () => setOpen(false)
    const handleEsc = (e) => { if (e.key === 'Escape') setOpen(false) }

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

  const status = user?.status || 'active'
  const items = []

  // Acciones principales
  items.push({ key: 'profile', label: 'Ver perfil', icon: Eye, onClick: () => onViewProfile?.(user) })
  items.push({ key: 'edit', label: 'Editar empleado', icon: Pencil, onClick: () => onEdit?.(user) })

  if (status === 'pending') {
    items.push({ key: 'resend', label: 'Reenviar invitación', icon: Mail, onClick: () => onResendInvite?.(user) })
    items.push({ key: 'cancel', label: 'Cancelar invitación', icon: XCircle, danger: true, onClick: () => onChangeStatus?.(user, 'cancel-invite') })
  } else {
    items.push({ key: 'activity', label: 'Ver actividad', icon: Activity, onClick: () => onViewActivity?.(user) })
    items.push({ key: 'sessions', label: 'Ver sesiones', icon: Monitor, onClick: () => onViewSessions?.(user) })
    // ❌ QUITADO: "Cambiar estado" (toggle)
    items.push({ key: 'reset', label: 'Restablecer acceso', icon: KeyRound, onClick: () => onResetAccess?.(user) })
  }

  if (status === 'active') {
    items.push({ key: 'suspend', label: 'Suspender', icon: Ban, danger: true, onClick: () => onChangeStatus?.(user, 'suspend') })
  }

  if (status === 'suspended' || status === 'blocked' || status === 'inactive') {
    items.push({ key: 'reactivate', label: 'Reactivar', icon: CheckCircle, onClick: () => onChangeStatus?.(user, 'reactivate') })
  }

  items.push({ key: 'role', label: 'Ver rol y permisos', icon: Shield, onClick: () => onViewRole?.(user) })
  items.push({ key: 'audit', label: 'Ver auditoría', icon: History, onClick: () => onViewAudit?.(user) })

  // ⭐ NUEVO: Eliminar siempre al final, en rojo
  items.push({
    key: 'delete',
    label: 'Eliminar empleado',
    icon: Trash2,
    danger: true,
    onClick: () => onDelete?.(user),
  })

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-card hover:text-brand-black dark:hover:text-dark-text transition-colors"
        aria-label="Acciones del usuario"
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
            width: coords.width,
            zIndex: 9999,
          }}
          className="
            py-1.5 rounded-xl
            bg-white dark:bg-dark-card
            border border-gray-200 dark:border-dark-border
            shadow-xl
            animate-in fade-in zoom-in-95 duration-100
          "
        >
          {items.map(({ key, label, icon: Icon, onClick, danger }) => (
            <button
              key={key}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onClick?.()
              }}
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