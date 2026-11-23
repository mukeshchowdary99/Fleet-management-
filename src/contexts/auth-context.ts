import { createContext } from 'react'

export type AuthUser = {
  id: string
  email?: string
  user_metadata: { full_name?: string }
  last_sign_in_at?: string
}

export type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
