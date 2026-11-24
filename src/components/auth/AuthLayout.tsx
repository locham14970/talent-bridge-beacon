import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, UserRoundCheck, Compass } from "lucide-react";

import { Logo } from "@/components/home/Logo";

const POINTS = [
  { icon: UserRoundCheck, text: "Document your qualifications and experience in one place" },
  { icon: Compass, text: "Understand the steps toward employment in your new country" },
  { icon: ShieldCheck, text: "Your private profile is visible only to you" },
];

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden overflow-hidden bg-hero p-12 text-navy-foreground lg:flex lg:flex-col">
        <div className="pointer-events-none absolute inset-0 bg-grid-navy" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -bottom-40 -left-24 size-[28rem] rounded-full border border-teal/20"
          aria-hidden="true"
        />
        <Link to="/" aria-label="TalentBridge AI home" className="relative w-fit rounded-lg">
          <Logo tone="light" />
        </Link>
        <div className="relative mt-auto max-w-md">
          <p className="eyebrow text-teal-bright">From displaced talent to verified opportunity</p>
          <h2 className="mt-4 text-3xl font-bold leading-tight">
            Your skills deserve to be <span className="text-gradient-teal">seen</span>.
          </h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-navy-muted">
                <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-navy-foreground/10 text-teal-bright">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="pt-1 text-sm leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="TalentBridge AI home" className="rounded-lg lg:hidden">
            <Logo />
          </Link>
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to homepage
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-bold text-navy">{title}</h1>
          <p className="mt-2 text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}

export function FieldError({ id, message }: { id: string; message: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm text-destructive">
      {message}
    </p>
  );
}
