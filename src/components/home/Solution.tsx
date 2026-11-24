import { BadgeCheck, Briefcase, Check, Compass, GraduationCap, Network } from "lucide-react";

import passportImage from "@/assets/skills-passport.jpg";
import { SectionHeading } from "./SectionHeading";

const SOLUTIONS = [
  {
    icon: BadgeCheck,
    title: "AI-Assisted Skills Validation",
    body: "Demonstrate what you can do through practical, structured assessments. AI helps organize the evidence into a portable Skills Passport that reflects real capability — not only paperwork.",
  },
  {
    icon: Compass,
    title: "Employment Readiness Navigator",
    body: "Identify the specific barriers in your path — documentation, certification, language or local experience — and follow a clear, personalised plan of next steps and resources.",
  },
  {
    icon: Network,
    title: "Intelligent Opportunity Matching",
    body: "Get matched to jobs, training, apprenticeships and mentors based on verified skills, readiness and goals, so opportunities fit where you are and where you want to go.",
  },
];

const FOR_REFUGEES = [
  "Build a Skills Passport that travels with you",
  "Understand your employment options step by step",
  "Connect with mentors and relevant opportunities",
];

const FOR_EMPLOYERS = [
  "Discover skilled candidates through verified profiles",
  "See demonstrated skills, not only formal credentials",
  "Support inclusive hiring with clearer information",
];

export function Solution() {
  return (
    <section aria-labelledby="solution-title" className="bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <div>
            <SectionHeading
              id="solution-title"
              align="left"
              eyebrow="Our solution"
              title="One bridge, three connected capabilities."
              intro="TalentBridge AI turns hidden experience into verified, visible talent — and guides each person from proof of skills to a real opportunity."
            />

            <ul className="mt-10 space-y-4">
              {SOLUTIONS.map(({ icon: Icon, title, body }) => (
                <li
                  key={title}
                  className="flex gap-5 rounded-2xl border border-border bg-card p-6 shadow-soft"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-teal text-teal-foreground">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-navy">{title}</h3>
                    <p className="mt-1.5 leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-6 rounded-[2.5rem] bg-teal/10 blur-2xl"
              aria-hidden="true"
            />
            <img
              src={passportImage}
              alt="Illustration of a digital Skills Passport with verified badges for skills such as healthcare, engineering, coding, cooking and education"
              width={900}
              height={900}
              loading="lazy"
              className="relative w-full rounded-[2rem] border border-border shadow-lift"
            />
          </div>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-2">
          <AudienceCard
            id="for-refugees"
            icon={GraduationCap}
            label="For Refugees"
            title="Show the world what you can do."
            points={FOR_REFUGEES}
            dark
          />
          <AudienceCard
            id="for-employers"
            icon={Briefcase}
            label="For Employers"
            title="Find talent you might otherwise miss."
            points={FOR_EMPLOYERS}
          />
        </div>
      </div>
    </section>
  );
}

function AudienceCard({
  id,
  icon: Icon,
  label,
  title,
  points,
  dark = false,
}: {
  id: string;
  icon: typeof Briefcase;
  label: string;
  title: string;
  points: string[];
  dark?: boolean;
}) {
  return (
    <article
      id={id}
      aria-labelledby={`${id}-title`}
      className={
        dark
          ? "relative overflow-hidden rounded-3xl bg-navy p-8 text-navy-foreground shadow-lift sm:p-10"
          : "relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-soft sm:p-10"
      }
    >
      <div className="flex items-center gap-3">
        <span
          className={
            dark
              ? "flex size-11 items-center justify-center rounded-xl bg-teal/15 text-teal-bright"
              : "flex size-11 items-center justify-center rounded-xl bg-teal-soft text-teal"
          }
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <p className={dark ? "eyebrow text-teal-bright" : "eyebrow text-teal"}>{label}</p>
      </div>
      <h3
        id={`${id}-title`}
        className={dark ? "mt-6 text-2xl font-semibold" : "mt-6 text-2xl font-semibold text-navy"}
      >
        {title}
      </h3>
      <ul className="mt-6 space-y-3">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-3">
            <Check
              className={dark ? "mt-0.5 size-5 shrink-0 text-teal-bright" : "mt-0.5 size-5 shrink-0 text-teal"}
              aria-hidden="true"
            />
            <span className={dark ? "text-navy-muted" : "text-muted-foreground"}>{p}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
