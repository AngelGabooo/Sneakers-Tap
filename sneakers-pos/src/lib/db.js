// src/lib/db.js
import { openDB } from 'idb'

/**
 * Base de datos local (IndexedDB) para modo offline-first.
 *
 * Estrategia:
 *   - TODOS los datos que vienen de Supabase se cachean aquí
 *   - TODAS las operaciones de escritura se guardan aquí primero
 *   - Un motor de sync envía la cola a Supabase cuando hay internet
 *
 * Versión: incrementar en 1 cuando cambie el schema (índices/stores)
 */

const DB_NAME = 'sneakers-db'
const DB_VERSION = 3   // ★ v3: agrega stores customer_credits + credit_payments

// Nombres de stores (tablas locales)
export const STORES = {
  PROFILES:           'profiles',
  ROLES:              'roles',
  BRANCHES:           'branches',
  PRODUCTS:           'products',
  PRODUCT_VARIANTS:   'product_variants',
  INVENTORY_MOVES:    'inventory_movements',
  SALES:              'sales',
  SALE_ITEMS:         'sale_items',
  CASH_SESSIONS:      'cash_sessions',
  CASH_MOVEMENTS:     'cash_movements',
  WHOLESALE:          'wholesale_customers',
  SETTINGS:           'settings',
  AUDIT_LOG:          'audit_log',
  SYNC_QUEUE:         'sync_queue',
  ID_MAPPINGS:        'id_mappings',        // ★ v2
  CUSTOMER_CREDITS:   'customer_credits',   // ★ v3
  CREDIT_PAYMENTS:    'credit_payments',    // ★ v3
}

/**
 * Abre (o crea) la base de datos.
 */
export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db, oldVersion) {
    console.log(`🗄️  IndexedDB: migrando de v${oldVersion} a v${DB_VERSION}`)

    // ---------------------------------------------------------
    // Perfiles, roles, branches
    // ---------------------------------------------------------
    if (!db.objectStoreNames.contains(STORES.PROFILES)) {
      const s = db.createObjectStore(STORES.PROFILES, { keyPath: 'id' })
      s.createIndex('email', 'email', { unique: false })
      s.createIndex('status', 'status', { unique: false })
      s.createIndex('role_id', 'role_id', { unique: false })
    }

    if (!db.objectStoreNames.contains(STORES.ROLES)) {
      db.createObjectStore(STORES.ROLES, { keyPath: 'id' })
    }

    if (!db.objectStoreNames.contains(STORES.BRANCHES)) {
      const s = db.createObjectStore(STORES.BRANCHES, { keyPath: 'id' })
      s.createIndex('code', 'code', { unique: false })
    }

    // ---------------------------------------------------------
    // Catálogo
    // ---------------------------------------------------------
    if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
      const s = db.createObjectStore(STORES.PRODUCTS, { keyPath: 'id' })
      s.createIndex('sku', 'sku', { unique: false })
      s.createIndex('barcode', 'barcode', { unique: false })
      s.createIndex('category', 'category', { unique: false })
      s.createIndex('status', 'status', { unique: false })
    }

    if (!db.objectStoreNames.contains(STORES.PRODUCT_VARIANTS)) {
      const s = db.createObjectStore(STORES.PRODUCT_VARIANTS, { keyPath: 'id' })
      s.createIndex('product_id', 'product_id', { unique: false })
      s.createIndex('sku', 'sku', { unique: false })
      s.createIndex('barcode', 'barcode', { unique: false })
    }

    // ---------------------------------------------------------
    // Inventario
    // ---------------------------------------------------------
    if (!db.objectStoreNames.contains(STORES.INVENTORY_MOVES)) {
      const s = db.createObjectStore(STORES.INVENTORY_MOVES, { keyPath: 'id' })
      s.createIndex('product_id', 'product_id', { unique: false })
      s.createIndex('created_at', 'created_at', { unique: false })
      s.createIndex('sync_status', 'sync_status', { unique: false })
    }

    // ---------------------------------------------------------
    // Ventas
    // ---------------------------------------------------------
    if (!db.objectStoreNames.contains(STORES.SALES)) {
      const s = db.createObjectStore(STORES.SALES, { keyPath: 'id' })
      s.createIndex('folio', 'folio', { unique: false })
      s.createIndex('created_at', 'created_at', { unique: false })
      s.createIndex('status', 'status', { unique: false })
      s.createIndex('cash_session_id', 'cash_session_id', { unique: false })
      s.createIndex('sync_status', 'sync_status', { unique: false })
    }

    if (!db.objectStoreNames.contains(STORES.SALE_ITEMS)) {
      const s = db.createObjectStore(STORES.SALE_ITEMS, { keyPath: 'id' })
      s.createIndex('sale_id', 'sale_id', { unique: false })
      s.createIndex('product_id', 'product_id', { unique: false })
    }

    // ---------------------------------------------------------
    // Caja
    // ---------------------------------------------------------
    if (!db.objectStoreNames.contains(STORES.CASH_SESSIONS)) {
      const s = db.createObjectStore(STORES.CASH_SESSIONS, { keyPath: 'id' })
      s.createIndex('status', 'status', { unique: false })
      s.createIndex('opened_at', 'opened_at', { unique: false })
      s.createIndex('sync_status', 'sync_status', { unique: false })
    }

    if (!db.objectStoreNames.contains(STORES.CASH_MOVEMENTS)) {
      const s = db.createObjectStore(STORES.CASH_MOVEMENTS, { keyPath: 'id' })
      s.createIndex('session_id', 'session_id', { unique: false })
      s.createIndex('created_at', 'created_at', { unique: false })
      s.createIndex('sync_status', 'sync_status', { unique: false })
    }

    // ---------------------------------------------------------
    // Mayoreo
    // ---------------------------------------------------------
    if (!db.objectStoreNames.contains(STORES.WHOLESALE)) {
      const s = db.createObjectStore(STORES.WHOLESALE, { keyPath: 'id' })
      s.createIndex('name', 'name', { unique: false })
      s.createIndex('status', 'status', { unique: false })
    }

    // ---------------------------------------------------------
    // Settings + Audit
    // ---------------------------------------------------------
    if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
      db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' })
    }

    if (!db.objectStoreNames.contains(STORES.AUDIT_LOG)) {
      const s = db.createObjectStore(STORES.AUDIT_LOG, { keyPath: 'id' })
      s.createIndex('created_at', 'created_at', { unique: false })
      s.createIndex('user_id', 'user_id', { unique: false })
    }

    // ---------------------------------------------------------
    // Cola de sincronización
    // ---------------------------------------------------------
    if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
      const s = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' })
      s.createIndex('status', 'status', { unique: false })
      s.createIndex('entity', 'entity', { unique: false })
      s.createIndex('created_at', 'created_at', { unique: false })
      s.createIndex('next_retry_at', 'next_retry_at', { unique: false })
    }

    // ---------------------------------------------------------
    // ★ v2: id_mappings
    // ---------------------------------------------------------
    if (!db.objectStoreNames.contains(STORES.ID_MAPPINGS)) {
      const s = db.createObjectStore(STORES.ID_MAPPINGS, { keyPath: 'local_id' })
      s.createIndex('server_id', 'server_id', { unique: false })
      s.createIndex('mapped_at', 'mapped_at', { unique: false })
    }

    // ---------------------------------------------------------
    // ★ NUEVO en v3: customer_credits
    // ---------------------------------------------------------
    if (!db.objectStoreNames.contains(STORES.CUSTOMER_CREDITS)) {
      const s = db.createObjectStore(STORES.CUSTOMER_CREDITS, { keyPath: 'id' })
      s.createIndex('customer_id', 'customer_id', { unique: false })
      s.createIndex('status', 'status', { unique: false })
      s.createIndex('due_date', 'due_date', { unique: false })
      s.createIndex('sync_status', 'sync_status', { unique: false })
    }

    // ---------------------------------------------------------
    // ★ NUEVO en v3: credit_payments
    // ---------------------------------------------------------
    if (!db.objectStoreNames.contains(STORES.CREDIT_PAYMENTS)) {
      const s = db.createObjectStore(STORES.CREDIT_PAYMENTS, { keyPath: 'id' })
      s.createIndex('credit_id', 'credit_id', { unique: false })
      s.createIndex('customer_id', 'customer_id', { unique: false })
      s.createIndex('paid_at', 'paid_at', { unique: false })
      s.createIndex('sync_status', 'sync_status', { unique: false })
    }

    console.log('✅ IndexedDB lista')
  },

  blocked() {
    console.warn('⚠️  IndexedDB bloqueada por otra pestaña')
  },

  blocking() {
    console.warn('⚠️  Esta pestaña bloquea una versión más nueva')
  },

  terminated() {
    console.error('❌ IndexedDB terminada inesperadamente')
  },
})