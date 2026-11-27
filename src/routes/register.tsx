import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Briefcase, Eye, EyeOff, Loader2, UserRound } from "lucide-react";
import { toast } from "sonner";

import { AuthLayout, FieldError } from "@/components/auth/AuthLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import { CountrySelect } from "@/components/auth/CountrySelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { fetchPrimaryRole, roleHome, type SelfServiceRole } from "@/lib/account";
import { fieldErrors, registerSchema } from "@/lib/auth-schemas";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  head: () =>
    pageHead(
      "Create your account",
      "Join TalentBridge to document your skills and qualifications and prepare for meaningful work.",
    ),
  component: RegisterPage,
});

const ACCOUNT_TYPES: { value: SelfServiceRole; label: string; description: string; icon: typeof UserRound }[] = [
  {
    value: "refugee",
    label: "Refugee / User",
    description: "Build your profile and prepare for work",
    icon: UserRound,
  },
  {
    value: "employer",
    label: "Employer",
    description: "Set up your organisation profile",
    icon: Briefcase,
  },
];

function RegisterPage() {
  const navigate = useNavigate();
  const { session, ready } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [accountType, setAccountType] = useState<SelfServiceRole>("refugee");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    if (!ready || !session || submitting) return;
    void fetchPrimaryRole(session.user.id).then((role) => navigate({ to: roleHome(role), replace: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, session]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse({ fullName, email, password, country, accountType });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: parsed.data.fullName,
          country_of_residence: parsed.data.country,
          account_type: parsed.data.accountType,
        },
      },
    });
    if (error) {
      setSubmitting(false);
      const msg = error.message.toLowerCase();
      setErrors({
        form: msg.includes("already registered")
          ? "An account with this email already exists. Try signing in instead."
          : msg.includes("pwned") || msg.includes("weak")
            ? "This password has appeared in a known data leak. Please choose a different one."
            : error.message,
      });
      return;
    }
    if (!data.session || !data.user) {
      setSubmitting(false);
      setCheckEmail(true);
      return;
    }
    try {
      const role = await fetchPrimaryRole(data.user.id);
      toast.success("Welcome to TalentBridge");
      await navigate({ to: roleHome(role), replace: true });
    } catch {
      setSubmitting(false);
      toast.error("Your account was created, but we couldn't open your dashboard. Please sign in.");
    }
  };

  if (checkEmail) {
    return (
      <AuthLayout title="Check your email" subtitle="One more step to activate your account.">
        <div className="rounded-2xl border border-teal/30 bg-teal-soft p-5 text-sm text-navy" role="status">
          We sent a confirmation link to <strong>{email}</strong>. Open it to finish creating your account.
        </div>
        <Link to="/login" className="mt-6 inline-block text-sm font-medium text-teal hover:underline">
          Go to sign in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes a minute. You can add more details to your profile later."
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <fieldset>
          <legend className="text-sm font-medium">I am joining as</legend>
          <div className="mt-2 grid grid-cols-2 gap-3" role="radiogroup">
            {ACCOUNT_TYPES.map(({ value, label, description, icon: Icon }) => {
              const active = accountType === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setAccountType(value)}
                  className={cn(
                    "flex flex-col items-start gap-1.5 rounded-2xl border bg-card p-4 text-left transition-all",
                    active ? "border-teal shadow-teal ring-1 ring-teal" : "hover:border-teal/50",
                  )}
                >
                  <Icon className={cn("size-5", active ? "text-teal" : "text-muted-foreground")} aria-hidden="true" />
                  <span className="text-sm font-semibold text-navy">{label}</span>
                  <span className="text-xs leading-snug text-muted-foreground">{description}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Administrator accounts are assigned by the TalentBridge team.
          </p>
        </fieldset>

        <div>
          <Label htmlFor="full-name">Full name</Label>
          <Input
            id="full-name"
            autoComplete="name"
            className="mt-2 h-11 bg-card"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            aria-invalid={!!errors["fullName"] || undefined}
            aria-describedby="full-name-error"
          />
          <FieldError id="full-name-error" message={errors["fullName"]} />
        </div>

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
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-2">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="h-11 bg-card pr-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors["password"] || undefined}
              aria-describedby="password-hint password-error"
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
          <p id="password-hint" className="mt-1.5 text-xs text-muted-foreground">
            At least 8 characters, with a letter and a number.
          </p>
          <FieldError id="password-error" message={errors["password"]} />
        </div>

        <div>
          <Label htmlFor="country">Country of residence</Label>
          <div className="mt-2">
            <CountrySelect
              id="country"
              value={country}
              onChange={setCountry}
              invalid={!!errors["country"]}
              describedBy="country-error"
            />
          </div>
          <FieldError id="country-error" message={errors["country"]} />
        </div>

        <FieldError id="form-error" message={errors["form"]} />

        <Button type="submit" variant="teal" size="pill" className="h-11 w-full" disabled={submitting}>
          {submitting && <Loader2 className="animate-spin" />}
          Create account
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-teal hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
