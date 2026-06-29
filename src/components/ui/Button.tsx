interface ButtonProps {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

const variantClasses: Record<string, string> = {
  primary:
    "bg-primary text-white shadow-md hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-primary",
  secondary:
    "bg-secondary text-white shadow-md hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-secondary",
  outline:
    "border-2 border-primary text-primary hover:bg-primary hover:text-white focus-visible:ring-primary",
};

const sizeClasses: Record<string, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  children,
  className = "",
  type = "button",
  onClick,
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
    variantClasses[variant] ?? variantClasses.primary
  } ${sizeClasses[size] ?? sizeClasses.md} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes} data-nocms-component="ui/button">
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick}>
      {children}
    </button>
  );
}
