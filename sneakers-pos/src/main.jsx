import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ViewProvider } from './context/ViewContext.jsx'
import { ProductsProvider } from './context/ProductsContext.jsx'
import { MovementsProvider } from './context/MovementsContext.jsx'
import { CashProvider } from './context/CashContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { SalesProvider } from './context/SalesContext.jsx'
import { WholesaleProvider } from './context/WholesaleContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ViewProvider defaultView="dashboard">
          <ProductsProvider>
            <MovementsProvider>
              <CashProvider>
                <CartProvider>
                  <SalesProvider>
                    <WholesaleProvider>
                      <App />
                    </WholesaleProvider>
                  </SalesProvider>
                </CartProvider>
              </CashProvider>
            </MovementsProvider>
          </ProductsProvider>
        </ViewProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)