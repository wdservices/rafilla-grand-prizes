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
        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold transition-colors",
        active
          ? "bg-coral text-white shadow-[0_8px_20px_-8px_var(--coral)]"
          : "text-ink/70 hover:bg-paper hover:text-ink",
      )}
      aria-current={active ? "page" : undefined}
    >
      <span className={cn(active ? "text-white" : "text-coral")}>{item.icon}</span>
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
    <div className="min-h-screen bg-paper">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-ink/5 bg-cream lg:flex",
          "rounded-r-[28px] ring-1 ring-ink/5",
        )}
      >
        <Link to="/" className="flex items-center gap-2 p-6 pb-4">
          <span className="grid size-10 place-items-center rounded-full bg-lilac font-display text-xl font-extrabold text-ink shadow-sm">
            R
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-ink">
            Rafilla
          </span>
        </Link>

        <nav className="flex-1 space-y-5 px-3 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group}>
              <p className="px-4 pb-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink/40">
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

        <div className="p-4 relative">
          <button
            onClick={() => setUserDropdownOpen((v) => !v)}
            className="flex w-full items-center gap-3 rounded-2xl bg-paper p-3 ring-1 ring-ink/5 hover:ring-coral/20 transition-all"
          >
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-coral/15 font-display text-sm font-extrabold text-coral">
              TA
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-extrabold text-ink">Tunmise Adebayo</p>
              </div>
              <div className="flex items-center gap-1.5">
                <p className="truncate text-[11px] font-bold text-ink/45">tunmise.adebayo@example.com</p>
              </div>
              <p className="mt-0.5 inline-flex items-center rounded-full bg-lilac/30 px-2 py-0.5 text-[10px] font-extrabold text-ink">
                @tunmise_ade
              </p>
            </div>
            <ChevronDown className={cn("size-4 text-ink/45 transition-transform", userDropdownOpen && "rotate-180")} />
          </button>
          {userDropdownOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 rounded-2xl bg-paper p-2 ring-1 ring-ink/10 shadow-lg">
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
          "fixed inset-y-0 left-0 z-50 w-80 rounded-r-[28px] bg-cream ring-1 ring-ink/5 transition-transform lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-6 pb-4">
          <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <span className="grid size-10 place-items-center rounded-full bg-lilac font-display text-xl font-extrabold text-ink shadow-sm">
              R
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight text-ink">
              Rafilla
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="grid size-10 place-items-center rounded-full bg-paper text-ink ring-1 ring-ink/5"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={() => setMobileUserDropdown((v) => !v)}
            className="flex w-full items-center gap-3 rounded-2xl bg-paper p-3 ring-1 ring-ink/5"
          >
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-coral/15 font-display text-sm font-extrabold text-coral">
              TA
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-extrabold text-ink">Tunmise Adebayo</p>
              <p className="truncate text-[11px] font-bold text-ink/45">tunmise.adebayo@example.com</p>
              <span className="mt-0.5 inline-flex items-center rounded-full bg-lilac/30 px-2 py-0.5 text-[10px] font-extrabold text-ink">
                @tunmise_ade
              </span>
            </div>
            <ChevronDown className={cn("size-4 text-ink/45 transition-transform", mobileUserDropdown && "rotate-180")} />
          </button>
          {mobileUserDropdown && (
            <div className="mt-2 rounded-2xl bg-paper p-2 ring-1 ring-ink/10">
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

        <nav className="space-y-5 px-3 pb-4 overflow-y-auto max-h-[60vh]">
          {navGroups.map((group) => (
            <div key={group}>
              <p className="px-4 pb-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink/40">
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

      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-ink/5 bg-paper/90 px-5 py-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="grid size-10 place-items-center rounded-full bg-cream text-ink ring-1 ring-ink/5"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-lilac font-display text-lg font-extrabold text-ink shadow-sm">
              R
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-ink">
              Rafilla
            </span>
          </Link>
        </div>
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-coral/15 font-display text-sm font-extrabold text-coral ring-1 ring-ink/5">
          TA
        </div>
      </header>

      <div className="lg:ml-[260px] min-h-screen px-5 py-5 lg:px-7 lg:py-7 pb-28">
        {(title || breadcrumbs) && (
          <div className="mb-6 max-w-7xl mx-auto">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-ink/45">
                {breadcrumbs.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {crumb.href ? (
                      <Link to={crumb.href} className="hover:text-coral">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-ink/60">{crumb.label}</span>
                    )}
                    {i < breadcrumbs.length - 1 && <ChevronDown className="size-3 -rotate-90" />}
                  </span>
                ))}
              </div>
            )}
            {title && (
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">
                Dashboard
              </p>
            )}
          </div>
        )}
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </div>

      <nav
        className="fixed inset-x-0 bottom-3 z-40 mx-auto w-[calc(100%-24px)] max-w-md rounded-[28px] bg-paper ring-1 ring-ink/5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] lg:hidden"
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
                    isA ? "bg-coral/15 text-coral" : "text-ink/50",
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
