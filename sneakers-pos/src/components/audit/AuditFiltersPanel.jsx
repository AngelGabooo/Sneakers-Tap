// src/components/audit/AuditFiltersPanel.jsx
import { X } from 'lucide-react'
import {
  MODULES, ACTION_TYPES, RESULTS, LEVELS, ENTITIES, BRANCHES,
} from '../../data/audit'

function FilterGroup({ title, children }) {
  return (
    <div className="mb-5">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-dark-muted mb-2">
        {title}
      </h4>
      {children}
    </div>
  )
}

function FilterSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-10 px-3 rounded-lg text-sm bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-brand-black dark:text-dark-text outline-none focus:border-brand-blue"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

export default function AuditFiltersPanel({
  open, onClose, filters, onFilterChange, onClear,
}) {
  if (!open) return null

  const set = (key) => (val) => onFilterChange?.({ ...filters, [key]: val })

  return (
    <>
      {/* Backdrop móvil */}
      <div
        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        onClick={onClose}
      />

      <aside className="
        fixed lg:sticky top-0 right-0 lg:right-auto lg:top-4
        z-50 lg:z-auto
        w-[320px] sm:w-[360px] lg:w-[300px]
        h-full lg:h-auto lg:max-h-[calc(100vh-6rem)]
        bg-white dark:bg-dark-card
        border-l lg:border border-gray-200 dark:border-dark-border
        lg:rounded-xl
        flex flex-col
        overflow-hidden
      ">
        <header className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-dark-border">
          <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
            Filtros
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-surface"
            aria-label="Cerrar filtros"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <FilterGroup title="Usuario">
            <FilterSelect
              value={filters.user || 'all'}
              onChange={set('user')}
              options={[
                { value: 'all', label: 'Todos' },
                { value: 'current', label: 'Usuario actual' },
              ]}
            />
          </FilterGroup>

          <FilterGroup title="Módulo">
            <FilterSelect
              value={filters.module || 'all'}
              onChange={set('module')}
              options={[{ value: 'all', label: 'Todos' }, ...MODULES]}
            />
          </FilterGroup>

          <FilterGroup title="Tipo de acción">
            <FilterSelect
              value={filters.action || 'all'}
              onChange={set('action')}
              options={[{ value: 'all', label: 'Todas' }, ...ACTION_TYPES]}
            />
          </FilterGroup>

          <FilterGroup title="Resultado">
            <FilterSelect
              value={filters.result || 'all'}
              onChange={set('result')}
              options={[{ value: 'all', label: 'Todos' }, ...RESULTS]}
            />
          </FilterGroup>

          <FilterGroup title="Nivel">
            <FilterSelect
              value={filters.level || 'all'}
              onChange={set('level')}
              options={[{ value: 'all', label: 'Todos' }, ...LEVELS]}
            />
          </FilterGroup>

          <FilterGroup title="Entidad">
            <FilterSelect
              value={filters.entity || 'all'}
              onChange={set('entity')}
              options={[{ value: 'all', label: 'Todas' }, ...ENTITIES]}
            />
          </FilterGroup>

          <FilterGroup title="Sucursal">
            <FilterSelect
              value={filters.branch || 'all'}
              onChange={set('branch')}
              options={BRANCHES}
            />
          </FilterGroup>
        </div>

        <footer className="px-5 py-4 border-t border-gray-100 dark:border-dark-border flex gap-2">
          <button
            onClick={onClear}
            className="flex-1 h-10 rounded-lg text-sm font-medium border border-gray-200 dark:border-dark-border text-gray-700 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-surface"
          >
            Limpiar
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-lg text-sm font-medium bg-brand-blue text-white hover:bg-blue-700"
          >
            Aplicar
          </button>
        </footer>
      </aside>
    </>
  )
}