// src/components/settings/sections/BranchesSection.jsx
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Button from '../../common/Button'
import { Section, TextInput, Grid2 } from '../Field'

export default function BranchesSection({ draft, updateDraft }) {
  const { branches } = draft
  const [adding, setAdding] = useState(false)

  const addBranch = () => {
    setAdding(true)
    updateDraft((d) => ({
      ...d,
      branches: [
        ...d.branches,
        {
          id: `br_${Date.now()}`,
          name: '',
          code: '',
          status: 'active',
          address: '',
          phone: '',
          manager: '',
        },
      ],
    }))
    setAdding(false)
  }

  const updateBranch = (id, patch) => {
    updateDraft((d) => ({
      ...d,
      branches: d.branches.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }))
  }

  const removeBranch = (id) => {
    updateDraft((d) => ({
      ...d,
      branches: d.branches.filter((b) => b.id !== id),
    }))
  }

  return (
    <Section
      title="Sucursales"
      description="La asignación de usuarios a sucursales se realiza en Usuarios y empleados."
      action={
        <Button size="sm" variant="secondary" icon={Plus} onClick={addBranch} disabled={adding}>
          Nueva sucursal
        </Button>
      }
    >
      {branches.length === 0 ? (
        <div className="text-center py-8 px-4">
          <p className="text-sm text-gray-500 dark:text-dark-muted">
            No hay sucursales configuradas.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {branches.map((b) => (
            <div
              key={b.id}
              className="border border-gray-200 dark:border-dark-border rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs text-gray-500 dark:text-dark-muted">
                  {b.code || 'Sin código'}
                </span>
                <button
                  type="button"
                  onClick={() => removeBranch(b.id)}
                  className="text-brand-red hover:bg-red-50 dark:hover:bg-red-950/30 p-1 rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <Grid2>
                <TextInput label="Nombre"  value={b.name}    onChange={(e) => updateBranch(b.id, { name: e.target.value })} />
                <TextInput label="Código"  value={b.code}    onChange={(e) => updateBranch(b.id, { code: e.target.value.toUpperCase() })} />
                <TextInput label="Dirección" value={b.address} onChange={(e) => updateBranch(b.id, { address: e.target.value })} />
                <TextInput label="Teléfono" value={b.phone}   onChange={(e) => updateBranch(b.id, { phone: e.target.value })} />
                <TextInput label="Responsable" value={b.manager} onChange={(e) => updateBranch(b.id, { manager: e.target.value })} />
              </Grid2>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}