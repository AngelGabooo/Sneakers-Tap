import { ChevronRight, ShoppingCart, MoreHorizontal, Eye, Receipt, Wallet, History, Power, Ban, Pencil } from 'lucide-react'
import Button from '../../common/Button'
import Badge from '../../common/Badge'
import IconButton from '../../common/IconButton'
import Dropdown, { DropdownItem } from '../../common/Dropdown'

const STATUS = {
  active:    { label: 'Activo',     variant: 'success' },
  inactive:  { label: 'Inactivo',   variant: 'neutral' },
  suspended: { label: 'Suspendido', variant: 'warning' },
  blocked:   { label: 'Bloqueado',  variant: 'danger' },
}

export default function WholesaleDetailHeader({
  mode = 'edit',
  wholesale,
  onBack,
  onSave,
  onCancel,
  submitting,
  onNewSale,
  onViewSales,
  onViewAccount,
  onViewAudit,
  onToggleStatus,
  onBlock,
}) {
  const isNew = mode === 'new'
  const status = wholesale ? STATUS[wholesale.status] || STATUS.active : null

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm mb-4 flex-wrap">
        <button
          onClick={onBack}
          className="text-gray-500 dark:text-dark-muted hover:text-brand-blue transition-colors font-medium"
        >
          Mayoreo
        </button>
        <ChevronRight size={14} className="text-gray-400" />
        <button
          onClick={onBack}
          className="text-gray-500 dark:text-dark-muted hover:text-brand-blue transition-colors font-medium"
        >
          Clientes mayoristas
        </button>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-brand-black dark:text-dark-text font-medium truncate max-w-[200px]">
          {isNew ? 'Nuevo mayorista' : wholesale?.name || 'Detalle'}
        </span>
      </nav>

      {/* Encabezado */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight truncate">
              {isNew ? 'Nuevo cliente mayorista' : wholesale?.name || 'Cliente mayorista'}
            </h1>
            {!isNew && status && (
              <Badge variant={status.variant}>{status.label}</Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
            {isNew
              ? 'Registra un nuevo cliente y configura sus condiciones comerciales.'
              : 'Administra la información y condiciones comerciales de este cliente mayorista.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isNew ? (
            <>
              <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
              <Button variant="primary" onClick={onSave} loading={submitting}>
                {submitting ? 'Guardando...' : 'Guardar mayorista'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" icon={Pencil} onClick={onSave} loading={submitting}>
                {submitting ? 'Guardando...' : 'Guardar cambios'}
              </Button>

              <Button variant="primary" icon={ShoppingCart} onClick={onNewSale}>
                Nueva venta
              </Button>

              <Dropdown
                align="right"
                trigger={<IconButton icon={MoreHorizontal} label="Más acciones" />}
              >
                <DropdownItem icon={Receipt}  onClick={onViewSales}>Ver ventas</DropdownItem>
                <DropdownItem icon={Wallet}   onClick={onViewAccount}>Ver cuenta</DropdownItem>
                <DropdownItem icon={History}  onClick={onViewAudit}>Ver auditoría</DropdownItem>
                <DropdownItem icon={Power}    onClick={onToggleStatus}>Activar / Suspender</DropdownItem>
                <DropdownItem icon={Ban} danger onClick={onBlock}>Bloquear</DropdownItem>
              </Dropdown>
            </>
          )}
        </div>
      </div>

      {/* Tarjeta de identificación (solo edición) */}
      {!isNew && wholesale && (
        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-5 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-brand-blue text-white flex items-center justify-center font-bold text-lg shrink-0">
              {(wholesale.name?.[0] || '?').toUpperCase()}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2 flex-1 text-sm">
              <Field label="Número"  value={wholesale.id} mono />
              <Field label="Empresa" value={wholesale.company || wholesale.legalName || '—'} />
              <Field label="Contacto" value={wholesale.contactName || '—'} />
              <Field label="Teléfono" value={wholesale.phone || '—'} />
              <Field label="Correo" value={wholesale.email || '—'} />
              <Field
                label="Fecha de alta"
                value={wholesale.createdAt
                  ? new Date(wholesale.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—'}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Field({ label, value, mono = false }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted">
        {label}
      </p>
      <p className={`text-sm font-medium text-brand-black dark:text-dark-text truncate mt-0.5 ${mono ? 'font-mono text-xs' : ''}`}>
        {value || '—'}
      </p>
    </div>
  )
}