import { Wallet, Calendar } from 'lucide-react'
import Card from '../../common/Card'
import Button from '../../common/Button'

export default function CashHistoryEmpty({ onChangePeriod, onOpenCash, showOpenAction }) {
  return (
    <Card>
      <div className="flex flex-col items-center text-center py-12 px-6">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-surface flex items-center justify-center mb-4">
          <Wallet size={26} className="text-gray-400 dark:text-dark-muted" strokeWidth={1.8} />
        </div>
        <h3 className="text-base font-semibold text-brand-black dark:text-dark-text">
          No hay cajas registradas
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-2 max-w-sm">
          Todavía no se han registrado sesiones de caja en este periodo.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-2 mt-6">
          <Button variant="secondary" icon={Calendar} onClick={onChangePeriod}>
            Cambiar periodo
          </Button>
          {showOpenAction && (
            <Button variant="primary" icon={Wallet} onClick={onOpenCash}>
              Abrir una caja
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}