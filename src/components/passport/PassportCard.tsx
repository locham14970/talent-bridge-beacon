import { Award, Briefcase, ClipboardCheck, Globe, GraduationCap, MapPin, Phone, Wrench } from "lucide-react";

import { formatMonthYear } from "@/lib/profile-schemas";

export type PassportData = {
  full_name: string;
  professional_title: string | null;
  country_of_residence: string | null;
  city: string | null;
  languages: string | null;
  bio: string | null;
  phone?: string | null;
  email?: string | null;
  educations: { institution: string; qualification: string; field_of_study: string; graduation_year: number }[];
  experiences: {
    employer: string;
    job_title: string;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
    responsibilities: string;
    achievements: string;
  }[];
  skills: { name: string; category: string }[];
  certificates: { title: string; issuer: string; created_at: string }[];
  latest_assessment: {
    technical_score: number;
    language_score: number;
    digital_score: number;
    readiness_score: number;
    overall_score: number;
    summary: string;
    completed_at: string;
  } | null;
};

export function PassportCard({ data }: { data: PassportData }) {
  const location = [data.city, data.country_of_residence].filter(Boolean).join(", ");
  const technical = data.skills.filter((s) => s.category === "technical");
  const soft = data.skills.filter((s) => s.category === "soft");

  return (
    <article className="overflow-hidden rounded-3xl border bg-card shadow-lift">
      <header className="relative bg-cta p-6 text-navy-foreground sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-grid-navy" aria-hidden="true" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="eyebrow text-teal-bright">TalentBridge AI · Digital Skills Passport</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{data.full_name || "Unnamed professional"}</h2>
            {data.professional_title && <p className="mt-1 text-base text-navy-muted">{data.professional_title}</p>}
          </div>
          <span className="w-fit rounded-full border border-navy-foreground/25 px-3 py-1 text-xs font-semibold">
            Self-reported · Not verified
          </span>
        </div>
        <div className="relative mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-navy-muted">
          {location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 text-teal-bright" aria-hidden="true" /> {location}
            </span>
          )}
          {data.languages && (
            <span className="inline-flex items-center gap-1.5">
              <Globe className="size-4 text-teal-bright" aria-hidden="true" /> {data.languages}
            </span>
          )}
          {data.phone && (
            <span className="inline-flex items-center gap-1.5">
              <Phone className="size-4 text-teal-bright" aria-hidden="true" /> {data.phone}
            </span>
          )}
        </div>
      </header>

      <div className="divide-y p-6 sm:p-8">
        {data.bio && (
          <section className="pb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-teal">Professional summary</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground whitespace-pre-line">{data.bio}</p>
          </section>
        )}

        <section className="py-6">
          <h3 className="flex items-center gap-2 text-base font-semibold text-navy">
            <Wrench className="size-4 text-teal" aria-hidden="true" /> Skills & competencies
          </h3>
          {data.skills.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No skills added yet.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {technical.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Technical</p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {technical.map((s, i) => (
                      <span key={`${s.name}-${i}`} className="rounded-full bg-teal-soft px-3 py-1 text-xs font-semibold text-navy">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {soft.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Soft skills</p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {soft.map((s, i) => (
                      <span key={`${s.name}-${i}`} className="rounded-full border bg-surface px-3 py-1 text-xs font-medium text-navy">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="py-6">
          <h3 className="flex items-center gap-2 text-base font-semibold text-navy">
            <Briefcase className="size-4 text-teal" aria-hidden="true" /> Work experience
          </h3>
          {data.experiences.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No work experience recorded yet.</p>
          ) : (
            <ul className="mt-3 space-y-4">
              {data.experiences.map((exp, i) => (
                <li key={`${exp.employer}-${i}`} className="rounded-2xl border bg-surface/50 p-4">
                  <p className="font-semibold text-navy">{exp.job_title}</p>
                  <p className="text-xs text-muted-foreground">
                    {exp.employer} · {formatMonthYear(exp.start_date)} – {exp.is_current ? "Present" : formatMonthYear(exp.end_date)}
                  </p>
                  <p className="mt-2 text-sm text-foreground whitespace-pre-line">{exp.responsibilities}</p>
                  {exp.achievements.trim() && (
                    <p className="mt-2 text-xs text-muted-foreground whitespace-pre-line">
                      <strong className="text-navy">Achievements:</strong> {exp.achievements}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="py-6">
          <h3 className="flex items-center gap-2 text-base font-semibold text-navy">
            <GraduationCap className="size-4 text-teal" aria-hidden="true" /> Education & qualifications
          </h3>
          {data.educations.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No education entries recorded yet.</p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {data.educations.map((edu, i) => (
                <li key={`${edu.institution}-${i}`} className="flex flex-wrap items-baseline justify-between gap-2 rounded-2xl border bg-surface/50 p-3.5">
                  <div>
                    <p className="font-semibold text-navy">{edu.qualification} — {edu.field_of_study}</p>
                    <p className="text-xs text-muted-foreground">{edu.institution}</p>
                  </div>
                  <span className="text-xs font-semibold text-teal">Class of {edu.graduation_year}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="py-6">
          <h3 className="flex items-center gap-2 text-base font-semibold text-navy">
            <Award className="size-4 text-teal" aria-hidden="true" /> Certificates
          </h3>
          {data.certificates.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No certificates uploaded yet.</p>
          ) : (
            <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {data.certificates.map((cert, i) => (
                <li key={`${cert.title}-${i}`} className="rounded-2xl border bg-surface/50 p-3.5">
                  <p className="font-medium text-navy">{cert.title}</p>
                  <p className="text-xs text-muted-foreground">{cert.issuer || "Self-uploaded certificate"}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="pt-6">
          <h3 className="flex items-center gap-2 text-base font-semibold text-navy">
            <ClipboardCheck className="size-4 text-teal" aria-hidden="true" /> Skills assessment results
          </h3>
          {!data.latest_assessment ? (
            <p className="mt-2 text-sm text-muted-foreground">No skills assessment completed yet.</p>
          ) : (
            <div className="mt-3 space-y-3">
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  ["Technical", data.latest_assessment.technical_score],
                  ["Language", data.latest_assessment.language_score],
                  ["Digital", data.latest_assessment.digital_score],
                  ["Readiness", data.latest_assessment.readiness_score],
                ].map(([label, score]) => (
                  <div key={String(label)} className="rounded-2xl border bg-surface/60 p-3 text-center">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 text-xl font-bold text-navy">{score}%</p>
                  </div>
                ))}
              </div>
              {data.latest_assessment.summary && (
                <p className="text-sm text-muted-foreground">{data.latest_assessment.summary}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Self-assessment guidance completed on {new Date(data.latest_assessment.completed_at).toLocaleDateString()}. Not an official certification.
              </p>
            </div>
          )}
        </section>
      </div>
    </article>
  );
}