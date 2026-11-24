import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

import { FieldError } from "@/components/auth/AuthLayout";
import { CountrySelect } from "@/components/auth/CountrySelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAccount } from "@/hooks/use-account";
import { supabase } from "@/integrations/supabase/client";
import { accountQueryOptions, profileCompletion } from "@/lib/account";
import { fieldErrors, profileSchema, type ProfileFormValues } from "@/lib/auth-schemas";
import { CompletionRing } from "./CompletionRing";

type FieldName = keyof ProfileFormValues;

export function ProfileForm() {
  const { user, profile, role } = useAccount();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<ProfileFormValues>({
    full_name: profile?.full_name ?? "",
    country_of_residence: (profile?.country_of_residence ?? "") as ProfileFormValues["country_of_residence"],
    city: profile?.city ?? "",
    phone: profile?.phone ?? "",
    professional_title: profile?.professional_title ?? "",
    years_experience: profile?.years_experience?.toString() ?? "",
    highest_education: profile?.highest_education ?? "",
    languages: profile?.languages ?? "",
    bio: profile?.bio ?? "",
    organization_name: profile?.organization_name ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { percent, missing } = profileCompletion(profile, role);
  const isEmployer = role === "employer";

  const set = (field: FieldName) => (value: string) => setValues((v) => ({ ...v, [field]: value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = profileSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      toast.error("Please check the highlighted fields.");
      return;
    }
    setErrors({});
    setSaving(true);
    const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("We couldn't save your profile. Please try again.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: accountQueryOptions(user.id).queryKey });
    toast.success("Profile saved");
  };

  const text = (field: FieldName, label: string, opts: { hint?: string; autoComplete?: string; inputMode?: "numeric" | "tel" } = {}) => (
    <div>
      <Label htmlFor={field}>{label}</Label>
      <Input
        id={field}
        className="mt-2 h-11 bg-card"
        value={values[field]}
        onChange={(e) => set(field)(e.target.value)}
        autoComplete={opts.autoComplete}
        inputMode={opts.inputMode}
        aria-invalid={!!errors[field] || undefined}
        aria-describedby={`${field}-hint ${field}-error`}
      />
      {opts.hint && (
        <p id={`${field}-hint`} className="mt-1.5 text-xs text-muted-foreground">
          {opts.hint}
        </p>
      )}
      <FieldError id={`${field}-error`} message={errors[field]} />
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <form onSubmit={onSubmit} noValidate className="space-y-8 rounded-3xl border bg-card p-5 shadow-soft sm:p-8">
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-navy">Personal details</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {text("full_name", "Full name", { autoComplete: "name" })}
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-2">
                <Input id="email" value={user.email ?? ""} readOnly disabled className="h-11 pr-10" />
                <Lock className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">Used to sign in. It can't be changed here.</p>
            </div>
            <div>
              <Label htmlFor="country_of_residence">Country of residence</Label>
              <div className="mt-2">
                <CountrySelect
                  id="country_of_residence"
                  value={values.country_of_residence}
                  onChange={set("country_of_residence")}
                  invalid={!!errors["country_of_residence"]}
                  describedBy="country_of_residence-error"
                />
              </div>
              <FieldError id="country_of_residence-error" message={errors["country_of_residence"]} />
            </div>
            {text("city", "City", { autoComplete: "address-level2" })}
            {text("phone", "Phone number", { autoComplete: "tel", inputMode: "tel" })}
          </div>
        </section>

        <section className="space-y-5 border-t pt-8">
          <h2 className="text-lg font-semibold text-navy">
            {isEmployer ? "Organisation details" : "Professional background"}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {isEmployer && text("organization_name", "Organisation name", { autoComplete: "organization" })}
            {text("professional_title", isEmployer ? "Your job title" : "Professional title", {
              hint: isEmployer ? "For example: HR Manager" : "For example: Registered Nurse, Civil Engineer",
            })}
            {!isEmployer && (
              <>
                {text("years_experience", "Years of experience", { inputMode: "numeric" })}
                {text("highest_education", "Highest education", { hint: "For example: Bachelor of Nursing" })}
                {text("languages", "Languages", { hint: "Separate with commas, e.g. Arabic, English, French" })}
              </>
            )}
          </div>
          <div>
            <Label htmlFor="bio">{isEmployer ? "About your organisation" : "Short bio"}</Label>
            <Textarea
              id="bio"
              rows={5}
              className="mt-2 bg-card"
              value={values.bio}
              onChange={(e) => set("bio")(e.target.value)}
              aria-invalid={!!errors["bio"] || undefined}
              aria-describedby="bio-hint bio-error"
            />
            <p id="bio-hint" className="mt-1.5 text-xs text-muted-foreground">
              {(values.bio ?? "").length}/1000 characters
            </p>
            <FieldError id="bio-error" message={errors["bio"]} />
          </div>
        </section>

        <div className="flex justify-end border-t pt-6">
          <Button type="submit" variant="teal" size="pill" disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            Save profile
          </Button>
        </div>
      </form>

      <aside className="h-fit rounded-3xl border bg-card p-6 shadow-soft lg:sticky lg:top-24">
        <div className="flex flex-col items-center text-center">
          <CompletionRing percent={percent} tone="dark" />
          <p className="mt-4 font-semibold text-navy">Profile completion</p>
        </div>
        {missing.length > 0 ? (
          <div className="mt-5">
            <p className="text-sm text-muted-foreground">Still to add:</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {missing.map((m) => (
                <li key={m} className="flex items-center gap-2 text-navy">
                  <span className="size-1.5 rounded-full bg-teal" aria-hidden="true" />
                  {m}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-4 text-center text-sm text-muted-foreground">All profile details are filled in.</p>
        )}
        <p className="mt-6 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
          Only you can see your profile. Details you add are self-reported and have not been verified.
        </p>
      </aside>
    </div>
  );
}
