import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { OfflineBanner } from './OfflineBanner'

function setOnline(value: boolean) {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(value)
  window.dispatchEvent(new Event(value ? 'online' : 'offline'))
}

describe('OfflineBanner', () => {
  afterEach(() => vi.restoreAllMocks())

  it('renders nothing while online', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    render(<OfflineBanner />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('appears when the browser goes offline and disappears when it reconnects', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    render(<OfflineBanner />)

    act(() => setOnline(false))
    expect(screen.getByRole('status')).toHaveTextContent(/offline/i)

    act(() => setOnline(true))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
