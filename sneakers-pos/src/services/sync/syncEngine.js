// src/services/sync/syncEngine.js
import { syncQueue } from './syncQueue'
import { runHandler } from './handlers'
import { STATUS } from './operationTypes'

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