import { MoreHorizontal, Wallet, History, Plus } from 'lucide-react'
import Button from '../../common/Button'
import IconButton from '../../common/IconButton'
import Dropdown, { DropdownItem } from '../../common/Dropdown'

export default function CashCurrentHeader({
  onGoClose,
  onViewHistory,
  onRegisterMovement,
  onViewAudit,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
          Caja actual
        </h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
          Monitorea el estado y los movimientos de la caja durante la jornada.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="secondary" icon={Plus} onClick={onRegisterMovement}>
          <span className="hidden sm:inline">Registrar movimiento</span>
          <span className="sm:hidden">Movimiento</span>
        </Button>

        <Button variant="secondary" icon={History} onClick={onViewHistory}>
          <span className="hidden sm:inline">Ver historial</span>
          <span className="sm:hidden">Historial</span>
        </Button>

        <Button variant="primary" icon={Wallet} onClick={onGoClose}>
          <span className="hidden sm:inline">Ir a cierre de caja</span>
          <span className="sm:hidden">Cierre</span>
        </Button>

        <Dropdown
          align="right"
          trigger={<IconButton icon={MoreHorizontal} label="Más acciones" />}
        >
          <DropdownItem icon={History} onClick={onViewHistory}>Historial de esta caja</DropdownItem>
          <DropdownItem icon={History} onClick={onViewAudit}>Ver auditoría de la sesión</DropdownItem>
        </Dropdown>
      </div>
    </div>
  )
}