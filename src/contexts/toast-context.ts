import { createContext } from 'react'

export type ToastKind = 'success' | 'error' | 'info'

export type Toast = {
  id: number
  kind: ToastKind
  message: string
}

export type ToastContextValue = {
  toasts: Toast[]
  pushToast: (message: string, kind?: ToastKind) => void
  dismissToast: (id: number) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
