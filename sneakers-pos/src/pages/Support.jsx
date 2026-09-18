// src/pages/Support.jsx
import { useState, useEffect, useMemo } from 'react'
import {
  MessageCircle, HelpCircle, AlertTriangle, Bug, Lightbulb,
  Wrench, Shield, ChevronRight, Send, Clock, Zap, Headphones,
  ExternalLink, Terminal, Cpu, Activity, CheckCircle2, Wifi,
  Smartphone, Monitor, Copy, Check, GitBranch, Rocket,
  Package, Database, Server, CircleDot,
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
const GITHUB_URL = 'https://github.com/biomey/sneakers-pos'

const REASONS = [
  { key: 'bug',        label: 'Algo no funciona',      icon: Bug,           desc: 'Errores o comportamientos raros' },
  { key: 'doubt',      label: 'Tengo una duda',        icon: HelpCircle,    desc: '¿Cómo hago X cosa?' },
  { key: 'suggestion', label: 'Sugerencia',            icon: Lightbulb,     desc: 'Ideas para mejorar' },
  { key: 'error_data', label: 'Datos incorrectos',     icon: AlertTriangle, desc: 'Ventas, stock o precios mal' },
  { key: 'permission', label: 'Permisos de usuario',   icon: Shield,        desc: 'Accesos o roles' },
  { key: 'other',      label: 'Otro',                  icon: Wrench,        desc: 'Algo distinto' },
]

const CHANGELOG = [
  {
    version: '2.4.0',
    date: '2026-09-18',
    tag: 'current',
    items: [
      'Sistema de créditos con línea rotativa',
      'Alertas de stock automáticas con recordatorios',
      'Realtime en ventas, cajas, créditos y productos',
    ],
  },
  {
    version: '2.3.0',
    date: '2026-09-15',
    tag: 'stable',
    items: [
      'Notificaciones push en iOS (PWA)',
      'Deep links a ventas desde notificaciones',
      'Descuentos por volumen para mayoristas',
    ],
  },
  {
    version: '2.2.0',
    date: '2026-09-01',
    tag: 'old',
    items: [
      'Realtime en ventas',
      'Sistema de reset local por dispositivo',
    ],
  },
]

const FAQ = [
  {
    q: '¿Cómo abro la caja al iniciar el día?',
    a: 'Ve a "Apertura de caja" en el menú lateral. Ingresa el fondo inicial y presiona "Abrir caja". Al terminar el día, usa "Cierre de caja".',
    tag: 'caja',
  },
  {
    q: '¿Cómo registro una venta a crédito?',
    a: 'En el Punto de Venta, asigna un cliente mayorista con crédito habilitado y al cobrar selecciona el método "Crédito". El sistema valida el saldo disponible.',
    tag: 'créditos',
  },
  {
    q: '¿Cómo activo las notificaciones push?',
    a: 'En iPhone debes instalar la app (Safari → Compartir → Añadir a pantalla de inicio). En Android abre la campanita y presiona "Activar push".',
    tag: 'notificaciones',
  },
  {
    q: '¿Por qué no veo mis datos en otro dispositivo?',
    a: 'Cada dispositivo tiene su copia local. Si no se sincroniza, ve a Configuración → Reset local para forzar la sincronización.',
    tag: 'sincronización',
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

  // ⭐ Uptime en vivo
  useEffect(() => {
    const start = Date.now()
    const timer = setInterval(() => {
      setUptime(Math.floor((Date.now() - start) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleNavigate = (key) => navigate(key)

  const device = useMemo(() => {
    if (typeof navigator === 'undefined') return { type: 'unknown', label: '—', icon: Monitor }
    const ua = navigator.userAgent
    if (/iPhone|iPad|iPod/.test(ua)) return { type: 'ios', label: 'iPhone / iPad', icon: Smartphone }
    if (/Android/.test(ua)) return { type: 'android', label: 'Android', icon: Smartphone }
    return { type: 'desktop', label: 'Desktop', icon: Monitor }
  }, [])

  const fmtUptime = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0')
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
    const sec = String(s % 60).padStart(2, '0')
    return `${h}:${m}:${sec}`
  }

  const handleWhatsApp = () => {
    if (!reason) {
      setToast({
        title: '⚠️ Selecciona un motivo',
        description: 'Necesitamos saber qué tipo de problema tienes.',
      })
      return
    }

    const reasonLabel = REASONS.find((r) => r.key === reason)?.label || 'Consulta'
    const userName = user?.name || 'Usuario'
    const userRole = user?.role || '—'
    const userEmail = user?.email || '—'

    const message = [
      `*🎫 Ticket de Soporte BIOMEY*`,
      ``,
      `*═══ SESIÓN ═══*`,
      `Usuario: ${userName}`,
      `Rol: ${userRole}`,
      `Email: ${userEmail}`,
      `Dispositivo: ${device.label}`,
      `App: v${APP_VERSION}`,
      ``,
      `*═══ REPORTE ═══*`,
      `Motivo: ${reasonLabel}`,
      ``,
      `${description.trim() || '(sin descripción)'}`,
      ``,
      `_Enviado desde SNEAKERS POS · biomey.mx_`,
    ].join('\n')

    const url = `https://wa.me/${WHATSAPP_COUNTRY}${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')

    setToast({
      title: '✅ Abriendo WhatsApp',
      description: 'Completa el envío en la app.',
    })
  }

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(`+${WHATSAPP_COUNTRY} ${WHATSAPP_NUMBER}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      setToast({
        title: '📋 Número copiado',
        description: `+${WHATSAPP_COUNTRY} ${WHATSAPP_NUMBER}`,
      })
    } catch {
      setToast({
        title: '⚠️ No se pudo copiar',
        description: 'Copia el número manualmente.',
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
      <nav className="flex items-center gap-1.5 text-sm mb-5 text-gray-500 dark:text-dark-muted">
        <span>Sistema</span>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-brand-black dark:text-dark-text font-medium">Soporte técnico</span>
      </nav>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* HERO TERMINAL                                                 */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <Card className="!p-0 overflow-hidden mb-6">
        <div className="relative bg-[#0a0e27]">
          {/* Grid background */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '32px 32px',
            }}
          />

          {/* Glow top right */}
          <div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }}
          />

          {/* Contenido */}
          <div className="relative p-6 lg:p-8">
            {/* Barra de ventana */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 flex items-center justify-center gap-2 text-[10px] font-mono text-blue-300/60">
                <Terminal size={11} />
                <span>biomey@sneakers:~/support</span>
              </div>
              <div className="text-[10px] font-mono text-blue-300/60">v{APP_VERSION}</div>
            </div>

            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="min-w-0 flex-1">
                {/* Línea de comando */}
                <div className="font-mono text-sm mb-3 flex items-center gap-2">
                  <span className="text-green-400">$</span>
                  <span className="text-blue-300">biomey --version</span>
                </div>

                <div className="font-mono text-[11px] text-blue-300/70 mb-4 leading-relaxed">
                  <p>→ BIOMEY POS Suite</p>
                  <p>→ Support Service: <span className="text-green-400">● online</span></p>
                  <p>→ Uptime: {fmtUptime(uptime)}</p>
                </div>

                {/* Título BIOMEY gigante */}
                <div className="mb-4">
                  <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-blue-400/80 mb-1 font-mono">
                    ~ desarrollado por ~
                  </p>
                  <h1
                    className="text-5xl lg:text-7xl font-black tracking-tighter leading-none bg-clip-text text-transparent"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #60a5fa 50%, #a78bfa 100%)',
                    }}
                  >
                    BIOMEY
                  </h1>
                  <p className="text-sm font-mono text-blue-300/80 mt-2">
                    // soporte técnico especializado
                  </p>
                </div>

                <p className="text-sm text-blue-100/90 max-w-lg leading-relaxed">
                  Estamos aquí para resolver cualquier duda, bug o mejora sobre tu punto de venta SNEAKERS.
                </p>
              </div>

              {/* Icono decorativo */}
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center shrink-0 ring-1 ring-blue-400/30">
                <Headphones size={48} className="text-blue-300" strokeWidth={1.5} />
              </div>
            </div>

            {/* Status pills */}
            <div className="flex flex-wrap gap-2 mt-6">
              <StatusPill
                icon={isOnline ? Wifi : Activity}
                label={isOnline ? 'Sistema en línea' : 'Modo offline'}
                tone={isOnline ? 'green' : 'amber'}
              />
              <StatusPill icon={Clock} label="Respuesta <24h" tone="blue" />
              <StatusPill icon={Shield} label="Actualizaciones incluidas" tone="purple" />
              <StatusPill icon={Package} label={`Build ${BUILD_DATE}`} tone="gray" />
            </div>
          </div>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SISTEMA + SESIÓN                                              */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Status del sistema */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Server size={16} className="text-brand-blue" strokeWidth={2.2} />
            <h3 className="text-sm font-bold text-brand-black dark:text-dark-text">
              Estado del sistema
            </h3>
          </div>
          <ul className="space-y-2.5">
            <StatusRow label="Conexión" value={isOnline ? 'Online' : 'Offline'} ok={isOnline} />
            <StatusRow label="Base de datos" value="Supabase" ok={isOnline} />
            <StatusRow label="Realtime" value={isOnline ? 'Activo' : 'Inactivo'} ok={isOnline} />
            <StatusRow label="Push notif." value="Configurado" ok />
          </ul>
        </Card>

        {/* Sesión actual */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Cpu size={16} className="text-brand-blue" strokeWidth={2.2} />
            <h3 className="text-sm font-bold text-brand-black dark:text-dark-text">
              Sesión actual
            </h3>
          </div>
          <ul className="space-y-2.5">
            <InfoRow icon={device.icon} label="Dispositivo" value={device.label} />
            <InfoRow icon={Shield} label="Rol" value={user?.role || '—'} />
            <InfoRow icon={Activity} label="Uptime" value={fmtUptime(uptime)} mono />
            <InfoRow icon={Package} label="App" value={`v${APP_VERSION}`} mono />
          </ul>
        </Card>

        {/* WhatsApp destacado */}
        <Card className="border-green-200 dark:border-green-900/50 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle size={16} className="text-green-600 dark:text-green-400" strokeWidth={2.4} />
            <h3 className="text-sm font-bold text-green-900 dark:text-green-300">
              Canal oficial
            </h3>
          </div>
          <p className="text-xs text-green-800 dark:text-green-400/80 mb-3">
            Único medio de contacto para soporte.
          </p>

          <div className="rounded-lg bg-white dark:bg-green-950/40 p-3 mb-3 ring-1 ring-green-200 dark:ring-green-900/50">
            <p className="text-[10px] font-mono text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">
              WhatsApp
            </p>
            <p className="text-lg font-black text-green-900 dark:text-green-200 tracking-tight">
              +{WHATSAPP_COUNTRY} {WHATSAPP_NUMBER}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopyNumber}
              className="
                flex-1 inline-flex items-center justify-center gap-1.5
                h-9 rounded-lg text-xs font-semibold
                bg-white dark:bg-green-950/40
                text-green-700 dark:text-green-300
                hover:bg-green-100 dark:hover:bg-green-950/60
                ring-1 ring-green-200 dark:ring-green-900/50
                transition-colors
              "
            >
              {copied ? <Check size={12} strokeWidth={2.4} /> : <Copy size={12} strokeWidth={2.4} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_COUNTRY}${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex-1 inline-flex items-center justify-center gap-1.5
                h-9 rounded-lg text-xs font-bold
                bg-green-600 text-white
                hover:bg-green-700
                transition-colors
              "
            >
              <ExternalLink size={12} strokeWidth={2.4} />
              Abrir
            </a>
          </div>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* TICKET / ISSUE FORM                                          */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <Card className="mb-6">
        <div className="flex items-start gap-3 mb-5 pb-5 border-b border-gray-100 dark:border-dark-border">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
            <Send size={18} className="text-white" strokeWidth={2.4} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base lg:text-lg font-bold text-brand-black dark:text-dark-text">
                Nuevo ticket de soporte
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/40 text-brand-blue">
                #TICKET
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
              Describe el problema y te contactamos por WhatsApp.
            </p>
          </div>
        </div>

        {/* Paso 1: Motivo */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-5 h-5 rounded-md bg-brand-blue text-white text-[10px] font-bold flex items-center justify-center">
              1
            </span>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
              Clasificación del ticket
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {REASONS.map(({ key, label, icon: Icon, desc }) => {
              const active = reason === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setReason(key)}
                  className={`
                    flex items-start gap-3 p-3 rounded-xl border text-left
                    transition-all duration-150
                    ${active
                      ? 'bg-brand-blue/5 dark:bg-blue-950/40 border-brand-blue ring-2 ring-brand-blue/20 shadow-sm'
                      : 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border hover:border-brand-blue hover:bg-gray-50 dark:hover:bg-dark-surface'}
                  `}
                >
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                    ${active ? 'bg-brand-blue text-white' : 'bg-gray-100 dark:bg-dark-surface text-gray-500 dark:text-dark-muted'}
                  `}>
                    <Icon size={15} strokeWidth={2.4} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold ${active ? 'text-brand-blue' : 'text-brand-black dark:text-dark-text'}`}>
                      {label}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-dark-muted mt-0.5 truncate">
                      {desc}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Paso 2: Descripción */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-5 h-5 rounded-md bg-brand-blue text-white text-[10px] font-bold flex items-center justify-center">
              2
            </span>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
              Descripción detallada
            </label>
          </div>

          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ejemplo:&#10;1. Fui a Punto de Venta&#10;2. Agregué 3 productos&#10;3. Al cobrar con tarjeta, dio error y no guardó la venta&#10;4. Ya recargué la página 2 veces"
              rows={6}
              maxLength={800}
              className="
                w-full px-3 py-3 rounded-xl text-sm resize-none font-mono
                bg-gray-50 dark:bg-dark-surface text-brand-black dark:text-dark-text
                border border-gray-200 dark:border-dark-border
                focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40
                focus:bg-white dark:focus:bg-dark-card
                outline-none placeholder:text-gray-400 dark:placeholder:text-dark-muted
                transition-colors
              "
            />
            <div className="absolute bottom-2 right-3 text-[10px] font-mono text-gray-400 dark:text-dark-muted">
              {description.length}/800
            </div>
          </div>

          <p className="text-[11px] text-gray-500 dark:text-dark-muted mt-2 flex items-start gap-1.5">
            <Lightbulb size={11} className="mt-0.5 shrink-0" />
            <span>Incluye pasos numerados para reproducir el problema. Mientras más detalle, mejor.</span>
          </p>
        </div>

        {/* Preview del mensaje */}
        {reason && (
          <div className="mb-5 rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
            <div className="px-3 py-2 bg-gray-50 dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border flex items-center gap-2">
              <Terminal size={11} className="text-gray-500 dark:text-dark-muted" />
              <span className="text-[10px] font-mono text-gray-500 dark:text-dark-muted uppercase tracking-wider">
                preview del mensaje
              </span>
            </div>
            <pre className="p-3 text-[11px] font-mono text-gray-700 dark:text-dark-text bg-white dark:bg-dark-card whitespace-pre-wrap leading-relaxed">
{`🎫 Soporte BIOMEY

Usuario: ${user?.name || '—'}
Rol:     ${user?.role || '—'}
Dispositivo: ${device.label}
App:     v${APP_VERSION}

Motivo: ${REASONS.find((r) => r.key === reason)?.label || '—'}

${description.trim() || '(sin descripción)'}`}
            </pre>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="primary"
            icon={MessageCircle}
            onClick={handleWhatsApp}
            disabled={!reason}
            className="flex-1 !h-11"
          >
            Enviar ticket por WhatsApp
          </Button>
        </div>

        <p className="text-[11px] text-gray-500 dark:text-dark-muted text-center mt-3">
          Al enviar, se abrirá WhatsApp con el mensaje pre-armado.
        </p>
      </Card>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* CHANGELOG + FAQ                                              */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Changelog */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <GitBranch size={16} className="text-brand-blue" strokeWidth={2.2} />
            <h2 className="text-sm font-bold text-brand-black dark:text-dark-text">
              Últimas actualizaciones
            </h2>
          </div>

          <div className="space-y-4">
            {CHANGELOG.map((entry) => (
              <div key={entry.version} className="relative pl-6">
                {/* Línea vertical */}
                <div className="absolute left-2 top-2 bottom-0 w-px bg-gray-200 dark:bg-dark-border" />
                {/* Punto */}
                <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full ring-4 ring-white dark:ring-dark-card flex items-center justify-center ${
                  entry.tag === 'current'
                    ? 'bg-green-500'
                    : entry.tag === 'stable'
                      ? 'bg-blue-500'
                      : 'bg-gray-300 dark:bg-dark-muted'
                }`}>
                  {entry.tag === 'current' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </div>

                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-xs font-bold font-mono text-brand-black dark:text-dark-text">
                    v{entry.version}
                  </span>
                  {entry.tag === 'current' && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400">
                      Actual
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-gray-400 dark:text-dark-muted ml-auto">
                    {entry.date}
                  </span>
                </div>

                <ul className="space-y-1">
                  {entry.items.map((item, i) => (
                    <li key={i} className="text-xs text-gray-600 dark:text-dark-muted flex items-start gap-1.5">
                      <ChevronRight size={11} className="mt-0.5 shrink-0 text-gray-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* FAQ */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={16} className="text-brand-blue" strokeWidth={2.2} />
            <h2 className="text-sm font-bold text-brand-black dark:text-dark-text">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="space-y-2">
            {FAQ.map((item, idx) => {
              const open = openFaq === idx
              return (
                <div
                  key={idx}
                  className="
                    rounded-lg border border-gray-200 dark:border-dark-border
                    overflow-hidden transition-colors
                  "
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : idx)}
                    className="
                      w-full flex items-center justify-between gap-3 p-3 text-left
                      hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors
                    "
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <code className="text-[10px] font-mono text-brand-blue shrink-0">
                        {item.tag}
                      </code>
                      <span className="text-xs font-semibold text-brand-black dark:text-dark-text truncate">
                        {item.q}
                      </span>
                    </div>
                    <ChevronRight
                      size={14}
                      className={`text-gray-400 shrink-0 transition-transform ${
                        open ? 'rotate-90 text-brand-blue' : ''
                      }`}
                    />
                  </button>

                  {open && (
                    <div className="px-3 pb-3 -mt-1 border-t border-gray-100 dark:border-dark-border pt-2.5">
                      <p className="text-xs text-gray-600 dark:text-dark-muted leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* FOOTER BIOMEY                                                */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="text-center py-6">
        <div className="inline-flex items-center gap-2 text-[11px] font-mono text-gray-500 dark:text-dark-muted">
          <CircleDot size={10} className="text-green-500" />
          <span>SNEAKERS POS</span>
          <span className="text-gray-300 dark:text-dark-border">·</span>
          <span className="text-brand-blue font-bold">by BIOMEY</span>
          <span className="text-gray-300 dark:text-dark-border">·</span>
          <span>v{APP_VERSION}</span>
        </div>
        <p className="text-[10px] font-mono text-gray-400 dark:text-dark-muted mt-1">
          © {new Date().getFullYear()} BIOMEY — Todos los derechos reservados
        </p>
      </div>

      <Toast
        open={!!toast}
        variant={toast?.title?.includes('⚠️') || toast?.title?.includes('Error') ? 'error' : 'success'}
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

function StatusPill({ icon: Icon, label, tone = 'blue' }) {
  const tones = {
    green:  'bg-green-500/15 text-green-300 ring-green-400/30',
    blue:   'bg-blue-500/15 text-blue-300 ring-blue-400/30',
    purple: 'bg-purple-500/15 text-purple-300 ring-purple-400/30',
    gray:   'bg-white/10 text-white/70 ring-white/20',
  }
  return (
    <span className={`
      inline-flex items-center gap-1.5 h-7 px-3 rounded-full
      backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider font-mono
      ring-1 ${tones[tone]}
    `}>
      <Icon size={11} strokeWidth={2.4} />
      {label}
    </span>
  )
}

function StatusRow({ label, value, ok }) {
  return (
    <li className="flex items-center justify-between gap-2">
      <span className="text-xs text-gray-600 dark:text-dark-muted">{label}</span>
      <span className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
        <span className={`text-xs font-semibold font-mono ${ok ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
          {value}
        </span>
      </span>
    </li>
  )
}

function InfoRow({ icon: Icon, label, value, mono = false }) {
  return (
    <li className="flex items-center justify-between gap-2">
      <span className="text-xs text-gray-600 dark:text-dark-muted flex items-center gap-1.5">
        <Icon size={11} strokeWidth={2.2} className="text-gray-400" />
        {label}
      </span>
      <span className={`text-xs font-semibold text-brand-black dark:text-dark-text truncate max-w-[60%] ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </li>
  )
}