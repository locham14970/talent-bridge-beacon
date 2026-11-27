import { describe, expect, it } from "vitest";

import { detailedProfileCompletion, type ProfileDetails } from "@/lib/profile-data";
import {
  careerInterestsSchema,
  educationSchema,
  experienceSchema,
  formatMonthYear,
  skillSchema,
} from "@/lib/profile-schemas";

describe("Profile management validation rules", () => {
  it("accepts a valid education entry and rejects out-of-range graduation years", () => {
    const ok = educationSchema.safeParse({
      institution: "University of Nairobi",
      qualification: "BSc",
      field_of_study: "Computer Science",
      graduation_year: "2021",
    });
    expect(ok.success).toBe(true);
    if (ok.success) expect(ok.data.graduation_year).toBe(2021);

    const bad = educationSchema.safeParse({
      institution: "University of Nairobi",
      qualification: "BSc",
      field_of_study: "Computer Science",
      graduation_year: "1899",
    });
    expect(bad.success).toBe(false);
  });

  it("enforces technical or soft skill categories", () => {
    expect(skillSchema.safeParse({ name: "React", category: "technical" }).success).toBe(true);
    expect(skillSchema.safeParse({ name: "Leadership", category: "soft" }).success).toBe(true);
    expect(skillSchema.safeParse({ name: "React", category: "other" }).success).toBe(false);
  });

  it("requires end date on or after start date unless marked current", () => {
    const invalidOrder = experienceSchema.safeParse({
      employer: "Clinic",
      job_title: "Nurse",
      start_date: "2023-06",
      end_date: "2022-01",
      is_current: false,
      responsibilities: "Provided patient care and triage.",
      achievements: "",
    });
    expect(invalidOrder.success).toBe(false);

    const currentRole = experienceSchema.safeParse({
      employer: "Clinic",
      job_title: "Nurse",
      start_date: "2023-06",
      end_date: "",
      is_current: true,
      responsibilities: "Provided patient care and triage.",
      achievements: "Reduced intake wait time.",
    });
    expect(currentRole.success).toBe(true);
    if (currentRole.success) expect(currentRole.data.end_date).toBeNull();
  });

  it("deduplicates career interest roles case-insensitively", () => {
    const res = careerInterestsSchema.safeParse({
      preferred_roles: ["Frontend Developer", "frontend developer", "QA Engineer"],
      industries: ["Technology"],
      employment_preferences: ["Remote", "Full-time"],
    });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.preferred_roles).toEqual(["Frontend Developer", "QA Engineer"]);
  });

  it("formats YYYY-MM strings cleanly", () => {
    expect(formatMonthYear("2024-03")).toBe("Mar 2024");
  });

  it("computes completion across all 6 profile sections", () => {
    const emptyDetails: ProfileDetails = {
      educations: [],
      skills: [],
      experiences: [],
      careerInterests: null,
      documents: [],
      latestAssessment: null,
      passportShare: null,
    };
    const result = detailedProfileCompletion(null, emptyDetails);
    expect(result.percent).toBe(0);
    expect(result.sections).toHaveLength(6);
  });
});