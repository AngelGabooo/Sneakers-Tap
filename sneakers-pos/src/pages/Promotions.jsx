// src/pages/Promotions.jsx
import { useEffect, useMemo, useState } from 'react'
import { Plus, Tag, Pencil, Trash2, Power, PowerOff, Calendar, Sparkles } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import Toast from '../components/common/Toast'
import ConfirmModal from '../components/common/ConfirmModal'
import PromotionEditorModal from '../components/promotions/PromotionEditorModal'
import PromotionsWelcomeModal, {
  hasSeenPromotionsOnboarding,
} from '../components/promotions/PromotionsWelcomeModal'
import PromotionsTourModal from '../components/promotions/PromotionsTourModal'
import { useView } from '../context/ViewContext'
import { usePromotions } from '../context/PromotionsContext'
import { useProducts } from '../context/ProductsContext'

const fmtDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX')}`

const getPromoStatus = (promo) => {
  if (!promo.active) return { label: 'Inactiva', variant: 'neutral' }
  const now = Date.now()
  if (promo.starts_at && new Date(promo.starts_at).getTime() > now) {
    return { label: 'Programada', variant: 'info' }
  }
  if (promo.ends_at && new Date(promo.ends_at).getTime() < now) {
    return { label: 'Expirada', variant: 'warning' }
  }
  return { label: 'Activa', variant: 'success' }
}

export default function Promotions() {
  const { navigate } = useView()
  const { promotions, createPromotion, updatePromotion, togglePromotion, deletePromotion } = usePromotions()
  const { products } = useProducts()

  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null })
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  // 🎁 Onboarding: modal de bienvenida + tour
  const [welcomeOpen, setWelcomeOpen] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)

  // Mostrar bienvenida la primera vez
  useEffect(() => {
    if (!hasSeenPromotionsOnboarding()) {
      const t = setTimeout(() => setWelcomeOpen(true), 400)
      return () => clearTimeout(t)
    }
  }, [])

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  )

  const sortedPromotions = useMemo(
    () => [...promotions].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')),
    [promotions],
  )

  const handleNew = () => {
    setEditing(null)
    setEditorOpen(true)
  }

  const handleEdit = (promo) => {
    setEditing(promo)
    setEditorOpen(true)
  }

  const handleSubmitEditor = async (promoData) => {
    setSubmitting(true)
    try {
      if (editing) {
        await updatePromotion(editing.id, promoData)
        setToast({ title: '✅ Promoción actualizada', description: promoData.name })
      } else {
        await createPromotion(promoData)
        setToast({ title: '✅ Promoción creada', description: promoData.name })
      }
      setEditorOpen(false)
      setEditing(null)
    } catch (err) {
      setToast({ title: 'Error', description: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (promo) => {
    try {
      await togglePromotion(promo.id, !promo.active)
      setToast({
        title: promo.active ? 'Promoción desactivada' : 'Promoción activada',
        description: promo.name,
      })
    } catch (err) {
      setToast({ title: 'Error', description: err.message })
    }
  }

  const handleConfirmDelete = async () => {
    setSubmitting(true)
    try {
      await deletePromotion(deleteConfirm.id)
      setToast({ title: 'Promoción eliminada' })
      setDeleteConfirm({ open: false, id: null })
    } catch (err) {
      setToast({ title: 'Error', description: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenTour = () => {
    setTourOpen(true)
  }

  return (
    <DashboardLayout activeKey="promotions" onNavigate={navigate}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
              Promociones
            </h1>
            {/* 🎁 Badge "NUEVO" junto al título */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles size={10} strokeWidth={2.5} />
              Nuevo
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
            Configura ofertas como "2 pares por $1,200" para tus productos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* 🎁 Botón "Ver pasos" */}
          <Button
            variant="secondary"
            icon={Sparkles}
            onClick={handleOpenTour}
            className="hidden sm:inline-flex"
          >
            Ver pasos
          </Button>

          <Button variant="primary" icon={Plus} onClick={handleNew}>
            Nueva promoción
          </Button>
        </div>
      </div>

      {/* 🎁 Botón "Ver pasos" en móvil */}
      <div className="sm:hidden mb-3">
        <Button
          variant="secondary"
          icon={Sparkles}
          onClick={handleOpenTour}
          className="w-full"
        >
          Ver pasos
        </Button>
      </div>

      {sortedPromotions.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-blue to-indigo-600 flex items-center justify-center shadow-lg">
              <Tag size={28} className="text-white" strokeWidth={2.2} />
            </div>
            <p className="text-base font-bold text-brand-black dark:text-dark-text mb-1">
              Aún no tienes promociones
            </p>
            <p className="text-sm text-gray-500 dark:text-dark-muted mt-1 mb-5 max-w-sm mx-auto">
              Crea tu primera oferta como "2 pares por $1,200" y actívala desde el punto de venta.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <Button variant="secondary" icon={Sparkles} onClick={handleOpenTour}>
                Ver pasos
              </Button>
              <Button variant="primary" icon={Plus} onClick={handleNew}>
                Crear promoción
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedPromotions.map((promo) => {
            const status = getPromoStatus(promo)
            const qty = Number(promo.bundle_qty) || Number(promo.buy_qty) || 2
            const price = Number(promo.bundle_price) || 0

            return (
              <Card key={promo.id}>
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="inline-flex items-center justify-center h-8 px-3 rounded-md bg-brand-blue text-white text-sm font-bold">
                        {qty} pares por {fmt(price)}
                      </span>
                      <h3 className="text-base font-bold text-brand-black dark:text-dark-text truncate">
                        {promo.name}
                      </h3>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>

                    {promo.description && (
                      <p className="text-xs text-gray-500 dark:text-dark-muted mb-2">
                        {promo.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-dark-muted flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={11} strokeWidth={2} />
                        {fmtDate(promo.starts_at)} → {fmtDate(promo.ends_at)}
                      </span>
                      <span>
                        {promo.applies_to === 'products' && (
                          <>
                            {promo.productIds?.length || 0} producto
                            {(promo.productIds?.length || 0) !== 1 ? 's' : ''}
                          </>
                        )}
                        {promo.applies_to === 'category' && `Categoría: ${promo.category_filter || '—'}`}
                        {promo.applies_to === 'brand' && `Marca: ${promo.brand_filter || '—'}`}
                      </span>
                    </div>

                    {promo.applies_to === 'products' && promo.productIds?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {promo.productIds.slice(0, 3).map((pid) => {
                          const p = productMap.get(pid)
                          return (
                            <span
                              key={pid}
                              className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-dark-muted"
                            >
                              {p?.name || 'Producto'}
                            </span>
                          )
                        })}
                        {promo.productIds.length > 3 && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-dark-muted">
                            +{promo.productIds.length - 3} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggle(promo)}
                      className="p-2 rounded-lg text-gray-500 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                      title={promo.active ? 'Desactivar' : 'Activar'}
                    >
                      {promo.active ? <Power size={16} /> : <PowerOff size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(promo)}
                      className="p-2 rounded-lg text-gray-500 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm({ open: true, id: promo.id })}
                      className="p-2 rounded-lg text-gray-500 hover:text-brand-red hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal de bienvenida (solo primera vez) */}
      <PromotionsWelcomeModal
        open={welcomeOpen}
        onClose={() => setWelcomeOpen(false)}
        onOpenTour={handleOpenTour}
      />

      {/* Modal del tour (pasos detallados) */}
      <PromotionsTourModal
        open={tourOpen}
        onClose={() => setTourOpen(false)}
      />

      <PromotionEditorModal
        open={editorOpen}
        promotion={editing}
        products={products}
        onClose={() => { setEditorOpen(false); setEditing(null) }}
        onSubmit={handleSubmitEditor}
        submitting={submitting}
      />

      <ConfirmModal
        open={deleteConfirm.open}
        tone="danger"
        title="¿Eliminar esta promoción?"
        description="Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        loading={submitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
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