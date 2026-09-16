// src/components/layout/SyncIndicator.jsx
import { useEffect, useRef, useState } from 'react'
import {
  Cloud, CloudOff, RefreshCw, Check, AlertCircle, Loader2,
} from 'lucide-react'
import { useSync } from '../../context/SyncContext'

/**
 * Indicador de estado de sincronización.
 *
 * Estados:
 *   - offline       → sin conexión (gris)
 *   - syncing       → sincronizando ahora (amarillo con spinner)
 *   - pending > 0   → hay pendientes (amarillo)
 *   - error         → último sync falló (rojo)
 *   - synced        → todo OK (verde, se oculta después de 3s)
 */
export default function SyncIndicator() {
  const { pending, syncing, isOnline, lastSyncAt, lastError, syncNow } = useSync()
  const [expanded, setExpanded] = useState(false)
  const [showSynced, setShowSynced] = useState(false)
  const wrapRef = useRef(null)

  // Mostrar "sincronizado" por 3 segundos al terminar
  useEffect(() => {
    if (!syncing && lastSyncAt) {
      setShowSynced(true)
      const t = setTimeout(() => setShowSynced(false), 3000)
      return () => clearTimeout(t)
    }
  }, [lastSyncAt, syncing])

  // Cerrar el popover al hacer clic fuera
  useEffect(() => {
    if (!expanded) return
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setExpanded(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [expanded])

  // Determinar estado
  const state = (() => {
    if (!isOnline) return 'offline'
    if (syncing) return 'syncing'
    if (lastError) return 'error'
    if (pending > 0) return 'pending'
    if (showSynced) return 'synced'
    return 'idle'
  })()

  // Icono + color según estado
  const config = {
    offline: {
      icon: CloudOff,
      color: 'text-gray-400',
      bg: 'hover:bg-gray-100 dark:hover:bg-dark-surface',
      label: 'Sin conexión',
    },
    syncing: {
      icon: Loader2,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      label: 'Sincronizando…',
      spin: true,
    },
    pending: {
      icon: Cloud,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      label: `${pending} pendiente${pending > 1 ? 's' : ''}`,
    },
    error: {
      icon: AlertCircle,
      color: 'text-brand-red',
      bg: 'bg-red-50 dark:bg-red-950/30',
      label: 'Error de sync',
    },
    synced: {
      icon: Check,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      label: 'Sincronizado',
    },
    idle: {
      icon: Cloud,
      color: 'text-gray-400 dark:text-dark-muted',
      bg: 'hover:bg-gray-100 dark:hover:bg-dark-surface',
      label: 'Al día',
    },
  }[state]

  const Icon = config.icon

  // No mostrar nada en estado "idle"
  if (state === 'idle') return null

  const handleClick = () => {
    setExpanded((v) => !v)
  }

  const handleSyncNow = async () => {
    if (!isOnline || syncing) return
    await syncNow()
    setExpanded(false)
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={handleClick}
        className={`
          relative flex items-center gap-1.5 h-9 px-2.5 rounded-lg
          transition-colors
          ${config.bg}
        `}
        aria-label={config.label}
        title={config.label}
      >
        <Icon
          size={16}
          className={`${config.color} ${config.spin ? 'animate-spin' : ''}`}
          strokeWidth={2}
        />
        {pending > 0 && !syncing && (
          <span className="
            text-[11px] font-bold
            min-w-[16px] h-[16px] px-1
            rounded-full
            bg-amber-500 text-white
            flex items-center justify-center
          ">
            {pending > 99 ? '99+' : pending}
          </span>
        )}
      </button>

      {expanded && (
        <div className="
          absolute right-0 top-full mt-2 w-72 z-50
          bg-white dark:bg-dark-card
          border border-gray-200 dark:border-dark-border
          rounded-xl shadow-2xl
          overflow-hidden
        ">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-border">
            <div className="flex items-center gap-2">
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center
                ${state === 'offline' ? 'bg-gray-100 dark:bg-dark-card' : ''}
                ${state === 'syncing' ? 'bg-amber-100 dark:bg-amber-950/40' : ''}
                ${state === 'pending' ? 'bg-amber-100 dark:bg-amber-950/40' : ''}
                ${state === 'error' ? 'bg-red-100 dark:bg-red-950/40' : ''}
                ${state === 'synced' ? 'bg-emerald-100 dark:bg-emerald-950/40' : ''}
              `}>
                <Icon
                  size={16}
                  className={`${config.color} ${config.spin ? 'animate-spin' : ''}`}
                  strokeWidth={2}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
                  Sincronización
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-muted truncate">
                  {config.label}
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="px-4 py-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-dark-muted">Conexión:</span>
              <span className={`font-medium ${
                isOnline
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-brand-red'
              }`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-dark-muted">Pendientes:</span>
              <span className="font-medium text-brand-black dark:text-dark-text">
                {pending}
              </span>
            </div>
            {lastSyncAt && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-dark-muted">Última sync:</span>
                <span className="font-medium text-brand-black dark:text-dark-text">
                  {new Date(lastSyncAt).toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
            {lastError && (
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40">
                <p className="text-[11px] text-brand-red leading-snug">
                  {lastError}
                </p>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="px-4 py-2 border-t border-gray-100 dark:border-dark-border">
            <button
              type="button"
              onClick={handleSyncNow}
              disabled={!isOnline || syncing || pending === 0}
              className="
                w-full flex items-center justify-center gap-2
                h-9 rounded-lg
                text-sm font-medium
                bg-brand-blue text-white
                hover:bg-brand-blueHover
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors
              "
            >
              {syncing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Sincronizando…
                </>
              ) : (
                <>
                  <RefreshCw size={14} />
                  Sincronizar ahora
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}