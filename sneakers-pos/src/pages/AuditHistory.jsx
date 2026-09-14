// src/pages/AuditHistory.jsx
import { useMemo, useState } from 'react'
import AuditHeader from '../components/audit/AuditHeader'
import AuditStats from '../components/audit/AuditStats'
import AuditSecurityStatus from '../components/audit/AuditSecurityStatus'
import AuditToolbar from '../components/audit/AuditToolbar'
import AuditQuickFilters from '../components/audit/AuditQuickFilters'
import AuditRecentTimeline from '../components/audit/AuditRecentTimeline'
import AuditTable from '../components/audit/AuditTable'
import AuditTableSkeleton from '../components/audit/AuditTableSkeleton'
import AuditPagination from '../components/audit/AuditPagination'
import AuditFiltersPanel from '../components/audit/AuditFiltersPanel'
import AuditDetailDrawer from '../components/audit/AuditDetailDrawer'
import Card from '../components/common/Card'

export default function AuditHistory() {
  // Estado de filtros y UI
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('last30')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [quickFilter, setQuickFilter] = useState('all')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState({
    user: 'all', module: 'all', action: 'all',
    result: 'all', level: 'all', entity: 'all', branch: 'all',
  })
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Datos (vacíos hasta conectar backend)
  const [loading] = useState(false)
  const [events] = useState([])
  const [stats] = useState({ total: 0, admin: 0, critical: 0, activeUsers: 0 })
  const [security] = useState({
    compromised: 0, failedLogins: 0,
    recentPermissionChanges: 0, remoteLogouts: 0,
  })

  const total = events.length
  const pagedEvents = useMemo(() => {
    const start = (page - 1) * perPage
    return events.slice(start, start + perPage)
  }, [events, page, perPage])

  const filtersActive = Object.values(filters).some((v) => v !== 'all')

  const handleClearFilters = () => {
    setFilters({
      user: 'all', module: 'all', action: 'all',
      result: 'all', level: 'all', entity: 'all', branch: 'all',
    })
    setSearch('')
    setQuickFilter('all')
  }

  const handleExport = (format) => {
    // TODO: conectar con backend
    console.info('Exportar auditoría en formato:', format)
  }

  return (
    <div className="p-4 sm:p-5 lg:p-6 bg-brand-bg dark:bg-dark-bg min-h-screen">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 dark:text-dark-muted mb-3">
        Seguridad <span className="mx-1">/</span>
        <span className="text-brand-black dark:text-dark-text font-medium">
          Historial y auditoría
        </span>
      </nav>

      <AuditHeader
        onExport={handleExport}
        onToggleFilters={() => setFiltersOpen((v) => !v)}
        filtersActive={filtersActive}
      />

      <AuditStats stats={stats} />
      <AuditSecurityStatus status={security} />

      <AuditToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        period={period}
        onPeriodChange={setPeriod}
        customFrom={customFrom}
        customTo={customTo}
        onCustomFromChange={setCustomFrom}
        onCustomToChange={setCustomTo}
        onToggleFilters={() => setFiltersOpen((v) => !v)}
        filtersActive={filtersActive}
      />

      <AuditQuickFilters active={quickFilter} onChange={setQuickFilter} />

      <div className="flex gap-5 items-start">
        <div className="flex-1 min-w-0">
          {events.length > 0 && (
            <AuditRecentTimeline events={events} />
          )}

          <Card className="!p-0 overflow-hidden">
            {loading ? (
              <AuditTableSkeleton rows={6} />
            ) : events.length === 0 ? (
              <div className="text-center py-16 px-6">
                <h3 className="text-base font-semibold text-brand-black dark:text-dark-text">
                  No hay eventos de auditoría
                </h3>
                <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
                  Las acciones relevantes realizadas en Sneakers aparecerán aquí.
                </p>
              </div>
            ) : (
              <>
                <AuditTable
                  events={pagedEvents}
                  onRowClick={(e) => setSelectedEvent(e)}
                />
                <AuditPagination
                  page={page}
                  perPage={perPage}
                  total={total}
                  onPageChange={setPage}
                  onPerPageChange={(v) => { setPerPage(v); setPage(1) }}
                />
              </>
            )}
          </Card>
        </div>

        <AuditFiltersPanel
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          filters={filters}
          onFilterChange={setFilters}
          onClear={handleClearFilters}
        />
      </div>

      <AuditDetailDrawer
        event={selectedEvent}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  )
}