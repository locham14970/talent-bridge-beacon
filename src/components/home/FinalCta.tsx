import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section id="get-started" aria-labelledby="cta-title" className="bg-background px-5 pb-24 sm:px-8 sm:pb-32">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-cta px-6 py-20 text-center text-navy-foreground shadow-lift sm:px-12 sm:py-24">
        <div className="pointer-events-none absolute inset-0 bg-grid-navy" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -bottom-32 -right-24 size-96 rounded-full border border-teal/20"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-48 -right-40 size-[32rem] rounded-full border border-teal/10"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-3xl">
          <h2 id="cta-title" className="text-balance text-3xl font-bold leading-tight sm:text-5xl">
            Your Talent Matters.{" "}
            <span className="text-gradient-teal">Your Future Starts Here.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-navy-muted sm:text-lg">
            Be among the first to build a Skills Passport and take the next step toward meaningful
            work.
          </p>
          <Button variant="teal" size="xl" className="mt-10" asChild>
            <Link to="/register">
              Join TalentBridge
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
