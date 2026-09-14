import { Calendar, Clock } from 'lucide-react'
import Card from '../../common/Card'

export default function CashOpenDateTime({ date = new Date() }) {
  return (
    <Card>
      <header className="mb-4">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Inicio de operación
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Fecha y hora actuales del sistema.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-dark-border">
          <Calendar size={16} className="text-brand-blue shrink-0" strokeWidth={2} />
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted">
              Fecha
            </p>
            <p className="text-sm font-medium text-brand-black dark:text-dark-text mt-0.5">
              {date.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-dark-border">
          <Clock size={16} className="text-brand-blue shrink-0" strokeWidth={2} />
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted">
              Hora
            </p>
            <p className="text-sm font-medium text-brand-black dark:text-dark-text mt-0.5">
              {date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500 dark:text-dark-muted">
        La fecha y hora no pueden modificarse manualmente.
      </p>
    </Card>
  )
}