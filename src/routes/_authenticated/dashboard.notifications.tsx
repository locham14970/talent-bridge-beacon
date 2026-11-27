import { createFileRoute } from "@tanstack/react-router";

import { NotificationsList } from "@/components/dashboard/NotificationsList";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/dashboard/notifications")({
  head: () => pageHead("Notifications", "Updates about your TalentBridge account.", { noindex: true }),
  component: () => (
    <>
      <PageHeader eyebrow="Account" title="Notifications" description="Updates about your account and new features." />
      <NotificationsList />
    </>
  ),
});
