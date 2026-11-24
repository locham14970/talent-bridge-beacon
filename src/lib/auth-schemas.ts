import { z } from "zod";

import { SELF_SERVICE_ROLES } from "./account";
import { COUNTRIES } from "./countries";

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Use at most 72 characters")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(120, "Name is too long"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(255),
  password: passwordSchema,
  country: z.enum(COUNTRIES, { message: "Choose your country of residence" }),
  accountType: z.enum(SELF_SERVICE_ROLES, { message: "Choose an account type" }),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(255),
  password: z.string().min(1, "Enter your password").max(72),
});

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use at most ${max} characters`)
    .transform((v) => (v.length ? v : null));

export const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(120),
  country_of_residence: z.enum(COUNTRIES, { message: "Choose your country of residence" }),
  city: optionalText(80),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+0-9 ()-]*$/, "Use digits, spaces, +, - or brackets only")
    .transform((v) => (v.length ? v : null)),
  professional_title: optionalText(120),
  years_experience: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) <= 70), "Enter a number from 0 to 70")
    .transform((v) => (v === "" ? null : Number(v))),
  highest_education: optionalText(120),
  languages: optionalText(200),
  bio: optionalText(1000),
  organization_name: optionalText(160),
});

export type ProfileFormValues = z.input<typeof profileSchema>;

/** First error message per field, for inline form errors. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Only allow same-site relative paths as post-login destinations. */
export function safeRedirect(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return undefined;
  return value;
}
