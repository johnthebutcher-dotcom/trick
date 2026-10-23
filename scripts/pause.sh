#!/usr/bin/env bash
# Pause a Supabase project after a verified backup (the two-active-apps routine).
#
# Usage:
#   SUPABASE_ACCESS_TOKEN='sbp_...' scripts/pause.sh <project-ref> <path/to/backup.tar.gz>
#
# The access token is a personal token from https://supabase.com/dashboard/account/tokens
# (keep it out of the repo). Resume later from the dashboard ("Resume project").
# The free tier keeps a paused project's data for a limited time: plan on 90 days,
# do not rely on more, and keep the backup regardless.
set -euo pipefail

ref="${1:-}"
backup="${2:-}"
if [[ -z "$ref" || -z "$backup" ]]; then
  echo "usage: scripts/pause.sh <project-ref> <backup.tar.gz>" >&2
  exit 1
fi
: "${SUPABASE_ACCESS_TOKEN:?set SUPABASE_ACCESS_TOKEN (personal access token)}"
if [[ ! -s "$backup" ]]; then
  echo "Refusing to pause: backup $backup is missing or empty. Run scripts/backup.sh first." >&2
  exit 1
fi
if ! tar -tzf "$backup" >/dev/null 2>&1; then
  echo "Refusing to pause: $backup is not a readable archive." >&2
  exit 1
fi

echo "Backup verified: $backup"
read -r -p "Pause project $ref now? [y/N] " answer
[[ "$answer" == "y" || "$answer" == "Y" ]] || { echo "Cancelled."; exit 0; }

curl -sS -X POST "https://api.supabase.com/v1/projects/$ref/pause" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP %{http_code}\n"

echo "Pause requested. Record the date in docs/BUILD_LOG.md and set a reminder for 60 days."
