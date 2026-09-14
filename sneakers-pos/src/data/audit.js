// src/data/audit.js

export const PERIOD_OPTIONS = [
  { value: 'today',      label: 'Hoy' },
  { value: 'yesterday',  label: 'Ayer' },
  { value: 'last7',      label: 'Últimos 7 días' },
  { value: 'last30',     label: 'Últimos 30 días' },
  { value: 'thisMonth',  label: 'Este mes' },
  { value: 'lastMonth',  label: 'Mes anterior' },
  { value: 'thisQuarter',label: 'Este trimestre' },
  { value: 'thisYear',   label: 'Este año' },
  { value: 'custom',     label: 'Personalizado' },
]

export const MODULES = [
  { value: 'auth',          label: 'Autenticación' },
  { value: 'users',         label: 'Usuarios' },
  { value: 'roles',         label: 'Roles' },
  { value: 'products',      label: 'Productos' },
  { value: 'inventory',     label: 'Inventario' },
  { value: 'sales',         label: 'Ventas' },
  { value: 'cash',          label: 'Caja' },
  { value: 'purchases',     label: 'Compras' },
  { value: 'customers',     label: 'Clientes' },
  { value: 'wholesale',     label: 'Mayoreo' },
  { value: 'reports',       label: 'Reportes' },
  { value: 'settings',      label: 'Configuración' },
]

export const ACTION_TYPES = [
  { value: 'create',        label: 'Crear' },
  { value: 'read',          label: 'Consultar' },
  { value: 'update',        label: 'Editar' },
  { value: 'activate',      label: 'Activar' },
  { value: 'deactivate',    label: 'Desactivar' },
  { value: 'suspend',       label: 'Suspender' },
  { value: 'block',         label: 'Bloquear' },
  { value: 'soft_delete',   label: 'Eliminar lógico' },
  { value: 'export',        label: 'Exportar' },
  { value: 'authorize',     label: 'Autorizar' },
  { value: 'login',         label: 'Iniciar sesión' },
  { value: 'logout',        label: 'Cerrar sesión' },
  { value: 'permissions',   label: 'Cambio de permisos' },
  { value: 'settings',      label: 'Cambio de configuración' },
]

export const RESULTS = [
  { value: 'success', label: 'Exitoso' },
  { value: 'rejected',label: 'Rechazado' },
  { value: 'error',   label: 'Error' },
]

export const LEVELS = [
  { value: 'info',     label: 'Información' },
  { value: 'important',label: 'Importante' },
  { value: 'critical', label: 'Crítico' },
  { value: 'security', label: 'Seguridad' },
]

export const ENTITIES = [
  { value: 'sale',        label: 'Venta' },
  { value: 'product',     label: 'Producto' },
  { value: 'variant',     label: 'Variante' },
  { value: 'inventory',   label: 'Inventario' },
  { value: 'cash',        label: 'Caja' },
  { value: 'purchase',    label: 'Compra' },
  { value: 'customer',    label: 'Cliente' },
  { value: 'user',        label: 'Usuario' },
  { value: 'role',        label: 'Rol' },
  { value: 'settings',    label: 'Configuración' },
  { value: 'report',      label: 'Reporte' },
]

export const BRANCHES = [
  { value: 'all',     label: 'Todas las permitidas' },
  { value: 'main',    label: 'Tienda principal' },
  { value: 'centro',  label: 'Sucursal Centro' },
]

export const ACTION_LABELS = {
  create: 'Creó', read: 'Consultó', update: 'Editó',
  activate: 'Activó', deactivate: 'Desactivó', suspend: 'Suspendió',
  block: 'Bloqueó', soft_delete: 'Eliminó', export: 'Exportó',
  authorize: 'Autorizó', login: 'Inició sesión', logout: 'Cerró sesión',
  permissions: 'Actualizó permisos', settings: 'Cambió configuración',
  adjust: 'Ajustó', register: 'Registró', cancel: 'Canceló', refund: 'Devolvió',
}

export const MODULE_LABELS = Object.fromEntries(MODULES.map((m) => [m.value, m.label]))
export const ENTITY_LABELS = Object.fromEntries(ENTITIES.map((e) => [e.value, e.label]))

export function getActionLabel(action) {
  return ACTION_LABELS[action] || action
}

export function getModuleLabel(module) {
  return MODULE_LABELS[module] || module
}

export function getEntityLabel(entity) {
  return ENTITY_LABELS[entity] || entity
}

export function getLevelMeta(level) {
  const map = {
    info:      { label: 'Información', variant: 'neutral',  icon: 'info' },
    important: { label: 'Importante',  variant: 'info',     icon: 'info' },
    critical:  { label: 'Crítico',     variant: 'danger',   icon: 'alert' },
    security:  { label: 'Seguridad',   variant: 'warning',  icon: 'shield' },
  }
  return map[level] || map.info
}

export function getResultMeta(result) {
  const map = {
    success:  { label: 'Exitoso',   variant: 'success' },
    rejected: { label: 'Rechazado', variant: 'danger'  },
    error:    { label: 'Error',     variant: 'danger'  },
  }
  return map[result] || map.success
}