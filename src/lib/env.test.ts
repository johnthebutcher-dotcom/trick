import { describe, expect, it } from 'vitest'
import { parseEnv } from './env'

describe('parseEnv', () => {
  it('accepts a complete config', () => {
    const env = parseEnv({
      VITE_SUPABASE_URL: 'https://abc.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'key',
      VITE_APP_NAME: 'Rum Scanner',
    })
    expect(env.VITE_SUPABASE_URL).toBe('https://abc.supabase.co')
    expect(env.VITE_APP_NAME).toBe('Rum Scanner')
  })

  it('treats empty strings as unset and applies the default name', () => {
    const env = parseEnv({ VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' })
    expect(env.VITE_SUPABASE_URL).toBeUndefined()
    expect(env.VITE_SUPABASE_ANON_KEY).toBeUndefined()
    expect(env.VITE_APP_NAME).toBe('Finesse')
  })

  it('rejects a malformed URL instead of creating a broken client', () => {
    expect(() =>
      parseEnv({ VITE_SUPABASE_URL: 'not a url', VITE_SUPABASE_ANON_KEY: 'k' }),
    ).toThrow()
  })
})
