import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Compass, Network } from "lucide-react";

import heroImage from "@/assets/hero-bridge.jpg";
import { Button } from "@/components/ui/button";

const PILLARS = [
  { icon: BadgeCheck, label: "Skills verification" },
  { icon: Compass, label: "Employment readiness" },
  { icon: Network, label: "Opportunity matching" },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-hero text-navy-foreground">
      <div className="pointer-events-none absolute inset-0 bg-grid-navy" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 pt-32 sm:px-8 sm:pt-40 lg:pt-44">
        <div className="mx-auto max-w-4xl text-center">
          <p className="animate-rise inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-4 py-1.5 text-xs font-medium tracking-wide text-teal-bright sm:text-sm">
            <span className="size-1.5 rounded-full bg-teal-bright" aria-hidden="true" />
            From Displaced Talent to Verified Opportunity
          </p>

          <h1 className="animate-rise mt-7 text-balance text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-[4rem] [animation-delay:80ms]">
            Your Skills Deserve a Future.{" "}
            <span className="text-gradient-teal">
              Your Displacement Should Not Define Your Opportunities.
            </span>
          </h1>

          <p className="animate-rise mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-navy-muted sm:text-lg [animation-delay:160ms]">
            An intelligent platform connecting skilled refugees with skills verification, employment
            readiness, professional mentorship and meaningful career opportunities.
          </p>

          <div className="animate-rise mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row [animation-delay:240ms]">
            <Button variant="teal" size="xl" asChild className="w-full sm:w-auto">
              <Link to="/register">
                Create Your Skills Passport
                <ArrowRight />
              </Link>
            </Button>
            <Button variant="onNavy" size="xl" asChild className="w-full sm:w-auto">
              <a href="#how-it-works">Explore How It Works</a>
            </Button>
          </div>

          <ul className="animate-rise mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-navy-muted [animation-delay:320ms]">
            {PILLARS.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-2">
                <Icon className="size-4 text-teal-bright" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative -mx-5 mt-8 sm:-mx-8 lg:mx-0 lg:mt-4">
          <img
            src={heroImage}
            alt="Illustration of a nurse, an engineer, a software developer and a carpenter walking together across a glowing bridge toward a city of opportunity"
            width={1536}
            height={1024}
            className="fade-edges mx-auto w-full max-w-6xl select-none"
            fetchPriority="high"
          />
        </div>
      </div>
    </section>
  );
}
