// src/components/credits/CreditDetailDrawer.jsx
import { useMemo, useState } from 'react'
import {
  X, HandCoins, AlertTriangle, CheckCircle2, Clock, Ban,
  User, Calendar, Trash2, ShoppingCart, Printer
} from 'lucide-react'
import Badge from '../common/Badge'
import Button from '../common/Button'
import { useSales } from '../../context/SalesContext'
import { printReceipt } from '../../services/printerService'

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 2 })}`
const fmtDate = (iso) => !iso ? '—' : new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
const fmtDateTime = (iso) => !iso ? '—' : new Date(iso).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const STATUS_CONFIG = {
  active:    { label: 'Activo',    variant: 'info',    icon: Clock },
  overdue:   { label: 'Vencido',   variant: 'danger',  icon: AlertTriangle },
  paid:      { label: 'Pagado',    variant: 'success', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', variant: 'neutral', icon: Ban },
}

export default function CreditDetailDrawer({ open, credit, onClose, onPay, onCancel, onViewCustomer }) {
  const { sales } = useSales()
  const [printingId, setPrintingId] = useState(null)

  const charges = useMemo(() => {
    if (!open || !credit) return []
    const createdAt = new Date(credit.createdAt).getTime()
    return sales
      .filter((s) => s.customerId === credit.customerId && s.payment?.method === 'credit' && s.status !== 'cancelled' && new Date(s.createdAt).getTime() >= createdAt)
      .map((s) => ({
        id: s.id, folio: s.folio, amount: Number(s.total) || 0, createdAt: s.createdAt, type: 'charge'
      }))
  }, [open, credit, sales])

  const payments = useMemo(() => {
    if (!open || !credit) return []
    const raw = Array.isArray(credit.payments) ? credit.payments : []
    return raw.map((p) => ({ ...p, type: 'payment' }))
  }, [open, credit])

  const timeline = useMemo(() => {
    return [...charges, ...payments].sort((a, b) => new Date(b.createdAt || b.paidAt) - new Date(a.createdAt || a.paidAt))
  }, [charges, payments])

  const handlePrintPayment = async (payment) => {
    try {
      setPrintingId(payment.id)
      const amountPaid = Number(payment.amount) || 0
      const outstandingBefore = Number(payment.previousOutstanding) || (Number(credit.outstanding) + amountPaid)
      const outstandingAfter = outstandingBefore - amountPaid

      await printReceipt({
        folio: `AB-${payment.id.slice(-6).toUpperCase()}`,
        createdAt: payment.paidAt || new Date().toISOString(),
        cashier: credit.customerName,
        isCreditPayment: true,
        total: amountPaid,
        totals: { subtotal: amountPaid },
        items: [{ productName: `Abono a crédito: ${credit.customerName}`, quantity: 1, price: amountPaid }],
        payment: { method: payment.method, amountPaid, previousOutstanding: outstandingBefore, newOutstanding: outstandingAfter },
        ticketHeader: { name: 'SNEAKER TAP', tagline: 'Recibo de Abono' },
        ticketFooter: { thankYouMessage: '¡Gracias por su pago!', name: 'SNEAKER TAP' },
        ticketOptions: { showNumber: true, showDate: true, showTime: true, showSeller: false, showCustomer: true }
      })
    } catch (error) {
      alert('No se pudo imprimir el ticket.')
    } finally {
      setPrintingId(null)
    }
  }

  if (!open || !credit) return null
  const cfg = STATUS_CONFIG[credit.status] || STATUS_CONFIG.active
  const StatusIcon = cfg.icon
  const canPay = (credit.status === 'active' || credit.status === 'overdue') && (credit.outstanding > 0)
  const canCancel = credit.status === 'active' && credit.used === 0

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="flex-1" onClick={onClose} />
      <div className="w-full max-w-lg h-full flex flex-col bg-white dark:bg-dark-card border-l border-gray-200 dark:border-dark-border shadow-2xl">
        
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold truncate">{credit.customerName}</h3>
            <div className="mt-1"><Badge variant={cfg.variant}><StatusIcon size={11} /> {cfg.label}</Badge></div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-brand-black ml-2"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-5 border-b border-gray-100">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="text-center p-2 rounded-lg bg-gray-50"><p className="text-[10px] text-gray-400 uppercase">Límite</p><p className="text-sm font-bold">{fmt(credit.amount)}</p></div>
              <div className="text-center p-2 rounded-lg bg-amber-50"><p className="text-[10px] text-amber-600 uppercase">Usado</p><p className="text-sm font-bold text-amber-700">{fmt(credit.used)}</p></div>
              <div className="text-center p-2 rounded-lg bg-emerald-50"><p className="text-[10px] text-emerald-600 uppercase">Pagado</p><p className="text-sm font-bold text-emerald-700">{fmt(credit.paidAmount)}</p></div>
              <div className="text-center p-2 rounded-lg bg-blue-50"><p className="text-[10px] text-brand-blue uppercase">Disponible</p><p className="text-sm font-bold text-brand-blueDark">{fmt(credit.available)}</p></div>
            </div>
            {credit.outstanding > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 flex justify-between items-center">
                <span className="text-xs text-amber-800 font-medium">Deuda pendiente</span>
                <span className="text-base font-bold text-amber-900">{fmt(credit.outstanding)}</span>
              </div>
            )}
          </div>

          <div className="p-5">
            <h4 className="text-sm font-semibold mb-3">Historial de movimientos</h4>
            {timeline.length === 0 ? <p className="text-xs text-gray-500">Sin movimientos.</p> : (
              <ul className="space-y-2">
                {timeline.map((item) => {
                  if (item.type === 'charge') {
                    return (
                      <li key={`charge-${item.id}`} className="flex items-center gap-3 p-3 rounded-lg border border-red-100 bg-red-50/40">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0"><ShoppingCart size={14} className="text-brand-red" /></div>
                        <div><p className="text-sm font-semibold text-brand-red">- {fmt(item.amount)}</p><p className="text-[10px] text-gray-500">{fmtDateTime(item.createdAt)}</p></div>
                      </li>
                    )
                  }
                  return (
                    <li key={`payment-${item.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border border-emerald-100 bg-emerald-50/40">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0"><HandCoins size={14} className="text-emerald-600" /></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-emerald-600">+ {fmt(item.amount)}</p>
                          <p className="text-[10px] text-gray-500">{fmtDateTime(item.paidAt)}</p>
                        </div>
                      </div>
                      <button onClick={() => handlePrintPayment(item)} disabled={printingId === item.id} className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition-colors shrink-0 disabled:opacity-50">
                        {printingId === item.id ? <div className="w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" /> : <><Printer size={14} /> Imprimir</>}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 shrink-0 space-y-2">
          {canPay && <Button variant="primary" icon={HandCoins} className="w-full" onClick={() => onPay?.(credit)}>Abonar</Button>}
          <div className="flex gap-2">
            <Button variant="secondary" icon={User} className="flex-1" onClick={() => onViewCustomer?.(credit)}>Ver cliente</Button>
            {canCancel && <Button variant="danger" icon={Trash2} onClick={() => onCancel?.(credit)}>Cancelar</Button>}
          </div>
        </div>
      </div>
    </div>
  )
}