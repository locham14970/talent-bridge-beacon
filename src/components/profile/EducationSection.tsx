import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { GraduationCap, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { FieldError } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUser, useProfileDetails } from "@/hooks/use-account";
import { supabase } from "@/integrations/supabase/client";
import { fieldErrors } from "@/lib/auth-schemas";
import { profileDetailsQueryOptions, type ProfileEducation } from "@/lib/profile-data";
import { educationSchema, type EducationFormValues } from "@/lib/profile-schemas";

const EMPTY: EducationFormValues = { institution: "", qualification: "", field_of_study: "", graduation_year: "" };

export function EducationSection() {
  const user = useCurrentUser();
  const { educations } = useProfileDetails();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState<EducationFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: profileDetailsQueryOptions(user.id).queryKey });

  const startAdd = () => {
    setEditingId(null);
    setValues(EMPTY);
    setErrors({});
    setOpen(true);
  };

  const startEdit = (item: ProfileEducation) => {
    setEditingId(item.id);
    setValues({
      institution: item.institution,
      qualification: item.qualification,
      field_of_study: item.field_of_study,
      graduation_year: String(item.graduation_year),
    });
    setErrors({});
    setOpen(true);
  };

  const closeForm = () => {
    setOpen(false);
    setEditingId(null);
    setValues(EMPTY);
    setErrors({});
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = educationSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      toast.error("Please check the highlighted education fields.");
      return;
    }
    setErrors({});
    setSaving(true);
    const result = editingId
      ? await supabase.from("profile_educations").update(parsed.data).eq("id", editingId).eq("user_id", user.id)
      : await supabase.from("profile_educations").insert({ ...parsed.data, user_id: user.id });
    setSaving(false);
    if (result.error) {
      toast.error("Could not save education entry. Please try again.");
      return;
    }
    await refresh();
    toast.success(editingId ? "Education updated" : "Education added");
    closeForm();
  };

  const onDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from("profile_educations").delete().eq("id", id).eq("user_id", user.id);
    setDeletingId(null);
    if (error) {
      toast.error("Could not remove education entry.");
      return;
    }
    await refresh();
    toast.success("Education removed");
  };

  return (
    <section className="space-y-6 rounded-3xl border bg-card p-5 shadow-soft sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-navy">Education</h2>
          <p className="mt-1 text-sm text-muted-foreground">Degrees, diplomas, and formal training you have completed.</p>
        </div>
        {!open && (
          <Button type="button" variant="teal" size="pill" onClick={startAdd}>
            <Plus /> Add education
          </Button>
        )}
      </div>

      {open && (
        <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-2xl border bg-surface p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-navy">{editingId ? "Edit education" : "Add education"}</h3>
            <Button type="button" variant="ghost" size="icon" onClick={closeForm} aria-label="Close education form">
              <X className="size-4" />
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="edu-institution">Institution</Label>
              <Input
                id="edu-institution"
                className="mt-1.5 h-11 bg-card"
                placeholder="e.g. University of Damascus"
                value={values.institution}
                onChange={(e) => setValues((v) => ({ ...v, institution: e.target.value }))}
                aria-invalid={!!errors["institution"] || undefined}
                aria-describedby="edu-institution-error"
              />
              <FieldError id="edu-institution-error" message={errors["institution"]} />
            </div>
            <div>
              <Label htmlFor="edu-qualification">Qualification</Label>
              <Input
                id="edu-qualification"
                className="mt-1.5 h-11 bg-card"
                placeholder="e.g. Bachelor of Science, Diploma"
                value={values.qualification}
                onChange={(e) => setValues((v) => ({ ...v, qualification: e.target.value }))}
                aria-invalid={!!errors["qualification"] || undefined}
                aria-describedby="edu-qualification-error"
              />
              <FieldError id="edu-qualification-error" message={errors["qualification"]} />
            </div>
            <div>
              <Label htmlFor="edu-field">Field of study</Label>
              <Input
                id="edu-field"
                className="mt-1.5 h-11 bg-card"
                placeholder="e.g. Nursing, Software Engineering"
                value={values.field_of_study}
                onChange={(e) => setValues((v) => ({ ...v, field_of_study: e.target.value }))}
                aria-invalid={!!errors["field_of_study"] || undefined}
                aria-describedby="edu-field-error"
              />
              <FieldError id="edu-field-error" message={errors["field_of_study"]} />
            </div>
            <div>
              <Label htmlFor="edu-year">Graduation year</Label>
              <Input
                id="edu-year"
                className="mt-1.5 h-11 bg-card"
                inputMode="numeric"
                placeholder="e.g. 2019"
                value={values.graduation_year}
                onChange={(e) => setValues((v) => ({ ...v, graduation_year: e.target.value }))}
                aria-invalid={!!errors["graduation_year"] || undefined}
                aria-describedby="edu-year-error"
              />
              <FieldError id="edu-year-error" message={errors["graduation_year"]} />
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="pill" onClick={closeForm}>Cancel</Button>
            <Button type="submit" variant="teal" size="pill" disabled={saving}>
              {saving && <Loader2 className="animate-spin" />}
              {editingId ? "Update education" : "Save education"}
            </Button>
          </div>
        </form>
      )}

      {educations.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <GraduationCap className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 font-medium text-navy">No education entries yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add your university degrees, diplomas, or vocational qualifications.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {educations.map((item) => (
            <li key={item.id} className="flex flex-col gap-3 rounded-2xl border bg-surface/60 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-navy">{item.qualification} — {item.field_of_study}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{item.institution} · Class of {item.graduation_year}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(item)} aria-label={`Edit ${item.qualification}`}>
                  <Pencil className="size-4" /> Edit
                </Button>
                <Button type="button" variant="ghost" size="sm" disabled={deletingId === item.id} onClick={() => onDelete(item.id)} aria-label={`Remove ${item.qualification}`}>
                  {deletingId === item.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4 text-destructive" />}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}