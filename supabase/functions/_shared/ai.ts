/**
 * Minimal, provider-agnostic vision call. Configured entirely by secrets:
 *
 *   AI_PROVIDER   "openai" (any OpenAI-compatible chat API: OpenAI, OpenRouter,
 *                 Gemini's OpenAI endpoint, Groq, Mistral, ...) or "anthropic"
 *   AI_BASE_URL   e.g. https://api.openai.com/v1 or https://openrouter.ai/api/v1
 *                 (ignored for anthropic)
 *   AI_MODEL      the model id; must accept image input (check docs/models.md)
 *   AI_API_KEY    the provider key
 *
 * Returns the raw text the model produced plus token usage when reported.
 */

export interface VisionRequest {
  imageBase64: string
  mime: string
  system: string
  user: string
  maxTokens?: number
}

export interface VisionResponse {
  text: string
  model: string
  usage: { input: number; output: number } | null
}

function env(name: string, fallback?: string): string {
  const value = Deno.env.get(name) ?? fallback
  if (value === undefined)
    throw new Error(`Missing secret ${name}. Set it with: supabase secrets set ${name}=...`)
  return value
}

export async function callVisionModel(req: VisionRequest): Promise<VisionResponse> {
  const provider = env('AI_PROVIDER', 'openai')
  const model = env('AI_MODEL')
  const apiKey = env('AI_API_KEY')
  const maxTokens = req.maxTokens ?? 1024

  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: req.system,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: req.mime, data: req.imageBase64 },
              },
              { type: 'text', text: req.user },
            ],
          },
        ],
      }),
    })
    if (!res.ok)
      throw new Error(`Provider error ${res.status}: ${(await res.text()).slice(0, 300)}`)
    const body = await res.json()
    const text = (body.content ?? [])
      .filter((c: { type: string }) => c.type === 'text')
      .map((c: { text: string }) => c.text)
      .join('')
    return {
      text,
      model: body.model ?? model,
      usage: body.usage
        ? { input: body.usage.input_tokens ?? 0, output: body.usage.output_tokens ?? 0 }
        : null,
    }
  }

  // OpenAI-compatible chat completions
  const baseUrl = env('AI_BASE_URL', 'https://api.openai.com/v1').replace(/\/$/, '')
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: req.system },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${req.mime};base64,${req.imageBase64}` } },
            { type: 'text', text: req.user },
          ],
        },
      ],
    }),
  })
  if (!res.ok) throw new Error(`Provider error ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const body = await res.json()
  const text: string = body.choices?.[0]?.message?.content ?? ''
  return {
    text,
    model: body.model ?? model,
    usage: body.usage
      ? { input: body.usage.prompt_tokens ?? 0, output: body.usage.completion_tokens ?? 0 }
      : null,
  }
}

/** Models sometimes wrap JSON in prose or code fences. Pull out the first object. */
export function extractJsonObject(text: string): unknown {
  const cleaned = text.replace(/```(?:json)?/gi, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start)
    throw new Error('Model did not return a JSON object.')
  return JSON.parse(cleaned.slice(start, end + 1))
}
