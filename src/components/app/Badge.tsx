type BadgeProps = {
  label: string;
  variant?: "default" | "success" | "warning" | "danger" | "muted";
};

const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text))]",
  success: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40",
  warning: "bg-amber-500/15 text-amber-300 border border-amber-500/40",
  danger: "bg-rose-500/15 text-rose-300 border border-rose-500/40",
  muted:
    "bg-[rgb(var(--card))] text-[rgb(var(--muted))] border border-[rgb(var(--border-subtle))]",
};

export function Badge({ label, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        variantStyles[variant]
      }`}
    >
      {label}
    </span>
  );
}
