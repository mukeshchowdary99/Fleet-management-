import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { ToastContext } from './toast-context'
import type { Toast, ToastKind } from './toast-context'

const iconFor: Record<ToastKind, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), [])

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback(
    (message: string, kind: ToastKind = 'success') => {
      const id = ++counter.current
      setToasts((current) => [...current, { id, kind, message }])
      timers.current.push(window.setTimeout(() => dismissToast(id), 4500))
    },
    [dismissToast],
  )

  const value = useMemo(() => ({ toasts, pushToast, dismissToast }), [toasts, pushToast, dismissToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = iconFor[toast.kind]
          return (
            <div
              key={toast.id}
              role="status"
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-ink-200 bg-white px-4 py-3 shadow-panel"
            >
              <Icon
                size={17}
                className={
                  toast.kind === 'success'
                    ? 'mt-0.5 shrink-0 text-emerald-600'
                    : toast.kind === 'error'
                      ? 'mt-0.5 shrink-0 text-red-600'
                      : 'mt-0.5 shrink-0 text-brand-600'
                }
              />
              <p className="flex-1 text-sm font-medium leading-5 text-ink-800">{toast.message}</p>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismissToast(toast.id)}
                className="rounded p-0.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
              >
                <X size={15} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
