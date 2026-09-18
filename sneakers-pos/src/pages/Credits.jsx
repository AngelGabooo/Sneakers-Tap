// src/pages/Credits.jsx
import { useEffect, useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Toast from '../components/common/Toast'
import CreditsHeader from '../components/credits/CreditsHeader'
import CreditsStats from '../components/credits/CreditsStats'
import CreditsToolbar from '../components/credits/CreditsToolbar'
import CreditsQuickFilters from '../components/credits/CreditsQuickFilters'
import CreditsTable from '../components/credits/CreditsTable'
import CreditsCardList from '../components/credits/CreditsCardList'
import CreditNewModal from '../components/credits/CreditNewModal'
import CreditPaymentModal from '../components/credits/CreditPaymentModal'
import CreditDetailDrawer from '../components/credits/CreditDetailDrawer'
import { useView } from '../context/ViewContext'
import { useAuth } from '../context/AuthContext'
import { useCredit } from '../context/CreditContext'
import { useWholesale } from '../context/WholesaleContext'
import { useCash } from '../context/CashContext'

export default function Credits() {
  const { navigate } = useView()
  const { user } = useAuth()
  const { credits, stats, refresh, createCredit, registerPayment, cancelCredit } = useCredit()
  const { wholesales } = useWholesale()
  const { getAnyOpenSession } = useCash()

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState('all')
  const [sort, setSort] = useState({ field: 'createdAt', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)

  const [newOpen, setNewOpen] = useState(false)
  const [paymentTarget, setPaymentTarget] = useState(null)
  const [detailTarget, setDetailTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    setLoading(true)
    refresh().finally(() => setLoading(false))
  }, []) // eslint-disable-line

  // ⭐ Filtros
  const filtered = useMemo(() => {
    let list = [...credits]

    // Filtro rápido
    if (quickFilter !== 'all') {
      list = list.filter((c) => c.status === quickFilter)
    }

    // Búsqueda
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((c) =>
        (c.customerName || '').toLowerCase().includes(q) ||
        (c.notes || '').toLowerCase().includes(q),
      )
    }

    // Orden
    const dir = sort.direction === 'asc' ? 1 : -1
    list.sort((a, b) => {
      const va = a[sort.field] ?? ''
      const vb = b[sort.field] ?? ''
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir
      return String(va).localeCompare(String(vb)) * dir
    })

    return list
  }, [credits, quickFilter, search, sort])

  const paged = useMemo(() => {
    const start = (page - 1) * perPage
    return filtered.slice(start, start + perPage)
  }, [filtered, page, perPage])

  const total = filtered.length

  const quickCounts = useMemo(() => ({
    all:      credits.length,
    active:   credits.filter((c) => c.status === 'active').length,
    overdue:  credits.filter((c) => c.status === 'overdue').length,
    paid:     credits.filter((c) => c.status === 'paid').length,
    cancelled: credits.filter((c) => c.status === 'cancelled').length,
  }), [credits])

  // ⭐ Handlers
  const handleNavigate = (key) => navigate(key)

  const handleCreate = async ({ customerId, amount, dueDate, notes }) => {
    setSubmitting(true)
    try {
      const customer = wholesales.find((w) => w.id === customerId)
      if (!customer) throw new Error('Cliente no encontrado')

      // Validar que no tenga crédito activo
      const existing = credits.find(
        (c) => c.customerId === customerId && (c.status === 'active' || c.status === 'overdue'),
      )
      if (existing) throw new Error('Este cliente ya tiene un crédito activo.')

      // Validar monto contra creditLimit
      const limit = Number(customer.creditLimit) || 0
      if (amount > limit) {
        throw new Error(`El monto supera el límite de $${limit.toLocaleString('es-MX')}.`)
      }

      await createCredit({
        credit: {
          customerId: customer.id,
          customerName: customer.name,
          amount,
          dueDate,
          notes,
        },
        receivedBy: {
          id: user?.id,
          name: user?.name,
          role: user?.role,
        },
      })

      setNewOpen(false)
      setToast({
        title: '✅ Crédito otorgado',
        description: `$${amount.toLocaleString('es-MX')} a ${customer.name}. Vence el ${dueDate}.`,
      })
    } catch (err) {
      setToast({ title: 'Error al otorgar', description: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const handlePayment = async ({ creditId, amount, method, notes }) => {
    setSubmitting(true)
    try {
      const session = getAnyOpenSession()
      if (!session) {
        throw new Error('Debes abrir una caja antes de cobrar.')
      }

      const credit = credits.find((c) => c.id === creditId)
      if (!credit) throw new Error('Crédito no encontrado')

      await registerPayment({
        payment: {
          creditId,
          customerId: credit.customerId,
          amount,
          method,
          notes,
          cashSessionId: session.id,
        },
        receivedBy: {
          id: user?.id,
          name: user?.name,
          role: user?.role,
        },
      })

      setPaymentTarget(null)
      setDetailTarget(null)
      setToast({
        title: '✅ Pago registrado',
        description: `$${amount.toLocaleString('es-MX')} recibidos de ${credit.customerName}.`,
      })
    } catch (err) {
      setToast({ title: 'Error al cobrar', description: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (credit) => {
    if (!window.confirm(`¿Cancelar el crédito de ${credit.customerName}? Esta acción no borra los pagos ya registrados.`)) return
    try {
      await cancelCredit(credit.id, {
        reason: 'Cancelado manualmente',
        cancelledBy: { id: user?.id, name: user?.name },
      })
      setDetailTarget(null)
      setToast({ title: 'Crédito cancelado' })
    } catch (err) {
      setToast({ title: 'Error', description: err.message })
    }
  }

  const handleGoToWholesale = (credit) => {
    navigate('wholesale-edit', { id: credit.customerId })
  }

  // ⭐ Clientes disponibles para otorgar crédito (sin crédito activo)
  const customersAvailable = useMemo(() => {
    return wholesales.filter((w) => {
      if (!w.creditEnabled) return false
      if (w.status !== 'active') return false
      const active = credits.find(
        (c) => c.customerId === w.id && (c.status === 'active' || c.status === 'overdue'),
      )
      return !active
    })
  }, [wholesales, credits])

  return (
    <DashboardLayout
      activeKey="credits"
      onNavigate={handleNavigate}
      period={undefined}
      onPeriodChange={undefined}
    >
      <nav className="flex items-center gap-1.5 text-sm mb-5">
        <span className="text-gray-500 dark:text-dark-muted">Operación</span>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-brand-black dark:text-dark-text font-medium">Créditos</span>
      </nav>

      <CreditsHeader
        onNew={() => setNewOpen(true)}
        stats={stats}
      />

      <CreditsStats stats={stats} />

      <CreditsToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
      />

      <CreditsQuickFilters
        active={quickFilter}
        counts={quickCounts}
        onChange={(v) => { setQuickFilter(v); setPage(1) }}
      />

      {/* Desktop: tabla */}
      <div className="hidden md:block">
        <CreditsTable
          credits={paged}
          loading={loading}
          sort={sort}
          onSortChange={setSort}
          onViewDetail={setDetailTarget}
          onPay={setPaymentTarget}
          onViewCustomer={handleGoToWholesale}
          page={page}
          perPage={perPage}
          total={total}
          onPageChange={setPage}
          onPerPageChange={(n) => { setPerPage(n); setPage(1) }}
        />
      </div>

      {/* Móvil: cards */}
      <div className="md:hidden">
        <CreditsCardList
          credits={paged}
          loading={loading}
          onViewDetail={setDetailTarget}
          onPay={setPaymentTarget}
        />
      </div>

      {/* Modales */}
      <CreditNewModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onSubmit={handleCreate}
        submitting={submitting}
        customers={customersAvailable}
      />

      <CreditPaymentModal
        open={!!paymentTarget}
        credit={paymentTarget}
        onClose={() => setPaymentTarget(null)}
        onSubmit={handlePayment}
        submitting={submitting}
      />

      <CreditDetailDrawer
        open={!!detailTarget}
        credit={detailTarget}
        onClose={() => setDetailTarget(null)}
        onPay={(c) => { setDetailTarget(null); setPaymentTarget(c) }}
        onCancel={handleCancel}
        onViewCustomer={handleGoToWholesale}
      />

      <Toast
        open={!!toast}
        variant={toast?.title?.includes('Error') ? 'error' : 'success'}
        title={toast?.title}
        description={toast?.description}
        onClose={() => setToast(null)}
      />
    </DashboardLayout>
  )
}