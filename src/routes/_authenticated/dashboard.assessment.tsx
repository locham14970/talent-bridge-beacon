import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/dashboard/assessment")({
  head: () => pageHead("Skills Assessment", "Your Skills Assessment.", { noindex: true }),
  component: () => (
    <>
      <PageHeader eyebrow="Skills Assessment" title="Skills Assessment" description="Understand your strengths and where support could help." />
      <div className="max-w-2xl rounded-3xl border bg-card p-6 shadow-soft sm:p-8">
        <div className="flex items-center gap-3"><h2 className="font-semibold text-navy">Status</h2><StatusBadge tone="upcoming">Not started</StatusBadge></div>
        <p className="mt-3 text-sm text-muted-foreground">
          The assessment opens after your Digital Skills Passport is set up. It will look at technical skills, language,
          digital skills and workplace readiness. Results will be guidance for you, not an official certification.
        </p>
        <Button variant="teal" size="pill" className="mt-6" asChild><Link to="/dashboard/readiness">See your next steps</Link></Button>
      </div>
    </>
  ),
});
