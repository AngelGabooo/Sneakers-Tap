// src/services/sync/operationTypes.js

/**
 * Tipos de operaciones que se pueden encolar para sincronizar.
 */

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
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',

  CREATE_AUDIT_LOG: 'CREATE_AUDIT_LOG',
}

/**
 * Estados de una operación en la cola.
 */
export const STATUS = {
  PENDING:   'pending',    // Aún no se intentó sincronizar
  SYNCING:   'syncing',    // En proceso
  SYNCED:    'synced',     // Sincronizada con éxito (se puede borrar)
  FAILED:    'failed',     // Falló, esperando reintento
  CONFLICT:  'conflict',   // Conflicto detectado, requiere atención
}

/**
 * Prioridades (mayor número = se procesa antes).
 */
export const PRIORITY = {
  LOW:     1,
  NORMAL:  5,
  HIGH:    10,
  URGENT:  20,
}