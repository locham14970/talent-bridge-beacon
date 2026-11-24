import { FileQuestion, Scale, Users } from "lucide-react";

import { SectionHeading } from "./SectionHeading";

const BARRIERS = [
  {
    icon: FileQuestion,
    title: "Unrecognized qualifications",
    body: "Degrees, licences and work records are often lost during displacement or are not recognized in a new country, leaving years of real expertise invisible to employers.",
  },
  {
    icon: Scale,
    title: "Legal and financial employment barriers",
    body: "Right-to-work rules, documentation requirements and the cost of re-certification can be complex and expensive to navigate, especially without clear guidance.",
  },
  {
    icon: Users,
    title: "Limited networks and local experience",
    body: "Without professional contacts, local references or in-country work history, capable candidates struggle to get a first interview — let alone a fair chance.",
  },
];

export function Problem() {
  return (
    <section aria-labelledby="problem-title" className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          id="problem-title"
          eyebrow="The challenge"
          title="Talent is everywhere. Recognition is not."
          intro="Many refugees arrive with valuable skills and professional experience. Three connected barriers too often stand between them and work that matches their ability."
        />

        <ol className="mt-16 grid gap-6 md:grid-cols-3">
          {BARRIERS.map(({ icon: Icon, title, body }, i) => (
            <li
              key={title}
              className="group relative rounded-3xl border border-border bg-card p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-13 items-center justify-center rounded-2xl bg-navy text-teal-bright">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <span className="font-display text-sm font-semibold text-muted-foreground/70">
                  Barrier 0{i + 1}
                </span>
              </div>
              <h3 className="mt-7 text-xl font-semibold text-navy">{title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
