import type { Provider } from '@supabase/supabase-js'
import { requireSupabase } from '@/lib/supabase'

/** Where Supabase sends the user back after a magic link or OAuth round trip. */
export function authRedirectUrl(): string {
  return `${window.location.origin}/auth/callback`
}

/** Passwordless email sign-in. Creates the account on first use. */
export async function signInWithEmail(email: string): Promise<void> {
  const supabase = requireSupabase()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: authRedirectUrl() },
  })
  if (error) throw error
}

/**
 * OAuth sign-in. Enable each provider in Supabase → Authentication → Providers.
 * Apple is required on the App Store if any other third-party login is offered
 * (see docs/app-store/sign-in-with-apple.md).
 */
export async function signInWithProvider(provider: Extract<Provider, 'apple' | 'google'>) {
  const supabase = requireSupabase()
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: authRedirectUrl() },
  })
  if (error) throw error
}
