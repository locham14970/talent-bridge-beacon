import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookUser, Briefcase, ClipboardCheck, Compass, GraduationCap, Sparkles, Wrench } from "lucide-react";

import { CompletionRing } from "@/components/dashboard/CompletionRing";
import { NotificationsList } from "@/components/dashboard/NotificationsList";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAccount, useProfileDetails } from "@/hooks/use-account";
import { readinessSteps } from "@/lib/account";
import {
  APPLICATION_STATUS_LABELS,
  detailedProfileCompletion,
  jobApplicationsQueryOptions,
  jobMatchScore,
  jobOpportunitiesQueryOptions,
  type ApplicationStatus,
} from "@/lib/profile-data";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => pageHead("Dashboard", "Your TalentBridge dashboard.", { noindex: true }),
  component: Overview,
});

function Overview() {
  const { profile, user } = useAccount();
  const details = useProfileDetails();
  const { data: jobs = [] } = useQuery(jobOpportunitiesQueryOptions());
  const { data: applications = [] } = useQuery(jobApplicationsQueryOptions(user.id));

  const { percent } = detailedProfileCompletion(profile, details);
  const steps = readinessSteps(percent);
  const firstName = (profile?.full_name ?? "").split(" ")[0] || user.email;

  const recommended = [...jobs]
    .sort((a, b) => jobMatchScore(b, details.skills, details.careerInterests) - jobMatchScore(a, details.skills, details.careerInterests))
    .slice(0, 3);
  const jobById = new Map(jobs.map((j) => [j.id, j]));
  const recentApps = applications.slice(0, 3);

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
                : "Your profile is complete. Preview your Digital Skills Passport or explore opportunities."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="teal" size="pill" asChild>
                <Link to="/dashboard/profile">
                  {percent < 100 ? "Complete your profile" : "Manage profile"}
                  <ArrowRight />
                </Link>
              </Button>
              <Button variant="onNavy" size="pill" asChild>
                <Link to="/dashboard/passport">View Skills Passport</Link>
              </Button>
            </div>
          </div>
          <CompletionRing percent={percent} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-semibold text-navy">
              <Wrench className="size-4 text-teal" aria-hidden="true" /> Skills & qualifications
            </h2>
            <Link to="/dashboard/profile" className="text-sm font-semibold text-teal hover:underline">Edit</Link>
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Skills ({details.skills.length})</p>
              {details.skills.length === 0 ? (
                <p className="mt-1 text-sm text-muted-foreground">No skills added yet.</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {details.skills.slice(0, 8).map((s) => (
                    <span key={s.id} className="rounded-full bg-teal-soft px-2.5 py-0.5 text-xs font-semibold text-navy">{s.name}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t pt-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <GraduationCap className="size-3.5" aria-hidden="true" /> Education ({details.educations.length})
              </p>
              {details.educations.length === 0 ? (
                <p className="mt-1 text-sm text-muted-foreground">No qualifications recorded yet.</p>
              ) : (
                <ul className="mt-2 space-y-1.5 text-sm">
                  {details.educations.slice(0, 2).map((edu) => (
                    <li key={edu.id} className="text-navy">
                      <span className="font-medium">{edu.qualification}</span> · {edu.institution} ({edu.graduation_year})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-semibold text-navy">
              <Briefcase className="size-4 text-teal" aria-hidden="true" /> Recent applications
            </h2>
            <Link to="/dashboard/opportunities" className="text-sm font-semibold text-teal hover:underline">Track all</Link>
          </div>
          {recentApps.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">You have not applied to any opportunities yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentApps.map((app) => {
                const job = jobById.get(app.job_id);
                const status = app.status as ApplicationStatus;
                return (
                  <li key={app.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-surface/60 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy">{job?.title ?? "Opportunity"}</p>
                      <p className="truncate text-xs text-muted-foreground">{job?.organization_name ?? ""}</p>
                    </div>
                    <StatusBadge tone={status === "accepted" || status === "shortlisted" || status === "interview" ? "done" : "current"}>
                      {APPLICATION_STATUS_LABELS[status] ?? app.status}
                    </StatusBadge>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-navy">
            <Sparkles className="size-4 text-teal" aria-hidden="true" /> Recommended opportunities
          </h2>
          <Link to="/dashboard/opportunities" className="text-sm font-semibold text-teal hover:underline">Browse all</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {recommended.map((job) => (
            <Link key={job.id} to="/dashboard/opportunities" className="group rounded-3xl border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-teal/50">
              <div className="flex items-center justify-between gap-2">
                <StatusBadge tone="upcoming">{job.employment_type}</StatusBadge>
                {job.is_sample && <span className="text-xs text-muted-foreground">Sample</span>}
              </div>
              <h3 className="mt-3 font-semibold text-navy">{job.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{job.organization_name} · {job.location}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal">
                View role <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Link to="/dashboard/passport" className="rounded-3xl border bg-card p-5 shadow-soft hover:border-teal/50">
          <BookUser className="size-5 text-teal" aria-hidden="true" />
          <h3 className="mt-3 font-semibold text-navy">Digital Skills Passport</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {details.passportShare?.is_active ? "Sharing enabled" : "Private · Preview or share"}
          </p>
        </Link>
        <Link to="/dashboard/assessment" className="rounded-3xl border bg-card p-5 shadow-soft hover:border-teal/50">
          <ClipboardCheck className="size-5 text-teal" aria-hidden="true" />
          <h3 className="mt-3 font-semibold text-navy">Skills Assessment</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {details.latestAssessment ? `Latest score: ${details.latestAssessment.overall_score}%` : "Take your self-assessment"}
          </p>
        </Link>
        <Link to="/dashboard/readiness" className="rounded-3xl border bg-card p-5 shadow-soft hover:border-teal/50">
          <Compass className="size-5 text-teal" aria-hidden="true" />
          <h3 className="mt-3 font-semibold text-navy">Readiness Navigator</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {steps.filter((s) => s.status === "done").length} of {steps.length} milestones complete
          </p>
        </Link>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy">Recent notifications</h2>
          <Link to="/dashboard/notifications" className="text-sm font-semibold text-teal hover:underline">View all</Link>
        </div>
        <NotificationsList limit={3} compact />
      </section>

      <p className="text-xs text-muted-foreground">
        Information you add is self-reported. TalentBridge has not officially verified qualifications at this stage.
      </p>
    </div>
  );
}
