import { afterEach, describe, expect, it } from 'vitest'
import { applyTheme, initTheme, readTheme, THEME_KEY } from './useTheme'

describe('theme', () => {
  afterEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.theme
  })

  it('defaults to dark when nothing is stored', () => {
    expect(readTheme()).toBe('dark')
    initTheme()
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('honours a stored light choice', () => {
    localStorage.setItem(THEME_KEY, 'light')
    expect(readTheme()).toBe('light')
  })

  it('ignores junk in storage', () => {
    localStorage.setItem(THEME_KEY, 'system')
    expect(readTheme()).toBe('dark')
  })

  it('applies the attribute every preset reads', () => {
    applyTheme('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
