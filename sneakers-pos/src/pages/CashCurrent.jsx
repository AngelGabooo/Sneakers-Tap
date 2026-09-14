import { useEffect, useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Toast from '../components/common/Toast'
import CashCurrentHeader from '../components/cash/current/CashCurrentHeader'
import CashCurrentSession from '../components/cash/current/CashCurrentSession'
import CashCurrentStats from '../components/cash/current/CashCurrentStats'
import CashCurrentSummary from '../components/cash/current/CashCurrentSummary'
import CashCurrentExpected from '../components/cash/current/CashCurrentExpected'
import CashCurrentPayments from '../components/cash/current/CashCurrentPayments'
import CashCurrentReconciliation from '../components/cash/current/CashCurrentReconciliation'
import CashCurrentAlerts from '../components/cash/current/CashCurrentAlerts'
import CashCurrentMovementsTable from '../components/cash/current/CashCurrentMovementsTable'
import CashCurrentSalesTable from '../components/cash/current/CashCurrentSalesTable'
import CashCurrentQuickActions from '../components/cash/current/CashCurrentQuickActions'
import CashCurrentEmpty from '../components/cash/current/CashCurrentEmpty'
import CashCurrentSkeleton from '../components/cash/current/CashCurrentSkeleton'
import CashCurrentMovementModal from '../components/cash/current/CashCurrentMovementModal'
import CashCurrentCountModal from '../components/cash/current/CashCurrentCountModal'
import CashCurrentRetiroConfirmModal from '../components/cash/current/CashCurrentRetiroConfirmModal'
import { useView } from '../context/ViewContext'
import { useCash } from '../context/CashContext'
import { useSales } from '../context/SalesContext'

function computeSessionAggregates(session, sales = []) {
  if (!session) {
    return {
      totalSales: 0,
      salesCount: 0,
      cashSales: 0,
      cashIn: 0,
      cashOut: 0,
      expectedCash: 0,
      payments: {},
      withdrawalsCount: 0,
      sessionSales: [],
      movements: [],
      reconciliation: { hasDifference: false, difference: 0 },
    }
  }

  const sessionSales = sales.filter(
    (s) => s.cashSessionId === session.id && s.status !== 'cancelled',
  )

  const payments = {}
  sessionSales.forEach((s) => {
    const m = s.payment?.method || 'other'
    if (!payments[m]) payments[m] = { count: 0, amount: 0 }
    payments[m].count++
    payments[m].amount += Number(s.total) || 0
  })

  const totalSales = sessionSales.reduce((a, s) => a + (Number(s.total) || 0), 0)
  const salesCount = sessionSales.length
  const cashSales = payments.cash?.amount || 0

  const rawMovements = session.movements || []
  let runningCash = 0
  const movements = rawMovements.map((m) => {
    runningCash += Number(m.amount) || 0
    return { ...m, after: runningCash }
  })

  const cashIn = movements
    .filter((m) => m.type === 'in')
    .reduce((a, m) => a + Number(m.amount || 0), 0)
  const cashOut = Math.abs(
    movements
      .filter((m) => m.type === 'out')
      .reduce((a, m) => a + Number(m.amount || 0), 0),
  )
  const withdrawalsCount = movements.filter((m) => m.type === 'out').length

  const expectedCash =
    Number(session.initialFund || 0) + cashSales + cashIn - cashOut

  return {
    totalSales,
    salesCount,
    cashSales,
    cashIn: cashIn + Number(session.initialFund || 0),
    cashOut,
    expectedCash,
    payments,
    withdrawalsCount,
    sessionSales,
    movements,
    reconciliation: { hasDifference: false, difference: 0 },
  }
}

export default function CashCurrent() {
  const { navigate } = useView()
  const { getAnyOpenSession } = useCash()
  const { sales } = useSales()

  const session = getAnyOpenSession()
  const [loading, setLoading] = useState(true)
  const [movementOpen, setMovementOpen] = useState(false)
  const [movementType, setMovementType] = useState('in')
  const [countOpen, setCountOpen] = useState(false)
  const [retiroConfirm, setRetiroConfirm] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 200)
    return () => clearTimeout(t)
  }, [])

  const aggregates = useMemo(
    () => computeSessionAggregates(session, sales),
    [session, sales],
  )

  const handleNavigate = (key) => navigate(key)
  const handleGoToClose = () => navigate('cash-close')
  const handleViewHistory = () => navigate('cash-history')
  const handleViewAudit = () => navigate('audit')
  const handleOpenCash = () => navigate('cash-open')

  const handleRegisterMovement = () => {
    setMovementType('in')
    setMovementOpen(true)
  }

  const handleMovementConfirm = ({ type, amount, reason, note }) => {
    if (!session) return
    if (type === 'out') {
      setRetiroConfirm({
        amount,
        currentExpected: aggregates.expectedCash,
        reason,
        note,
      })
      setMovementOpen(false)
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setMovementOpen(false)
      setToast({
        title: 'Movimiento registrado',
        description: `Entrada de $${Number(amount).toLocaleString('es-MX')}.`,
      })
    }, 500)
  }

  const handleRetiroConfirm = () => {
    setSubmitting(true)
    setTimeout(() => {
      const amount = retiroConfirm.amount
      setSubmitting(false)
      setRetiroConfirm(null)
      setToast({
        title: 'Retiro registrado',
        description: `Se registró un retiro de $${Number(amount).toLocaleString('es-MX')}.`,
      })
    }, 500)
  }

  const handleCountConfirm = ({ counted, difference }) => {
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setCountOpen(false)
      setToast({
        title: 'Conteo registrado',
        description: `Contado: $${counted.toLocaleString('es-MX')} · Diferencia: ${difference >= 0 ? '+' : ''}$${Math.abs(difference).toLocaleString('es-MX')}`,
      })
    }, 500)
  }

  const handleQuickAction = (key) => {
    const routes = {
      'new-sale':   () => navigate('pos'),
      'cash-in':    () => { setMovementType('in'); setMovementOpen(true) },
      'cash-out':   () => { setMovementType('out'); setMovementOpen(true) },
      count:        () => setCountOpen(true),
      'view-sales': () => navigate('sales-history', { cashId: session?.cashId }),
      'view-movs':  () => navigate('cash-history'),
      close:        () => navigate('cash-close'),
    }
    routes[key]?.()
  }

  const stats = {
    totalSales: aggregates.totalSales,
    salesCount: aggregates.salesCount,
    expectedCash: aggregates.expectedCash,
    cashIn: aggregates.cashIn,
    cashOut: aggregates.cashOut,
    withdrawalsCount: aggregates.withdrawalsCount,
  }

  const summary = {
    initialFund: Number(session?.initialFund || 0),
    cashSales: aggregates.cashSales,
    cashIn: aggregates.cashIn - Number(session?.initialFund || 0),
    cashOut: aggregates.cashOut,
    expectedCash: aggregates.expectedCash,
  }

  return (
    <DashboardLayout
      activeKey="cash-current"
      onNavigate={handleNavigate}
      period={undefined}
      onPeriodChange={undefined}
    >
      <nav className="flex items-center gap-1.5 text-sm mb-5">
        <button
          onClick={() => navigate('cash')}
          className="text-gray-500 dark:text-dark-muted hover:text-brand-blue transition-colors font-medium"
        >
          Caja
        </button>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-brand-black dark:text-dark-text font-medium">
          Caja actual
        </span>
      </nav>

      {loading ? (
        <CashCurrentSkeleton />
      ) : !session ? (
        <CashCurrentEmpty
          onOpenCash={handleOpenCash}
          onViewHistory={handleViewHistory}
        />
      ) : (
        <>
          <CashCurrentHeader
            onGoClose={handleGoToClose}
            onViewHistory={handleViewHistory}
            onRegisterMovement={handleRegisterMovement}
            onViewAudit={handleViewAudit}
          />

          <CashCurrentSession
            session={session}
            onViewHistory={handleViewHistory}
            onViewAudit={handleViewAudit}
          />

          <CashCurrentStats stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
            <div className="lg:col-span-2 space-y-5">
              <CashCurrentSummary summary={summary} />
              <CashCurrentPayments payments={aggregates.payments} />
              <CashCurrentMovementsTable
                movements={aggregates.movements}
                onViewAll={() => navigate('cash-history')}
              />
            </div>

            <aside className="lg:col-span-1 space-y-5">
              <CashCurrentExpected
                expectedCash={aggregates.expectedCash}
                onCount={() => setCountOpen(true)}
              />
              <CashCurrentReconciliation status={aggregates.reconciliation} />
              <CashCurrentAlerts alerts={[]} />
              <CashCurrentQuickActions onAction={handleQuickAction} />
            </aside>
          </div>

          <CashCurrentSalesTable
            sales={aggregates.sessionSales}
            onViewSale={(id) => navigate('sale-detail', { id })}
            onViewAll={() =>
              navigate('sales-history', { cashId: session.cashId })
            }
          />
        </>
      )}

      <CashCurrentMovementModal
        open={movementOpen}
        initialType={movementType}
        currentExpected={aggregates.expectedCash}
        onClose={() => setMovementOpen(false)}
        onConfirm={handleMovementConfirm}
        submitting={submitting}
      />

      <CashCurrentRetiroConfirmModal
        open={!!retiroConfirm}
        data={retiroConfirm}
        onClose={() => setRetiroConfirm(null)}
        onConfirm={handleRetiroConfirm}
        submitting={submitting}
      />

      <CashCurrentCountModal
        open={countOpen}
        expected={aggregates.expectedCash}
        onClose={() => setCountOpen(false)}
        onConfirm={handleCountConfirm}
        submitting={submitting}
      />

      <Toast
        open={!!toast}
        variant="success"
        title={toast?.title}
        description={toast?.description}
        onClose={() => setToast(null)}
      />
    </DashboardLayout>
  )
}