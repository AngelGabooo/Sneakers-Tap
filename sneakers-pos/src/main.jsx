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
    console.log('🔔 Click en notificación:', event.data)
    const view = event.data.view
    if (view && window.__viewNavigate) {
      window.__viewNavigate(view)
    }
  })
}

// ⭐ Leer vista pendiente desde URL (app se abrió por click en notif)
const params = new URLSearchParams(window.location.search)
const pendingView = params.get('view')
if (pendingView) {
  sessionStorage.setItem('pendingNotificationView', pendingView)
  window.history.replaceState({}, '', window.location.pathname)
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
              </NotificationsProvider>
            </AuthProvider>
          </UsersProvider>
        </SyncProvider>
      </NetworkProvider>
    </ThemeProvider>
  </React.StrictMode>,
)