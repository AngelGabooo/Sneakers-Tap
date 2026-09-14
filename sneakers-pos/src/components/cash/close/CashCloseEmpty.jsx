import { Wallet, History } from 'lucide-react'
import Card from '../../common/Card'
import Button from '../../common/Button'

export default function CashCloseEmpty({ onOpenCash, onViewHistory }) {
  return (
    <Card>
      <div className="flex flex-col items-center text-center py-12 px-6">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-surface flex items-center justify-center mb-4">
          <Wallet size={26} className="text-gray-400 dark:text-dark-muted" strokeWidth={1.8} />
        </div>
        <h3 className="text-base font-semibold text-brand-black dark:text-dark-text">
          No hay una caja abierta
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-2 max-w-sm">
          No existe una sesión de caja activa que pueda cerrarse.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-2 mt-6">
          <Button variant="primary" icon={Wallet} onClick={onOpenCash}>
            Abrir caja
          </Button>
          <Button variant="secondary" icon={History} onClick={onViewHistory}>
            Ver historial de cajas
          </Button>
        </div>
      </div>
    </Card>
  )
}