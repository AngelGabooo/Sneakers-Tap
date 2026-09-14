export default function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-10 px-4 ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-dark-surface flex items-center justify-center mb-3">
          <Icon size={20} className="text-gray-400 dark:text-dark-muted" strokeWidth={1.8} />
        </div>
      )}
      <p className="text-sm font-medium text-brand-black dark:text-dark-text">{title}</p>
      {description && (
        <p className="text-xs text-gray-500 dark:text-dark-muted mt-1 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}