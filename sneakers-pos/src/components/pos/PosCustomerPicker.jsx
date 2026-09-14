import { useState } from 'react'
import { Search, UserPlus, X } from 'lucide-react'
import Button from '../common/Button'

/**
 * Selector de cliente.
 * - Venta general por defecto.
 * - Búsqueda simple.
 * - Botón para crear cliente rápido (futuro).
 */
export default function PosCustomerPicker({ open, onClose, onSelect, onClearCustomer }) {
  const [query, setQuery] = useState('')
  // 🚧 TODO: reemplazar por clientes del store/backend
  const customers = []

  if (!open) return null

  const handleSelect = (c) => {
    onSelect?.(c)
    onClose?.()
  }

  const handleGeneral = () => {
    onClearCustomer?.()
    onClose?.()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-cardHover">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border">
          <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
            Asignar cliente
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-brand-black dark:hover:text-dark-text transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Búsqueda */}
        <div className="p-5 space-y-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              <Search size={17} strokeWidth={1.8} />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, teléfono, correo o número..."
              className="
                w-full h-11 pl-10 pr-3 rounded-lg text-sm
                bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                border border-gray-200 dark:border-dark-border
                focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40
                outline-none placeholder:text-gray-400 dark:placeholder:text-dark-muted
              "
            />
          </div>

          {/* Lista de clientes */}
          <div className="rounded-lg border border-gray-100 dark:border-dark-border overflow-hidden">
            <button
              type="button"
              onClick={handleGeneral}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors border-b border-gray-100 dark:border-dark-border"
            >
              <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-dark-surface flex items-center justify-center shrink-0">
                <UserPlus size={16} className="text-gray-500" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
                  Venta general
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-muted">
                  Sin cliente asignado
                </p>
              </div>
            </button>

            {customers.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-dark-muted text-center py-6">
                No hay clientes registrados aún.
              </p>
            ) : (
              customers.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors border-b border-gray-100 dark:border-dark-border last:border-0"
                >
                  <div className="w-9 h-9 rounded-full bg-brand-blue text-white flex items-center justify-center shrink-0 text-sm font-semibold">
                    {c.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-brand-black dark:text-dark-text truncate">
                      {c.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-dark-muted truncate">
                      {c.phone || c.email || '—'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Nuevo cliente */}
          <Button
            variant="secondary"
            icon={UserPlus}
            className="w-full"
            onClick={() => console.log('Nuevo cliente rápido → pendiente')}
          >
            Nuevo cliente
          </Button>
        </div>
      </div>
    </div>
  )
}