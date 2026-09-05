import { useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  ListOrdered,
  Upload,
  BarChart3,
  Landmark,
  UserCircle2,
  Menu,
  Search,
  Bell,
  LogOut,
  Gem,
  Car,
  Award,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export type PartnerNavKey =
  | "overview"
  | "listings"
  | "submit"
  | "analytics"
  | "settlements"
  | "profile";

interface NavItem {
  key: PartnerNavKey;
  label: string;
  icon: ReactNode;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: "overview", label: "Overview", icon: <LayoutDashboard className="w-5 h-5" />, path: "/partner" },
  { key: "listings", label: "My listings", icon: <ListOrdered className="w-5 h-5" />, path: "/partner/listings" },
  { key: "submit", label: "Submit asset", icon: <Upload className="w-5 h-5" />, path: "/partner/submit" },
  { key: "analytics", label: "Analytics", icon: <BarChart3 className="w-5 h-5" />, path: "/partner/analytics" },
  { key: "settlements", label: "Settlements", icon: <Landmark className="w-5 h-5" />, path: "/partner/settlements" },
  { key: "profile", label: "Profile", icon: <UserCircle2 className="w-5 h-5" />, path: "/partner/profile" },
];

interface PartnerShellProps {
  children: ReactNode;
  title: string;
  activeNav: PartnerNavKey;
}

export function PartnerShell({ children, title, activeNav }: PartnerShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const BrandBlock = () => (
    <div className="flex items-center gap-3 p-4">
      <div className="w-12 h-12 rounded-2xl bg-coral flex items-center justify-center text-white shrink-0 border-4 border-paper shadow-sm">
        <Car className="w-6 h-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-ink text-base leading-tight truncate">
          Lekki Luxury Autos
        </p>
        <Badge className="rounded-full bg-mint/40 border-mint text-ink text-[10px] font-bold mt-0.5">
          <ShieldCheck className="w-3 h-3 mr-1" /> Approved Partner
        </Badge>
      </div>
    </div>
  );

  const NavList = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1 px-3 py-2" aria-label="Partner navigation">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.key === activeNav ||
          (item.key === "overview" && (location.pathname === "/partner" || location.pathname === "/partner/"));
        return (
          <Link
            key={item.key}
            to={item.path}
            onClick={() => onNavigate?.()}
            className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-body transition-all ${
              isActive
                ? "bg-coral text-white shadow-md shadow-coral/20"
                : "text-ink/75 hover:bg-coral/15 hover:text-ink"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <span className={`${isActive ? "text-white" : "text-ink/60 group-hover:text-coral"} transition`}>
              {item.icon}
            </span>
            <span className="font-semibold">{item.label}</span>
            {item.key === "submit" && !isActive && (
              <Sparkles className="w-3.5 h-3.5 text-coral ml-auto" />
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-paper text-ink flex">
      <aside className="hidden lg:flex lg:flex-col w-[272px] shrink-0 bg-cream border-r border-ink/10 min-h-screen">
        <BrandBlock />
        <Separator className="bg-ink/5" />
        <div className="mt-3 flex-1">
          <NavList />
        </div>
        <Separator className="bg-ink/5" />
        <div className="p-4 space-y-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-coral/15 via-lemon/20 to-mint/20 border border-coral/20">
            <div className="flex items-center gap-2 mb-1.5">
              <Gem className="w-4 h-4 text-coral" />
              <p className="font-display text-ink text-sm font-bold">Partner Perks</p>
            </div>
            <p className="text-[11px] font-body text-ink/70 leading-snug">
              Top 3 partners this quarter win a spot on the homepage featured carousel.
            </p>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-paper border border-ink/10">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-mint/40 text-ink font-display font-bold">
                MA
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-body text-sm font-semibold text-ink truncate">Mrs. Adaeze</p>
              <p className="text-[11px] text-ink/50 truncate">adaeze@lekkiluxury.ng</p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full text-ink/50 hover:text-coral" aria-label="Sign out">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen pb-24 sm:pb-28">
        <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur border-b border-ink/10 px-4 sm:px-6 py-3 flex items-center gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden rounded-full" aria-label="Open partner menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 bg-cream border-r border-ink/10">
              <BrandBlock />
              <Separator className="bg-ink/5" />
              <NavList onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <Link to="/partner" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center">
              <Award className="w-4 h-4 text-coral" />
            </div>
            <span className="font-display text-ink text-lg hidden sm:block">Rafilla</span>
            <Badge variant="outline" className="rounded-full border-coral/30 bg-coral/10 text-coral text-[10px] hidden sm:inline-flex">
              Partner
            </Badge>
          </Link>

          <div className="font-display text-ink text-lg sm:text-xl truncate ml-1">
            <span className="text-ink/30 mx-2 hidden sm:inline">/</span>
            {title}
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden md:block relative w-64 lg:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
              <Input
                className="pl-9 rounded-full bg-cream/60 border-ink/10 focus:border-coral focus:ring-0 text-sm"
                placeholder="Search listings, entries..."
              />
            </div>
            <Button variant="ghost" size="icon" className="rounded-full relative" aria-label="Partner notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-coral border-2 border-paper" aria-hidden="true" />
            </Button>
            <Avatar className="w-9 h-9 lg:hidden">
              <AvatarFallback className="bg-mint/40 text-ink font-display font-bold text-xs">MA</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="flex-1 p-5 sm:p-7">
          {children}
        </div>
      </div>
    </div>
  );
}
