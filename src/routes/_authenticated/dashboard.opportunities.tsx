import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/dashboard/opportunities")({
  head: () => pageHead("Opportunity Matching", "Matched opportunities.", { noindex: true }),
  component: () => (
    <>
      <PageHeader eyebrow="Opportunity Matching" title="Opportunity Matching" />
      <div className="flex max-w-2xl flex-col items-center rounded-3xl border border-dashed bg-card px-6 py-14 text-center">
        <Sparkles className="size-7 text-teal" aria-hidden="true" />
        <h2 className="mt-4 text-lg font-semibold text-navy">No opportunities yet</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          TalentBridge AI is not yet connected to employers. When employers join and post roles, opportunities that fit your
          Skills Passport will appear here. We will never show listings we haven't confirmed.
        </p>
        <Button variant="teal" size="pill" className="mt-6" asChild><Link to="/dashboard/profile">Strengthen your profile</Link></Button>
      </div>
    </>
  ),
});
