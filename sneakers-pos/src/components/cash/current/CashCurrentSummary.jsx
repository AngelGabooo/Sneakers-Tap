import { Plus, Minus, Wallet } from 'lucide-react'
import Card from '../../common/Card'

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 2 })}`

export default function CashCurrentSummary({ summary }) {
  const {
    initialFund = 0,
    cashSales = 0,
    cashIn = 0,
    cashOut = 0,
    expectedCash = 0,
  } = summary || {}

  return (
    <Card>
      <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text mb-4">
        Resumen de caja
      </h2>

      <ul className="space-y-3">
        <Row icon={Wallet} label="Fondo inicial"    value={fmt(initialFund)} />
        <Row icon={Plus}   label="Ventas en efectivo" value={`+${fmt(cashSales)}`} tone="info" />
        <Row icon={Plus}   label="Entradas de efectivo" value={`+${fmt(cashIn)}`} tone="info" />
        <Row icon={Minus}  label="Retiros de efectivo"  value={`-${fmt(cashOut)}`} tone="danger" />
      </ul>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-gray-600 dark:text-dark-muted">
          Efectivo esperado
        </span>
        <span className="text-lg font-bold text-brand-black dark:text-dark-text">
          {fmt(expectedCash)}
        </span>
      </div>

      <p className="mt-3 text-[11px] text-gray-400 dark:text-dark-muted">
        Fondo inicial + ventas en efectivo + entradas − retiros = efectivo esperado.
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