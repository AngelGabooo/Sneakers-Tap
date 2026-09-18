// src/pages/WholesaleNew.jsx
import { useEffect, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Toast from '../components/common/Toast'
import WholesaleDetailHeader from '../components/wholesale/detail/WholesaleDetailHeader'
import WholesaleDetailForm from '../components/wholesale/detail/WholesaleDetailForm'
import WholesaleDetailSidebar from '../components/wholesale/detail/WholesaleDetailSidebar'
import { useView } from '../context/ViewContext'
import { useWholesale } from '../context/WholesaleContext'

const INITIAL_FORM = {
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
  // ⭐ NUEVO: escalones por defecto (admin los puede editar)
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

export default function WholesaleNew() {
  const { navigate } = useView()
  const { createWholesale } = useWholesale()

  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    setForm(INITIAL_FORM)
  }, [])

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
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
      if (!(Number(form.creditDays) > 0)) e.creditDays = 'Ingresa días de crédito válidos.'
    }

    if (form.defaultDiscount && form.maxDiscount) {
      if (Number(form.defaultDiscount) > Number(form.maxDiscount)) {
        e.defaultDiscount = 'El descuento predeterminado no puede superar el máximo.'
      }
    }

    // ⭐ Validar escalones
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
      const created = createWholesale(form)
      setSubmitting(false)
      setToast({
        title: 'Mayorista creado correctamente',
        description: `${created.name} fue registrada como cliente mayorista.`,
      })
      setTimeout(() => navigate('wholesale-edit', { id: created.id }), 700)
    }, 500)
  }

  const handleCancel = () => navigate('wholesale')

  return (
    <DashboardLayout
      activeKey="wholesale"
      onNavigate={navigate}
      period={undefined}
      onPeriodChange={undefined}
    >
      <WholesaleDetailHeader
        mode="new"
        wholesale={null}
        onBack={handleCancel}
        onCancel={handleCancel}
        onSave={handleSave}
        submitting={submitting}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <WholesaleDetailForm
            form={form}
            errors={errors}
            onChange={handleChange}
          />
        </div>

        <aside className="lg:col-span-1 lg:sticky lg:top-20 lg:self-start">
          <WholesaleDetailSidebar form={form} />
        </aside>
      </div>

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