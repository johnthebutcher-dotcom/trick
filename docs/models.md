# Model picks

Current choices per task, with the date they were last verified. Lineups and prices change monthly, so the `choose-model` skill refreshes this file with a web search before any new AI feature is built. Treat anything older than 60 days as unknown.

| Task                      | Pick             | Fallback         | Needs image input? | Last checked | Notes                                            |
| ------------------------- | ---------------- | ---------------- | ------------------ | ------------ | ------------------------------------------------ |
| Vision / label reading    | _not yet chosen_ | _not yet chosen_ | yes                | —            | Run `choose-model` before the first scanner app. |
| OCR (text only, cheapest) | _not yet chosen_ | —                | yes                | —            |                                                  |
| Text completion / notes   | _not yet chosen_ | —                | no                 | —            |                                                  |
| Embeddings / search       | _not yet chosen_ | —                | no                 | —            |                                                  |
| Image generation (bulk)   | _not yet chosen_ | —                | no                 | —            | See `bulk-image-generation`.                     |

## How picks are made

Weigh, in this order, for each task: does it accept the input type at all; cost per call at the sizes this app sends (a ~150 KB JPEG, ~500 output tokens); quality on a 20-item eval from `ai-eval`; latency on a phone connection; privacy terms (no training on inputs). Prefer providers reachable through one OpenAI-compatible base URL so `AI_PROVIDER=openai` stays the same and only `AI_MODEL`/`AI_BASE_URL` change.

## Known constraints

- Most DeepSeek API models have been text-only; verify image support before choosing one for vision, or use the OCR-first pipeline.
- Barcode lookup (Open Food Facts for food, UPC databases for spirits) is a near-free first step and should run before any model when the item has a barcode.
