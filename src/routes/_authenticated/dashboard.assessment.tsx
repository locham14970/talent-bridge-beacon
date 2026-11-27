import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ClipboardCheck, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useProfileDetails } from "@/hooks/use-account";
import { supabase } from "@/integrations/supabase/client";
import { profileDetailsQueryOptions } from "@/lib/profile-data";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard/assessment")({
  head: () => pageHead("Skills Assessment", "Complete your TalentBridge Skills Assessment.", { noindex: true }),
  component: AssessmentPage,
});

type Domain = "technical" | "language" | "digital" | "readiness";

const QUESTIONS: { id: string; domain: Domain; prompt: string }[] = [
  { id: "t1", domain: "technical", prompt: "I can perform core tasks in my primary field independently." },
  { id: "t2", domain: "technical", prompt: "I can explain my past projects or qualifications clearly to an employer." },
  { id: "l1", domain: "language", prompt: "I can communicate professionally in the main workplace language of my target roles." },
  { id: "l2", domain: "language", prompt: "I can write clear emails, reports, or messages for colleagues and clients." },
  { id: "d1", domain: "digital", prompt: "I am comfortable using digital documents, spreadsheets, email, and video calls." },
  { id: "d2", domain: "digital", prompt: "I can search for jobs online, tailor a CV, and submit digital applications." },
  { id: "r1", domain: "readiness", prompt: "I understand how to prepare for structured job interviews in my target country." },
  { id: "r2", domain: "readiness", prompt: "I know which local qualifications or licensing steps apply to my profession." },
];

const LEVELS = [
  { value: 1, label: "Building" },
  { value: 2, label: "Developing" },
  { value: 3, label: "Confident" },
  { value: 4, label: "Strong" },
] as const;

function domainPercent(answers: Record<string, number>, domain: Domain): number {
  const qs = QUESTIONS.filter((q) => q.domain === domain);
  const total = qs.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
  return Math.round((total / (qs.length * 4)) * 100);
}

function AssessmentPage() {
  const user = useCurrentUser();
  const { latestAssessment } = useProfileDetails();
  const queryClient = useQueryClient();
  const [retaking, setRetaking] = useState(!latestAssessment);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const allAnswered = QUESTIONS.every((q) => typeof answers[q.id] === "number");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!allAnswered) {
      toast.error("Please answer every statement before submitting.");
      return;
    }
    const technical_score = domainPercent(answers, "technical");
    const language_score = domainPercent(answers, "language");
    const digital_score = domainPercent(answers, "digital");
    const readiness_score = domainPercent(answers, "readiness");
    const overall_score = Math.round((technical_score + language_score + digital_score + readiness_score) / 4);

    const lowest = [
      { name: "technical presentation", score: technical_score },
      { name: "workplace language", score: language_score },
      { name: "digital tools", score: digital_score },
      { name: "local employment readiness", score: readiness_score },
    ].sort((a, b) => a.score - b.score)[0];

    const summary =
      overall_score >= 75
        ? `Strong overall readiness (${overall_score}%). Continue refining ${lowest?.name ?? "your profile"} as you apply.`
        : `Solid foundation (${overall_score}%). Focusing next on ${lowest?.name ?? "core readiness"} can strengthen your applications.`;

    setSaving(true);
    const { error } = await supabase.from("skills_assessments").insert({
      user_id: user.id,
      technical_score,
      language_score,
      digital_score,
      readiness_score,
      overall_score,
      summary,
    });
    setSaving(false);
    if (error) {
      toast.error("Could not save assessment results. Please try again.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: profileDetailsQueryOptions(user.id).queryKey });
    setRetaking(false);
    toast.success("Skills assessment saved to your Digital Skills Passport");
  };

  return (
    <>
      <PageHeader
        eyebrow="Skills Assessment"
        title="Skills Assessment"
        description="Rate your current confidence across four career readiness areas. Results are saved to your Digital Skills Passport."
        actions={
          latestAssessment && !retaking ? (
            <Button type="button" variant="outline" size="pill" onClick={() => setRetaking(true)}>
              <RotateCcw /> Retake assessment
            </Button>
          ) : undefined
        }
      />

      {latestAssessment && !retaking ? (
        <div className="max-w-3xl space-y-6 rounded-3xl border bg-card p-6 shadow-soft sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-teal" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-navy">Latest results ({latestAssessment.overall_score}%)</h2>
            </div>
            <StatusBadge tone="done">Completed</StatusBadge>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              ["Technical", latestAssessment.technical_score],
              ["Language", latestAssessment.language_score],
              ["Digital", latestAssessment.digital_score],
              ["Readiness", latestAssessment.readiness_score],
            ].map(([label, score]) => (
              <div key={String(label)} className="rounded-2xl border bg-surface p-4 text-center">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-bold text-navy">{score}%</p>
              </div>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-foreground">{latestAssessment.summary}</p>
          <p className="text-xs text-muted-foreground">
            Completed on {new Date(latestAssessment.completed_at).toLocaleDateString()}. This is a self-assessment for guidance, not an official certification.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="teal" size="pill" asChild><Link to="/dashboard/passport">View on Skills Passport</Link></Button>
            <Button variant="outline" size="pill" asChild><Link to="/dashboard/opportunities">Browse opportunities</Link></Button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="max-w-3xl space-y-5 rounded-3xl border bg-card p-6 shadow-soft sm:p-8">
          <div className="flex items-center gap-2 text-navy">
            <ClipboardCheck className="size-5 text-teal" aria-hidden="true" />
            <h2 className="font-semibold">Self-assessment questionnaire</h2>
          </div>
          <ol className="space-y-4">
            {QUESTIONS.map((q, idx) => (
              <li key={q.id} className="rounded-2xl border bg-surface/60 p-4">
                <p className="text-sm font-medium text-navy">{idx + 1}. {q.prompt}</p>
                <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={q.prompt}>
                  {LEVELS.map((lvl) => {
                    const selected = answers[q.id] === lvl.value;
                    return (
                      <button
                        key={lvl.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: lvl.value }))}
                        className={cn(
                          "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                          selected ? "border-teal bg-navy text-navy-foreground" : "bg-card text-navy hover:border-teal/60",
                        )}
                      >
                        {lvl.label}
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap justify-end gap-2 border-t pt-5">
            {latestAssessment && (
              <Button type="button" variant="outline" size="pill" onClick={() => setRetaking(false)}>Cancel</Button>
            )}
            <Button type="submit" variant="teal" size="pill" disabled={saving || !allAnswered}>
              {saving && <Loader2 className="animate-spin" />} Save assessment
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
