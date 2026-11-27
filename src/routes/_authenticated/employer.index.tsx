import { createFileRoute, Link } from "@tanstack/react-router";

import { CompletionRing } from "@/components/dashboard/CompletionRing";
import { NotificationsList } from "@/components/dashboard/NotificationsList";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/hooks/use-account";
import { profileCompletion } from "@/lib/account";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/employer/")({
  head: () => pageHead("Employer dashboard", "Your TalentBridge employer dashboard.", { noindex: true }),
  component: EmployerOverview,
});

function EmployerOverview() {
  const { profile, role, user } = useAccount();
  const { percent } = profileCompletion(profile, role);
  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-6 rounded-3xl bg-cta p-6 text-navy-foreground shadow-lift sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div className="max-w-xl">
          <p className="eyebrow text-teal-bright">Employer dashboard</p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Welcome, {(profile?.full_name ?? "").split(" ")[0] || user.email}</h1>
          <p className="mt-3 text-navy-muted">Add your organisation details now. Tools to post roles and view candidate Skills Passports (with their consent) are planned for a later stage.</p>
          <Button variant="teal" size="pill" className="mt-6" asChild><Link to="/employer/profile">Edit organisation profile</Link></Button>
        </div>
        <CompletionRing percent={percent} />
      </section>
      <section>
        <h2 className="mb-4 text-lg font-semibold text-navy">Recent notifications</h2>
        <NotificationsList limit={3} compact />
      </section>
    </div>
  );
}
