import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Pencil, Plus, Trash2, Wrench, X } from "lucide-react";
import { toast } from "sonner";

import { FieldError } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUser, useProfileDetails } from "@/hooks/use-account";
import { supabase } from "@/integrations/supabase/client";
import { fieldErrors } from "@/lib/auth-schemas";
import { profileDetailsQueryOptions, type ProfileSkill } from "@/lib/profile-data";
import { skillSchema, type SkillCategory } from "@/lib/profile-schemas";
import { cn } from "@/lib/utils";

export function SkillsSection() {
  const user = useCurrentUser();
  const { skills } = useProfileDetails();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<SkillCategory>("technical");
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState<SkillCategory>("technical");
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: profileDetailsQueryOptions(user.id).queryKey });

  const onAdd = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = skillSchema.safeParse({ name, category });
    if (!parsed.success) {
      setError(fieldErrors(parsed.error)["name"] ?? "Enter a valid skill");
      return;
    }
    const duplicate = skills.some(
      (s) => s.category === parsed.data.category && s.name.toLowerCase() === parsed.data.name.toLowerCase(),
    );
    if (duplicate) {
      setError("You already added this skill.");
      return;
    }
    setError(undefined);
    setSaving(true);
    const { error: dbErr } = await supabase.from("profile_skills").insert({ ...parsed.data, user_id: user.id });
    setSaving(false);
    if (dbErr) {
      toast.error("Could not add skill. Please try again.");
      return;
    }
    setName("");
    await refresh();
    toast.success("Skill added");
  };

  const startEdit = (skill: ProfileSkill) => {
    setEditingId(skill.id);
    setEditName(skill.name);
    setEditCategory(skill.category as SkillCategory);
  };

  const saveEdit = async (id: string) => {
    const parsed = skillSchema.safeParse({ name: editName, category: editCategory });
    if (!parsed.success) {
      toast.error(fieldErrors(parsed.error)["name"] ?? "Enter a valid skill name");
      return;
    }
    setBusyId(id);
    const { error: dbErr } = await supabase.from("profile_skills").update(parsed.data).eq("id", id).eq("user_id", user.id);
    setBusyId(null);
    if (dbErr) {
      toast.error("Could not update skill.");
      return;
    }
    setEditingId(null);
    await refresh();
    toast.success("Skill updated");
  };

  const removeSkill = async (id: string) => {
    setBusyId(id);
    const { error: dbErr } = await supabase.from("profile_skills").delete().eq("id", id).eq("user_id", user.id);
    setBusyId(null);
    if (dbErr) {
      toast.error("Could not remove skill.");
      return;
    }
    await refresh();
    toast.success("Skill removed");
  };

  const renderGroup = (groupCategory: SkillCategory, heading: string, emptyText: string) => {
    const list = skills.filter((s) => s.category === groupCategory);
    return (
      <div>
        <h3 className="text-sm font-semibold text-navy">
          {heading} <span className="font-normal text-muted-foreground">({list.length})</span>
        </h3>
        {list.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {list.map((skill) =>
              editingId === skill.id ? (
                <li key={skill.id} className="flex flex-wrap items-center gap-1.5 rounded-2xl border bg-surface p-2">
                  <Input
                    aria-label="Edit skill name"
                    className="h-8 w-40 bg-card text-sm"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <select
                    aria-label="Edit skill category"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as SkillCategory)}
                    className="h-8 rounded-md border border-input bg-card px-2 text-xs text-foreground"
                  >
                    <option value="technical">Technical</option>
                    <option value="soft">Soft</option>
                  </select>
                  <Button type="button" variant="teal" size="icon" className="size-8" disabled={busyId === skill.id} onClick={() => saveEdit(skill.id)} aria-label="Save skill">
                    {busyId === skill.id ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => setEditingId(null)} aria-label="Cancel edit">
                    <X className="size-3.5" />
                  </Button>
                </li>
              ) : (
                <li key={skill.id} className="inline-flex items-center gap-1.5 rounded-full border bg-surface px-3.5 py-1.5 text-sm text-navy">
                  <span>{skill.name}</span>
                  <button type="button" onClick={() => startEdit(skill)} className="rounded-full p-0.5 text-muted-foreground hover:text-navy" aria-label={`Edit ${skill.name}`}>
                    <Pencil className="size-3.5" />
                  </button>
                  <button type="button" disabled={busyId === skill.id} onClick={() => removeSkill(skill.id)} className="rounded-full p-0.5 text-muted-foreground hover:text-destructive" aria-label={`Remove ${skill.name}`}>
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ),
            )}
          </ul>
        )}
      </div>
    );
  };

  return (
    <section className="space-y-6 rounded-3xl border bg-card p-5 shadow-soft sm:p-8">
      <div>
        <h2 className="text-lg font-semibold text-navy">Professional skills</h2>
        <p className="mt-1 text-sm text-muted-foreground">Add your technical tools, domain skills, and interpersonal strengths.</p>
      </div>

      <form onSubmit={onAdd} noValidate className="space-y-3 rounded-2xl border bg-surface p-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
          <div>
            <Label htmlFor="skill-name">Skill name</Label>
            <Input
              id="skill-name"
              className="mt-1.5 h-11 bg-card"
              placeholder={category === "technical" ? "e.g. Python, AutoCAD, Clinical Triage" : "e.g. Team Leadership, Conflict Resolution"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!error || undefined}
              aria-describedby="skill-name-error"
            />
          </div>
          <div role="radiogroup" aria-label="Skill category" className="inline-flex h-11 rounded-full border bg-card p-1">
            {(["technical", "soft"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                role="radio"
                aria-checked={category === cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "rounded-full px-3.5 text-xs font-semibold transition-colors",
                  category === cat ? "bg-navy text-navy-foreground" : "text-muted-foreground hover:text-navy",
                )}
              >
                {cat === "technical" ? "Technical" : "Soft"}
              </button>
            ))}
          </div>
          <Button type="submit" variant="teal" size="pill" className="h-11" disabled={saving}>
            {saving ? <Loader2 className="animate-spin" /> : <Plus />} Add skill
          </Button>
        </div>
        <FieldError id="skill-name-error" message={error} />
      </form>

      {skills.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <Wrench className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 font-medium text-navy">No skills added yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Start by adding a few technical or soft skills above.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {renderGroup("technical", "Technical skills", "No technical skills added yet.")}
          <div className="border-t pt-6">
            {renderGroup("soft", "Soft skills", "No soft skills added yet.")}
          </div>
        </div>
      )}
    </section>
  );
}