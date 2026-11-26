import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Briefcase, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { FieldError } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser, useProfileDetails } from "@/hooks/use-account";
import { supabase } from "@/integrations/supabase/client";
import { fieldErrors } from "@/lib/auth-schemas";
import { profileDetailsQueryOptions, type ProfileExperience } from "@/lib/profile-data";
import { experienceSchema, formatMonthYear, type ExperienceFormValues } from "@/lib/profile-schemas";

const EMPTY: ExperienceFormValues = {
  employer: "",
  job_title: "",
  start_date: "",
  end_date: "",
  is_current: false,
  responsibilities: "",
  achievements: "",
};

export function WorkExperienceSection() {
  const user = useCurrentUser();
  const { experiences } = useProfileDetails();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState<ExperienceFormValues>(EMPTY);
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

  const startEdit = (item: ProfileExperience) => {
    setEditingId(item.id);
    setValues({
      employer: item.employer,
      job_title: item.job_title,
      start_date: item.start_date,
      end_date: item.end_date ?? "",
      is_current: item.is_current,
      responsibilities: item.responsibilities,
      achievements: item.achievements,
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
    const parsed = experienceSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      toast.error("Please check the highlighted work experience fields.");
      return;
    }
    setErrors({});
    setSaving(true);
    const res = editingId
      ? await supabase.from("profile_experiences").update(parsed.data).eq("id", editingId).eq("user_id", user.id)
      : await supabase.from("profile_experiences").insert({ ...parsed.data, user_id: user.id });
    setSaving(false);
    if (res.error) {
      toast.error("Could not save work experience. Please try again.");
      return;
    }
    await refresh();
    toast.success(editingId ? "Work experience updated" : "Work experience added");
    closeForm();
  };

  const onDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from("profile_experiences").delete().eq("id", id).eq("user_id", user.id);
    setDeletingId(null);
    if (error) {
      toast.error("Could not remove work experience.");
      return;
    }
    await refresh();
    toast.success("Work experience removed");
  };

  return (
    <section className="space-y-6 rounded-3xl border bg-card p-5 shadow-soft sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-navy">Work experience</h2>
          <p className="mt-1 text-sm text-muted-foreground">Paid roles, internships, or volunteer positions that show your experience.</p>
        </div>
        {!open && (
          <Button type="button" variant="teal" size="pill" onClick={startAdd}>
            <Plus /> Add experience
          </Button>
        )}
      </div>

      {open && (
        <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-2xl border bg-surface p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-navy">{editingId ? "Edit experience" : "Add experience"}</h3>
            <Button type="button" variant="ghost" size="icon" onClick={closeForm} aria-label="Close experience form">
              <X className="size-4" />
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="exp-employer">Employer / organisation</Label>
              <Input
                id="exp-employer"
                className="mt-1.5 h-11 bg-card"
                placeholder="e.g. Regional Medical Centre"
                value={values.employer}
                onChange={(e) => setValues((v) => ({ ...v, employer: e.target.value }))}
                aria-invalid={!!errors["employer"] || undefined}
                aria-describedby="exp-employer-error"
              />
              <FieldError id="exp-employer-error" message={errors["employer"]} />
            </div>
            <div>
              <Label htmlFor="exp-title">Job title</Label>
              <Input
                id="exp-title"
                className="mt-1.5 h-11 bg-card"
                placeholder="e.g. Registered Nurse"
                value={values.job_title}
                onChange={(e) => setValues((v) => ({ ...v, job_title: e.target.value }))}
                aria-invalid={!!errors["job_title"] || undefined}
                aria-describedby="exp-title-error"
              />
              <FieldError id="exp-title-error" message={errors["job_title"]} />
            </div>
            <div>
              <Label htmlFor="exp-start">Start date</Label>
              <Input
                id="exp-start"
                type="month"
                className="mt-1.5 h-11 bg-card"
                value={values.start_date}
                onChange={(e) => setValues((v) => ({ ...v, start_date: e.target.value }))}
                aria-invalid={!!errors["start_date"] || undefined}
                aria-describedby="exp-start-error"
              />
              <FieldError id="exp-start-error" message={errors["start_date"]} />
            </div>
            <div>
              <Label htmlFor="exp-end">End date</Label>
              <Input
                id="exp-end"
                type="month"
                disabled={values.is_current}
                className="mt-1.5 h-11 bg-card"
                value={values.is_current ? "" : values.end_date}
                onChange={(e) => setValues((v) => ({ ...v, end_date: e.target.value }))}
                aria-invalid={!!errors["end_date"] || undefined}
                aria-describedby="exp-end-error"
              />
              <FieldError id="exp-end-error" message={errors["end_date"]} />
              <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={values.is_current}
                  onCheckedChange={(checked) => setValues((v) => ({ ...v, is_current: checked === true, end_date: checked === true ? "" : v.end_date }))}
                />
                I currently work in this role
              </label>
            </div>
          </div>
          <div>
            <Label htmlFor="exp-resp">Key responsibilities</Label>
            <Textarea
              id="exp-resp"
              rows={3}
              className="mt-1.5 bg-card"
              placeholder="Describe your day-to-day duties and scope."
              value={values.responsibilities}
              onChange={(e) => setValues((v) => ({ ...v, responsibilities: e.target.value }))}
              aria-invalid={!!errors["responsibilities"] || undefined}
              aria-describedby="exp-resp-error"
            />
            <FieldError id="exp-resp-error" message={errors["responsibilities"]} />
          </div>
          <div>
            <Label htmlFor="exp-ach">Key achievements (optional)</Label>
            <Textarea
              id="exp-ach"
              rows={3}
              className="mt-1.5 bg-card"
              placeholder="Share measurable outcomes, projects delivered, or recognition."
              value={values.achievements}
              onChange={(e) => setValues((v) => ({ ...v, achievements: e.target.value }))}
              aria-invalid={!!errors["achievements"] || undefined}
              aria-describedby="exp-ach-error"
            />
            <FieldError id="exp-ach-error" message={errors["achievements"]} />
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="pill" onClick={closeForm}>Cancel</Button>
            <Button type="submit" variant="teal" size="pill" disabled={saving}>
              {saving && <Loader2 className="animate-spin" />}
              {editingId ? "Update experience" : "Save experience"}
            </Button>
          </div>
        </form>
      )}

      {experiences.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <Briefcase className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 font-medium text-navy">No work experience yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add your previous or current roles to strengthen your profile.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {experiences.map((item) => (
            <li key={item.id} className="rounded-2xl border bg-surface/60 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-navy">{item.job_title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.employer} · {formatMonthYear(item.start_date)} – {item.is_current ? "Present" : formatMonthYear(item.end_date)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(item)} aria-label={`Edit ${item.job_title}`}>
                    <Pencil className="size-4" /> Edit
                  </Button>
                  <Button type="button" variant="ghost" size="sm" disabled={deletingId === item.id} onClick={() => onDelete(item.id)} aria-label={`Remove ${item.job_title}`}>
                    {deletingId === item.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4 text-destructive" />}
                  </Button>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground whitespace-pre-line">{item.responsibilities}</p>
              {item.achievements.trim() && (
                <div className="mt-3 border-t pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal">Achievements</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{item.achievements}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}