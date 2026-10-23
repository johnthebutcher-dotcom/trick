# Recipe: image upload (when a feature really needs to keep the file)

Default position: do not keep photos. A rum scanner keeps the extracted fields, not the label photo. Keep the image only when users expect to see it again (a gallery, a profile picture, a "my shelf" view).

## Storage set-up

`supabase/migrations/20261022000001_private_uploads_bucket.sql` creates a private `uploads` bucket (5 MB cap, jpeg/png/webp only) where each user may read/write only `<their-user-id>/...`. Apply it with `supabase db push`.

## Upload from the client

```ts
import { compressImage } from '@/lib/image'
import { requireSupabase } from '@/lib/supabase'

export async function uploadPhoto(file: File, userId: string) {
  const supabase = requireSupabase()
  const blob = await compressImage(file, { maxEdge: 1600, quality: 0.82 }) // ~200-400 KB
  const path = `${userId}/${crypto.randomUUID()}.jpg`
  const { error } = await supabase.storage.from('uploads').upload(path, blob, {
    contentType: 'image/jpeg',
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) throw error
  return path // store this in your table, not a URL
}
```

## Show it

Private bucket → signed URLs, short-lived:

```ts
const { data } = await supabase.storage.from('uploads').createSignedUrl(path, 60 * 60)
// data.signedUrl for <img src>, valid 1 hour
```

For public, non-sensitive images (a product catalogue you control) create a separate public bucket and use `getPublicUrl`.

## Budget

1 GB free storage ≈ 3,000-5,000 compressed photos. Keep the 1600px cap, show thumbnails via Supabase image transformations only if the plan includes them (the free tier does not), otherwise generate a 400px thumbnail client-side at upload time and store both.

## Delete with the account

`delete-account` removes `uploads/<user-id>/` before deleting the user. If you add buckets with per-user folders, add them to `BUCKETS_WITH_USER_FOLDERS` in that function.
