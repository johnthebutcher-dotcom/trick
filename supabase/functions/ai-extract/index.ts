/**
 * ai-extract: photo in, structured JSON out.
 *
 * Request (JSON, from src/lib/ai.ts):
 *   { image: { base64, mime }, instructions: string, schema: JSONSchema }
 * Response:
 *   { data: <object matching schema>, confidence: number | null, model: string }
 *
 * Guardrails: caller must be signed in; AI_DAILY_LIMIT calls per user per UTC day
 * (default 20); image capped at ~1.5 MB base64; provider key never leaves here.
 *
 * Deploy:  supabase functions deploy ai-extract --no-verify-jwt
 * Secrets: supabase secrets set AI_PROVIDER=openai AI_BASE_URL=... AI_MODEL=... AI_API_KEY=... AI_DAILY_LIMIT=20
 */
import { getCaller, serviceClient } from '../_shared/auth.ts'
import { json, preflight } from '../_shared/cors.ts'
import { callVisionModel, extractJsonObject } from '../_shared/ai.ts'

const MAX_BASE64_LENGTH = 2_000_000 // ~1.5 MB decoded; the client sends ~150 KB
const DAILY_LIMIT = Number(Deno.env.get('AI_DAILY_LIMIT') ?? '20')

interface ExtractBody {
  image?: { base64?: unknown; mime?: unknown }
  instructions?: unknown
  schema?: unknown
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight()
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const user = await getCaller(req)
  if (!user) return json({ error: 'Sign in to use this feature.' }, 401)

  let body: ExtractBody
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Body must be JSON.' }, 400)
  }

  const base64 = body.image?.base64
  const mime = body.image?.mime
  const instructions = body.instructions
  const schema = body.schema
  if (typeof base64 !== 'string' || base64.length === 0)
    return json({ error: 'image.base64 required' }, 400)
  if (base64.length > MAX_BASE64_LENGTH)
    return json({ error: 'Image too large. Compress before upload.' }, 413)
  if (typeof mime !== 'string' || !/^image\/(jpeg|png|webp)$/.test(mime))
    return json({ error: 'Unsupported image type' }, 400)
  if (typeof instructions !== 'string') return json({ error: 'instructions required' }, 400)
  if (!schema || typeof schema !== 'object') return json({ error: 'schema required' }, 400)

  // Reserve a call before paying for one.
  const admin = serviceClient()
  const { data: reserved, error: reserveError } = await admin.rpc('ai_usage_reserve', {
    p_user_id: user.id,
    p_limit: DAILY_LIMIT,
  })
  if (reserveError) {
    console.error('ai_usage_reserve failed', reserveError)
    return json({ error: 'Could not check usage. Try again.' }, 500)
  }
  if (reserved === -1) {
    return json({ error: `Daily limit of ${DAILY_LIMIT} scans reached.` }, 429, {
      'Retry-After': '3600',
    })
  }

  const system = [
    'You extract structured data from a single photo.',
    'Reply with ONE JSON object and nothing else, shaped exactly as:',
    '{"data": <object matching the JSON Schema below>, "confidence": <number 0-1>}',
    'Use null for any field you cannot read with confidence. Never invent values.',
    '"confidence" is your overall confidence that "data" is correct.',
    'JSON Schema for "data":',
    JSON.stringify(schema),
  ].join('\n')

  try {
    const result = await callVisionModel({ imageBase64: base64, mime, system, user: instructions })
    const parsed = extractJsonObject(result.text) as { data?: unknown; confidence?: unknown }
    const confidence =
      typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : null

    if (result.usage) {
      // Best effort; usage accounting must never fail the request.
      admin
        .rpc('ai_usage_record', {
          p_user_id: user.id,
          p_input: result.usage.input,
          p_output: result.usage.output,
        })
        .then(({ error }) => error && console.error('ai_usage_record failed', error))
    }

    return json({ data: parsed.data ?? null, confidence, model: result.model })
  } catch (error) {
    console.error('ai-extract failed', error)
    return json({ error: 'The scan failed. Try a clearer photo.' }, 502)
  }
})
