import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthActions, useAuthSession } from "@/hooks/useAuthSession";

const links = [
  { label: "Home", to: "/" as const },
  { label: "Competitions", to: "/competitions" as const },
  { label: "How it works", to: "/how-it-works" as const },
  { label: "Winners", to: "/winners" as const },
  { label: "Become a partner", to: "/partner-signup" as const },
  { label: "About Raffila", to: "/about" as const },
  { label: "FAQ", to: "/faq" as const },
  { label: "Contact", to: "/contact" as const },
  { label: "Terms", to: "/terms-and-conditions" as const },
  { label: "Privacy", to: "/privacy-policy" as const },
  { label: "Competition rules", to: "/competition-rules" as const },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { isAuthenticated, role, user } = useAuthSession();
  const { signOut } = useAuthActions();

  return (
    <header className="relative z-30 mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <Link to="/" className="flex min-w-0 items-center gap-2" aria-label="Raffila home">
          <img
            src="/Raffila-logo.png"
            alt=""
            className="size-10 shrink-0 rounded-2xl shadow-sm"
            width={40}
            height={40}
          />
          <span className="font-display truncate text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
            Raffila
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
            to="/partner-signup"
            className={cn(
              "text-sm font-bold text-ink/60 transition-colors hover:text-coral",
              (pathname === "/partner-signup" || pathname === "/become-a-partner") &&
                "text-coral font-extrabold",
            )}
            aria-current={pathname === "/partner-signup" ? "page" : undefined}
          >
            Become a partner
          </Link>
          <Link
            to="/about"
            className="text-sm font-bold text-ink/60 transition-colors hover:text-ink"
            aria-current={pathname === "/about" ? "page" : undefined}
          >
            About
          </Link>
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link
                  to={role === "admin" ? "/admin" : role === "partner" ? "/partner" : "/dashboard"}
                >
                  <LayoutDashboard className="size-4" />
                  {role === "admin" ? "Admin" : role === "partner" ? "Partner Portal" : "Dashboard"}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => signOut({ to: "/" })}>
                <LogOut className="size-4" />
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/auth">Log in</Link>
              </Button>
              <Button asChild variant="dark" size="sm">
                <Link to="/auth">Create account</Link>
              </Button>
            </div>
          )}
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          {isAuthenticated ? (
            <Button asChild variant="outline" size="sm">
              <Link
                to={role === "admin" ? "/admin" : role === "partner" ? "/partner" : "/dashboard"}
              >
                {role === "admin" ? "Admin" : role === "partner" ? "Partner" : "Dashboard"}
              </Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/auth">Log in</Link>
              </Button>
              <Button asChild variant="dark" size="sm">
                <Link to="/auth">Create account</Link>
              </Button>
            </div>
          )}
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
          className="absolute left-4 right-4 top-16 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-[22px] bg-paper p-3 shadow-xl ring-1 ring-ink/10 lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="max-h-[50vh] overflow-y-auto pr-1 scrollbar-none sm:max-h-none sm:overflow-visible">
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
          </div>
          {isAuthenticated ? (
            <>
              <Link
                to={role === "admin" ? "/admin" : role === "partner" ? "/partner" : "/dashboard"}
                onClick={() => setOpen(false)}
                className="mt-1 block rounded-2xl bg-ink px-4 py-3 text-center text-sm font-extrabold text-paper"
              >
                Go to{" "}
                {role === "admin" ? "Admin" : role === "partner" ? "Partner Portal" : "Dashboard"}
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  signOut({ to: "/" });
                }}
                className="mt-2 block w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-center text-sm font-extrabold text-ink"
              >
                Sign out {user ? `· ${user.firstName}` : ""}
              </button>
            </>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="block rounded-2xl border border-ink/10 bg-white px-4 py-3 text-center text-sm font-extrabold text-ink"
              >
                LOG IN
              </Link>
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="block rounded-2xl bg-coral px-4 py-3 text-center text-sm font-extrabold text-paper"
              >
                CREATE ACCOUNT
              </Link>
            </div>
          )}
        </nav>
      ) : null}
    </header>
  );
}
