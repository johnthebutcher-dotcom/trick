import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export interface AuthState {
  /** Undefined only while the first session check is running. */
  session: Session | null
  user: User | null
  loading: boolean
  /** False when .env has no Supabase values; auth screens show the setup notice. */
  configured: boolean
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)
