import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { accountQueryOptions, roleHome } from "@/lib/account";

export const Route = createFileRoute("/_authenticated/employer")({
  beforeLoad: async ({ context }) => {
    const account = await context.queryClient.ensureQueryData(accountQueryOptions(context.user.id));
    if (account.role !== "employer") throw redirect({ to: roleHome(account.role), replace: true });
  },
  component: () => (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  ),
});
