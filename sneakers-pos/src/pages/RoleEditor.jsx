// src/pages/RoleEditor.jsx
import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, Save, X } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Toast from '../components/common/Toast'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import TextField from '../components/common/TextField'
import TextareaField from '../components/common/TextareaField'
import RadioGroup from '../components/common/RadioGroup'
import RoleEditorPermissions from '../components/roles/RoleEditorPermissions'
import RoleEditorSummary from '../components/roles/RoleEditorSummary'
import { useView } from '../context/ViewContext'
import { useRoles } from '../context/RolesContext'
import { ALL_PERMISSIONS } from '../data/permissions'

const INITIAL_FORM = {
  name: '',
  description: '',
  status: 'active',
  scope: 'all',
  branches: [],
  permissions: [],
  baseRoleId: '',
}

const BRANCHES = [
  { value: 'Tienda principal', label: 'Tienda principal' },
  { value: 'Sucursal Centro',  label: 'Sucursal Centro' },
]

export default function RoleEditor() {
  const { navigate, viewParams } = useView()
  const { getRoleById, createRole, updateRole } = useRoles()

  const roleId = viewParams?.id
  const isEdit = !!roleId
  const role = roleId ? getRoleById(roleId) : null

  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (isEdit && role) {
      setForm({
        name: role.name || '',
        description: role.description || '',
        status: role.status || 'active',
        scope: role.scope || 'all',
        branches: role.branches || [],
        permissions: role.permissions || [],
        baseRoleId: role.baseRoleId || '',
      })
      setDirty(false)
    } else {
      setForm(INITIAL_FORM)
    }
  }, [isEdit, role])

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
    setDirty(true)
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const handleTogglePermission = (permKey) => {
    setForm((f) => {
      const has = f.permissions.includes(permKey)
      const next = has
        ? f.permissions.filter((p) => p !== permKey)
        : [...f.permissions, permKey]
      return { ...f, permissions: next }
    })
    setDirty(true)
  }

  const handleToggleModule = (module, enabled) => {
    setForm((f) => {
      const moduleKeys = module.permissions.map((p) => p.key)
      if (enabled) {
        const next = new Set([...f.permissions, ...moduleKeys])
        return { ...f, permissions: Array.from(next) }
      }
      return { ...f, permissions: f.permissions.filter((p) => !moduleKeys.includes(p)) }
    })
    setDirty(true)
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'El nombre del rol es obligatorio.'
    if (!form.description.trim()) e.description = 'La descripción es obligatoria.'
    if (form.scope === 'branches' && (!form.branches || form.branches.length === 0)) {
      e.branches = 'Selecciona al menos una sucursal.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ⭐ handleSubmit ahora es async con await + try/catch
  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)

    try {
      // Payload limpio
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        status: form.status,
        scope: form.scope,
        branches: form.branches || [],
        permissions: form.permissions || [],
      }

      console.log('📤 Guardando rol:', {
        isEdit,
        roleId,
        name: payload.name,
        numPermissions: payload.permissions.length,
      })

      if (isEdit && roleId) {
        // ✅ AWAIT
        const updated = await updateRole(roleId, payload)
        console.log(
          '✅ Rol actualizado:',
          updated?.name,
          'con',
          updated?.permissions?.length,
          'permisos',
        )

        setToast({
          title: 'Rol actualizado correctamente',
          description: `"${payload.name}" guardado con ${payload.permissions.length} permisos.`,
        })
      } else {
        // ✅ AWAIT
        const created = await createRole(payload)
        console.log('✅ Rol creado:', created?.name)

        setToast({
          title: 'Rol creado correctamente',
          description: `"${payload.name}" creado con ${payload.permissions.length} permisos.`,
        })
      }

      setSubmitting(false)
      setDirty(false)
      setTimeout(() => navigate('roles'), 1000)
    } catch (err) {
      console.error('❌ Error guardando rol:', err)
      setSubmitting(false)
      setToast({
        title: 'Error al guardar',
        description: err.message || 'Intenta de nuevo.',
      })
    }
  }

  const handleCancel = () => {
    if (dirty && !window.confirm('¿Salir sin guardar? Hay cambios de permisos sin guardar.')) return
    navigate('roles')
  }

  const allSelected = useMemo(
    () => form.permissions.length === ALL_PERMISSIONS.length,
    [form.permissions],
  )

  const handleToggleAll = () => {
    setForm((f) => ({
      ...f,
      permissions: allSelected ? [] : [...ALL_PERMISSIONS],
    }))
    setDirty(true)
  }

  return (
    <DashboardLayout
      activeKey="roles"
      onNavigate={(key) => navigate(key)}
      period={undefined}
      onPeriodChange={undefined}
    >
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm mb-5">
          <button
            onClick={() => navigate('roles')}
            className="text-gray-500 dark:text-dark-muted hover:text-brand-blue transition-colors font-medium"
          >
            Roles y permisos
          </button>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-brand-black dark:text-dark-text font-medium">
            {isEdit ? `Editar: ${role?.name || ''}` : 'Nuevo rol'}
          </span>
        </nav>

        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
              {isEdit ? 'Editar rol' : 'Crear nuevo rol'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
              Define el nombre, alcance y permisos que tendrá este rol.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={X} onClick={handleCancel} disabled={submitting}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              icon={Save}
              onClick={handleSubmit}
              loading={submitting}
            >
              {isEdit ? 'Guardar cambios' : 'Crear rol'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-5">
            {/* Información del rol */}
            <Card>
              <header className="mb-5">
                <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
                  Información del rol
                </h2>
                <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
                  Nombre y descripción del rol.
                </p>
              </header>

              <div className="space-y-4">
                <TextField
                  id="name"
                  label="Nombre del rol"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ej. Supervisor de ventas"
                  required
                  error={errors.name}
                />

                <TextareaField
                  id="description"
                  label="Descripción"
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe brevemente qué puede hacer este rol."
                  rows={3}
                  required
                  error={errors.description}
                />

                <RadioGroup
                  name="status"
                  value={form.status}
                  onChange={(v) => handleChange('status', v)}
                  options={[
                    { value: 'active', label: 'Activo' },
                    { value: 'inactive', label: 'Inactivo' },
                  ]}
                />
              </div>
            </Card>

            {/* Alcance */}
            <Card>
              <header className="mb-5">
                <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
                  Alcance de acceso
                </h2>
                <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
                  Define en qué sucursales puede operar este rol.
                </p>
              </header>

              <RadioGroup
                name="scope"
                value={form.scope}
                onChange={(v) => handleChange('scope', v)}
                options={[
                  { value: 'all',      label: 'Todas las sucursales' },
                  { value: 'branches', label: 'Sucursales seleccionadas' },
                ]}
              />

              {form.scope === 'branches' && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-brand-black dark:text-dark-text">
                    Sucursales
                  </p>
                  {BRANCHES.map((b) => (
                    <label key={b.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.branches.includes(b.value)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...form.branches, b.value]
                            : form.branches.filter((x) => x !== b.value)
                          handleChange('branches', next)
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                      />
                      <span className="text-sm text-brand-black dark:text-dark-text">
                        {b.label}
                      </span>
                    </label>
                  ))}
                  {errors.branches && (
                    <p className="text-xs text-brand-red">{errors.branches}</p>
                  )}
                </div>
              )}
            </Card>

            {/* Permisos */}
            <RoleEditorPermissions
              permissions={form.permissions}
              onToggle={handleTogglePermission}
              onToggleModule={handleToggleModule}
              onToggleAll={handleToggleAll}
              allSelected={allSelected}
            />
          </div>

          {/* Panel lateral */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-20">
              <RoleEditorSummary
                permissions={form.permissions}
                scope={form.scope}
                branches={form.branches}
              />
            </div>
          </aside>
        </div>
      </div>

      <Toast
        open={!!toast}
        variant={toast?.title?.includes('Error') ? 'error' : 'success'}
        title={toast?.title}
        description={toast?.description}
        onClose={() => setToast(null)}
      />
    </DashboardLayout>
  )
}