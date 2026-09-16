// src/components/layout/DashboardLayout.jsx
import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { useAuth } from '../../context/AuthContext'

export default function DashboardLayout({
  activeKey = 'dashboard',
  onNavigate,
  period,
  onPeriodChange,
  children,
}) {
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-brand-surface dark:bg-dark-bg">
      <Sidebar
        activeKey={activeKey}
        onNavigate={onNavigate}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        user={user}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenMobile={() => setMobileOpen(true)}
          user={user}
          period={period}
          onPeriodChange={onPeriodChange}
        />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}