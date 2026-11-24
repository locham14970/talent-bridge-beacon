import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_LABELS, type AppRole } from "@/lib/account";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => pageHead("Admin dashboard", "TalentBridge AI administration.", { noindex: true }),
  component: AdminOverview,
});

function AdminOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-summary"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_account_summary");
      if (error) throw new Error(error.message);
      return data;
    },
  });
  const roles: AppRole[] = ["refugee", "employer", "admin"];
  return (
    <>
      <PageHeader eyebrow="Administrator" title="Admin overview" description="Account totals by role. Private profile details stay visible only to their owners." />
      <div className="grid gap-4 sm:grid-cols-3">
        {roles.map((r) => (
          <div key={r} className="rounded-3xl border bg-card p-6 shadow-soft">
            <p className="text-sm text-muted-foreground">{ROLE_LABELS[r]} accounts</p>
            <p className="mt-2 font-display text-3xl font-bold text-navy">
              {isLoading ? "…" : (data?.find((d) => d.role === r)?.total ?? 0)}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
