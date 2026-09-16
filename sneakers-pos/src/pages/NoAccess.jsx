// src/pages/NoAccess.jsx
import { ShieldAlert } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import { useView } from '../context/ViewContext'

export default function NoAccess() {
  const { navigate } = useView()

  return (
    <DashboardLayout activeKey="dashboard" onNavigate={navigate}>
      <Card className="max-w-xl mx-auto mt-10">
        <div className="flex flex-col items-center text-center py-8 px-6">
          <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center mb-4">
            <ShieldAlert size={26} className="text-brand-red" strokeWidth={1.9} />
          </div>
          <h1 className="text-lg font-semibold text-brand-black dark:text-dark-text">
            No tienes acceso a esta sección
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-1 max-w-sm">
            Tu rol actual no incluye los permisos necesarios. Si crees que es un error, contacta al administrador.
          </p>
          <Button
            variant="primary"
            className="mt-5"
            onClick={() => navigate('dashboard')}
          >
            Ir al dashboard
          </Button>
        </div>
      </Card>
    </DashboardLayout>
  )
}