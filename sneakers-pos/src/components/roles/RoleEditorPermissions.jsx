import { useState } from 'react'
import { CheckSquare, Square, AlertTriangle, ChevronDown, ChevronRight, Shield } from 'lucide-react'
import Card from '../common/Card'
import { MODULES, CRITICAL_PERMISSIONS } from '../../data/permissions'

export default function RoleEditorPermissions({
  permissions = [],
  onToggle,
  onToggleModule,
  onToggleAll,
  allSelected,
}) {
  const [openModules, setOpenModules] = useState(() => {
    const map = {}
    MODULES.forEach((m, i) => { map[m.key] = i < 2 })
    return map
  })

  const toggleModule = (key) => {
    setOpenModules((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <Card>
      <header className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Permisos
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Selecciona las acciones que podrán realizar los usuarios con este rol.
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleAll}
          className="text-xs font-medium text-brand-blue hover:underline whitespace-nowrap"
        >
          {allSelected ? 'Limpiar todos' : 'Seleccionar todos'}
        </button>
      </header>

      <div className="space-y-3">
        {MODULES.map((mod) => {
          const modulePerms = mod.permissions.map((p) => p.key)
          const enabled = modulePerms.filter((k) => permissions.includes(k)).length
          const allInModule = enabled === modulePerms.length
          const someInModule = enabled > 0 && !allInModule
          const isOpen = openModules[mod.key]

          return (
            <div
              key={mod.key}
              className="border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden"
            >
              {/* Header del módulo */}
              <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50/60 dark:bg-dark-surface/40">
                <button
                  type="button"
                  onClick={() => toggleModule(mod.key)}
                  className="flex items-center gap-2 text-gray-500 hover:text-brand-black dark:hover:text-dark-text transition-colors"
                  aria-label={isOpen ? 'Cerrar' : 'Abrir'}
                >
                  {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
                    {mod.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-dark-muted">
                    {enabled} de {modulePerms.length} habilitados
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleModule(mod, !allInModule)}
                  className="text-xs font-medium text-brand-blue hover:underline"
                >
                  {allInModule ? 'Quitar' : 'Todos'}
                </button>

                {someInModule && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Parcialmente seleccionado" />
                )}
              </div>

              {/* Permisos del módulo */}
              {isOpen && (
                <div className="divide-y divide-gray-100 dark:divide-dark-border">
                  {mod.permissions.map((perm) => {
                    const checked = permissions.includes(perm.key)
                    const critical = perm.critical || CRITICAL_PERMISSIONS.includes(perm.key)
                    return (
                      <label
                        key={perm.key}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-dark-surface/50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggle(perm.key)}
                          className="w-4 h-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                        />
                        <span className="flex-1 text-sm text-brand-black dark:text-dark-text">
                          {perm.label}
                        </span>
                        {critical && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400"
                            title="Permiso crítico: requiere mayor control"
                          >
                            <AlertTriangle size={10} strokeWidth={2.4} />
                            Crítico
                          </span>
                        )}
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}