---
name: ai-eval
description: Compare models on ~20 real test inputs (e.g. bottle photos with known answers) for accuracy, cost and latency before committing to one. Use after choose-model shortlists candidates, before an AI feature ships, and whenever accuracy complaints come in.
---

# ai-eval

An eval is a folder of inputs with expected outputs and a script that runs each candidate model through the same prompt and schema, then scores them. Twenty cases is enough to tell a bad choice from a good one.

## Build the set

1. `eval/<feature>/cases/<id>.jpg` (or `.txt`) plus `eval/<feature>/cases/<id>.json` with the expected `data`. Ask the owner for real photos (the actual bottles, in normal lighting, including two bad ones: glare, angle). Fewer than 10 cases: say so and treat results as indicative only.
2. Keep `eval/` out of git by default (add to `.gitignore`) unless the owner agrees the images can live in the private repo; never commit user-submitted photos.

## Run it

Write `scripts/ai-eval.mjs` (once per app) that:

- reads `eval/<feature>/models.json`: `[{ name, provider, baseUrl, model, envKey }]`;
- for each case × model, calls the same prompt and JSON Schema the feature uses (import the zod schema and `z.toJSONSchema`), through the provider API directly (keys from environment variables, never from the repo);
- records per call: parsed ok?, per-field exact/normalised match, confidence, latency, tokens, cost from a `pricePer1kIn/Out` field in `models.json`;
- prints a table: model, field accuracy %, parse failures, p50 latency, cost per 100 calls, and writes `eval/<feature>/results-<date>.md`.

Run with the candidate keys exported in the shell (owner's desktop) or in a one-off GitHub Actions job with the keys as secrets; results file gets committed, inputs do not.

## Decide

- Pick the cheapest model within 3 points of the best accuracy on required fields.
- If every model misses the same field, fix the schema description or add a step (`stack-ai-pipeline`) rather than switching models.
- Update `docs/models.md` with the pick, the eval date and the accuracy figure. Mention the result in `docs/BUILD_LOG.md`.

## Re-run when

A model is deprecated, prices change, the schema changes, or users report wrong fields. The script and cases make this a ten-minute job.
