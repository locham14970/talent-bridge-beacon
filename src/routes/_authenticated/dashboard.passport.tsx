import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/hooks/use-account";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/dashboard/passport")({
  head: () => pageHead("Digital Skills Passport", "Preview your Digital Skills Passport.", { noindex: true }),
  component: Passport,
});

function Passport() {
  const { profile } = useAccount();
  const rows = [
    ["Professional title", profile?.professional_title],
    ["Country of residence", profile?.country_of_residence],
    ["Years of experience", profile?.years_experience?.toString()],
    ["Highest education", profile?.highest_education],
    ["Languages", profile?.languages],
  ] as const;
  return (
    <>
      <PageHeader
        eyebrow="Skills Passport"
        title="Digital Skills Passport"
        description="A preview built from your profile. The full passport builder arrives in the next stage."
        actions={<Button variant="navy" size="pill" asChild><Link to="/dashboard/profile">Edit details</Link></Button>}
      />
      <div className="max-w-2xl rounded-3xl bg-cta p-6 text-navy-foreground shadow-lift sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-teal-bright">TalentBridge AI · Skills Passport</p>
            <h2 className="mt-2 text-2xl font-bold">{profile?.full_name || "Your name"}</h2>
          </div>
          <span className="rounded-full border border-navy-foreground/25 px-3 py-1 text-xs font-semibold">Self-reported · Not verified</span>
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-navy-muted">{k}</dt>
              <dd className="mt-0.5 font-medium">{v || "Not added yet"}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="mt-8 rounded-3xl border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-3"><h2 className="font-semibold text-navy">Coming in the next stage</h2><StatusBadge tone="upcoming">Planned</StatusBadge></div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Add qualifications, certificates and work history</li>
          <li>Record your skills and the evidence behind them</li>
          <li>Choose what to share, and with whom</li>
        </ul>
      </div>
    </>
  );
}
