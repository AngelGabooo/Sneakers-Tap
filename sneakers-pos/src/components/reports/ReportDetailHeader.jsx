import { ChevronRight, Download, Printer, Save, ArrowLeft } from 'lucide-react'
import Button from '../common/Button'

export default function ReportDetailHeader({
  category,
  reportTitle,
  onBack,
  onExport,
  onPrint,
  onSave,
}) {
  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm mb-5 flex-wrap">
        <button
          onClick={onBack}
          className="text-gray-500 dark:text-dark-muted hover:text-brand-blue transition-colors font-medium"
        >
          Reportes
        </button>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-brand-black dark:text-dark-text font-medium truncate max-w-[200px]">
          {reportTitle || category}
        </span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="
              w-10 h-10 rounded-lg flex items-center justify-center shrink-0
              bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border
              text-gray-600 dark:text-dark-muted
              hover:border-brand-blue hover:text-brand-blue
              transition-colors
            "
            aria-label="Volver"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
              {reportTitle || 'Reporte'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-dark-muted mt-1 max-w-2xl">
              Datos generados desde los registros operativos del sistema.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button variant="secondary" icon={Save} onClick={onSave}>
            Guardar
          </Button>
          <Button variant="secondary" icon={Printer} onClick={onPrint}>
            Imprimir
          </Button>
          <Button variant="primary" icon={Download} onClick={onExport}>
            Exportar
          </Button>
        </div>
      </div>
    </>
  )
}