// src/data/settings.js

export const SETTINGS_TABS = [
  { key: 'store',        label: 'Información de la tienda' },
  { key: 'ticket',       label: 'Ticket y comprobantes' },

]

export const TICKET_WIDTHS = [
  { value: 58, label: '58 mm' },
  { value: 80, label: '80 mm' },
]

export const LANGUAGES = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
]

export const CURRENCIES = [
  { value: 'MXN', label: 'MXN — Peso mexicano' },
  { value: 'USD', label: 'USD — Dólar estadounidense' },
]

export const TIMEZONES = [
  { value: 'America/Mexico_City', label: 'América/México_City' },
  { value: 'America/Tijuana',     label: 'América/Tijuana' },
  { value: 'America/Cancun',      label: 'América/Cancún' },
]

export const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/AAAA' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/AAAA' },
  { value: 'YYYY-MM-DD', label: 'AAAA-MM-DD' },
]

export const TIME_FORMATS = [
  { value: '24h', label: '24 horas' },
  { value: '12h', label: '12 horas (AM/PM)' },
]

export const QR_TARGETS = [
  { value: 'website',  label: 'Sitio web' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'social',   label: 'Redes sociales' },
  { value: 'custom',   label: 'Página personalizada' },
]

/**
 * Estructura por defecto de la configuración.
 * Todos los campos vacíos para que se llenen al cargar o al editar.
 * El usuario parte de un formulario limpio, sin valores hardcodeados.
 */
export const DEFAULT_SETTINGS = {
  store: {
    commercialName: '',
    legalName: '',
    rfc: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    logoUrl: null,
    address: {
      street: '',
      exteriorNumber: '',
      interiorNumber: '',
      neighborhood: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      useOnTicket: true,
    },
    contact: {
      showPhone: true,
      showEmail: true,
      showWebsite: true,
      showAddress: true,
      showSocial: false,
      instagram: '',
      facebook: '',
      whatsapp: '',
    },
  },
  ticket: {
    header: {
      name: '',
      tagline: '',
      showLogo: true,
      showAddress: true,
      showPhone: true,
      showEmail: true,
      showRfc: true,
    },
    sale: {
      showNumber: true,
      showDate: true,
      showTime: true,
      showSeller: true,
      showCash: true,
      showBranch: true,
      showCustomer: true,
      showPaymentMethod: true,
    },
    products: {
      showName: true,
      showSize: true,
      showColor: true,
      showSku: true,
      showQuantity: true,
      showUnitPrice: true,
      showDiscount: true,
      showTax: true,
      showSubtotal: true,
    },
    footer: {
      thankYouMessage: '',
      returnPolicy: '',
      showThankYou: true,
      showReturnPolicy: true,
      showSocial: false,
      showQr: false,
      showWebsite: true,
    },
    qr: {
      enabled: false,
      target: 'website',
      url: '',
    },
    width: 80,
  },
  sales: {
    confirmCancel: true,
    confirmRemoveItem: true,
    allowSaleWithoutStock: false,
    allowPriceEdit: false,
    maxDiscount: 15,
  },
  taxes: {
    name: 'IVA',
    rate: 16,
    pricesIncludeTax: true,
  },
  branches: [],
  preferences: {
    language: 'es',
    currency: 'MXN',
    timezone: 'America/Mexico_City',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    notifications: {
      lowStock: true,
      outOfStock: true,
      cashDifferences: true,
      cancelledSales: true,
      returns: true,
      securityEvents: true,
    },
  },
}

/** Merge superficial + profundo por secciones (para no perder campos nuevos) */
export function mergeSettings(base, patch) {
  if (!patch) return base
  const result = { ...base }
  Object.keys(patch).forEach((k) => {
    if (
      patch[k] && typeof patch[k] === 'object' && !Array.isArray(patch[k])
    ) {
      result[k] = mergeSettings(base[k] || {}, patch[k])
    } else {
      result[k] = patch[k]
    }
  })
  return result
}

/** Compara dos configuraciones (deep) */
export function settingsEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}