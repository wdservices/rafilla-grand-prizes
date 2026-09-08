import {
  LayoutGrid,
  Users,
  Trophy,
  Building2,
  Banknote,
  BarChart3,
  UsersRound,
  Sparkles,
  Award,
  Contacts,
  ClipboardList,
  ShieldAlert,
  Settings2,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuthActions } from "@/hooks/useAuthSession";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type AdminNavKey =
  | "overview"
  | "users"
  | "competitions"
  | "partners"
  | "payouts"
  | "reports"
  | "referrals"
  | "draws"
  | "winners"
  | "crm"
  | "audit"
  | "fraud"
  | "config";

const NAV_ITEMS: Array<{
  key: AdminNavKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "users", label: "Users", icon: Users },
  { key: "competitions", label: "Competitions", icon: Trophy },
  { key: "partners", label: "Partners", icon: Building2 },
  { key: "payouts", label: "Payouts", icon: Banknote },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "referrals", label: "Referrals", icon: UsersRound },
  { key: "draws", label: "Draws", icon: Sparkles },
  { key: "winners", label: "Winners", icon: Award },
  { key: "crm", label: "CRM", icon: Contacts },
  { key: "audit", label: "Audit", icon: ClipboardList },
  { key: "fraud", label: "Fraud", icon: ShieldAlert },
  { key: "config", label: "Config", icon: Settings2 },
];

const navRoute: Record<AdminNavKey, string> = {
  overview: "/admin",
  users: "/admin/users",
  competitions: "/admin/competitions",
  partners: "/admin",
  payouts: "/admin/payouts",
  reports: "/admin/reports",
  referrals: "/admin",
  draws: "/admin",
  winners: "/admin",
  crm: "/admin",
  audit: "/admin",
  fraud: "/admin",
  config: "/admin/config",
};

interface AdminShellProps {
  children: React.ReactNode;
  activeNav: AdminNavKey;
}

export function AdminShell({ children, activeNav }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut } = useAuthActions();

  const handleLogout = () => signOut({ to: "/auth" });

  return (
    <div className="min-h-screen bg-cream">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col bg-ink text-cream lg:flex" style={{ borderRadius: "0 22px 22px 0" }}>
        <div className="flex items-center gap-3 px-6 pt-8 pb-6">
          <div className="grid size-11 place-items-center rounded-full bg-coral font-display text-xl font-extrabold text-ink">
            R
          </div>
          <div>
            <p className="font-display text-xl font-extrabold leading-tight">Rafilla Admin</p>
            <p className="text-[11px] font-bold text-cream/50">Control centre</p>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="flex items-center gap-3 rounded-full bg-cream/10 px-3 py-2.5">
            <Avatar className="size-9 ring-2 ring-coral/60">
              <AvatarFallback className="bg-coral text-ink font-extrabold">AA</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold">Admin Aisha</p>
              <p className="truncate text-[11px] font-bold text-cream/55">Super Admin</p>
            </div>
            <ChevronDown className="size-4 text-cream/50" />
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
            const active = key === activeNav;
            return (
              <Link
                key={key}
                to={navRoute[key]}
                className={cn(
                  "group flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-bold transition-colors",
                  active
                    ? "bg-coral text-ink"
                    : "text-cream/70 hover:bg-cream/10 hover:text-cream",
                )}
              >
                <Icon className={cn("size-4.5 shrink-0", active ? "text-ink" : "text-cream/60 group-hover:text-cream")} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-cream/10 px-3 py-4">
          <a
            href="/"
            className="flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-bold text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
          >
            <ExternalLink className="size-4.5 text-cream/60" />
            Back to site
          </a>
          <button
            onClick={handleLogout}
            aria-label="Log out of admin dashboard"
            className="flex w-full items-center gap-3 rounded-full bg-coral px-3.5 py-2.5 text-sm font-extrabold text-ink shadow-sm transition-colors hover:bg-coral/90"
          >
            <LogOut className="size-4.5 text-ink" />
            Log out / Exit
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-ink/5 bg-cream/90 px-3 py-3 backdrop-blur lg:hidden">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-cream">
          <span className="font-display text-lg font-extrabold">R</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-extrabold text-ink">Rafilla Admin</p>
          <p className="truncate text-[11px] font-bold text-ink/50">Control centre</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          aria-label="Exit admin dashboard"
          className="hidden sm:inline-flex shrink-0 rounded-full bg-coral px-3 py-2 text-xs font-extrabold text-ink hover:bg-coral/90"
        >
          <LogOut className="size-3.5" /> Exit
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-10 shrink-0">
              <Avatar className="size-9 ring-2 ring-coral/60">
                <AvatarFallback className="bg-coral text-ink font-extrabold">AA</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-[22px] bg-paper p-2">
            <DropdownMenuLabel className="rounded-xl bg-cream px-3 py-2.5">
              <p className="font-extrabold text-ink">Admin Aisha</p>
              <p className="text-[11px] font-bold text-ink/50">Super Admin</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => (window.location.href = "/")}
              className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-ink/70 focus:bg-lilac/20 focus:text-ink"
            >
              <ExternalLink className="mr-2 size-4" />
              Back to site
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-coral focus:bg-coral/15 focus:text-coral"
            >
              <LogOut className="mr-2 size-4" />
              Log out / Exit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="icon"
          className="size-10 shrink-0"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
        </Button>
      </header>

      {mobileOpen && (
        <div className="sticky top-[57px] z-20 border-b border-ink/5 bg-paper/90 backdrop-blur lg:hidden">
          <div className="flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
              const active = key === activeNav;
              return (
                <Link
                  key={key}
                  to={navRoute[key]}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold transition-colors",
                    active
                      ? "bg-coral text-ink"
                      : "bg-cream text-ink/70 ring-1 ring-ink/10 hover:bg-lilac/20",
                  )}
                >
                  <Icon className="size-3.5" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <main className="min-w-0 lg:ml-[304px] px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-10 overflow-x-hidden">
        <div className="mb-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="rounded-full border-coral/20 bg-white px-4 py-2 text-xs font-extrabold text-coral hover:bg-coral hover:text-white"
          >
            <LogOut className="size-3.5" /> Exit / Log out
          </Button>
        </div>
        <div className="mx-auto w-full max-w-full min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}
