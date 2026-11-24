import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookUser, ClipboardCheck, Compass, Sparkles } from "lucide-react";

import { CompletionRing } from "@/components/dashboard/CompletionRing";
import { NotificationsList } from "@/components/dashboard/NotificationsList";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/hooks/use-account";
import { profileCompletion, readinessSteps } from "@/lib/account";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => pageHead("Dashboard", "Your TalentBridge AI dashboard.", { noindex: true }),
  component: Overview,
});

function Overview() {
  const { profile, role, user } = useAccount();
  const { percent } = profileCompletion(profile, role);
  const steps = readinessSteps(percent);
  const done = steps.filter((s) => s.status === "done").length;
  const firstName = (profile?.full_name ?? "").split(" ")[0] || user.email;

  const modules = [
    { to: "/dashboard/passport" as const, icon: BookUser, title: "Digital Skills Passport", text: "Your qualifications and experience in one place.", badge: "Coming next stage", tone: "upcoming" as const },
    { to: "/dashboard/assessment" as const, icon: ClipboardCheck, title: "Skills Assessment", text: "Understand your strengths and support needs.", badge: "Not started", tone: "upcoming" as const },
    { to: "/dashboard/readiness" as const, icon: Compass, title: "Employment Readiness Navigator", text: "Your step-by-step path toward work.", badge: `${done} of ${steps.length} steps`, tone: "current" as const },
    { to: "/dashboard/opportunities" as const, icon: Sparkles, title: "Opportunity Matching", text: "Matched opportunities will appear here.", badge: "No matches yet", tone: "upcoming" as const },
  ];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-cta p-6 text-navy-foreground shadow-lift sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-grid-navy" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow text-teal-bright">Your dashboard</p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Welcome, {firstName}</h1>
            <p className="mt-3 text-navy-muted">
              {percent < 100
                ? "Complete your profile to lay the foundation for your Digital Skills Passport."
                : "Your profile is complete. Your Digital Skills Passport is coming in the next stage."}
            </p>
            <Button variant="teal" size="pill" className="mt-6" asChild>
              <Link to="/dashboard/profile">
                {percent < 100 ? "Complete your profile" : "View your profile"}
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <CompletionRing percent={percent} />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {modules.map((m) => (
          <Link key={m.to} to={m.to} className="group rounded-3xl border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-teal/50">
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-teal-soft text-navy">
                <m.icon className="size-5" aria-hidden="true" />
              </span>
              <StatusBadge tone={m.tone}>{m.badge}</StatusBadge>
            </div>
            <h2 className="mt-4 font-semibold text-navy">{m.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{m.text}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal">
              Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy">Recent notifications</h2>
          <Link to="/dashboard/notifications" className="text-sm font-semibold text-teal hover:underline">View all</Link>
        </div>
        <NotificationsList limit={3} compact />
      </section>

      <p className="text-xs text-muted-foreground">
        Information you add is self-reported. TalentBridge AI has not verified any qualifications at this stage.
      </p>
    </div>
  );
}
