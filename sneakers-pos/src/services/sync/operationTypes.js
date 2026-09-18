// src/services/sync/operationTypes.js

export const OP = {
  // Ventas
  CREATE_SALE:      'CREATE_SALE',
  UPDATE_SALE:      'UPDATE_SALE',
  CANCEL_SALE:      'CANCEL_SALE',

  // Caja
  OPEN_CASH:        'OPEN_CASH',
  CLOSE_CASH:       'CLOSE_CASH',
  ADD_CASH_MOVE:    'ADD_CASH_MOVE',

  // Productos
  CREATE_PRODUCT:   'CREATE_PRODUCT',
  UPDATE_PRODUCT:   'UPDATE_PRODUCT',
  DELETE_PRODUCT:   'DELETE_PRODUCT',

  // Inventario
  ADJUST_STOCK:     'ADJUST_STOCK',
  MOVE_STOCK:       'MOVE_STOCK',

  // Clientes / Mayoristas
  CREATE_CUSTOMER:  'CREATE_CUSTOMER',
  UPDATE_CUSTOMER:  'UPDATE_CUSTOMER',

  // Usuarios / Roles
  UPDATE_PROFILE:   'UPDATE_PROFILE',
  CREATE_USER:      'CREATE_USER',
  UPDATE_SETTINGS:  'UPDATE_SETTINGS',

  CREATE_AUDIT_LOG: 'CREATE_AUDIT_LOG',

  // ⭐ NUEVOS: Créditos
  CREATE_CREDIT:         'CREATE_CREDIT',         // Otorgar crédito
  UPDATE_CREDIT:         'UPDATE_CREDIT',         // Actualizar estado/monto
  CREATE_CREDIT_PAYMENT: 'CREATE_CREDIT_PAYMENT', // Registrar pago
  CREATE_CREDIT_CHARGE:   'CREATE_CREDIT_CHARGE',   // ⭐ NUEVO

}

export const STATUS = {
  PENDING:   'pending',
  SYNCING:   'syncing',
  SYNCED:    'synced',
  FAILED:    'failed',
  CONFLICT:  'conflict',
}

export const PRIORITY = {
  LOW:     1,
  NORMAL:  5,
  HIGH:    10,
  URGENT:  20,
}