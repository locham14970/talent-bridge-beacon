import { cn } from "@/lib/utils";

/** TalentBridge mark: a verified arc of connected nodes spanning two shores. */
export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 40 40" className="size-9 shrink-0" aria-hidden="true">
        <rect width="40" height="40" rx="11" className="fill-navy" />
        <rect
          x="0.5"
          y="0.5"
          width="39"
          height="39"
          rx="10.5"
          className="fill-none stroke-teal/40"
        />
        <path
          d="M7 27 Q20 8 33 27"
          className="fill-none stroke-teal-bright"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path d="M7 27 H33" className="stroke-navy-foreground/70" strokeWidth="2" strokeLinecap="round" />
        <path d="M13.5 19.5 V27 M20 17.5 V27 M26.5 19.5 V27" className="stroke-teal/70" strokeWidth="1.4" />
        <circle cx="20" cy="17.5" r="2.6" className="fill-teal-bright" />
        <circle cx="7" cy="27" r="2" className="fill-navy-foreground" />
        <circle cx="33" cy="27" r="2" className="fill-navy-foreground" />
      </svg>
      <span
        className={cn(
          "font-display text-[1.05rem] font-bold tracking-tight",
          tone === "dark" ? "text-navy" : "text-navy-foreground",
        )}
      >
        TalentBridge
      </span>
    </span>
  );
}
