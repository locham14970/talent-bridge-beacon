import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";

import { Logo } from "@/components/home/Logo";
import { PassportCard, type PassportData } from "@/components/passport/PassportCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/passport/$token")({
  head: () => pageHead("Shared Digital Skills Passport", "Read-only Digital Skills Passport shared via TalentBridge.", { noindex: true }),
  component: SharedPassportPage,
});

function SharedPassportPage() {
  const { token } = Route.useParams();
  const [data, setData] = useState<PassportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void supabase
      .rpc("get_shared_passport", { _token: token })
      .then(({ data: payload, error }) => {
        if (cancelled) return;
        if (!error && payload && typeof payload === "object" && !Array.isArray(payload)) {
          setData(payload as unknown as PassportData);
        } else {
          setData(null);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" aria-label="TalentBridge home"><Logo /></Link>
          <Button variant="outline" size="pill" asChild>
            <Link to="/"><ArrowLeft /> TalentBridge</Link>
          </Button>
        </div>
      </header>
      <main className="container max-w-3xl py-10">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="mr-2 size-5 animate-spin" /> Loading Digital Skills Passport…
          </div>
        ) : !data ? (
          <div className="rounded-3xl border bg-card p-10 text-center shadow-soft">
            <ShieldAlert className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
            <h1 className="mt-4 text-xl font-bold text-navy">Passport unavailable</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This link is either invalid or its owner has turned off sharing.
            </p>
            <Button variant="teal" size="pill" className="mt-6" asChild>
              <Link to="/">Return to TalentBridge</Link>
            </Button>
          </div>
        ) : (
          <PassportCard data={data} />
        )}
      </main>
    </div>
  );
}