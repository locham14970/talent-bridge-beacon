import { cn } from "@/lib/utils";

const TONES = {
  done: "bg-teal-soft text-navy border-teal/30",
  current: "bg-navy text-navy-foreground border-navy",
  upcoming: "bg-secondary text-muted-foreground border-border",
} as const;

export function StatusBadge({ tone, children }: { tone: keyof typeof TONES; children: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}
