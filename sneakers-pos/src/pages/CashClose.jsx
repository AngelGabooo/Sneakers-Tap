import { useEffect, useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Toast from '../components/common/Toast'
import CashCloseHeader from '../components/cash/close/CashCloseHeader'
import CashCloseSteps from '../components/cash/close/CashCloseSteps'
import CashCloseSession from '../components/cash/close/CashCloseSession'
import CashCloseSummary from '../components/cash/close/CashCloseSummary'
import CashCloseSalesByPayment from '../components/cash/close/CashCloseSalesByPayment'
import CashCloseMovements from '../components/cash/close/CashCloseMovements'
import CashCloseCount from '../components/cash/close/CashCloseCount'
import CashCloseReconciliation from '../components/cash/close/CashCloseReconciliation'
import CashCloseDiffJustification from '../components/cash/close/CashCloseDiffJustification'
import CashCloseAuthRequired from '../components/cash/close/CashCloseAuthRequired'
import CashCloseFinalSummary from '../components/cash/close/CashCloseFinalSummary'
import CashCloseConfirmBlock from '../components/cash/close/CashCloseConfirmBlock'
import CashCloseConfirmModal from '../components/cash/close/CashCloseConfirmModal'
import CashCloseSuccess from '../components/cash/close/CashCloseSuccess'
import CashCloseEmpty from '../components/cash/close/CashCloseEmpty'
import CashCloseSkeleton from '../components/cash/close/CashCloseSkeleton'
import { useView } from '../context/ViewContext'
import { useAuth } from '../context/AuthContext'
import { useCash } from '../context/CashContext'
import { useSales } from '../context/SalesContext'

const AUTH_LIMIT = 100

function computeSummary(session, sales = []) {
  if (!session) {
    return {
      initialFund: 0,
      cashSales: 0,
      cashIn: 0,
      cashOut: 0,
      refunds: 0,
      expectedCash: 0,
      payments: {},
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

  const cashSales = payments.cash?.amount || 0

  const movements = session.movements || []
  const cashIn = movements
    .filter((m) => m.type === 'in' && m.label !== 'Apertura de caja')
    .reduce((a, m) => a + Number(m.amount || 0), 0)
  const cashOut = Math.abs(
    movements
      .filter((m) => m.type === 'out')
      .reduce((a, m) => a + Number(m.amount || 0), 0),
  )

  const refunds = 0
  const initialFund = Number(session.initialFund || 0)

  const expectedCash = initialFund + cashSales + cashIn - cashOut - refunds

  return { initialFund, cashSales, cashIn, cashOut, refunds, expectedCash, payments }
}

export default function CashClose() {
  const { navigate } = useView()
  const { user } = useAuth()
  const { getAnyOpenSession, closeCash } = useCash()
  const { sales } = useSales()

  const session = getAnyOpenSession()

  const [loading, setLoading] = useState(true)
  const [countValues, setCountValues] = useState({})
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState({})
  const [confirmed, setConfirmed] = useState(false)
  const [authorizedBy, setAuthorizedBy] = useState(null)
  const [authorizedAt, setAuthorizedAt] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [closed, setClosed] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 200)
    return () => clearTimeout(t)
  }, [])

  const summary = useMemo(() => computeSummary(session, sales), [session, sales])

  const counted = useMemo(
    () =>
      Object.entries(countValues).reduce(
        (a, [d, q]) => a + Number(d) * (Number(q) || 0),
        0,
      ),
    [countValues],
  )

  const diff = counted - summary.expectedCash
  const matches = Math.abs(diff) < 0.01
  const isSobrante = diff > 0
  const needsAuth = Math.abs(diff) > AUTH_LIMIT && !matches
  const hasCount = counted > 0

  const currentStep = !hasCount ? 'count' : matches ? 'confirm' : 'reconciliation'

  const validate = () => {
    const e = {}
    if (!hasCount) e.count = 'Ingresa el conteo de efectivo.'
    if (!matches) {
      if (!reason) e.reason = 'Selecciona un motivo para la diferencia.'
      if (reason === 'other' && !notes.trim()) e.notes = 'Describe brevemente la causa.'
    }
    if (needsAuth && !authorizedBy) e.auth = 'Se requiere autorización para esta diferencia.'
    if (!confirmed) e.confirmed = 'Debes confirmar que realizaste el conteo.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const canSubmit = session && hasCount && confirmed && (!needsAuth || !!authorizedBy) && (matches || reason)

  const handleNavigate = (key) => navigate(key)

  const handleCancel = () => {
    const hasChanges = hasCount || reason || notes
    if (hasChanges && !window.confirm('¿Salir sin cerrar la caja? Los datos del conteo no se guardarán.')) return
    navigate('cash-current')
  }

  const handleSubmit = () => {
    if (!validate()) return
    setConfirmOpen(true)
  }

  const handleConfirmClose = () => {
    if (!session) return
    setSubmitting(true)

    setTimeout(() => {
      const closedSession = closeCash(session.id, {
        closingFund: counted,
        closedBy: user?.name || 'Henry Sneakers',
        notes: notes || '',
        difference: diff,
        reason,
        authorizedBy,
        authorizedAt,
      })

      setSubmitting(false)
      setConfirmOpen(false)
      setClosed(closedSession || { ...session, status: 'closed', closingFund: counted })
      setToast({
        title: 'Caja cerrada correctamente',
        description: `La sesión ${session.id} fue cerrada y registrada.`,
      })
    }, 700)
  }

  const handleRequestAuth = () => {
    // 🚧 Simulación de autorización
    setAuthorizedBy('María López')
    setAuthorizedAt(new Date().toISOString())
    setToast({
      title: 'Autorización aprobada',
      description: 'María López autorizó la diferencia.',
    })
  }

  return (
    <DashboardLayout
      activeKey="cash-close"
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
        <span className="text-brand-black dark:text-dark-text font-medium">Cierre de caja</span>
      </nav>

      {loading ? (
        <CashCloseSkeleton />
      ) : closed ? (
        <CashCloseSuccess
          session={closed}
          summary={summary}
          counted={counted}
          onGoHistory={() => navigate('cash-history')}
          onGoSales={() => navigate('sales-history')}
          onGoDashboard={() => navigate('dashboard')}
        />
      ) : !session ? (
        <CashCloseEmpty
          onOpenCash={() => navigate('cash-open')}
          onViewHistory={() => navigate('cash-history')}
        />
      ) : (
        <>
          <CashCloseHeader
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            submitting={submitting}
            disabled={!canSubmit}
          />

          <CashCloseSteps current={currentStep} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <CashCloseSession session={session} />
              <CashCloseSummary summary={summary} />
              <CashCloseSalesByPayment payments={summary.payments} />
              <CashCloseMovements summary={summary} onViewAll={() => navigate('cash-history')} />
              <CashCloseCount values={countValues} onChangeValue={(d, v) => setCountValues((s) => ({ ...s, [d]: v }))} />
              {hasCount && (
                <CashCloseReconciliation expected={summary.expectedCash} counted={counted} />
              )}
              {hasCount && !matches && (
                <CashCloseDiffJustification
                  isSobrante={isSobrante}
                  diff={diff}
                  reason={reason}
                  onReasonChange={setReason}
                  notes={notes}
                  onNotesChange={setNotes}
                  errors={errors}
                />
              )}
              {hasCount && needsAuth && (
                <CashCloseAuthRequired
                  diff={diff}
                  limit={AUTH_LIMIT}
                  authorizedBy={authorizedBy}
                  authorizedAt={authorizedAt}
                  onRequestAuth={handleRequestAuth}
                />
              )}
              {hasCount && (
                <CashCloseFinalSummary session={session} summary={summary} counted={counted} />
              )}
              {hasCount && (
                <CashCloseConfirmBlock
                  confirmed={confirmed}
                  onConfirmedChange={(v) => { setConfirmed(v); if (errors.confirmed) setErrors((e) => ({ ...e, confirmed: undefined })) }}
                />
              )}
            </div>

            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-20 space-y-5">
                <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted mb-1">
                    Efectivo esperado
                  </p>
                  <p className="text-2xl font-bold text-brand-black dark:text-dark-text">
                    ${summary.expectedCash.toLocaleString('es-MX')}
                  </p>

                  {hasCount && (
                    <>
                      <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted mt-4 mb-1">
                        Efectivo contado
                      </p>
                      <p className="text-2xl font-bold text-brand-black dark:text-dark-text">
                        ${counted.toLocaleString('es-MX')}
                      </p>

                      <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted mt-4 mb-1">
                        Diferencia
                      </p>
                      <p className={`text-2xl font-bold ${
                        matches ? 'text-emerald-600 dark:text-emerald-400'
                        : isSobrante ? 'text-amber-600 dark:text-amber-400'
                        : 'text-brand-red'
                      }`}>
                        {diff >= 0 ? '+' : '-'}${Math.abs(diff).toLocaleString('es-MX')}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </>
      )}

      <CashCloseConfirmModal
        open={confirmOpen}
        session={session}
        expected={summary.expectedCash}
        counted={counted}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmClose}
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