import { useState, type ReactNode } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import {
  Home,
  Trophy,
  Wallet,
  Ticket,
  Users,
  Award,
  UserCircle2,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown,
  Breadcrumb,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: ReactNode;
  to: string;
  group: "Account" | "Rewards" | "Settings";
};

const navItems: NavItem[] = [
  { label: "Home", icon: <Home className="size-5" />, to: "/dashboard", group: "Account" },
  { label: "Competitions", icon: <Trophy className="size-5" />, to: "/dashboard/competitions", group: "Account" },
  { label: "Wallet", icon: <Wallet className="size-5" />, to: "/dashboard/wallet", group: "Account" },
  { label: "Entries", icon: <Ticket className="size-5" />, to: "/dashboard/entries", group: "Account" },
  { label: "Referrals", icon: <Users className="size-5" />, to: "/dashboard/referrals", group: "Rewards" },
  { label: "Reward pool", icon: <Award className="size-5" />, to: "/dashboard/reward-pool", group: "Rewards" },
  { label: "Profile", icon: <UserCircle2 className="size-5" />, to: "/dashboard/profile", group: "Settings" },
  { label: "Security", icon: <ShieldCheck className="size-5" />, to: "/dashboard/security", group: "Settings" },
];

const bottomNavItems: NavItem[] = [
  { label: "Home", icon: <Home className="size-5" />, to: "/dashboard", group: "Account" },
  { label: "Competitions", icon: <Trophy className="size-5" />, to: "/dashboard/competitions", group: "Account" },
  { label: "Wallet", icon: <Wallet className="size-5" />, to: "/dashboard/wallet", group: "Account" },
  { label: "Entries", icon: <Ticket className="size-5" />, to: "/dashboard/entries", group: "Account" },
  { label: "Account", icon: <User className="size-5" />, to: "/dashboard/profile", group: "Settings" },
];

const navGroups: Array<NavItem["group"]> = ["Account", "Rewards", "Settings"];

export type DashboardNavLinkProps = {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
};

export function DashboardNavLink({ item, active, onClick }: DashboardNavLinkProps) {
  return (
    <Link
      to={item.to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-extrabold transition-all",
        active
          ? "bg-coral text-white shadow-[0_8px_24px_-10px_var(--coral)] ring-1 ring-coral/30"
          : "text-ink/70 hover:bg-ink/5 hover:text-ink",
      )}
      aria-current={active ? "page" : undefined}
    >
      <span
        className={cn(
          "grid size-8 place-items-center rounded-xl transition-colors",
          active ? "bg-white/15 text-white" : "bg-coral/10 text-coral",
        )}
      >
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}

type Props = {
  children: ReactNode;
  title: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
};

export function DashboardAppShell({ children, title, breadcrumbs }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileUserDropdown, setMobileUserDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (to: string) => {
    if (to === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(to);
  };

  const activeBottom = (to: string) => {
    if (to === "/dashboard/profile") return location.pathname.startsWith("/dashboard/profile") || location.pathname.startsWith("/dashboard/security");
    return isActive(to);
  };

  return (
    <div className="min-h-screen bg-cream/40">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-ink/5 bg-white lg:flex",
          "rounded-r-[28px] ring-1 ring-ink/5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)]",
        )}
      >
        <Link to="/" className="flex items-center gap-3 p-6 pb-5">
          <img
            src="/Rafilla-logo.png"
            alt=""
            className="size-11 shrink-0 rounded-2xl shadow-sm"
            width={44}
            height={44}
          />
          <div className="min-w-0">
            <span className="block font-display text-xl font-extrabold tracking-tight text-ink leading-tight">
              Rafilla
            </span>
            <span className="block text-[11px] font-bold text-ink/45">
              Grand Prizes dashboard
            </span>
          </div>
        </Link>

        <nav className="flex-1 space-y-5 px-3 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group}>
              <p className="px-3.5 pb-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-ink/35">
                {group}
              </p>
              <div className="space-y-1">
                {navItems
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <DashboardNavLink
                      key={item.label}
                      item={item}
                      active={isActive(item.to)}
                    />
                  ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3.5 relative">
          <button
            onClick={() => setUserDropdownOpen((v) => !v)}
            className="flex w-full items-center gap-3 rounded-2xl bg-cream/60 p-3 ring-1 ring-ink/5 hover:ring-coral/20 hover:bg-white transition-all"
          >
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-coral text-white shadow-[0_8px_18px_-10px_var(--coral)] font-display text-sm font-extrabold">
              TA
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-extrabold text-ink leading-tight">Tunmise Adebayo</p>
              <p className="truncate text-[11px] font-bold text-ink/45 leading-snug">tunmise.adebayo@example.com</p>
              <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-coral/10 px-2 py-0.5 text-[10px] font-extrabold text-coral">
                <ShieldCheck className="size-3" /> Verified
              </p>
            </div>
            <ChevronDown className={cn("size-4 text-ink/35 transition-transform", userDropdownOpen && "rotate-180")} />
          </button>
          {userDropdownOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 rounded-2xl bg-white p-1.5 ring-1 ring-ink/10 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.25)]">
              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  navigate({ to: "/auth" });
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-extrabold text-ink/70 transition-colors hover:bg-cream hover:text-ink"
              >
                <LogOut className="size-4 text-coral" />
                Log out
              </button>
            </div>
          )}
        </div>
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-ink/40 lg:hidden",
          mobileMenuOpen ? "block" : "hidden",
        )}
        onClick={() => setMobileMenuOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 rounded-r-[28px] bg-white ring-1 ring-ink/5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)] transition-transform lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-6 pb-4">
          <Link to="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
            <img
              src="/Rafilla-logo.png"
              alt=""
              className="size-10 shrink-0 rounded-2xl shadow-sm"
              width={40}
              height={40}
            />
            <div className="min-w-0">
              <span className="block font-display text-lg font-extrabold tracking-tight text-ink leading-tight">
                Rafilla
              </span>
              <span className="block text-[11px] font-bold text-ink/45">
                Grand Prizes dashboard
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="grid size-10 place-items-center rounded-2xl bg-cream/70 text-ink ring-1 ring-ink/5"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={() => setMobileUserDropdown((v) => !v)}
            className="flex w-full items-center gap-3 rounded-2xl bg-cream/60 p-3 ring-1 ring-ink/5"
          >
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-coral text-white shadow-[0_8px_18px_-10px_var(--coral)] font-display text-sm font-extrabold">
              TA
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-extrabold text-ink leading-tight">Tunmise Adebayo</p>
              <p className="truncate text-[11px] font-bold text-ink/45 leading-snug">tunmise.adebayo@example.com</p>
              <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-coral/10 px-2 py-0.5 text-[10px] font-extrabold text-coral">
                <ShieldCheck className="size-3" /> Verified
              </p>
            </div>
            <ChevronDown className={cn("size-4 text-ink/35 transition-transform", mobileUserDropdown && "rotate-180")} />
          </button>
          {mobileUserDropdown && (
            <div className="mt-2 rounded-2xl bg-white p-1.5 ring-1 ring-ink/10 shadow-lg">
              <button
                onClick={() => {
                  setMobileUserDropdown(false);
                  setMobileMenuOpen(false);
                  navigate({ to: "/auth" });
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-extrabold text-ink/70 hover:bg-cream hover:text-ink"
              >
                <LogOut className="size-4 text-coral" />
                Log out
              </button>
            </div>
          )}
        </div>

        <nav className="space-y-5 px-3 pb-4 overflow-y-auto max-h-[56vh]">
          {navGroups.map((group) => (
            <div key={group}>
              <p className="px-3.5 pb-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-ink/35">
                {group}
              </p>
              <div className="space-y-1">
                {navItems
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <DashboardNavLink
                      key={item.label}
                      item={item}
                      active={isActive(item.to)}
                      onClick={() => setMobileMenuOpen(false)}
                    />
                  ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-ink/5 bg-white/80 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="grid size-10 place-items-center rounded-2xl bg-cream/70 text-ink ring-1 ring-ink/5"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/Rafilla-logo.png"
              alt=""
              className="size-9 shrink-0 rounded-2xl shadow-sm"
              width={36}
              height={36}
            />
            <div className="min-w-0">
              <span className="block font-display text-base font-extrabold tracking-tight text-ink leading-none">
                Rafilla
              </span>
              <span className="block text-[10px] font-bold text-ink/45">
                Dashboard
              </span>
            </div>
          </Link>
        </div>
        <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-coral text-white font-display text-sm font-extrabold shadow-[0_8px_18px_-10px_var(--coral)]">
          TA
        </div>
      </header>

      <main className="lg:ml-[260px] min-h-screen px-4 py-6 lg:px-8 lg:py-8 pb-28">
        <div className="mx-auto max-w-7xl space-y-6">
          {(title || breadcrumbs) && (
            <div className="space-y-1.5">
              {breadcrumbs && breadcrumbs.length > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-ink/40">
                  {breadcrumbs.map((crumb, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      {crumb.href ? (
                        <Link to={crumb.href} className="hover:text-coral transition-colors">
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="text-ink/65">{crumb.label}</span>
                      )}
                      {i < breadcrumbs.length - 1 && (
                        <ChevronDown className="size-3 -rotate-90 text-ink/30" />
                      )}
                    </span>
                  ))}
                </div>
              )}
              {title && (
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink lg:text-3xl leading-tight">
                  {title}
                </h1>
              )}
            </div>
          )}
          {children}
        </div>
      </main>

      <nav
        className="fixed inset-x-0 bottom-3 z-40 mx-auto w-[calc(100%-24px)] max-w-md rounded-[26px] bg-white ring-1 ring-ink/5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)] lg:hidden"
        aria-label="Dashboard bottom navigation"
      >
        <div className="grid grid-cols-5 px-1.5 pb-1.5 pt-2">
          {bottomNavItems.map((item) => {
            const isA = activeBottom(item.to);
            return (
              <Link
                key={item.label}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[10px] font-extrabold transition-colors",
                  isA ? "text-coral" : "text-ink/50 hover:text-ink",
                )}
                aria-current={isA ? "page" : undefined}
              >
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-xl transition-colors",
                    isA ? "bg-coral/10 text-coral" : "text-ink/50",
                  )}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
