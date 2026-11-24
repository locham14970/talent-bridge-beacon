import { createFileRoute } from "@tanstack/react-router";

import { FinalCta } from "@/components/home/FinalCta";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Impact } from "@/components/home/Impact";
import { Problem } from "@/components/home/Problem";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { Solution } from "@/components/home/Solution";

const TITLE = "TalentBridge AI — From Displaced Talent to Verified Opportunity";
const DESCRIPTION =
  "Skills verification, employment readiness and intelligent opportunity matching that help skilled refugees reach meaningful careers.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-teal focus:px-4 focus:py-2 focus:text-teal-foreground"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Problem />
        <Solution />
        <HowItWorks />
        <Impact />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
