import { DollarSign, Wallet, ArrowDownToLine, ArrowUpFromLine, RotateCcw } from 'lucide-react'
import Card from '../../common/Card'

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX')}`

export default function CashCloseSummary({ summary }) {
  const {
    initialFund = 0,
    cashSales = 0,
    cashIn = 0,
    cashOut = 0,
    refunds = 0,
    expectedCash = 0,
  } = summary || {}

  return (
    <Card>
      <header className="mb-4">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Resumen de la jornada
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Cálculo del efectivo esperado en caja.
        </p>
      </header>

      <ul className="space-y-3">
        <Row icon={Wallet}         label="Fondo inicial"        value={fmt(initialFund)} />
        <Row icon={DollarSign}     label="Ventas en efectivo"   value={`+${fmt(cashSales)}`} tone="info" />
        <Row icon={ArrowDownToLine} label="Entradas de efectivo" value={`+${fmt(cashIn)}`} tone="info" />
        <Row icon={ArrowUpFromLine} label="Retiros de efectivo"  value={`-${fmt(cashOut)}`} tone="danger" />
        <Row icon={RotateCcw}      label="Reembolsos en efectivo" value={`-${fmt(refunds)}`} tone={refunds ? 'danger' : 'neutral'} />
      </ul>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-gray-600 dark:text-dark-muted">
          Efectivo esperado
        </span>
        <span className="text-xl font-bold text-brand-black dark:text-dark-text">
          {fmt(expectedCash)}
        </span>
      </div>

      <p className="mt-3 text-[11px] text-gray-400 dark:text-dark-muted">
        Fondo inicial + ventas en efectivo + entradas − retiros − reembolsos en efectivo = efectivo esperado.
      </p>
    </Card>
  )
}

function Row({ icon: Icon, label, value, tone = 'neutral' }) {
  const tones = {
    neutral: 'text-brand-black dark:text-dark-text',
    info:    'text-emerald-600 dark:text-emerald-400',
    danger:  'text-brand-red',
  }
  return (
    <li className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-gray-500 dark:text-dark-muted">
        <Icon size={13} strokeWidth={2} />
        {label}
      </span>
      <span className={`font-semibold ${tones[tone]}`}>{value}</span>
    </li>
  )
}