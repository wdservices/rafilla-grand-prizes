import { useState } from "react";
import { PartnerShell } from "./partner-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Search,
  Eye,
  Edit3,
  Ban,
  MoreHorizontal,
  Upload,
  Filter,
  LayoutGrid,
  List,
  Clock,
  Ticket,
  Trophy,
  Car,
  Watch,
  Smartphone,
  Gem,
  Laptop,
  Sofa,
} from "lucide-react";
import { formatNaira } from "@/lib/utils";

type ListingStatus = "DRAFT" | "APPROVAL_REQUIRED" | "REJECTED" | "LIVE" | "COMPLETED";
type Category = "Auto" | "Watches" | "Electronics" | "Jewelry" | "Real Estate" | "Home";

interface Listing {
  id: string;
  name: string;
  category: Category;
  status: ListingStatus;
  entriesPct: number;
  entriesCount: number;
  maxEntries: number;
  valueKobo: number;
  tint: string;
  imageIcon: React.ReactNode;
  submittedAt: string;
  drawDate: string;
  views: number;
}

const CAT_ICON: Record<Category, React.ReactNode> = {
  Auto: <Car className="w-8 h-8" />,
  Watches: <Watch className="w-8 h-8" />,
  Electronics: <Smartphone className="w-8 h-8" />,
  Jewelry: <Gem className="w-8 h-8" />,
  "Real Estate": <Gem className="w-8 h-8" />,
  Home: <Sofa className="w-8 h-8" />,
};

const CAT_TINT: Record<Category, string> = {
  Auto: "from-coral/25 to-coral/10",
  Watches: "from-lemon/40 to-lemon/15",
  Electronics: "from-sky/25 to-sky/10",
  Jewelry: "from-lilac/30 to-lilac/10",
  "Real Estate": "from-mint/30 to-mint/10",
  Home: "from-lilac/25 to-lilac/10",
};

const STATUSES: ListingStatus[] = ["DRAFT", "APPROVAL_REQUIRED", "REJECTED", "LIVE", "COMPLETED"];

function statusBadge(s: ListingStatus) {
  switch (s) {
    case "LIVE":
      return (
        <Badge className="rounded-full bg-mint border-mint text-ink text-[10px] font-bold animate-pulse">
          LIVE
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge className="rounded-full bg-ink text-cream text-[10px] font-bold">
          <Trophy className="w-3 h-3 mr-1" /> COMPLETED
        </Badge>
      );
    case "APPROVAL_REQUIRED":
      return (
        <Badge
          variant="outline"
          className="rounded-full bg-lemon/30 border-lemon text-ink text-[10px] font-semibold"
        >
          <Clock className="w-3 h-3 mr-1" /> AWAITING REVIEW
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge
          variant="outline"
          className="rounded-full bg-coral/15 border-coral text-coral text-[10px] font-semibold"
        >
          REJECTED
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="rounded-full bg-cream text-ink/60 border-ink/20 text-[10px]"
        >
          DRAFT
        </Badge>
      );
  }
}

const LISTINGS: Listing[] = [
  {
    id: "LST-88472",
    name: "2024 Lexus RX 350 F-Sport",
    category: "Auto",
    status: "LIVE",
    entriesPct: 87,
    entriesCount: 4350,
    maxEntries: 5000,
    valueKobo: 4850000000,
    tint: CAT_TINT.Auto,
    imageIcon: CAT_ICON.Auto,
    submittedAt: "2026-08-14",
    drawDate: "2026-09-28",
    views: 98420,
  },
  {
    id: "LST-88471",
    name: "2024 Mercedes-Benz GLE 450",
    category: "Auto",
    status: "LIVE",
    entriesPct: 62,
    entriesCount: 3100,
    maxEntries: 5000,
    valueKobo: 6200000000,
    tint: CAT_TINT.Auto,
    imageIcon: CAT_ICON.Auto,
    submittedAt: "2026-08-20",
    drawDate: "2026-10-05",
    views: 62340,
  },
  {
    id: "LST-88470",
    name: "Rolex Daytona 126500LN Panda",
    category: "Watches",
    status: "LIVE",
    entriesPct: 94,
    entriesCount: 4700,
    maxEntries: 5000,
    valueKobo: 3850000000,
    tint: CAT_TINT.Watches,
    imageIcon: CAT_ICON.Watches,
    submittedAt: "2026-08-02",
    drawDate: "2026-09-21",
    views: 121330,
  },
  {
    id: "LST-88469",
    name: "Samsung Galaxy S24 Ultra x 5",
    category: "Electronics",
    status: "COMPLETED",
    entriesPct: 100,
    entriesCount: 8000,
    maxEntries: 8000,
    valueKobo: 750000000,
    tint: CAT_TINT.Electronics,
    imageIcon: CAT_ICON.Electronics,
    submittedAt: "2026-07-20",
    drawDate: "2026-09-10",
    views: 210120,
  },
  {
    id: "LST-88468",
    name: "Land in Lekki Phase 1 (600sqm)",
    category: "Real Estate",
    status: "LIVE",
    entriesPct: 38,
    entriesCount: 1900,
    maxEntries: 5000,
    valueKobo: 5500000000,
    tint: CAT_TINT["Real Estate"],
    imageIcon: CAT_ICON["Real Estate"],
    submittedAt: "2026-08-28",
    drawDate: "2026-10-19",
    views: 41220,
  },
  {
    id: "LST-88467",
    name: "14K Gold Cuban Link Chain",
    category: "Jewelry",
    status: "APPROVAL_REQUIRED",
    entriesPct: 0,
    entriesCount: 0,
    maxEntries: 3000,
    valueKobo: 240000000,
    tint: CAT_TINT.Jewelry,
    imageIcon: CAT_ICON.Jewelry,
    submittedAt: "2026-09-17",
    drawDate: "TBD",
    views: 120,
  },
  {
    id: "LST-88466",
    name: "2023 Toyota Camry XSE V6",
    category: "Auto",
    status: "COMPLETED",
    entriesPct: 100,
    entriesCount: 3500,
    maxEntries: 3500,
    valueKobo: 1850000000,
    tint: CAT_TINT.Auto,
    imageIcon: CAT_ICON.Auto,
    submittedAt: "2026-06-15",
    drawDate: "2026-08-30",
    views: 148900,
  },
  {
    id: "LST-88465",
    name: 'MacBook Pro 16" M4 Max',
    category: "Electronics",
    status: "DRAFT",
    entriesPct: 0,
    entriesCount: 0,
    maxEntries: 2000,
    valueKobo: 42000000,
    tint: CAT_TINT.Electronics,
    imageIcon: <Laptop className="w-8 h-8" />,
    submittedAt: "Draft saved",
    drawDate: "Not scheduled",
    views: 0,
  },
  {
    id: "LST-88464",
    name: "Richard Mille RM 67-02",
    category: "Watches",
    status: "REJECTED",
    entriesPct: 0,
    entriesCount: 0,
    maxEntries: 4000,
    valueKobo: 18500000000,
    tint: CAT_TINT.Watches,
    imageIcon: CAT_ICON.Watches,
    submittedAt: "2026-09-08",
    drawDate: "—",
    views: 480,
  },
  {
    id: "LST-88463",
    name: "Italian Leather Sectional Sofa",
    category: "Home",
    status: "LIVE",
    entriesPct: 55,
    entriesCount: 1100,
    maxEntries: 2000,
    valueKobo: 32000000,
    tint: CAT_TINT.Home,
    imageIcon: CAT_ICON.Home,
    submittedAt: "2026-08-30",
    drawDate: "2026-10-12",
    views: 18430,
  },
  {
    id: "LST-88462",
    name: "2024 Range Rover Sport Autobiography",
    category: "Auto",
    status: "DRAFT",
    entriesPct: 0,
    entriesCount: 0,
    maxEntries: 6000,
    valueKobo: 9800000000,
    tint: CAT_TINT.Auto,
    imageIcon: CAT_ICON.Auto,
    submittedAt: "Draft saved",
    drawDate: "Not scheduled",
    views: 0,
  },
];

const FILTER_TABS: (ListingStatus | "ALL")[] = [
  "ALL",
  "LIVE",
  "APPROVAL_REQUIRED",
  "DRAFT",
  "COMPLETED",
  "REJECTED",
];
const TINT_BG = ["coral", "sky", "lemon", "mint", "lilac"];

export function PartnerListingsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ListingStatus | "ALL">("ALL");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [activeCategory, setActiveCategory] = useState<Category | "ALL">("ALL");

  const filtered = LISTINGS.filter((l) => {
    if (filter !== "ALL" && l.status !== filter) return false;
    if (activeCategory !== "ALL" && l.category !== activeCategory) return false;
    if (query) {
      const q = query.toLowerCase();
      if (
        !l.name.toLowerCase().includes(q) &&
        !l.id.toLowerCase().includes(q) &&
        !l.category.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const counts = {
    ALL: LISTINGS.length,
    LIVE: LISTINGS.filter((l) => l.status === "LIVE").length,
    APPROVAL_REQUIRED: LISTINGS.filter((l) => l.status === "APPROVAL_REQUIRED").length,
    DRAFT: LISTINGS.filter((l) => l.status === "DRAFT").length,
    COMPLETED: LISTINGS.filter((l) => l.status === "COMPLETED").length,
    REJECTED: LISTINGS.filter((l) => l.status === "REJECTED").length,
  };

  return (
    <PartnerShell activeNav="listings" title="My listings">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-ink">My listings</h1>
            <p className="font-body text-ink/60 text-sm mt-1">
              Manage assets submitted to Raffila for prize draws.
            </p>
          </div>
          <Button className="rounded-full bg-coral hover:bg-coral/90 text-white">
            <Upload className="w-4 h-4 mr-2" /> Submit new asset
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {FILTER_TABS.map((t) => (
            <Button
              key={t}
              variant={filter === t ? "primary" : "outline"}
              size="sm"
              className={`rounded-full ${filter === t ? "bg-coral text-white hover:bg-coral/90 border-coral" : "text-ink/70"}`}
              onClick={() => setFilter(t)}
            >
              {t === "APPROVAL_REQUIRED"
                ? "In review"
                : t === "ALL"
                  ? "All listings"
                  : t[0] + t.slice(1).toLowerCase()}
              <Badge
                className={`ml-2 rounded-full text-[10px] font-bold ${
                  filter === t ? "bg-white/20 text-white border-0" : "bg-ink/5 text-ink/60 border-0"
                }`}
              >
                {counts[t]}
              </Badge>
            </Button>
          ))}
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <div className="flex gap-1">
              <Button
                variant={view === "grid" ? "primary" : "outline"}
                size="icon"
                className={`rounded-full ${view === "grid" ? "bg-coral" : ""}`}
                onClick={() => setView("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={view === "list" ? "primary" : "outline"}
                size="icon"
                className={`rounded-full ${view === "list" ? "bg-coral" : ""}`}
                onClick={() => setView("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
              <Input
                className="pl-9 rounded-full w-56 h-9"
                placeholder="Search listings..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-ink/40" />
          <Button
            variant={activeCategory === "ALL" ? "primary" : "outline"}
            size="sm"
            className={`rounded-full text-xs ${activeCategory === "ALL" ? "bg-coral" : ""}`}
            onClick={() => setActiveCategory("ALL")}
          >
            All categories
          </Button>
          {(["Auto", "Watches", "Electronics", "Jewelry", "Real Estate", "Home"] as Category[]).map(
            (c) => (
              <Button
                key={c}
                variant={activeCategory === c ? "primary" : "outline"}
                size="sm"
                className={`rounded-full text-xs ${activeCategory === c ? "bg-coral" : ""}`}
                onClick={() => setActiveCategory(c)}
              >
                {c}
              </Button>
            ),
          )}
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((l, idx) => (
              <Card
                key={l.id}
                className="border-ink/10 overflow-hidden group hover:shadow-lg hover:shadow-coral/5 transition-all"
              >
                <div
                  className={`aspect-[16/10] relative bg-gradient-to-br ${l.tint} flex items-center justify-center`}
                >
                  <div
                    className={`absolute top-3 left-3 p-3 rounded-2xl bg-paper/80 backdrop-blur text-ink/70`}
                  >
                    {l.imageIcon}
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    {statusBadge(l.status)}
                  </div>
                  <Avatar className="absolute bottom-3 left-3 w-9 h-9 border-2 border-paper">
                    <AvatarFallback
                      className={`bg-${TINT_BG[idx % TINT_BG.length]} text-ink font-display font-bold text-xs`}
                    >
                      LL
                    </AvatarFallback>
                  </Avatar>
                  <Badge
                    variant="outline"
                    className="absolute bottom-3 right-3 rounded-full bg-paper/90 backdrop-blur border-0 text-ink/60 text-[10px] font-mono"
                  >
                    {l.category}
                  </Badge>
                </div>
                <CardContent className="p-5 space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-ink text-lg leading-tight">{l.name}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full h-8 w-8 shrink-0 -mt-1"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="rounded-2xl">
                          <DropdownMenuLabel className="font-mono text-[10px] text-ink/50">
                            Actions
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toast.success("Opening listing view")}>
                            <Eye className="w-4 h-4 mr-2" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit3 className="w-4 h-4 mr-2" /> Edit details
                          </DropdownMenuItem>
                          {l.status !== "COMPLETED" && (
                            <DropdownMenuItem
                              className="text-coral focus:text-coral"
                              onClick={() => toast.warning("Listing withdrawn")}
                            >
                              <Ban className="w-4 h-4 mr-2" /> Withdraw
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-[11px] font-mono text-ink/40 mt-0.5">{l.id}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-body">
                      <span className="text-ink/50 flex items-center gap-1">
                        <Ticket className="w-3 h-3" /> Entries
                      </span>
                      <span className="text-ink font-bold">
                        {l.entriesCount.toLocaleString()} / {l.maxEntries.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-ink/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          l.status === "COMPLETED"
                            ? "bg-mint"
                            : l.entriesPct > 80
                              ? "bg-coral"
                              : "bg-gradient-to-r from-sky to-coral"
                        }`}
                        style={{ width: `${l.entriesPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-body pt-1">
                    <div>
                      <p className="text-ink/50">Asset value</p>
                      <p className="font-display text-coral font-bold">
                        {formatNaira(l.valueKobo)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-ink/50">Draw date</p>
                      <p className="font-body text-ink font-semibold">{l.drawDate}</p>
                    </div>
                  </div>

                  <Separator className="bg-ink/5" />

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-full flex-1">
                      <Eye className="w-3.5 h-3.5 mr-1" /> View
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full flex-1">
                      <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    {l.status !== "COMPLETED" && l.status !== "REJECTED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full text-coral border-coral/30 hover:bg-coral hover:text-white"
                        onClick={() => toast.warning("Confirm withdraw listing?")}
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <Card className="sm:col-span-2 xl:col-span-3 border-dashed">
                <CardContent className="p-12 text-center">
                  <Ticket className="w-12 h-12 text-ink/20 mx-auto mb-3" />
                  <p className="font-display text-ink text-lg">No listings match your filters</p>
                  <p className="font-body text-ink/50 text-sm mt-1">
                    Try changing status or category filter.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="border-ink/10 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-ink/10 bg-cream/50">
                      <th className="text-left text-[11px] font-body uppercase text-ink/50 tracking-wider px-5 py-3">
                        Listing
                      </th>
                      <th className="text-left text-[11px] font-body uppercase text-ink/50 tracking-wider px-5 py-3 hidden sm:table-cell">
                        Category
                      </th>
                      <th className="text-left text-[11px] font-body uppercase text-ink/50 tracking-wider px-5 py-3">
                        Status
                      </th>
                      <th className="text-left text-[11px] font-body uppercase text-ink/50 tracking-wider px-5 py-3 hidden md:table-cell">
                        Entries
                      </th>
                      <th className="text-left text-[11px] font-body uppercase text-ink/50 tracking-wider px-5 py-3 hidden lg:table-cell">
                        Value
                      </th>
                      <th className="text-left text-[11px] font-body uppercase text-ink/50 tracking-wider px-5 py-3 hidden lg:table-cell">
                        Draw
                      </th>
                      <th className="text-right text-[11px] font-body uppercase text-ink/50 tracking-wider px-5 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5">
                    {filtered.map((l, idx) => (
                      <tr key={l.id} className="hover:bg-cream/30">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${l.tint} flex items-center justify-center text-ink/70 shrink-0`}
                            >
                              {l.imageIcon}
                            </div>
                            <div className="min-w-0">
                              <p className="font-body font-semibold text-ink truncate">{l.name}</p>
                              <p className="text-[11px] font-mono text-ink/40">
                                {l.id} · {l.views.toLocaleString()} views
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <Badge
                            variant="outline"
                            className="rounded-full bg-cream text-ink/70 border-ink/10"
                          >
                            {l.category}
                          </Badge>
                        </td>
                        <td className="px-5 py-4">{statusBadge(l.status)}</td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <div className="w-40">
                            <div className="flex items-center justify-between text-xs font-body mb-1">
                              <span className="text-ink/50">{l.entriesPct}%</span>
                              <span className="text-ink font-bold">
                                {l.entriesCount.toLocaleString()}
                              </span>
                            </div>
                            <div className="h-1.5 bg-ink/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-coral rounded-full"
                                style={{ width: `${l.entriesPct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <p className="font-display font-bold text-ink">
                            {formatNaira(l.valueKobo)}
                          </p>
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <p className="font-body text-ink text-sm">{l.drawDate}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 justify-end">
                            <Button variant="ghost" size="sm" className="rounded-full">
                              <Eye className="w-4 h-4 mr-1" /> View
                            </Button>
                            <Button variant="ghost" size="sm" className="rounded-full">
                              <Edit3 className="w-4 h-4 mr-1" /> Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="p-12 text-center">
                    <Ticket className="w-12 h-12 text-ink/20 mx-auto mb-3" />
                    <p className="font-display text-ink text-lg">No listings</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PartnerShell>
  );
}
