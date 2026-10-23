import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env, supabaseConfigured } from './env'

/**
 * The single Supabase client for the app. It is `null` until .env is filled in,
 * so the starter can run and be previewed before a project exists.
 *
 * Only the anon/publishable key is ever used here. Anything that needs a secret
 * (AI providers, service role, admin actions) goes through an Edge Function.
 */
export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(env.VITE_SUPABASE_URL!, env.VITE_SUPABASE_ANON_KEY!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : null

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super(
      'Supabase is not configured. Copy .env.example to .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    )
    this.name = 'SupabaseNotConfiguredError'
  }
}

/** Use inside features that cannot work without a backend. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new SupabaseNotConfiguredError()
  return supabase
}
