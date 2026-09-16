// src/pages/SaleDetail.jsx
import { useEffect, useState } from 'react'
import { Receipt } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import Toast from '../components/common/Toast'
import SaleDetailHeader from '../components/sales/detail/SaleDetailHeader'
import SaleDetailActions from '../components/sales/detail/SaleDetailActions'
import SaleDetailStats from '../components/sales/detail/SaleDetailStats'
import SaleDetailItems from '../components/sales/detail/SaleDetailItems'
import SaleDetailSummary from '../components/sales/detail/SaleDetailSummary'
import SaleDetailInfo from '../components/sales/detail/SaleDetailInfo'
import SaleDetailCustomer from '../components/sales/detail/SaleDetailCustomer'
import SaleDetailPayments from '../components/sales/detail/SaleDetailPayments'
import SaleDetailCash from '../components/sales/detail/SaleDetailCash'
import SaleDetailInventory from '../components/sales/detail/SaleDetailInventory'
import SaleDetailReceipt from '../components/sales/detail/SaleDetailReceipt'
import SaleDetailAudit from '../components/sales/detail/SaleDetailAudit'
import SaleDetailCancelModal from '../components/sales/detail/SaleDetailCancelModal'
import SaleDetailSkeleton from '../components/sales/detail/SaleDetailSkeleton'
import PosTicketModal from '../components/pos/PosTicketModal'
import { useView } from '../context/ViewContext'
import { useAuth } from '../context/AuthContext'
import { useSales } from '../context/SalesContext'
import { notifySaleCancel } from '../utils/notifyAdmins'

export default function SaleDetail() {
  const { navigate, viewParams } = useView()
  const { user } = useAuth()
  const { getSaleById, cancelSale } = useSales()

  const saleId = viewParams?.id
  const sale = saleId ? getSaleById(saleId) : null

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [ticketOpen, setTicketOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!saleId || !sale) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setLoading(false)
  }, [saleId, sale])

  const handleBack = () => navigate('pos')
  const handleNewSale = () => navigate('pos')

  const handlePrint = () => {
    if (!sale) return
    setTicketOpen(true)
  }

  const handleSend = () => {
    setToast({
      title: 'Comprobante preparado',
      description: 'Función pendiente de conexión con el backend.',
    })
  }

  const handleDownload = () => {
    setToast({
      title: 'Descarga preparada',
      description: 'La descarga del PDF estará disponible próximamente.',
    })
  }

  const handleReturn = () => {
    setToast({
      title: 'Devolución',
      description: 'Función pendiente: conectar con Vista #16.',
    })
  }

  const handleViewAudit = () => {
    if (sale) navigate('audit', { entity: sale.folio })
  }

  const handleViewProduct = (productId) => {
    if (productId) navigate('product-detail', { id: productId })
  }

  const handleViewCustomer = (customerId) => {
    console.log('Ver cliente', customerId)
  }

  const handleViewCash = () => {
    navigate('cash-current')
  }

  const handleViewMovements = () => {
    navigate('inventory-movements', { productId: sale?.items?.[0]?.productId })
  }

  const handleConfirmCancel = async ({ reason, notes }) => {
    if (!sale) return
    setSubmitting(true)

    try {
      // ✅ await
      await cancelSale(sale.id, {
        reason,
        notes,
        cancelledBy: user?.name || 'Usuario',
      })

      // 🔔 Notificar a los administradores
      notifySaleCancel({
        sale,
        actorName: user?.name || 'Usuario',
        actorRole: user?.role || 'Vendedor',
        reason: reason || notes || 'Sin motivo registrado',
      })

      setSubmitting(false)
      setCancelOpen(false)
      setToast({
        title: 'Venta cancelada',
        description: 'El estado de la venta fue actualizado.',
      })
    } catch (err) {
      console.error('❌ Error cancelando venta:', err)
      setSubmitting(false)
      setToast({
        title: 'Error al cancelar',
        description: err.message || 'Intenta de nuevo.',
      })
    }
  }

  return (
    <DashboardLayout
      activeKey="pos"
      onNavigate={navigate}
      period={undefined}
      onPeriodChange={undefined}
    >
      {loading && <SaleDetailSkeleton />}

      {!loading && notFound && (
        <Card>
          <EmptyState
            icon={Receipt}
            title="Venta no encontrada"
            description={`No pudimos encontrar la venta ${saleId || ''}. Es posible que haya sido eliminada.`}
            action={
              <Button variant="primary" onClick={handleBack}>
                Volver a ventas
              </Button>
            }
          />
        </Card>
      )}

      {!loading && !notFound && sale && (
        <>
          <SaleDetailHeader sale={sale} onBack={handleBack}>
            <SaleDetailActions
              sale={sale}
              onPrint={handlePrint}
              onSend={handleSend}
              onNewSale={handleNewSale}
              onReturn={handleReturn}
              onCancel={() => setCancelOpen(true)}
              onViewAudit={handleViewAudit}
              onDownload={handleDownload}
            />
          </SaleDetailHeader>

          <SaleDetailStats sale={sale} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <SaleDetailItems sale={sale} onViewProduct={handleViewProduct} />
              <SaleDetailSummary sale={sale} />
              <SaleDetailPayments sale={sale} />
              <SaleDetailInventory sale={sale} onViewMovements={handleViewMovements} />
              <SaleDetailAudit sale={sale} onViewAudit={handleViewAudit} />
            </div>

            <aside className="lg:col-span-1 space-y-5 lg:sticky lg:top-20 lg:self-start">
              <SaleDetailInfo sale={sale} />
              <SaleDetailCustomer sale={sale} onViewCustomer={handleViewCustomer} />
              <SaleDetailCash sale={sale} onViewCash={handleViewCash} />
              <SaleDetailReceipt
                sale={sale}
                onPrint={handlePrint}
                onDownload={handleDownload}
                onSend={handleSend}
              />
            </aside>
          </div>
        </>
      )}

      <PosTicketModal
        open={ticketOpen}
        sale={sale}
        width={58}
        onClose={() => setTicketOpen(false)}
        onSendEmail={handleSend}
      />

      <SaleDetailCancelModal
        open={cancelOpen}
        sale={sale}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleConfirmCancel}
        submitting={submitting}
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