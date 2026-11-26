import { useState } from "react";
import { Briefcase, Check, Compass, FileText, GraduationCap, UserRound, Wrench } from "lucide-react";

import { CompletionRing } from "@/components/dashboard/CompletionRing";
import { useAccount, useProfileDetails } from "@/hooks/use-account";
import { detailedProfileCompletion, type ProfileSectionKey } from "@/lib/profile-data";
import { cn } from "@/lib/utils";
import { CareerInterestsSection } from "./CareerInterestsSection";
import { DocumentsSection } from "./DocumentsSection";
import { EducationSection } from "./EducationSection";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { SkillsSection } from "./SkillsSection";
import { WorkExperienceSection } from "./WorkExperienceSection";

const TABS: { key: ProfileSectionKey; label: string; icon: typeof UserRound }[] = [
  { key: "personal", label: "Personal Info", icon: UserRound },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "skills", label: "Skills", icon: Wrench },
  { key: "experience", label: "Experience", icon: Briefcase },
  { key: "interests", label: "Career Interests", icon: Compass },
  { key: "documents", label: "CV & Certificates", icon: FileText },
];

export function ProfileManager() {
  const { profile } = useAccount();
  const details = useProfileDetails();
  const [active, setActive] = useState<ProfileSectionKey>("personal");
  const { percent, sections } = detailedProfileCompletion(profile, details);

  const countFor = (key: ProfileSectionKey): number | null => {
    if (key === "education") return details.educations.length;
    if (key === "skills") return details.skills.length;
    if (key === "experience") return details.experiences.length;
    if (key === "documents") return details.documents.length;
    return null;
  };

  return (
    <div className="space-y-6">
      <nav aria-label="Profile sections" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {TABS.map((tab) => {
          const isSelected = active === tab.key;
          const count = countFor(tab.key);
          return (
            <button
              key={tab.key}
              type="button"
              aria-current={isSelected ? "page" : undefined}
              onClick={() => setActive(tab.key)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                isSelected
                  ? "border-navy bg-navy text-navy-foreground shadow-soft"
                  : "bg-card text-navy hover:border-teal/60 hover:bg-teal-soft/50",
              )}
            >
              <tab.icon className="size-4" aria-hidden="true" />
              <span>{tab.label}</span>
              {count !== null && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                    isSelected ? "bg-navy-foreground/15 text-navy-foreground" : "bg-surface text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          {active === "personal" && <PersonalInfoSection />}
          {active === "education" && <EducationSection />}
          {active === "skills" && <SkillsSection />}
          {active === "experience" && <WorkExperienceSection />}
          {active === "interests" && <CareerInterestsSection />}
          {active === "documents" && <DocumentsSection />}
        </div>

        <aside className="h-fit rounded-3xl border bg-card p-6 shadow-soft lg:sticky lg:top-24">
          <div className="flex flex-col items-center text-center">
            <CompletionRing percent={percent} tone="dark" />
            <p className="mt-4 font-semibold text-navy">Profile completion</p>
          </div>
          <ul className="mt-5 space-y-2 text-sm">
            {sections.map((section) => (
              <li key={section.key}>
                <button
                  type="button"
                  onClick={() => setActive(section.key)}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left transition-colors hover:bg-surface"
                >
                  <span className={cn(section.done ? "text-navy" : "text-muted-foreground")}>{section.label}</span>
                  <span
                    className={cn(
                      "inline-flex size-5 items-center justify-center rounded-full text-xs",
                      section.done ? "bg-teal text-teal-foreground" : "border border-border",
                    )}
                    aria-label={section.done ? "Completed" : "Incomplete"}
                  >
                    {section.done && <Check className="size-3" />}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
            Only you can see your profile unless you explicitly turn on Skills Passport sharing. Details are self-reported.
          </p>
        </aside>
      </div>
    </div>
  );
}