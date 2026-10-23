---
name: bulk-image-generation
description: Generate many images cheaply on RunPod serverless GPUs with batch queues, spend caps, and results stored in Supabase Storage or Cloudflare R2, with a cost estimate before every batch. Use when an app needs dozens to thousands of generated images (placeholders, catalogue art, variations) rather than a handful.
---

# bulk-image-generation

Per-image APIs are fine for a few images; bulk belongs on serverless GPU endpoints where you pay per second of compute. Never start a batch without an estimate the owner has seen.

## One-time setup (owner + you)

1. Owner creates a RunPod account, adds a small prepaid balance (this is the hard spend cap: no card on file for auto-top-up), and makes an API key → GitHub secret `RUNPOD_API_KEY`.
2. You pick a serverless endpoint: a ready template for the model family the spec needs (an SDXL/Flux-class text-to-image worker). Record endpoint id and per-second GPU price in `docs/models.md` under image generation, with the date.
3. Storage target: Supabase Storage bucket `generated` (public if the images are meant to be seen by everyone) or Cloudflare R2 when volume would exceed the 1 GB free tier. Secrets for R2 go to GitHub secrets too.

## Batch design

- `image_jobs (id, batch_id, prompt, params jsonb, status, result_path, cost_cents, error, created_at, updated_at)` with RLS deny-all (service only). A batch is a set of rows with the same `batch_id`.
- A GitHub Actions workflow `generate-images.yml` (manual, with a `batch_id` input) runs a Node script that: loads pending jobs for the batch, submits them to the RunPod endpoint in parallel groups of N, polls, downloads results, uploads to storage, updates rows with cost from the job's `executionTime × price`. Resumable: rerunning picks up only `pending`/`failed` rows.
- Spend guard in the script: refuse to start when `estimated_cost > BATCH_CAP_CENTS` (workflow input, default 500) and stop the batch when the failure rate passes 20% or the running cost passes the cap.

## Before every batch, in chat

Show: number of images, resolution, steps, estimated seconds per image from the last run (or the worker's docs), GPU price per second, total estimate with a 1.5× safety factor, and the cap. Ask the owner to confirm with one word. Then they run the workflow (or you do if you have the tools), and you report actual cost from the `image_jobs` sum.

## Quality loop

Generate 8 first, review, adjust prompt/params, then the full batch. Keep prompts and params in the job rows so a good image can be reproduced.

## Never

- Enable auto-top-up or unlimited concurrency.
- Store generated images in the repo.
- Generate real people, brands, or copyrighted characters.
