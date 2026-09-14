export default function SneakersLogo({ variant = 'light' }) {
  const isLight = variant === 'light'
  const textColor = isLight ? 'text-white' : 'text-brand-black dark:text-dark-text'
  const accent = isLight ? 'text-white/90' : 'text-brand-blue'

  return (
    <div className="flex items-center gap-3">
      <svg
        width="40" height="40" viewBox="0 0 40 40" fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={accent}
      >
        <path
          d="M4 26 L4 22 C4 21 4.5 20.2 5.4 19.8 L14 16 L18 10 C18.5 9.2 19.5 9 20.3 9.5 L22.5 11 C23 11.3 23.3 11.8 23.2 12.4 L22.6 15.4 L30 15 C34 15 37 17.5 37 21 L37 26 C37 27.1 36.1 28 35 28 L6 28 C4.9 28 4 27.1 4 26 Z"
          fill="currentColor"
        />
        <path d="M14 20 L20 17.5 M22 19 L28 17.5"
          stroke={isLight ? '#1E3A8A' : '#FFFFFF'}
          strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className={`text-2xl font-extrabold tracking-tight ${textColor}`}>
        SNEAKERS
      </span>
    </div>
  )
}