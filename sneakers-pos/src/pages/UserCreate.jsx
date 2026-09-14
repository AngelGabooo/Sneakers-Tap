// src/pages/UserCreate.jsx
import { useState, useCallback } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Toast from '../components/common/Toast'
import UserCreateHeader from '../components/users/UserCreateHeader'
import UserCreateForm from '../components/users/UserCreateForm'
import { useView } from '../context/ViewContext'
import { useUsers } from '../context/UsersContext'
import { useAuth } from '../context/AuthContext'
import { evaluatePassword } from '../components/users/UserPasswordStrength'

const INITIAL_FORM = {
  fullName: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'Vendedor',
  branch: 'Tienda principal',
  status: 'active',
  sendInvite: true,
}

export default function UserCreate() {
  const { navigate } = useView()
  const { user: currentUser } = useAuth()
  const { createUser, getUserByEmail, logActivity } = useUsers()

  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

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
    } else if (getUserByEmail(form.email.trim())) {
      next.email = 'Ya existe un usuario con ese correo'
    }

    if (form.phone && !/^[\d\s+\-()]{8,20}$/.test(form.phone.trim())) {
      next.phone = 'Número de celular no válido'
    }

    if (!form.password) {
      next.password = 'La contraseña es obligatoria'
    } else if (form.password.length < 8) {
      next.password = 'Mínimo 8 caracteres'
    } else {
      const { score } = evaluatePassword(form.password)
      if (score < 2) {
        next.password = 'La contraseña es muy débil. Agrega mayúsculas, números o símbolos.'
      }
    }

    if (!form.confirmPassword) {
      next.confirmPassword = 'Confirma la contraseña'
    } else if (form.confirmPassword !== form.password) {
      next.confirmPassword = 'Las contraseñas no coinciden'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setSubmitting(true)
    try {
      const payload = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        branch: form.branch,
        status: form.status,
        createdBy: currentUser?.name || 'Sistema',
      }

      const created = createUser(payload)

      logActivity(created.id, {
        type: 'create',
        label: `Usuario creado por ${currentUser?.name || 'Sistema'}`,
        by: currentUser?.name || 'Sistema',
      })

      setToast({
        title: 'Usuario creado correctamente',
        description: `${created.fullName} fue registrado con ID ${created.employeeId}.`,
      })

      setTimeout(() => navigate('users'), 900)
    } catch (err) {
      console.error('[UserCreate] Error al guardar', err)
      setErrors((prev) => ({
        ...prev,
        form: 'No fue posible crear el empleado. Intenta de nuevo.',
      }))
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => navigate('users')
  const handleNavigate = (key) => navigate(key)

  return (
    <DashboardLayout activeKey="users" onNavigate={handleNavigate}>
      <div className="w-full max-w-3xl mx-auto">
        <UserCreateHeader
          onBack={() => navigate('users')}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          submitting={submitting}
        />

        <UserCreateForm
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