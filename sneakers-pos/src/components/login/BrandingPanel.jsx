// src/components/login/BrandingPanel.jsx
import SneakersLogo from './SneakersLogo'

export default function BrandingPanel() {
  return (
    <aside className="relative hidden md:flex md:w-1/2 lg:w-1/2 overflow-hidden
                      bg-gradient-to-br from-[#0A1F44] via-brand-blue to-[#0A1330]
                      dark:from-[#050B1F] dark:via-[#0A1F44] dark:to-[#050B1F]">
      {/* Círculos decorativos de fondo */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-brand-blue/20 blur-3xl" />
      <div className="absolute top-1/4 left-20 w-1.5 h-12 rounded-full bg-white/30" />

      {/* Contenido */}
      <div className="relative z-10 flex flex-col w-full p-12 lg:p-16 text-white">

        {/* Logo en la esquina superior */}
        <SneakersLogo variant="light" />

        {/* Logo principal — centrado verticalmente */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-full max-w-[520px] mt-6 lg:mt-10">
            {/* Halo suave detrás del logo */}
            <div className="absolute inset-0 bg-brand-blue/30 blur-3xl rounded-full scale-90" />

            {/* Logo flotando */}
            <img
              src="/images/sneakers-tap-logo.png"
              alt="Sneakers Tap"
              className="relative w-full h-auto object-contain
                         drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
            />
          </div>
        </div>

        {/* Crédito de desarrollo — abajo, letras pequeñas */}
        <div className="text-center">
          <p className="text-[11px] tracking-wider uppercase
                        text-white/40 font-medium">
            Desarrollado por <span className="text-white/60 font-semibold">Biomey</span>
          </p>
        </div>
      </div>
    </aside>
  )
}