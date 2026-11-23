import { DatabaseZap, KeyRound, Map } from 'lucide-react'

export function ConfigRequired() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white p-7 shadow-panel">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <DatabaseZap size={22} />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-ink-900">Connect your Supabase project</h1>
        <p className="mt-2 text-sm leading-6 text-ink-600">
          FleetOps uses Supabase Auth and PostgreSQL as its real backend. Add your project credentials to a
          <code className="mx-1 rounded bg-ink-100 px-1.5 py-0.5 text-xs">.env.local</code>
          file in the project root, then restart the dev server.
        </p>
        <div className="mt-5 space-y-3 rounded-xl border border-ink-200 bg-ink-50/70 p-4">
          <div className="flex items-start gap-3">
            <KeyRound size={16} className="mt-0.5 text-brand-600" />
            <div>
              <p className="text-xs font-semibold text-ink-800">Authentication &amp; data</p>
              <pre className="mt-1 text-[11px] leading-5 text-ink-600">VITE_SUPABASE_URL=…
VITE_SUPABASE_ANON_KEY=…</pre>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Map size={16} className="mt-0.5 text-brand-600" />
            <div>
              <p className="text-xs font-semibold text-ink-800">Map tiles (optional)</p>
              <pre className="mt-1 text-[11px] leading-5 text-ink-600">VITE_MAP_STYLE_URL=https://tiles.openfreemap.org/styles/liberty</pre>
            </div>
          </div>
        </div>
        <p className="mt-5 text-xs leading-5 text-ink-500">
          Full database schema, seed scripts and demo-account steps are in <strong>README.md</strong>. No credentials are
          bundled with this source. The public landing page remains available at <code className="rounded bg-ink-100 px-1">/</code>;
          every console route requires Supabase Auth.
        </p>
      </div>
    </div>
  )
}
