#!/usr/bin/env bash
# Restore a backup made by scripts/backup.sh into a fresh Supabase project.
#
# Usage:
#   SUPABASE_URL='https://new.supabase.co' SUPABASE_SERVICE_ROLE_KEY='...' \
#   scripts/restore.sh backups/my-app/20261022T120000Z.tar.gz 'postgresql://...new-project-db-url'
#
# Steps: roles -> schema -> data in one transaction with triggers disabled
# (so data is not re-processed), then storage objects. Run against an EMPTY project.
set -euo pipefail

archive="${1:-}"
db_url="${2:-}"
if [[ -z "$archive" || -z "$db_url" ]]; then
  echo "usage: scripts/restore.sh <backup.tar.gz> <target-db-url>" >&2
  exit 1
fi
: "${SUPABASE_URL:?set SUPABASE_URL for the target project}"
: "${SUPABASE_SERVICE_ROLE_KEY:?set SUPABASE_SERVICE_ROLE_KEY for the target project}"
command -v psql >/dev/null || { echo "psql not found (brew install libpq)" >&2; exit 1; }

root="$(cd "$(dirname "$0")/.." && pwd)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
tar -xzf "$archive" -C "$work"
dir="$(find "$work" -mindepth 1 -maxdepth 1 -type d | head -n 1)"

echo "==> Restoring database from $dir"
psql \
  --single-transaction \
  --variable ON_ERROR_STOP=1 \
  --file "$dir/roles.sql" \
  --file "$dir/schema.sql" \
  --command 'SET session_replication_role = replica' \
  --file "$dir/data.sql" \
  --dbname "$db_url"

echo "==> Restoring storage objects"
node "$root/scripts/storage-restore.mjs" "$dir/storage"

echo "Restore complete. Re-deploy Edge Functions and re-set secrets on the new project:"
echo "  supabase link --project-ref <ref> && supabase functions deploy --no-verify-jwt && supabase secrets set ..."
