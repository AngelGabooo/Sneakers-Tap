import { Wallet, MapPin } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function PosHeader({ cashOpen = false, cashId, location = 'Tienda principal' }) {
  const { user } = useAuth()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-brand-black dark:text-dark-text tracking-tight">
          Nueva venta
        </h1>
        <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
          Venta #VTA-000000 (temporal)
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Caja */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
          <Wallet size={13} className={cashOpen ? 'text-brand-blue' : 'text-brand-red'} strokeWidth={2.2} />
          <div className="leading-tight">
            <p className="text-[10px] text-gray-500 dark:text-dark-muted">
              {cashId || 'Caja #001'}
            </p>
            <p className={`text-[10px] font-medium ${cashOpen ? 'text-brand-blue' : 'text-brand-red'}`}>
              {cashOpen ? 'Abierta' : 'Cerrada'}
            </p>
          </div>
        </div>

        {/* Ubicación */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
          <MapPin size={13} className="text-gray-500" strokeWidth={2} />
          <span className="text-[11px] text-gray-600 dark:text-dark-muted">{location}</span>
        </div>

        {/* Usuario */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-[11px] font-semibold">
            {(user?.name?.[0] || 'H').toUpperCase()}
          </div>
          <div className="hidden lg:block leading-tight">
            <p className="text-[11px] font-semibold text-brand-black dark:text-dark-text">
              {user?.name || 'Henry'}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-dark-muted">
              {user?.role || 'Administrador'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}