import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  LayoutGrid,
  List,
  Star,
  Trophy,
  Copy,
  Eye,
  CheckCircle2,
  PauseCircle,
  Archive,
  X,
  Upload,
  CalendarDays,
  Ticket,
  Gift,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import mercedesImage from "@/assets/rafilla-mercedes.jpg";
import techBundleImage from "@/assets/rafilla-tech-bundle.jpg";
import apartmentImage from "@/assets/rafilla-apartment.jpg";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AdminShell } from "@/components/rafilla/admin/shell";
import { cn, formatNaira } from "@/lib/utils";

type CompStatus =
  | "DRAFT"
  | "PENDING REVIEW"
  | "APPROVED"
  | "SCHEDULED"
  | "LIVE"
  | "CLOSING"
  | "CLOSED"
  | "AWAITING DRAW"
  | "DRAWN"
  | "WINNER VERIFIED"
  | "CLAIM IN PROGRESS"
  | "DELIVERED"
  | "COMPLETED"
  | "ARCHIVED";

const STATUS_ORDER: CompStatus[] = [
  "DRAFT",
  "PENDING REVIEW",
  "APPROVED",
  "SCHEDULED",
  "LIVE",
  "CLOSING",
  "CLOSED",
  "AWAITING DRAW",
  "DRAWN",
  "WINNER VERIFIED",
  "CLAIM IN PROGRESS",
  "DELIVERED",
  "COMPLETED",
  "ARCHIVED",
];

const STATUS_TINT: Record<CompStatus, string> = {
  "DRAFT": "bg-ink/8 text-ink/65",
  "PENDING REVIEW": "bg-lemon/40 text-ink",
  "APPROVED": "bg-sky/25 text-ink",
  "SCHEDULED": "bg-lilac/35 text-ink",
  "LIVE": "bg-mint/35 text-ink",
  "CLOSING": "bg-coral/20 text-coral",
  "CLOSED": "bg-coral/25 text-coral",
  "AWAITING DRAW": "bg-lemon/40 text-ink",
  "DRAWN": "bg-sky/30 text-ink",
  "WINNER VERIFIED": "bg-mint/35 text-ink",
  "CLAIM IN PROGRESS": "bg-lemon/40 text-ink",
  "DELIVERED": "bg-mint/35 text-ink",
  "COMPLETED": "bg-ink text-cream",
  "ARCHIVED": "bg-ink/12 text-ink/60",
};

const ALLOWED_TRANSITIONS: Record<CompStatus, CompStatus[]> = {
  "DRAFT": ["PENDING REVIEW", "ARCHIVED"],
  "PENDING REVIEW": ["APPROVED", "DRAFT", "ARCHIVED"],
  "APPROVED": ["SCHEDULED", "DRAFT", "ARCHIVED"],
  "SCHEDULED": ["LIVE", "APPROVED", "ARCHIVED"],
  "LIVE": ["CLOSING", "CLOSED", "SCHEDULED"],
  "CLOSING": ["CLOSED", "LIVE"],
  "CLOSED": ["AWAITING DRAW"],
  "AWAITING DRAW": ["DRAWN"],
  "DRAWN": ["WINNER VERIFIED"],
  "WINNER VERIFIED": ["CLAIM IN PROGRESS"],
  "CLAIM IN PROGRESS": ["DELIVERED"],
  "DELIVERED": ["COMPLETED"],
  "COMPLETED": ["ARCHIVED"],
  "ARCHIVED": [],
};

interface MockComp {
  id: string;
  title: string;
  slug: string;
  image: string;
  category: "Auto" | "Tech" | "Property" | "Home" | "Experience";
  status: CompStatus;
  partner: string;
  partnerInitials: string;
  partnerTint: "sky" | "mint" | "coral" | "lemon" | "lilac";
  ticketPrice: number;
  ticketsSold: number;
  ticketsCapacity: number;
  start: string;
  close: string;
  featured: boolean;
  rewardPool: boolean;
  rewardPct: number;
  poolContribution: number;
}

const partnerTintBg: Record<MockComp["partnerTint"], string> = {
  sky: "bg-sky/30 text-ink",
  mint: "bg-mint/35 text-ink",
  coral: "bg-coral/20 text-coral",
  lemon: "bg-lemon/40 text-ink",
  lilac: "bg-lilac/35 text-ink",
};

const MOCK_COMPS: MockComp[] = [
  {
    id: "c-01",
    title: "2026 Mercedes-Benz C-Class",
    slug: "mercedes-benz-c-class-2026",
    image: mercedesImage,
    category: "Auto",
    status: "LIVE",
    partner: "Lux Wheels Ltd",
    partnerInitials: "LW",
    partnerTint: "lemon",
    ticketPrice: 10000,
    ticketsSold: 4210,
    ticketsCapacity: 5000,
    start: "2026-02-12",
    close: "2026-03-18",
    featured: true,
    rewardPool: true,
    rewardPct: 5,
    poolContribution: 2105000,
  },
  {
    id: "c-02",
    title: "Nova X1 Tech Bundle",
    slug: "nova-x1-bundle",
    image: techBundleImage,
    category: "Tech",
    status: "CLOSING",
    partner: "TechHome NG",
    partnerInitials: "TH",
    partnerTint: "mint",
    ticketPrice: 5000,
    ticketsSold: 9420,
    ticketsCapacity: 10000,
    start: "2026-02-01",
    close: "2026-03-12",
    featured: false,
    rewardPool: true,
    rewardPct: 5,
    poolContribution: 2355000,
  },
  {
    id: "c-03",
    title: "Luxury 2-Bed Apartment, Lagos",
    slug: "lagos-2-bed-apartment",
    image: apartmentImage,
    category: "Property",
    status: "SCHEDULED",
    partner: "Adebayo Homes",
    partnerInitials: "AH",
    partnerTint: "coral",
    ticketPrice: 2500,
    ticketsSold: 0,
    ticketsCapacity: 22500,
    start: "2026-03-20",
    close: "2026-06-25",
    featured: true,
    rewardPool: true,
    rewardPct: 5,
    poolContribution: 0,
  },
  {
    id: "c-04",
    title: "Ikeja Home Studio Build",
    slug: "ikeja-home-studio",
    image: techBundleImage,
    category: "Home",
    status: "DRAWN",
    partner: "Grace Property",
    partnerInitials: "GP",
    partnerTint: "lilac",
    ticketPrice: 1500,
    ticketsSold: 5800,
    ticketsCapacity: 6000,
    start: "2026-01-20",
    close: "2026-03-02",
    featured: false,
    rewardPool: true,
    rewardPct: 5,
    poolContribution: 435000,
  },
  {
    id: "c-05",
    title: "Abuja Generator Pack",
    slug: "abuja-generator-pack",
    image: apartmentImage,
    category: "Home",
    status: "WINNER VERIFIED",
    partner: "TechHome NG",
    partnerInitials: "TH",
    partnerTint: "mint",
    ticketPrice: 3000,
    ticketsSold: 5000,
    ticketsCapacity: 5000,
    start: "2026-01-10",
    close: "2026-02-28",
    featured: false,
    rewardPool: false,
    rewardPct: 0,
    poolContribution: 0,
  },
  {
    id: "c-06",
    title: "PH Laptop Suite",
    slug: "ph-laptop-suite",
    image: techBundleImage,
    category: "Tech",
    status: "PENDING REVIEW",
    partner: "TechHome NG",
    partnerInitials: "TH",
    partnerTint: "mint",
    ticketPrice: 2000,
    ticketsSold: 0,
    ticketsCapacity: 4000,
    start: "2026-03-15",
    close: "2026-05-10",
    featured: false,
    rewardPool: true,
    rewardPct: 5,
    poolContribution: 0,
  },
  {
    id: "c-07",
    title: "Eko Hotel Weekend Suite",
    slug: "eko-hotel-weekend",
    image: apartmentImage,
    category: "Experience",
    status: "DRAFT",
    partner: "Luxury Hosts",
    partnerInitials: "LH",
    partnerTint: "sky",
    ticketPrice: 1000,
    ticketsSold: 0,
    ticketsCapacity: 3000,
    start: "TBD",
    close: "TBD",
    featured: false,
    rewardPool: true,
    rewardPct: 5,
    poolContribution: 0,
  },
  {
    id: "c-08",
    title: "Kano Solar Home Kit",
    slug: "kano-solar-kit",
    image: mercedesImage,
    category: "Home",
    status: "APPROVED",
    partner: "Lux Wheels Ltd",
    partnerInitials: "LW",
    partnerTint: "lemon",
    ticketPrice: 4000,
    ticketsSold: 0,
    ticketsCapacity: 7500,
    start: "2026-03-22",
    close: "2026-06-30",
    featured: false,
    rewardPool: true,
    rewardPct: 5,
    poolContribution: 0,
  },
  {
    id: "c-09",
    title: "Ibadan Farming Grant",
    slug: "ibadan-farming-grant",
    image: apartmentImage,
    category: "Experience",
    status: "COMPLETED",
    partner: "Adebayo Homes",
    partnerInitials: "AH",
    partnerTint: "coral",
    ticketPrice: 800,
    ticketsSold: 10000,
    ticketsCapacity: 10000,
    start: "2025-12-01",
    close: "2026-01-15",
    featured: false,
    rewardPool: true,
    rewardPct: 5,
    poolContribution: 400000,
  },
];

const CATEGORIES = ["All", "Auto", "Tech", "Property", "Home", "Experience"] as const;

export function AdminCompetitionsPage() {
  const [query, setQuery] = useState("");
  const [activeStatuses, setActiveStatuses] = useState<CompStatus[]>([]);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [partner, setPartner] = useState("All");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [view, setView] = useState<"table" | "grid">("table");
  const [bulk, setBulk] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<MockComp | null>(null);
  const [step, setStep] = useState<"basic" | "prize" | "campaign" | "rules" | "preview">("basic");

  const partners = useMemo(() => ["All", ...Array.from(new Set(MOCK_COMPS.map((c) => c.partner))], []);

  const toggleStatus = (s: CompStatus) =>
    setActiveStatuses((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const filtered = useMemo(
    () =>
      MOCK_COMPS.filter((c) => {
        const q = query.toLowerCase().trim();
        if (q && !c.title.toLowerCase().includes(q) && !c.slug.toLowerCase().includes(q)) return false;
        if (activeStatuses.length && !activeStatuses.includes(c.status)) return false;
        if (category !== "All" && c.category !== category) return false;
        if (partner !== "All" && c.partner !== partner) return false;
        if (featuredOnly && !c.featured) return false;
        return true;
      }),
    [query, activeStatuses, category, partner, featuredOnly],
  );

  const toggleSel = (id: string) =>
    setSelectedIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const bulkAction = (kind: "archive" | "publish") => {
    if (!selectedIds.length) return toast.error("Select one or more competitions first");
    toast.success(`Bulk ${kind}`, {
      description: `${selectedIds.length} competition(s) scheduled for ${kind} · queued for background processing.`,
    });
    setSelectedIds([]);
  };

  const openNew = () => {
    setEditing(null);
    setEditorOpen(true);
    setStep("basic");
  };

  const openEdit = (c: MockComp) => {
    setEditing(c);
    setEditorOpen(true);
    setStep("basic");
  };

  const changeStatus = (c: MockComp, next: CompStatus) => {
    toast.success("Status transitioned", {
      description: `${c.title} · ${c.status} → ${next} · audit log written.`,
    });
  };

  const transitionsAllowed = (c: MockComp) => ALLOWED_TRANSITIONS[c.status];

  return (
    <AdminShell activeNav="competitions">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">Admin · Competitions</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Competitions
          </h1>
          <p className="mt-2 max-w-2xl text-base font-bold text-ink/60">
            Full 14-state lifecycle management for campaigns, from first draft through draw and prize delivery.
          </p>
        </div>
      </header>

      <Card className="mb-5 rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <label className="flex min-h-11 items-center gap-3 rounded-full bg-cream px-4 text-sm font-bold text-ink/50 md:col-span-5">
              <Search className="size-4 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, slug, campaign id..."
                className="w-full bg-transparent text-ink outline-none placeholder:text-ink/40"
              />
            </label>

            <div className="md:col-span-2">
              <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
                <SelectTrigger className="min-h-11 rounded-full bg-lilac/20 px-4 font-extrabold text-ink ring-0">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-[22px] bg-paper p-1">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="rounded-xl font-bold">Category · {c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3">
              <Select value={partner} onValueChange={setPartner}>
                <SelectTrigger className="min-h-11 rounded-full bg-sky/25 px-4 font-extrabold text-ink ring-0">
                  <SelectValue placeholder="Partner" />
                </SelectTrigger>
                <SelectContent className="rounded-[22px] bg-paper p-1">
                  {partners.map((p) => (
                    <SelectItem key={p} value={p} className="rounded-xl font-bold">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-end gap-3 md:col-span-2">
              <Label className="flex items-center gap-2 text-xs font-extrabold text-ink/65">
                <Star className="size-3.5 text-lemon" />
                <Switch checked={featuredOnly} onCheckedChange={setFeaturedOnly} />
                Featured only
              </Label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Status</span>
            <button
              onClick={() => setActiveStatuses([])}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-extrabold transition-colors",
                activeStatuses.length === 0
                  ? "bg-ink text-cream"
                  : "bg-cream text-ink/60 ring-1 ring-ink/10 hover:bg-lilac/20",
              )}
            >
              ALL
            </button>
            {STATUS_ORDER.map((s) => {
              const on = activeStatuses.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleStatus(s)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[11px] font-extrabold ring-1 transition-colors",
                    on ? `${STATUS_TINT[s]} ring-transparent` : "bg-cream text-ink/60 ring-ink/10 hover:bg-lilac/20",
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4">
            <div className="flex items-center gap-2">
              <div className="flex overflow-hidden rounded-full bg-cream ring-1 ring-ink/10">
                <button
                  onClick={() => setView("table")}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-extrabold transition-colors",
                    view === "table" ? "bg-ink text-cream" : "text-ink/60 hover:text-ink",
                  )}
                >
                  <List className="size-3.5" /> Table
                </button>
                <button
                  onClick={() => setView("grid")}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-extrabold transition-colors",
                    view === "grid" ? "bg-ink text-cream" : "text-ink/60 hover:text-ink",
                  )}
                >
                  <LayoutGrid className="size-3.5" /> Grid
                </button>
              </div>
              <Label className="ml-1 flex items-center gap-2 text-xs font-extrabold text-ink/65">
                <Checkbox checked={bulk} onCheckedChange={(v) => { setBulk(!!v); if (!v) setSelectedIds([]); }} />
                Bulk actions
              </Label>
              {bulk && (
                <div className="ml-1 flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => bulkAction("publish")}>
                    <CheckCircle2 className="size-3.5" /> Bulk publish
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => bulkAction("archive")}>
                    <Archive className="size-3.5" /> Bulk archive
                  </Button>
                  {selectedIds.length > 0 && (
                    <span className="text-[11px] font-extrabold text-ink/55">{selectedIds.length} selected</span>
                  )}
                </div>
              )}
            </div>
            <Button variant="primary" size="md" onClick={openNew}>
              <Plus className="size-4" /> Create new competition
            </Button>
          </div>
        </CardContent>
      </Card>

      {view === "table" ? (
        <Card className="rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
          <CardContent className="p-0">
            <ScrollArea className="w-full">
              <Table>
                <TableHeader className="bg-cream/60 [&_tr]:border-ink/10">
                  <TableRow>
                    {bulk && <TableHead className="w-10 px-4 py-3"></TableHead>}
                    <TableHead className="px-4 py-3 font-extrabold text-ink/65">Competition</TableHead>
                    <TableHead className="px-4 py-3 font-extrabold text-ink/65">Category</TableHead>
                    <TableHead className="px-4 py-3 font-extrabold text-ink/65">Status</TableHead>
                    <TableHead className="px-4 py-3 font-extrabold text-ink/65">Partner</TableHead>
                    <TableHead className="px-4 py-3 font-extrabold text-ink/65">Tickets</TableHead>
                    <TableHead className="px-4 py-3 font-extrabold text-ink/65">Progress</TableHead>
                    <TableHead className="px-4 py-3 font-extrabold text-ink/65">Start → Close</TableHead>
                    <TableHead className="px-4 py-3 font-extrabold text-ink/65">Flags</TableHead>
                    <TableHead className="px-4 py-3 text-right font-extrabold text-ink/65"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="[&_tr]:border-ink/10">
                  {filtered.map((c) => {
                    const pct = c.ticketsCapacity ? Math.round((c.ticketsSold / c.ticketsCapacity * 100) : 0;
                    return (
                      <TableRow key={c.id} className="cursor-pointer hover:bg-lilac/10" onClick={() => openEdit(c)}>
                        {bulk && (
                          <TableCell className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <Checkbox checked={selectedIds.includes(c.id)} onCheckedChange={() => toggleSel(c.id)} />
                          </TableCell>
                        )}
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="size-12 shrink-0 overflow-hidden rounded-2xl bg-lilac/30 ring-1 ring-ink/5">
                              <img src={c.image} alt={c.title} className="size-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-extrabold text-ink">{c.title}</p>
                              <p className="truncate text-[11px] font-bold text-ink/50">{c.slug}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm font-extrabold text-ink">{c.category}</TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge className={cn("rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-0", STATUS_TINT[c.status])}>
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className={cn("size-7", partnerTintBg[c.partnerTint])}>
                              <AvatarFallback className={cn("text-[10px] font-extrabold", partnerTintBg[c.partnerTint])}>
                                {c.partnerInitials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-bold text-ink/70">{c.partner}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 whitespace-nowrap text-xs font-extrabold text-ink">
                          <div>{formatNaira(c.ticketPrice)} · entry</div>
                          <div className="text-[11px] font-bold text-ink/50">
                            {c.ticketsSold.toLocaleString("en-NG")} / {c.ticketsCapacity.toLocaleString("en-NG")}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 w-40">
                          <Progress value={pct} className="h-2 bg-ink/10 [&>div]:bg-coral" />
                          <span className="mt-1 block text-[11px] font-extrabold text-ink/55">{pct}% filled</span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-xs font-bold text-ink/65">
                          <div>{c.start}</div>
                          <div className="text-[11px] text-ink/45">{c.close}</div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {c.featured && (
                              <Badge className="rounded-full bg-lemon/40 px-2 py-0.5 text-[10px] font-extrabold text-ink ring-0">
                                <Star className="mr-1 size-2.5" /> Featured
                              </Badge>
                            )}
                            {c.rewardPool && (
                              <Badge className="rounded-full bg-mint/30 px-2 py-0.5 text-[10px] font-extrabold text-ink ring-0">
                                <Gift className="mr-1 size-2.5" /> Pool {c.rewardPct}%
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-9">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-60 rounded-[22px] bg-paper p-2">
                              <DropdownMenuLabel className="rounded-xl bg-cream px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">
                                {c.title.slice(0, 24)}
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold focus:bg-lilac/20" onClick={() => openEdit(c)}>
                                <Trophy className="mr-2 size-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold focus:bg-lemon/30"
                                onClick={() => { toast.success("Competition duplicated", { description: `Draft copy of ${c.title} created` }); }}
                              >
                                <Copy className="mr-2 size-4" /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold focus:bg-sky/20"
                                onClick={() => toast.success("Preview opened", { description: c.slug })}
                              >
                                <Eye className="mr-2 size-4" /> Preview
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel className="rounded-xl bg-cream/50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/45">
                                Lifecycle transitions
                              </DropdownMenuLabel>
                              {transitionsAllowed(c).length === 0 ? (
                                <DropdownMenuItem disabled className="rounded-xl px-3 py-2 text-xs font-bold text-ink/40">
                                  No further transitions
                                </DropdownMenuItem>
                              ) : (
                                transitionsAllowed(c).map((next) => {
                                  const danger = next === "ARCHIVED" || next === "CLOSED";
                                  return (
                                    <DropdownMenuItem
                                      key={next}
                                      className={cn(
                                        "rounded-xl cursor-pointer px-3 py-2 text-xs font-bold",
                                        danger ? "focus:bg-coral/15 focus:text-coral" : "focus:bg-mint/25",
                                      )}
                                      onClick={() => changeStatus(c, next)}
                                    >
                                      {next === "APPROVED" || next === "WINNER VERIFIED" ? (
                                        <CheckCircle2 className="mr-2 size-4" />
                                      ) : next === "CLOSED" || next === "ARCHIVED" ? (
                                        <Archive className="mr-2 size-4" />
                                      ) : next === "LIVE" || next === "SCHEDULED" ? (
                                        <Sparkles className="mr-2 size-4" />
                                      ) : (
                                        <PauseCircle className="mr-2 size-4" />
                                      )}
                                      {next === "PENDING REVIEW" ? "Submit for review" : `Move to ${next}`}
                                    </DropdownMenuItem>
                                  );
                                })
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={bulk ? 10 : 9} className="px-4 py-12 text-center text-sm font-extrabold text-ink/45">
                        No competitions match these filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const pct = c.ticketsCapacity ? Math.round((c.ticketsSold / c.ticketsCapacity) * 100) : 0;
            return (
              <Card
                key={c.id}
                onClick={() => openEdit(c)}
                className="cursor-pointer rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none transition-transform hover:-translate-y-0.5"
              >
                <div className="aspect-[4/3] w-full overflow-hidden rounded-t-[28px] bg-lilac/30">
                  <img src={c.image} alt={c.title} className="h-full w-full object-cover" />
                </div>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={cn("rounded-full px-2.5 py-1 text-[10px] font-extrabold ring-0", STATUS_TINT[c.status])}>
                      {c.status}
                    </Badge>
                    <Badge className="rounded-full bg-lilac/30 px-2.5 py-1 text-[10px] font-extrabold text-ink ring-0">
                      {c.category}
                    </Badge>
                    {c.featured && (
                      <Badge className="rounded-full bg-lemon/40 px-2 py-0.5 text-[10px] font-extrabold text-ink ring-0">
                        <Star className="mr-1 size-2.5" /> Featured
                      </Badge>
                    )}
                  </div>
                  <h3 className="mt-3 font-display text-xl font-extrabold leading-tight text-ink">{c.title}</h3>
                  <div className="mt-2 flex items-center justify-between text-xs font-bold text-ink/55">
                    <span>{formatNaira(c.ticketPrice)} entry</span>
                    <span>{c.partner}</span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] font-extrabold text-ink/55">
                      <span>{c.ticketsSold.toLocaleString()} / {c.ticketsCapacity.toLocaleString()}</span>
                      <span>{pct}%</span>
                    </div>
                    <Progress value={pct} className="mt-2 h-2 bg-ink/10 [&>div]:bg-coral" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Sheet open={editorOpen} onOpenChange={(v) => !v && setEditorOpen(false)}>
        <SheetContent side="right" className="w-full max-w-3xl overflow-y-auto rounded-l-[28px] bg-cream p-0 sm:max-w-3xl">
          <div className="sticky top-0 z-10 flex flex-col gap-4 border-b border-ink/10 bg-cream/95 px-6 py-4 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <SheetHeader className="!text-left !p-0">
                <SheetTitle className="font-display text-2xl font-extrabold text-ink">
                  {editing ? `Edit · ${editing.title}` : "Create new competition"}
                </SheetTitle>
                <p className="mt-1 text-xs font-bold text-ink/55">
                  5 steps · all fields save to a draft until approved for publishing.
                </p>
              </SheetHeader>
              <button
                className="grid size-10 place-items-center rounded-full bg-paper text-ink/65 hover:bg-lilac/20 hover:text-ink"
                onClick={() => setEditorOpen(false)}
              >
                <X className="size-4" />
              </button>
            </div>
            <Tabs value={step} onValueChange={(v) => setStep(v as typeof step)} className="w-full">
              <TabsList className="flex h-auto w-full flex-wrap gap-1 rounded-2xl bg-paper p-1">
                {(["basic", "prize", "campaign", "rules", "preview"] as const).map((s, i) => (
                  <TabsTrigger
                  key={s}
                  value={s}
                  className="flex-1 rounded-xl px-2.5 py-2 text-[11px] font-extrabold capitalize data-[state=active]:bg-ink data-[state=active]:text-cream data-[state=active]:shadow-none sm:text-xs"
                >
                  <span className="mr-1 text-ink/45 data-[state=active]:text-cream/65">{i + 1}.</span>
                  {s === "basic" ? "Basic" : s}
                </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="px-6 py-6">
            <Tabs value={step} onValueChange={(v) => setStep(v as typeof step)}>
              <TabsContent value="basic" className="mt-0 space-y-5">
                <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
                  <CardContent className="space-y-4 p-5">
                    <div>
                      <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Title</Label>
                      <Input defaultValue={editing?.title ?? ""} placeholder="2026 Mercedes-Benz C-Class" className="mt-2 min-h-12 rounded-2xl border-ink/10 bg-cream px-4 text-base font-extrabold text-ink shadow-none focus-visible:ring-coral" />
                    </div>
                    <div>
                      <div className="mt-2 flex items-end justify-between gap-3">
                        <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Slug</Label>
                        <button type="button" className="text-[11px] font-extrabold text-coral">Auto-generate</button>
                      </div>
                      <Input defaultValue={editing?.slug ?? ""} placeholder="mercedes-benz-c-class-2026" className="mt-2 min-h-11 rounded-2xl border-ink/10 bg-cream px-4 text-sm font-bold text-ink shadow-none focus-visible:ring-coral" />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Category</Label>
                        <Select defaultValue={editing?.category ?? "Auto"}>
                          <SelectTrigger className="mt-2 min-h-11 rounded-2xl border-ink/10 bg-cream px-4 font-extrabold text-ink shadow-none focus-visible:ring-coral">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-[22px] bg-paper p-1">
                            {["Auto", "Tech", "Property", "Home", "Experience"].map((c) => (
                              <SelectItem key={c} value={c} className="rounded-xl font-bold">{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Partner</Label>
                        <Select defaultValue={editing?.partner ?? partners[1]}>
                          <SelectTrigger className="mt-2 min-h-11 rounded-2xl border-ink/10 bg-cream px-4 font-extrabold text-ink shadow-none focus-visible:ring-coral">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-[22px] bg-paper p-1">
                            {partners.slice(1).map((p) => (
                              <SelectItem key={p} value={p} className="rounded-xl font-bold">{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Short description</Label>
                      <Textarea rows={2} defaultValue="A refined executive sedan." placeholder="One line that shows up on cards." className="mt-2 rounded-2xl border-ink/10 bg-cream p-4 text-sm font-bold text-ink shadow-none focus-visible:ring-coral" />
                    </div>
                    <div>
                      <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Full description</Label>
                      <Textarea rows={5} defaultValue={editing ? "Premium cabin, intelligent assistance, and the presence to make every arrival count." : ""} placeholder="Full marketing copy for the competition detail page." className="mt-2 rounded-2xl border-ink/10 bg-cream p-4 text-sm font-bold text-ink shadow-none focus-visible:ring-coral" />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Label className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3 text-sm font-extrabold text-ink ring-1 ring-ink/10">
                        <span><Star className="mr-2 inline size-3.5 text-lemon" /> Featured on homepage</span>
                        <Switch defaultChecked={editing?.featured ?? false} />
                      </Label>
                      <div>
                        <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Tags</Label>
                        <Input defaultValue="sedan,luxury,2026,auto" placeholder="comma separated" className="mt-2 min-h-11 rounded-2xl border-ink/10 bg-cream px-4 text-sm font-bold text-ink shadow-none focus-visible:ring-coral" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="prize" className="mt-0 space-y-5">
                <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
                  <CardContent className="space-y-4 p-5">
                    <div>
                      <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Prize name</Label>
                      <Input defaultValue="2026 Mercedes-Benz C-Class" className="mt-2 min-h-12 rounded-2xl border-ink/10 bg-cream px-4 text-base font-extrabold text-ink shadow-none focus-visible:ring-coral" />
                    </div>
                    <div>
                      <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Prize value (₦)</Label>
                      <Input type="number" defaultValue="12000000" className="mt-2 min-h-12 rounded-2xl border-ink/10 bg-cream px-4 text-base font-extrabold text-ink shadow-none focus-visible:ring-coral" />
                    </div>
                    <div>
                      <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Prize images</Label>
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-ink/20 bg-cream text-xs font-extrabold text-ink/55 hover:border-coral hover:text-coral">
                          <Upload className="size-5" />
                          Drop images
                        </label>
                        {[mercedesImage, apartmentImage, techBundleImage].map((src, i) => (
                          <div key={i} className="group relative aspect-square overflow-hidden rounded-2xl ring-1 ring-ink/10">
                            <img src={src} alt="prize" className="h-full w-full object-cover" />
                            <button className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-ink/70 text-cream opacity-0 transition-opacity group-hover:opacity-100">
                              <X className="size-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Specifications</Label>
                      <div className="mt-2 space-y-2">
                        {[
                          ["2026 model year",
                          "Premium interior leather",
                          "Automatic transmission",
                          "Executive sedan 4-door",
                        ].map((s, i) => (
                          <div key={i} className="flex items-center gap-2 rounded-2xl bg-cream px-3 py-2 ring-1 ring-ink/10">
                            <span className="w-6 shrink-0 text-[11px] font-extrabold text-ink/45">#{i + 1}</span>
                            <Input defaultValue={s} className="min-h-9 rounded-xl bg-transparent px-0 font-bold text-ink shadow-none focus-visible:ring-0" />
                            <button className="text-coral"><X className="size-3.5" /></button>
                          </div>
                        ))}
                        <button className="mt-1 text-xs font-extrabold text-coral">+ Add specification row</button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Condition notes</Label>
                      <Textarea rows={3} defaultValue="Brand new, manufacturer warranty included. Delivery within Lagos + nationwide shipping available." className="mt-2 rounded-2xl border-ink/10 bg-cream p-4 text-sm font-bold text-ink shadow-none focus-visible:ring-coral" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="campaign" className="mt-0 space-y-5">
                <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
                  <CardContent className="space-y-4 p-5">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Ticket price (₦)</Label>
                        <Input type="number" defaultValue={editing?.ticketPrice ?? 10000} className="mt-2 min-h-11 rounded-2xl border-ink/10 bg-cream px-4 text-sm font-extrabold text-ink shadow-none focus-visible:ring-coral" />
                      </div>
                      <div>
                        <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Ticket quantity (capacity)</Label>
                        <Input type="number" defaultValue={editing?.ticketsCapacity ?? 5000} className="mt-2 min-h-11 rounded-2xl border-ink/10 bg-cream px-4 text-sm font-extrabold text-ink shadow-none focus-visible:ring-coral" />
                      </div>
                      <div>
                        <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Start date · time</Label>
                        <Input type="datetime-local" defaultValue="2026-02-12T10:00" className="mt-2 min-h-11 rounded-2xl border-ink/10 bg-cream px-4 text-sm font-extrabold text-ink shadow-none focus-visible:ring-coral" />
                      </div>
                      <div>
                        <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Close date · time</Label>
                        <Input type="datetime-local" defaultValue="2026-03-18T23:59" className="mt-2 min-h-11 rounded-2xl border-ink/10 bg-cream px-4 text-sm font-extrabold text-ink shadow-none focus-visible:ring-coral" />
                      </div>
                      <div>
                        <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Max entries per user</Label>
                        <Input type="number" defaultValue={0} className="mt-2 min-h-11 rounded-2xl border-ink/10 bg-cream px-4 text-sm font-extrabold text-ink shadow-none focus-visible:ring-coral" />
                        <p className="mt-1 text-[11px] font-bold text-ink/45">0 = unlimited</p>
                      </div>
                      <div>
                        <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Order of entries</Label>
                        <Select defaultValue="consecutive">
                          <SelectTrigger className="mt-2 min-h-11 rounded-2xl border-ink/10 bg-cream px-4 font-extrabold text-ink shadow-none focus-visible:ring-coral"><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-[22px] bg-paper p-1">
                            <SelectItem value="consecutive" className="rounded-xl font-bold">Consecutive (1,2,3…)</SelectItem>
                            <SelectItem value="random" className="rounded-xl font-bold">Raffle-style random</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Draw date · time</Label>
                        <Input type="datetime-local" defaultValue="2026-03-19T20:00" className="mt-2 min-h-11 rounded-2xl border-ink/10 bg-cream px-4 text-sm font-extrabold text-ink shadow-none focus-visible:ring-coral" />
                      </div>
                      <div>
                        <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Draw location</Label>
                        <Input defaultValue="Virtual · Lagos HQ · Live stream" className="mt-2 min-h-11 rounded-2xl border-ink/10 bg-cream px-4 text-sm font-bold text-ink shadow-none focus-visible:ring-coral" />
                      </div>
                    </div>
                    <div className="rounded-2xl bg-cream p-4 ring-1 ring-ink/10">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-extrabold text-ink">
                            <Gift className="mr-1.5 inline size-4 text-mint" />
                            Reward pool contribution
                          </p>
                          <p className="text-[11px] font-bold text-ink/55">Diverts a percentage of every entry into a platform-wide reward pool.</p>
                        </div>
                        <Switch defaultChecked={editing?.rewardPool ?? true} />
                      </div>
                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">% contribution</Label>
                          <Input type="number" defaultValue={editing?.rewardPct ?? 5} className="mt-2 min-h-11 rounded-2xl border-ink/10 bg-paper px-4 text-sm font-extrabold text-ink shadow-none focus-visible:ring-coral" />
                        </div>
                        <div>
                          <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Estimated pool (projected)</Label>
                          <div className="mt-2 flex min-h-11 items-center rounded-2xl bg-paper px-4 text-sm font-extrabold text-ink ring-1 ring-ink/10">
                            {formatNaira(editing?.poolContribution ?? 2500000)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rules" className="mt-0 space-y-5">
                <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-start gap-3 rounded-2xl bg-coral/12 px-4 py-3 text-xs font-extrabold text-coral ring-1 ring-coral/20">
                      <AlertCircle className="mt-0.5 size-4 shrink-0" />
                      These fields appear on the public competition page and in the downloadable rules PDF.
                    </div>
                    <div>
                      <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Competition rules (long text)</Label>
                      <Textarea rows={6} defaultValue="Eligibility is 18+. One ticket = one entry. Draw conducted by verified random seed." className="mt-2 rounded-2xl border-ink/10 bg-cream p-4 text-sm font-bold text-ink shadow-none focus-visible:ring-coral" />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Eligibility notes</Label>
                        <Textarea rows={3} defaultValue="Residents of Nigeria, 18+. Staff of Rafilla and partners are excluded." className="mt-2 rounded-2xl border-ink/10 bg-cream p-4 text-sm font-bold text-ink shadow-none focus-visible:ring-coral" />
                      </div>
                      <div>
                        <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Claim instructions</Label>
                        <Textarea rows={3} defaultValue="Winner contacted within 48h. Claim window 14 days. Valid ID + affidavit required." className="mt-2 rounded-2xl border-ink/10 bg-cream p-4 text-sm font-bold text-ink shadow-none focus-visible:ring-coral" />
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Delivery / Collection info</Label>
                        <Textarea rows={3} defaultValue="Lagos doorstep delivery included. Nationwide: winner covers insured shipping (max 2 weeks)." className="mt-2 rounded-2xl border-ink/10 bg-cream p-4 text-sm font-bold text-ink shadow-none focus-visible:ring-coral" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Label className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3 text-sm font-extrabold text-ink ring-1 ring-ink/10">
                        <span>Partner public visibility</span>
                        <Switch defaultChecked />
                      </Label>
                      <div>
                        <Label className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/55">Partner display name override</Label>
                        <Input placeholder="Leave empty to use legal name" className="mt-2 min-h-11 rounded-2xl border-ink/10 bg-cream px-4 text-sm font-bold text-ink shadow-none focus-visible:ring-coral" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview" className="mt-0 space-y-5">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="overflow-hidden rounded-[28px] bg-lilac/30 p-3 ring-1 ring-ink/5">
                    <img src={editing?.image ?? mercedesImage} alt="preview" className="aspect-[4/3] w-full rounded-[22px] object-cover" />
                  </div>
                  <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5">
                    <div className="flex items-center justify-between gap-3">
                      <Badge className="rounded-full bg-coral/15 px-3 py-1 text-[11px] font-extrabold text-coral ring-0">
                        {editing?.category ?? "Auto"}
                      </Badge>
                      <Badge className={cn("rounded-full px-3 py-1 text-[11px] font-extrabold ring-0", STATUS_TINT[editing?.status ?? "DRAFT"])}>
                        {editing?.status ?? "DRAFT"}
                      </Badge>
                    </div>
                    <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight text-ink">
                      {editing?.title ?? "2026 Mercedes-Benz C-Class"}
                    </h2>
                    <p className="mt-2 text-sm font-bold leading-relaxed text-ink/60">
                      A refined executive sedan with a premium cabin, intelligent assistance, and the presence to make every arrival count.
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-4 border-y border-ink/10 py-5">
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Entry price</p>
                        <p className="mt-1 font-display text-2xl font-extrabold text-ink">{formatNaira(editing?.ticketPrice ?? 10000)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Prize value</p>
                        <p className="mt-1 font-display text-2xl font-extrabold text-ink">₦12,000,000</p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-extrabold text-ink/55">
                        <span>Tickets sold</span><span>84%</span>
                      </div>
                      <Progress value={84} className="h-3 bg-ink/10 [&>div]:bg-coral" />
                    </div>
                    <div className="mt-5 flex items-center gap-3 rounded-2xl bg-cream p-4 text-sm">
                      <CalendarDays className="size-5 text-coral" />
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Competition closes</p>
                        <p className="font-extrabold text-ink">{editing?.close ?? "18 Mar · 23:59"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Card className="rounded-[22px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
                  <CardContent className="p-5">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45">Meta preview</p>
                    <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      {[
                        ["Slug", editing?.slug ?? "mercedes-benz-c-class-2026"],
                        ["Partner", editing?.partner ?? "Lux Wheels Ltd"],
                        ["Draw", "2026-03-19 20:00 WAT · Virtual Lagos HQ"],
                        ["Reward pool", editing?.rewardPool ? `Enabled · ${editing.rewardPct}%` : "Disabled"],
                        ["Featured", editing?.featured ? "Yes" : "No"],
                        ["Entries/user", editing?.ticketsSold ? `${editing.ticketsSold.toLocaleString()} sold of ${editing.ticketsCapacity.toLocaleString()}` : "Unlimited"],
                      ].map(([k, v]) => (
                        <div key={k} className="rounded-2xl bg-cream px-4 py-3 ring-1 ring-ink/10">
                          <dt className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">{k}</dt>
                          <dd className="mt-1 font-bold text-ink">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-8 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-ink/10 pt-5 sm:flex-row sm:items-center">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="md" onClick={() => toast.success("Draft saved", { description: "Autosave also runs on every change." })}>
                  Save draft
                </Button>
                <Button variant="outline" size="md" onClick={() => toast.success("Preview opened")}>
                  <Eye className="size-4" /> Preview
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="md" onClick={() => toast.success("Submitted for review", { description: "Reviewers notified · status → PENDING REVIEW" })}>
                  Submit for review
                </Button>
                <Button variant="primary" size="md" onClick={() => toast.success("Approved & scheduled", { description: "Campaign approved · audit log written." })}>
                  <CheckCircle2 className="size-4" /> Approve & publish
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </AdminShell>
  );
}
