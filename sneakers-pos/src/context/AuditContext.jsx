// src/context/AuditContext.jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { auditRepo } from '../repositories/auditRepo'
import { useNetwork } from './NetworkContext'
import { useAuth } from './AuthContext'                  // ⭐ NUEVO
import { supabase } from '../lib/supabase'               // ⭐ NUEVO

const AuditContext = createContext(null)

const DEFAULT_FILTERS = {
  user: 'all',
  module: 'all',
  action: 'all',
  result: 'all',
  level: 'all',
  entity: 'all',
  branch: 'all',
}

function getPeriodRange(period, customFrom, customTo) {
  const now = new Date()
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)

  switch (period) {
    case 'today':      return { from: startOfDay(now), to: endOfDay(now) }
    case 'yesterday': {
      const y = new Date(now); y.setDate(y.getDate() - 1)
      return { from: startOfDay(y), to: endOfDay(y) }
    }
    case 'last7': {
      const s = new Date(now); s.setDate(s.getDate() - 6)
      return { from: startOfDay(s), to: endOfDay(now) }
    }
    case 'last30': {
      const s = new Date(now); s.setDate(s.getDate() - 29)
      return { from: startOfDay(s), to: endOfDay(now) }
    }
    case 'thisMonth':
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(now) }
    case 'lastMonth': {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const e = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      return { from: s, to: e }
    }
    case 'thisQuarter': {
      const q = Math.floor(now.getMonth() / 3)
      return { from: new Date(now.getFullYear(), q * 3, 1), to: endOfDay(now) }
    }
    case 'thisYear':
      return { from: new Date(now.getFullYear(), 0, 1), to: endOfDay(now) }
    case 'custom':
      return {
        from: customFrom ? new Date(customFrom) : null,
        to: customTo ? new Date(`${customTo}T23:59:59.999`) : null,
      }
    default:
      return { from: null, to: null }
  }
}

export function AuditProvider({ children }) {
  const { isOnline } = useNetwork()
  const { user } = useAuth()                              // ⭐ NUEVO
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const mountedRef = useRef(true)
  const channelRef = useRef(null)                         // ⭐ NUEVO

  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('last30')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [quickFilter, setQuickFilter] = useState('all')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)

  // Cargar local
  const loadLocal = useCallback(async () => {
    try {
      const list = await auditRepo.getAllLocal()
      if (mountedRef.current) setEvents(list)
      return list
    } catch (err) {
      console.error('❌ Error cargando auditoría local:', err)
      return []
    }
  }, [])

  // Sync remoto
  const syncRemote = useCallback(async () => {
    if (!isOnline) return
    setSyncing(true)
    try {
      await auditRepo.syncFromSupabase()
      await loadLocal()
    } catch (err) {
      console.warn('⚠️ Sync de auditoría falló:', err.message)
    } finally {
      if (mountedRef.current) setSyncing(false)
    }
  }, [isOnline, loadLocal])

  // Al montar
  useEffect(() => {
    mountedRef.current = true
    async function init() {
      setLoading(true)
      await loadLocal()
      if (mountedRef.current) setLoading(false)
      if (isOnline) syncRemote()
    }
    init()
    return () => { mountedRef.current = false }
  }, [loadLocal, syncRemote, isOnline])

  // Al reconectar
  useEffect(() => {
    if (!isOnline) return
    const timer = setTimeout(() => syncRemote(), 2000)
    return () => clearTimeout(timer)
  }, [isOnline, syncRemote])

  // ⭐ ============================================================
  // ⭐ REALTIME: escucha cambios en `audit_log` para actualizar en vivo
  // ============================================================
  useEffect(() => {
    if (!isOnline) return
    if (!user) return

    let debounceTimer = null
    const scheduleRefresh = (reason) => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(async () => {
        console.log(`🔄 Realtime audit → syncRemote (${reason})`)
        await syncRemote()
      }, 800)
    }

    const channel = supabase
      .channel('audit-realtime-' + Date.now())
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_log' },
        (payload) => {
          console.log('📋 Realtime audit INSERT:', payload.new?.action)
          scheduleRefresh('audit_log INSERT')
        },
      )
      .subscribe((status) => {
        console.log('📡 Realtime audit status:', status)
      })

    channelRef.current = channel

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [isOnline, user, syncRemote])

  // Filtros
  const filteredEvents = useMemo(() => {
    const { from, to } = getPeriodRange(period, customFrom, customTo)

    return events.filter((e) => {
      if (from || to) {
        const t = new Date(e.createdAt).getTime()
        if (from && t < from.getTime()) return false
        if (to && t > to.getTime()) return false
      }

      if (search) {
        const q = search.toLowerCase()
        const haystack = [
          e.userName, e.action, e.module, e.entityId, e.entityName,
          e.description, e.branch,
        ].filter(Boolean).join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }

      if (filters.module !== 'all' && e.module !== filters.module) return false
      if (filters.action !== 'all' && e.action !== filters.action) return false
      if (filters.result !== 'all' && e.result !== filters.result) return false
      if (filters.level !== 'all' && e.level !== filters.level) return false
      if (filters.entity !== 'all' && e.entity !== filters.entity) return false
      if (filters.branch !== 'all' && e.branch !== filters.branch) return false

      switch (quickFilter) {
        case 'today': {
          const today = new Date(); today.setHours(0, 0, 0, 0)
          if (new Date(e.createdAt).getTime() < today.getTime()) return false
          break
        }
        case 'critical':
          if (e.level !== 'critical') return false
          break
        case 'admin':
          if (!['users', 'roles', 'settings'].includes(e.module)) return false
          break
        case 'sales':
          if (e.module !== 'sales') return false
          break
        case 'inventory':
          if (e.module !== 'inventory') return false
          break
        case 'cash':
          if (e.module !== 'cash') return false
          break
      }

      return true
    })
  }, [events, period, customFrom, customTo, search, filters, quickFilter])

  const stats = useMemo(() => {
    const total = filteredEvents.length
    const admin = filteredEvents.filter((e) => ['users', 'roles', 'settings'].includes(e.module)).length
    const critical = filteredEvents.filter((e) => e.level === 'critical').length
    const activeUsers = new Set(filteredEvents.map((e) => e.userName).filter(Boolean)).size
    return { total, admin, critical, activeUsers }
  }, [filteredEvents])

  const security = useMemo(() => {
    const failedLogins = events.filter((e) => e.module === 'auth' && e.result === 'rejected').length
    const recentPermissionChanges = events.filter((e) => e.module === 'roles' && e.action === 'permissions').length
    const remoteLogouts = events.filter((e) => e.action === 'logout' && e.module !== 'cash').length
    return { compromised: 0, failedLogins, recentPermissionChanges, remoteLogouts }
  }, [events])

  const total = filteredEvents.length
  const paged = useMemo(() => {
    const start = (page - 1) * perPage
    return filteredEvents.slice(start, start + perPage)
  }, [filteredEvents, page, perPage])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setSearch('')
    setQuickFilter('all')
    setPeriod('last30')
    setCustomFrom('')
    setCustomTo('')
    setPage(1)
  }, [])

  useEffect(() => { setPage(1) }, [search, period, customFrom, customTo, quickFilter, filters])

  const value = {
    events: paged,
    stats,
    security,
    loading,
    syncing,
    total,
    search, setSearch,
    period, setPeriod,
    customFrom, setCustomFrom,
    customTo, setCustomTo,
    quickFilter, setQuickFilter,
    filters, setFilters,
    page, setPage,
    perPage, setPerPage,
    resetFilters,
    refresh: loadLocal,
  }

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>
}

export function useAudit() {
  const ctx = useContext(AuditContext)
  if (!ctx) throw new Error('useAudit debe usarse dentro de AuditProvider')
  return ctx
}