import { useEffect, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUser, useProfileDetails } from "@/hooks/use-account";
import { supabase } from "@/integrations/supabase/client";
import { profileDetailsQueryOptions } from "@/lib/profile-data";
import { careerInterestsSchema, EMPLOYMENT_PREFERENCES } from "@/lib/profile-schemas";
import { cn } from "@/lib/utils";

type EmploymentPref = (typeof EMPLOYMENT_PREFERENCES)[number];

export function CareerInterestsSection() {
  const user = useCurrentUser();
  const { careerInterests } = useProfileDetails();
  const queryClient = useQueryClient();

  const [roles, setRoles] = useState<string[]>(careerInterests?.preferred_roles ?? []);
  const [industries, setIndustries] = useState<string[]>(careerInterests?.industries ?? []);
  const [prefs, setPrefs] = useState<EmploymentPref[]>(
    (careerInterests?.employment_preferences ?? []).filter((p): p is EmploymentPref =>
      (EMPLOYMENT_PREFERENCES as readonly string[]).includes(p),
    ),
  );
  const [roleDraft, setRoleDraft] = useState("");
  const [industryDraft, setIndustryDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRoles(careerInterests?.preferred_roles ?? []);
    setIndustries(careerInterests?.industries ?? []);
    setPrefs(
      (careerInterests?.employment_preferences ?? []).filter((p): p is EmploymentPref =>
        (EMPLOYMENT_PREFERENCES as readonly string[]).includes(p),
      ),
    );
  }, [careerInterests]);

  const addTag = (draft: string, list: string[], setter: (v: string[]) => void, clear: () => void) => {
    const clean = draft.trim();
    if (!clean) return;
    if (clean.length > 80) {
      toast.error("Use at most 80 characters.");
      return;
    }
    if (list.length >= 15) {
      toast.error("You can add up to 15 items.");
      return;
    }
    if (list.some((item) => item.toLowerCase() === clean.toLowerCase())) {
      toast.error("Already added.");
      return;
    }
    setter([...list, clean]);
    clear();
  };

  const togglePref = (pref: EmploymentPref) => {
    setPrefs((prev) => (prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = careerInterestsSchema.safeParse({
      preferred_roles: roles,
      industries,
      employment_preferences: prefs,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your career interests.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profile_career_interests")
      .upsert({ user_id: user.id, ...parsed.data }, { onConflict: "user_id" });
    setSaving(false);
    if (error) {
      toast.error("Could not save career interests. Please try again.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: profileDetailsQueryOptions(user.id).queryKey });
    toast.success("Career interests saved");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-3xl border bg-card p-5 shadow-soft sm:p-8">
      <div>
        <h2 className="text-lg font-semibold text-navy">Career interests</h2>
        <p className="mt-1 text-sm text-muted-foreground">Tell us what roles, industries, and work arrangements fit you best.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ci-role">Preferred job roles</Label>
        <div className="flex gap-2">
          <Input
            id="ci-role"
            className="h-11 bg-card"
            placeholder="e.g. Frontend Developer, Nurse, Site Engineer"
            value={roleDraft}
            onChange={(e) => setRoleDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(roleDraft, roles, setRoles, () => setRoleDraft(""));
              }
            }}
          />
          <Button type="button" variant="outline" size="pill" className="h-11 shrink-0" onClick={() => addTag(roleDraft, roles, setRoles, () => setRoleDraft(""))}>
            <Plus className="size-4" /> Add
          </Button>
        </div>
        {roles.length > 0 && (
          <ul className="flex flex-wrap gap-2 pt-2">
            {roles.map((r) => (
              <li key={r} className="inline-flex items-center gap-1.5 rounded-full bg-teal-soft px-3 py-1 text-sm font-medium text-navy">
                {r}
                <button type="button" onClick={() => setRoles(roles.filter((x) => x !== r))} aria-label={`Remove ${r}`} className="rounded-full p-0.5 hover:text-destructive">
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2 border-t pt-6">
        <Label htmlFor="ci-industry">Industries</Label>
        <div className="flex gap-2">
          <Input
            id="ci-industry"
            className="h-11 bg-card"
            placeholder="e.g. Healthcare, Technology, Engineering"
            value={industryDraft}
            onChange={(e) => setIndustryDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(industryDraft, industries, setIndustries, () => setIndustryDraft(""));
              }
            }}
          />
          <Button type="button" variant="outline" size="pill" className="h-11 shrink-0" onClick={() => addTag(industryDraft, industries, setIndustries, () => setIndustryDraft(""))}>
            <Plus className="size-4" /> Add
          </Button>
        </div>
        {industries.length > 0 && (
          <ul className="flex flex-wrap gap-2 pt-2">
            {industries.map((ind) => (
              <li key={ind} className="inline-flex items-center gap-1.5 rounded-full border bg-surface px-3 py-1 text-sm text-navy">
                {ind}
                <button type="button" onClick={() => setIndustries(industries.filter((x) => x !== ind))} aria-label={`Remove ${ind}`} className="rounded-full p-0.5 hover:text-destructive">
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3 border-t pt-6">
        <Label>Employment preferences</Label>
        <div className="flex flex-wrap gap-2">
          {EMPLOYMENT_PREFERENCES.map((pref) => {
            const active = prefs.includes(pref);
            return (
              <button
                key={pref}
                type="button"
                aria-pressed={active}
                onClick={() => togglePref(pref)}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                  active ? "border-teal bg-navy text-navy-foreground" : "bg-card text-navy hover:border-teal/60",
                )}
              >
                {pref}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end border-t pt-5">
        <Button type="submit" variant="teal" size="pill" disabled={saving}>
          {saving && <Loader2 className="animate-spin" />}
          Save career interests
        </Button>
      </div>
    </form>
  );
}