// src/services/sync/syncEngine.js
import { syncQueue } from './syncQueue'
import { runHandler } from './handlers'
import { STATUS, OP } from './operationTypes'
import { dbPromise, STORES } from '../../lib/db'

/**
 * Motor de sincronización.
 *
 * Flujo:
 *   1. Detecta que hay internet
 *   2. Lee operaciones pendientes de syncQueue
 *   3. Las procesa una por una con runHandler
 *   4. Marca exitosas / fallidas
 *   5. Emite eventos de progreso
 */

let isRunning = false
let listeners = new Set()

/**
 * Notifica a los suscriptores.
 */
function emit(event) {
  listeners.forEach((fn) => {
    try {
      fn(event)
    } catch (err) {
      console.error('Error en listener:', err)
    }
  })
}

/**
 * Suscribirse a eventos del motor.
 */
export function subscribe(callback) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

/**
 * Remapea el ID local de un registro de auditoría al ID real de Supabase.
 * Se llama cuando el handler devuelve `serverId` tras un CREATE_AUDIT_LOG.
 */
async function remapAuditId(localId, serverId) {
  try {
    const db = await dbPromise
    const local = await db.get(STORES.AUDIT_LOG, localId)
    if (!local) return

    if (local.id !== serverId) {
      // Borrar el registro con ID temporal
      await db.delete(STORES.AUDIT_LOG, local.id)
      // Guardar con el ID real de Supabase
      await db.put(STORES.AUDIT_LOG, {
        ...local,
        id: serverId,
        auditId: `AUD-${(local.entity || 'EVT').toUpperCase()}-${String(serverId).slice(-8).toUpperCase()}`,
        syncStatus: 'synced',
      })
    } else {
      await db.put(STORES.AUDIT_LOG, { ...local, syncStatus: 'synced' })
    }
  } catch (err) {
    console.warn('⚠️ No se pudo remapear el ID de auditoría:', err)
  }
}

/**
 * Procesa la cola una vez.
 * Retorna { processed, succeeded, failed }.
 */
export async function processQueue() {
  if (isRunning) {
    console.log('⏳ Sync engine ya en ejecución')
    return { processed: 0, succeeded: 0, failed: 0 }
  }

  isRunning = true
  emit({ type: 'start' })

  let processed = 0
  let succeeded = 0
  let failed = 0

  try {
    const operations = await syncQueue.getPending()

    if (operations.length === 0) {
      console.log('✅ Nada que sincronizar')
      emit({ type: 'idle' })
      return { processed: 0, succeeded: 0, failed: 0 }
    }

    console.log(`🔄 Sincronizando ${operations.length} operación(es)...`)

    for (const op of operations) {
      processed++
      await syncQueue.markSyncing(op.id)
      emit({ type: 'progress', processed, total: operations.length, op })

      const result = await runHandler(op)

      if (result.ok) {
        // ⭐ Si el handler devolvió un serverId y es CREATE_AUDIT_LOG,
        //    remapear el registro local (ID temporal → UUID Supabase)
        if (result.serverId && op.type === OP.CREATE_AUDIT_LOG) {
          const localId = op.payload?.event?.id
          if (localId) {
            await remapAuditId(localId, result.serverId)
          }
        }

        await syncQueue.markSynced(op.id)
        succeeded++
        console.log(`   ✅ ${op.type} (${op.id})`)
      } else {
        await syncQueue.markFailed(op.id, result.error)
        failed++
        console.warn(`   ❌ ${op.type} (${op.id}): ${result.error}`)
      }
    }

    emit({ type: 'done', processed, succeeded, failed })

    // Limpieza de operaciones sincronizadas
    await syncQueue.cleanup()

    return { processed, succeeded, failed }
  } catch (err) {
    console.error('❌ Error en syncEngine:', err)
    emit({ type: 'error', error: err.message })
    return { processed, succeeded, failed }
  } finally {
    isRunning = false
  }
}

/**
 * ¿Está el motor corriendo?
 */
export function isSyncing() {
  return isRunning
}

/**
 * Fuerza un intento inmediato (usado por el usuario).
 */
export async function forceSync() {
  console.log('🔧 Forzando sincronización...')
  return await processQueue()
}