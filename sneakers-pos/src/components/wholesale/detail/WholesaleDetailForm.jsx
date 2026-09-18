// src/components/wholesale/detail/WholesaleDetailForm.jsx
import Card from '../../common/Card'
import TextField from '../../common/TextField'
import SelectField from '../../common/SelectField'
import TextareaField from '../../common/TextareaField'
import Checkbox from '../../common/Checkbox'
import WholesaleCreditSection from './WholesaleCreditSection'   // ⭐ NUEVO

const CONDITION_OPTIONS = [
  { value: 'basic',       label: 'Mayoreo Básico' },
  { value: 'premium',     label: 'Mayoreo Premium' },
  { value: 'distributor', label: 'Distribuidor' },
  { value: 'custom',      label: 'Personalizado' },
]

const PRICE_LIST_OPTIONS = [
  { value: 'public',      label: 'Precio público' },
  { value: 'basic',       label: 'Mayoreo Básico' },
  { value: 'premium',     label: 'Mayoreo Premium' },
  { value: 'distributor', label: 'Distribuidor' },
  { value: 'custom',      label: 'Personalizada' },
]

const CLIENT_TYPE = [
  { value: 'person',  label: 'Persona física' },
  { value: 'company', label: 'Empresa' },
]

const STATUS = [
  { value: 'active',    label: 'Activo' },
  { value: 'inactive',  label: 'Inactivo' },
  { value: 'suspended', label: 'Suspendido' },
  { value: 'blocked',   label: 'Bloqueado' },
]

const PAYMENT_CONDITION = [
  { value: 'immediate', label: 'Pago inmediato' },
  { value: '7d',        label: '7 días' },
  { value: '15d',       label: '15 días' },
  { value: '30d',       label: '30 días' },
  { value: '45d',       label: '45 días' },
  { value: '60d',       label: '60 días' },
  { value: 'custom',    label: 'Personalizado' },
]

export default function WholesaleDetailForm({ form, errors, onChange, creditSectionProps }) {
  return (
    <div className="space-y-5">
      {/* Información general */}
      <Card>
        <header className="mb-5">
          <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Información general
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Datos básicos del cliente mayorista.
          </p>
        </header>

        <div className="space-y-4">
          <SelectField
            id="clientType"
            label="Tipo de cliente"
            required
            value={form.clientType}
            onChange={(e) => onChange('clientType', e.target.value)}
            options={CLIENT_TYPE}
            error={errors.clientType}
          />

          <TextField
            id="name"
            label="Nombre comercial"
            required
            value={form.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Ej. Distribuidora Norte"
            error={errors.name}
          />

          <TextField
            id="legalName"
            label="Nombre legal / Razón social"
            value={form.legalName}
            onChange={(e) => onChange('legalName', e.target.value)}
            placeholder="Nombre legal de la empresa"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              id="rfc"
              label="RFC"
              value={form.rfc}
              onChange={(e) => onChange('rfc', e.target.value.toUpperCase())}
              placeholder="RFC del cliente"
              error={errors.rfc}
            />
            <TextField
              id="clientNumber"
              label="Número de cliente"
              value={form.id || 'Se generará automáticamente'}
              disabled
            />
          </div>

          <SelectField
            id="status"
            label="Estado"
            required
            value={form.status}
            onChange={(e) => onChange('status', e.target.value)}
            options={STATUS}
            error={errors.status}
          />
        </div>
      </Card>

      {/* Contacto */}
      <Card>
        <header className="mb-5">
          <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Información de contacto
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Persona de contacto para operaciones comerciales.
          </p>
        </header>

        <div className="space-y-4">
          <TextField
            id="contactName"
            label="Nombre del contacto principal"
            required
            value={form.contactName}
            onChange={(e) => onChange('contactName', e.target.value)}
            error={errors.contactName}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              id="phone"
              label="Teléfono"
              value={form.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              error={errors.phone}
            />
            <TextField
              id="phoneSecondary"
              label="Teléfono secundario"
              value={form.phoneSecondary}
              onChange={(e) => onChange('phoneSecondary', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              id="email"
              label="Correo electrónico"
              type="email"
              value={form.email}
              onChange={(e) => onChange('email', e.target.value)}
              error={errors.email}
            />
            <TextField
              id="website"
              label="Sitio web"
              value={form.website}
              onChange={(e) => onChange('website', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Fiscal */}
      <Card>
        <header className="mb-5">
          <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Información fiscal
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Datos para facturación.
          </p>
        </header>

        <div className="space-y-4">
          <TextField
            id="legalNameFiscal"
            label="Razón social"
            value={form.legalName}
            onChange={(e) => onChange('legalName', e.target.value)}
          />
          <TextField
            id="rfcFiscal"
            label="RFC"
            value={form.rfc}
            onChange={(e) => onChange('rfc', e.target.value.toUpperCase())}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              id="taxRegime"
              label="Régimen fiscal"
              value={form.taxRegime}
              onChange={(e) => onChange('taxRegime', e.target.value)}
            />
            <TextField
              id="cfdiUse"
              label="Uso de CFDI"
              value={form.cfdiUse}
              onChange={(e) => onChange('cfdiUse', e.target.value)}
            />
          </div>
          <TextField
            id="billingEmail"
            label="Correo para facturación"
            type="email"
            value={form.billingEmail}
            onChange={(e) => onChange('billingEmail', e.target.value)}
          />
        </div>
      </Card>

      {/* Dirección */}
      <Card>
        <header className="mb-5">
          <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Dirección
          </h2>
        </header>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextField
              id="street"
              className="sm:col-span-2"
              label="Calle"
              value={form.street}
              onChange={(e) => onChange('street', e.target.value)}
            />
            <TextField
              id="extNumber"
              label="Número exterior"
              value={form.extNumber}
              onChange={(e) => onChange('extNumber', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextField
              id="intNumber"
              label="Número interior"
              value={form.intNumber}
              onChange={(e) => onChange('intNumber', e.target.value)}
            />
            <TextField
              id="neighborhood"
              label="Colonia"
              value={form.neighborhood}
              onChange={(e) => onChange('neighborhood', e.target.value)}
            />
            <TextField
              id="zip"
              label="Código postal"
              value={form.zip}
              onChange={(e) => onChange('zip', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextField
              id="city"
              label="Ciudad"
              value={form.city}
              onChange={(e) => onChange('city', e.target.value)}
            />
            <TextField
              id="state"
              label="Estado"
              value={form.state}
              onChange={(e) => onChange('state', e.target.value)}
            />
            <TextField
              id="country"
              label="País"
              value={form.country}
              onChange={(e) => onChange('country', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Condiciones comerciales */}
      <Card>
        <header className="mb-5">
          <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Condiciones comerciales
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Define cómo se aplicarán los precios y condiciones de mayoreo para este cliente.
          </p>
        </header>

        <div className="space-y-4">
          <SelectField
            id="condition"
            label="Nivel mayorista"
            required
            value={form.condition}
            onChange={(e) => onChange('condition', e.target.value)}
            options={CONDITION_OPTIONS}
            error={errors.condition}
          />

          <SelectField
            id="priceList"
            label="Lista de precios"
            value={form.priceList}
            onChange={(e) => onChange('priceList', e.target.value)}
            options={PRICE_LIST_OPTIONS}
          />

          {/* ⭐ Descuentos por volumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              id="defaultDiscount"
              label="Descuento base (%) — 0-3 pares"
              type="number"
              min={0}
              max={100}
              value={form.defaultDiscount}
              onChange={(e) => onChange('defaultDiscount', e.target.value)}
              error={errors.defaultDiscount}
            />
            <TextField
              id="maxDiscount"
              label="Descuento máximo (%) — tope"
              type="number"
              min={0}
              max={100}
              value={form.maxDiscount}
              onChange={(e) => onChange('maxDiscount', e.target.value)}
              error={errors.maxDiscount}
              helper="0 = sin tope. El sistema nunca aplicará más que este %."
            />
          </div>

          {/* ⭐ Escalones por cantidad de pares */}
          <div className="p-3 rounded-lg bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
            <div className="flex items-start gap-2 mb-3">
              <span className="text-base">🎉</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
                  Descuentos por volumen
                </p>
                <p className="text-[11px] text-gray-600 dark:text-dark-muted mt-0.5">
                  Agrega escalones: cuando el carrito tenga X pares o más, se aplicará el % indicado a
                  TODOS los productos. Si no se cumple ningún escalón, se usa el descuento base.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {(form.discountTiers || []).map((tier, idx) => (
                <div key={idx} className="flex items-end gap-2">
                  <div className="flex-1">
                    <TextField
                      id={`tier-qty-${idx}`}
                      label={idx === 0 ? 'Desde (pares)' : ''}
                      type="number"
                      min={1}
                      value={tier.minQty ?? ''}
                      onChange={(e) => {
                        const next = [...(form.discountTiers || [])]
                        next[idx] = { ...next[idx], minQty: e.target.value }
                        onChange('discountTiers', next)
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <TextField
                      id={`tier-pct-${idx}`}
                      label={idx === 0 ? 'Descuento (%)' : ''}
                      type="number"
                      min={0}
                      max={100}
                      value={tier.discount ?? ''}
                      onChange={(e) => {
                        const next = [...(form.discountTiers || [])]
                        next[idx] = { ...next[idx], discount: e.target.value }
                        onChange('discountTiers', next)
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = (form.discountTiers || []).filter((_, i) => i !== idx)
                      onChange('discountTiers', next)
                    }}
                    className="h-10 px-2 text-brand-red hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors text-xs font-medium"
                    title="Eliminar escalón"
                  >
                    Eliminar
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  const next = [...(form.discountTiers || [])]
                  const last = next[next.length - 1]
                  next.push({
                    minQty: last ? Number(last.minQty) + 4 : 4,
                    discount: last ? Number(last.discount) + 5 : 5,
                  })
                  onChange('discountTiers', next)
                }}
                className="
                  inline-flex items-center gap-1.5 h-8 px-3 rounded-md
                  text-[11px] font-semibold
                  text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-950/40
                  transition-colors
                "
              >
                + Agregar escalón
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              id="minPurchaseAmount"
              label="Compra mínima ($)"
              type="number"
              min={0}
              value={form.minPurchaseAmount}
              onChange={(e) => onChange('minPurchaseAmount', e.target.value)}
            />
            <TextField
              id="minPurchaseUnits"
              label="Unidades mínimas"
              type="number"
              min={0}
              value={form.minPurchaseUnits}
              onChange={(e) => onChange('minPurchaseUnits', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Crédito */}
      <Card>
        <header className="mb-5">
          <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Crédito comercial
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Configuración de la línea de crédito.
          </p>
        </header>

        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={!!form.creditEnabled}
              onChange={(e) => onChange('creditEnabled', e.target.checked)}
            />
            <span className="text-sm font-medium text-brand-black dark:text-dark-text">
              Habilitar crédito para este cliente
            </span>
          </label>

          {form.creditEnabled && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  id="creditLimit"
                  label="Límite de crédito ($)"
                  type="number"
                  min={0}
                  value={form.creditLimit}
                  onChange={(e) => onChange('creditLimit', e.target.value)}
                  error={errors.creditLimit}
                />
                <TextField
                  id="creditDays"
                  label="Días de crédito"
                  type="number"
                  min={0}
                  value={form.creditDays}
                  onChange={(e) => onChange('creditDays', e.target.value)}
                  error={errors.creditDays}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  id="creditUsed"
                  label="Crédito utilizado"
                  value={`$${Number(form.creditUsed || 0).toLocaleString('es-MX')}`}
                  disabled
                />
                <TextField
                  id="creditAvailable"
                  label="Crédito disponible"
                  value={`$${Math.max(0, Number(form.creditLimit || 0) - Number(form.creditUsed || 0)).toLocaleString('es-MX')}`}
                  disabled
                />
              </div>

              {/* ⭐ NUEVO: Sección de crédito activo + otorgar */}
              {creditSectionProps && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
                  <WholesaleCreditSection
                    credit={creditSectionProps.activeCredit}
                    onGrant={creditSectionProps.onGrant}
                    onViewDetail={creditSectionProps.onViewDetail}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Condiciones de pago */}
      <Card>
        <header className="mb-5">
          <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Condiciones de pago
          </h2>
        </header>

        <div className="space-y-4">
          <SelectField
            id="paymentCondition"
            label="Condición principal"
            value={form.paymentCondition}
            onChange={(e) => onChange('paymentCondition', e.target.value)}
            options={PAYMENT_CONDITION}
          />

          <div>
            <p className="text-sm font-medium text-brand-black dark:text-dark-text mb-2">
              Métodos aceptados
            </p>
            <div className="space-y-2">
              {['cash', 'card', 'transfer', 'credit', 'other'].map((m) => (
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={form.paymentMethods?.includes(m)}
                    onChange={(e) => {
                      const current = form.paymentMethods || []
                      const next = e.target.checked
                        ? [...current, m]
                        : current.filter((x) => x !== m)
                      onChange('paymentMethods', next)
                    }}
                  />
                  <span className="text-sm text-brand-black dark:text-dark-text capitalize">
                    {m === 'cash' ? 'Efectivo'
                      : m === 'card' ? 'Tarjeta'
                      : m === 'transfer' ? 'Transferencia'
                      : m === 'credit' ? 'Crédito'
                      : 'Otros'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Responsable */}
      <Card>
        <header className="mb-5">
          <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Responsable comercial
          </h2>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            id="responsable"
            label="Vendedor / ejecutivo asignado"
            value={form.responsable}
            onChange={(e) => onChange('responsable', e.target.value)}
          />
          <TextField
            id="branch"
            label="Sucursal principal"
            value={form.branch}
            onChange={(e) => onChange('branch', e.target.value)}
          />
        </div>
      </Card>

      {/* Notas internas */}
      <Card>
        <header className="mb-5">
          <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Notas internas
          </h2>
        </header>

        <TextareaField
          id="internalNotes"
          label=""
          value={form.internalNotes}
          onChange={(e) => onChange('internalNotes', e.target.value)}
          placeholder="Agrega notas relevantes para el equipo comercial..."
          rows={4}
        />
      </Card>
    </div>
  )
}