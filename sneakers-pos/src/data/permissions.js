/**
 * Catálogo central de módulos, acciones y permisos.
 * Marcamos con `critical: true` los permisos sensibles.
 */

export const ACTIONS = ['view', 'create', 'edit', 'delete', 'export', 'manage']

export const ACTION_LABELS = {
  view:    'Ver',
  create:  'Crear',
  edit:    'Editar',
  delete:  'Eliminar',
  export:  'Exportar',
  manage:  'Administrar',
}

export const MODULES = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    permissions: [
      { key: 'dashboard.view',    label: 'Ver dashboard' },
      { key: 'dashboard.metrics', label: 'Ver métricas' },
    ],
  },
  {
    key: 'pos',
    label: 'Punto de venta',
    permissions: [
      { key: 'pos.access',              label: 'Acceder al POS' },
      { key: 'pos.create_sale',         label: 'Crear venta' },
      { key: 'pos.modify_cart',         label: 'Modificar carrito' },
      { key: 'pos.apply_discount',      label: 'Aplicar descuento' },
      { key: 'pos.apply_over_discount', label: 'Aplicar descuento superior al límite', critical: true },
      { key: 'pos.change_price',        label: 'Cambiar precio', critical: true },
      { key: 'pos.suspend_sale',        label: 'Suspender venta' },
      { key: 'pos.resume_sale',         label: 'Recuperar venta suspendida' },
      { key: 'pos.cancel_sale',         label: 'Cancelar venta', critical: true },
      { key: 'pos.register_payment',    label: 'Registrar pago' },
      { key: 'pos.request_invoice',     label: 'Solicitar factura' },
      { key: 'pos.reprint',             label: 'Reimprimir comprobante' },
    ],
  },
  {
    key: 'sales',
    label: 'Ventas',
    permissions: [
      { key: 'sales.view',              label: 'Ver ventas' },
      { key: 'sales.view_detail',       label: 'Ver detalle de venta' },
      { key: 'sales.export',            label: 'Exportar ventas' },
      { key: 'sales.cancel',            label: 'Cancelar venta', critical: true },
      { key: 'sales.refund',            label: 'Procesar devolución' },
      { key: 'sales.authorize_refund',  label: 'Autorizar devolución', critical: true },
      { key: 'sales.view_financial',    label: 'Consultar información financiera' },
    ],
  },
  {
    key: 'products',
    label: 'Productos',
    permissions: [
      { key: 'products.view',           label: 'Ver productos' },
      { key: 'products.create',         label: 'Crear producto' },
      { key: 'products.edit',           label: 'Editar producto' },
      { key: 'products.deactivate',     label: 'Desactivar producto' },
      { key: 'products.delete',         label: 'Eliminar producto', critical: true },
      { key: 'products.manage_categories', label: 'Gestionar categorías' },
      { key: 'products.manage_brands',  label: 'Gestionar marcas' },
      { key: 'products.manage_attrs',   label: 'Gestionar atributos' },
      { key: 'products.export',         label: 'Exportar productos' },
      { key: 'products.import',         label: 'Importar productos' },
    ],
  },
  {
    key: 'inventory',
    label: 'Inventario',
    permissions: [
      { key: 'inventory.view',          label: 'Ver inventario' },
      { key: 'inventory.cash_in',       label: 'Registrar entrada' },
      { key: 'inventory.cash_out',      label: 'Registrar salida' },
      { key: 'inventory.adjust',        label: 'Ajustar inventario' },
      { key: 'inventory.movements',     label: 'Ver movimientos' },
      { key: 'inventory.export',        label: 'Exportar inventario' },
      { key: 'inventory.import',        label: 'Importar inventario' },
      { key: 'inventory.config_min',    label: 'Configurar stock mínimo' },
      { key: 'inventory.manage_alerts', label: 'Gestionar alertas' },
      { key: 'inventory.shrinkage',     label: 'Registrar merma', critical: true },
      { key: 'inventory.damage',        label: 'Registrar daño', critical: true },
      { key: 'inventory.transfer',      label: 'Transferir inventario' },
    ],
  },
  {
    key: 'purchases',
    label: 'Compras',
    permissions: [
      { key: 'purchases.view',          label: 'Ver compras' },
      { key: 'purchases.create',        label: 'Crear compra' },
      { key: 'purchases.edit',          label: 'Editar compra' },
      { key: 'purchases.cancel',        label: 'Cancelar compra', critical: true },
      { key: 'purchases.receive',       label: 'Registrar recepción' },
      { key: 'purchases.view_suppliers', label: 'Ver proveedores' },
      { key: 'purchases.create_supplier', label: 'Crear proveedor' },
      { key: 'purchases.edit_supplier', label: 'Editar proveedor' },
      { key: 'purchases.export',        label: 'Exportar compras' },
    ],
  },
  {
    key: 'cash',
    label: 'Caja',
    permissions: [
      { key: 'cash.view',               label: 'Ver caja actual' },
      { key: 'cash.open',               label: 'Abrir caja' },
      { key: 'cash.cash_in',            label: 'Registrar entrada' },
      { key: 'cash.cash_out',           label: 'Registrar retiro', critical: true },
      { key: 'cash.count',              label: 'Realizar conteo' },
      { key: 'cash.close',              label: 'Cerrar caja', critical: true },
      { key: 'cash.authorize_diff',     label: 'Autorizar diferencia', critical: true },
      { key: 'cash.history',            label: 'Ver historial de cajas' },
      { key: 'cash.export',             label: 'Exportar cierres' },
    ],
  },
  {
    key: 'customers',
    label: 'Clientes',
    permissions: [
      { key: 'customers.view',          label: 'Ver clientes' },
      { key: 'customers.create',        label: 'Crear cliente' },
      { key: 'customers.edit',          label: 'Editar cliente' },
      { key: 'customers.deactivate',    label: 'Desactivar cliente' },
      { key: 'customers.export',        label: 'Exportar clientes' },
      { key: 'customers.history',       label: 'Ver historial de compras' },
    ],
  },
  {
    key: 'wholesale',
    label: 'Mayoreo',
    permissions: [
      { key: 'wholesale.view',          label: 'Ver clientes mayoristas' },
      { key: 'wholesale.create',        label: 'Crear mayorista' },
      { key: 'wholesale.edit',          label: 'Editar mayorista' },
      { key: 'wholesale.conditions',    label: 'Configurar condiciones comerciales' },
      { key: 'wholesale.discounts',     label: 'Configurar descuentos' },
      { key: 'wholesale.credit',        label: 'Configurar crédito', critical: true },
      { key: 'wholesale.authorize_over_credit', label: 'Autorizar exceso de crédito', critical: true },
      { key: 'wholesale.account',       label: 'Ver cuenta' },
      { key: 'wholesale.export',        label: 'Exportar mayoristas' },
    ],
  },
  {
    key: 'reports',
    label: 'Reportes',
    permissions: [
      { key: 'reports.view',            label: 'Ver reportes' },
      { key: 'reports.export',          label: 'Exportar reportes' },
      { key: 'reports.financial',       label: 'Ver reportes financieros' },
      { key: 'reports.sales',           label: 'Ver reportes de ventas' },
      { key: 'reports.inventory',       label: 'Ver reportes de inventario' },
      { key: 'reports.cash',            label: 'Ver reportes de caja' },
      { key: 'reports.customers',       label: 'Ver reportes de clientes' },
      { key: 'reports.wholesale',       label: 'Ver reportes de mayoreo' },
    ],
  },
  {
    key: 'users',
    label: 'Usuarios',
    permissions: [
      { key: 'users.view',              label: 'Ver usuarios' },
      { key: 'users.create',            label: 'Crear usuario' },
      { key: 'users.edit',              label: 'Editar usuario' },
      { key: 'users.activate',          label: 'Activar usuario' },
      { key: 'users.deactivate',        label: 'Desactivar usuario' },
      { key: 'users.suspend',           label: 'Suspender usuario', critical: true },
      { key: 'users.block',             label: 'Bloquear usuario', critical: true },
      { key: 'users.reset_access',      label: 'Restablecer acceso' },
      { key: 'users.invitations',       label: 'Gestionar invitaciones' },
      { key: 'users.change_role',       label: 'Cambiar roles', critical: true },
    ],
  },
  {
    key: 'roles',
    label: 'Roles y permisos',
    permissions: [
      { key: 'roles.view',              label: 'Ver roles' },
      { key: 'roles.create',            label: 'Crear rol' },
      { key: 'roles.edit',              label: 'Editar rol' },
      { key: 'roles.duplicate',         label: 'Duplicar rol' },
      { key: 'roles.toggle',            label: 'Activar/desactivar rol' },
      { key: 'roles.assign_perms',      label: 'Asignar permisos' },
      { key: 'roles.modify_critical',   label: 'Modificar permisos críticos', critical: true },
    ],
  },
  {
    key: 'audit',
    label: 'Auditoría',
    permissions: [
      { key: 'audit.view',              label: 'Ver auditoría' },
      { key: 'audit.export',            label: 'Exportar auditoría' },
      { key: 'audit.admin_changes',     label: 'Consultar cambios administrativos' },
    ],
  },
  {
    key: 'settings',
    label: 'Configuración',
    permissions: [
      { key: 'settings.view',           label: 'Ver configuración' },
      { key: 'settings.edit',           label: 'Editar configuración', critical: true },
      { key: 'settings.branches',       label: 'Configurar sucursales' },
      { key: 'settings.taxes',          label: 'Configurar impuestos' },
      { key: 'settings.payments',       label: 'Configurar métodos de pago' },
      { key: 'settings.system',         label: 'Configurar parámetros del sistema', critical: true },
    ],
  },
]

export const ALL_PERMISSIONS = MODULES.flatMap((m) =>
  m.permissions.map((p) => p.key),
)

export const TOTAL_PERMISSIONS = ALL_PERMISSIONS.length

export const CRITICAL_PERMISSIONS = MODULES.flatMap((m) =>
  m.permissions.filter((p) => p.critical).map((p) => p.key),
)

export function getPermissionLabel(key) {
  for (const mod of MODULES) {
    const perm = mod.permissions.find((p) => p.key === key)
    if (perm) return perm.label
  }
  return key
}

export function isCritical(key) {
  return CRITICAL_PERMISSIONS.includes(key)
}

export function countPermissions(permSet = []) {
  return permSet.length
}

/**
 * Retorna el resumen de permisos por módulo.
 */
export function summarizeByModule(permSet = []) {
  const set = new Set(permSet)
  return MODULES.map((m) => ({
    key: m.key,
    label: m.label,
    enabled: m.permissions.filter((p) => set.has(p.key)).length,
    total: m.permissions.length,
  }))
}