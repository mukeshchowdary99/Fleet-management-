import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Compass size={22} /></span>
      <p className="text-2xl font-semibold tracking-tight text-ink-900">Page not found</p>
      <p className="mt-2 text-sm text-ink-500">This destination is not part of the operations workspace.</p>
      <Link to="/dashboard" className="btn-primary mt-5">Go to dashboard</Link>
    </div>
  )
}
