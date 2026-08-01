import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "ghost-inverse";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-primary text-text-inverse hover:bg-accent-primary-hover",
  secondary:
    "bg-surface-page text-accent-primary border border-accent-primary hover:bg-accent-primary hover:text-text-inverse",
  ghost: "bg-transparent text-accent-primary hover:bg-surface-accent",
  "ghost-inverse":
    "bg-transparent text-text-inverse border border-border-inverse hover:bg-white/10",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-[52px] px-7 text-lg",
};

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-semibold transition-colors",
          "duration-[var(--motion-fast)] ease-[var(--ease-confident)] disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <span aria-hidden className="animate-spin">⟳</span> : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
