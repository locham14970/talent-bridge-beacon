import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const NAV = [
  { label: "Home", href: "#top" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "For Refugees", href: "#for-refugees" },
  { label: "For Employers", href: "#for-employers" },
  { label: "About", href: "#about" },
];

export function signInComingSoon() {
  toast("Sign in is coming soon", {
    description: "Accounts will open in the next stage of TalentBridge AI.",
  });
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const light = !scrolled && !open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        light
          ? "bg-transparent"
          : "border-b border-border/70 bg-background/90 shadow-soft backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <a href="#top" aria-label="TalentBridge AI home" className="rounded-lg">
          <Logo tone={light ? "light" : "dark"} />
        </a>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                    light
                      ? "text-navy-foreground/80 hover:bg-navy-foreground/10 hover:text-navy-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            variant={light ? "onNavy" : "quiet"}
            size="pill"
            className={light ? "border-transparent bg-transparent" : ""}
            onClick={signInComingSoon}
          >
            Sign In
          </Button>
          <Button variant="teal" size="pill" asChild>
            <a href="#get-started">Get Started</a>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className={cn(
            "inline-flex size-11 items-center justify-center rounded-full lg:hidden",
            light ? "text-navy-foreground hover:bg-navy-foreground/10" : "text-navy hover:bg-secondary",
          )}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-border bg-background lg:hidden">
          <nav aria-label="Mobile" className="mx-auto max-w-7xl px-5 py-4 sm:px-8">
            <ul className="flex flex-col">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-3 text-base font-medium text-foreground hover:bg-secondary"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
              <Button
                variant="outline"
                size="pill"
                onClick={() => {
                  setOpen(false);
                  signInComingSoon();
                }}
              >
                Sign In
              </Button>
              <Button variant="teal" size="pill" asChild>
                <a href="#get-started" onClick={() => setOpen(false)}>
                  Get Started
                </a>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
