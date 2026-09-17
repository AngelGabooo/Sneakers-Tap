// src/components/audit/AuditFilters.jsx
import { useMemo } from 'react'

export default function AuditFilters({ filters, setFilters, events }) {
  // Opciones únicas derivadas de los eventos
  const options = useMemo(() => {
    const modules = new Set()
    const actions = new Set()
    const users = new Set()
    events.forEach((ev) => {
      if (ev.module) modules.add(ev.module)
      if (ev.action) actions.add(ev.action)
      if (ev.userName) users.add(ev.userName)
    })
    return {
      modules: [...modules].sort(),
      actions: [...actions].sort(),
      users: [...users].sort(),
    }
  }, [events])

  const update = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <input
        type="text"
        placeholder="🔎 Buscar…"
        value={filters.search}
        onChange={(e) => update('search', e.target.value)}
        className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
      />

      <select
        value={filters.level}
        onChange={(e) => update('level', e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
      >
        <option value="">Todos los niveles</option>
        <option value="info">Info</option>
        <option value="important">Importante</option>
        <option value="critical">Crítico</option>
      </select>

      <select
        value={filters.module}
        onChange={(e) => update('module', e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
      >
        <option value="">Todos los módulos</option>
        {options.modules.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <select
        value={filters.action}
        onChange={(e) => update('action', e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
      >
        <option value="">Todas las acciones</option>
        {options.actions.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      <select
        value={filters.user}
        onChange={(e) => update('user', e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
      >
        <option value="">Todos los usuarios</option>
        {options.users.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={filters.from}
        onChange={(e) => update('from', e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        title="Desde"
      />
      <input
        type="date"
        value={filters.to}
        onChange={(e) => update('to', e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        title="Hasta"
      />

      <button
        onClick={() =>
          setFilters({
            search: '',
            level: '',
            module: '',
            action: '',
            user: '',
            from: '',
            to: '',
          })
        }
        className="px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
      >
        🧹 Limpiar
      </button>
    </div>
  )
}