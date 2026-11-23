import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Building2,
  Bus,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Fuel,
  Gauge,
  LayoutDashboard,
  MapPinned,
  Menu,
  Navigation,
  Package,
  Route,
  ShieldCheck,
  Truck,
  Users,
  Wrench,
  X,
  Zap,
} from 'lucide-react'
import heroFleet from '../assets/landing/hero-fleet.svg'
import featureTracking from '../assets/landing/feature-tracking.svg'
import featureAnalytics from '../assets/landing/feature-analytics.svg'
import featureSafety from '../assets/landing/feature-safety.svg'
import featureOperations from '../assets/landing/feature-operations.svg'

type Feature = {
  id: string
  icon: LucideIcon
  label: string
  title: string
  text: string
  bullets: string[]
  image: string
}

type Step = {
  icon: LucideIcon
  title: string
  text: string
}

type UseCase = {
  icon: LucideIcon
  title: string
  text: string
}

type Faq = {
  question: string
  answer: string
}

const navLinks = [
  { label: 'Platform', href: '#platform' },
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Use cases', href: '#use-cases' },
  { label: 'FAQ', href: '#faq' },
]

const features: Feature[] = [
  {
    id: 'live-tracking',
    icon: MapPinned,
    label: 'Live tracking',
    title: 'Know where every vehicle is',
    text: 'See each vehicle on a real map with its current status, last known position and health readings. Open a vehicle to inspect its recent movement without leaving the dashboard.',
    bullets: ['Status-coded map markers', 'Latest position and last-seen time', 'Historical point and route layers'],
    image: featureTracking,
  },
  {
    id: 'trip-intelligence',
    icon: BarChart3,
    label: 'Trip intelligence',
    title: 'Turn trips into decisions',
    text: 'Review every journey with distance, duration, speed, idle time and halt counts. Charts and tables make it easy to spot patterns across drivers, routes and vehicles.',
    bullets: ['Searchable trip history', 'Route replay with GeoJSON paths', 'Trend and event breakdown charts'],
    image: featureAnalytics,
  },
  {
    id: 'alerts',
    icon: ShieldCheck,
    label: 'Safety & alerts',
    title: 'Act on problems before they escalate',
    text: 'Overspeeding, low fuel, low battery, long idle time and offline vehicles surface in a prioritized attention queue, so operators can triage what matters first.',
    bullets: ['Severity and type filters', 'Vehicle-specific alert history', 'Persisted acknowledgement workflow'],
    image: featureSafety,
  },
  {
    id: 'operations',
    icon: LayoutDashboard,
    label: 'One workspace',
    title: 'Built for the whole operations team',
    text: 'Dispatchers, fleet managers and safety leads share one view. Deep links carry vehicle and trip selection, so a discussion can start from the exact record everyone is looking at.',
    bullets: ['Shared, role-aware workspace', 'Fast search and quick navigation', 'Detail drawers that survive refresh'],
    image: featureOperations,
  },
]

const pillars: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Navigation, title: 'Visibility', text: 'Continuous location and status context for every asset.' },
  { icon: ShieldCheck, title: 'Safety', text: 'Early signals for risky driving and vehicle health issues.' },
  { icon: Fuel, title: 'Efficiency', text: 'Less idle time, better routing and more predictable fuel use.' },
  { icon: Users, title: 'Accountability', text: 'Trip and driver records that make performance review concrete.' },
]

const steps: Step[] = [
  { icon: Truck, title: 'Connect your vehicles', text: 'Register vehicles, assign drivers and keep a single source of truth for your fleet roster.' },
  { icon: Route, title: 'Capture trips and events', text: 'Location pings, trip milestones and health events accumulate into a searchable operational history.' },
  { icon: Gauge, title: 'Review and improve', text: 'Use dashboards and trip detail views to coach drivers, plan maintenance and improve service reliability.' },
]

const useCases: UseCase[] = [
  { icon: Package, title: 'Delivery fleets', text: 'Track last-mile progress, investigate delays and give support teams accurate trip context.' },
  { icon: Wrench, title: 'Field service', text: 'Match jobs to nearby vehicles, monitor idle time and review route adherence at the end of the day.' },
  { icon: Bus, title: 'Passenger transport', text: 'Watch schedule performance, respond to breakdowns and keep a clear record of each journey.' },
  { icon: Building2, title: 'Enterprise fleets', text: 'Give regional teams one dashboard while keeping alert triage and vehicle history consistent.' },
]

const faqs: Faq[] = [
  {
    question: 'What is fleet management?',
    answer:
      'Fleet management is the process of tracking and coordinating vehicles, drivers, trips and maintenance so an organization can improve utilization, safety and service reliability. A fleet management platform brings that information into one operational view.',
  },
  {
    question: 'Does this landing page need a database?',
    answer:
      'No. This page is completely static React content with local illustrations. The dashboard behind it uses Supabase for authentication and persistent vehicle, trip, location and alert data.',
  },
  {
    question: 'Can I preview the product without signing up?',
    answer:
      'The landing page can be viewed without signing in because it is public. The operations console is protected and requires a Supabase Auth account. Create a demo user in your Supabase project, then sign in at /login.',
  },
  {
    question: 'Is the map data live GPS telemetry?',
    answer:
      'The sample dataset is historical and generated for demonstration. Production use would connect your own vehicle tracking devices or telematics provider and stream real location updates into the backend.',
  },
  {
    question: 'What can operators do in the dashboard?',
    answer:
      'They can inspect fleet status, search vehicles, follow historical routes, review trip metrics, filter and acknowledge alerts, and update their own profile from a single workspace.',
  },
]

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-ink-500 sm:text-base">{text}</p>
    </div>
  )
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-ink-200/80 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 sm:px-8" aria-label="Main navigation">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Truck size={19} />
            </span>
            <span className="text-base font-bold tracking-tight text-ink-900">FleetOps</span>
          </Link>

          <div className="ml-4 hidden items-center gap-5 lg:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-xs font-semibold text-ink-600 transition hover:text-brand-700">
                {link.label}
              </a>
            ))}
          </div>

          <div className="ml-auto hidden items-center gap-2 sm:flex">
            <Link to="/login" className="btn-ghost text-xs">Sign in</Link>
            <Link to="/dashboard" className="btn-primary text-xs">
              Open dashboard <ArrowRight size={14} />
            </Link>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="ml-auto rounded-lg p-2 text-ink-700 hover:bg-ink-100 lg:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-ink-200 bg-white px-5 py-3 lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex gap-2 border-t border-ink-100 pt-3">
                <Link to="/login" className="btn-secondary flex-1 text-xs">Sign in</Link>
                <Link to="/dashboard" className="btn-primary flex-1 text-xs">Open dashboard</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        <section id="platform" className="relative overflow-hidden bg-ink-950 text-white">
          <div className="pointer-events-none absolute -right-32 -top-40 h-[420px] w-[420px] rounded-full bg-brand-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -left-24 h-[360px] w-[360px] rounded-full bg-brand-500/10 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-brand-200">
                <Zap size={13} /> Fleet operations, made clear
              </span>
              <h1 className="mt-6 text-3xl font-semibold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">
                Every vehicle, trip and alert in one calm workspace.
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-ink-300 sm:text-base">
                FleetOps gives operations teams a practical view of their fleet: where vehicles are, what happened on each trip and which issues need attention now. Less switching between tools, faster decisions on the ground.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/dashboard" className="btn-primary px-5 py-3 text-sm">
                  Explore the dashboard <ArrowRight size={16} />
                </Link>
                <a href="#features" className="btn border border-white/20 px-5 py-3 text-sm text-white hover:bg-white/10">
                  See what it does
                </a>
              </div>
              <p className="mt-4 text-[11px] text-ink-400">
                No sign-up needed for the local preview · labelled demo data · real backend when you connect Supabase
              </p>

              <div className="mt-12 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
                {[
                  ['16', 'vehicles'],
                  ['32', 'sample trips'],
                  ['14', 'route points / trip'],
                  ['45+', 'fleet events'],
                ].map(([value, label]) => (
                  <div key={label}>
                    <p className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{value}</p>
                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[36px] bg-brand-500/10 blur-2xl" />
              <img src={heroFleet} alt="Fleet operations map with status markers and alert cards" className="relative w-full rounded-2xl shadow-2xl" />
              <div className="absolute -bottom-4 left-4 flex items-center gap-2 rounded-xl border border-white/10 bg-ink-900/90 px-3 py-2 text-[11px] font-medium text-white shadow-panel backdrop-blur sm:left-8">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Historical sample data · not live telemetry
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-ink-200 bg-white py-14">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading
              eyebrow="Why it matters"
              title="Fleet management is about answers, not just maps"
              text="A tracking screen is useful only when it helps someone act. FleetOps connects location, trips, driver context and health events so the next step is obvious."
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {pillars.map((pillar) => {
                const Icon = pillar.icon
                return (
                  <div key={pillar.title} className="rounded-xl border border-ink-200 bg-ink-50/60 p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand-600 shadow-card">
                      <Icon size={19} />
                    </span>
                    <h3 className="mt-4 text-sm font-semibold text-ink-900">{pillar.title}</h3>
                    <p className="mt-1.5 text-xs leading-5 text-ink-500">{pillar.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section id="features" className="bg-ink-50 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading
              eyebrow="Platform capabilities"
              title="The tools an operations team actually opens every day"
              text="Four connected views cover the full loop: see the fleet, inspect the journey, handle the exception and learn from the record."
            />

            <div className="mt-12 space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                const reverse = index % 2 === 1
                return (
                  <div
                    key={feature.id}
                    id={feature.id}
                    className="surface grid overflow-hidden lg:grid-cols-2"
                  >
                    <div className={`p-6 sm:p-9 ${reverse ? 'lg:order-2' : ''}`}>
                      <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-[11px] font-semibold text-brand-700">
                        <Icon size={13} /> {feature.label}
                      </span>
                      <h3 className="mt-5 text-xl font-semibold tracking-tight text-ink-900">{feature.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-ink-500">{feature.text}</p>
                      <ul className="mt-6 space-y-2.5">
                        {feature.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-2.5 text-xs font-medium text-ink-700">
                            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                      <Link to="/dashboard" className="mt-7 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900">
                        See it in the dashboard <ArrowRight size={14} />
                      </Link>
                    </div>
                    <div className={`flex items-center bg-gradient-to-br from-brand-50 to-ink-50 p-5 sm:p-8 ${reverse ? 'lg:order-1' : ''}`}>
                      <img src={feature.image} alt={feature.title} className="w-full rounded-xl shadow-card" loading="lazy" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading
              eyebrow="How it works"
              title="From raw movement to useful insight in three steps"
              text="The workflow mirrors how a real fleet team operates, from vehicle records to daily review."
            />
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={step.title} className="relative rounded-xl border border-ink-200 bg-white p-6 shadow-card">
                    <span className="absolute right-5 top-4 text-4xl font-bold text-ink-100">0{index + 1}</span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-600 text-white">
                      <Icon size={20} />
                    </span>
                    <h3 className="mt-5 text-base font-semibold text-ink-900">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink-500">{step.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section id="use-cases" className="bg-ink-50 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading
              eyebrow="Use cases"
              title="One fleet view, many kinds of fleets"
              text="Delivery, service, transport and enterprise teams all ask the same core questions about their vehicles."
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {useCases.map((useCase) => {
                const Icon = useCase.icon
                return (
                  <div key={useCase.title} className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
                    <Icon size={22} className="text-brand-600" />
                    <h3 className="mt-4 text-sm font-semibold text-ink-900">{useCase.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-ink-500">{useCase.text}</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 grid gap-4 rounded-2xl bg-ink-950 p-6 text-white sm:grid-cols-3 sm:p-8">
              {[
                { icon: Clock3, title: 'Faster triage', text: 'Prioritized alerts put the issues that matter at the top.' },
                { icon: BellRing, title: 'Clearer handovers', text: 'Shared records keep shifts and teams aligned.' },
                { icon: Gauge, title: 'Measurable habits', text: 'Trip metrics make coaching and maintenance concrete.' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="flex gap-3 border-white/10 sm:border-r sm:pr-6 sm:last:border-0">
                    <Icon size={19} className="mt-0.5 shrink-0 text-brand-300" />
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-ink-400">{item.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">What you get</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">A dashboard built around real operational questions</h2>
                <p className="mt-4 text-sm leading-7 text-ink-500">
                  Instead of burying teams in raw telemetry, FleetOps answers the questions that come up every shift: Which vehicles are moving? Who needs help? What happened on this route? Which alerts are still open?
                </p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {[
                    'Fleet status and attention KPIs',
                    'Map with selectable vehicle markers',
                    'Trip table with detail routes',
                    'Alert queue with acknowledgement',
                    'Driver and vehicle context',
                    'Profile and account settings',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 rounded-lg border border-ink-200 px-3 py-2.5 text-xs font-medium text-ink-700">
                      <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-ink-50 p-5 sm:p-8">
                <img src={featureOperations} alt="Fleet operations cards for multiple vehicles" className="w-full rounded-xl shadow-panel" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="bg-ink-50 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <SectionHeading
              eyebrow="FAQ"
              title="Common questions"
              text="A few things people ask before exploring the preview."
            />
            <div className="mt-10 space-y-3">
              {faqs.map((faq) => (
                <details key={faq.question} className="group rounded-xl border border-ink-200 bg-white p-4 shadow-card">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink-900 marker:hidden">
                    {faq.question}
                    <ChevronDown size={16} className="shrink-0 text-ink-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-ink-500">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-brand-700 py-14 text-white">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 px-5 text-center sm:px-8">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ready to see the workspace?</h2>
            <p className="max-w-2xl text-sm leading-6 text-brand-100">
              Sign in with your Supabase account to explore maps, trips and alerts backed by real persisted fleet data.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/dashboard" className="btn bg-white px-5 py-3 text-sm text-brand-800 hover:bg-brand-50">
                Open dashboard <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn border border-white/30 px-5 py-3 text-sm text-white hover:bg-white/10">
                Go to sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Truck size={19} />
              </span>
              <span className="text-base font-bold tracking-tight text-ink-900">FleetOps</span>
            </div>
            <p className="mt-4 max-w-xs text-xs leading-5 text-ink-500">
              A focused operations console for vehicle visibility, trip history and fleet health.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-900">Platform</p>
            <div className="mt-3 space-y-2 text-xs text-ink-500">
              <a href="#platform" className="block hover:text-brand-700">Overview</a>
              <a href="#features" className="block hover:text-brand-700">Features</a>
              <a href="#how-it-works" className="block hover:text-brand-700">How it works</a>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-900">Resources</p>
            <div className="mt-3 space-y-2 text-xs text-ink-500">
              <a href="#use-cases" className="block hover:text-brand-700">Use cases</a>
              <a href="#faq" className="block hover:text-brand-700">FAQ</a>
              <Link to="/dashboard" className="block hover:text-brand-700">Dashboard preview</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-900">Account</p>
            <div className="mt-3 space-y-2 text-xs text-ink-500">
              <Link to="/login" className="block hover:text-brand-700">Sign in</Link>
              <Link to="/settings" className="block hover:text-brand-700">Settings</Link>
              <Link to="/alerts" className="block hover:text-brand-700">Alerts</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-ink-100 px-5 py-5 text-center text-[11px] text-ink-400">
          © {new Date().getFullYear()} FleetOps. Internal fleet operations demo.
        </div>
      </footer>
    </div>
  )
}
