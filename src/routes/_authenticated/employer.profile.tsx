import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/employer/profile")({
  head: () => pageHead("My profile", "Edit your private TalentBridge profile.", { noindex: true }),
  component: () => (
    <>
      <PageHeader eyebrow="Account" title="Edit your profile" description="Keep your details up to date. Only you can see them." />
      <ProfileForm />
    </>
  ),
});
