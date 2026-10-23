---
name: choose-model
description: Pick the right AI model for a task (vision, OCR, chat/text, image generation, embeddings) by cost, speed, quality and privacy, refreshing docs/models.md with a web search because lineups and prices change fast. Use before any new AI feature, when models.md is older than 60 days, or when the owner asks which model to use.
---

# choose-model

`docs/models.md` is the source of truth for picks, and it goes stale. Never pick from memory: search, verify, record the date.

## Steps

1. **Name the task and its shape.** Input type (image? how big? text length?), output (structured JSON? free text? an image?), calls per user per day, latency tolerance, and whether inputs are sensitive (user photos are).
2. **Search, today.** Three searches: "<task> model pricing <current month year>", "<provider> vision model image input pricing", and one for the cheapest viable tier ("small vision model benchmark <year>"). Read provider pricing pages, not blog summaries, for the numbers.
3. **Eliminate.** Drop any model that does not accept the input type (most DeepSeek API models have been text-only; verify before assuming any model reads images), any provider without a "no training on API inputs" policy for user photos, and anything without an OpenAI-compatible or Anthropic API (so `_shared/ai.ts` works unchanged).
4. **Cost it.** For vision: price per image at ~1024px plus ~500 output tokens; multiply by expected daily calls and the per-user cap. For text: price per 1K input/output tokens at realistic prompt sizes. Write the per-call figure down.
5. **Shortlist two:** a primary (cheapest that is clearly good enough) and a fallback from a different provider (for outages and for escalation when confidence is low).
6. **Record** in `docs/models.md`: pick, fallback, needs-image flag, last-checked date (today), per-call cost, the base URL and exact model id to put in secrets. Keep older rows' history out; the file is "current picks".
7. **Tell the owner** the two options in two lines each (cost per 1,000 scans, what it is good at) and which you chose. If the gap is small, choose; if the choice changes the product (quality vs cost), ask once.
8. **Then eval** with `ai-eval` before committing to the pick for a scanner app.

## Heuristics (verify, do not assume)

- Label reading needs a real vision model; OCR + text model is the fallback when a strong text-only model is much cheaper.
- Barcode lookups and caches beat every model on cost; see `stack-ai-pipeline`.
- Image generation in bulk belongs on serverless GPUs (`bulk-image-generation`), not per-call APIs, once volume passes a few hundred images.
- Embeddings: small, cheap, any provider; keep dimensions modest and store with `pgvector`.
