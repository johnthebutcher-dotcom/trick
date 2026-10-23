import { z } from 'zod'

// Treat empty strings as "not set" so a half-filled .env fails loudly rather than
// producing a client pointed at an empty URL.
const optionalString = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z.string().min(1).optional(),
)

export const envSchema = z.object({
  VITE_SUPABASE_URL: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.url().optional(),
  ),
  VITE_SUPABASE_ANON_KEY: optionalString,
  VITE_APP_NAME: z.string().trim().min(1).default('Finesse'),
  /** `hash` for static previews without SPA rewrites (artifact previews, GitHub Pages). */
  VITE_ROUTER: z.enum(['browser', 'hash']).default('browser'),
  /** `1` makes the styleguide the home screen (preview builds). */
  VITE_PREVIEW: z.enum(['0', '1']).default('0'),
})

export type Env = z.infer<typeof envSchema>

/** Validate a raw env object. Exported separately so it can be unit tested. */
export function parseEnv(raw: Record<string, unknown>): Env {
  return envSchema.parse(raw)
}

export const env: Env = parseEnv(import.meta.env as unknown as Record<string, unknown>)

/** True when both Supabase values are present. The app renders a setup notice otherwise. */
export const supabaseConfigured = Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY)
