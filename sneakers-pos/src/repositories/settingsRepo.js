// src/repositories/settingsRepo.js
import { dbPromise, STORES } from '../lib/db'
import { settingsService } from '../services/settingsService'
import { syncQueue } from '../services/sync/syncQueue'
import { OP, PRIORITY } from '../services/sync/operationTypes'

/**
 * Repositorio offline-first de configuración.
 *
 * - LECTURA: IndexedDB primero, Supabase en background
 * - ESCRITURA: IndexedDB + cola de sync
 */

const SETTINGS_KEY = 'global'   // Clave única en IndexedDB (es singleton)

// =====================================================================
// HELPERS INTERNOS
// =====================================================================

function mapFromSupabase(row) {
  if (!row) return null
  return {
    store: row.store || {},
    ticket: row.ticket || {},
    sales: row.sales || {},
    taxes: row.taxes || {},
    preferences: row.preferences || {},
    branches: row.branches || [],
    updatedAt: row.updated_at,
  }
}

// =====================================================================
// API PÚBLICA
// =====================================================================

export const settingsRepo = {
  /**
   * Lee la config de IndexedDB.
   */
  async getLocal() {
    try {
      const db = await dbPromise
      const record = await db.get(STORES.SETTINGS, SETTINGS_KEY)
      if (!record) return null
      return {
        store: record.store || {},
        ticket: record.ticket || {},
        sales: record.sales || {},
        taxes: record.taxes || {},
        preferences: record.preferences || {},
        branches: record.branches || [],
        updatedAt: record.updatedAt,
      }
    } catch (err) {
      console.error('❌ Error leyendo settings local:', err)
      return null
    }
  },

  /**
   * Sincroniza la config desde Supabase → IndexedDB.
   */
  async syncFromSupabase() {
    try {
      console.log('🔄 Sincronizando configuración desde Supabase...')
      const remote = await settingsService.get()

      if (!remote) {
        console.log('ℹ️  No hay configuración en Supabase todavía')
        return null
      }

      const mapped = mapFromSupabase(remote)

      // Guardar en IndexedDB
      const db = await dbPromise
      await db.put(STORES.SETTINGS, {
        key: SETTINGS_KEY,
        ...mapped,
      })

      console.log('✅ Configuración sincronizada')
      return mapped
    } catch (err) {
      console.error('❌ Error sincronizando configuración:', err)
      throw err
    }
  },

  /**
   * Guarda la config local + encola sync.
   */
  async save(settings) {
    const now = new Date().toISOString()

    const record = {
      key: SETTINGS_KEY,
      store: settings.store || {},
      ticket: settings.ticket || {},
      sales: settings.sales || {},
      taxes: settings.taxes || {},
      preferences: settings.preferences || {},
      branches: settings.branches || [],
      updatedAt: now,
      syncStatus: 'pending',
    }

    // 1. Guardar en IndexedDB
    const db = await dbPromise
    await db.put(STORES.SETTINGS, record)

    // 2. Encolar para sync
    await syncQueue.add({
      type: OP.UPDATE_SETTINGS,
      entity: 'settings',
      payload: {
        settings: {
          store: record.store,
          ticket: record.ticket,
          sales: record.sales,
          taxes: record.taxes,
          preferences: record.preferences,
          branches: record.branches,
        },
      },
      priority: PRIORITY.HIGH,
    })

    console.log('💾 Configuración guardada localmente')
    return record
  },
}