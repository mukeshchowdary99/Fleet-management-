const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const anonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ??
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ??
  ''
const style = import.meta.env.VITE_MAP_STYLE_URL?.trim() ?? ''

export const supabaseUrl = url
export const supabaseAnonKey = anonKey
export const isSupabaseConfigured = /^https?:\/\/.+/.test(url) && anonKey.length > 20
export const mapStyleUrl = style || 'https://tiles.openfreemap.org/styles/liberty'
