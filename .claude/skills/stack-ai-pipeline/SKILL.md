---
name: stack-ai-pipeline
description: Chain cheap-to-expensive steps for an AI feature (lookup → cache → OCR → vision → text) with confidence thresholds, caching and structured JSON, so most calls cost nothing. Use when designing any recognition or extraction feature, or when AI spend needs to come down.
---

# stack-ai-pipeline

Rule: the cheapest step that can answer runs first; escalate only when it cannot. Every step returns the same shape `{ data, confidence, source }` so the UI does not care which step answered.

## The ladder (rum scanner as the example)

1. **Barcode lookup** — if the photo or a scan contains a barcode (use `BarcodeDetector` where available, else a small WASM detector), query a product database (Open Food Facts for food/drink; a UPC lookup API for spirits). Cost ≈ 0, confidence high when found. Cache the result.
2. **Cache** — hash of the barcode or of a perceptual hash of the image → `ai_cache` table. Hits return instantly and cost nothing.
3. **OCR** — a cheap vision model (or on-device `Tesseract.js` for clean labels) returns raw label text. Feed it to a text model with the schema. Often enough.
4. **Vision model** — the primary pick from `docs/models.md`, with the full image and schema. Use when OCR text is thin or confidence is below threshold.
5. **Text enrichment** — a text model fills notes/descriptions from the extracted fields (never from the image), clearly marked as generated in the UI.

Escalate when `confidence < 0.6` or required fields are null. Stop when confidence ≥ 0.8. Record which step answered in `source`.

## Implementation

- One Edge Function per pipeline (`<thing>-identify`) that calls the steps in order; reuse `_shared/ai.ts` and `_shared/auth.ts`. Count one reservation per request against the user's cap regardless of how many steps ran.
- `ai_cache (key text primary key, data jsonb, source text, created_at)` with RLS deny-all; written and read by the function. Expire by age if the data can go stale.
- Timeouts per step (8 s) and a total budget (20 s); on timeout, return the best result so far with `confidence` lowered.
- Log `{ step, ms, tokens }` per request to `ai_usage` (extend columns if needed) so cost per answer is measurable.

## Cost estimate before building

Write in the spec: expected scans/day × (hit rate at each step × step cost). A pipeline with a 40% barcode hit rate and 30% cache hits sends only ~30% of scans to a paid model.

## UI contract

The confirm screen shows the fields, the confidence, and "from barcode" / "read from label" / "generated" badges. Users correct fields; corrections write back to the cache so the next scan of the same bottle is right and free.
