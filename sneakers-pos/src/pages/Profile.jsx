// src/pages/Profile.jsx
import { useState, useEffect } from 'react'
import {
  User, Mail, Phone, Shield, Save, KeyRound, Eye, EyeOff,
  CheckCircle2, AlertCircle, Camera, Building2, BadgeCheck, Calendar,
} from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Toast from '../components/common/Toast'
import { useView } from '../context/ViewContext'
import { useAuth } from '../context/AuthContext'
import { useUsers } from '../context/UsersContext'

export default function Profile() {
  const { navigate } = useView()
  const { user: currentUser } = useAuth()
  const { updateUser, getUserById, logActivity } = useUsers()

  // Obtener la versión más actualizada del usuario
  const liveUser = currentUser?.id ? getUserById(currentUser.id) : null
  const baseUser = liveUser || currentUser || {}

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  // Cargar datos actuales
  useEffect(() => {
    if (baseUser) {
      setForm({
        fullName: baseUser.fullName || baseUser.name || '',
        email: baseUser.email || '',
        phone: baseUser.phone || '',
      })
    }
  }, [baseUser?.id])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handlePasswordChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const toggleShow = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const validateProfile = () => {
    const next = {}
    if (!form.fullName.trim()) {
      next.fullName = 'El nombre es obligatorio'
    } else if (form.fullName.trim().length < 3) {
      next.fullName = 'Ingresa al menos 3 caracteres'
    }
    if (!form.email.trim()) {
      next.email = 'El correo es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Correo no válido'
    }
    if (form.phone && !/^[\d\s+\-()]{8,20}$/.test(form.phone.trim())) {
      next.phone = 'Teléfono no válido'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSaveProfile = async () => {
    if (!validateProfile()) return
    if (!baseUser.id) {
      setToast({
        title: 'Error',
        description: 'No se pudo identificar al usuario.',
      })
      return
    }

    setSubmitting(true)
    try {
      updateUser(baseUser.id, {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
      })

      logActivity(baseUser.id, {
        type: 'edit',
        label: 'Perfil actualizado por el propio usuario',
        by: form.fullName.trim(),
      })

      setToast({
        title: 'Perfil actualizado',
        description: 'Tus datos se guardaron correctamente.',
      })
    } catch (err) {
      console.error('[Profile] Error al guardar', err)
      setToast({
        title: 'Error al guardar',
        description: 'Intenta de nuevo.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const validatePassword = () => {
    const next = {}
    if (!passwordForm.newPassword) {
      next.newPassword = 'La nueva contraseña es obligatoria'
    } else if (passwordForm.newPassword.length < 8) {
      next.newPassword = 'Mínimo 8 caracteres'
    }
    if (!passwordForm.confirmPassword) {
      next.confirmPassword = 'Confirma la contraseña'
    } else if (passwordForm.confirmPassword !== passwordForm.newPassword) {
      next.confirmPassword = 'Las contraseñas no coinciden'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleChangePassword = async () => {
    if (!validatePassword()) return
    setSubmitting(true)
    try {
      updateUser(baseUser.id, {
        password: passwordForm.newPassword,
      })

      logActivity(baseUser.id, {
        type: 'password',
        label: 'Contraseña cambiada por el propio usuario',
        by: form.fullName,
      })

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setToast({
        title: 'Contraseña actualizada',
        description: 'Tu nueva contraseña está activa.',
      })
    } catch (err) {
      console.error('[Profile] Error al cambiar contraseña', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleNavigate = (key) => navigate(key)

  if (!baseUser?.id) {
    return (
      <DashboardLayout activeKey="profile" onNavigate={handleNavigate}>
        <Card>
          <div className="text-center py-12">
            <AlertCircle size={40} className="text-amber-500 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-dark-muted">
              No se pudo cargar tu perfil.
            </p>
          </div>
        </Card>
      </DashboardLayout>
    )
  }

  const displayName = form.fullName || baseUser.fullName || baseUser.name || 'Usuario'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <DashboardLayout activeKey="profile" onNavigate={handleNavigate}>
      <div className="w-full max-w-4xl mx-auto space-y-5">

        {/* ============================================================ */}
        {/* HERO — Card principal con avatar                              */}
        {/* ============================================================ */}
        <Card>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-blue to-blue-700 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                {initials}
              </div>
              <button
                type="button"
                className="
                  absolute -bottom-1.5 -right-1.5
                  w-8 h-8 rounded-full bg-white dark:bg-dark-card
                  border-2 border-gray-200 dark:border-dark-border
                  flex items-center justify-center
                  text-gray-600 dark:text-dark-muted
                  hover:text-brand-blue hover:border-brand-blue
                  transition-colors shadow-sm
                "
                title="Cambiar foto (próximamente)"
              >
                <Camera size={14} />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-2xl font-bold text-brand-black dark:text-dark-text tracking-tight truncate">
                  {displayName}
                </h1>
                <span className="
                  inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                  text-xs font-bold self-center sm:self-auto
                  bg-blue-100 text-brand-blue
                  dark:bg-blue-950/60 dark:text-blue-300
                ">
                  <Shield size={12} strokeWidth={2.4} />
                  {baseUser.role || 'Usuario'}
                </span>
              </div>

              <p className="text-sm text-gray-500 dark:text-dark-muted mt-1 truncate">
                {baseUser.email || '—'}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 justify-center sm:justify-start">
                {baseUser.employeeId && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-dark-muted">
                    <BadgeCheck size={13} className="text-emerald-500" />
                    <span className="font-mono">{baseUser.employeeId}</span>
                  </div>
                )}
                {baseUser.branch && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-dark-muted">
                    <Building2 size={13} />
                    {baseUser.branch}
                  </div>
                )}
                {baseUser.createdAt && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-dark-muted">
                    <Calendar size={13} />
                    Miembro desde {new Date(baseUser.createdAt).toLocaleDateString('es-MX', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* ============================================================ */}
        {/* Datos personales                                              */}
        {/* ============================================================ */}
        <Card>
          <header className="flex items-start gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
              <User size={17} className="text-brand-blue" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-brand-black dark:text-dark-text">
                Datos personales
              </h2>
              <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
                Actualiza tu información de contacto.
              </p>
            </div>
          </header>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
                Nombre completo <span className="text-brand-red">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                  <User size={17} strokeWidth={1.9} />
                </span>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="Ej. Carlos Martínez"
                  className={`
                    w-full h-11 pl-10 pr-3 rounded-lg text-sm
                    bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                    border transition-colors outline-none
                    placeholder:text-gray-400 dark:placeholder:text-dark-muted
                    ${errors.fullName
                      ? 'border-brand-red focus:border-brand-red focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/40'
                      : 'border-gray-200 dark:border-dark-border focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40'}
                  `}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1.5 text-xs text-brand-red">{errors.fullName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
                  Correo electrónico <span className="text-brand-red">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                    <Mail size={17} strokeWidth={1.9} />
                  </span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="tu@correo.com"
                    className={`
                      w-full h-11 pl-10 pr-3 rounded-lg text-sm
                      bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                      border transition-colors outline-none
                      placeholder:text-gray-400 dark:placeholder:text-dark-muted
                      ${errors.email
                        ? 'border-brand-red focus:border-brand-red focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/40'
                        : 'border-gray-200 dark:border-dark-border focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40'}
                    `}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-brand-red">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
                  Teléfono
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                    <Phone size={17} strokeWidth={1.9} />
                  </span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="Ej. 55 1234 5678"
                    className={`
                      w-full h-11 pl-10 pr-3 rounded-lg text-sm
                      bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                      border transition-colors outline-none
                      placeholder:text-gray-400 dark:placeholder:text-dark-muted
                      ${errors.phone
                        ? 'border-brand-red focus:border-brand-red focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/40'
                        : 'border-gray-200 dark:border-dark-border focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40'}
                    `}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1.5 text-xs text-brand-red">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                icon={Save}
                onClick={handleSaveProfile}
                loading={submitting}
              >
                Guardar cambios
              </Button>
            </div>
          </div>
        </Card>

        {/* ============================================================ */}
        {/* Cambiar contraseña                                            */}
        {/* ============================================================ */}
        <Card>
          <header className="flex items-start gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
              <KeyRound size={17} className="text-brand-blue" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-brand-black dark:text-dark-text">
                Seguridad
              </h2>
              <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
                Cambia tu contraseña periódicamente.
              </p>
            </div>
          </header>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
                Nueva contraseña <span className="text-brand-red">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                  <KeyRound size={17} strokeWidth={1.9} />
                </span>
                <input
                  type={showPasswords.next ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  className={`
                    w-full h-11 pl-10 pr-11 rounded-lg text-sm
                    bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                    border transition-colors outline-none
                    placeholder:text-gray-400 dark:placeholder:text-dark-muted
                    ${errors.newPassword
                      ? 'border-brand-red focus:border-brand-red focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/40'
                      : 'border-gray-200 dark:border-dark-border focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40'}
                  `}
                />
                <button
                  type="button"
                  onClick={() => toggleShow('next')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-brand-blue transition-colors"
                >
                  {showPasswords.next ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1.5 text-xs text-brand-red">{errors.newPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
                Confirmar contraseña <span className="text-brand-red">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                  <KeyRound size={17} strokeWidth={1.9} />
                </span>
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  placeholder="Repite la contraseña"
                  autoComplete="new-password"
                  className={`
                    w-full h-11 pl-10 pr-11 rounded-lg text-sm
                    bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                    border transition-colors outline-none
                    placeholder:text-gray-400 dark:placeholder:text-dark-muted
                    ${errors.confirmPassword
                      ? 'border-brand-red focus:border-brand-red focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/40'
                      : 'border-gray-200 dark:border-dark-border focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40'}
                  `}
                />
                <button
                  type="button"
                  onClick={() => toggleShow('confirm')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-brand-blue transition-colors"
                >
                  {showPasswords.confirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-brand-red">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
              <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" strokeWidth={2} />
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                Después de cambiar tu contraseña, deberás usarla en el próximo inicio de sesión.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                icon={Shield}
                onClick={handleChangePassword}
                loading={submitting}
              >
                Cambiar contraseña
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Toast
        open={!!toast}
        variant="success"
        title={toast?.title}
        description={toast?.description}
        onClose={() => setToast(null)}
      />
    </DashboardLayout>
  )
}