// src/components/wholesale/WholesaleCardList.jsx
import { Users, Search } from 'lucide-react'
import Card from '../common/Card'
import Badge from '../common/Badge'
import EmptyState from '../common/EmptyState'

const CONDITION = {
  basic:      { label: 'Mayoreo Básico',  variant: 'neutral' },
  premium:    { label: 'Mayoreo Premium', variant: 'info' },
  distributor:{ label: 'Distribuidor',    variant: 'success' },
  custom:     { label: 'Personalizado',   variant: 'warning' },
}

const STATUS = {
  active:    { label: 'Activo',     variant: 'success' },
  inactive:  { label: 'Inactivo',   variant: 'neutral' },
  suspended: { label: 'Suspendido', variant: 'warning' },
  blocked:   { label: 'Bloqueado',  variant: 'danger' },
}

export default function WholesaleCardList({
  wholesales = [], loading = false,
  onEdit, onDelete,
  searchQuery = '', filtersActive = false, onClearAll, onGoToNew,
}) {
  const hasItems = wholesales.length > 0

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="!p-4">
            <div className="h-3 w-32 bg-gray-100 dark:bg-dark-surface rounded animate-pulse" />
            <div className="h-3 w-20 bg-gray-100 dark:bg-dark-surface rounded animate-pulse mt-2" />
            <div className="h-3 w-full bg-gray-100 dark:bg-dark-surface rounded animate-pulse mt-3" />
          </Card>
        ))}
      </div>
    )
  }

  if (!hasItems && (searchQuery || filtersActive)) {
    return (
      <Card>
        <EmptyState
          icon={Search}
          title="No encontramos clientes"
          description="No existen clientes mayoristas que coincidan con los criterios seleccionados."
          action={
            <button onClick={onClearAll} className="text-sm font-medium text-brand-blue hover:underline">
              Limpiar filtros
            </button>
          }
        />
      </Card>
    )
  }

  if (!hasItems) {
    return (
      <Card>
        <EmptyState
          icon={Users}
          title="Aún no tienes clientes mayoristas"
          description="Registra tu primer cliente mayorista para comenzar a administrar precios, crédito y condiciones comerciales."
          action={
            <button onClick={onGoToNew} className="text-sm font-medium text-brand-blue hover:underline">
              + Nuevo mayorista
            </button>
          }
        />
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {wholesales.map((w) => {
        const condition = CONDITION[w.condition] || CONDITION.basic
        const status = STATUS[w.status] || STATUS.active
        const limit = Number(w.creditLimit) || 0
        const used = Number(w.creditUsed) || 0
        const available = Math.max(0, limit - used)

        return (
          <Card key={w.id} className="!p-4">
            {/* ⭐ Toda la card es clickable → editar */}
            <button className="w-full text-left" onClick={() => onEdit?.(w)}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-brand-blue text-white flex items-center justify-center font-semibold shrink-0">
                    {(w.name?.[0] || '?').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-black dark:text-dark-text truncate">
                      {w.name}
                    </p>
                    <p className="text-xs font-mono text-gray-500 dark:text-dark-muted truncate">
                      {w.id}
                    </p>
                  </div>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Badge variant={condition.variant}>{condition.label}</Badge>
                {w.overdue && w.balance > 0 && (
                  <Badge variant="danger">Pago vencido</Badge>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 dark:border-dark-border text-center">
                <div>
                  <p className="text-[11px] text-gray-500 dark:text-dark-muted">Compras</p>
                  <p className="text-xs font-semibold text-brand-black dark:text-dark-text">
                    ${Number(w.salesInPeriod || 0).toLocaleString('es-MX')}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 dark:text-dark-muted">Saldo</p>
                  <p className={`text-xs font-semibold ${w.balance > 0 ? 'text-brand-red' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    ${Number(w.balance || 0).toLocaleString('es-MX')}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 dark:text-dark-muted">Crédito</p>
                  <p className="text-xs font-semibold text-brand-black dark:text-dark-text">
                    ${available.toLocaleString('es-MX')}
                  </p>
                </div>
              </div>
            </button>

            {/* ⭐ Botón Eliminar fuera del botón principal */}
            <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-dark-border">
              <button
                type="button"
                onClick={() => onEdit?.(w)}
                className="
                  inline-flex items-center gap-1.5 h-8 px-3 rounded-md
                  text-[11px] font-semibold
                  text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-950/40
                  transition-colors
                "
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onDelete?.(w)}
                className="
                  inline-flex items-center gap-1.5 h-8 px-3 rounded-md
                  text-[11px] font-semibold
                  text-brand-red hover:bg-red-50 dark:hover:bg-red-950/40
                  transition-colors
                "
              >
                Eliminar
              </button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}