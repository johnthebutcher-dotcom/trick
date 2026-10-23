---
name: add-ai-feature
description: Add a photo-to-structured-data feature (or any AI call) to an app the safe, cheap way: zod schema, Edge Function with the key, per-user caps, confirm-before-save UI. Use when a spec says a photo, label, receipt, document or image should auto-fill fields, or when any model call is needed.
---

# add-ai-feature

The wiring exists: `src/lib/ai.ts` → `supabase/functions/ai-extract` → provider. A feature adds a schema, instructions, a capture screen and a confirm screen. Read `docs/recipes/photo-to-structured-data.md` first.

## Steps

1. **Check the model.** Open `docs/models.md`. If the vision pick is missing or older than 60 days, run `choose-model` first. The model must accept image input.
2. **Schema.** `src/features/<domain>/schema.ts` with zod: every field `.describe()`d in plain words, unknowns `nullable()`, enums for fixed choices, arrays for lists. Export the type. This schema is both the prompt (via JSON Schema) and the validator.
3. **Instructions.** One or two sentences naming the object and the source of truth ("Read the label only"). Put them next to the schema as a constant.
4. **Cheap path first.** If the object can carry a barcode or an id, add a lookup before the model call (`stack-ai-pipeline`). Cache by a hash of the lookup key in a table so repeat scans cost nothing.
5. **Capture screen.** `<input type="file" accept="image/*" capture="environment">` wrapped in a big primary button; show the chosen image small, a `LoadingState` with label "Reading the label" while `extractFromImage` runs, and an `ErrorState` with retry on failure. Handle the 429 message ("daily limit") as a normal, friendly state.
6. **Confirm screen.** A form prefilled from `result.data`; every field editable; if `confidence` is below 0.6, a notice above the form: "Some fields may be wrong; check before saving". Save only on explicit tap. Save extracted fields, not the photo, unless the spec says otherwise (`docs/recipes/image-upload.md`).
7. **Caps.** Confirm `AI_DAILY_LIMIT` fits the app (default 20/user/day). For anything beyond one model call per action, follow `ai-cost-guardrails`.
8. **Secrets.** Add the exact names the owner must set to `docs/SPEC.md` → "Secrets the owner must set". Never ask for values in chat; they go into GitHub repository secrets, and the `Supabase` workflow sets them on the functions.
9. **Eval.** Before calling the feature done, run `ai-eval` on ~20 real inputs if the owner can provide them, otherwise on 5 and say so in the build log.
10. **Test.** Unit-test the schema (valid, nullable, rejects junk). The UI states get a render test each.

## Variations

- **Text-only task** (summarise notes, classify): same function pattern; add a `text` field to the request instead of `image`, or a sibling function `ai-text` copying `ai-extract` minus the image. Keep caps.
- **Several photos** (front and back label): send them as one call only if the model handles multiple images; otherwise two calls merged client-side, both counted against the cap.
- **OCR-first** (text-only model): run OCR (a cheap vision model, or on-device via `Tesseract.js` if quality allows) and pass the text to the text model.
