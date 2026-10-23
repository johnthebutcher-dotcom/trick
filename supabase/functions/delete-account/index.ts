/**
 * delete-account: permanently deletes the calling user.
 *
 * Deleting an auth user needs the service role key, so it happens here, never in
 * the browser. All app rows go with it through `on delete cascade` from
 * auth.users (see migrations). Storage objects under <user_id>/ are removed first.
 *
 * Deploy: supabase functions deploy delete-account --no-verify-jwt
 */
import { getCaller, serviceClient } from '../_shared/auth.ts'
import { json, preflight } from '../_shared/cors.ts'

const BUCKETS_WITH_USER_FOLDERS = ['uploads']

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight()
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const user = await getCaller(req)
  if (!user) return json({ error: 'Not signed in.' }, 401)

  const admin = serviceClient()

  // Storage is not cascaded by Postgres FKs; clear the user's folders explicitly.
  for (const bucket of BUCKETS_WITH_USER_FOLDERS) {
    const { data: files, error } = await admin.storage.from(bucket).list(user.id, { limit: 1000 })
    if (error) {
      console.error(`list ${bucket}/${user.id} failed`, error)
      continue
    }
    if (files && files.length > 0) {
      const paths = files.map((f) => `${user.id}/${f.name}`)
      const { error: removeError } = await admin.storage.from(bucket).remove(paths)
      if (removeError) console.error(`remove from ${bucket} failed`, removeError)
    }
  }

  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) {
    console.error('deleteUser failed', error)
    return json({ error: 'Could not delete the account.' }, 500)
  }

  return json({ ok: true })
})
