import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Profile } from "./account";

export type ProfileEducation = Database["public"]["Tables"]["profile_educations"]["Row"];
export type ProfileSkill = Database["public"]["Tables"]["profile_skills"]["Row"];
export type ProfileExperience = Database["public"]["Tables"]["profile_experiences"]["Row"];
export type ProfileCareerInterests = Database["public"]["Tables"]["profile_career_interests"]["Row"];

export type ProfileDetails = {
  educations: ProfileEducation[];
  skills: ProfileSkill[];
  experiences: ProfileExperience[];
  careerInterests: ProfileCareerInterests | null;
};

export const profileDetailsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["profile-details", userId],
    queryFn: async (): Promise<ProfileDetails> => {
      const [eduRes, skillRes, expRes, interestRes] = await Promise.all([
        supabase.from("profile_educations").select("*").eq("user_id", userId).order("graduation_year", { ascending: false }),
        supabase.from("profile_skills").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
        supabase.from("profile_experiences").select("*").eq("user_id", userId).order("start_date", { ascending: false }),
        supabase.from("profile_career_interests").select("*").eq("user_id", userId).maybeSingle(),
      ]);
      if (eduRes.error) throw new Error(eduRes.error.message);
      if (skillRes.error) throw new Error(skillRes.error.message);
      if (expRes.error) throw new Error(expRes.error.message);
      if (interestRes.error) throw new Error(interestRes.error.message);
      return {
        educations: eduRes.data ?? [],
        skills: skillRes.data ?? [],
        experiences: expRes.data ?? [],
        careerInterests: interestRes.data ?? null,
      };
    },
  });

export type ProfileSectionKey = "personal" | "education" | "skills" | "experience" | "interests";

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
  ];

  const completed = sections.filter((s) => s.done).length;
  const percent = Math.round((completed / sections.length) * 100);
  return { percent, sections, missing: sections.filter((s) => !s.done) };
}