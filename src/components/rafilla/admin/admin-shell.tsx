import {
  LayoutGrid,
  Users,
  Handshake,
  Trophy,
  Banknote,
  BarChart3,
  Settings2,
  ClipboardList,
  ShieldAlert,
  UserSearch,
  Bell,
  Menu,
  X,
  ChevronDown,
  Search,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type AdminNavKey =
  | "dashboard"
  | "users"
  | "partners"
  | "competitions"
  | "payouts"
  | "reports"
  | "config"
  | "audit-logs"
  | "fraud"
  | "crm"
  | "notifications";

const NAV_ITEMS: Array<{
  key: AdminNavKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  emoji: string;
}> = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid, emoji: "📊" },
  { key: "users", label: "Users", icon: Users, emoji: "👥" },
  { key: "partners", label: "Partners", icon: Handshake, emoji: "🤝" },
  { key: "competitions", label: "Competitions", icon: Trophy, emoji: "🏆" },
  { key: "payouts", label: "Payouts", icon: Banknote, emoji: "💸" },
  { key: "reports", label: "Reports", icon: BarChart3, emoji: "📈" },
  { key: "config", label: "Config", icon: Settings2, emoji: "⚙" },
  { key: "audit-logs", label: "Audit logs", icon: ClipboardList, emoji: "🔐" },
  { key: "fraud", label: "Fraud queue", icon: ShieldAlert, emoji: "🛡" },
  { key: "crm", label: "CRM", icon: UserSearch, emoji: "🧑" },
  { key: "notifications", label: "Notifications", icon: Bell, emoji: "🔔" },
];

const navRoute: Record<AdminNavKey, string> = {
  dashboard: "/admin",
  users: "/admin/users",
  partners: "/admin/partners",
  competitions: "/admin/competitions",
  payouts: "/admin/payouts",
  reports: "/admin/reports",
  config: "/admin/config",
  "audit-logs": "/admin/audit-logs",
  fraud: "/admin/fraud",
  crm: "/admin/crm",
  notifications: "/admin/notifications",
};

interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
  activeNav: AdminNavKey;
}

export function AdminShell({ children, title, activeNav }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-ink text-cream transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-5 pt-7 pb-5">
          <div className="grid size-10 place-items-center rounded-full bg-coral font-display text-lg font-extrabold text-ink">
            R
          </div>
          <div>
            <p className="font-display text-lg font-extrabold leading-tight">Rafilla Admin</p>
            <p className="text-[10px] font-bold text-cream/50">Super admin console</p>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="flex items-center gap-3 rounded-full bg-cream/10 px-3 py-2.5">
            <Avatar className="size-9 ring-2 ring-coral/60">
              <AvatarFallback className="bg-coral text-ink font-extrabold">AA</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold">Admin Aisha</p>
              <Badge className="mt-0.5 rounded-full bg-coral px-2 py-0 text-[9px] font-extrabold uppercase tracking-wider text-ink ring-0">
                Super Admin
              </Badge>
            </div>
            <ChevronDown className="size-4 text-cream/50" />
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4" aria-label="Admin navigation">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
            const active = key === activeNav;
            return (
              <Link
                key={key}
                to={navRoute[key]}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-bold transition-colors",
                  active
                    ? "bg-coral text-white"
                    : "text-cream/70 hover:bg-coral/20 hover:text-cream",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className={cn(
                    "size-4.5 shrink-0",
                    active ? "text-white" : "text-cream/60 group-hover:text-cream",
                  )}
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-0.5 border-t border-cream/10 px-3 py-4">
          <a
            href="/"
            className="flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-bold text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
          >
            <ExternalLink className="size-4.5 text-cream/60" />
            Back to site
          </a>
          <button className="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-bold text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream">
            <LogOut className="size-4.5 text-cream/60" />
            Log out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-ink/5 bg-paper px-5 py-4">
          <Button
            variant="outline"
            size="icon"
            className="size-10 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close admin menu" : "Open admin menu"}
          >
            {mobileOpen ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
          </Button>

          <div className="hidden items-center gap-2 lg:flex">
            <img
              src="/Rafilla-logo.png"
              alt=""
              className="size-9 shrink-0 rounded-2xl shadow-sm"
              width={36}
              height={36}
            />
            {title && (
              <p className="font-display text-xl font-extrabold text-ink">{title}</p>
            )}
          </div>

          <div className="flex-1 max-w-md ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
              <Input
                placeholder="Search users, partners, competitions…"
                className="h-10 rounded-full border-0 bg-cream pl-9 pr-4 text-sm font-bold text-ink placeholder:text-ink/40 focus-visible:ring-coral"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="relative size-10" aria-label="Admin notifications">
              <Bell className="size-4.5" />
              <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-coral" aria-hidden="true" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-10 lg:hidden">
                  <Avatar className="size-9 ring-2 ring-coral/60">
                    <AvatarFallback className="bg-coral text-ink font-extrabold">AA</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-[22px] bg-paper p-2">
                <DropdownMenuLabel className="rounded-xl bg-cream px-3 py-2.5">
                  <p className="font-extrabold text-ink">Admin Aisha</p>
                  <Badge className="mt-1 rounded-full bg-coral px-2 py-0 text-[9px] font-extrabold uppercase tracking-wider text-ink ring-0">
                    Super Admin
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-ink/70 focus:bg-lilac/20 focus:text-ink">
                  <ExternalLink className="mr-2 size-4" />
                  Back to site
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-ink/70 focus:bg-lilac/20 focus:text-ink">
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-paper p-5 sm:p-6 lg:p-7 pb-24 sm:pb-28">
          {children}
        </div>
      </div>
    </div>
  );
}
