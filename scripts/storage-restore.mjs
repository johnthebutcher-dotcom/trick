#!/usr/bin/env node
/**
 * Recreate buckets from <dir>/buckets.json and upload every file under
 * <dir>/<bucket>/... into the target project. Used by restore.sh.
 * Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY of the TARGET project.
 */
import { createClient } from '@supabase/supabase-js'
import { readFile, readdir, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'

const dir = process.argv[2]
if (!dir) {
  console.error('usage: storage-restore.mjs <dir>')
  process.exit(1)
}
const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })
const buckets = JSON.parse(await readFile(join(dir, 'buckets.json'), 'utf8'))

async function walk(root) {
  const out = []
  for (const entry of await readdir(root)) {
    const full = join(root, entry)
    if ((await stat(full)).isDirectory()) out.push(...(await walk(full)))
    else out.push(full)
  }
  return out
}

const mimeByExt = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
  json: 'application/json',
  txt: 'text/plain',
}

for (const bucket of buckets) {
  const { error } = await supabase.storage.createBucket(bucket.name, {
    public: bucket.public,
    fileSizeLimit: bucket.file_size_limit ?? undefined,
    allowedMimeTypes: bucket.allowed_mime_types ?? undefined,
  })
  if (error && !/already exists/i.test(error.message)) throw error

  const bucketDir = join(dir, bucket.name)
  let files = []
  try {
    files = await walk(bucketDir)
  } catch {
    files = []
  }
  let uploaded = 0
  for (const file of files) {
    const path = relative(bucketDir, file).split('\\').join('/')
    const ext = path.split('.').pop()?.toLowerCase() ?? ''
    const { error: upError } = await supabase.storage
      .from(bucket.name)
      .upload(path, await readFile(file), {
        upsert: true,
        contentType: mimeByExt[ext] ?? 'application/octet-stream',
      })
    if (upError) console.error(`failed ${bucket.name}/${path}: ${upError.message}`)
    else uploaded++
  }
  console.log(`${bucket.name}: uploaded ${uploaded}/${files.length}`)
}
