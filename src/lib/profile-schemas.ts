import { z } from "zod";

import { COUNTRIES } from "./countries";

export const SKILL_CATEGORIES = ["technical", "soft"] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const EMPLOYMENT_PREFERENCES = [
  "Full-time",
  "Part-time",
  "Contract / Freelance",
  "Internship",
  "Remote",
  "Hybrid",
  "On-site",
  "Open to relocation",
] as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use at most ${max} characters`)
    .transform((v) => (v.length ? v : null));

export const personalInfoSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(120, "Name is too long"),
  country_of_residence: z.enum(COUNTRIES, { message: "Choose your country of residence" }),
  city: optionalText(80),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long")
    .regex(/^[+0-9 ()-]*$/, "Use digits, spaces, +, - or brackets only")
    .transform((v) => (v.length ? v : null)),
  professional_title: optionalText(120),
  languages: optionalText(200),
  bio: optionalText(1500),
});

export type PersonalInfoFormValues = z.input<typeof personalInfoSchema>;

export const educationSchema = z.object({
  institution: z.string().trim().min(2, "Enter the institution name").max(160, "Use at most 160 characters"),
  qualification: z.string().trim().min(2, "Enter the qualification or degree").max(120, "Use at most 120 characters"),
  field_of_study: z.string().trim().min(2, "Enter your field of study").max(120, "Use at most 120 characters"),
  graduation_year: z
    .string()
    .trim()
    .refine((v) => /^\d{4}$/.test(v) && Number(v) >= 1950 && Number(v) <= 2040, "Enter a 4-digit year between 1950 and 2040")
    .transform((v) => Number(v)),
});

export type EducationFormValues = z.input<typeof educationSchema>;

export const skillSchema = z.object({
  name: z.string().trim().min(1, "Enter a skill name").max(80, "Use at most 80 characters"),
  category: z.enum(SKILL_CATEGORIES, { message: "Choose technical or soft skill" }),
});

export type SkillFormValues = z.input<typeof skillSchema>;

const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;

export const experienceSchema = z
  .object({
    employer: z.string().trim().min(2, "Enter the employer or organisation").max(160, "Use at most 160 characters"),
    job_title: z.string().trim().min(2, "Enter your job title").max(120, "Use at most 120 characters"),
    start_date: z.string().trim().regex(monthPattern, "Choose a start month and year"),
    end_date: z.string().trim(),
    is_current: z.boolean(),
    responsibilities: z.string().trim().min(5, "Describe your key responsibilities").max(1500, "Use at most 1500 characters"),
    achievements: z.string().trim().max(1500, "Use at most 1500 characters"),
  })
  .superRefine((data, ctx) => {
    if (!data.is_current) {
      if (!monthPattern.test(data.end_date)) {
        ctx.addIssue({ code: "custom", path: ["end_date"], message: "Choose an end month and year, or mark as current role" });
        return;
      }
      if (data.end_date < data.start_date) {
        ctx.addIssue({ code: "custom", path: ["end_date"], message: "End date must be on or after the start date" });
      }
    }
  })
  .transform((data) => ({
    employer: data.employer,
    job_title: data.job_title,
    start_date: data.start_date,
    end_date: data.is_current ? null : data.end_date,
    is_current: data.is_current,
    responsibilities: data.responsibilities,
    achievements: data.achievements,
  }));

export type ExperienceFormValues = z.input<typeof experienceSchema>;

const cleanTagList = (maxItems: number, maxLen: number) =>
  z
    .array(z.string().trim().min(1, "Item cannot be empty").max(maxLen, `Use at most ${maxLen} characters`))
    .max(maxItems, `Add at most ${maxItems} items`)
    .transform((items) => {
      const seen = new Set<string>();
      return items.filter((item) => {
        const key = item.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    });

export const careerInterestsSchema = z.object({
  preferred_roles: cleanTagList(15, 80),
  industries: cleanTagList(15, 80),
  employment_preferences: z.array(z.enum(EMPLOYMENT_PREFERENCES)).max(EMPLOYMENT_PREFERENCES.length),
});

export type CareerInterestsFormValues = z.input<typeof careerInterestsSchema>;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

export function formatMonthYear(value: string | null | undefined): string {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;
  const month = MONTHS[Number(match[2]) - 1];
  return month ? `${month} ${match[1]}` : value;
}