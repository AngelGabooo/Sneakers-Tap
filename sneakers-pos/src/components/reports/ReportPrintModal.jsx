import { useRef } from 'react'
import { X, Printer, FileText } from 'lucide-react'
import Button from '../common/Button'
import ReportPrintDocument from './ReportPrintDocument'

export default function ReportPrintModal({ open, onClose, data }) {
  const printRef = useRef(null)

  if (!open || !data) return null

  const handlePrint = () => {
    const content = printRef.current?.outerHTML
    if (!content) return

    const win = window.open('', '_blank', 'width=900,height=1100')
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${data.reportTitle} — SNEAKERS</title>
          <style>
            * { box-sizing: border-box; }
            html, body {
              margin: 0;
              padding: 0;
              background: #ffffff !important;
              color: #111827 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @page {
              size: A4;
              margin: 0;
            }
            @media print {
              body { background: #ffffff; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${content}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-cardHover">

        {/* Header del modal */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border shrink-0">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-brand-blue" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
              Vista previa del reporte
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-brand-black dark:hover:text-dark-text transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto p-6 bg-gray-100 dark:bg-dark-surface">
          <div className="flex justify-center">
            <div className="shadow-lg">
              <ReportPrintDocument ref={printRef} {...data} />
            </div>
          </div>
        </div>

        {/* Footer del modal */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border shrink-0">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" icon={Printer} onClick={handlePrint}>
            Imprimir / Guardar PDF
          </Button>
        </div>
      </div>
    </div>
  )
}