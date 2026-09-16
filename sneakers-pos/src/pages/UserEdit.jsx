// src/pages/UserEdit.jsx
import { useState, useCallback, useMemo, useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Toast from '../components/common/Toast'
import UserCreateHeader from '../components/users/UserCreateHeader'
import UserEditForm from '../components/users/UserEditForm'
import { useView } from '../context/ViewContext'
import { useUsers } from '../context/UsersContext'
import { useAuth } from '../context/AuthContext'

export default function UserEdit() {
  const { navigate, viewParams } = useView()
  const { user: currentUser } = useAuth()
  const { getUserById, updateUser, logActivity } = useUsers()

  const userId = viewParams?.id
  const existingUser = useMemo(
    () => (userId ? getUserById(userId) : null),
    [userId, getUserById],
  )

  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  // Cargar datos del usuario en el formulario
  useEffect(() => {
    if (existingUser) {
      setForm({
        fullName: existingUser.fullName || '',
        phone: existingUser.phone || '',
        email: existingUser.email || '',
        role: existingUser.role || 'Vendedor',
        branch: existingUser.branch || 'Tienda principal',
        status: existingUser.status || 'active',
        // Campos de contraseña (opcionales en edición)
        changePassword: false,
        password: '',
        confirmPassword: '',
      })
    }
  }, [existingUser])

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const validate = () => {
    const next = {}

    if (!form.fullName.trim()) {
      next.fullName = 'El nombre completo es obligatorio'
    } else if (form.fullName.trim().length < 3) {
      next.fullName = 'Ingresa al menos 3 caracteres'
    }

    if (!form.email.trim()) {
      next.email = 'El correo de acceso es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Correo electrónico no válido'
    }

    if (form.phone && !/^[\d\s+\-()]{8,20}$/.test(form.phone.trim())) {
      next.phone = 'Número de celular no válido'
    }

    // Solo validar contraseña si el usuario quiere cambiarla
    if (form.changePassword) {
      if (!form.password) {
        next.password = 'La contraseña es obligatoria'
      } else if (form.password.length < 8) {
        next.password = 'Mínimo 8 caracteres'
      }

      if (!form.confirmPassword) {
        next.confirmPassword = 'Confirma la contraseña'
      } else if (form.confirmPassword !== form.password) {
        next.confirmPassword = 'Las contraseñas no coinciden'
      }
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    if (!existingUser) return

    setSubmitting(true)
    try {
      const payload = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
        branch: form.branch,
        status: form.status,
      }

      // Solo incluir contraseña si se va a cambiar
      if (form.changePassword && form.password) {
        payload.password = form.password
      }

      updateUser(existingUser.id, payload)

      logActivity(existingUser.id, {
        type: 'edit',
        label: `Usuario editado por ${currentUser?.name || 'Sistema'}`,
        by: currentUser?.name || 'Sistema',
      })

      setToast({
        title: 'Cambios guardados',
        description: `${form.fullName} fue actualizado correctamente.`,
      })

      setTimeout(() => navigate('users'), 900)
    } catch (err) {
      console.error('[UserEdit] Error al guardar', err)
      setErrors((prev) => ({
        ...prev,
        form: 'No fue posible guardar los cambios. Intenta de nuevo.',
      }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => navigate('users')
  const handleNavigate = (key) => navigate(key)

  if (!existingUser) {
    return (
      <DashboardLayout activeKey="users" onNavigate={handleNavigate}>
        <div className="text-center py-16">
          <p className="text-sm text-gray-500 dark:text-dark-muted">
            Usuario no encontrado.
          </p>
          <button
            type="button"
            onClick={() => navigate('users')}
            className="mt-4 text-sm font-medium text-brand-blue hover:underline"
          >
            Volver a usuarios
          </button>
        </div>
      </DashboardLayout>
    )
  }

  if (!form) {
    return (
      <DashboardLayout activeKey="users" onNavigate={handleNavigate}>
        <div className="text-center py-16">
          <p className="text-sm text-gray-500 dark:text-dark-muted">Cargando…</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeKey="users" onNavigate={handleNavigate}>
      <div className="w-full max-w-3xl mx-auto">
        <UserCreateHeader
          mode="edit"
          onBack={() => navigate('users')}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          submitting={submitting}
        />

        <UserEditForm
          user={existingUser}
          form={form}
          errors={errors}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
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