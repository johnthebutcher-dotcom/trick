---
name: ai-cost-guardrails
description: Add per-user rate limits, daily spend caps, input size limits, timeouts and provider-down fallbacks to any AI feature so a bug or an abuser cannot run up a bill. Use whenever a new model call, pipeline or batch is added, or when the owner worries about AI costs.
---

# ai-cost-guardrails

The starter ships the first layer (`ai_usage_reserve` + `AI_DAILY_LIMIT` per user, image size cap). Every new AI surface must keep that and add what applies below.

## Checklist for every AI function

1. **Caller verified** (`getCaller`) before any work; 401 otherwise.
2. **Per-user cap** via `ai_usage_reserve(user_id, limit)` before the call; 429 with `Retry-After` when exceeded. Limit from a secret so it can be tuned without a deploy.
3. **Global daily cap**: a `ai_global_limits` row or a secret `AI_GLOBAL_DAILY_LIMIT`; sum `ai_usage.calls` for today with the service client; refuse past the cap with a message that says the app is busy, not that money ran out.
4. **Input limits**: image base64 ≤ 2,000,000 chars (set), text ≤ 8,000 chars, arrays ≤ 20 items. Reject, do not truncate silently.
5. **Output limits**: `max_tokens` sized to the schema (300-1,000), `temperature: 0` for extraction.
6. **Timeouts**: `AbortSignal.timeout(15_000)` on provider fetches; one retry on network errors only, never on 4xx.
7. **Fallback provider**: if `AI_FALLBACK_MODEL` (+ base URL/key) is set, retry once on 5xx or timeout with it; tag the response `model` so the fallback's usage is visible.
8. **Usage accounting**: record tokens with `ai_usage_record`; add a `cost_cents` estimate column if per-model prices are known.
9. **Kill switch**: secret `AI_DISABLED=true` makes the function return 503 with a friendly message; document it in the recipe so the owner can flip it from GitHub secrets in a minute.
10. **Visibility**: a small admin query (`select day, sum(calls), sum(input_tokens), sum(output_tokens) from ai_usage group by day order by day desc limit 14`) in `docs/recipes/photo-to-structured-data.md` so costs can be checked from the dashboard SQL editor.

## Client side

- Show remaining scans when close to the cap (read own `ai_usage` row).
- Disable the scan button while a call is in flight; never auto-retry on the client.
- Compress before sending (`lib/image.ts`), always.

## Provider-level

Prefer prepaid balances or hard spend limits in the provider dashboard; tell the owner to set one when they create the key. Keys per app, never shared across apps, so one can be revoked without touching the others.
