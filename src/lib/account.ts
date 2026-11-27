import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type AppNotification = Database["public"]["Tables"]["notifications"]["Row"];

/** Roles a visitor may pick for themselves at registration. Administrator is never self-assigned. */
export const SELF_SERVICE_ROLES = ["refugee", "employer"] as const;
export type SelfServiceRole = (typeof SELF_SERVICE_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  refugee: "Refugee / User",
  employer: "Employer",
  admin: "Administrator",
};

export type RoleHome = "/dashboard" | "/employer" | "/admin";

/** Where each role lands after signing in or registering. */
export function roleHome(role: AppRole): RoleHome {
  if (role === "admin") return "/admin";
  if (role === "employer") return "/employer";
  return "/dashboard";
}

/** A person can hold several roles; the most privileged one decides their dashboard. */
export function primaryRole(roles: readonly AppRole[]): AppRole {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("employer")) return "employer";
  return "refugee";
}

type ProfileField = Exclude<keyof Profile, "id" | "created_at" | "updated_at">;

export const PROFILE_FIELD_LABELS: Record<ProfileField, string> = {
  full_name: "Full name",
  country_of_residence: "Country of residence",
  city: "City",
  phone: "Phone number",
  professional_title: "Professional title",
  years_experience: "Years of experience",
  highest_education: "Highest education",
  languages: "Languages",
  bio: "Short bio",
  organization_name: "Organisation name",
};

export const COMPLETION_FIELDS: Record<AppRole, readonly ProfileField[]> = {
  refugee: [
    "full_name",
    "country_of_residence",
    "city",
    "phone",
    "professional_title",
    "years_experience",
    "highest_education",
    "languages",
    "bio",
  ],
  employer: ["full_name", "country_of_residence", "organization_name", "professional_title", "phone", "bio"],
  admin: ["full_name", "country_of_residence"],
};

function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

export function profileCompletion(
  profile: Partial<Record<ProfileField, unknown>> | null,
  role: AppRole,
): { percent: number; missing: string[] } {
  const fields = COMPLETION_FIELDS[role];
  const missing = fields.filter((f) => !isFilled(profile?.[f]));
  const percent = Math.round(((fields.length - missing.length) / fields.length) * 100);
  return { percent, missing: missing.map((f) => PROFILE_FIELD_LABELS[f]) };
}

export type ReadinessStatus = "done" | "current" | "upcoming";
export type ReadinessStep = {
  key: string;
  title: string;
  description: string;
  status: ReadinessStatus;
};

/** Employment Readiness Navigator steps for refugee users, based on what exists today. */
export function readinessSteps(profilePercent: number): ReadinessStep[] {
  const profileDone = profilePercent >= 100;
  return [
    {
      key: "account",
      title: "Create your account",
      description: "Your TalentBridge account is set up.",
      status: "done",
    },
    {
      key: "profile",
      title: "Complete your profile",
      description: profileDone
        ? "Your profile details are complete."
        : `Your profile is ${profilePercent}% complete. Add the missing details.`,
      status: profileDone ? "done" : "current",
    },
    {
      key: "passport",
      title: "Build your Digital Skills Passport",
      description: "Document your qualifications, experience and skills in one place.",
      status: profileDone ? "current" : "upcoming",
    },
    {
      key: "assessment",
      title: "Take the Skills Assessment",
      description: "Understand your strengths and where support could help.",
      status: "upcoming",
    },
    {
      key: "opportunities",
      title: "Explore matched opportunities",
      description: "See opportunities that fit your skills once they become available.",
      status: "upcoming",
    },
  ];
}

export async function fetchPrimaryRole(userId: string): Promise<AppRole> {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error(error.message);
  return primaryRole((data ?? []).map((r) => r.role));
}

export const accountQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["account", userId],
    queryFn: async () => {
      const [profileRes, role] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        fetchPrimaryRole(userId),
      ]);
      if (profileRes.error) throw new Error(profileRes.error.message);
      return { profile: profileRes.data, role };
    },
  });

export const notificationsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw new Error(error.message);
      return data;
    },
  });
