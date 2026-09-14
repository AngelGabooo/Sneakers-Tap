import { UserCog, ArrowLeft } from 'lucide-react'
import Card from '../../common/Card'
import Button from '../../common/Button'

export default function WholesaleDetailEmpty({ onBack }) {
  return (
    <Card>
      <div className="flex flex-col items-center text-center py-12 px-6">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-surface flex items-center justify-center mb-4">
          <UserCog size={26} className="text-gray-400 dark:text-dark-muted" strokeWidth={1.8} />
        </div>
        <h3 className="text-base font-semibold text-brand-black dark:text-dark-text">
          Mayorista no encontrado
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-2 max-w-sm">
          El cliente mayorista que intentas consultar no existe o fue eliminado.
        </p>

        <Button variant="primary" icon={ArrowLeft} onClick={onBack} className="mt-6">
          Volver al directorio
        </Button>
      </div>
    </Card>
  )
}