import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle({ variant = 'icon' }) {
  const { mode, resolvedTheme, setTheme, toggleTheme } = useTheme()

  // Variante compacta: solo alterna claro/oscuro
  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        className="
          h-10 w-10 rounded-lg flex items-center justify-center
          border border-gray-200 bg-white text-brand-black
          hover:border-brand-blue hover:text-brand-blue
          dark:border-dark-border dark:bg-dark-surface dark:text-dark-text
          dark:hover:border-brand-blue dark:hover:text-brand-blue
          transition-colors duration-150
        "
      >
        {resolvedTheme === 'dark'
          ? <Sun size={18} strokeWidth={2} />
          : <Moon size={18} strokeWidth={2} />}
      </button>
    )
  }

  // Variante completa: 3 opciones (claro / sistema / oscuro)
  const options = [
    { key: 'light',  label: 'Claro',   Icon: Sun },
    { key: 'system', label: 'Sistema', Icon: Monitor },
    { key: 'dark',   label: 'Oscuro',  Icon: Moon },
  ]

  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 dark:border-dark-border dark:bg-dark-surface">
      {options.map(({ key, label, Icon }) => {
        const active = mode === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => setTheme(key)}
            title={label}
            aria-label={label}
            className={`
              h-8 px-2.5 rounded-md flex items-center gap-1.5 text-xs font-medium
              transition-colors duration-150
              ${active
                ? 'bg-brand-blue text-white'
                : 'text-gray-500 hover:text-brand-black dark:text-dark-muted dark:hover:text-dark-text'}
            `}
          >
            <Icon size={14} strokeWidth={2.2} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        )
      })}
    </div>
  )
}