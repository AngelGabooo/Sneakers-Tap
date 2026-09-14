import { useEffect, useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Toast from '../components/common/Toast'
import CashOpenHeader from '../components/cash/open/CashOpenHeader'
import CashOpenSteps from '../components/cash/open/CashOpenSteps'
import CashOpenNotice from '../components/cash/open/CashOpenNotice'
import CashOpenSelector from '../components/cash/open/CashOpenSelector'
import CashOpenResponsible from '../components/cash/open/CashOpenResponsible'
import CashOpenDateTime from '../components/cash/open/CashOpenDateTime'
import CashOpenInitialFund from '../components/cash/open/CashOpenInitialFund'
import CashOpenBreakdown from '../components/cash/open/CashOpenBreakdown'
import CashOpenNote from '../components/cash/open/CashOpenNote'
import CashOpenSummary from '../components/cash/open/CashOpenSummary'
import CashOpenConfirmModal from '../components/cash/open/CashOpenConfirmModal'
import CashOpenSuccessModal from '../components/cash/open/CashOpenSuccessModal'
import CashOpenSkeleton from '../components/cash/open/CashOpenSkeleton' // 👈 FALTABA
import { useView } from '../context/ViewContext'
import { useAuth } from '../context/AuthContext'
import { useCash } from '../context/CashContext'

// 🚧 Config de cajas — reemplazar por API cuando conectes backend
const CASHES = [
  { id: 'C001', label: 'Caja #001', branch: 'Tienda principal', status: 'closed' },
  { id: 'C002', label: 'Caja #002', branch: 'Tienda principal', status: 'closed' },
  { id: 'C003', label: 'Caja #003', branch: 'Sucursal Norte',   status: 'closed' },
]

export default function CashOpen() {
  const { navigate } = useView()
  const { user } = useAuth()
  const { getOpenSession, openCash, sessions } = useCash()

  const [loading, setLoading] = useState(true)
  const [cashId, setCashId] = useState('')
  const [initialFund, setInitialFund] = useState('')
  const [breakdownEnabled, setBreakdownEnabled] = useState(false)
  const [breakdownValues, setBreakdownValues] = useState({})
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successSession, setSuccessSession] = useState(null)
  const [toast, setToast] = useState(null)

  // Fecha y hora de apertura (fija al montar)
  const now = useMemo(() => new Date(), [])

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 200)
    return () => clearTimeout(t)
  }, [])

  // Cajas con su estado real (open si hay sesión abierta)
  const cashesWithStatus = useMemo(() => {
    return CASHES.map((c) => {
      const open = getOpenSession(c.id)
      return {
        ...c,
        status: open ? 'open' : c.status,
      }
    })
  }, [getOpenSession, sessions])

  const selectedCash = cashesWithStatus.find((c) => c.id === cashId) || null
  const openSession = cashId ? getOpenSession(cashId) : null

  // Total contado por denominaciones
  const breakdownTotal = useMemo(() => {
    return Object.entries(breakdownValues).reduce((acc, [denom, qty]) => {
      return acc + Number(denom) * (Number(qty) || 0)
    }, 0)
  }, [breakdownValues])

  const declared = Number(initialFund) || 0
  const breakdownMatches = !breakdownEnabled || Math.abs(breakdownTotal - declared) < 0.01

  // Validación global
  const allValid =
    !!selectedCash &&
    selectedCash.status === 'closed' &&
    declared > 0 &&
    breakdownMatches

  // Handlers
  const handleNavigate = (key) => navigate(key)

  const handleCancel = () => {
    const hasChanges = !!cashId || !!initialFund || !!note
    if (hasChanges && !window.confirm('¿Salir sin abrir la caja? Los datos del fondo inicial que ingresaste no se guardarán.')) return
    navigate('cash')
  }

  const handleBreakdownChange = (denom, value) => {
    setBreakdownValues((v) => ({ ...v, [denom]: value }))
  }

  const handleOpenClick = () => {
    const e = {}
    if (!cashId) e.cashId = 'Selecciona una caja.'
    if (!(Number(initialFund) > 0)) e.initialFund = 'Ingresa un monto inicial válido.'
    if (breakdownEnabled && !breakdownMatches) e.breakdown = 'El conteo de efectivo no coincide.'
    setErrors(e)
    if (Object.keys(e).length > 0) return
    setConfirmOpen(true)
  }

  const handleConfirmOpen = () => {
    if (!selectedCash) return
    setSubmitting(true)

    // 🚧 TODO: POST /api/cash/sessions
    setTimeout(() => {
      const session = openCash({
        cashId: selectedCash.id,
        cashLabel: selectedCash.label,
        branch: selectedCash.branch,
        responsibleId: user?.id || null,
        responsibleName: user?.name || 'Henry Sneakers',
        responsibleRole: user?.role || 'Administrador',
        openedBy: user?.name || 'Henry Sneakers',
        initialFund: declared,
        breakdown: breakdownEnabled ? breakdownValues : null,
        note,
      })

      setSubmitting(false)
      setConfirmOpen(false)
      setSuccessSession(session)
      setToast({
        title: 'Caja abierta',
        description: `${session.cashLabel} está lista para operar.`,
      })
    }, 600)
  }

  const handleGoToCash = () => {
    setSuccessSession(null)
    navigate('cash')
  }

  const handleGoToPos = () => {
    setSuccessSession(null)
    navigate('pos')
  }

  return (
    <DashboardLayout
      activeKey="cash-open"
      onNavigate={handleNavigate}
      period={undefined}
      onPeriodChange={undefined}
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm mb-5">
        <button
          onClick={() => navigate('cash')}
          className="text-gray-500 dark:text-dark-muted hover:text-brand-blue transition-colors font-medium"
        >
          Caja
        </button>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-brand-black dark:text-dark-text font-medium">Apertura de caja</span>
      </nav>

      {loading ? (
        <CashOpenSkeleton />
      ) : (
        <>
          <CashOpenHeader onCancel={handleCancel} />

          <CashOpenNotice />

          <CashOpenSteps current={cashId ? (declared > 0 ? 'confirm' : 'fund') : 'cash'} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Formulario */}
            <div className="lg:col-span-2 space-y-5">
              <CashOpenSelector
                cashes={cashesWithStatus}
                cashId={cashId}
                onChangeCash={(v) => { setCashId(v); setErrors({}) }}
                openSession={openSession}
                onGoToCurrent={handleGoToCash}
              />

              <CashOpenResponsible user={user} />

              <CashOpenDateTime date={now} />

              <CashOpenInitialFund
                value={initialFund}
                onChange={setInitialFund}
                error={errors.initialFund}
              />

              <CashOpenBreakdown
                enabled={breakdownEnabled}
                onToggle={setBreakdownEnabled}
                values={breakdownValues}
                onChangeValue={handleBreakdownChange}
                total={breakdownTotal}
                declared={declared}
              />

              <CashOpenNote value={note} onChange={setNote} />
            </div>

            {/* Resumen */}
            <aside className="lg:col-span-1 space-y-5">
              <CashOpenSummary
                cash={selectedCash}
                user={user}
                date={now}
                initialFund={declared}
                breakdownTotal={breakdownTotal}
                breakdownEnabled={breakdownEnabled}
                allValid={allValid}
                onOpen={handleOpenClick}
                submitting={submitting}
              />
            </aside>
          </div>
        </>
      )}

      {/* Modales */}
      <CashOpenConfirmModal
        open={confirmOpen}
        cash={selectedCash}
        user={user}
        date={now}
        initialFund={declared}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmOpen}
        submitting={submitting}
      />

      <CashOpenSuccessModal
        open={!!successSession}
        session={successSession}
        onGoToCash={handleGoToCash}
        onGoToPos={handleGoToPos}
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