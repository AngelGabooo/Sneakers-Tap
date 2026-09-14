// src/components/settings/SettingsTabs.jsx
import { SETTINGS_TABS } from '../../data/settings'

export default function SettingsTabs({ active, onChange }) {
  return (
    <div className="
      flex gap-1 overflow-x-auto pb-1 -mb-px
      border-b border-gray-200 dark:border-dark-border
    ">
      {SETTINGS_TABS.map((t) => {
        const isActive = active === t.key
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`
              shrink-0 px-4 py-2.5 text-sm font-medium whitespace-nowrap
              border-b-2 -mb-px transition-colors
              ${isActive
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-gray-500 dark:text-dark-muted hover:text-brand-black dark:hover:text-dark-text'}
            `}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}