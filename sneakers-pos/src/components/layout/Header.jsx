import { Search, Bell, Menu } from 'lucide-react'

export default function Header({ onOpenMobile, user, period, onPeriodChange }) {
  return (
    <header className="h-16 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border px-4 lg:px-6 flex items-center gap-3">
      {/* Botón menú (móvil) */}
      <button
        onClick={onOpenMobile}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card text-gray-600 dark:text-dark-muted"
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>

      {/* Búsqueda */}
      <div className="relative flex-1 max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
          <Search size={17} strokeWidth={1.8} />
        </span>
        <input
          type="text"
          placeholder="Buscar productos, ventas, clientes..."
          className="
            w-full h-10 pl-9 pr-3 rounded-lg text-sm
            bg-gray-50 dark:bg-dark-card text-brand-black dark:text-dark-text
            border border-transparent
            focus:border-brand-blue focus:bg-white dark:focus:bg-dark-surface
            focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40
            outline-none placeholder:text-gray-400 dark:placeholder:text-dark-muted
            transition-all duration-150
          "
        />
      </div>

      {/* Selector de período (desktop) */}
      <div className="hidden md:block">
        <select
          value={period}
          onChange={(e) => onPeriodChange?.(e.target.value)}
          className="
            h-10 px-3 rounded-lg text-sm font-medium
            bg-white dark:bg-dark-card
            border border-gray-200 dark:border-dark-border
            text-brand-black dark:text-dark-text
            hover:border-brand-blue focus:border-brand-blue
            outline-none cursor-pointer transition-colors
          "
        >
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
          <option value="year">Este año</option>
          <option value="custom">Personalizado</option>
        </select>
      </div>

      {/* Notificaciones */}
      <button
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card text-gray-600 dark:text-dark-muted transition-colors"
        aria-label="Notificaciones"
      >
        <Bell size={19} strokeWidth={1.9} />
        {/* Punto rojo si hubiera alertas — controlado por lógica futura */}
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-red hidden" />
      </button>

      {/* Avatar */}
      <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-dark-border">
        <div className="w-9 h-9 rounded-full bg-brand-blue text-white flex items-center justify-center font-semibold text-sm">
          {(user?.name?.[0] || 'H').toUpperCase()}
        </div>
        <div className="hidden lg:block leading-tight">
          <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
            {user?.name || 'Henry'}
          </p>
          <p className="text-xs text-gray-500 dark:text-dark-muted">
            {user?.role || 'Administrador'}
          </p>
        </div>
      </div>
    </header>
  )
}