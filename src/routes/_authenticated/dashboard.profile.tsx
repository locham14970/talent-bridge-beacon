import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { ProfileManager } from "@/components/profile/ProfileManager";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/dashboard/profile")({
  head: () => pageHead("My Profile", "Manage your TalentBridge profile, education, skills, experience and documents.", { noindex: true }),
  component: () => (
    <>
      <PageHeader
        eyebrow="Profile Management"
        title="My Profile"
        description="Keep your personal details, education, skills, work experience, career interests, and documents up to date."
      />
      <ProfileManager />
    </>
  ),
});
