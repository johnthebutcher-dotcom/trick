#!/usr/bin/env node
/**
 * Download every object in every storage bucket to <outDir>/<bucket>/<path>,
 * plus <outDir>/buckets.json with each bucket's settings. Used by backup.sh.
 * Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.
 */
import { createClient } from '@supabase/supabase-js'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const outDir = process.argv[2]
if (!outDir) {
  console.error('usage: storage-backup.mjs <outDir>')
  process.exit(1)
}
const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

async function listAll(bucket, prefix = '') {
  const files = []
  let offset = 0
  const limit = 1000
  for (;;) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit, offset })
    if (error) throw error
    for (const entry of data) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name
      if (entry.id === null) {
        files.push(...(await listAll(bucket, path))) // folder
      } else {
        files.push(path)
      }
    }
    if (data.length < limit) break
    offset += limit
  }
  return files
}

const { data: buckets, error } = await supabase.storage.listBuckets()
if (error) throw error

await mkdir(outDir, { recursive: true })
await writeFile(join(outDir, 'buckets.json'), JSON.stringify(buckets, null, 2))

let count = 0
for (const bucket of buckets) {
  const files = await listAll(bucket.name)
  for (const path of files) {
    const { data, error: dlError } = await supabase.storage.from(bucket.name).download(path)
    if (dlError) {
      console.error(`skip ${bucket.name}/${path}: ${dlError.message}`)
      continue
    }
    const target = join(outDir, bucket.name, path)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, Buffer.from(await data.arrayBuffer()))
    count++
  }
  console.log(`${bucket.name}: ${files.length} objects`)
}
console.log(`Downloaded ${count} objects from ${buckets.length} bucket(s) to ${outDir}`)
