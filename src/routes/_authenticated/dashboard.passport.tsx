import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Copy, ExternalLink, Eye, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { PassportCard, type PassportData } from "@/components/passport/PassportCard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAccount, useProfileDetails } from "@/hooks/use-account";
import { supabase } from "@/integrations/supabase/client";
import { profileDetailsQueryOptions } from "@/lib/profile-data";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/dashboard/passport")({
  head: () => pageHead("Digital Skills Passport", "Preview and securely share your Digital Skills Passport.", { noindex: true }),
  component: Passport,
});

function Passport() {
  const { user, profile } = useAccount();
  const details = useProfileDetails();
  const queryClient = useQueryClient();
  const [savingShare, setSavingShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewOnly, setPreviewOnly] = useState(false);

  const share = details.passportShare;
  const isActive = share?.is_active ?? false;
  const includeContact = share?.include_contact ?? false;
  const shareUrl =
    share?.share_token && typeof window !== "undefined"
      ? `${window.location.origin}/passport/${share.share_token}`
      : "";

  const passportData: PassportData = {
    full_name: profile?.full_name ?? "",
    professional_title: profile?.professional_title ?? null,
    country_of_residence: profile?.country_of_residence ?? null,
    city: profile?.city ?? null,
    languages: profile?.languages ?? null,
    bio: profile?.bio ?? null,
    phone: includeContact || !previewOnly ? profile?.phone ?? null : null,
    educations: details.educations,
    experiences: details.experiences,
    skills: details.skills,
    certificates: details.documents.filter((d) => d.doc_type === "certificate"),
    latest_assessment: details.latestAssessment,
  };

  const updateShare = async (patch: { is_active?: boolean; include_contact?: boolean }) => {
    setSavingShare(true);
    const { error } = await supabase.from("passport_shares").upsert(
      {
        user_id: user.id,
        is_active: patch.is_active ?? isActive,
        include_contact: patch.include_contact ?? includeContact,
      },
      { onConflict: "user_id" },
    );
    setSavingShare(false);
    if (error) {
      toast.error("Could not update sharing settings.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: profileDetailsQueryOptions(user.id).queryKey });
    toast.success(
      patch.is_active === true
        ? "Passport sharing enabled"
        : patch.is_active === false
          ? "Passport sharing turned off"
          : "Sharing preferences updated",
    );
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Share link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <PageHeader
        eyebrow="Skills Passport"
        title="Digital Skills Passport"
        description="Built automatically from your profile, certificates, and skills assessment."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="pill" onClick={() => setPreviewOnly((v) => !v)}>
              <Eye /> {previewOnly ? "Exit preview" : "Preview mode"}
            </Button>
            <Button variant="navy" size="pill" asChild>
              <Link to="/dashboard/profile">Edit profile</Link>
            </Button>
          </div>
        }
      />

      <div className={previewOnly ? "mx-auto max-w-3xl" : "grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"}>
        <div className="min-w-0">
          <PassportCard data={passportData} />
        </div>

        {!previewOnly && (
          <aside className="h-fit space-y-5 rounded-3xl border bg-card p-6 shadow-soft lg:sticky lg:top-24">
            <div className="flex items-center gap-2 text-navy">
              <Share2 className="size-4 text-teal" aria-hidden="true" />
              <h2 className="font-semibold">Secure sharing</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Your passport is private by default. Turn on link sharing only when you want an employer or advisor to view it.
            </p>
            <div className="flex items-center justify-between gap-3 rounded-2xl border bg-surface p-3.5">
              <div>
                <p className="text-sm font-medium text-navy">Enable share link</p>
                <p className="text-xs text-muted-foreground">{isActive ? "Active · Viewable by link" : "Off · Private"}</p>
              </div>
              <Switch checked={isActive} disabled={savingShare} onCheckedChange={(v) => updateShare({ is_active: v })} aria-label="Enable share link" />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-2xl border bg-surface p-3.5">
              <div>
                <p className="text-sm font-medium text-navy">Show phone number</p>
                <p className="text-xs text-muted-foreground">Optional on shared view</p>
              </div>
              <Switch checked={includeContact} disabled={savingShare} onCheckedChange={(v) => updateShare({ include_contact: v })} aria-label="Show phone number on shared passport" />
            </div>
            {isActive && shareUrl && (
              <div className="space-y-2 border-t pt-4">
                <p className="text-xs font-medium text-navy">Your private share link</p>
                <p className="truncate rounded-xl border bg-surface px-3 py-2 text-xs text-muted-foreground">{shareUrl}</p>
                <div className="flex gap-2">
                  <Button type="button" variant="teal" size="sm" className="flex-1 rounded-full" onClick={copyLink}>
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                    {copied ? "Copied" : "Copy link"}
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full" asChild>
                    <Link to="/passport/$token" params={{ token: share!.share_token }} target="_blank">
                      <ExternalLink className="size-4" /> Open
                    </Link>
                  </Button>
                </div>
              </div>
            )}
            {savingShare && (
              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" /> Saving preference…
              </p>
            )}
          </aside>
        )}
      </div>
    </>
  );
}
