import { Shield, AlertTriangle, MapPin } from 'lucide-react'
import Card from '../common/Card'
import {
  TOTAL_PERMISSIONS,
  CRITICAL_PERMISSIONS,
  summarizeByModule,
} from '../../data/permissions'

export default function RoleEditorSummary({ permissions = [], scope, branches = [] }) {
  const total = permissions.length
  const pct = TOTAL_PERMISSIONS > 0 ? Math.round((total / TOTAL_PERMISSIONS) * 100) : 0
  const criticalCount = permissions.filter((p) => CRITICAL_PERMISSIONS.includes(p)).length
  const byModule = summarizeByModule(permissions).filter((m) => m.enabled > 0)

  return (
    <Card className="mb-5">
      <header className="mb-4">
        <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text flex items-center gap-2">
          <Shield size={15} className="text-brand-blue" strokeWidth={2} />
          Resumen de permisos
        </h3>
      </header>

      <div className="mb-4">
        <p className="text-2xl font-bold text-brand-black dark:text-dark-text">
          {total} <span className="text-sm font-normal text-gray-500 dark:text-dark-muted">
            de {TOTAL_PERMISSIONS} permisos
          </span>
        </p>
        <div className="mt-2 h-1.5 rounded-full bg-gray-100 dark:bg-dark-surface overflow-hidden">
          <div
            className="h-full bg-brand-blue transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {criticalCount > 0 && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 mb-4">
          <AlertTriangle size={13} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" strokeWidth={2.2} />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            <strong>{criticalCount} permisos críticos</strong> habilitados.
            Los cambios quedarán registrados en auditoría.
          </p>
        </div>
      )}

      {byModule.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted mb-2">
            Por módulo
          </p>
          <ul className="space-y-1.5 text-xs">
            {byModule.map((m) => (
              <li key={m.key} className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-dark-muted truncate">{m.label}</span>
                <span className="font-medium text-brand-black dark:text-dark-text">
                  {m.enabled} / {m.total}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
        <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted mb-1.5 flex items-center gap-1.5">
          <MapPin size={11} strokeWidth={2.2} />
          Alcance
        </p>
        <p className="text-xs text-brand-black dark:text-dark-text">
          {scope === 'all' ? 'Todas las sucursales' : (branches.length ? branches.join(', ') : 'Sin sucursal asignada')}
        </p>
      </div>
    </Card>
  )
}