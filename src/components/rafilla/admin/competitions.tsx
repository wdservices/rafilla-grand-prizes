import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  LayoutGrid,
  List,
  Trophy,
  Eye,
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
  Eye as EyeIcon,
  Pencil,
  PlayCircle,
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { AdminShell } from "@/components/rafilla/admin/admin-shell";
import { cn, formatNaira } from "@/lib/utils";

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
}

const IMAGES = [mercedesImage, techBundleImage, apartmentImage];
const PARTNERS = ["Lux Wheels Ltd", "TechHome NG", "Adebayo Homes", "Lekki Luxury Autos", "Abuja Tech Hub"];
const CATEGORIES = ["Auto", "Tech", "Property", "Jewelry", "Home", "Experience"];
const STATUSES: CompStatus[] = ["LIVE", "SCHEDULED", "DRAFT", "COMPLETED", "LIVE", "LIVE", "SCHEDULED", "DRAFT", "COMPLETED", "LIVE"];

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

const TOTAL_ENTRIES_POOL = [5000, 10000, 22500, 6000, 5000, 4000, 8000, 3000, 2500, 15000];
const TICKET_PRICE_POOL = [10000, 5000, 2500, 1500, 1000, 7500, 2000, 5000, 20000, 3000];
const COMPS: MockComp[] = NAMES.map((n, i) => ({
  id: `RF-C-${String(i + 1).padStart(5, "0")}`,
  name: n,
  slug: n.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  category: CATEGORIES[i % CATEGORIES.length]!,
  status: STATUSES[i % STATUSES.length]!,
  entriesSold: Math.floor(Math.random() * 4500) + 200,
  totalEntries: TOTAL_ENTRIES_POOL[i % 10]!,
  ticketPrice: TICKET_PRICE_POOL[i % 10]! * 100,
  image: IMAGES[i % IMAGES.length]!,
  partner: PARTNERS[i % PARTNERS.length]!,
  drawDate: `2026-${String(((i % 11) + 2)).padStart(2, "0")}-${String(((i % 27) + 1)).padStart(2, "0")}`,
}));

const statusTone: Record<CompStatus, string> = {
  DRAFT: "bg-ink/10 text-ink",
  SCHEDULED: "bg-sky/25 text-ink",
  LIVE: "bg-mint/35 text-ink",
  COMPLETED: "bg-coral/20 text-coral",
};

const STEP_LABELS = ["Basics", "Asset", "Entry config", "Schedule", "Visibility", "Review & Publish"] as const;
type Step = (typeof STEP_LABELS)[number];

export function AdminCompetitionsPage() {
  const [tab, setTab] = useState("live");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const filtered = COMPS.filter((c) => {
    const s = search.toLowerCase();
    if (s && !c.name.toLowerCase().includes(s) && !c.slug.includes(s)) return false;
    if (tab === "all") return true;
    const statusMap: Record<string, CompStatus | "all"> = {
      live: "LIVE",
      scheduled: "SCHEDULED",
      draft: "DRAFT",
      completed: "COMPLETED",
    };
    return c.status === statusMap[tab];
  });

  function nextStep() {
    if (stepIdx < STEP_LABELS.length - 1) setStepIdx(stepIdx + 1);
  }
  function prevStep() {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  }
  function submitDraft() {
    setSubmitted(true);
    setTimeout(() => {
      toast.success("Competition created", { description: "Draft saved · ready to schedule when approved." });
    }, 400);
  }
  function closeAndReset() {
    setModalOpen(false);
    setTimeout(() => {
      setStepIdx(0);
      setSubmitted(false);
    }, 250);
  }

  return (
    <AdminShell activeNav="competitions" title="Competitions">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">Admin · Competitions</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Competitions</h1>
          <p className="mt-2 max-w-2xl text-base font-bold text-ink/60">
            Create, schedule, draw, and manage prize competitions across the Rafilla platform.
          </p>
        </div>
        <Dialog open={modalOpen} onOpenChange={(v) => { setModalOpen(v); if (!v) { setTimeout(() => { setStepIdx(0); setSubmitted(false); }, 200); } }}>
          <DialogTrigger asChild>
            <Button variant="primary">
              <Plus className="size-4" /> New competition
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[28px] bg-paper p-0 shadow-none sm:max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">
            <DialogHeader className="border-b border-ink/10 px-6 py-5">
              <DialogTitle className="flex items-center justify-between gap-3 font-display text-2xl font-extrabold text-ink">
                <span className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-2xl bg-coral/20">
                    <Trophy className="size-4.5 text-coral" />
                  </span>
                  New competition
                </span>
                <button className="grid size-9 place-items-center rounded-full bg-cream text-ink/60 hover:bg-lilac/20 hover:text-ink" onClick={closeAndReset}>
                  <X className="size-4" />
                </button>
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm font-bold text-ink/55">
                Step {stepIdx + 1} of {STEP_LABELS.length} · {STEP_LABELS[stepIdx]}
              </DialogDescription>
            </DialogHeader>

            {submitted ? (
              <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center justify-center text-center">
                <div className="grid size-20 place-items-center rounded-full bg-mint/35">
                  <CheckCircle2 className="size-10 text-ink" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-extrabold text-ink">Competition created</h3>
                <p className="mt-2 max-w-md text-sm font-bold text-ink/60">
                  Your draft competition has been saved. Asset review, schedule, and draw settings can be adjusted before going live.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3 text-left w-full max-w-md">
                  <Card className="rounded-2xl border-0 bg-cream p-0 ring-1 ring-ink/5">
                    <CardContent className="p-4">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">Competition ID</p>
                      <p className="mt-1 text-sm font-extrabold text-ink">RF-C-00134</p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-0 bg-cream p-0 ring-1 ring-ink/5">
                    <CardContent className="p-4">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">Status</p>
                      <Badge className="mt-1 rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-extrabold uppercase ring-0 text-ink">Draft</Badge>
                    </CardContent>
                  </Card>
                </div>
                <Button variant="primary" className="mt-7" onClick={closeAndReset}>
                  <Sparkles className="size-4" /> Done
                </Button>
              </div>
            ) : (
              <>
                <div className="px-6 pt-4">
                  <div className="flex items-center gap-1.5 overflow-x-auto py-2">
                    {STEP_LABELS.map((s, i) => (
                      <div key={s} className="flex items-center gap-1.5 shrink-0">
                        <div className={cn(
                          "grid size-8 place-items-center rounded-full text-[11px] font-extrabold",
                          i < stepIdx ? "bg-mint/35 text-ink" : i === stepIdx ? "bg-coral text-white" : "bg-cream text-ink/55",
                        )}>
                          {i < stepIdx ? <Check className="size-3.5" /> : i + 1}
                        </div>
                        <span className={cn("text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap", i <= stepIdx ? "text-ink" : "text-ink/40")}>
                          {s}
                        </span>
                        {i < STEP_LABELS.length - 1 && <ChevronRight className="size-3 text-ink/30 mx-0.5" />}
                      </div>
                    ))}
                  </div>
                  <Separator className="mt-2" />
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                  {stepIdx === 0 && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2 space-y-2">
                          <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Competition name</Label>
                          <Input placeholder="e.g. 2026 Mercedes-Benz C-Class Grand Prize" className="h-11 rounded-2xl border-0 bg-cream px-4 text-sm font-bold text-ink placeholder:text-ink/40 focus-visible:ring-coral" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">URL slug</Label>
                          <Input placeholder="mercedes-c-class-2026" className="h-11 rounded-2xl border-0 bg-cream px-4 text-sm font-bold text-ink placeholder:text-ink/40 focus-visible:ring-coral" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Category</Label>
                          <Select defaultValue="auto">
                            <SelectTrigger className="h-11 rounded-2xl bg-cream px-4 text-sm font-extrabold text-ink shadow-none ring-1 ring-ink/10 focus:ring-coral">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-[22px] bg-paper p-1">
                              {CATEGORIES.map((c) => <SelectItem key={c} value={c.toLowerCase()} className="rounded-xl font-bold">{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="sm:col-span-2 space-y-2">
                          <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Description</Label>
                          <Textarea rows={4} placeholder="Rich description shown on the competition landing page…" className="rounded-2xl border-0 bg-cream p-4 text-sm font-bold text-ink placeholder:text-ink/40 focus-visible:ring-coral" />
                        </div>
                      </div>
                    </>
                  )}
                  {stepIdx === 1 && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2 space-y-2">
                          <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Asset / prize name</Label>
                          <Input placeholder="Mercedes-Benz C-Class 2025 · brand new, full warranty" className="h-11 rounded-2xl border-0 bg-cream px-4 text-sm font-bold text-ink placeholder:text-ink/40 focus-visible:ring-coral" />
                        </div>
                        <div className="sm:col-span-2 space-y-2">
                          <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Image URLs (comma-separated)</Label>
                          <Textarea rows={2} placeholder="https://cdn.rafilla.ng/asset1.jpg, https://cdn.rafilla.ng/asset2.jpg" className="rounded-2xl border-0 bg-cream p-4 text-sm font-bold text-ink placeholder:text-ink/40 focus-visible:ring-coral" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Market value (₦)</Label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-ink/55">₦</span>
                            <Input type="number" placeholder="12,000,000" className="h-11 rounded-2xl border-0 bg-cream pl-8 pr-4 text-base font-extrabold text-ink placeholder:text-ink/40 focus-visible:ring-coral" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Asset condition</Label>
                          <Select defaultValue="new">
                            <SelectTrigger className="h-11 rounded-2xl bg-cream px-4 text-sm font-extrabold text-ink shadow-none ring-1 ring-ink/10 focus:ring-coral">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-[22px] bg-paper p-1">
                              <SelectItem value="new" className="rounded-xl font-bold">Brand new</SelectItem>
                              <SelectItem value="likenew" className="rounded-xl font-bold">Like new</SelectItem>
                              <SelectItem value="refurbished" className="rounded-xl font-bold">Certified refurbished</SelectItem>
                              <SelectItem value="used" className="rounded-xl font-bold">Used / verified</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="sm:col-span-2 space-y-2">
                          <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Partner</Label>
                          <Select defaultValue={PARTNERS[0]!.toLowerCase().replace(/[^a-z]/g, "")}>
                            <SelectTrigger className="h-11 rounded-2xl bg-cream px-4 text-sm font-extrabold text-ink shadow-none ring-1 ring-ink/10 focus:ring-coral">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-[22px] bg-paper p-1">
                              {PARTNERS.map((p) => <SelectItem key={p} value={p.toLowerCase().replace(/[^a-z]/g, "")} className="rounded-xl font-bold">{p}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}
                  {stepIdx === 2 && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Ticket price (₦)</Label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-ink/55">₦</span>
                            <Input type="number" defaultValue="10000" className="h-11 rounded-2xl border-0 bg-cream pl-8 pr-4 text-base font-extrabold text-ink placeholder:text-ink/40 focus-visible:ring-coral" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Max total entries</Label>
                          <Input type="number" defaultValue="5000" className="h-11 rounded-2xl border-0 bg-cream px-4 text-base font-extrabold text-ink focus-visible:ring-coral" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Max entries per user</Label>
                          <Input type="number" defaultValue="200" className="h-11 rounded-2xl border-0 bg-cream px-4 text-base font-extrabold text-ink focus-visible:ring-coral" />
                        </div>
                      </div>
                    </>
                  )}
                  {stepIdx === 3 && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Start date</Label>
                          <Input type="datetime-local" defaultValue="2026-04-01T09:00" className="h-11 rounded-2xl border-0 bg-cream px-4 text-sm font-bold text-ink focus-visible:ring-coral" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Draw date</Label>
                          <Input type="datetime-local" defaultValue="2026-06-18T21:00" className="h-11 rounded-2xl border-0 bg-cream px-4 text-sm font-bold text-ink focus-visible:ring-coral" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink/45">Live push delay (mins)</Label>
                          <Input type="number" defaultValue="60" className="h-11 rounded-2xl border-0 bg-cream px-4 text-base font-extrabold text-ink focus-visible:ring-coral" />
                        </div>
                      </div>
                    </>
                  )}
                  {stepIdx === 4 && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3">
                          <div>
                            <p className="text-sm font-extrabold text-ink">Featured competition</p>
                            <p className="text-xs font-bold text-ink/55">Pin to the top of the home page and featured carousel.</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3">
                          <div>
                            <p className="text-sm font-extrabold text-ink">Public results</p>
                            <p className="text-xs font-bold text-ink/55">Publish draw results and winner identity publicly.</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </>
                  )}
                  {stepIdx === 5 && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Card className="rounded-2xl border-0 bg-cream p-0 ring-1 ring-ink/5">
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">Basics</p>
                              <Badge className="rounded-full bg-mint/35 px-2 py-0.5 text-[9px] font-extrabold ring-0 text-ink">OK</Badge>
                            </div>
                            <p className="text-sm font-extrabold text-ink">2026 Mercedes-Benz C-Class</p>
                            <p className="text-[11px] font-bold text-ink/55">Auto · slug: mercedes-c-class-2026</p>
                          </CardContent>
                        </Card>
                        <Card className="rounded-2xl border-0 bg-cream p-0 ring-1 ring-ink/5">
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">Asset</p>
                              <Badge className="rounded-full bg-mint/35 px-2 py-0.5 text-[9px] font-extrabold ring-0 text-ink">OK</Badge>
                            </div>
                            <p className="text-sm font-extrabold text-ink">{formatNaira(1200000000)} · Brand new</p>
                            <p className="text-[11px] font-bold text-ink/55">Lux Wheels Ltd · partner split 48%</p>
                          </CardContent>
                        </Card>
                        <Card className="rounded-2xl border-0 bg-cream p-0 ring-1 ring-ink/5">
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">Entry config</p>
                              <Badge className="rounded-full bg-mint/35 px-2 py-0.5 text-[9px] font-extrabold ring-0 text-ink">OK</Badge>
                            </div>
                            <p className="text-sm font-extrabold text-ink">{formatNaira(1000000)} per ticket</p>
                            <p className="text-[11px] font-bold text-ink/55">5,000 total · 200 max per user</p>
                          </CardContent>
                        </Card>
                        <Card className="rounded-2xl border-0 bg-cream p-0 ring-1 ring-ink/5">
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink/45">Schedule</p>
                              <Badge className="rounded-full bg-mint/35 px-2 py-0.5 text-[9px] font-extrabold ring-0 text-ink">OK</Badge>
                            </div>
                            <p className="text-sm font-extrabold text-ink">Draw · 2026-06-18 21:00</p>
                            <p className="text-[11px] font-bold text-ink/55">Live delay 60 mins · featured + public results</p>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  )}
                </div>

                <DialogFooter className="border-t border-ink/10 px-6 py-4 flex-wrap">
                  <Button variant="outline" onClick={prevStep} disabled={stepIdx === 0}>Back</Button>
                  <div className="flex-1" />
                  <Button variant="ghost" onClick={submitDraft}>Save as draft</Button>
                  {stepIdx < STEP_LABELS.length - 1 ? (
                    <Button variant="primary" onClick={nextStep}>Continue <ChevronRight className="size-4" /></Button>
                  ) : (
                    <Button variant="primary" onClick={submitDraft}>Create competition <Sparkles className="size-4" /></Button>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </header>

      <Card className="rounded-[28px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <Tabs value={tab} onValueChange={setTab} className="w-auto">
              <TabsList className="rounded-full bg-cream p-1">
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
                    className="rounded-full px-4 py-1.5 text-xs font-extrabold data-[state=active]:bg-paper data-[state=active]:text-ink data-[state=active]:shadow-sm data-[state=inactive]:text-ink/60"
                  >
                    {t.l}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
                <Input
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-56 rounded-full border-0 bg-cream pl-9 pr-4 text-xs font-bold text-ink placeholder:text-ink/40 focus-visible:ring-coral"
                />
              </div>
              <div className="flex items-center rounded-full bg-cream p-0.5 ring-1 ring-ink/10">
                <Button variant="ghost" size="icon" className={cn("size-9 rounded-full", view === "grid" && "bg-paper text-ink shadow-sm")} onClick={() => setView("grid")}>
                  <LayoutGrid className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className={cn("size-9 rounded-full", view === "list" && "bg-paper text-ink shadow-sm")} onClick={() => setView("list")}>
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
                  <Card key={c.id} className="group rounded-[26px] border-0 bg-paper p-0 ring-1 ring-ink/5 shadow-none overflow-hidden">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img src={c.image} alt={`${c.name} prize`} className="size-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute left-3 top-3 flex items-center gap-1.5">
                        <Badge className={cn("rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-0", statusTone[c.status])}>
                          {c.status}
                        </Badge>
                        <Badge className="rounded-full bg-paper/90 px-2.5 py-1 text-[10px] font-extrabold text-ink ring-0 backdrop-blur">
                          {c.category}
                        </Badge>
                      </div>
                      <div className="absolute right-3 top-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 rounded-full bg-paper/90 backdrop-blur text-ink">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-[22px] bg-paper p-1.5">
                            <DropdownMenuItem className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-ink/75 focus:bg-lilac/20 focus:text-ink"><EyeIcon className="mr-2 size-4" />View</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl cursor-pointer px-3 py-2 text-sm font-bold text-ink/75 focus:bg-lilac/20 focus:text-ink"><Pencil className="mr-2 size-4" />Edit</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardContent className="p-5 space-y-3">
                      <h3 className="font-display text-lg font-extrabold text-ink leading-tight line-clamp-2 min-h-[3.25rem]">{c.name}</h3>
                      <div className="flex items-center justify-between text-[11px] font-extrabold">
                        <span className="text-ink/60 flex items-center gap-1"><Clock className="size-3" />Draw {c.drawDate}</span>
                        <span className="text-ink whitespace-nowrap">{formatNaira(c.ticketPrice)}</span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5 text-[11px] font-extrabold text-ink/60">
                          <span>Entries</span>
                          <span>{c.entriesSold.toLocaleString("en-NG")} / {c.totalEntries.toLocaleString("en-NG")} · {pct}%</span>
                        </div>
                        <Progress value={pct} className="h-2 rounded-full bg-cream [&>div]:bg-coral [&>div]:rounded-full" />
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Button variant="outline" size="sm"><Pencil className="size-3.5" />Edit</Button>
                        <Button variant="outline" size="sm"><Ticket className="size-3.5" />Manage entries</Button>
                        {c.status === "LIVE" && full && (
                          <Button variant="primary" size="sm"><PlayCircle className="size-3.5" />Draw now</Button>
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
                    <TableHead className="py-3 text-right font-extrabold text-ink/65">Entries %</TableHead>
                    <TableHead className="py-3 text-right font-extrabold text-ink/65">Ticket</TableHead>
                    <TableHead className="py-3 font-extrabold text-ink/65">Status</TableHead>
                    <TableHead className="py-3 font-extrabold text-ink/65">Draw date</TableHead>
                    <TableHead className="py-3 text-right font-extrabold text-ink/65">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="[&_tr]:border-ink/10">
                  {filtered.map((c) => {
                    const pct = Math.min(100, Math.round((c.entriesSold / c.totalEntries) * 100));
                    const full = pct >= 100;
                    return (
                      <TableRow key={c.id} className="hover:bg-lilac/10">
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <img src={c.image} alt="" aria-hidden="true" className="size-11 rounded-2xl object-cover ring-2 ring-paper" />
                            <div className="min-w-0 max-w-[260px]">
                              <p className="truncate text-sm font-extrabold text-ink">{c.name}</p>
                              <p className="truncate text-[11px] font-bold text-ink/50">{c.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-xs font-bold text-ink/70">{c.category}</TableCell>
                        <TableCell className="py-3 text-xs font-bold text-ink/70">{c.partner}</TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-2 w-28 overflow-hidden rounded-full bg-cream">
                              <div className="h-full bg-coral" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[11px] font-extrabold text-ink/65 w-10 text-right">{pct}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-right text-xs font-extrabold text-ink whitespace-nowrap">{formatNaira(c.ticketPrice)}</TableCell>
                        <TableCell className="py-3">
                          <Badge className={cn("rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ring-0", statusTone[c.status])}>
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 text-xs font-bold text-ink/65 whitespace-nowrap">{c.drawDate}</TableCell>
                        <TableCell className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="size-8 text-ink/70"><EyeIcon className="size-4" /></Button>
                            <Button variant="ghost" size="icon" className="size-8 text-ink/70"><Pencil className="size-4" /></Button>
                            {c.status === "LIVE" && full && (
                              <Button variant="primary" size="sm"><PlayCircle className="size-3.5" />Draw</Button>
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
    </AdminShell>
  );
}
