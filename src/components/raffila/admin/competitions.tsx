import { useEffect, useMemo, useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  Search,
  Plus,
  MoreHorizontal,
  LayoutGrid,
  List,
  Trophy,
  Eye as EyeIcon,
  CheckCircle2,
  Sparkles,
  X,
  Upload,
  CalendarDays,
  Ticket,
  Gift,
  AlertCircle,
  ChevronRight,
  Check,
  Building2,
  Clock,
  Pencil,
  PlayCircle,
  Copy,
  Pause,
  Share2,
  Download,
  UserRound,
  Eye,
  Filter,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import mercedesImage from "@/assets/raffila-mercedes.jpg";
import techBundleImage from "@/assets/raffila-tech-bundle.jpg";
import apartmentImage from "@/assets/raffila-apartment.jpg";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
import { AdminShell } from "@/components/raffila/admin/admin-shell";
import { AssetUploader } from "@/components/raffila/admin/asset-uploader";
import { cn, formatNaira } from "@/lib/utils";
import { logActivity } from "@/lib/activity-log";
import { db } from "@/lib/firebase";

type CompStatus = "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED";

interface MockComp {
  id: string;
  name: string;
  slug: string;
  category: string;
  status: CompStatus;
  entriesSold: number;
  totalEntries: number;
  ticketPrice: number;
  image: string;
  partner: string;
  drawDate: string;
  condition?: "new" | "likenew" | "refurbished" | "used";
  marketValue?: number;
  description?: string;
  featured?: boolean;
  publicResults?: boolean;
  startDate?: string;
  liveDelay?: number;
  maxPerUser?: number;
}

const IMAGES = [mercedesImage, techBundleImage, apartmentImage];
const PARTNERS = [
  "Lux Wheels Ltd",
  "TechHome NG",
  "Adebayo Homes",
  "Lekki Luxury Autos",
  "Abuja Tech Hub",
];
const CATEGORIES = ["Auto", "Tech", "Property", "Jewelry", "Home", "Experience"];
const STATUSES: CompStatus[] = [
  "LIVE",
  "SCHEDULED",
  "DRAFT",
  "COMPLETED",
  "LIVE",
  "LIVE",
  "SCHEDULED",
  "DRAFT",
  "COMPLETED",
  "LIVE",
  "SCHEDULED",
  "LIVE",
];

const NAMES = [
  "Mercedes-Benz C-Class 2025",
  "Nova X1 Tech Bundle",
  "Luxury 2-Bed Apartment",
  "Ikeja Home Studio",
  "Abuja Generator Pack",
  "PH Laptop Suite",
  "Eko Weekend Giveaway",
  "Lekki Jewelry Set",
  "Lagos Yacht Experience",
  "Jos Land Plot",
  "Kano Textile Bundle",
  "VI Penthouse Week",
];

const TOTAL_ENTRIES_POOL = [
  5000, 10000, 22500, 6000, 5000, 4000, 8000, 3000, 2500, 15000, 10000, 5000,
];
const TICKET_PRICE_POOL = [
  10000, 5000, 2500, 1500, 1000, 7500, 2000, 5000, 20000, 3000, 6000, 4000,
];

const COMPS: MockComp[] = NAMES.map((n, i) => ({
  id: `RF-C-${String(i + 1).padStart(5, "0")}`,
  name: n,
  slug: n.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  category: CATEGORIES[i % CATEGORIES.length]!,
  status: STATUSES[i % STATUSES.length]!,
  entriesSold: Math.floor(Math.random() * 4500) + 200,
  totalEntries: TOTAL_ENTRIES_POOL[i]!,
  ticketPrice: TICKET_PRICE_POOL[i]! * 100,
  image: IMAGES[i % IMAGES.length]!,
  partner: PARTNERS[i % PARTNERS.length]!,
  drawDate: `2026-${String((i % 11) + 2).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
  condition: (["new", "likenew", "refurbished", "used"] as const)[i % 4],
  marketValue: (TOTAL_ENTRIES_POOL[i]! * TICKET_PRICE_POOL[i]! * 100) / 3,
  description: `Premium ${CATEGORIES[i % CATEGORIES.length]} asset. Verified authenticity, full documentation, and insured delivery to anywhere in Nigeria.`,
  featured: i === 0 || i === 2,
  publicResults: i % 3 !== 0,
  startDate: `2026-${String((i % 11) + 1).padStart(2, "0")}-01T09:00`,
  liveDelay: 60 + i * 5,
  maxPerUser: 50 + i * 15,
}));

const statusTone: Record<CompStatus, string> = {
  DRAFT: "bg-ink/10 text-ink",
  SCHEDULED: "bg-sky/25 text-ink",
  LIVE: "bg-mint/35 text-ink",
  COMPLETED: "bg-coral/20 text-coral",
};

const STEP_LABELS = [
  "Basics",
  "Asset",
  "Entry config",
  "Schedule",
  "Visibility",
  "Review & Publish",
] as const;
type Step = (typeof STEP_LABELS)[number];

type FormState = {
  id?: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  assetName: string;
  assets: string[];
  marketValue: string;
  condition: string;
  partner: string;
  ticketPrice: string;
  totalEntries: string;
  maxPerUser: string;
  startDate: string;
  drawDate: string;
  liveDelay: string;
  featured: boolean;
  publicResults: boolean;
  status: CompStatus;
};

function emptyForm(): FormState {
  return {
    name: "",
    slug: "",
    category: CATEGORIES[0]!.toLowerCase(),
    description: "",
    assetName: "",
    assets: [],
    marketValue: "12000000",
    condition: "new",
    partner: PARTNERS[0]!.toLowerCase().replace(/[^a-z]/g, ""),
    ticketPrice: "10000",
    totalEntries: "5000",
    maxPerUser: "200",
    startDate: "2026-04-01T09:00",
    drawDate: "2026-06-18T21:00",
    liveDelay: "60",
    featured: true,
    publicResults: true,
    status: "DRAFT",
  };
}

function compToForm(c: MockComp): FormState {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    category: c.category.toLowerCase(),
    description: c.description ?? "",
    assetName: c.name,
    assets: [c.image],
    marketValue: String(c.marketValue ? Math.round(c.marketValue / 100) : 12000000),
    condition: c.condition ?? "new",
    partner: c.partner.toLowerCase().replace(/[^a-z]/g, ""),
    ticketPrice: String(c.ticketPrice / 100),
    totalEntries: String(c.totalEntries),
    maxPerUser: String(c.maxPerUser ?? 200),
    startDate: c.startDate ?? "2026-04-01T09:00",
    drawDate: `${c.drawDate}T21:00`,
    liveDelay: String(c.liveDelay ?? 60),
    featured: !!c.featured,
    publicResults: !!c.publicResults,
    status: c.status,
  };
}

type EntriesFilter = "all" | "paid" | "won" | "pending";

export function AdminCompetitionsPage() {
  const [tab, setTab] = useState<"live" | "scheduled" | "draft" | "completed" | "all">("live");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");

  const [modalMode, setModalMode] = useState<"new" | "edit" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [stepIdx, setStepIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [entriesFor, setEntriesFor] = useState<string | null>(null);
  const [entriesFilter, setEntriesFilter] = useState<EntriesFilter>("all");
  const [entriesSearch, setEntriesSearch] = useState("");
  const [entriesPage, setEntriesPage] = useState(1);
  const PAGE_SIZE = 10;

  const statusMap: Record<string, CompStatus | "all"> = {
    live: "LIVE",
    scheduled: "SCHEDULED",
    draft: "DRAFT",
    completed: "COMPLETED",
    all: "all",
  };

  const filtered = useMemo(
    () =>
      COMPS.filter((c) => {
        const s = search.toLowerCase();
        if (
          s &&
          !c.name.toLowerCase().includes(s) &&
          !c.slug.includes(s) &&
          !c.partner.toLowerCase().includes(s)
        )
          return false;
        const st = statusMap[tab];
        if (st === "all") return true;
        return c.status === st;
      }),
    [tab, search],
  );

  const entriesSource = useMemo(() => {
    const comp = COMPS.find((c) => c.id === entriesFor);
    if (!comp) return { comp: null, rows: [] as any[] };
    const rows = Array.from({ length: Math.min(comp.entriesSold, 286) }).map((_, i) => {
      const names = [
        "Tunmise Adebayo",
        "Aisha Mohammed",
        "Uche Dike",
        "Zainab Abubakar",
        "Tunde Okafor",
        "Chidi Kelechi",
        "Amaka Peace",
        "Ifeoma Dike",
        "Bola Tinubu",
        "Amina Garba",
        "Samuel Ola",
        "Blessing Onyeka",
      ];
      const name = names[i % names.length]!;
      const handles = [
        "@tunmise_a",
        "@aisha_m",
        "@uche_d",
        "@zainab_a",
        "@tunde_o",
        "@chidi_k",
        "@amaka_p",
        "@ifeoma_d",
        "@bola_t",
        "@amina_g",
        "@samuel_o",
        "@blessing_o",
      ];
      const statuses: Array<"Paid" | "Pending" | "Won" | "Refunded"> = [
        "Paid",
        "Paid",
        "Paid",
        "Pending",
        "Won",
        "Paid",
        "Paid",
        "Paid",
        "Paid",
        "Paid",
        "Refunded",
        "Pending",
      ];
      const tickets = (i % 50) + 1;
      const id = `${comp.id}-E${String(i + 1).padStart(6, "0")}`;
      return {
        id,
        name,
        handle: handles[i % handles.length]!,
        monogram: name
          .split(" ")
          .map((w) => w[0]!)
          .join("")
          .toUpperCase(),
        tickets,
        amount: tickets * comp.ticketPrice,
        entered: `2026-${String((i % 5) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}  ${String((i % 23) + 7).padStart(2, "0")}:${String((i * 3) % 60).padStart(2, "0")}`,
        status: statuses[i % statuses.length]!,
      };
    });
    return { comp, rows };
  }, [entriesFor]);

  const visibleEntries = useMemo(() => {
    let rows = entriesSource.rows;
    if (entriesFilter !== "all") {
      const map: Record<EntriesFilter, string> = {
        all: "",
        paid: "Paid",
        won: "Won",
        pending: "Pending",
      };
      rows = rows.filter((r) => r.status === map[entriesFilter]);
    }
    if (entriesSearch) {
      const s = entriesSearch.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(s) ||
          r.handle.toLowerCase().includes(s) ||
          r.id.toLowerCase().includes(s),
      );
    }
    return rows.slice(0, entriesPage * PAGE_SIZE);
  }, [entriesSource.rows, entriesFilter, entriesSearch, entriesPage]);

  function openNew() {
    setForm(emptyForm());
    setStepIdx(0);
    setSubmitted(false);
    setEditId(null);
    setModalMode("new");
  }
  function openEdit(comp: MockComp) {
    setForm(compToForm(comp));
    setStepIdx(0);
    setSubmitted(false);
    setEditId(comp.id);
    setModalMode("edit");
  }
  function closeModal() {
    setModalMode(null);
    setTimeout(() => {
      setStepIdx(0);
      setSubmitted(false);
      setEditId(null);
      setForm(emptyForm());
    }, 220);
  }

  async function submitDraft() {
    setSubmitting(true);
    try {
      const compId =
        form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `comp-${Date.now()}`;
      const imageData = form.assets.length > 0 ? form.assets[0] : "";

      await setDoc(doc(db, "competitions", compId), {
        slug: compId,
        title: form.name,
        category: form.category,
        partner: form.partner,
        description: form.description,
        assetName: form.assetName,
        image: imageData,
        images: form.assets,
        marketValueKobo: Math.round(Number(form.marketValue) * 100),
        condition: form.condition,
        entryPrice: Math.round(Number(form.ticketPrice) * 100),
        totalEntries: Number(form.totalEntries),
        maxPerUser: Number(form.maxPerUser),
        startDate: form.startDate,
        drawDate: form.drawDate,
        liveDelay: Number(form.liveDelay),
        featured: form.featured,
        publicResults: form.publicResults,
        status: form.status,
        entriesSold: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSubmitting(false);
      setSubmitted(true);
      void logActivity({
        eventType: modalMode === "edit" ? "COMPETITION_UPDATE" : "COMPETITION_CREATE",
        targetType: "competition",
        targetId: compId,
        summary: `${modalMode === "edit" ? "Updated" : "Created"} competition "${form.assetName || form.name}" (${form.status})`,
        details: {
          title: form.name,
          category: form.category,
          partner: form.partner,
          status: form.status,
          entryPriceKobo: Math.round(Number(form.ticketPrice) * 100),
          totalEntries: Number(form.totalEntries),
        },
      });
      toast.success(`${modalMode === "edit" ? "Competition updated" : "Competition created"}`, {
        description: `${form.assetName || form.name || "Untitled competition"} · saved as ${form.status} · ${compId}`,
      });
    } catch (err) {
      setSubmitting(false);
      toast.error("Failed to save competition", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  function performAction(comp: MockComp, action: string) {
    switch (action) {
      case "view":
        toast.success("Opening competition page", { description: `${comp.name} on public site.` });
        break;
      case "edit":
        openEdit(comp);
        break;
      case "duplicate":
        void logActivity({
          eventType: "COMPETITION_CREATE",
          targetType: "competition",
          targetId: comp.slug,
          summary: `Duplicated competition "${comp.name}" to DRAFT`,
        });
        toast.success("Competition duplicated", {
          description: `Copy of ${comp.name} created in DRAFT.`,
        });
        break;
      case "pause":
        void logActivity({
          eventType: "COMPETITION_UPDATE",
          targetType: "competition",
          targetId: comp.slug,
          summary: `${comp.status === "LIVE" ? "Paused" : "Resumed"} competition "${comp.name}"`,
          oldValue: { status: comp.status },
          newValue: { status: comp.status === "LIVE" ? "PAUSED" : "LIVE" },
        });
        toast.success(comp.status === "LIVE" ? "Competition paused" : "Competition resumed", {
          description: `${comp.name} status toggled.`,
        });
        break;
      case "cancel":
        void logActivity({
          eventType: "COMPETITION_CANCEL",
          targetType: "competition",
          targetId: comp.slug,
          summary: `Cancelled competition "${comp.name}" (no refunds auto-issued)`,
          oldValue: { status: comp.status },
          newValue: { status: "CANCELLED" },
        });
        toast.warning("Competition cancelled", {
          description: `${comp.name} moved to CANCELLED · no refunds auto-issued.`,
        });
        break;
      case "analytics":
        toast.success("Analytics loading", {
          description: `Performance snapshot for ${comp.name}.`,
        });
        break;
      case "share":
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          void navigator.clipboard.writeText(`https://raffila.com/competitions/${comp.slug}`);
        }
        toast.success("Public link copied", {
          description: `raffila.com/competitions/${comp.slug}`,
        });
        break;
      default:
        break;
    }
  }

  return (
    <AdminShell activeNav="competitions" title="Competitions">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">
            Admin · Competitions
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Competitions
          </h1>
          <p className="mt-2 max-w-2xl text-base font-bold text-ink/60">
            Create, schedule, draw, and manage prize competitions across the Raffila platform.
          </p>
        </div>
        <Button variant="primary" onClick={openNew}>
          <Plus className="size-4" /> New competition
        </Button>
      </header>

      <Card className="rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as any)}
              className="w-full sm:w-auto overflow-x-auto scrollbar-none"
            >
              <TabsList className="rounded-full bg-cream p-1 w-max sm:w-auto">
                {[
                  { v: "live", l: "Live" },
                  { v: "scheduled", l: "Scheduled" },
                  { v: "draft", l: "Draft" },
                  { v: "completed", l: "Completed" },
                  { v: "all", l: "All" },
                ].map((t) => (
                  <TabsTrigger
                    key={t.v}
                    value={t.v}
                    className="rounded-full px-4 py-1.5 text-xs font-extrabold data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-sm data-[state=inactive]:text-ink/60"
                  >
                    {t.l}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
                <Input
                  placeholder="Search competition, partner, id…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-full border-0 bg-white pl-9 pr-4 text-xs font-bold text-ink placeholder:text-ink/40 ring-1 ring-ink/10 focus-visible:ring-coral"
                />
              </div>
              <div className="flex items-center rounded-full bg-cream p-0.5 ring-1 ring-ink/10">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-9 rounded-full",
                    view === "grid" && "bg-white text-ink shadow-sm",
                  )}
                  onClick={() => setView("grid")}
                >
                  <LayoutGrid className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-9 rounded-full",
                    view === "list" && "bg-white text-ink shadow-sm",
                  )}
                  onClick={() => setView("list")}
                >
                  <List className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {view === "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((c) => {
                const pct = Math.min(100, Math.round((c.entriesSold / c.totalEntries) * 100));
                const full = pct >= 100;
                return (
                  <Card
                    key={c.id}
                    className="group rounded-[26px] border-0 bg-white p-0 ring-1 ring-ink/10 shadow-[0_2px_14px_-10px_rgba(0,0,0,0.15)] overflow-hidden"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-cream">
                      <img
                        src={c.image}
                        alt={`${c.name} prize`}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute left-3 top-3 flex items-center gap-1.5">
                        <Badge
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-0",
                            statusTone[c.status],
                          )}
                        >
                          {c.status}
                        </Badge>
                        <Badge className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold text-ink ring-0 backdrop-blur">
                          {c.category}
                        </Badge>
                      </div>
                      <div className="absolute right-3 top-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-full bg-white/95 backdrop-blur text-ink ring-1 ring-ink/10 hover:bg-white"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-52 rounded-[22px] bg-white p-1.5 ring-1 ring-ink/10 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.25)]"
                          >
                            <DropdownMenuLabel className="rounded-xl px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-ink/45">
                              {c.id}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-ink/80 focus:bg-sky/20 focus:text-ink"
                              onClick={() => performAction(c, "view")}
                            >
                              <EyeIcon className="mr-2 size-4" />
                              View on site
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-ink/80 focus:bg-coral/15 focus:text-ink"
                              onClick={() => performAction(c, "edit")}
                            >
                              <Pencil className="mr-2 size-4" />
                              Edit competition
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-ink/80 focus:bg-mint/25 focus:text-ink"
                              onClick={() => setEntriesFor(c.id)}
                            >
                              <Ticket className="mr-2 size-4" />
                              Manage entries
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-ink/80 focus:bg-lemon/40 focus:text-ink"
                              onClick={() => performAction(c, "duplicate")}
                            >
                              <Copy className="mr-2 size-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-ink/80 focus:bg-cream focus:text-ink"
                              onClick={() => performAction(c, "pause")}
                            >
                              {c.status === "LIVE" ? (
                                <Pause className="mr-2 size-4" />
                              ) : (
                                <PlayCircle className="mr-2 size-4" />
                              )}
                              {c.status === "LIVE" ? "Pause entries" : "Resume entries"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-ink/80 focus:bg-lilac/25 focus:text-ink"
                              onClick={() => performAction(c, "analytics")}
                            >
                              <TrendingUp className="mr-2 size-4" />
                              View analytics
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-ink/80 focus:bg-coral/15 focus:text-ink"
                              onClick={() => performAction(c, "share")}
                            >
                              <Share2 className="mr-2 size-4" />
                              Copy public link
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-coral focus:bg-coral/15"
                              onClick={() => performAction(c, "cancel")}
                            >
                              <AlertCircle className="mr-2 size-4" />
                              Cancel draw
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardContent className="p-5 space-y-3.5">
                      <h3 className="font-display text-[17px] font-extrabold leading-tight text-ink min-h-[2.5rem] line-clamp-2">
                        {c.name}
                      </h3>
                      <div className="flex items-center justify-between text-[11px] font-extrabold">
                        <span className="inline-flex items-center gap-1 text-ink/60">
                          <CalendarDays className="size-3" />
                          Draw {c.drawDate}
                        </span>
                        <span className="text-ink whitespace-nowrap">
                          {formatNaira(c.ticketPrice)}
                        </span>
                      </div>
                      <div>
                        <div className="mb-1.5 flex items-center justify-between text-[11px] font-extrabold text-ink/60">
                          <span>Entries</span>
                          <span>
                            {c.entriesSold.toLocaleString("en-NG")} /{" "}
                            {c.totalEntries.toLocaleString("en-NG")} · {pct}%
                          </span>
                        </div>
                        <Progress
                          value={pct}
                          className="h-2 rounded-full bg-cream [&>div]:bg-coral [&>div]:rounded-full"
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => performAction(c, "edit")}
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setEntriesFor(c.id)}>
                          <Ticket className="size-3.5" />
                          Manage entries
                        </Button>
                        {c.status === "LIVE" && full && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              void logActivity({
                                eventType: "COMPETITION_DRAW",
                                targetType: "competition",
                                targetId: c.slug,
                                summary: `Started draw for "${c.name}"`,
                              });
                              toast.success("Starting draw", { description: c.name });
                            }}
                          >
                            <PlayCircle className="size-3.5" />
                            Draw now
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 px-2">
              <Table>
                <TableHeader className="[&_tr]:border-ink/10">
                  <TableRow>
                    <TableHead className="py-3 font-extrabold text-ink/65">Competition</TableHead>
                    <TableHead className="py-3 font-extrabold text-ink/65">Category</TableHead>
                    <TableHead className="py-3 font-extrabold text-ink/65">Partner</TableHead>
                    <TableHead className="py-3 text-right font-extrabold text-ink/65">
                      Entries %
                    </TableHead>
                    <TableHead className="py-3 text-right font-extrabold text-ink/65">
                      Ticket
                    </TableHead>
                    <TableHead className="py-3 font-extrabold text-ink/65">Status</TableHead>
                    <TableHead className="py-3 font-extrabold text-ink/65">Draw date</TableHead>
                    <TableHead className="py-3 text-right font-extrabold text-ink/65">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="[&_tr]:border-ink/10">
                  {filtered.map((c) => {
                    const pct = Math.min(100, Math.round((c.entriesSold / c.totalEntries) * 100));
                    const full = pct >= 100;
                    return (
                      <TableRow key={c.id} className="hover:bg-sky/8">
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={c.image}
                              alt=""
                              aria-hidden
                              className="size-11 rounded-2xl object-cover ring-2 ring-white"
                            />
                            <div className="min-w-0 max-w-[280px]">
                              <p className="truncate text-sm font-extrabold text-ink">{c.name}</p>
                              <p className="truncate text-[11px] font-bold text-ink/50">
                                {c.id} · {c.partner}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-xs font-bold text-ink/70">
                          {c.category}
                        </TableCell>
                        <TableCell className="py-3 text-xs font-bold text-ink/70">
                          {c.partner}
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-2 w-28 overflow-hidden rounded-full bg-cream">
                              <div className="h-full bg-coral" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-10 text-right text-[11px] font-extrabold text-ink/65">
                              {pct}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-right whitespace-nowrap text-xs font-extrabold text-ink">
                          {formatNaira(c.ticketPrice)}
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ring-0",
                              statusTone[c.status],
                            )}
                          >
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 whitespace-nowrap text-xs font-bold text-ink/65">
                          {c.drawDate}
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-ink/70 hover:bg-coral/10 hover:text-coral"
                              onClick={() => performAction(c, "view")}
                            >
                              <EyeIcon className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-ink/70 hover:bg-coral/10 hover:text-coral"
                              onClick={() => performAction(c, "edit")}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-ink/70 hover:bg-mint/20 hover:text-ink"
                              onClick={() => setEntriesFor(c.id)}
                            >
                              <Ticket className="size-4" />
                            </Button>
                            {c.status === "LIVE" && full && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  void logActivity({
                                    eventType: "COMPETITION_DRAW",
                                    targetType: "competition",
                                    targetId: c.slug,
                                    summary: `Started draw for "${c.name}"`,
                                  });
                                  toast.success("Starting draw", { description: c.name });
                                }}
                              >
                                <PlayCircle className="size-3.5" />
                                Draw
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalMode !== null} onOpenChange={(v) => !v && closeModal()}>
        <DialogContent className="rounded-[28px] bg-white p-0 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.25)] sm:max-w-3xl max-h-[94vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b border-ink/10 px-6 py-5">
            <DialogTitle className="flex items-center justify-between gap-3 font-display text-2xl font-extrabold text-ink">
              <span className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-coral/20">
                  <Trophy className="size-4.5 text-coral" />
                </span>
                {modalMode === "edit" ? "Edit competition" : "New competition"}
              </span>
              <button
                className="grid size-9 place-items-center rounded-full bg-cream/60 text-ink/60 ring-1 ring-ink/10 hover:bg-white hover:text-ink"
                onClick={closeModal}
              >
                <X className="size-4" />
              </button>
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm font-bold text-ink/55">
              Step {stepIdx + 1} of {STEP_LABELS.length} · {STEP_LABELS[stepIdx]}
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10 text-center">
              <div className="grid size-20 place-items-center rounded-full bg-mint/35">
                <CheckCircle2 className="size-10 text-ink" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-extrabold text-ink">
                {modalMode === "edit" ? "Competition updated" : "Competition created"}
              </h3>
              <p className="mt-2 max-w-md text-sm font-bold text-ink/60">
                {modalMode === "edit"
                  ? "Edits saved. Asset review, schedule, and draw settings remain live adjustable."
                  : "Your draft competition has been saved. Asset review, schedule, and draw settings can be adjusted before going live."}
              </p>
              <div className="mt-6 grid w-full max-w-md grid-cols-2 gap-3 text-left">
                <Card className="rounded-2xl border-0 bg-cream/60 p-0 ring-1 ring-ink/10">
                  <CardContent className="p-4">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">
                      Competition ID
                    </p>
                    <p className="mt-1 text-sm font-extrabold text-ink">
                      {form.id ?? "RF-C-00134"}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl border-0 bg-cream/60 p-0 ring-1 ring-ink/10">
                  <CardContent className="p-4">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">
                      Status
                    </p>
                    <Badge className="mt-1 rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-extrabold uppercase ring-0 text-ink">
                      {form.status ?? "Draft"}
                    </Badge>
                  </CardContent>
                </Card>
              </div>
              <Button variant="primary" className="mt-7" onClick={closeModal}>
                <Sparkles className="size-4" /> Done
              </Button>
            </div>
          ) : (
            <>
              <div className="px-6 pt-4">
                <div className="flex items-center gap-1.5 overflow-x-auto py-2">
                  {STEP_LABELS.map((s, i) => (
                    <div key={s} className="flex shrink-0 items-center gap-1.5">
                      <div
                        className={cn(
                          "grid size-8 place-items-center rounded-full text-[11px] font-extrabold ring-1",
                          i < stepIdx
                            ? "bg-mint/35 text-ink ring-mint/40"
                            : i === stepIdx
                              ? "bg-coral text-white ring-coral/50 shadow-[0_10px_24px_-16px_var(--coral)]"
                              : "bg-cream/50 text-ink/55 ring-ink/10",
                        )}
                      >
                        {i < stepIdx ? <Check className="size-3.5" /> : i + 1}
                      </div>
                      <span
                        className={cn(
                          "whitespace-nowrap text-[10px] font-extrabold uppercase tracking-wider",
                          i <= stepIdx ? "text-ink" : "text-ink/40",
                        )}
                      >
                        {s}
                      </span>
                      {i < STEP_LABELS.length - 1 && (
                        <ChevronRight className="mx-0.5 size-3 text-ink/30" />
                      )}
                    </div>
                  ))}
                </div>
                <Separator className="mt-2" />
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {stepIdx === 0 && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2 space-y-2">
                      <Label className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/50">
                        Competition name
                      </Label>
                      <Input
                        placeholder="e.g. 2026 Mercedes-Benz C-Class Grand Prize"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="h-12 rounded-2xl border-0 bg-white px-4 text-sm font-bold text-ink placeholder:text-ink/40 ring-1 ring-ink/10 focus-visible:ring-coral"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/50">
                        URL slug
                      </Label>
                      <Input
                        placeholder="mercedes-c-class-2026"
                        value={form.slug}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                          })
                        }
                        className="h-12 rounded-2xl border-0 bg-white px-4 text-sm font-bold text-ink placeholder:text-ink/40 ring-1 ring-ink/10 focus-visible:ring-coral"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/50">
                        Category
                      </Label>
                      <Select
                        value={form.category}
                        onValueChange={(v) => setForm({ ...form, category: v })}
                      >
                        <SelectTrigger className="h-12 rounded-2xl bg-white px-4 text-sm font-extrabold text-ink ring-1 ring-ink/10 focus:ring-coral">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-[22px] bg-white p-1 ring-1 ring-ink/10">
                          {CATEGORIES.map((c) => (
                            <SelectItem
                              key={c}
                              value={c.toLowerCase()}
                              className="rounded-xl font-bold"
                            >
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <Label className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/50">
                        Description
                      </Label>
                      <Textarea
                        rows={4}
                        placeholder="Rich description shown on the competition landing page…"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="rounded-2xl border-0 bg-white p-4 text-sm font-bold text-ink placeholder:text-ink/40 ring-1 ring-ink/10 focus-visible:ring-coral"
                      />
                    </div>
                  </div>
                )}

                {stepIdx === 1 && (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2 space-y-2">
                      <Label className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/50">
                        Asset / prize name
                      </Label>
                      <Input
                        placeholder="Mercedes-Benz C-Class 2025 · brand new, full warranty"
                        value={form.assetName}
                        onChange={(e) => setForm({ ...form, assetName: e.target.value })}
                        className="h-12 rounded-2xl border-0 bg-white px-4 text-sm font-bold text-ink placeholder:text-ink/40 ring-1 ring-ink/10 focus-visible:ring-coral"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <AssetUploader
                        value={form.assets}
                        onChange={(next) => setForm({ ...form, assets: next })}
                        max={12}
                        label="Prize asset images"
                        hint="Upload from device via Cloudinary, drag/drop, or paste direct public image URLs."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/50">
                        Market value (₦)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-ink/55">
                          ₦
                        </span>
                        <Input
                          type="number"
                          value={form.marketValue}
                          onChange={(e) => setForm({ ...form, marketValue: e.target.value })}
                          placeholder="12,000,000"
                          className="h-12 rounded-2xl border-0 bg-white pl-8 pr-4 text-base font-extrabold text-ink placeholder:text-ink/40 ring-1 ring-ink/10 focus-visible:ring-coral"
                        />
                      </div>
                      <p className="text-[11px] font-bold text-ink/55">
                        {formatNaira(parseInt(form.marketValue || "0", 10) * 100)} suggested retail
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/50">
                        Asset condition
                      </Label>
                      <Select
                        value={form.condition}
                        onValueChange={(v) => setForm({ ...form, condition: v })}
                      >
                        <SelectTrigger className="h-12 rounded-2xl bg-white px-4 text-sm font-extrabold text-ink ring-1 ring-ink/10 focus:ring-coral">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-[22px] bg-white p-1 ring-1 ring-ink/10">
                          <SelectItem value="new" className="rounded-xl font-bold">
                            Brand new
                          </SelectItem>
                          <SelectItem value="likenew" className="rounded-xl font-bold">
                            Like new
                          </SelectItem>
                          <SelectItem value="refurbished" className="rounded-xl font-bold">
                            Certified refurbished
                          </SelectItem>
                          <SelectItem value="used" className="rounded-xl font-bold">
                            Used / verified
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <Label className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/50">
                        Partner
                      </Label>
                      <Select
                        value={form.partner}
                        onValueChange={(v) => setForm({ ...form, partner: v })}
                      >
                        <SelectTrigger className="h-12 rounded-2xl bg-white px-4 text-sm font-extrabold text-ink ring-1 ring-ink/10 focus:ring-coral">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-[22px] bg-white p-1 ring-1 ring-ink/10">
                          {PARTNERS.map((p) => (
                            <SelectItem
                              key={p}
                              value={p.toLowerCase().replace(/[^a-z]/g, "")}
                              className="rounded-xl font-bold"
                            >
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {stepIdx === 2 && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/50">
                        Ticket price (₦)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-ink/55">
                          ₦
                        </span>
                        <Input
                          type="number"
                          value={form.ticketPrice}
                          onChange={(e) => setForm({ ...form, ticketPrice: e.target.value })}
                          className="h-12 rounded-2xl border-0 bg-white pl-8 pr-4 text-base font-extrabold text-ink placeholder:text-ink/40 ring-1 ring-ink/10 focus-visible:ring-coral"
                        />
                      </div>
                      <p className="text-[11px] font-bold text-ink/55">
                        {formatNaira(parseInt(form.ticketPrice || "0", 10) * 100)} per entry
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/50">
                        Max total entries
                      </Label>
                      <Input
                        type="number"
                        value={form.totalEntries}
                        onChange={(e) => setForm({ ...form, totalEntries: e.target.value })}
                        className="h-12 rounded-2xl border-0 bg-white px-4 text-base font-extrabold text-ink ring-1 ring-ink/10 focus-visible:ring-coral"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/50">
                        Max entries per user
                      </Label>
                      <Input
                        type="number"
                        value={form.maxPerUser}
                        onChange={(e) => setForm({ ...form, maxPerUser: e.target.value })}
                        className="h-12 rounded-2xl border-0 bg-white px-4 text-base font-extrabold text-ink ring-1 ring-ink/10 focus-visible:ring-coral"
                      />
                    </div>
                  </div>
                )}

                {stepIdx === 3 && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/50">
                        Start date
                      </Label>
                      <Input
                        type="datetime-local"
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        className="h-12 rounded-2xl border-0 bg-white px-4 text-sm font-bold text-ink ring-1 ring-ink/10 focus-visible:ring-coral"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/50">
                        Draw date
                      </Label>
                      <Input
                        type="datetime-local"
                        value={form.drawDate}
                        onChange={(e) => setForm({ ...form, drawDate: e.target.value })}
                        className="h-12 rounded-2xl border-0 bg-white px-4 text-sm font-bold text-ink ring-1 ring-ink/10 focus-visible:ring-coral"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink/50">
                        Live push delay (mins)
                      </Label>
                      <Input
                        type="number"
                        value={form.liveDelay}
                        onChange={(e) => setForm({ ...form, liveDelay: e.target.value })}
                        className="h-12 rounded-2xl border-0 bg-white px-4 text-base font-extrabold text-ink ring-1 ring-ink/10 focus-visible:ring-coral"
                      />
                    </div>
                  </div>
                )}

                {stepIdx === 4 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 ring-1 ring-ink/10">
                      <div>
                        <p className="text-sm font-extrabold text-ink">Featured competition</p>
                        <p className="text-xs font-bold text-ink/55">
                          Pin to the top of the home page and featured carousel.
                        </p>
                      </div>
                      <Switch
                        checked={form.featured}
                        onCheckedChange={(v) => setForm({ ...form, featured: !!v })}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 ring-1 ring-ink/10">
                      <div>
                        <p className="text-sm font-extrabold text-ink">Public results</p>
                        <p className="text-xs font-bold text-ink/55">
                          Publish draw results and winner identity publicly.
                        </p>
                      </div>
                      <Switch
                        checked={form.publicResults}
                        onCheckedChange={(v) => setForm({ ...form, publicResults: !!v })}
                      />
                    </div>
                  </div>
                )}

                {stepIdx === 5 && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[
                      {
                        k: "Basics",
                        title: form.name || "Untitled",
                        sub: `${CATEGORIES.find((c) => c.toLowerCase() === form.category) ?? form.category} · slug: ${form.slug || "auto"}`,
                      },
                      {
                        k: "Asset",
                        title: `${formatNaira(parseInt(form.marketValue || "0", 10) * 100)} · ${({ new: "Brand new", likenew: "Like new", refurbished: "Refurbished", used: "Used" } as any)[form.condition] || "Brand new"}`,
                        sub: `${form.assets.length} uploaded · ${PARTNERS.find((p) => p.toLowerCase().replace(/[^a-z]/g, "") === form.partner) ?? PARTNERS[0]}`,
                      },
                      {
                        k: "Entry config",
                        title: `${formatNaira(parseInt(form.ticketPrice || "0", 10) * 100)} per ticket`,
                        sub: `${form.totalEntries} total · ${form.maxPerUser} max per user`,
                      },
                      {
                        k: "Schedule",
                        title: `Draw · ${form.drawDate.replace("T", " ")}`,
                        sub: `Start ${form.startDate.replace("T", " ")} · delay ${form.liveDelay}m · ${form.featured ? "featured" : "not featured"} · ${form.publicResults ? "public" : "private"} results`,
                      },
                    ].map((s) => (
                      <Card
                        key={s.k}
                        className="rounded-2xl border-0 bg-white p-0 ring-1 ring-ink/10"
                      >
                        <CardContent className="space-y-2 p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">
                              {s.k}
                            </p>
                            <Badge className="rounded-full bg-mint/35 px-2 py-0.5 text-[9px] font-extrabold ring-0 text-ink">
                              OK
                            </Badge>
                          </div>
                          <p className="text-sm font-extrabold text-ink">{s.title}</p>
                          <p className="text-[11px] font-bold text-ink/55">{s.sub}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter className="flex-wrap border-t border-ink/10 px-6 py-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (stepIdx === 0) closeModal();
                    else setStepIdx(stepIdx - 1);
                  }}
                  disabled={submitting}
                >
                  {stepIdx === 0 ? "Cancel" : "Back"}
                </Button>
                <div className="flex-1" />
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSubmitted(true);
                    void logActivity({
                      eventType: "COMPETITION_UPDATE",
                      targetType: "competition",
                      targetId:
                        form.slug ||
                        form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") ||
                        "unsaved-draft",
                      summary: `Saved draft for "${form.assetName || form.name || "Untitled competition"}"`,
                    });
                    toast.success("Draft saved", { description: "Saved without publishing." });
                  }}
                  disabled={submitting}
                >
                  Save as draft
                </Button>
                {stepIdx < STEP_LABELS.length - 1 ? (
                  <Button
                    variant="primary"
                    onClick={() => setStepIdx(stepIdx + 1)}
                    disabled={submitting}
                  >
                    Continue <ChevronRight className="size-4" />
                  </Button>
                ) : (
                  <Button variant="primary" onClick={submitDraft} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Sparkles className="size-4 animate-pulse" />{" "}
                        {modalMode === "edit" ? "Saving…" : "Creating…"}
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        {modalMode === "edit" ? "Save changes" : "Create competition"}
                      </>
                    )}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!entriesFor} onOpenChange={(v) => !v && setEntriesFor(null)}>
        <DialogContent className="rounded-[28px] bg-white p-0 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.25)] sm:max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b border-ink/10 px-6 py-5">
            <DialogTitle className="flex items-center justify-between gap-3 font-display text-2xl font-extrabold text-ink">
              <span className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-mint/30">
                  <Ticket className="size-5 text-ink" />
                </span>
                {entriesSource.comp?.name ?? "Entries"} · manage
              </span>
              <button
                className="grid size-9 place-items-center rounded-full bg-cream/60 text-ink/60 ring-1 ring-ink/10 hover:bg-white hover:text-ink"
                onClick={() => setEntriesFor(null)}
              >
                <X className="size-4" />
              </button>
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm font-bold text-ink/55">
              {entriesSource.comp
                ? `${entriesSource.rows.length.toLocaleString("en-NG")} total entries · ${formatNaira(entriesSource.comp.ticketPrice)} each`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 border-b border-ink/10 px-6 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[240px] flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
                <Input
                  placeholder="Search name, handle, entry id…"
                  value={entriesSearch}
                  onChange={(e) => {
                    setEntriesSearch(e.target.value);
                    setEntriesPage(1);
                  }}
                  className="h-11 rounded-full border-0 bg-white pl-9 pr-4 text-sm font-bold text-ink placeholder:text-ink/40 ring-1 ring-ink/10 focus-visible:ring-coral"
                />
              </div>
              <Tabs
                value={entriesFilter}
                onValueChange={(v) => {
                  setEntriesFilter(v as any);
                  setEntriesPage(1);
                }}
                className="w-auto"
              >
                <TabsList className="rounded-full bg-cream p-1">
                  {[
                    { v: "all", l: "All" },
                    { v: "paid", l: "Paid" },
                    { v: "won", l: "Won" },
                    { v: "pending", l: "Pending" },
                  ].map((t) => (
                    <TabsTrigger
                      key={t.v}
                      value={t.v}
                      className="rounded-full px-4 py-1.5 text-xs font-extrabold data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-sm data-[state=inactive]:text-ink/60"
                    >
                      {t.l}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast.success("Export queued", {
                      description: "Entries CSV will download shortly.",
                    })
                  }
                >
                  <Download className="size-3.5" /> Export CSV
                </Button>
                <Button variant="ghost" size="sm">
                  <Filter className="size-3.5" /> More filters
                </Button>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
            <Table>
              <TableHeader className="[&_tr]:border-ink/10 bg-cream/60 [&_tr_th]:bg-transparent">
                <TableRow>
                  <TableHead className="rounded-l-2xl py-3 font-extrabold text-ink/65">
                    Entry
                  </TableHead>
                  <TableHead className="py-3 font-extrabold text-ink/65">Player</TableHead>
                  <TableHead className="py-3 text-right font-extrabold text-ink/65">
                    Tickets
                  </TableHead>
                  <TableHead className="py-3 text-right font-extrabold text-ink/65">
                    Amount
                  </TableHead>
                  <TableHead className="py-3 font-extrabold text-ink/65">Entered</TableHead>
                  <TableHead className="py-3 font-extrabold text-ink/65">Status</TableHead>
                  <TableHead className="rounded-r-2xl py-3 text-right font-extrabold text-ink/65">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr]:border-ink/10">
                {visibleEntries.map((r) => (
                  <TableRow key={r.id} className="hover:bg-sky/8">
                    <TableCell className="py-3">
                      <div className="min-w-0 max-w-[200px]">
                        <p className="truncate text-xs font-extrabold text-ink">{r.id}</p>
                        <p className="truncate text-[11px] font-bold text-ink/50">
                          {entriesSource.comp?.id ?? ""}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 ring-2 ring-white">
                          <AvatarFallback className="bg-coral/15 text-coral font-extrabold">
                            {r.monogram}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 max-w-[240px]">
                          <p className="truncate text-sm font-extrabold text-ink">{r.name}</p>
                          <p className="truncate text-[11px] font-bold text-ink/50">{r.handle}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-right text-sm font-extrabold text-ink">
                      {r.tickets.toLocaleString("en-NG")}
                    </TableCell>
                    <TableCell className="py-3 text-right whitespace-nowrap text-sm font-extrabold text-ink">
                      {formatNaira(r.amount)}
                    </TableCell>
                    <TableCell className="py-3 whitespace-nowrap text-xs font-bold text-ink/60">
                      {r.entered}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ring-0",
                          r.status === "Paid" && "bg-mint/35 text-ink",
                          r.status === "Pending" && "bg-lemon/40 text-ink",
                          r.status === "Won" && "bg-coral/20 text-coral",
                          r.status === "Refunded" && "bg-ink/10 text-ink",
                        )}
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-ink/70 hover:bg-sky/15 hover:text-ink"
                          onClick={() => toast.info("Opening entry", { description: r.id })}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-ink/70 hover:bg-coral/10 hover:text-coral"
                          onClick={() => {
                            if (typeof navigator !== "undefined" && navigator.clipboard)
                              void navigator.clipboard.writeText(r.id);
                            toast.success("Entry ID copied", { description: r.id });
                          }}
                        >
                          <Copy className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-ink/70 hover:bg-mint/20 hover:text-ink"
                          onClick={() => toast.info("Opening player", { description: r.name })}
                        >
                          <UserRound className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {visibleEntries.length === 0 ? (
              <div className="py-16 text-center text-sm font-bold text-ink/50">
                No entries match this filter.
              </div>
            ) : null}
          </div>
          <DialogFooter className="flex-wrap border-t border-ink/10 px-6 py-4">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-ink/50">
              Showing {visibleEntries.length.toLocaleString("en-NG")}
            </div>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEntriesPage((p) => Math.max(1, p - 1))}
              disabled={entriesPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setEntriesPage((p) => p + 1)}
              disabled={visibleEntries.length < entriesPage * PAGE_SIZE}
            >
              Load more
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
