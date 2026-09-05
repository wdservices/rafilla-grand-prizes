import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Trophy,
  Wallet,
  Ticket,
  ReceiptText,
  Users,
  UserCircle2,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Home,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: ReactNode;
  to: string;
  key: string;
};

const desktopNavItems: NavItem[] = [
  {
    label: "Overview",
    icon: <LayoutDashboard className="size-5" />,
    to: "/dashboard",
    key: "Overview",
  },
  {
    label: "Competitions",
    icon: <Trophy className="size-5" />,
    to: "/competitions",
    key: "Competitions",
  },
  {
    label: "Wallet",
    icon: <Wallet className="size-5" />,
    to: "/dashboard/wallet",
    key: "Wallet",
  },
  {
    label: "Entries",
    icon: <Ticket className="size-5" />,
    to: "/dashboard/entries",
    key: "Entries",
  },
  {
    label: "Transactions",
    icon: <ReceiptText className="size-5" />,
    to: "/dashboard/transactions",
    key: "Transactions",
  },
  {
    label: "Referrals",
    icon: <Users className="size-5" />,
    to: "/dashboard/referrals",
    key: "Referrals",
  },
  {
    label: "Profile",
    icon: <UserCircle2 className="size-5" />,
    to: "/dashboard/profile",
    key: "Profile",
  },
  {
    label: "Security",
    icon: <ShieldCheck className="size-5" />,
    to: "/dashboard/security",
    key: "Security",
  },
];

const bottomNavItems: NavItem[] = [
  {
    label: "Home",
    icon: <Home className="size-5" />,
    to: "/dashboard",
    key: "Overview",
  },
  {
    label: "Competitions",
    icon: <Trophy className="size-5" />,
    to: "/competitions",
    key: "Competitions",
  },
  {
    label: "Wallet",
    icon: <Wallet className="size-5" />,
    to: "/dashboard/wallet",
    key: "Wallet",
  },
  {
    label: "Entries",
    icon: <Ticket className="size-5" />,
    to: "/dashboard/entries",
    key: "Entries",
  },
  {
    label: "Account",
    icon: <User className="size-5" />,
    to: "/dashboard/profile",
    key: "Profile",
  },
];

export function DashboardShell({
  children,
  activeNav,
}: {
  children: ReactNode;
  activeNav?: string;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const activeKey = activeNav ?? "";

  return (
    <div className="min-h-screen bg-cream">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-ink/5 bg-paper lg:flex",
          "rounded-r-[28px] ring-1 ring-ink/5",
        )}
      >
        <div className="flex items-center gap-2 p-6 pb-4">
          <span className="grid size-10 place-items-center rounded-full bg-lilac font-display text-xl font-extrabold text-ink shadow-sm">
            R
          </span>
          <div>
            <span className="block font-display text-xl font-extrabold tracking-tight text-ink">
              Rafilla
            </span>
            <span className="block text-xs font-bold text-ink/45">Dashboard</span>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="flex items-center gap-3 rounded-2xl bg-cream p-3 ring-1 ring-ink/5">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-coral/15 font-display text-sm font-extrabold text-coral">
              TA
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-ink">Tunmise Adeyemi</p>
              <p className="truncate text-xs font-bold text-ink/45">t***@********</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {desktopNavItems.map((item) => {
            const isActive = activeKey === item.key;
            return (
              <Link
                key={item.key}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold transition-colors",
                  isActive
                    ? "bg-coral text-cream shadow-[0_8px_20px_-8px_var(--coral)]"
                    : "text-ink/70 hover:bg-cream hover:text-ink",
                )}
              >
                <span className={cn(isActive ? "text-cream" : "text-coral")}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4">
          <button
            onClick={() => navigate({ to: "/" })}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold text-ink/70 transition-colors hover:bg-cream hover:text-ink"
          >
            <LogOut className="size-5 text-coral" />
            Logout
          </button>
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
          "fixed inset-y-0 left-0 z-50 w-80 rounded-r-[28px] bg-paper ring-1 ring-ink/5 transition-transform lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-2">
            <span className="grid size-10 place-items-center rounded-full bg-lilac font-display text-xl font-extrabold text-ink shadow-sm">
              R
            </span>
            <div>
              <span className="block font-display text-xl font-extrabold tracking-tight text-ink">
                Rafilla
              </span>
              <span className="block text-xs font-bold text-ink/45">Dashboard</span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="grid size-10 place-items-center rounded-full bg-cream text-ink ring-1 ring-ink/5"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="px-4 pb-4">
          <div className="flex items-center gap-3 rounded-2xl bg-cream p-3 ring-1 ring-ink/5">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-coral/15 font-display text-sm font-extrabold text-coral">
              TA
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-ink">Tunmise Adeyemi</p>
              <p className="truncate text-xs font-bold text-ink/45">t***@********</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1 px-3 pb-4">
          {desktopNavItems.map((item) => {
            const isActive = activeKey === item.key;
            return (
              <Link
                key={item.key}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold transition-colors",
                  isActive
                    ? "bg-coral text-cream shadow-[0_8px_20px_-8px_var(--coral)]"
                    : "text-ink/70 hover:bg-cream hover:text-ink",
                )}
              >
                <span className={cn(isActive ? "text-cream" : "text-coral")}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate({ to: "/" });
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold text-ink/70 transition-colors hover:bg-cream hover:text-ink"
          >
            <LogOut className="size-5 text-coral" />
            Logout
          </button>
        </nav>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-ink/5 bg-paper/90 px-4 py-3 backdrop-blur lg:hidden sm:px-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="grid size-10 place-items-center rounded-full bg-cream text-ink ring-1 ring-ink/5"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <span className="grid size-10 place-items-center rounded-full bg-lilac font-display text-xl font-extrabold text-ink shadow-sm">
            R
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-ink">
            Rafilla
          </span>
        </div>
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-coral/15 font-display text-sm font-extrabold text-coral ring-1 ring-ink/5">
          TA
        </div>
      </header>

      <main className="lg:ml-[272px] min-h-screen pt-6 pb-28 px-4 sm:px-6 lg:px-8 lg:pt-8">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/5 bg-paper ring-1 ring-ink/5 lg:hidden"
        style={{ borderTopLeftRadius: "22px", borderTopRightRadius: "22px" }}
      >
        <div className="mx-auto grid max-w-lg grid-cols-5 px-2 pb-2 pt-3">
          {bottomNavItems.map((item) => {
            const isActive = activeKey === item.key;
            return (
              <Link
                key={item.key}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-extrabold transition-colors",
                  isActive ? "text-coral" : "text-ink/50 hover:text-ink",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-xl",
                    isActive ? "bg-coral/15 text-coral" : "text-ink/50",
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
