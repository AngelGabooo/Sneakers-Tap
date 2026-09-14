import SneakersLogo from './SneakersLogo'

export default function BrandingPanel() {
  return (
    <aside className="relative hidden md:flex md:w-1/2 lg:w-1/2 overflow-hidden
                      bg-gradient-to-br from-brand-blue to-brand-blueDark
                      dark:from-[#0F1F4D] dark:to-[#0A1330]">
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/5" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-brand-blueDark/40 blur-2xl" />
      <div className="absolute top-1/3 right-16 w-2 h-16 rounded-full bg-brand-red/80" />

      <div className="relative z-10 flex flex-col justify-between w-full p-12 lg:p-16 text-white">
        <SneakersLogo variant="light" />

        <div className="max-w-md">
          <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
            Todo tu negocio,
            <br />
            <span className="text-white/80">bajo control.</span>
          </h2>
          <p className="mt-5 text-white/75 text-base lg:text-lg leading-relaxed">
            Administra tus ventas, inventario, caja y productos desde un solo lugar.
          </p>
        </div>

        <div className="relative mt-8">
          <img
            src="/images/sneaker-hero.png"
            alt="Sneaker Sneakers"
            className="w-full max-w-md mx-auto drop-shadow-2xl"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>
      </div>
    </aside>
  )
}