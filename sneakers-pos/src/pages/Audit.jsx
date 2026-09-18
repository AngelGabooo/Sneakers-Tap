// src/pages/Audit.jsx
import { useMemo, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useView } from '../context/ViewContext'
import AuditHeader from '../components/audit/AuditHeader'
import AuditStats from '../components/audit/AuditStats'
import AuditSecurityStatus from '../components/audit/AuditSecurityStatus'
import AuditToolbar from '../components/audit/AuditToolbar'
import AuditQuickFilters from '../components/audit/AuditQuickFilters'
import AuditRecentTimeline from '../components/audit/AuditRecentTimeline'
import AuditTable from '../components/audit/AuditTable'
import AuditPagination from '../components/audit/AuditPagination'
import AuditFiltersPanel from '../components/audit/AuditFiltersPanel'
import AuditDetailDrawer from '../components/audit/AuditDetailDrawer'
import Card from '../components/common/Card'
import { useAudit } from '../context/AuditContext'

export default function Audit() {
  const { activeView, navigate } = useView()
  const {
    events, stats, security, total,
    search, setSearch,
    period, setPeriod,
    customFrom, setCustomFrom,
    customTo, setCustomTo,
    quickFilter, setQuickFilter,
    filters, setFilters,
    page, setPage,
    perPage, setPerPage,
    resetFilters,
  } = useAudit()

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  const filtersActive = useMemo(
    () => Object.values(filters).some((v) => v !== 'all'),
    [filters],
  )

  const handleExport = (format) => {
    console.info('Exportar auditoría en formato:', format)
  }

  return (
    <DashboardLayout
      activeKey={activeView || 'audit'}
      onNavigate={navigate}
      period={period}
      onPeriodChange={setPeriod}
    >
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

      {/* ⭐ Ahora se pasa stats en lugar de events */}
      <AuditStats stats={stats} />

      <AuditSecurityStatus status={security} />

      <AuditToolbar
        search={search}
        onSearchChange={setSearch}
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
          {events.length > 0 && <AuditRecentTimeline events={events} />}

          <Card className="!p-0 overflow-hidden">
            {events.length === 0 ? (
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
                  events={events}
                  onRowClick={(e) => setSelectedEvent(e)}
                />
                <AuditPagination
                  page={page}
                  perPage={perPage}
                  total={total}
                  onPageChange={setPage}
                  onPerPageChange={setPerPage}
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
          onClear={resetFilters}
        />
      </div>

      <AuditDetailDrawer
        event={selectedEvent}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </DashboardLayout>
  )
}