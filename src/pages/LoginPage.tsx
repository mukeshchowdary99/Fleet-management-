import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Activity, ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole, MapPinned, Route, ShieldCheck, Truck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginValues = z.infer<typeof loginSchema>

const highlights = [
  { icon: Activity, title: 'Fleet pulse', text: 'Status, fuel and battery in one view.' },
  { icon: Route, title: 'Trip replay', text: 'Historic routes with driving metrics.' },
  { icon: MapPinned, title: 'Map inspection', text: 'Every last known position, on demand.' },
]

export function LoginPage() {
  const { signIn } = useAuth()
  const { pushToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginValues) => {
    setFormError(null)
    try {
      await signIn(values.email, values.password)
      pushToast('Signed in successfully.', 'success')
      navigate(from, { replace: true })
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'Could not sign in. Please try again.')
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink-950">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="pointer-events-none absolute -left-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-brand-600/25 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-52 right-[18%] h-[30rem] w-[30rem] rounded-full bg-sky-500/10 blur-[140px]" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-[1440px] lg:grid-cols-[minmax(0,1.02fr)_minmax(480px,0.98fr)]">
        <section className="relative hidden flex-col justify-between px-12 py-12 text-white lg:flex xl:px-20">
          <Link to="/" className="group inline-flex w-fit items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 shadow-lg shadow-brand-950/40 transition group-hover:bg-brand-400">
              <Truck size={20} />
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-bold tracking-tight">FleetOps</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-400">Operations cloud</span>
            </span>
          </Link>

          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Fleet command center
            </span>
            <h1 className="mt-6 text-[2.65rem] font-semibold leading-[1.08] tracking-tight xl:text-5xl">
              Every vehicle.
              <br />
              Every trip.
              <br />
              <span className="text-brand-300">One clear view.</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-ink-400">
              Sign in to monitor vehicle health, inspect historical routes and triage the alerts that need your attention.
            </p>

            <div className="mt-9 grid grid-cols-3 gap-3">
              {[
                { value: '16', label: 'Vehicles' },
                { value: '32', label: 'Trips' },
                { value: '49', label: 'Events' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur">
                  <p className="text-xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-ink-500">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="relative mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
              <svg viewBox="0 0 420 96" className="absolute inset-0 h-full w-full opacity-30" aria-hidden="true">
                <path d="M-10 70 C 70 70, 80 20, 160 28 S 280 82, 430 22" fill="none" stroke="#598dff" strokeWidth="2" strokeDasharray="6 7" />
                <path d="M-10 88 C 90 88, 110 54, 190 58 S 320 96, 430 60" fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.25" />
              </svg>
              <div className="relative grid gap-4 sm:grid-cols-3">
                {highlights.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.title}>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/15 text-brand-300 ring-1 ring-inset ring-brand-300/20">
                        <Icon size={15} />
                      </span>
                      <p className="mt-3 text-xs font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-[11px] leading-4 text-ink-500">{item.text}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-ink-600">Internal operations tool · historical sample dataset</p>
        </section>

        <main className="relative flex items-center justify-center bg-white px-5 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-[420px]">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition hover:text-ink-900"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-600 shadow-card transition group-hover:border-brand-300 group-hover:text-brand-600">
                <ArrowLeft size={15} />
              </span>
              Back to landing page
            </Link>

            <div className="mt-9 lg:hidden">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
                  <Truck size={18} />
                </span>
                <span className="text-base font-bold tracking-tight text-ink-900">FleetOps</span>
              </div>
            </div>

            <div className="mt-8 lg:mt-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">
                <ShieldCheck size={13} />
                Secure console access
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink-900">Welcome back</h2>
              <p className="mt-2 text-sm leading-6 text-ink-500">
                Sign in with your fleet operations account to continue to the dashboard.
              </p>
            </div>

            {formError && (
              <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs font-medium text-red-700">
                {formError}
              </div>
            )}

            <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-ink-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  aria-invalid={Boolean(errors.email)}
                  className={`input-control h-11 ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15' : ''}`}
                  {...register('email')}
                />
                {errors.email && <p className="mt-1.5 text-[11px] font-medium text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-semibold text-ink-700">
                    Password
                  </label>
                  <span className="text-[11px] text-ink-400">Minimum 6 characters</span>
                </div>
                <div className="relative">
                  <LockKeyhole size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    aria-invalid={Boolean(errors.password)}
                    className={`input-control h-11 pl-10 pr-11 ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15' : ''}`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-[11px] font-medium text-red-600">{errors.password.message}</p>}
              </div>

              <Button type="submit" variant="primary" disabled={isSubmitting} className="mt-2 w-full rounded-xl py-3 shadow-lg shadow-brand-600/20">
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {isSubmitting ? 'Signing in…' : 'Sign in to console'}
              </Button>
            </form>

            <div className="mt-8 flex items-center gap-3">
              <span className="h-px flex-1 bg-ink-200" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-400">Protected access</span>
              <span className="h-px flex-1 bg-ink-200" />
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-ink-200 bg-ink-50/70 p-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-ink-500 shadow-card">
                <ShieldCheck size={15} />
              </span>
              <p className="text-[11px] leading-5 text-ink-500">
                Access is limited to authenticated internal users. Ask your fleet administrator for an account; demo account
                setup is documented in the project README.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
