import { requireSupabase } from '@/lib/supabase'

/**
 * Permanently deletes the signed-in user and, through ON DELETE CASCADE, all
 * of their rows. Runs in the `delete-account` Edge Function because deleting
 * an auth user needs the service role key, which never reaches the browser.
 * Apple and Google both require in-app account deletion.
 */
export async function deleteAccount(): Promise<void> {
  const supabase = requireSupabase()
  const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' })
  if (error) throw new Error('Could not delete the account. Please try again.')
  await supabase.auth.signOut()
}
