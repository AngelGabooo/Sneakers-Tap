// src/components/audit/AuditDetailModal.jsx
import { useEffect } from 'react'

export default function AuditDetailModal({ event, onClose }) {
  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!event) return null

  const date = new Date(event.createdAt)

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📋</span>
              <h2 className="text-lg font-bold text-gray-900">
                Detalle del evento
              </h2>
            </div>
            <p className="text-xs text-gray-500 font-mono">
              {event.auditId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Grid de datos */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Fecha" value={date.toLocaleString('es-MX')} />
            <Field label="Nivel" value={event.level} />
            <Field label="Módulo" value={event.module} />
            <Field label="Acción" value={event.action} />
            <Field label="Usuario" value={event.userName} />
            <Field label="Rol" value={event.userRole} />
            <Field label="Entidad" value={event.entity} />
            <Field label="ID entidad" value={event.entityId} />
            <Field label="Sucursal" value={event.branch} />
            <Field label="Resultado" value={event.result} />
            {event.reason && (
              <Field label="Motivo" value={event.reason} className="col-span-2" />
            )}
          </div>

          {/* Descripción */}
          {event.description && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Descripción
              </label>
              <p className="text-sm text-gray-800 mt-1">
                {event.description}
              </p>
            </div>
          )}

          {/* Metadata */}
          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Metadata
              </label>
              <pre className="mt-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-700 overflow-x-auto">
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            </div>
          )}

          {/* Device / IP */}
          {(event.device || event.ip) && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              {event.device && (
                <Field label="Dispositivo" value={event.device} />
              )}
              {event.ip && <Field label="IP" value={event.ip} />}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, className = '' }) {
  return (
    <div className={className}>
      <label className="text-xs font-semibold text-gray-500 uppercase">
        {label}
      </label>
      <p className="text-sm text-gray-900 mt-0.5 break-words">
        {value || '—'}
      </p>
    </div>
  )
}