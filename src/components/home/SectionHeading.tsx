import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "center",
  tone = "dark",
  id,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: "center" | "left";
  tone?: "dark" | "light";
  id?: string;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      <p className={cn("eyebrow", tone === "dark" ? "text-teal" : "text-teal-bright")}>{eyebrow}</p>
      <h2
        id={id}
        className={cn(
          "mt-3 text-balance text-3xl font-bold leading-tight sm:text-4xl lg:text-[2.75rem]",
          tone === "dark" ? "text-navy" : "text-navy-foreground",
        )}
      >
        {title}
      </h2>
      {intro && (
        <p
          className={cn(
            "mt-5 text-pretty text-base leading-relaxed sm:text-lg",
            tone === "dark" ? "text-muted-foreground" : "text-navy-muted",
          )}
        >
          {intro}
        </p>
      )}
    </div>
  );
}
