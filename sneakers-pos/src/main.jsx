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

// Registrar Service Worker (sin pedir permiso, solo instala)
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