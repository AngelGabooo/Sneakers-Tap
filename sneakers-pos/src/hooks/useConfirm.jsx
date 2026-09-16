// src/hooks/useConfirm.jsx
import { createContext, useCallback, useContext, useState } from 'react'
import ConfirmModal from '../components/common/ConfirmModal'

const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    options: {},
    resolve: null,
  })

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setState({
        open: true,
        options: typeof options === 'string' ? { title: options } : options,
        resolve,
      })
    })
  }, [])

  const handleConfirm = () => {
    state.resolve?.(true)
    setState({ open: false, options: {}, resolve: null })
  }

  const handleCancel = () => {
    state.resolve?.(false)
    setState({ open: false, options: {}, resolve: null })
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmModal
        open={state.open}
        {...state.options}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm debe usarse dentro de <ConfirmProvider>')
  return ctx
}