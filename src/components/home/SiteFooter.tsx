import { toast } from "sonner";

import { Logo } from "./Logo";

function comingSoon(label: string) {
  toast(`${label} is coming soon`, {
    description: "This page will be published in the next stage of TalentBridge AI.",
  });
}

export function SiteFooter() {
  const linkClass =
    "rounded text-sm text-navy-muted transition-colors hover:text-navy-foreground";

  return (
    <footer className="bg-navy-deep text-navy-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-5 py-14 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Logo tone="light" />
          <p className="mt-4 text-sm leading-relaxed text-navy-muted">
            From Displaced Talent to Verified Opportunity.
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            <li>
              <a href="#about" className={linkClass}>
                About
              </a>
            </li>
            <li>
              <button type="button" className={linkClass} onClick={() => comingSoon("Contact")}>
                Contact
              </button>
            </li>
            <li>
              <button type="button" className={linkClass} onClick={() => comingSoon("Privacy Policy")}>
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                type="button"
                className={linkClass}
                onClick={() => comingSoon("Terms of Service")}
              >
                Terms of Service
              </button>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-navy-foreground/10">
        <p className="mx-auto max-w-7xl px-5 py-6 text-xs text-navy-muted sm:px-8">
          © {new Date().getFullYear()} TalentBridge AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
