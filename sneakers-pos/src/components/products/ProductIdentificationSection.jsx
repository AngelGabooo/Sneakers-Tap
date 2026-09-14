import { useState } from 'react'
import { Barcode, QrCode, Wand2, Printer, RefreshCw, ScanLine } from 'lucide-react'
import Card from '../common/Card'
import TextField from '../common/TextField'
import Button from '../common/Button'
import BarcodeDisplay from '../common/BarcodeDisplay'
import QrCodeDisplay from '../common/QrCodeDisplay'
import LabelPrintModal from '../common/LabelPrintModal'

export default function ProductIdentificationSection({
  values,
  errors,
  onChange,
  onGenerateSku,
  onRegenerateBarcode,
  onScan,
  onCodeTypeChange, // 👈 NUEVO
}) {
  const [codeType, setCodeType] = useState('barcode') // 'barcode' | 'qr'
  const [printOpen, setPrintOpen] = useState(false)

  // Notifica al padre cuando cambia el tipo de código
  const handleSetCodeType = (type) => {
    setCodeType(type)
    onCodeTypeChange?.(type)
  }

  const handleBarcodeManualChange = (e) => {
    onChange('barcode', e.target.value)
  }

  return (
    <>
      <Card>
        <header className="mb-5">
          <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Identificación
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Códigos utilizados para identificar el producto. Si el producto no trae código de fábrica, generamos uno para ti e imprimimos la etiqueta.
          </p>
        </header>

        <div className="space-y-4">
          {/* SKU */}
          <TextField
            id="sku"
            label="SKU"
            required
            value={values.sku}
            onChange={(e) => onChange('sku', e.target.value.toUpperCase())}
            placeholder="Ej. NK-270-BLK"
            error={errors.sku}
            rightAction={
              <button
                type="button"
                onClick={onGenerateSku}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
              >
                <Wand2 size={12} strokeWidth={2.2} />
                Generar automáticamente
              </button>
            }
          />

          {/* Tipo de código */}
          <div>
            <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
              Tipo de código
            </label>
            <div className="inline-flex rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card p-0.5">
              <button
                type="button"
                onClick={() => handleSetCodeType('barcode')}
                className={`
                  inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-medium transition-colors
                  ${codeType === 'barcode'
                    ? 'bg-brand-blue text-white'
                    : 'text-gray-600 dark:text-dark-muted hover:text-brand-blue'}
                `}
              >
                <Barcode size={15} strokeWidth={2} />
                Código de barras
              </button>
              <button
                type="button"
                onClick={() => handleSetCodeType('qr')}
                className={`
                  inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-medium transition-colors
                  ${codeType === 'qr'
                    ? 'bg-brand-blue text-white'
                    : 'text-gray-600 dark:text-dark-muted hover:text-brand-blue'}
                `}
              >
                <QrCode size={15} strokeWidth={2} />
                Código QR
              </button>
            </div>
          </div>

          {/* Código + acciones */}
          <TextField
            id="barcode"
            label={codeType === 'qr' ? 'Código interno (QR)' : 'Código de barras'}
            value={values.barcode}
            onChange={handleBarcodeManualChange}
            placeholder="Se genera automáticamente al escribir el nombre y SKU"
            icon={codeType === 'qr' ? QrCode : Barcode}
            rightAction={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onRegenerateBarcode}
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
                  title="Regenerar código"
                >
                  <RefreshCw size={12} strokeWidth={2.2} />
                  Regenerar
                </button>
                <button
                  type="button"
                  onClick={onScan}
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
                  title="Escanear con lector"
                >
                  <ScanLine size={12} strokeWidth={2.2} />
                  Escanear
                </button>
              </div>
            }
          />

          {/* Preview del código */}
          {values.barcode && (
            <div className="rounded-xl border border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
                  Vista previa
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Printer}
                  onClick={() => setPrintOpen(true)}
                >
                  Imprimir etiqueta
                </Button>
              </div>

              <div className="flex justify-center">
                {codeType === 'qr' ? (
                  <QrCodeDisplay value={values.barcode} size={140} />
                ) : (
                  <BarcodeDisplay value={values.barcode} format="CODE128" height={70} width={1.8} />
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Modal de impresión */}
      <LabelPrintModal
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        product={{
          name: values.name,
          brand: values.brand,
          category: values.category,
          sku: values.sku,
          salePrice: values.salePrice,
        }}
        code={values.barcode}
        codeType={codeType}
      />
    </>
  )
}