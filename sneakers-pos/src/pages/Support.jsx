// src/pages/Support.jsx
import { useState, useEffect, useMemo } from 'react'
import {
  MessageCircle, HelpCircle, AlertTriangle, Bug, Lightbulb,
  Wrench, Shield, ChevronRight, Send, Clock, Terminal,
  ExternalLink, Cpu, Activity, Wifi, WifiOff, Hash,
  Smartphone, Monitor, Copy, Check, Package, Plus, Minus,
  GitCommitHorizontal, Server, Zap,
} from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Toast from '../components/common/Toast'
import { useView } from '../context/ViewContext'
import { useAuth } from '../context/AuthContext'
import { useNetwork } from '../context/NetworkContext'

const WHATSAPP_NUMBER = '3349812319'
const WHATSAPP_COUNTRY = '52'
const APP_VERSION = '2.4.0'
const BUILD_DATE = '2026-09-18'
const BUILD_HASH = 'a7f3c91'

const REASONS = [
  { key: 'bug',        label: 'Algo no funciona',    tag: 'bug',        icon: Bug,           dot: 'bg-rose-400',    desc: 'Errores o comportamientos raros' },
  { key: 'doubt',      label: 'Tengo una duda',      tag: 'question',   icon: HelpCircle,    dot: 'bg-sky-400',     desc: '¿Cómo hago X cosa?' },
  { key: 'suggestion', label: 'Sugerencia',          tag: 'feature',    icon: Lightbulb,     dot: 'bg-violet-400',  desc: 'Ideas para mejorar' },
  { key: 'error_data', label: 'Datos incorrectos',   tag: 'data',       icon: AlertTriangle, dot: 'bg-amber-400',   desc: 'Ventas, stock o precios mal' },
  { key: 'permission', label: 'Permisos de usuario', tag: 'access',     icon: Shield,        dot: 'bg-teal-400',    desc: 'Accesos o roles' },
  { key: 'other',      label: 'Otro',                tag: 'misc',       icon: Wrench,        dot: 'bg-slate-300',   desc: 'Algo distinto' },
]

const CHANGELOG = [
  {
    version: '2.4.0',
    hash: 'a7f3c91',
    date: '18 sep 2026',
    current: true,
    items: [
      { type: 'feat', text: 'Créditos con línea rotativa' },
      { type: 'feat', text: 'Alertas de stock con recordatorios' },
      { type: 'perf', text: 'Realtime en ventas, cajas, créditos y productos' },
    ],
  },
  {
    version: '2.3.0',
    hash: '1d92b40',
    date: '15 sep 2026',
    items: [
      { type: 'feat', text: 'Notificaciones push en iPhone' },
      { type: 'feat', text: 'Las notificaciones abren la venta directa' },
      { type: 'feat', text: 'Descuentos por volumen para mayoristas' },
    ],
  },
  {
    version: '2.2.0',
    hash: '6b0e57d',
    date: '1 sep 2026',
    items: [
      { type: 'perf', text: 'Realtime en ventas' },
      { type: 'fix',  text: 'Reset local por dispositivo' },
    ],
  },
]

const COMMIT_TONES = {
  feat: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/50',
  fix:  'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50',
  perf: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900/50',
}

const FAQ = [
  {
    key: 'caja.abrir',
    q: '¿Cómo abro la caja al iniciar el día?',
    a: 'Ve a "Apertura de caja" en el menú lateral. Ingresa el fondo inicial y presiona "Abrir caja". Al terminar el día, usa "Cierre de caja".',
  },
  {
    key: 'ventas.credito',
    q: '¿Cómo registro una venta a crédito?',
    a: 'En el Punto de Venta asigna un cliente mayorista con crédito habilitado y al cobrar selecciona el método "Crédito". El sistema valida el saldo disponible.',
  },
  {
    key: 'push.activar',
    q: '¿Cómo activo las notificaciones?',
    a: 'En iPhone primero instala la app: Safari → Compartir → Añadir a pantalla de inicio. En Android abre la campanita y presiona "Activar push".',
  },
  {
    key: 'sync.dispositivos',
    q: 'No veo mis datos en otro dispositivo',
    a: 'Cada dispositivo guarda su propia copia local. Si no se sincroniza, entra a Configuración → Reset local para forzar la sincronización.',
  },
]

export default function Support() {
  const { navigate } = useView()
  const { user } = useAuth()
  const { isOnline } = useNetwork()

  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [openFaq, setOpenFaq] = useState(null)
  const [toast, setToast] = useState(null)
  const [copied, setCopied] = useState(false)
  const [uptime, setUptime] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const timer = setInterval(() => {
      setUptime(Math.floor((Date.now() - start) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleNavigate = (key) => navigate(key)

  const ticketId = useMemo(() => {
    const n = Math.floor(1000 + Math.random() * 9000)
    return `TKT-${n}`
  }, [])

  const device = useMemo(() => {
    if (typeof navigator === 'undefined') return { label: '—', icon: Monitor }
    const ua = navigator.userAgent
    if (/iPhone|iPad|iPod/.test(ua)) return { label: 'iPhone / iPad', icon: Smartphone }
    if (/Android/.test(ua)) return { label: 'Android', icon: Smartphone }
    return { label: 'Computadora', icon: Monitor }
  }, [])

  const fmtUptime = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0')
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
    const sec = String(s % 60).padStart(2, '0')
    return `${h}:${m}:${sec}`
  }

  const selected = REASONS.find((r) => r.key === reason)

  const handleWhatsApp = () => {
    if (!reason) {
      setToast({
        title: 'Falta el motivo',
        description: 'Elige una etiqueta antes de enviar el ticket.',
        error: true,
      })
      return
    }

    const message = [
      `*Ticket ${ticketId} · SNEAKERS POS*`,
      ``,
      `usuario:     ${user?.name || 'Usuario'}`,
      `rol:         ${user?.role || '—'}`,
      `email:       ${user?.email || '—'}`,
      `dispositivo: ${device.label}`,
      `version:     ${APP_VERSION} (${BUILD_HASH})`,
      `conexion:    ${isOnline ? 'online' : 'offline'}`,
      ``,
      `etiqueta:    ${selected?.tag || 'misc'} — ${selected?.label || 'Consulta'}`,
      ``,
      `${description.trim() || '(sin descripción)'}`,
      ``,
      `_Enviado desde biomey.mx_`,
    ].join('\n')

    const url = `https://wa.me/${WHATSAPP_COUNTRY}${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')

    setToast({
      title: `Ticket ${ticketId} listo`,
      description: 'Completa el envío desde WhatsApp.',
    })
  }

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(`+${WHATSAPP_COUNTRY} ${WHATSAPP_NUMBER}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      setToast({
        title: 'Número copiado',
        description: `+${WHATSAPP_COUNTRY} ${WHATSAPP_NUMBER}`,
      })
    } catch {
      setToast({
        title: 'No se pudo copiar',
        description: 'Copia el número manualmente.',
        error: true,
      })
    }
  }

  return (
    <DashboardLayout
      activeKey="support"
      onNavigate={handleNavigate}
      period={undefined}
      onPeriodChange={undefined}
    >
      {/* ruta tipo path */}
      <nav className="flex items-center gap-1.5 text-xs font-mono mb-5 text-gray-400 dark:text-dark-muted">
        <span>sistema</span>
        <span className="text-gray-300 dark:text-dark-border">/</span>
        <span className="text-brand-black dark:text-dark-text">soporte</span>
      </nav>

      {/* ── Consola de bienvenida ──────────────────────────────────── */}
      <Card className="!p-0 overflow-hidden mb-4">
        {/* barra tipo editor */}
        <div className="flex items-center gap-2 px-4 h-10 bg-slate-50 dark:bg-dark-surface border-b border-slate-200 dark:border-dark-border">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
          <span className="ml-2 text-xs font-mono text-gray-400 dark:text-dark-muted">
            soporte.biomey.mx
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-mono text-gray-400 dark:text-dark-muted">
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {isOnline ? 'conectado' : 'sin red'}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 p-6 lg:p-8 bg-white dark:bg-dark-card">
            <p className="text-xs font-mono text-sky-600 dark:text-sky-400 mb-3">
              <span className="text-gray-300 dark:text-dark-border">$</span> soporte --nuevo-ticket
            </p>

            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
              ¿En qué podemos ayudarte?
            </h1>
            <p className="text-sm text-gray-600 dark:text-dark-muted mt-2.5 max-w-md leading-relaxed">
              Reporta un problema, resuelve una duda o propón una mejora.
              Armamos el reporte con los datos de tu sesión y lo enviamos por WhatsApp.
            </p>

            <div className="flex flex-wrap gap-2 mt-6">
              <Chip icon={Package} text={`v${APP_VERSION}`} />
              <Chip icon={Hash} text={BUILD_HASH} />
              <Chip icon={Clock} text="SLA 24 h" />
              <Chip icon={Server} text={`build ${BUILD_DATE}`} />
            </div>
          </div>

          {/* endpoint de contacto */}
          <div className="lg:w-72 shrink-0 p-6 bg-emerald-50/60 dark:bg-emerald-950/20 border-t lg:border-t-0 lg:border-l border-emerald-100 dark:border-emerald-900/40">
            <p className="text-xs font-mono text-emerald-700/70 dark:text-emerald-400/70">
              canal de soporte
            </p>
            <div className="flex items-center gap-2 mt-1">
              <MessageCircle size={16} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2.2} />
              <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                WhatsApp
              </span>
            </div>

            <p className="text-xl font-mono font-bold text-emerald-900 dark:text-emerald-200 tracking-tight mt-4">
              +{WHATSAPP_COUNTRY} {WHATSAPP_NUMBER}
            </p>
            <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70 mt-1">
              Único medio de atención
            </p>

            <div className="flex gap-2 mt-4">
              <a
                href={`https://wa.me/${WHATSAPP_COUNTRY}${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex-1 inline-flex items-center justify-center gap-1.5
                  h-9 rounded-lg text-xs font-semibold
                  bg-emerald-600 text-white hover:bg-emerald-700
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
                  transition-colors
                "
              >
                <ExternalLink size={12} strokeWidth={2.2} />
                Abrir chat
              </a>
              <button
                onClick={handleCopyNumber}
                className="
                  inline-flex items-center justify-center gap-1.5
                  h-9 px-3 rounded-lg text-xs font-semibold
                  bg-white dark:bg-dark-card text-emerald-700 dark:text-emerald-300
                  border border-emerald-200 dark:border-emerald-900/50
                  hover:bg-emerald-50 dark:hover:bg-emerald-950/40
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
                  transition-colors
                "
              >
                {copied ? <Check size={12} strokeWidth={2.4} /> : <Copy size={12} strokeWidth={2.2} />}
                {copied ? 'Listo' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Barra de estado ────────────────────────────────────────── */}
      <Card className="!py-4 mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-dark-border">
          <StatCell
            icon={isOnline ? Wifi : WifiOff}
            label="conexión"
            value={isOnline ? 'online' : 'offline'}
            tone={isOnline ? 'ok' : 'warn'}
          />
          <StatCell
            icon={Zap}
            label="sincronización"
            value={isOnline ? 'realtime' : 'en pausa'}
            tone={isOnline ? 'ok' : 'warn'}
            pad
          />
          <StatCell icon={device.icon} label="dispositivo" value={device.label} pad />
          <StatCell icon={Cpu} label="sesión" value={fmtUptime(uptime)} pad />
        </div>
      </Card>

      {/* ── Ticket ─────────────────────────────────────────────────── */}
      <Card className="!p-0 overflow-hidden mb-6">
        <div className="flex items-center gap-2 px-5 h-11 bg-slate-50 dark:bg-dark-surface border-b border-slate-200 dark:border-dark-border">
          <Terminal size={14} className="text-gray-400" strokeWidth={2} />
          <span className="text-xs font-mono text-gray-500 dark:text-dark-muted">
            nuevo ticket
          </span>
          <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded-md bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-sky-600 dark:text-sky-400">
            {ticketId}
          </span>
        </div>

        <div className="p-5 lg:p-6">
          {/* Etiqueta */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-brand-black dark:text-dark-text mb-1">
              Elige una etiqueta
            </p>
            <p className="text-xs text-gray-500 dark:text-dark-muted mb-3">
              Nos sirve para canalizarlo con la persona correcta.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {REASONS.map(({ key, label, tag, icon: Icon, dot, desc }) => {
                const active = reason === key
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setReason(key)}
                    className={`
                      flex items-start gap-3 p-3.5 rounded-xl border text-left
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300
                      transition-colors
                      ${active
                        ? 'bg-sky-50 dark:bg-sky-950/30 border-sky-300 dark:border-sky-800'
                        : 'bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-surface'}
                    `}
                  >
                    <Icon
                      size={17}
                      strokeWidth={2}
                      className={`mt-0.5 shrink-0 ${
                        active ? 'text-sky-600 dark:text-sky-400' : 'text-gray-400 dark:text-dark-muted'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${
                          active ? 'text-sky-800 dark:text-sky-300' : 'text-brand-black dark:text-dark-text'
                        }`}>
                          {label}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-400 dark:text-dark-muted">
                          <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                          {tag}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
                        {desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <label
              htmlFor="support-description"
              className="block text-sm font-semibold text-brand-black dark:text-dark-text mb-1"
            >
              Describe el problema
            </label>
            <p className="text-xs text-gray-500 dark:text-dark-muted mb-3">
              Escribe los pasos que hiciste antes de que fallara. Mientras más detalle, más rápido lo resolvemos.
            </p>

            <div className="relative">
              <textarea
                id="support-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={'1. Entré al Punto de Venta\n2. Agregué 3 productos\n3. Al cobrar con tarjeta marcó error\n4. Recargué la página y siguió igual'}
                rows={6}
                maxLength={800}
                className="
                  w-full px-3.5 py-3 pb-7 rounded-xl text-sm font-mono resize-none leading-relaxed
                  bg-slate-50 dark:bg-dark-surface text-brand-black dark:text-dark-text
                  border border-slate-200 dark:border-dark-border
                  focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/40
                  focus:bg-white dark:focus:bg-dark-card
                  outline-none placeholder:text-gray-400 dark:placeholder:text-dark-muted
                  transition-colors
                "
              />
              <span className="absolute bottom-2.5 right-3.5 text-[11px] font-mono text-gray-400 dark:text-dark-muted">
                {description.length}/800
              </span>
            </div>
          </div>

          {/* Payload */}
          {reason && (
            <div className="mb-6 rounded-xl border border-slate-200 dark:border-dark-border overflow-hidden">
              <div className="flex items-center gap-2 px-3.5 h-9 bg-slate-50 dark:bg-dark-surface border-b border-slate-200 dark:border-dark-border">
                <span className="text-[11px] font-mono text-gray-400 dark:text-dark-muted">
                  así se enviará
                </span>
              </div>
              <pre className="p-4 text-xs font-mono bg-white dark:bg-dark-card text-gray-700 dark:text-dark-text whitespace-pre-wrap leading-relaxed">
{`ticket:      ${ticketId}
usuario:     ${user?.name || '—'}
rol:         ${user?.role || '—'}
dispositivo: ${device.label}
version:     ${APP_VERSION} (${BUILD_HASH})
etiqueta:    ${selected?.tag || '—'} — ${selected?.label || '—'}

${description.trim() || '(sin descripción)'}`}
              </pre>
            </div>
          )}

          <Button
            variant="primary"
            icon={Send}
            onClick={handleWhatsApp}
            disabled={!reason}
            className="w-full !h-11"
          >
            Enviar ticket por WhatsApp
          </Button>
        </div>
      </Card>

      {/* ── Changelog + FAQ ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Changelog */}
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <GitCommitHorizontal size={16} className="text-gray-400" strokeWidth={2} />
            <h2 className="text-base font-bold text-brand-black dark:text-dark-text">
              Novedades de la app
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-dark-muted mb-5">
            Lo que agregamos en las últimas versiones.
          </p>

          <div className="space-y-5">
            {CHANGELOG.map((entry) => (
              <div key={entry.version}>
                <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                  <span className="text-sm font-mono font-bold text-brand-black dark:text-dark-text">
                    v{entry.version}
                  </span>
                  <span className="text-[11px] font-mono text-gray-400 dark:text-dark-muted">
                    {entry.hash}
                  </span>
                  {entry.current && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      en uso
                    </span>
                  )}
                  <span className="text-xs text-gray-400 dark:text-dark-muted ml-auto">
                    {entry.date}
                  </span>
                </div>

                <ul className="space-y-2 pl-3 border-l-2 border-slate-100 dark:border-dark-border">
                  {entry.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${COMMIT_TONES[item.type]}`}>
                        {item.type}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-dark-muted leading-snug">
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* FAQ */}
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle size={16} className="text-gray-400" strokeWidth={2} />
            <h2 className="text-base font-bold text-brand-black dark:text-dark-text">
              Preguntas frecuentes
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-dark-muted mb-5">
            Quizá tu duda ya está resuelta aquí.
          </p>

          <div className="divide-y divide-slate-100 dark:divide-dark-border border-y border-slate-100 dark:border-dark-border">
            {FAQ.map((item, idx) => {
              const open = openFaq === idx
              return (
                <div key={item.key}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? null : idx)}
                    className="
                      w-full flex items-center justify-between gap-3 py-3.5 text-left
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 rounded-md
                    "
                  >
                    <span className="min-w-0">
                      <span className="block text-[11px] font-mono text-sky-600 dark:text-sky-400">
                        {item.key}
                      </span>
                      <span className="block text-sm font-medium text-brand-black dark:text-dark-text mt-0.5">
                        {item.q}
                      </span>
                    </span>
                    {open
                      ? <Minus size={15} className="shrink-0 text-sky-600 dark:text-sky-400" strokeWidth={2.2} />
                      : <Plus size={15} className="shrink-0 text-gray-400" strokeWidth={2.2} />}
                  </button>

                  {open && (
                    <p className="text-sm text-gray-600 dark:text-dark-muted leading-relaxed pb-4 pr-6">
                      {item.a}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* ── Pie ────────────────────────────────────────────────────── */}
      <div className="text-center py-6">
        <p className="text-xs font-mono text-gray-500 dark:text-dark-muted">
          sneakers-pos@{APP_VERSION} · build {BUILD_HASH} ·{' '}
          <span className="text-brand-blue font-semibold">biomey</span>
        </p>
        <p className="text-xs text-gray-400 dark:text-dark-muted mt-1">
          © {new Date().getFullYear()} BIOMEY
        </p>
      </div>

      <Toast
        open={!!toast}
        variant={toast?.error ? 'error' : 'success'}
        title={toast?.title}
        description={toast?.description}
        onClose={() => setToast(null)}
      />
    </DashboardLayout>
  )
}

/* ------------------------------------------------------------------ */
/* Subcomponentes                                                     */
/* ------------------------------------------------------------------ */

function Chip({ icon: Icon, text }) {
  return (
    <span className="
      inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg
      text-[11px] font-mono
      bg-slate-50 dark:bg-dark-surface
      text-gray-600 dark:text-dark-muted
      border border-slate-200 dark:border-dark-border
    ">
      <Icon size={12} strokeWidth={2} className="text-gray-400" />
      {text}
    </span>
  )
}

function StatCell({ icon: Icon, label, value, tone = 'neutral', pad = false }) {
  const tones = {
    ok: 'text-emerald-600 dark:text-emerald-400',
    warn: 'text-amber-600 dark:text-amber-400',
    neutral: 'text-brand-black dark:text-dark-text',
  }
  return (
    <div className={`pt-4 lg:pt-0 ${pad ? 'lg:pl-4' : ''}`}>
      <span className="flex items-center gap-1.5 text-[11px] font-mono text-gray-400 dark:text-dark-muted">
        <Icon size={12} strokeWidth={2} />
        {label}
      </span>
      <p className={`text-sm font-mono font-semibold mt-1 truncate ${tones[tone]}`}>
        {value}
      </p>
    </div>
  )
}