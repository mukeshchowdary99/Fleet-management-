import { requireClient } from '../lib/supabase'
import type { EventRow, ProfileRow } from '../types/domain'

function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('invalid login credentials')) return 'Incorrect email or password.'
  if (lower.includes('email not confirmed')) return 'Please confirm your email before signing in.'
  if (lower.includes('too many requests')) return 'Too many attempts. Please wait a moment and try again.'
  if (lower.includes('failed to fetch') || lower.includes('network')) {
    return 'Could not reach the authentication service. Check your connection and Supabase configuration.'
  }
  return message
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await requireClient().auth.signInWithPassword({ email, password })
  if (error) throw new Error(friendlyAuthError(error.message))
}

export async function signOut(): Promise<void> {
  const { error } = await requireClient().auth.signOut()
  if (error) throw new Error(error.message)
}

export async function fetchMyProfile(): Promise<ProfileRow> {
  const client = requireClient()
  const { data: authData, error: authError } = await client.auth.getUser()
  if (authError || !authData.user) throw new Error('Could not read the signed-in account.')

  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error('No profile record found for this account. Apply the Supabase migration and trigger, then retry.')

  return data
}

export async function updateMyProfile(fullName: string): Promise<ProfileRow> {
  const { data, error } = await requireClient().rpc('update_my_profile', { p_full_name: fullName })
  if (error) throw new Error(error.message)
  if (!data) throw new Error('Profile update returned no data.')
  return data
}

export async function acknowledgeEvent(eventId: string): Promise<EventRow> {
  const { data, error } = await requireClient().rpc('acknowledge_event', { p_event_id: eventId })
  if (error) throw new Error(error.message)
  if (!data) throw new Error('Acknowledgement returned no data.')
  return data
}
