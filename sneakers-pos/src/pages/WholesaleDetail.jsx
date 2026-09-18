// src/pages/WholesaleDetail.jsx
import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Toast from '../components/common/Toast'
import WholesaleDetailHeader from '../components/wholesale/detail/WholesaleDetailHeader'
import WholesaleDetailStats from '../components/wholesale/detail/WholesaleDetailStats'
import WholesaleDetailCredit from '../components/wholesale/detail/WholesaleDetailCredit'
import WholesaleDetailTabs from '../components/wholesale/detail/WholesaleDetailTabs'
import WholesaleDetailForm from '../components/wholesale/detail/WholesaleDetailForm'
import WholesaleDetailSidebar from '../components/wholesale/detail/WholesaleDetailSidebar'
import WholesaleDetailSkeleton from '../components/wholesale/detail/WholesaleDetailSkeleton'
import WholesaleDetailEmpty from '../components/wholesale/detail/WholesaleDetailEmpty'
import CreditGrantModal from '../components/wholesale/detail/CreditGrantModal'       // ⭐ NUEVO
import { useView } from '../context/ViewContext'
import { useWholesale } from '../context/WholesaleContext'
import { useCredit } from '../context/CreditContext'                                 // ⭐ NUEVO
import { useAuth } from '../context/AuthContext'                                     // ⭐ NUEVO

const INITIAL_FORM = {
  id: null,
  clientType: 'company',
  name: '',
  legalName: '',
  rfc: '',
  status: 'active',

  contactName: '',
  phone: '',
  phoneSecondary: '',
  email: '',
  website: '',

  taxRegime: '',
  cfdiUse: '',
  billingEmail: '',

  street: '',
  extNumber: '',
  intNumber: '',
  neighborhood: '',
  zip: '',
  city: '',
  state: '',
  country: 'México',

  condition: 'basic',
  priceList: 'basic',
  defaultDiscount: '',
  maxDiscount: '',
  discountTiers: [
    { minQty: 4, discount: 5 },
    { minQty: 8, discount: 10 },
  ],
  minPurchaseAmount: '',
  minPurchaseUnits: '',

  creditEnabled: false,
  creditLimit: '',
  creditDays: '',
  creditUsed: 0,

  paymentCondition: 'immediate',
  paymentMethods: [],

  responsable: '',
  branch: 'Tienda principal',
  internalNotes: '',
}

export default function WholesaleDetail({ mode = 'edit' }) {
  const { navigate, viewParams } = useView()
  const { getWholesaleById, updateWholesale } = useWholesale()
  const { createCredit, getActiveByCustomer, refresh: refreshCredits } = useCredit()  // ⭐ NUEVO
  const { user } = useAuth()                                                          // ⭐ NUEVO

  const wholesaleId = viewParams?.id
  const wholesale = wholesaleId ? getWholesaleById(wholesaleId) : null

  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('summary')
  const [toast, setToast] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [grantModalOpen, setGrantModalOpen] = useState(false)                         // ⭐ NUEVO
  const [grantSubmitting, setGrantSubmitting] = useState(false)                       // ⭐ NUEVO

  // ⭐ NUEVO: crédito activo del cliente
  const activeCredit = useMemo(() => {
    if (!wholesaleId) return null
    return getActiveByCustomer(wholesaleId)
  }, [wholesaleId, getActiveByCustomer])

  useEffect(() => {
    if (mode === 'new') {
      setForm(INITIAL_FORM)
      setLoading(false)
      return
    }

    if (!wholesaleId) {
      setLoading(false)
      return
    }

    if (!wholesale) {
      setLoading(false)
      return
    }

    setForm({ ...INITIAL_FORM, ...wholesale })
    setLoading(false)
    setDirty(false)
  }, [mode, wholesaleId, wholesale])

  const handleChange = (field, value) => {
    setForm((f) => {
      const next = { ...f, [field]: value }

      if (field === 'condition' && !next.priceList) {
        next.priceList = value
      }

      return next
    })
    setDirty(true)
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.clientType) e.clientType = 'Selecciona un tipo de cliente.'
    if (!form.name?.trim()) e.name = 'El nombre comercial es obligatorio.'
    if (!form.contactName?.trim()) e.contactName = 'El contacto principal es obligatorio.'
    if (!form.phone?.trim() && !form.email?.trim()) {
      e.phone = 'Ingresa al menos un teléfono o correo.'
      e.email = 'Ingresa al menos un teléfono o correo.'
    }
    if (!form.condition) e.condition = 'Selecciona una condición comercial.'
    if (!form.status) e.status = 'Selecciona un estado.'

    if (form.creditEnabled) {
      if (!(Number(form.creditLimit) > 0)) e.creditLimit = 'Ingresa un límite válido.'
      if (!(Number(form.creditDays) > 0))   e.creditDays  = 'Ingresa días de crédito válidos.'
    }

    if (form.defaultDiscount && form.maxDiscount) {
      if (Number(form.defaultDiscount) > Number(form.maxDiscount)) {
        e.defaultDiscount = 'El descuento predeterminado no puede superar el máximo.'
      }
    }

    const tiers = Array.isArray(form.discountTiers) ? form.discountTiers : []
    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i]
      if (!(Number(t.minQty) > 0)) {
        e.discountTiers = `El escalón #${i + 1} necesita una cantidad válida.`
        break
      }
      if (!(Number(t.discount) >= 0)) {
        e.discountTiers = `El escalón #${i + 1} necesita un % válido.`
        break
      }
      if (i > 0 && Number(tiers[i].minQty) <= Number(tiers[i - 1].minQty)) {
        e.discountTiers = 'Los escalones deben ir de menor a mayor cantidad.'
        break
      }
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    setSubmitting(true)

    setTimeout(() => {
      if (mode === 'edit' && wholesaleId) {
        updateWholesale(wholesaleId, form)
        setSubmitting(false)
        setDirty(false)
        setToast({
          title: 'Cambios guardados correctamente',
          description: 'La información y condiciones comerciales fueron actualizadas.',
        })
      }
    }, 500)
  }

  // ⭐ NUEVO: Otorgar crédito
  const handleGrantCredit = async ({ amount, dueDate, notes }) => {
    setGrantSubmitting(true)
    try {
      // Validaciones locales
      if (!form.creditEnabled) {
        throw new Error('El cliente no tiene habilitado el crédito.')
      }
      if (!(Number(form.creditLimit) > 0)) {
        throw new Error('Debes configurar un límite de crédito primero.')
      }
      if (activeCredit) {
        throw new Error('Este cliente ya tiene un crédito activo.')
      }
      if (amount > Number(form.creditLimit)) {
        throw new Error(`El monto supera el límite de $${Number(form.creditLimit).toLocaleString('es-MX')}.`)
      }

      await createCredit({
        credit: {
          customerId: form.id,
          customerName: form.name,
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

      // Refrescar créditos para que la sección se actualice
      await refreshCredits()

      setGrantModalOpen(false)
      setToast({
        title: '✅ Crédito otorgado',
        description: `$${amount.toLocaleString('es-MX')} a ${form.name}. Vence el ${new Date(dueDate).toLocaleDateString('es-MX')}.`,
      })
    } catch (err) {
      console.error('❌ Error otorgando crédito:', err)
      setToast({
        title: 'Error al otorgar crédito',
        description: err.message || 'Intenta de nuevo.',
      })
    } finally {
      setGrantSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (dirty && !window.confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')) return
    navigate('wholesale')
  }

  const handleBack = () => navigate('wholesale')

  const handleNewSale = () => {
    navigate('pos', { customerId: form.id })
  }

  const handleViewSales = () => navigate('sales-history', { customerId: form.id })
  const handleViewAccount = () => setActiveTab('account')
  const handleViewAudit = () => setActiveTab('audit')

  const handleToggleStatus = () => {
    const next = form.status === 'active' ? 'suspended' : 'active'
    setForm((f) => ({ ...f, status: next }))
    setDirty(true)
    setToast({
      title: next === 'active' ? 'Mayorista activado' : 'Mayorista suspendido',
      description: `${form.name} ahora está ${next === 'active' ? 'activo' : 'suspendido'}.`,
    })
  }

  const handleBlock = () => {
    if (!window.confirm('¿Bloquear a este cliente mayorista?')) return
    setForm((f) => ({ ...f, status: 'blocked' }))
    setDirty(true)
    setToast({
      title: 'Cliente bloqueado',
      description: `${form.name} no podrá realizar operaciones mayoristas.`,
    })
  }

  const stats = useMemo(() => {
    const limit = Number(form.creditLimit) || 0
    const used = Number(form.creditUsed) || 0
    return {
      salesInPeriod: form.salesInPeriod || 0,
      ordersInPeriod: form.ordersInPeriod || 0,
      balance: form.balance || 0,
      creditAvailable: Math.max(0, limit - used),
    }
  }, [form])

  const credit = useMemo(() => ({
    limit: Number(form.creditLimit) || 0,
    used: Number(form.creditUsed) || 0,
    balance: Number(form.balance) || 0,
    overdue: form.overdue || false,
  }), [form])

  return (
    <DashboardLayout
      activeKey="wholesale"
      onNavigate={navigate}
      period={undefined}
      onPeriodChange={undefined}
    >
      {loading ? (
        <WholesaleDetailSkeleton />
      ) : mode === 'edit' && !wholesale ? (
        <WholesaleDetailEmpty onBack={handleBack} />
      ) : (
        <>
          <WholesaleDetailHeader
            mode={mode}
            wholesale={form}
            onBack={handleBack}
            onSave={handleSave}
            onCancel={handleCancel}
            submitting={submitting}
            onNewSale={handleNewSale}
            onViewSales={handleViewSales}
            onViewAccount={handleViewAccount}
            onViewAudit={handleViewAudit}
            onToggleStatus={handleToggleStatus}
            onBlock={handleBlock}
          />

          {mode === 'edit' && (
            <>
              <WholesaleDetailStats stats={stats} />
              <WholesaleDetailCredit credit={credit} />
              <WholesaleDetailTabs active={activeTab} onChange={setActiveTab} />
            </>
          )}

          {(activeTab === 'summary' || mode === 'new') && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <WholesaleDetailForm
                  form={form}
                  errors={errors}
                  onChange={handleChange}
                  // ⭐ NUEVO: props para la sección de crédito
                  creditSectionProps={
                    mode === 'edit' && form.id
                      ? {
                          activeCredit,
                          onGrant: () => setGrantModalOpen(true),
                          onViewDetail: () => navigate('credits'),
                        }
                      : null
                  }
                />
              </div>

              <aside className="lg:col-span-1 lg:sticky lg:top-20 lg:self-start">
                <WholesaleDetailSidebar form={form} />
              </aside>
            </div>
          )}

          {activeTab === 'sales' && mode === 'edit' && (
            <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-6 text-sm text-gray-500 dark:text-dark-muted">
              Aún no hay ventas registradas para este cliente.
            </div>
          )}

          {activeTab === 'account' && mode === 'edit' && (
            <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-6 text-sm text-gray-500 dark:text-dark-muted">
              Sin movimientos de cuenta recientes.
            </div>
          )}

          {activeTab === 'activity' && mode === 'edit' && (
            <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-6 text-sm text-gray-500 dark:text-dark-muted">
              Sin actividad registrada reciente.
            </div>
          )}

          {activeTab === 'audit' && mode === 'edit' && (
            <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-6 text-sm text-gray-500 dark:text-dark-muted">
              Sin auditoría registrada.
            </div>
          )}
        </>
      )}

      {/* ⭐ NUEVO: Modal para otorgar crédito */}
      <CreditGrantModal
        open={grantModalOpen}
        customer={form}
        onClose={() => setGrantModalOpen(false)}
        onSubmit={handleGrantCredit}
        submitting={grantSubmitting}
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