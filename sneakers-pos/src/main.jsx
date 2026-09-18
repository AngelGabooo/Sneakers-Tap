// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// 🗄️  Inicializar IndexedDB
import './lib/db'

// 🔔 Registrar Service Worker (para Web Push)
import { registerServiceWorker } from './utils/webPush'

import { ThemeProvider } from './context/ThemeContext.jsx'
import { NetworkProvider } from './context/NetworkContext.jsx'
import { SyncProvider } from './context/SyncContext.jsx'
import { UsersProvider } from './context/UsersContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { NotificationsProvider } from './context/NotificationsContext.jsx'
import { CreditProvider } from './context/CreditContext.jsx'   // ⭐ NUEVO
import { ViewProvider } from './context/ViewContext.jsx'
import { ProductsProvider } from './context/ProductsContext.jsx'
import { MovementsProvider } from './context/MovementsContext.jsx'
import { CashProvider } from './context/CashContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { SalesProvider } from './context/SalesContext.jsx'
import { WholesaleProvider } from './context/WholesaleContext.jsx'
import { RolesProvider } from './context/RolesContext.jsx'
import { AuditProvider } from './context/AuditContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'

import './index.css'

// ⭐ Escuchar click en notificación (app abierta)
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type !== 'NOTIFICATION_CLICK') return

    const { view, notifId, saleId, sessionId, productId } = event.data
    console.log('🔔 Click en notificación:', event.data)

    // ⭐ Guardar deep links en sessionStorage para que ViewContext los consuma
    if (saleId) sessionStorage.setItem('pendingSaleId', saleId)
    if (sessionId) sessionStorage.setItem('pendingSessionId', sessionId)
    if (productId) sessionStorage.setItem('pendingProductId', productId)

    if (view && window.__viewNavigate) {
      window.__viewNavigate(view)
    }
  })

  // ⭐ Escuchar cambios de suscripción
  navigator.serviceWorker.addEventListener('message', async (event) => {
    if (event.data?.type !== 'PUSH_SUBSCRIPTION_CHANGED') return
    console.log('🔄 Suscripción renovada, guardando…')
    // El handler detallado ya está en `listenForSubscriptionChanges`
    // que se llama desde AuthContext (si lo tienes)
  })
}

// ⭐ Leer deep links desde URL (app se abrió por click en notif)
const params = new URLSearchParams(window.location.search)
const pendingView = params.get('view')
const pendingSaleId = params.get('saleId')
const pendingSessionId = params.get('sessionId')
const pendingProductId = params.get('productId')

if (pendingView) sessionStorage.setItem('pendingNotificationView', pendingView)
if (pendingSaleId) sessionStorage.setItem('pendingSaleId', pendingSaleId)
if (pendingSessionId) sessionStorage.setItem('pendingSessionId', pendingSessionId)
if (pendingProductId) sessionStorage.setItem('pendingProductId', pendingProductId)

if (pendingView || pendingSaleId || pendingSessionId || pendingProductId) {
  window.history.replaceState({}, '', window.location.pathname)
}

// ⭐ Sonido custom para notificaciones críticas (app en foreground)
//    iOS permite Audio() mientras la app esté abierta.
export function playCriticalSound() {
  try {
    const audio = new Audio('/sounds/critical.wav')
    audio.volume = 0.7
    audio.play().catch((err) => {
      // Puede fallar si el usuario no ha interactuado con la página aún.
      // Es normal en iOS. No es crítico.
      console.warn('⚠️ No se pudo reproducir sonido:', err.message)
    })
  } catch (err) {
    console.warn('⚠️ Error creando Audio:', err)
  }
}

// Registrar Service Worker
registerServiceWorker()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <NetworkProvider>
        <SyncProvider>
          <UsersProvider>
            <AuthProvider>
              <NotificationsProvider>
                {/* ⭐ NUEVO: CreditProvider justo aquí, dentro de Auth y disponible para toda la app */}
                <CreditProvider>
                  <ViewProvider defaultView="dashboard">
                    <ProductsProvider>
                      <MovementsProvider>
                        <CashProvider>
                          <CartProvider>
                            <SalesProvider>
                              <WholesaleProvider>
                                <RolesProvider>
                                  <AuditProvider>
                                    <SettingsProvider>
                                      <App />
                                    </SettingsProvider>
                                  </AuditProvider>
                                </RolesProvider>
                              </WholesaleProvider>
                            </SalesProvider>
                          </CartProvider>
                        </CashProvider>
                      </MovementsProvider>
                    </ProductsProvider>
                  </ViewProvider>
                </CreditProvider>
              </NotificationsProvider>
            </AuthProvider>
          </UsersProvider>
        </SyncProvider>
      </NetworkProvider>
    </ThemeProvider>
  </React.StrictMode>,
)