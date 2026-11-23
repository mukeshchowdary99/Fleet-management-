import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarDays, KeyRound, Loader2, LogOut, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { PageHeader, SectionHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ErrorState, Skeleton } from '../components/ui/States'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { fetchMyProfile, updateMyProfile } from '../services/auth.service'
import type { ProfileRow } from '../types/domain'
import { formatFullDate, getInitials, humanize } from '../utils/format'

const profileSchema = z.object({
  full_name: z.string().trim().min(1, 'Display name is required').max(80, 'Use 80 characters or fewer'),
})

type ProfileValues = z.infer<typeof profileSchema>

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const { pushToast } = useToast()
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setProfile(await fetchMyProfile())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load your profile.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: '' },
  })

  useEffect(() => {
    if (profile) reset({ full_name: profile.full_name })
  }, [profile, reset])

  const save = async (values: ProfileValues) => {
    try {
      const updated = await updateMyProfile(values.full_name)
      setProfile(updated)
      reset({ full_name: updated.full_name })
      pushToast('Profile updated.', 'success')
    } catch (cause) {
      pushToast(cause instanceof Error ? cause.message : 'Could not update your profile.', 'error')
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      pushToast('You have been signed out.', 'success')
    } catch {
      pushToast('Could not sign out. Please try again.', 'error')
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" description="Profile details and account information for your operations access." />

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="surface">
          <SectionHeader title="Profile" description="Your display name in the operations workspace" className="border-b border-ink-100 px-5 py-4" />
          {loading ? (
            <div className="space-y-3 p-5"><Skeleton className="h-12 w-full" /><Skeleton className="h-10 w-40" /></div>
          ) : error || !profile ? (
            <ErrorState message={error ?? 'Profile unavailable.'} onRetry={() => void load()} />
          ) : (
            <form className="space-y-4 p-5" onSubmit={handleSubmit(save)} noValidate>
              <div className="flex items-center gap-3 rounded-lg bg-ink-50 p-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {getInitials(profile.full_name || profile.email)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{profile.full_name || 'Unnamed user'}</p>
                  <p className="text-[11px] text-ink-500">{profile.email}</p>
                </div>
              </div>
              <div>
                <label htmlFor="full_name" className="mb-1.5 block text-xs font-semibold text-ink-700">Display name</label>
                <input id="full_name" className="input-control" aria-invalid={Boolean(errors.full_name)} {...register('full_name')} />
                {errors.full_name && <p className="mt-1 text-[11px] font-medium text-red-600">{errors.full_name.message}</p>}
              </div>
              <Button type="submit" variant="primary" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
                {isSubmitting ? 'Saving…' : 'Save changes'}
              </Button>
            </form>
          )}
        </div>

        <div className="surface">
          <SectionHeader title="Account" description="Authentication and access details" className="border-b border-ink-100 px-5 py-4" />
          <div className="space-y-3 p-5">
            <div className="flex items-start gap-3 rounded-lg border border-ink-200 p-3">
              <Mail size={15} className="mt-0.5 text-ink-400" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">Email</p>
                <p className="truncate text-xs font-semibold text-ink-800">{user?.email ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-ink-200 p-3">
              <ShieldCheck size={15} className="mt-0.5 text-ink-400" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">Workspace role</p>
                <p className="text-xs font-semibold text-ink-800">{profile ? humanize(profile.role) : '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-ink-200 p-3">
              <KeyRound size={15} className="mt-0.5 text-ink-400" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">User ID</p>
                <p className="truncate font-mono text-[11px] text-ink-700">{user?.id ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-ink-200 p-3">
              <CalendarDays size={15} className="mt-0.5 text-ink-400" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">Last sign in</p>
                <p className="text-xs font-semibold text-ink-800">{formatFullDate(user?.last_sign_in_at)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-ink-50 p-3">
              <UserRound size={15} className="mt-0.5 text-ink-400" />
              <p className="text-[11px] leading-5 text-ink-600">
                Sessions are persisted by Supabase Auth. Signing out clears this browser session and returns you to the login screen.
              </p>
            </div>
            <Button variant="secondary" onClick={() => void handleLogout()} className="w-full text-red-600 hover:bg-red-50">
              <LogOut size={14} /> Sign out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
