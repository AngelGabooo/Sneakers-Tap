// src/components/audit/AuditDetailDrawer.jsx
import { X, User as UserIcon, Cpu } from 'lucide-react'
import { useEffect } from 'react'
import {
  getActionLabel,
  getModuleLabel,
  getLevelMeta,
  getResultMeta,
  getEntityLabel,
} from '../../data/audit'
import { LevelBadge, ResultBadge, ModuleBadge } from './AuditBadges'

export default function AuditDetailDrawer({ event, open, onClose }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open || !event) return null

  const date = new Date(event.createdAt)

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md h-full bg-white dark:bg-dark-surface shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between p-5 border-b border-gray-100 dark:border-dark-border bg-white dark:bg-dark-surface">
          <div>
            <h2 className="text-lg font-bold text-brand-black dark:text-dark-text">
              Detalle del evento
            </h2>
            <p className="text-xs text-gray-500 dark:text-dark-muted font-mono mt-1">
              {event.auditId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-dark-text"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <LevelBadge level={event.level} />
            <ResultBadge result={event.result} />
            <ModuleBadge module={event.module} />
          </div>

          {/* Descripción */}
          {event.description && (
            <div>
              <Label>Descripción</Label>
              <p className="text-sm text-brand-black dark:text-dark-text mt-1">
                {event.description}
              </p>
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Fecha">
              {date.toLocaleString('es-MX')}
            </Field>
            <Field label="Acción">
              {getActionLabel(event.action)}
            </Field>
            <Field label="Usuario">
              <span className="inline-flex items-center gap-1.5">
                {event.user?.system ? <Cpu size={12} /> : <UserIcon size={12} />}
                {event.userName || 'Sistema'}
              </span>
            </Field>
            <Field label="Rol">{event.userRole || '—'}</Field>
            <Field label="Entidad">
              {event.entity ? getEntityLabel(event.entity) : '—'}
            </Field>
            <Field label="ID entidad">
              <span className="font-mono text-xs break-all">
                {event.entityId || '—'}
              </span>
            </Field>
            <Field label="Sucursal">{event.branch || '—'}</Field>
            <Field label="Origen">{event.origin || '—'}</Field>
          </div>

          {/* Motivo */}
          {event.reason && (
            <div>
              <Label>Motivo</Label>
              <p className="text-sm text-brand-black dark:text-dark-text mt-1">
                {event.reason}
              </p>
            </div>
          )}

          {/* Metadata */}
          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <div>
              <Label>Metadata</Label>
              <pre className="mt-1 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg p-3 text-xs text-gray-700 dark:text-dark-muted overflow-x-auto">
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            </div>
          )}

          {/* Device / IP */}
          {(event.device || event.ip) && (
            <div className="grid grid-cols-1 gap-3 pt-3 border-t border-gray-100 dark:border-dark-border">
              {event.device && (
                <Field label="Dispositivo">
                  <span className="text-xs">{event.device}</span>
                </Field>
              )}
              {event.ip && <Field label="IP">{event.ip}</Field>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Label({ children }) {
  return (
    <span className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-dark-muted">
      {children}
    </span>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <Label>{label}</Label>
      <p className="text-sm text-brand-black dark:text-dark-text mt-0.5 break-words">
        {children}
      </p>
    </div>
  )
}