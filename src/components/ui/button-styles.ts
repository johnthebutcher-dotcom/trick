import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'wood'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonStyleProps {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Stretch to the container width (typical for primary actions on phones). */
  block?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:opacity-90',
  secondary: 'bg-muted text-foreground hover:bg-accent hover:text-accent-foreground',
  ghost: 'bg-transparent text-foreground hover:bg-muted',
  danger: 'bg-danger text-danger-foreground hover:opacity-90',
  // A physical wooden control. The look (texture, ink, border, pressed state)
  // is supplied by the preset's `.surface-wood` material; presets without it
  // fall back to a plain bordered button.
  wood: 'surface-wood',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-base md:h-10',
  lg: 'h-12 px-5 text-base',
}

/** The shared look, so links and buttons stay identical. */
export function buttonClasses(
  { variant = 'primary', size = 'md', block = false }: ButtonStyleProps,
  className?: string,
): string {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium select-none',
    'transition-[color,background-color,opacity,transform] duration-150 ease-soft',
    'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    block && 'w-full',
    className,
  )
}
