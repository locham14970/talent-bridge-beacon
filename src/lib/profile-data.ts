import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Profile } from "./account";

export type ProfileEducation = Database["public"]["Tables"]["profile_educations"]["Row"];
export type ProfileSkill = Database["public"]["Tables"]["profile_skills"]["Row"];
export type ProfileExperience = Database["public"]["Tables"]["profile_experiences"]["Row"];
export type ProfileCareerInterests = Database["public"]["Tables"]["profile_career_interests"]["Row"];
export type ProfileDocument = Database["public"]["Tables"]["profile_documents"]["Row"];
export type SkillsAssessment = Database["public"]["Tables"]["skills_assessments"]["Row"];
export type PassportShare = Database["public"]["Tables"]["passport_shares"]["Row"];
export type JobOpportunity = Database["public"]["Tables"]["job_opportunities"]["Row"];
export type SavedJob = Database["public"]["Tables"]["saved_jobs"]["Row"];
export type JobApplication = Database["public"]["Tables"]["job_applications"]["Row"];

export type ProfileDetails = {
  educations: ProfileEducation[];
  skills: ProfileSkill[];
  experiences: ProfileExperience[];
  careerInterests: ProfileCareerInterests | null;
  documents: ProfileDocument[];
  latestAssessment: SkillsAssessment | null;
  passportShare: PassportShare | null;
};

export const profileDetailsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["profile-details", userId],
    queryFn: async (): Promise<ProfileDetails> => {
      const [eduRes, skillRes, expRes, interestRes, docRes, assessRes, shareRes] = await Promise.all([
        supabase.from("profile_educations").select("*").eq("user_id", userId).order("graduation_year", { ascending: false }),
        supabase.from("profile_skills").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
        supabase.from("profile_experiences").select("*").eq("user_id", userId).order("start_date", { ascending: false }),
        supabase.from("profile_career_interests").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("profile_documents").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("skills_assessments").select("*").eq("user_id", userId).order("completed_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("passport_shares").select("*").eq("user_id", userId).maybeSingle(),
      ]);
      if (eduRes.error) throw new Error(eduRes.error.message);
      if (skillRes.error) throw new Error(skillRes.error.message);
      if (expRes.error) throw new Error(expRes.error.message);
      if (interestRes.error) throw new Error(interestRes.error.message);
      if (docRes.error) throw new Error(docRes.error.message);
      if (assessRes.error) throw new Error(assessRes.error.message);
      if (shareRes.error) throw new Error(shareRes.error.message);
      return {
        educations: eduRes.data ?? [],
        skills: skillRes.data ?? [],
        experiences: expRes.data ?? [],
        careerInterests: interestRes.data ?? null,
        documents: docRes.data ?? [],
        latestAssessment: assessRes.data ?? null,
        passportShare: shareRes.data ?? null,
      };
    },
  });

export const jobOpportunitiesQueryOptions = () =>
  queryOptions({
    queryKey: ["job-opportunities"],
    queryFn: async (): Promise<JobOpportunity[]> => {
      const { data, error } = await supabase
        .from("job_opportunities")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

export const savedJobsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["saved-jobs", userId],
    queryFn: async (): Promise<SavedJob[]> => {
      const { data, error } = await supabase.from("saved_jobs").select("*").eq("user_id", userId);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

export const jobApplicationsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["job-applications", userId],
    queryFn: async (): Promise<JobApplication[]> => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

export type ApplicationStatus = "submitted" | "under_review" | "shortlisted" | "interview" | "accepted" | "rejected";

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  interview: "Interview",
  accepted: "Accepted",
  rejected: "Rejected",
};

/** Count how many required skills or preferred roles/industries overlap with a job. */
export function jobMatchScore(
  job: JobOpportunity,
  skills: readonly ProfileSkill[],
  interests: ProfileCareerInterests | null,
): number {
  const userTerms = new Set<string>([
    ...skills.map((s) => s.name.toLowerCase()),
    ...(interests?.preferred_roles ?? []).map((r) => r.toLowerCase()),
    ...(interests?.industries ?? []).map((i) => i.toLowerCase()),
  ]);
  let score = 0;
  for (const req of job.required_skills) {
    const low = req.toLowerCase();
    if ([...userTerms].some((t) => t.includes(low) || low.includes(t))) score += 2;
  }
  if (interests?.industries.some((i) => job.industry.toLowerCase().includes(i.toLowerCase()))) score += 1;
  if (interests?.employment_preferences.some((p) => job.employment_type.toLowerCase().includes(p.toLowerCase()))) score += 1;
  return score;
}

export type ProfileSectionKey = "personal" | "education" | "skills" | "experience" | "interests" | "documents";

export type SectionCompletionItem = {
  key: ProfileSectionKey;
  label: string;
  done: boolean;
};

function hasText(v: string | null | undefined): boolean {
  return typeof v === "string" && v.trim().length > 0;
}

/** Computes completion across all 5 refugee profile sections. */
export function detailedProfileCompletion(
  profile: Profile | null,
  details: ProfileDetails,
): { percent: number; sections: SectionCompletionItem[]; missing: SectionCompletionItem[] } {
  const personalDone =
    hasText(profile?.full_name) &&
    hasText(profile?.country_of_residence) &&
    hasText(profile?.city) &&
    hasText(profile?.phone) &&
    hasText(profile?.bio);

  const interests = details.careerInterests;
  const interestsDone = Boolean(
    interests &&
      interests.preferred_roles.length > 0 &&
      interests.industries.length > 0 &&
      interests.employment_preferences.length > 0,
  );

  const sections: SectionCompletionItem[] = [
    { key: "personal", label: "Personal Information", done: personalDone },
    { key: "education", label: "Education", done: details.educations.length > 0 },
    { key: "skills", label: "Professional Skills", done: details.skills.length > 0 },
    { key: "experience", label: "Work Experience", done: details.experiences.length > 0 },
    { key: "interests", label: "Career Interests", done: interestsDone },
    { key: "documents", label: "CV & Certificates", done: details.documents.length > 0 },
  ];

  const completed = sections.filter((s) => s.done).length;
  const percent = Math.round((completed / sections.length) * 100);
  return { percent, sections, missing: sections.filter((s) => !s.done) };
}