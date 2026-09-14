export default function Card({ children, className = '', padded = true }) {
  return (
    <div
      className={`
        bg-white dark:bg-dark-card
        border border-gray-200 dark:border-dark-border
        rounded-xl shadow-card
        ${padded ? 'p-5 lg:p-6' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}