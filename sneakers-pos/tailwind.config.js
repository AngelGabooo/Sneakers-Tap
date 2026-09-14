/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2563EB',
          blueDark: '#1E3A8A',
          blueHover: '#1D4ED8',
          red: '#DC2626',
          black: '#111827',
          surface: '#F8FAFC',
        },
        // Estados semánticos
        state: {
          success: '#2563EB',   // usamos azul como "positivo" (identidad Sneakers)
          warning: '#D97706',
          danger:  '#DC2626',
          info:    '#2563EB',
        },
        // Modo oscuro
        dark: {
          bg:      '#0B1120',
          surface: '#111827',
          card:    '#131C31',
          border:  '#1F2937',
          text:    '#F9FAFB',
          muted:   '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(16, 24, 40, 0.04)',
        cardHover: '0 4px 12px -2px rgba(16, 24, 40, 0.08)',
      },
    },
  },
  plugins: [],
}