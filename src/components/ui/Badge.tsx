import { clsx } from "clsx";

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "accent";

const variantClasses: Record<BadgeVariant, string> = {
  default: "text-muted bg-panel border-border",
  success: "text-success bg-success/10 border-success/20",
  warning: "text-warning bg-warning/10 border-warning/20",
  danger:  "text-danger  bg-danger/10  border-danger/20",
  accent:  "text-accent  bg-accent/10  border-accent/20",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded border",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
