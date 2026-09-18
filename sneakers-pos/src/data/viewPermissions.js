// src/data/viewPermissions.js

/**
 * Mapa: clave de vista → permiso requerido.
 * Si una vista no aparece aquí, se asume que es pública.
 */
export const VIEW_PERMISSIONS = {
  // Principal
  dashboard:              'dashboard.view',
  profile:                'profile.view',
  pos:                    'pos.access',
  'sales-history':        'sales.view',
  'sale-detail':          'sales.view_detail',

  // Catálogo
  products:               'products.view',
  'product-new':          'products.create',
  'product-edit':         'products.edit',
  'product-detail':       'products.view',

  // Inventario
  inventory:              'inventory.view',
  'inventory-movements':  'inventory.movements',
  'inventory-adjust':     'inventory.adjust',
  'inventory-alerts':     'inventory.view',

  // Compras
  purchases:              'purchases.view',

  // Caja
  'cash-open':            'cash.open',
  'cash-current':         'cash.view',
  'cash-close':           'cash.close',
  'cash-history':         'cash.history',

  // Operación
  customers:              'customers.view',
  wholesale:              'wholesale.view',
  'wholesale-new':        'wholesale.create',
  'wholesale-edit':       'wholesale.edit',

  // ⭐ NUEVO: Créditos
  credits:                'credits.view',

  // Administración
  users:                  'users.view',
  'user-new':             'users.create',
  'user-edit':            'users.edit',
  'user-activity':        'users.view',
  'user-sessions':        'users.view',
  roles:                  'roles.view',
  'role-new':             'roles.create',
  'role-edit':            'roles.edit',
  reports:                'reports.view',
  'report-detail':        'reports.view',
  audit:                  'audit.view',

  // Sistema
  settings:               'settings.view',
  support:                'support.view',
}

/**
 * Permisos con los que un rol tiene acceso total.
 * Escape para administradores.
 */
export const SUPER_PERMISSION = 'settings.system'

/**
 * Vistas que nunca requieren permiso.
 */
export const PUBLIC_VIEWS = new Set([
  'profile',
])

/**
 * Orden de fallback cuando el usuario intenta entrar a una vista
 * que no existe o no tiene permiso. Se elige la primera que SÍ pueda ver.
 */
export const FALLBACK_VIEW_ORDER = [
  'profile',
  'pos',
  'cash-current',
  'sales-history',
  'credits',
  'dashboard',
  'products',
  'inventory',
  'support',           // ⭐ NUEVO
]