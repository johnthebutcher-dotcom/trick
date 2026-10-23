/**
 * View Transitions helper. Runs `update` inside document.startViewTransition
 * when the browser supports it and the user has not asked for reduced motion;
 * otherwise runs it immediately. `kind` selects a CSS treatment via
 * [data-vt] on <html> (see effects-catalog.css); `origin` positions a wipe.
 */
export interface TransitionOptions {
  kind?: 'theme' | 'default'
  origin?: { x: number; y: number }
}

type DocWithVT = Document & {
  startViewTransition?: (cb: () => void | Promise<void>) => { finished: Promise<void> }
}

export function reducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

export async function withViewTransition(
  update: () => void,
  { kind = 'default', origin }: TransitionOptions = {},
): Promise<void> {
  const doc = document as DocWithVT
  if (!doc.startViewTransition || reducedMotion()) {
    update()
    return
  }
  const root = document.documentElement
  if (kind !== 'default') root.dataset.vt = kind
  if (origin) {
    root.style.setProperty('--vt-x', `${origin.x}px`)
    root.style.setProperty('--vt-y', `${origin.y}px`)
  }
  try {
    await doc.startViewTransition(update).finished
  } finally {
    delete root.dataset.vt
    root.style.removeProperty('--vt-x')
    root.style.removeProperty('--vt-y')
  }
}
