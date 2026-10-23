import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router'
import { Spinner } from './Spinner'
import { buttonClasses, type ButtonStyleProps } from './button-styles'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps {
  /** Shows a spinner and disables the button. */
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant,
    size,
    block,
    loading = false,
    className,
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      data-variant={variant ?? 'primary'}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, block }, className)}
      {...rest}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  )
})

export interface ButtonLinkProps extends LinkProps, ButtonStyleProps {}

/** A router link that looks like a button. Use for navigation, not actions. */
export function ButtonLink({ variant, size, block, className, ...rest }: ButtonLinkProps) {
  return (
    <Link
      data-variant={variant ?? 'primary'}
      className={buttonClasses({ variant, size, block }, className)}
      {...rest}
    />
  )
}
