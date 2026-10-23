# Recipe: photo → AI → structured data

The standard way an app turns a photo into typed fields (a rum bottle label → name, distillery, country, ABV, age, tasting notes). Everything is already wired; a feature only needs a schema, instructions, and a screen.

## How it flows

```
<input type="file" capture>  →  compressImage (≤1024px JPEG, ~150 KB)
  →  supabase.functions.invoke('ai-extract', { image, instructions, schema })
      →  Edge Function: verify user → reserve 1 of AI_DAILY_LIMIT calls → call model
      →  { data, confidence, model }
  →  zod validates `data`  →  show a confirm screen (never save blind)
```

The provider key only exists in Edge Function secrets. The browser sees a JSON result, nothing else.

## 1. Define the schema (client)

```ts
// src/features/bottles/schema.ts
import { z } from 'zod'

export const bottleSchema = z.object({
  name: z.string().nullable().describe('Product name as printed on the label'),
  producer: z.string().nullable().describe('Distillery or brand'),
  country: z.string().nullable().describe('Country of origin'),
  abv: z.number().min(0).max(100).nullable().describe('Alcohol by volume as a percentage'),
  ageStatement: z.string().nullable().describe('e.g. "12 years", "XO", or null'),
  style: z.enum(['white', 'gold', 'dark', 'spiced', 'agricole', 'overproof', 'other']).nullable(),
  notes: z.array(z.string()).describe('Flavour notes printed on the label, if any'),
})
export type Bottle = z.infer<typeof bottleSchema>
```

Field `.describe()` text goes to the model, so write it like you would explain it to a person. Make unknowns `nullable()`; the function tells the model to use null rather than guess.

## 2. Call it (client)

```ts
import { extractFromImage } from '@/lib/ai'

const result = await extractFromImage({
  image: file,
  schema: bottleSchema,
  instructions:
    'This is a photo of a rum bottle. Read the label only; do not infer from brand knowledge unless the label is unreadable.',
})
// result.data is a Bottle; result.confidence is 0-1 or null
```

Show the fields in a form prefilled with `result.data`. If `confidence < 0.6`, say so above the form. Save only after the user confirms. This is what makes the feature feel reliable even when the model is not.

## 3. Deploy the function and set secrets (once per Supabase project)

```
supabase functions deploy ai-extract --no-verify-jwt
supabase secrets set AI_PROVIDER=openai \
  AI_BASE_URL=https://openrouter.ai/api/v1 \
  AI_MODEL=<a vision-capable model id> \
  AI_API_KEY=<key> \
  AI_DAILY_LIMIT=20 \
  ALLOWED_ORIGIN=https://<your-app-domain>
```

`AI_PROVIDER` is `openai` for any OpenAI-compatible endpoint (OpenAI, OpenRouter, Gemini's compatibility endpoint, Groq, Mistral) or `anthropic`. The model MUST accept image input; see `docs/models.md` and the `choose-model` skill. Text-only models (most DeepSeek API models at the time of writing) need the OCR-first pipeline in the `stack-ai-pipeline` skill instead.

## Cost guardrails already in place

- `ai_usage_reserve` (SQL) increments the user's daily count atomically and refuses past `AI_DAILY_LIMIT`; the function returns 429 and the client shows "daily limit reached".
- Image is compressed client-side; the function rejects anything over ~1.5 MB.
- Usage tokens are recorded in `ai_usage` so you can see spend per user.
- Cheaper-first: if the item has a barcode, look it up before scanning (see `stack-ai-pipeline`).

## Do not

- Call a provider from the browser, even "just for testing".
- Store the photo unless the feature needs it. Save the extracted fields.
- Trust `data` without zod: the function returns whatever the model produced.
