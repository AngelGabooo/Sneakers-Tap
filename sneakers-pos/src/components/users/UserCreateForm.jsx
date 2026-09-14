import { useState } from 'react'
import {
  User, Phone, Mail, Lock, Eye, EyeOff, Wand2,
  ShieldAlert, ShieldCheck, KeyRound, UserPlus, Building2,
} from 'lucide-react'
import Card from '../common/Card'
import TextField from '../common/TextField'
import Button from '../common/Button'
import UserPasswordStrength from './UserPasswordStrength'

const ROLES = [
  { value: 'Administrador', label: 'Administrador' },
  { value: 'Gerente',       label: 'Gerente' },
  { value: 'Vendedor',      label: 'Vendedor' },
  { value: 'Almacén',       label: 'Almacén' },
  { value: 'Contabilidad',  label: 'Contabilidad' },
]

const BRANCHES = [
  { value: 'Tienda principal', label: 'Tienda principal' },
  { value: 'Sucursal Centro',  label: 'Sucursal Centro' },
]

/**
 * Genera una contraseña segura de 12 caracteres.
 */
function generateSecurePassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnopqrstuvwxyz'
  const digits = '23456789'
  const symbols = '!@#$%&*?'
  const all = upper + lower + digits + symbols

  const pick = (set) => set[Math.floor(Math.random() * set.length)]
  const base = [pick(upper), pick(lower), pick(digits), pick(symbols)]
  while (base.length < 12) base.push(pick(all))
  return base.sort(() => Math.random() - 0.5).join('')
}

export default function UserCreateForm({
  form,
  errors = {},
  onChange,
  onSubmit,
  submitting = false,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleGenerate = () => {
    const pwd = generateSecurePassword()
    onChange('password', pwd)
    onChange('confirmPassword', pwd)
    setShowPassword(true)
    setShowConfirm(true)
  }

  return (
<div className="space-y-5">

      {/* ================================================================ */}
      {/* Datos del empleado                                                */}
      {/* ================================================================ */}
      <Card>
        <header className="flex items-start gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
            <User size={17} className="text-brand-blue" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-brand-black dark:text-dark-text">
              Datos del empleado
            </h2>
            <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
              Información básica para identificar al empleado.
            </p>
          </div>
        </header>

        <div className="space-y-4">
          <TextField
            id="fullName"
            label="Nombre completo"
            value={form.fullName}
            onChange={(e) => onChange('fullName', e.target.value)}
            placeholder="Ej. Carlos Martínez"
            required
            icon={User}
            error={errors.fullName}
            autoComplete="name"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              id="phone"
              label="Número de celular"
              value={form.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="Ej. 55 1234 5678"
              icon={Phone}
              type="tel"
              error={errors.phone}
              autoComplete="tel"
            />
            <TextField
              id="email"
              label="Correo de acceso"
              value={form.email}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="empleado@sneakers.mx"
              required
              icon={Mail}
              type="email"
              error={errors.email}
              autoComplete="email"
              hint="Será el usuario con el que iniciará sesión."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
                Rol
              </label>
              <select
                id="role"
                value={form.role}
                onChange={(e) => onChange('role', e.target.value)}
                className="
                  w-full h-11 px-3 rounded-lg text-sm
                  bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                  border border-gray-200 dark:border-dark-border
                  focus:border-brand-blue focus:ring-2 focus:ring-blue-100
                  dark:focus:ring-blue-900/40 outline-none cursor-pointer
                "
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
                Sucursal
              </label>
              <select
                id="branch"
                value={form.branch}
                onChange={(e) => onChange('branch', e.target.value)}
                className="
                  w-full h-11 px-3 rounded-lg text-sm
                  bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                  border border-gray-200 dark:border-dark-border
                  focus:border-brand-blue focus:ring-2 focus:ring-blue-100
                  dark:focus:ring-blue-900/40 outline-none cursor-pointer
                "
              >
                {BRANCHES.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* ================================================================ */}
      {/* Credenciales de acceso                                            */}
      {/* ================================================================ */}
      <Card>
        <header className="flex items-start gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
            <KeyRound size={17} className="text-brand-blue" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-brand-black dark:text-dark-text">
              Credenciales de acceso
            </h2>
            <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
              Contraseña inicial que usará el empleado para ingresar.
            </p>
          </div>
        </header>

        <div className="space-y-4">
          {/* Contraseña */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="text-sm font-medium text-brand-black dark:text-dark-text">
                Contraseña <span className="text-brand-red">*</span>
              </label>
              <button
                type="button"
                onClick={handleGenerate}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
              >
                <Wand2 size={12} strokeWidth={2.2} />
                Generar segura
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <Lock size={17} strokeWidth={1.9} />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => onChange('password', e.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                className={`
                  w-full h-11 pl-10 pr-11 rounded-lg text-[15px]
                  bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
                  border transition-colors outline-none
                  placeholder:text-gray-400 dark:placeholder:text-dark-muted
                  ${errors.password
                    ? 'border-brand-red focus:border-brand-red focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/40'
                    : 'border-gray-200 dark:border-dark-border focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40'}
                `}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-brand-blue transition-colors"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={17} strokeWidth={1.9} /> : <Eye size={17} strokeWidth={1.9} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-brand-red">{errors.password}</p>
            )}
            <UserPasswordStrength password={form.password} />
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
              Confirmar contraseña <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <Lock size={17} strokeWidth={1.9} />
              </span>
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => onChange('confirmPassword', e.target.value)}
                placeholder="Repite la contraseña"
                autoComplete="new-password"
                className={`
                  w-full h-11 pl-10 pr-11 rounded-lg text-[15px]
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
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-brand-blue transition-colors"
                aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showConfirm ? <EyeOff size={17} strokeWidth={1.9} /> : <Eye size={17} strokeWidth={1.9} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs text-brand-red">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Aviso de seguridad */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
            <ShieldCheck size={15} className="text-brand-blue shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
              La contraseña se guarda <strong>cifrada</strong>. No se muestra nunca más después de crear la cuenta.
              El empleado podrá cambiarla al iniciar sesión por primera vez.
            </p>
          </div>
        </div>
      </Card>

      {/* ================================================================ */}
      {/* Estado de la cuenta                                              */}
      {/* ================================================================ */}
      <Card>
        <header className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
            <ShieldAlert size={17} className="text-brand-blue" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-brand-black dark:text-dark-text">
              Estado de la cuenta
            </h2>
            <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
              Controla si el empleado puede ingresar al sistema.
            </p>
          </div>
        </header>

        <div className="space-y-3">
          <label
            className={`
              flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors
              ${form.status === 'active'
                ? 'border-brand-blue bg-blue-50/60 dark:bg-blue-950/30 dark:border-blue-700'
                : 'border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-surface'}
            `}
          >
            <input
              type="radio"
              name="status"
              value="active"
              checked={form.status === 'active'}
              onChange={() => onChange('status', 'active')}
              className="mt-1 w-4 h-4 text-brand-blue border-gray-300 focus:ring-brand-blue"
            />
            <div>
              <p className="text-sm font-medium text-brand-black dark:text-dark-text">Activo</p>
              <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
                Puede iniciar sesión y operar según los permisos que se le asignen después.
              </p>
            </div>
          </label>

          <label
            className={`
              flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors
              ${form.status === 'suspended'
                ? 'border-brand-red bg-red-50/60 dark:bg-red-950/20 dark:border-red-800'
                : 'border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-surface'}
            `}
          >
            <input
              type="radio"
              name="status"
              value="suspended"
              checked={form.status === 'suspended'}
              onChange={() => onChange('status', 'suspended')}
              className="mt-1 w-4 h-4 text-brand-red border-gray-300 focus:ring-brand-red"
            />
            <div>
              <p className="text-sm font-medium text-brand-black dark:text-dark-text flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-brand-red" />
                Suspendido
              </p>
              <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
                No podrá iniciar sesión. Úsalo si la persona ya no trabaja en la tienda o debe quedar bloqueada temporalmente.
              </p>
            </div>
          </label>
        </div>

        {errors.status && (
          <p className="mt-2 text-xs text-brand-red">{errors.status}</p>
        )}
      </Card>

      {/* ================================================================ */}
      {/* Invitación (solo si activo)                                       */}
      {/* ================================================================ */}
      {form.status === 'active' && (
        <Card>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.sendInvite}
              onChange={(e) => onChange('sendInvite', e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
            />
            <div>
              <p className="text-sm font-medium text-brand-black dark:text-dark-text">
                Enviar invitación por correo al crear
              </p>
              <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
                El empleado recibirá un enlace para confirmar su cuenta. La contraseña que definiste arriba
                será la contraseña temporal hasta que la cambie.
              </p>
            </div>
          </label>
        </Card>
      )}

      {/* Nota de seguridad final */}
      <div className="rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface px-4 py-3">
        <p className="text-xs text-gray-600 dark:text-dark-muted leading-relaxed">
          <span className="font-medium text-brand-black dark:text-dark-text">Seguridad:</span>{' '}
          La cuenta puede suspenderse en cualquier momento desde el listado de usuarios.
          Al suspender, la persona deja de poder ingresar al sistema.
          El historial de operaciones asociado a este empleado se conserva intacto.
        </p>
      </div>

      {errors.form && (
        <p className="text-sm text-brand-red text-center">{errors.form}</p>
      )}

      {/* Acciones en móvil */}
      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
        <Button
          variant="secondary"
          onClick={() => window.history.back()}
          disabled={submitting}
          className="sm:hidden"
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          icon={UserPlus}
          onClick={onSubmit}
          loading={submitting}
          className="sm:hidden"
        >
          Crear empleado
        </Button>
      </div>
    </div>
  )
}