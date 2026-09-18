// src/components/credits/CreditsToolbar.jsx
import { Search, X } from 'lucide-react'

export default function CreditsToolbar({ search, onSearchChange }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="relative flex-1">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
          <Search size={16} strokeWidth={1.8} />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Buscar por cliente o notas…"
          className="
            w-full h-10 pl-9 pr-8 rounded-lg text-sm
            bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
            border border-gray-200 dark:border-dark-border
            focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40
            outline-none placeholder:text-gray-400 dark:placeholder:text-dark-muted
          "
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange?.('')}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-brand-black dark:hover:text-dark-text"
            aria-label="Limpiar"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}