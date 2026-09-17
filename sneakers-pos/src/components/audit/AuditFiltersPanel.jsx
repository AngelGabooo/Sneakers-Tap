// src/components/audit/AuditFiltersPanel.jsx
import { X } from 'lucide-react'
import { useMemo } from 'react'
import Card from '../common/Card'
import { useAudit } from '../../context/AuditContext'
import {
  MODULES,
  ACTION_TYPES,
  RESULTS,
  LEVELS,
  ENTITIES,
  BRANCHES,
} from '../../data/audit'

export default function AuditFiltersPanel({
  open,
  onClose,
  filters,
  onFilterChange,
  onClear,
}) {
  const { allEvents = [] } = useAudit() || {}

  // Opciones dinámicas de usuarios (derivadas de los eventos reales)
  const users = useMemo(() => {
    const s = new Set()
    allEvents.forEach((e) => e.userName && s.add(e.userName))
    return [...s].sort()
  }, [allEvents])

  if (!open) return null

  const set = (key, value) => onFilterChange?.({ ...filters, [key]: value })

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <Card className="sticky top-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
            Filtros
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-dark-text"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Usuario">
            <Select value={filters.user} onChange={(v) => set('user', v)}>
              <option value="all">Todos</option>
              {users.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </Select>
          </Field>

          <Field label="Módulo">
            <Select value={filters.module} onChange={(v) => set('module', v)}>
              <option value="all">Todos</option>
              {MODULES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </Select>
          </Field>

          <Field label="Acción">
            <Select value={filters.action} onChange={(v) => set('action', v)}>
              <option value="all">Todas</option>
              {ACTION_TYPES.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </Select>
          </Field>

          <Field label="Resultado">
            <Select value={filters.result} onChange={(v) => set('result', v)}>
              <option value="all">Todos</option>
              {RESULTS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Select>
          </Field>

          <Field label="Nivel">
            <Select value={filters.level} onChange={(v) => set('level', v)}>
              <option value="all">Todos</option>
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </Select>
          </Field>

          <Field label="Entidad">
            <Select value={filters.entity} onChange={(v) => set('entity', v)}>
              <option value="all">Todas</option>
              {ENTITIES.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </Select>
          </Field>

          <Field label="Sucursal">
            <Select value={filters.branch} onChange={(v) => set('branch', v)}>
              {BRANCHES.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </Select>
          </Field>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="mt-5 w-full h-9 rounded-lg border border-gray-200 dark:border-dark-border text-xs font-medium text-gray-600 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-surface"
        >
          Limpiar filtros
        </button>
      </Card>
    </aside>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-500 dark:text-dark-muted mb-1">
        {label}
      </span>
      {children}
    </label>
  )
}

function Select({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-9 px-2 rounded-lg text-sm bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-brand-black dark:text-dark-text outline-none cursor-pointer"
    >
      {children}
    </select>
  )
}