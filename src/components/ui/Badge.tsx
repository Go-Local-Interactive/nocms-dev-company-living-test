interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "accent" | "muted";
  className?: string;
}

const variantClasses: Record<string, string> = {
  primary: "bg-primary-light text-primary-dark",
  secondary: "bg-secondary-light text-secondary-dark",
  accent: "bg-accent-light text-accent",
  muted: "bg-text/5 text-muted",
};

export function Badge({ children, variant = "primary", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
        variantClasses[variant] ?? variantClasses.primary
      } ${className}`} data-nocms-component="ui/badge"
    >
      {children}
    </span>
  );
}
