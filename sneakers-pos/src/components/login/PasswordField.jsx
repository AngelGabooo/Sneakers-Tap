import { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function PasswordField({
  id, label, placeholder, value, onChange, error,
  autoComplete = 'current-password',
}) {
  const [show, setShow] = useState(false)

  return (
    <div className="w-full">
      <label htmlFor={id}
        className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
        {label}
      </label>

      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 dark:text-dark-muted pointer-events-none">
          <Lock size={18} strokeWidth={1.8} />
        </span>

        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`
            w-full h-12 pl-10 pr-11 rounded-lg text-[15px]
            bg-white text-brand-black
            dark:bg-dark-surface dark:text-dark-text
            border transition-all duration-150 outline-none
            placeholder:text-gray-400 dark:placeholder:text-dark-muted
            ${error
              ? 'border-brand-red focus:border-brand-red focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/40'
              : 'border-gray-200 dark:border-dark-border focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40'}
          `}
        />

        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-dark-muted hover:text-brand-blue transition-colors"
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {show ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
        </button>
      </div>

      {error && <p className="mt-1.5 text-xs text-brand-red">{error}</p>}
    </div>
  )
}