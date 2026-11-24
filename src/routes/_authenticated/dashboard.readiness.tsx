import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useAccount } from "@/hooks/use-account";
import { profileCompletion, readinessSteps } from "@/lib/account";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard/readiness")({
  head: () => pageHead("Employment Readiness Navigator", "Your path toward employment.", { noindex: true }),
  component: Readiness,
});

const LABEL = { done: "Done", current: "Next step", upcoming: "Coming up" } as const;

function Readiness() {
  const { profile, role } = useAccount();
  const steps = readinessSteps(profileCompletion(profile, role).percent);
  return (
    <>
      <PageHeader eyebrow="Readiness Navigator" title="Employment Readiness Navigator" description="Your step-by-step path toward meaningful work." />
      <ol className="max-w-2xl space-y-3">
        {steps.map((s, i) => (
          <li key={s.key} className={cn("flex gap-4 rounded-2xl border bg-card p-5", s.status === "current" && "border-teal shadow-teal")}>
            <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold", s.status === "done" ? "bg-teal text-teal-foreground" : "bg-secondary text-navy")}>
              {s.status === "done" ? <Check className="size-4" aria-hidden="true" /> : i + 1}
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-navy">{s.title}</h2><StatusBadge tone={s.status}>{LABEL[s.status]}</StatusBadge></div>
              <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
              {s.key === "profile" && s.status === "current" && (
                <Link to="/dashboard/profile" className="mt-2 inline-block text-sm font-semibold text-teal hover:underline">Complete profile</Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
