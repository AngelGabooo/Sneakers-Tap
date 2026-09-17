// src/components/audit/AuditLog.jsx
import { useEffect, useState, useMemo } from 'react'
import { auditRepo } from '../../repositories/auditRepo'
import AuditFilters from './AuditFilters'
import AuditStats from './AuditStats'
import AuditRow from './AuditRow'
import AuditDetailModal from './AuditDetailModal'

export default function AuditLog() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    search: '',
    level: '',
    module: '',
    action: '',
    user: '',
    from: '',
    to: '',
  })

  const PAGE_SIZE = 30

  // ================= Cargar =================
  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const local = await auditRepo.getAllLocal()
        if (mounted) setEvents(local)
      } catch (err) {
        console.error('Error cargando auditoría:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  // ================= Filtrado =================
  const filtered = useMemo(() => {
    return events.filter((ev) => {
      if (filters.level && ev.level !== filters.level) return false
      if (filters.module && ev.module !== filters.module) return false
      if (filters.action && ev.action !== filters.action) return false
      if (filters.user && ev.userName !== filters.user) return false
      if (filters.from && new Date(ev.createdAt) < new Date(filters.from))
        return false
      if (filters.to && new Date(ev.createdAt) > new Date(filters.to))
        return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const haystack = [
          ev.description,
          ev.userName,
          ev.entity,
          ev.entityId,
          ev.action,
          ev.module,
          JSON.stringify(ev.metadata || {}),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [events, filters])

  // ================= Paginación =================
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  )

  useEffect(() => {
    setPage(1)
  }, [filters])

  // ================= Exportar CSV =================
  const handleExport = () => {
    const headers = [
      'Fecha',
      'Usuario',
      'Rol',
      'Nivel',
      'Módulo',
      'Acción',
      'Entidad',
      'Descripción',
    ]
    const rows = filtered.map((ev) => [
      new Date(ev.createdAt).toLocaleString('es-MX'),
      ev.userName || '',
      ev.userRole || '',
      ev.level || '',
      ev.module || '',
      ev.action || '',
      ev.entity || '',
      (ev.description || '').replace(/"/g, '""'),
    ])
    const csv = [
      headers.join(','),
      ...rows.map((r) => r.map((c) => `"${c}"`).join(',')),
    ].join('\n')

    const blob = new Blob([`\uFEFF${csv}`], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `auditoria-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      await auditRepo.syncFromSupabase()
      const local = await auditRepo.getAllLocal()
      setEvents(local)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ================= Render =================
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            🔍 Auditoría
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Registro de todas las acciones del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
          >
            {loading ? '⏳ Cargando…' : '🔄 Refrescar'}
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
          >
            📥 Exportar CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <AuditStats events={filtered} />

      {/* Filtros */}
      <AuditFilters
        filters={filters}
        setFilters={setFilters}
        events={events}
      />

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-4">
        {loading ? (
          <div className="p-10 text-center text-gray-400">
            Cargando eventos…
          </div>
        ) : paginated.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            No hay eventos que coincidan con los filtros
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Nivel</th>
                  <th className="px-4 py-3 text-left">Usuario</th>
                  <th className="px-4 py-3 text-left">Módulo</th>
                  <th className="px-4 py-3 text-left">Acción</th>
                  <th className="px-4 py-3 text-left">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((ev) => (
                  <AuditRow
                    key={ev.id}
                    event={ev}
                    onClick={() => setSelected(ev)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm">
            <span className="text-gray-500">
              {filtered.length} eventos · página {page} de {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40"
              >
                ←
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={page === totalPages}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal detalle */}
      {selected && (
        <AuditDetailModal
          event={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}