import { Route, Search, Sparkles, UserRound, Wrench } from "lucide-react";

import { SectionHeading } from "./SectionHeading";

const STEPS = [
  {
    icon: UserRound,
    title: "Create Profile",
    body: "Share your background, experience, languages and career goals in a guided, private profile.",
  },
  {
    icon: Wrench,
    title: "Demonstrate Skills",
    body: "Complete practical assessments that capture what you can do and add it to your Skills Passport.",
  },
  {
    icon: Search,
    title: "Identify Barriers",
    body: "Pinpoint what stands in the way — documents, certification, language or local experience.",
  },
  {
    icon: Sparkles,
    title: "Match Opportunities",
    body: "Receive matches to roles, training and mentors that fit your verified skills and readiness.",
  },
  {
    icon: Route,
    title: "Access Career Pathways",
    body: "Follow a clear pathway from first opportunity toward long-term, meaningful career growth.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="relative overflow-hidden bg-navy-deep py-24 text-navy-foreground sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid-navy opacity-70" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          id="how-title"
          tone="light"
          eyebrow="How it works"
          title="Five steps from displaced talent to verified opportunity."
          intro="A clear, guided journey designed to be simple to follow on any device."
        />

        <ol className="relative mt-16 grid gap-5 lg:grid-cols-5 lg:gap-4">
          {/* connector line (desktop) */}
          <div
            className="absolute left-[10%] right-[10%] top-8 hidden h-px bg-gradient-to-r from-teal/0 via-teal/60 to-teal/0 lg:block"
            aria-hidden="true"
          />
          {/* connector line (mobile / tablet) */}
          <div
            className="absolute bottom-8 left-8 top-8 w-px bg-gradient-to-b from-teal/60 via-teal/40 to-teal/0 lg:hidden"
            aria-hidden="true"
          />
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="relative flex gap-5 lg:flex-col lg:items-center lg:gap-0 lg:text-center">
              <div className="relative z-10 flex size-16 shrink-0 items-center justify-center rounded-2xl border border-teal/40 bg-navy shadow-teal">
                <Icon className="size-7 text-teal-bright" aria-hidden="true" />
                <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-gradient-teal font-display text-xs font-bold text-teal-foreground">
                  {i + 1}
                </span>
              </div>
              <div className="pb-2 lg:mt-6 lg:px-2">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-muted">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
