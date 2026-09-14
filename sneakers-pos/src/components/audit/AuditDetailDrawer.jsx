// src/components/audit/AuditDetailDrawer.jsx
import { X } from 'lucide-react'
import { getActionLabel, getModuleLabel, getEntityLabel, getLevelMeta } from '../../data/audit'
import { LevelBadge, ResultBadge } from './AuditBadges'

function Section({ title, children }) {
  return (
    <section className="mb-5">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted mb-2">
        {title}
      </h4>
      {children}
    </section>
  )
}

function Field({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
      <span className="text-gray-500 dark:text-dark-muted">{label}</span>
      <span className="text-brand-black dark:text-dark-text font-medium text-right">
        {value ?? '—'}
      </span>
    </div>
  )
}

export default function AuditDetailDrawer({ event, open, onClose }) {
  if (!open || !event) return null

  const level = getLevelMeta(event.level)

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      <aside className="
        fixed top-0 right-0 z-50
        w-full sm:w-[440px] lg:w-[500px]
        h-full bg-white dark:bg-dark-card
        border-l border-gray-200 dark:border-dark-border
        flex flex-col
      ">
        <header className="flex items-start justify-between px-5 py-4 border-b border-gray-100 dark:border-dark-border">
          <div>
            <h3 className="text-base font-semibold text-brand-black dark:text-dark-text">
              Detalle del evento
            </h3>
            <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">
              {event.auditId || event.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-surface"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="flex items-center gap-2 mb-5">
            <LevelBadge level={event.level} />
            <ResultBadge result={event.result} />
          </div>

          <Section title="Información general">
            <Field label="Fecha" value={new Date(event.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })} />
            <Field label="Hora" value={new Date(event.createdAt).toLocaleTimeString('es-MX')} />
            <Field label="Usuario" value={event.user?.name || 'Sistema'} />
            <Field label="Rol" value={event.user?.role} />
            <Field label="Módulo" value={getModuleLabel(event.module)} />
            <Field label="Acción" value={getActionLabel(event.action)} />
            <Field label="Sucursal" value={event.branch} />
          </Section>

          {event.entity && (
            <Section title="Registro afectado">
              <Field label="Entidad" value={getEntityLabel(event.entity)} />
              <Field label="ID" value={event.entityId} />
              <Field label="Nombre" value={event.entityName} />
            </Section>
          )}

          {event.changes?.length > 0 && (
            <Section title="Cambios realizados">
              <div className="rounded-lg border border-gray-100 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border">
                {event.changes.map((c, i) => (
                  <div key={i} className="p-3">
                    <p className="text-xs font-semibold text-brand-black dark:text-dark-text mb-2">
                      {c.field}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-md bg-red-50 dark:bg-red-950/30 px-2 py-1.5">
                        <span className="block text-[10px] text-red-600 dark:text-red-400 font-semibold uppercase">Antes</span>
                        <span className="text-gray-700 dark:text-dark-muted">{c.before ?? '—'}</span>
                      </div>
                      <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1.5">
                        <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Después</span>
                        <span className="text-gray-700 dark:text-dark-muted">{c.after ?? '—'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section title="Motivo">
            <p className="text-sm text-gray-600 dark:text-dark-muted">
              {event.reason || 'Sin motivo registrado'}
            </p>
          </Section>

          {event.origin && (
            <Section title="Origen de la acción">
              <Field label="Módulo" value={event.origin.module} />
              <Field label="Pantalla" value={event.origin.screen} />
              <Field label="Acción" value={event.origin.action} />
              <Field label="Dispositivo" value={event.origin.device} />
            </Section>
          )}

          {event.related?.length > 0 && (
            <Section title="Registros relacionados">
              <ul className="space-y-1.5">
                {event.related.map((r, i) => (
                  <li key={i}>
                    <a
                      href={r.href || '#'}
                      className="text-sm text-brand-blue hover:underline"
                    >
                      {r.label} →
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {event.timeline?.length > 0 && (
            <Section title="Línea de tiempo">
              <ol className="relative border-l border-gray-200 dark:border-dark-border ml-1.5 space-y-3">
                {event.timeline.map((t, i) => (
                  <li key={i} className="pl-4">
                    <span className="absolute -left-[5px] w-2.5 h-2.5 rounded-full bg-brand-blue" />
                    <p className="text-xs text-gray-400 dark:text-dark-muted">
                      {t.time}
                    </p>
                    <p className="text-sm text-brand-black dark:text-dark-text">
                      {t.label}
                    </p>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {event.technical && (
            <details className="mt-2">
              <summary className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted cursor-pointer">
                Información técnica
              </summary>
              <div className="mt-2 pl-2 text-xs text-gray-500 dark:text-dark-muted space-y-1">
                {Object.entries(event.technical).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <span>{k}</span>
                    <span className="font-mono text-brand-black dark:text-dark-text">{v}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>

        <footer className="px-5 py-4 border-t border-gray-100 dark:border-dark-border">
          <button
            onClick={onClose}
            className="w-full h-10 rounded-lg text-sm font-medium bg-gray-100 dark:bg-dark-surface text-brand-black dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-border"
          >
            Cerrar
          </button>
        </footer>
      </aside>
    </>
  )
}