import { cn } from "@/lib/utils";

export function CompletionRing({
  percent,
  size = 112,
  tone = "light",
  label = "Profile complete",
}: {
  percent: number;
  size?: number;
  tone?: "light" | "dark";
  label?: string;
}) {
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, percent)) / 100) * c;
  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${percent}%`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className={tone === "light" ? "stroke-navy-foreground/15" : "stroke-secondary"}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="stroke-teal-bright transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span
        className={cn(
          "absolute font-display text-2xl font-bold",
          tone === "light" ? "text-navy-foreground" : "text-navy",
        )}
      >
        {percent}%
      </span>
    </div>
  );
}
