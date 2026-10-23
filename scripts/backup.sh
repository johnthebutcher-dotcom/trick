#!/usr/bin/env bash
# Full backup of a Supabase project: roles, schema, data (CLI dumps) and every
# storage object (Node script). The free tier has no automatic backups, so this
# runs before every pause and on a schedule for active apps.
#
# Usage:
#   SUPABASE_DB_URL='postgresql://...' \
#   SUPABASE_URL='https://xyz.supabase.co' \
#   SUPABASE_SERVICE_ROLE_KEY='...' \
#   scripts/backup.sh my-app
#
# Put those three values in your shell (or a git-ignored .env.backup you `source`),
# never in the repo. Output: backups/<name>/<timestamp>.tar.gz — move it somewhere
# safe (iCloud/Drive/B2); backups/ is git-ignored and the tarball holds user data.
set -euo pipefail

name="${1:-}"
if [[ -z "$name" ]]; then
  echo "usage: scripts/backup.sh <app-name>" >&2
  exit 1
fi
: "${SUPABASE_DB_URL:?set SUPABASE_DB_URL (Project Settings -> Database -> Connection string, session pooler)}"
: "${SUPABASE_URL:?set SUPABASE_URL}"
: "${SUPABASE_SERVICE_ROLE_KEY:?set SUPABASE_SERVICE_ROLE_KEY}"
command -v supabase >/dev/null || { echo "Supabase CLI not found: npm i -g supabase" >&2; exit 1; }

root="$(cd "$(dirname "$0")/.." && pwd)"
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
out="$root/backups/$name/$stamp"
mkdir -p "$out/storage"

echo "==> Dumping roles, schema and data to $out"
supabase db dump --db-url "$SUPABASE_DB_URL" -f "$out/roles.sql" --role-only
supabase db dump --db-url "$SUPABASE_DB_URL" -f "$out/schema.sql"
supabase db dump --db-url "$SUPABASE_DB_URL" -f "$out/data.sql" --use-copy --data-only \
  -x "storage.buckets_vectors" -x "storage.vector_indexes"

echo "==> Downloading storage objects"
node "$root/scripts/storage-backup.mjs" "$out/storage"

echo "==> Packing"
tar -czf "$out.tar.gz" -C "$root/backups/$name" "$stamp"
rm -rf "$out"
size="$(du -h "$out.tar.gz" | cut -f1)"
echo "Backup complete: $out.tar.gz ($size)"
echo "Verify it restores before pausing: scripts/restore.sh $out.tar.gz <new-project-db-url>"
