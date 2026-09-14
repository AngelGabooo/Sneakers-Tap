import { useState } from 'react'

export default function Tooltip({ children, content, side = 'top' }) {
  const [visible, setVisible] = useState(false)

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && content && (
        <span
          role="tooltip"
          className={`
            absolute z-50 px-2.5 py-1.5 rounded-lg text-xs
            bg-brand-black dark:bg-dark-card text-white dark:text-dark-text
            border border-transparent dark:border-dark-border
            whitespace-nowrap shadow-cardHover
            ${side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
            left-1/2 -translate-x-1/2
          `}
        >
          {content}
        </span>
      )}
    </span>
  )
}