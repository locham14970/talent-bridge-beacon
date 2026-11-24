import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AuthLayout, FieldError } from "@/components/auth/AuthLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { fetchPrimaryRole, roleHome } from "@/lib/account";
import { fieldErrors, loginSchema, safeRedirect } from "@/lib/auth-schemas";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string | undefined } => {
    const redirect = safeRedirect(search["redirect"]);
    return redirect ? { redirect } : {};
  },
  head: () =>
    pageHead("Sign in", "Sign in to your TalentBridge AI account to continue building your career profile."),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { session, ready } = useAuth();
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const goToDashboard = async (userId: string) => {
    const role = await fetchPrimaryRole(userId);
    if (redirect) {
      await navigate({ href: redirect, replace: true });
    } else {
      await navigate({ to: roleHome(role), replace: true });
    }
  };

  // Already signed in: skip the form.
  useEffect(() => {
    if (ready && session && !submitting) void goToDashboard(session.user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, session]);

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error || !data.user) {
      setSubmitting(false);
      setErrors({
        form:
          error?.message === "Invalid login credentials"
            ? "That email and password don't match an account. Check them and try again."
            : (error?.message ?? "We couldn't sign you in. Please try again."),
      });
      return;
    }
    try {
      await goToDashboard(data.user.id);
    } catch {
      setSubmitting(false);
      toast.error("Signed in, but we couldn't open your dashboard. Please refresh the page.");
    }
  };

  const onReset = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.shape.email.safeParse(email);
    if (!parsed.success) {
      setErrors({ email: parsed.error.issues[0]?.message ?? "Enter a valid email address" });
      return;
    }
    setErrors({});
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (error) {
      setErrors({ form: error.message });
      return;
    }
    setResetSent(true);
  };

  if (mode === "reset") {
    return (
      <AuthLayout
        title="Reset your password"
        subtitle="Enter your account email and we'll send you a link to choose a new password."
      >
        {resetSent ? (
          <div className="rounded-2xl border border-teal/30 bg-teal-soft p-5 text-sm text-navy" role="status">
            If an account exists for <strong>{email}</strong>, a reset link is on its way. Check your inbox
            and spam folder.
          </div>
        ) : (
          <form onSubmit={onReset} noValidate className="space-y-5">
            <div>
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                autoComplete="email"
                className="mt-2 h-11 bg-card"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors["email"] || undefined}
                aria-describedby="reset-email-error"
              />
              <FieldError id="reset-email-error" message={errors["email"]} />
            </div>
            <FieldError id="reset-form-error" message={errors["form"]} />
            <Button type="submit" variant="navy" size="pill" className="h-11 w-full" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              Send reset link
            </Button>
          </form>
        )}
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setResetSent(false);
            setErrors({});
          }}
          className="mt-6 text-sm font-medium text-teal hover:underline"
        >
          Back to sign in
        </button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue to your TalentBridge AI dashboard.">
      <form onSubmit={onLogin} noValidate className="space-y-5">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="mt-2 h-11 bg-card"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors["email"] || undefined}
            aria-describedby="email-error"
          />
          <FieldError id="email-error" message={errors["email"]} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              onClick={() => {
                setMode("reset");
                setErrors({});
              }}
              className="text-sm font-medium text-teal hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative mt-2">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="h-11 bg-card pr-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors["password"] || undefined}
              aria-describedby="password-error"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <FieldError id="password-error" message={errors["password"]} />
        </div>
        <FieldError id="form-error" message={errors["form"]} />
        <Button type="submit" variant="navy" size="pill" className="h-11 w-full" disabled={submitting}>
          {submitting && <Loader2 className="animate-spin" />}
          Sign in
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        New to TalentBridge AI?{" "}
        <Link to="/register" className="font-semibold text-teal hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
