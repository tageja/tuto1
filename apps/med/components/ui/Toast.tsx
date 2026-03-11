'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const icons: Record<ToastType, ReactNode> = {
    success: <CheckCircle size={16} className="text-success shrink-0" />,
    error: <AlertCircle size={16} className="text-error shrink-0" />,
    info: <Info size={16} className="text-primary shrink-0" />,
  }

  const styles: Record<ToastType, string> = {
    success: 'border-success/30 bg-green-50',
    error: 'border-error/30 bg-red-50',
    info: 'border-primary/30 bg-primary-light',
  }

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-md min-w-[260px] max-w-sm animate-fade-in ${styles[toast.type]}`}
    >
      {icons[toast.type]}
      <p className="text-sm text-text flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-text-muted hover:text-text transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
