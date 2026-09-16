// src/components/common/OfflineBanner.jsx
import { WifiOff } from 'lucide-react'
import { useNetwork } from '../../context/NetworkContext'

export default function OfflineBanner() {
  const { isOnline } = useNetwork()

  if (isOnline) return null

  return (
    <div className="
      fixed top-0 left-0 right-0 z-[9999]
      bg-amber-500 text-white
      px-4 py-2.5
      flex items-center justify-center gap-2.5
      shadow-lg
      animate-in slide-in-from-top duration-300
    ">
      <WifiOff size={16} strokeWidth={2.2} />
      <p className="text-sm font-medium">
        Sin conexión a internet · Los cambios se guardarán localmente y se sincronizarán automáticamente
      </p>
    </div>
  )
}