import { useMemo } from 'react'
import { Check as CheckIcon, X } from 'lucide-react'

/**
 * Evalúa la fortaleza de una contraseña.
 */
export function evaluatePassword(pwd = '') {
  const checks = {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    number: /\d/.test(pwd),
    symbol: /[^A-Za-z0-9]/.test(pwd),
  }

  const passed = Object.values(checks).filter(Boolean).length
  let score = 0
  if (pwd.length === 0) score = 0
  else if (passed <= 2) score = 1
  else if (passed === 3) score = 2
  else if (passed === 4) score = 3
  else score = 4

  const labels = ['', 'Débil', 'Media', 'Buena', 'Excelente']
  const colors = [
    'bg-gray-200 dark:bg-dark-border',
    'bg-red-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-emerald-500',
  ]

  return {
    score,
    label: labels[score],
    color: colors[score],
    checks,
  }
}

export default function UserPasswordStrength({ password = '' }) {
  const { score, label, color, checks } = useMemo(
    () => evaluatePassword(password),
    [password],
  )

  if (!password) return null

  return (
    <div className="mt-2 space-y-2">
      {/* Barra de progreso */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`
                h-1 flex-1 rounded-full transition-colors duration-200
                ${i <= score ? color : 'bg-gray-200 dark:bg-dark-border'}
              `}
            />
          ))}
        </div>
        <span
          className={`
            text-xs font-medium
            ${score <= 1 ? 'text-red-600 dark:text-red-400' : ''}
            ${score === 2 ? 'text-amber-600 dark:text-amber-400' : ''}
            ${score === 3 ? 'text-yellow-600 dark:text-yellow-500' : ''}
            ${score === 4 ? 'text-emerald-600 dark:text-emerald-400' : ''}
          `}
        >
          {label}
        </span>
      </div>

      {/* Checklist */}
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <CheckItem item={checks.length} label="8+ caracteres" />
        <CheckItem item={checks.upper}  label="Mayúscula" />
        <CheckItem item={checks.lower}  label="Minúscula" />
        <CheckItem item={checks.number} label="Número" />
        <CheckItem item={checks.symbol} label="Símbolo (!@#)" />
      </ul>
    </div>
  )
}

function CheckItem({ item, label }) {
  return (
    <li className="flex items-center gap-1.5">
      {item ? (
        <CheckIcon className="text-emerald-500" size={12} strokeWidth={3} />
      ) : (
        <X className="text-gray-400 dark:text-dark-muted" size={12} strokeWidth={3} />
      )}
      <span className={item ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-dark-muted'}>
        {label}
      </span>
    </li>
  )
}