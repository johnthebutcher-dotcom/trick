import { createClient, type SupabaseClient, type User } from 'npm:@supabase/supabase-js@2'

// Supabase injects these into every Edge Function; nothing to set manually.
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

/**
 * Who is calling? Builds a client scoped to the caller's JWT and asks Auth.
 * Returns null for anonymous or invalid tokens. Every function checks this first
 * and should be deployed with --no-verify-jwt so this check is the source of truth
 * (it also works with the newer publishable keys, which are not JWTs).
 */
export async function getCaller(req: Request): Promise<User | null> {
  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) return null
  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) return null
  return data.user
}

/** A client that bypasses RLS. Only for the few operations that need it. */
export function serviceClient(): SupabaseClient {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
