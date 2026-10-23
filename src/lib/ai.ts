import { z } from 'zod'
import { requireSupabase } from './supabase'
import { blobToBase64, compressImage } from './image'

/**
 * Photo -> structured data, the starter's standard AI recipe.
 *
 * The browser never talks to an AI provider. It calls the `ai-extract` Edge
 * Function (supabase/functions/ai-extract) with the image and a JSON Schema;
 * the function holds the provider key, enforces per-user limits, calls the
 * model and returns JSON. The result is validated here against the same zod
 * schema, so callers get typed data or a thrown error, never a half-shaped object.
 */

export interface ExtractOptions<T> {
  /** The photo to analyse (a File from <input type="file" capture>). */
  image: Blob
  /** What the model should pull out of it. Field descriptions guide the model. */
  schema: z.ZodType<T>
  /** Domain instructions, e.g. "This is a rum bottle label. Fill the fields from the label only." */
  instructions: string
  /** Longest edge sent to the model. Smaller is cheaper. */
  maxEdge?: number
}

export interface ExtractResult<T> {
  data: T
  /** 0-1, as self-reported by the model. Treat < 0.6 as "ask the user to confirm". */
  confidence: number | null
  model: string
}

const responseSchema = z.object({
  data: z.unknown(),
  confidence: z.number().min(0).max(1).nullable().default(null),
  model: z.string(),
})

export async function extractFromImage<T>(options: ExtractOptions<T>): Promise<ExtractResult<T>> {
  const supabase = requireSupabase()
  const compressed = await compressImage(options.image, { maxEdge: options.maxEdge ?? 1024 })
  const base64 = await blobToBase64(compressed)

  const { data, error } = await supabase.functions.invoke('ai-extract', {
    body: {
      image: { base64, mime: compressed.type || 'image/jpeg' },
      instructions: options.instructions,
      schema: z.toJSONSchema(options.schema),
    },
  })
  if (error) throw new Error(describeFunctionError(error))

  const envelope = responseSchema.parse(data)
  const parsed = options.schema.safeParse(envelope.data)
  if (!parsed.success) {
    throw new Error('The model returned data in an unexpected shape. Try a clearer photo.')
  }
  return { data: parsed.data, confidence: envelope.confidence, model: envelope.model }
}

function describeFunctionError(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message: unknown }).message)
    if (/429/.test(message))
      return 'You have hit the daily limit for photo scans. Try again tomorrow.'
    return message
  }
  return 'The scan failed. Check your connection and try again.'
}
