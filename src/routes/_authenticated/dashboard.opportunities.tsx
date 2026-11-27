import { useMemo, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, Briefcase, CheckCircle2, Loader2, MapPin, Search, Send, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser, useProfileDetails } from "@/hooks/use-account";
import { supabase } from "@/integrations/supabase/client";
import {
  APPLICATION_STATUS_LABELS,
  jobApplicationsQueryOptions,
  jobMatchScore,
  jobOpportunitiesQueryOptions,
  savedJobsQueryOptions,
  type ApplicationStatus,
  type JobOpportunity,
} from "@/lib/profile-data";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard/opportunities")({
  head: () => pageHead("Job Opportunities", "Browse, save, and apply for opportunities on TalentBridge.", { noindex: true }),
  component: OpportunitiesPage,
});

type Tab = "browse" | "saved" | "applications";

function statusTone(status: ApplicationStatus): "done" | "current" | "upcoming" {
  if (status === "accepted" || status === "shortlisted" || status === "interview") return "done";
  if (status === "under_review" || status === "submitted") return "current";
  return "upcoming";
}

function OpportunitiesPage() {
  const user = useCurrentUser();
  const details = useProfileDetails();
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery(jobOpportunitiesQueryOptions());
  const { data: saved = [] } = useQuery(savedJobsQueryOptions(user.id));
  const { data: applications = [] } = useQuery(jobApplicationsQueryOptions(user.id));

  const [tab, setTab] = useState<Tab>("browse");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<JobOpportunity | null>(null);
  const [applyingJob, setApplyingJob] = useState<JobOpportunity | null>(null);
  const [coverNote, setCoverNote] = useState("");
  const [cvDocId, setCvDocId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [busyJobId, setBusyJobId] = useState<string | null>(null);

  const savedSet = useMemo(() => new Set(saved.map((s) => s.job_id)), [saved]);
  const appByJob = useMemo(() => new Map(applications.map((a) => [a.job_id, a])), [applications]);
  const jobById = useMemo(() => new Map(jobs.map((j) => [j.id, j])), [jobs]);
  const cvs = useMemo(() => details.documents.filter((d) => d.doc_type === "cv"), [details.documents]);

  const employmentTypes = useMemo(() => Array.from(new Set(jobs.map((j) => j.employment_type))).sort(), [jobs]);
  const industries = useMemo(() => Array.from(new Set(jobs.map((j) => j.industry))).sort(), [jobs]);

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = tab === "saved" ? jobs.filter((j) => savedSet.has(j.id)) : jobs;
    return base
      .filter((job) => {
        if (typeFilter !== "all" && job.employment_type !== typeFilter) return false;
        if (industryFilter !== "all" && job.industry !== industryFilter) return false;
        if (!q) return true;
        return (
          job.title.toLowerCase().includes(q) ||
          job.organization_name.toLowerCase().includes(q) ||
          job.industry.toLowerCase().includes(q) ||
          job.required_skills.some((s) => s.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => jobMatchScore(b, details.skills, details.careerInterests) - jobMatchScore(a, details.skills, details.careerInterests));
  }, [jobs, tab, savedSet, typeFilter, industryFilter, query, details.skills, details.careerInterests]);

  const toggleSave = async (jobId: string) => {
    setBusyJobId(jobId);
    const isSaved = savedSet.has(jobId);
    const res = isSaved
      ? await supabase.from("saved_jobs").delete().eq("user_id", user.id).eq("job_id", jobId)
      : await supabase.from("saved_jobs").insert({ user_id: user.id, job_id: jobId });
    setBusyJobId(null);
    if (res.error) {
      toast.error("Could not update saved job.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: savedJobsQueryOptions(user.id).queryKey });
    toast.success(isSaved ? "Removed from saved jobs" : "Job saved");
  };

  const submitApplication = async (e: FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;
    if (coverNote.trim().length > 1500) {
      toast.error("Cover note must be 1500 characters or fewer.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("job_applications").insert({
      user_id: user.id,
      job_id: applyingJob.id,
      status: "submitted",
      cover_note: coverNote.trim(),
      cv_document_id: cvDocId || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit application. You may have already applied.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: jobApplicationsQueryOptions(user.id).queryKey });
    toast.success(`Application submitted for ${applyingJob.title}`);
    setApplyingJob(null);
    setCoverNote("");
    setCvDocId("");
  };

  const withdrawApplication = async (appId: string) => {
    const { error } = await supabase.from("job_applications").delete().eq("id", appId).eq("user_id", user.id);
    if (error) {
      toast.error("Could not withdraw application.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: jobApplicationsQueryOptions(user.id).queryKey });
    toast.success("Application withdrawn");
  };

  return (
    <>
      <PageHeader
        eyebrow="Opportunities"
        title="Job Opportunities & Applications"
        description="Search by job title or skills, save roles, apply with your profile, and track every application."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {([
          ["browse", `Browse jobs (${jobs.length})`],
          ["saved", `Saved (${saved.length})`],
          ["applications", `My applications (${applications.length})`],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-current={tab === key ? "page" : undefined}
            onClick={() => setTab(key)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              tab === key ? "border-navy bg-navy text-navy-foreground" : "bg-card text-navy hover:border-teal/60",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "applications" ? (
        applications.length === 0 ? (
          <div className="rounded-3xl border border-dashed bg-card px-6 py-14 text-center">
            <Briefcase className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold text-navy">No applications yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">When you apply for an opportunity, its status will appear here.</p>
            <Button type="button" variant="teal" size="pill" className="mt-5" onClick={() => setTab("browse")}>
              Browse opportunities
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {applications.map((app) => {
              const job = jobById.get(app.job_id);
              const status = app.status as ApplicationStatus;
              return (
                <li key={app.id} className="rounded-3xl border bg-card p-5 shadow-soft">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-navy">{job?.title ?? "Opportunity"}</h2>
                        <StatusBadge tone={statusTone(status)}>{APPLICATION_STATUS_LABELS[status] ?? app.status}</StatusBadge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {job ? `${job.organization_name} · ${job.location}` : "Role details unavailable"} · Applied {new Date(app.created_at).toLocaleDateString()}
                      </p>
                      {app.cover_note && <p className="mt-3 text-sm text-foreground">{app.cover_note}</p>}
                    </div>
                    {status === "submitted" && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => withdrawApplication(app.id)}>
                        Withdraw
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 rounded-3xl border bg-card p-4 shadow-soft sm:grid-cols-[minmax(0,1fr)_12rem_14rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                aria-label="Search by job title or skills"
                placeholder="Search by job title, skill, or industry…"
                className="h-11 bg-card pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              aria-label="Filter by employment type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-11 rounded-md border border-input bg-card px-3 text-sm text-foreground"
            >
              <option value="all">All work types</option>
              {employmentTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              aria-label="Filter by industry"
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="h-11 rounded-md border border-input bg-card px-3 text-sm text-foreground"
            >
              <option value="all">All industries</option>
              {industries.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 size-5 animate-spin" /> Loading opportunities…
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="rounded-3xl border border-dashed bg-card px-6 py-14 text-center">
              <Sparkles className="mx-auto size-7 text-teal" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold text-navy">No matching opportunities</h2>
              <p className="mt-2 text-sm text-muted-foreground">Try clearing your search or filters to see all available listings.</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredJobs.map((job) => {
                const isSaved = savedSet.has(job.id);
                const application = appByJob.get(job.id);
                const score = jobMatchScore(job, details.skills, details.careerInterests);
                return (
                  <article key={job.id} className="flex flex-col justify-between rounded-3xl border bg-card p-6 shadow-soft">
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h2 className="text-lg font-semibold text-navy">{job.title}</h2>
                          <p className="text-sm text-muted-foreground">{job.organization_name}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {job.is_sample && <StatusBadge tone="upcoming">Sample listing</StatusBadge>}
                          {score > 0 && <StatusBadge tone="done">Matches your profile</StatusBadge>}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><MapPin className="size-3.5 text-teal" /> {job.location}</span>
                        <span>{job.employment_type}</span>
                        <span>{job.industry}</span>
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{job.description}</p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {job.required_skills.map((skill) => (
                          <span key={skill} className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-navy">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t pt-4">
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setSelectedJob(job)}>
                          View details
                        </Button>
                        <Button type="button" variant="ghost" size="sm" disabled={busyJobId === job.id} onClick={() => toggleSave(job.id)}>
                          {isSaved ? <BookmarkCheck className="size-4 text-teal" /> : <Bookmark className="size-4" />}
                          {isSaved ? "Saved" : "Save"}
                        </Button>
                      </div>
                      {application ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal">
                          <CheckCircle2 className="size-4" />
                          {APPLICATION_STATUS_LABELS[application.status as ApplicationStatus] ?? application.status}
                        </span>
                      ) : (
                        <Button type="button" variant="teal" size="sm" className="rounded-full" onClick={() => { setApplyingJob(job); setCvDocId(cvs[0]?.id ?? ""); }}>
                          <Send className="size-3.5" /> Apply
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4" role="dialog" aria-modal="true" aria-labelledby="job-detail-title">
          <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-3xl border bg-card p-6 shadow-lift">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="job-detail-title" className="text-xl font-bold text-navy">{selectedJob.title}</h2>
                <p className="text-sm text-muted-foreground">{selectedJob.organization_name} · {selectedJob.location}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setSelectedJob(null)} aria-label="Close job details">
                <X className="size-4" />
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <StatusBadge tone="current">{selectedJob.employment_type}</StatusBadge>
              <StatusBadge tone="upcoming">{selectedJob.industry}</StatusBadge>
              {selectedJob.is_sample && <StatusBadge tone="upcoming">Sample listing</StatusBadge>}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-foreground whitespace-pre-line">{selectedJob.description}</p>
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Required skills</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedJob.required_skills.map((s) => (
                  <span key={s} className="rounded-full bg-teal-soft px-3 py-1 text-xs font-semibold text-navy">{s}</span>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" size="pill" onClick={() => setSelectedJob(null)}>Close</Button>
              {!appByJob.has(selectedJob.id) && (
                <Button type="button" variant="teal" size="pill" onClick={() => { setApplyingJob(selectedJob); setSelectedJob(null); setCvDocId(cvs[0]?.id ?? ""); }}>
                  Apply now
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {applyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4" role="dialog" aria-modal="true" aria-labelledby="apply-job-title">
          <form onSubmit={submitApplication} className="w-full max-w-lg space-y-4 rounded-3xl border bg-card p-6 shadow-lift">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="apply-job-title" className="text-lg font-bold text-navy">Apply for {applyingJob.title}</h2>
                <p className="text-sm text-muted-foreground">{applyingJob.organization_name}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setApplyingJob(null)} aria-label="Close application form">
                <X className="size-4" />
              </Button>
            </div>
            <div>
              <Label htmlFor="apply-cv">Attach CV (optional)</Label>
              {cvs.length > 0 ? (
                <select
                  id="apply-cv"
                  value={cvDocId}
                  onChange={(e) => setCvDocId(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground"
                >
                  <option value="">No CV attached</option>
                  {cvs.map((cv) => <option key={cv.id} value={cv.id}>{cv.title} ({cv.file_name})</option>)}
                </select>
              ) : (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  No CV uploaded yet. You can still apply now or <Link to="/dashboard/profile" className="font-semibold text-teal underline">upload a CV in My Profile</Link>.
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="apply-note">Short note to the employer (optional)</Label>
              <Textarea
                id="apply-note"
                rows={4}
                className="mt-1.5 bg-card"
                placeholder="Briefly highlight why your skills and experience fit this role."
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" size="pill" onClick={() => setApplyingJob(null)}>Cancel</Button>
              <Button type="submit" variant="teal" size="pill" disabled={submitting}>
                {submitting && <Loader2 className="animate-spin" />} Submit application
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
