import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { label: "Home", to: "/" as const },
  { label: "Competitions", to: "/competitions" as const },
  { label: "How it works", to: "/how-it-works" as const },
  { label: "Winners", to: "/winners" as const },
  { label: "Become a partner", to: "/become-a-partner" as const },
  { label: "About Rafilla", to: "/about" as const },
  { label: "FAQ", to: "/faq" as const },
  { label: "Contact", to: "/contact" as const },
  { label: "Terms", to: "/terms-and-conditions" as const },
  { label: "Privacy", to: "/privacy-policy" as const },
  { label: "Competition rules", to: "/competition-rules" as const },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <header className="relative z-30 mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label="Rafilla home">
          <span className="grid size-10 place-items-center rounded-full bg-lilac font-display text-xl font-extrabold text-ink shadow-sm">
            R
          </span>
          <span className="font-display text-2xl font-extrabold tracking-tight text-ink">
            Rafilla
          </span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary navigation">
          {links.slice(0, 4).map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "text-sm font-bold text-ink/60 transition-colors hover:text-ink",
                pathname === link.to && "text-ink",
              )}
              aria-current={pathname === link.to ? "page" : undefined}
              activeProps={{ className: "text-ink" }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/about"
            className="text-sm font-bold text-ink/60 transition-colors hover:text-ink"
            aria-current={pathname === "/about" ? "page" : undefined}
          >
            About
          </Link>
          <Button asChild variant="dark" size="sm">
            <Link to="/auth">Join Rafilla</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <Button asChild variant="dark" size="sm">
            <Link to="/auth">Join</Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open ? (
        <nav
          className="absolute left-4 right-4 top-16 rounded-[22px] bg-paper p-3 shadow-xl ring-1 ring-ink/10 lg:hidden"
          aria-label="Mobile navigation"
        >
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-2xl px-4 py-3 text-sm font-bold text-ink/65 hover:bg-lilac/15 hover:text-ink",
                pathname === link.to && "bg-lilac/15 text-ink",
              )}
              aria-current={pathname === link.to ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/auth"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-2xl bg-coral px-4 py-3 text-center text-sm font-extrabold text-paper"
          >
            Login / join
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
