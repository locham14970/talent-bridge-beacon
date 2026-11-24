import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AuthLayout, FieldError } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { fetchPrimaryRole, roleHome } from "@/lib/account";
import { passwordSchema } from "@/lib/auth-schemas";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/reset-password")({
  head: () => pageHead("Choose a new password", "Set a new password for your TalentBridge AI account.", { noindex: true }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [canReset, setCanReset] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const isRecovery = window.location.hash.includes("type=recovery");
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setCanReset(true);
    });
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setCanReset((prev) => prev ?? (isRecovery || !!session));
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      setErrors({ password: parsed.error.issues[0]?.message ?? "Choose a stronger password" });
      return;
    }
    if (password !== confirm) {
      setErrors({ confirm: "The passwords don't match" });
      return;
    }
    setErrors({});
    setSubmitting(true);
    const { data, error } = await supabase.auth.updateUser({ password: parsed.data });
    if (error || !data.user) {
      setSubmitting(false);
      setErrors({ form: error?.message ?? "We couldn't update your password. Please try again." });
      return;
    }
    toast.success("Your password has been updated");
    const role = await fetchPrimaryRole(data.user.id);
    await navigate({ to: roleHome(role), replace: true });
  };

  return (
    <AuthLayout title="Choose a new password" subtitle="Pick a password you haven't used before.">
      {canReset === false ? (
        <div className="space-y-4">
          <p className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
            This reset link is invalid or has expired. Request a new one from the sign-in page.
          </p>
          <Link to="/login" className="text-sm font-medium text-teal hover:underline">
            Go to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <div>
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              className="mt-2 h-11 bg-card"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby="new-password-error"
            />
            <FieldError id="new-password-error" message={errors["password"]} />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              className="mt-2 h-11 bg-card"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              aria-describedby="confirm-password-error"
            />
            <FieldError id="confirm-password-error" message={errors["confirm"]} />
          </div>
          <FieldError id="reset-error" message={errors["form"]} />
          <Button type="submit" variant="navy" size="pill" className="h-11 w-full" disabled={submitting}>
            {submitting && <Loader2 className="animate-spin" />}
            Update password
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
