import { useEffect, useState, type FormEvent } from "react";
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
import { accountQueryOptions } from "@/lib/account";
import { fieldErrors } from "@/lib/auth-schemas";
import { personalInfoSchema, type PersonalInfoFormValues } from "@/lib/profile-schemas";

export function PersonalInfoSection() {
  const { user, profile } = useAccount();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<PersonalInfoFormValues>({
    full_name: profile?.full_name ?? "",
    country_of_residence: (profile?.country_of_residence ?? "") as PersonalInfoFormValues["country_of_residence"],
    city: profile?.city ?? "",
    phone: profile?.phone ?? "",
    professional_title: profile?.professional_title ?? "",
    languages: profile?.languages ?? "",
    bio: profile?.bio ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setValues({
      full_name: profile.full_name ?? "",
      country_of_residence: (profile.country_of_residence ?? "") as PersonalInfoFormValues["country_of_residence"],
      city: profile.city ?? "",
      phone: profile.phone ?? "",
      professional_title: profile.professional_title ?? "",
      languages: profile.languages ?? "",
      bio: profile.bio ?? "",
    });
  }, [profile]);

  const set = (field: keyof PersonalInfoFormValues) => (value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = personalInfoSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      toast.error("Please check the highlighted personal information fields.");
      return;
    }
    setErrors({});
    setSaving(true);
    const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Could not save personal information. Please try again.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: accountQueryOptions(user.id).queryKey });
    toast.success("Personal information saved");
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6 rounded-3xl border bg-card p-5 shadow-soft sm:p-8">
      <div>
        <h2 className="text-lg font-semibold text-navy">Personal information</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your core contact details and professional biography.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="pi-full-name">Full name</Label>
          <Input
            id="pi-full-name"
            className="mt-2 h-11 bg-card"
            autoComplete="name"
            value={values.full_name}
            onChange={(e) => set("full_name")(e.target.value)}
            aria-invalid={!!errors["full_name"] || undefined}
            aria-describedby="pi-full-name-error"
          />
          <FieldError id="pi-full-name-error" message={errors["full_name"]} />
        </div>

        <div>
          <Label htmlFor="pi-email">Email</Label>
          <div className="relative mt-2">
            <Input id="pi-email" value={user.email ?? ""} readOnly disabled className="h-11 pr-10" />
            <Lock className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">Linked to your sign-in account.</p>
        </div>

        <div>
          <Label htmlFor="pi-country">Country of residence</Label>
          <div className="mt-2">
            <CountrySelect
              id="pi-country"
              value={values.country_of_residence}
              onChange={set("country_of_residence")}
              invalid={!!errors["country_of_residence"]}
              describedBy="pi-country-error"
            />
          </div>
          <FieldError id="pi-country-error" message={errors["country_of_residence"]} />
        </div>

        <div>
          <Label htmlFor="pi-city">City / location</Label>
          <Input
            id="pi-city"
            className="mt-2 h-11 bg-card"
            autoComplete="address-level2"
            placeholder="e.g. Nairobi, Amman, Berlin"
            value={values.city}
            onChange={(e) => set("city")(e.target.value)}
            aria-invalid={!!errors["city"] || undefined}
            aria-describedby="pi-city-error"
          />
          <FieldError id="pi-city-error" message={errors["city"]} />
        </div>

        <div>
          <Label htmlFor="pi-phone">Phone number</Label>
          <Input
            id="pi-phone"
            className="mt-2 h-11 bg-card"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+254 700 000 000"
            value={values.phone}
            onChange={(e) => set("phone")(e.target.value)}
            aria-invalid={!!errors["phone"] || undefined}
            aria-describedby="pi-phone-error"
          />
          <FieldError id="pi-phone-error" message={errors["phone"]} />
        </div>

        <div>
          <Label htmlFor="pi-title">Professional title</Label>
          <Input
            id="pi-title"
            className="mt-2 h-11 bg-card"
            placeholder="e.g. Registered Nurse, Civil Engineer"
            value={values.professional_title}
            onChange={(e) => set("professional_title")(e.target.value)}
            aria-invalid={!!errors["professional_title"] || undefined}
            aria-describedby="pi-title-error"
          />
          <FieldError id="pi-title-error" message={errors["professional_title"]} />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="pi-languages">Languages</Label>
          <Input
            id="pi-languages"
            className="mt-2 h-11 bg-card"
            placeholder="e.g. Arabic, English, French"
            value={values.languages}
            onChange={(e) => set("languages")(e.target.value)}
            aria-invalid={!!errors["languages"] || undefined}
            aria-describedby="pi-languages-error"
          />
          <FieldError id="pi-languages-error" message={errors["languages"]} />
        </div>
      </div>

      <div>
        <Label htmlFor="pi-bio">Professional biography</Label>
        <Textarea
          id="pi-bio"
          rows={5}
          className="mt-2 bg-card"
          placeholder="Summarise your background, core strengths, and the type of work you are looking for."
          value={values.bio}
          onChange={(e) => set("bio")(e.target.value)}
          aria-invalid={!!errors["bio"] || undefined}
          aria-describedby="pi-bio-hint pi-bio-error"
        />
        <p id="pi-bio-hint" className="mt-1.5 text-xs text-muted-foreground">
          {values.bio.length}/1500 characters
        </p>
        <FieldError id="pi-bio-error" message={errors["bio"]} />
      </div>

      <div className="flex justify-end border-t pt-5">
        <Button type="submit" variant="teal" size="pill" disabled={saving}>
          {saving && <Loader2 className="animate-spin" />}
          Save personal info
        </Button>
      </div>
    </form>
  );
}