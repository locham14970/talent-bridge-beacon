import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { accountQueryOptions, roleHome } from "@/lib/account";
import { profileDetailsQueryOptions } from "@/lib/profile-data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  beforeLoad: async ({ context }) => {
    const account = await context.queryClient.ensureQueryData(accountQueryOptions(context.user.id));
    if (account.role !== "refugee") throw redirect({ to: roleHome(account.role), replace: true });
    await context.queryClient.ensureQueryData(profileDetailsQueryOptions(context.user.id));
  },
  component: () => (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  ),
});
