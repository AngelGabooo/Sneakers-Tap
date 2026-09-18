// src/components/login/LoginForm.jsx
import { useState } from 'react'
import { Lock, WifiOff } from 'lucide-react'
import InputField from './InputField'
import PasswordField from './PasswordField'
import ErrorAlert from './ErrorAlert'
import SneakersLogo from './SneakersLogo'
import ThemeToggle from '../common/ThemeToggle'
import Button from '../common/Button'
import { useAuth } from '../../context/AuthContext'
import { hasOfflineSnapshot } from '../../utils/offlineAuth'

export default function LoginForm() {
  const { login, isOffline } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (!email.trim()) newErrors.email = 'Ingresa tu correo electrónico.'
    if (!password.trim()) newErrors.password = 'Ingresa tu contraseña.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')
    if (!validate()) return

    setLoading(true)
    const result = await login({ email, password })
    setLoading(false)

    if (!result.ok) {
      setAuthError(result.error || 'Correo o contraseña incorrectos.')
    }
    // Si result.offline → el contexto ya seteó user.
  }

  const showOfflineHint = isOffline || !navigator.onLine
  const canOffline = hasOfflineSnapshot()

  return (
    <main className="w-full md:w-1/2 lg:w-1/2 flex items-center justify-center
                     bg-white dark:bg-dark-bg min-h-screen px-6 py-10">
      <div className="w-full max-w-[440px]">
        <div className="flex justify-end mb-6">
          <ThemeToggle />
        </div>

        {/* ⭐ Logo en móvil (el panel azul de escritorio no se ve aquí) */}
        <div className="md:hidden mb-8 flex justify-center">
          <img
            src="/images/sneakers-tap-logo.png"
            alt="Sneakers Tap"
            className="w-48 h-auto object-contain
                       drop-shadow-[0_10px_25px_rgba(0,0,0,0.15)]
                       dark:drop-shadow-[0_10px_25px_rgba(0,0,0,0.4)]"
          />
        </div>

        <header className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-brand-black dark:text-dark-text tracking-tight">
            Bienvenido de nuevo
          </h1>
          <p className="mt-2 text-[15px] text-gray-600 dark:text-dark-muted">
            Ingresa a tu cuenta para continuar
          </p>
        </header>

        {/* ⭐ Banner modo offline */}
        {showOfflineHint && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border px-3.5 py-3
                          border-amber-200 bg-amber-50
                          dark:border-amber-900/50 dark:bg-amber-950/40">
            <WifiOff size={18} className="text-amber-600 shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-sm text-amber-700 dark:text-amber-400 leading-snug">
              {canOffline
                ? 'Sin conexión. Puedes entrar con tus credenciales guardadas en este dispositivo.'
                : 'Sin conexión. Necesitas conectarte al menos una vez para habilitar el acceso offline.'}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <InputField
            id="email"
            label="Correo electrónico"
            placeholder="Ingresa tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
          />

          <PasswordField
            id="password"
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          <div className="flex justify-end -mt-2">
            <a href="#"
              className="text-sm font-medium text-brand-blue hover:text-brand-blueDark hover:underline transition-colors">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <ErrorAlert message={authError} />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-dark-muted pt-1">
            <Lock size={13} strokeWidth={2} />
            <span>Acceso seguro para usuarios autorizados</span>
          </div>
        </form>

        <footer className="mt-10 text-center">
          <p className="text-xs text-gray-400 dark:text-dark-muted">
            © 2026 Sneakers. Todos los derechos reservados.
          </p>
          <p className="text-[11px] text-gray-400 dark:text-dark-muted mt-1">Versión 1.0.0</p>
        </footer>
      </div>
    </main>
  )
}