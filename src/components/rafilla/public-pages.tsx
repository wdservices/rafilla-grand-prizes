import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Filter,
  Grid2X2,
  Home,
  Instagram,
  LayoutList,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  PlayCircle,
  Search,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Ticket,
  WalletCards,
  X,
  Award,
  Globe,
  Check,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { toast } from "sonner";

import { CompetitionCard } from "@/components/rafilla/competition-card";
import { WinnerCard } from "@/components/rafilla/winner-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { TicketPurchaseModal } from "@/components/rafilla/purchase";
import { WinnersPagePolished } from "@/components/rafilla/draws";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Progress } from "@/components/ui/progress";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  competitions,
  categories,
  partners,
  featuredCompetition,
  formatNaira,
  getCompetition,
  getProgress,
  faqs,
  competitionFaqs,
  winnerCards,
  type Competition,
  applySort,
  type SortKey,
} from "@/lib/rafilla-data";
import { HeroFeaturedCarousel } from "@/components/rafilla/hero-carousel";
import { cn, formatNaira as formatNairaKobo } from "@/lib/utils";
import { useCountdownDays } from "@/hooks/useCountdown";

export function HomePage() {
  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 sm:pt-12 lg:px-8 lg:pb-12">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="coral">
            <span className="size-2 rounded-full bg-coral" /> Featured prize
          </Pill>
          <Pill>
            <BadgeCheck className="size-3.5 text-mint" /> Verifiable draw
          </Pill>
        </div>
        <h1 className="raf-rise mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[0.92] tracking-tight text-ink sm:text-5xl lg:text-6xl">
          Big prizes.
          <br />
          <span className="text-coral">Fair chances.</span>
        </h1>
        <div className="mt-5 flex max-w-2xl flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-xl text-base leading-relaxed text-ink/65 sm:text-lg">
            Pick a premium prize, secure your entries, and follow the journey to the draw.
          </p>
          <div className="flex shrink-0 items-center gap-2 text-xs font-extrabold text-ink/50">
            <span className="grid size-8 place-items-center rounded-full bg-mint/40 text-ink">
              ₦
            </span>{" "}
            Built for Nigeria
          </div>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start">
          <HeroFeaturedCarousel />
          <div className="hidden space-y-4 lg:block">
            <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                Why Rafilla
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <TrustItem
                  icon={<ShieldCheck />}
                  title="Clear by design"
                  text="Prize, entry price, and availability are always visible."
                />
                <TrustItem
                  icon={<BadgeCheck />}
                  title="Fair at the core"
                  text="Draw verification is part of the experience, not an afterthought."
                />
                <TrustItem
                  icon={<WalletCards />}
                  title="Secure payments"
                  text="Your wallet and purchase history stay easy to follow."
                />
                <TrustItem
                  icon={<Sparkles />}
                  title="Premium prizes"
                  text="Curated assets worth making room for in your life."
                />
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-[28px] bg-lemon/40 p-6 ring-1 ring-ink/5">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-paper text-coral shadow-sm">
                <Sparkles className="size-5" />
              </span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/50">
                  Current reward pool
                </p>
                <p className="mt-1 font-display text-3xl font-extrabold text-ink">₦48,210,000</p>
              </div>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-mint/40 px-2.5 py-1 text-[11px] font-extrabold text-ink">
                <span className="size-1.5 rounded-full bg-mint" /> Live
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <SectionHeading
          eyebrow="Curated for you"
          title="Live competitions"
          linkLabel="See all competitions"
          linkTo="/competitions"
        />
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <CompetitionCard competition={competitions[1]!} />
          <CompetitionCard competition={competitions[2]!} />
          <div className="hidden lg:block">
            <CompetitionCard competition={competitions[0]!} />
          </div>
        </div>
      </section>

      <HowItWorksPreview />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 sm:p-8 lg:flex lg:items-center lg:justify-between lg:p-10">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink/45">
              For asset owners
            </p>
            <h2 className="mt-2 max-w-lg font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Have a premium asset to list?
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink/60">
              Partner with Rafilla and put your product in front of people looking for something
              extraordinary.
            </p>
          </div>
          <Button asChild variant="dark" size="lg" className="mt-6 lg:mt-0">
            <Link to="/become-a-partner">
              Become a partner <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink/45">
              Winners circle
            </p>
            <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Recent winners
            </h2>
            <p className="mt-2 text-base text-ink/60">Congratulations to our verified winners</p>
          </div>
          <Button asChild variant="outline" size="md" className="mt-4 sm:mt-0">
            <Link to="/winners">
              View all winners <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {winnerCards.slice(0, 3).map((winner) => (
            <WinnerCard key={winner.id} winner={winner} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink/45">
            Quick answers
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-base text-ink/60">Quick answers before you enter</p>
        </div>
        <div className="mt-10 space-y-3">
          {faqs.slice(0, 5).map((faq, index) => (
            <FAQAccordionItem key={faq.q} faq={faq} defaultOpen={index === 0} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="ghost" size="md">
            <Link to="/faq">
              See all FAQs <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="rounded-[28px] bg-ink p-8 text-cream sm:p-10 lg:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Your next big win could start today
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-cream/70 sm:text-lg">
              A few taps to enter, a fair verified draw, a life-changing prize.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
              <Button
                asChild
                variant="primary"
                size="lg"
                className="bg-cream text-ink hover:bg-cream/90 shadow-[0_8px_20px_-8px_rgba(255,252,245,0.4)]"
              >
                <Link to="/competitions">
                  Browse competitions <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-cream/30 bg-transparent text-cream hover:bg-cream/10 hover:text-cream"
              >
                <Link to="/become-a-partner">Become a partner</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FAQAccordionItem({
  faq,
  defaultOpen = false,
}: {
  faq: { q: string; a: string };
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="group rounded-[22px] bg-paper p-5 ring-1 ring-ink/5">
      <button
        onClick={() => setOpen((current) => !current)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
        aria-expanded={open}
      >
        <span className="font-display text-lg font-extrabold text-ink">{faq.q}</span>
        <ChevronDown
          className={`size-5 shrink-0 text-coral transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-200 ${open ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="min-h-0">
          <p className="max-w-2xl text-sm leading-relaxed text-ink/60">{faq.a}</p>
        </div>
      </div>
    </div>
  );
}

type StatusKey = "all" | "live" | "starting-soon" | "ending-soon" | "completed";

export type CompetitionsFilterState = {
  query: string;
  category: string;
  sort: SortKey;
  status: StatusKey;
  priceMinKobo: number;
  priceMaxKobo: number;
  partners: string[];
  view: "grid" | "list";
  page: number;
};

const priceMinBoundKobo = 100 * 100;
const priceMaxBoundKobo = 100_000 * 100;
const pageSize = 8;

export function CompetitionsFilterBar({
  state,
  setState,
  totalCount,
  filteredCount,
}: {
  state: CompetitionsFilterState;
  setState: React.Dispatch<React.SetStateAction<CompetitionsFilterState>>;
  totalCount: number;
  filteredCount: number;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const activeCount = useMemo(() => {
    let n = 0;
    if (state.query.trim()) n++;
    if (state.category !== "All") n++;
    if (state.status !== "all") n++;
    if (state.partners.length > 0) n++;
    if (state.priceMinKobo !== priceMinBoundKobo || state.priceMaxKobo !== priceMaxBoundKobo) n++;
    return n;
  }, [state]);
  const clearAll = () =>
    setState({
      query: "",
      category: "All",
      sort: "ending-soon",
      status: "all",
      priceMinKobo: priceMinBoundKobo,
      priceMaxKobo: priceMaxBoundKobo,
      partners: [],
      view: state.view,
      page: 1,
    });
  return (
    <div className="mt-8 space-y-5 rounded-[28px] bg-paper p-4 ring-1 ring-ink/5 sm:p-6">
      <div className="flex flex-col gap-3">
        <label className="flex min-h-12 items-center gap-3 rounded-full bg-cream px-4 shadow-sm ring-1 ring-ink/5 focus-within:ring-2 focus-within:ring-coral/60">
          <Search className="size-4 shrink-0 text-ink/40" />
          <span className="sr-only">Search competitions</span>
          <input
            value={state.query}
            onChange={(event) =>
              setState((s) => ({ ...s, query: event.target.value, page: 1 }))
            }
            placeholder="Search competitions, prizes, partners…"
            className="w-full bg-transparent py-3 text-sm font-bold text-ink outline-none placeholder:text-ink/40"
          />
          {state.query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setState((s) => ({ ...s, query: "", page: 1 }))}
              className="grid size-6 place-items-center rounded-full bg-ink/10 text-ink/50 hover:bg-ink/20"
            >
              <X className="size-3.5" />
            </button>
          )}
        </label>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative -mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-paper to-transparent lg:hidden" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-paper to-transparent lg:hidden" />
            <div className="flex shrink-0 items-center gap-2 py-1">
              {categories.map((cat) => {
                const active = state.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      setState((s) => ({ ...s, category: cat, page: 1 }))
                    }
                    className={cn(
                      "shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition-transform hover:-translate-y-px",
                      active
                        ? "bg-coral text-paper shadow-[0_8px_20px_-8px_var(--coral)]"
                        : "bg-paper text-ink ring-1 ring-ink/10 hover:bg-lilac/15",
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Select
              value={state.sort}
              onValueChange={(v) =>
                setState((s) => ({ ...s, sort: v as SortKey, page: 1 }))
              }
            >
              <SelectTrigger className="h-11 w-[180px] rounded-full border-0 bg-lilac/20 px-4 text-xs font-extrabold text-ink ring-1 ring-ink/10 focus:ring-coral/60">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-0 bg-paper p-1 font-body shadow-lg ring-1 ring-ink/10">
                <SelectItem value="ending-soon" className="rounded-xl text-xs font-bold">Ending soon</SelectItem>
                <SelectItem value="newest" className="rounded-xl text-xs font-bold">Newest</SelectItem>
                <SelectItem value="price-asc" className="rounded-xl text-xs font-bold">Price: Low to high</SelectItem>
                <SelectItem value="price-desc" className="rounded-xl text-xs font-bold">Price: High to low</SelectItem>
                <SelectItem value="most-entries" className="rounded-xl text-xs font-bold">Most entries</SelectItem>
                <SelectItem value="featured-first" className="rounded-xl text-xs font-bold">Featured first</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={state.status}
              onValueChange={(v) =>
                setState((s) => ({ ...s, status: v as StatusKey, page: 1 }))
              }
            >
              <SelectTrigger className="h-11 w-[180px] rounded-full border-0 bg-mint/25 px-4 text-xs font-extrabold text-ink ring-1 ring-ink/10 focus:ring-coral/60">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-0 bg-paper p-1 font-body shadow-lg ring-1 ring-ink/10">
                <SelectItem value="all" className="rounded-xl text-xs font-bold">All</SelectItem>
                <SelectItem value="live" className="rounded-xl text-xs font-bold">Live now</SelectItem>
                <SelectItem value="starting-soon" className="rounded-xl text-xs font-bold">Starting soon</SelectItem>
                <SelectItem value="ending-soon" className="rounded-xl text-xs font-bold">Ending soon (≤7d)</SelectItem>
                <SelectItem value="completed" className="rounded-xl text-xs font-bold">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <Separator className="bg-ink/10" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="inline-flex items-center gap-2 text-xs font-extrabold text-ink/65 hover:text-ink"
        >
          <Filter className="size-4 text-coral" />
          {showAdvanced ? "Hide advanced filters" : "Show advanced filters"}
        </button>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-cream p-1 ring-1 ring-ink/10">
          <button
            type="button"
            onClick={() => setState((s) => ({ ...s, view: "grid" }))}
            aria-label="Grid view"
            className={cn(
              "grid size-9 place-items-center rounded-full transition-colors",
              state.view === "grid" ? "bg-coral text-paper shadow-sm" : "text-ink/55 hover:bg-paper",
            )}
          >
            <Grid2X2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setState((s) => ({ ...s, view: "list" }))}
            aria-label="List view"
            className={cn(
              "grid size-9 place-items-center rounded-full transition-colors",
              state.view === "list" ? "bg-coral text-paper shadow-sm" : "text-ink/55 hover:bg-paper",
            )}
          >
            <LayoutList className="size-4" />
          </button>
        </div>
      </div>
      {showAdvanced && (
        <div className="space-y-5 rounded-[22px] bg-cream/60 p-4 ring-1 ring-ink/5 sm:p-5">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                  Entry price range
                </p>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="rounded-full bg-lilac/30 px-3 py-1 text-ink">
                    {formatNaira(state.priceMinKobo)}
                  </span>
                  <span className="text-ink/40">—</span>
                  <span className="rounded-full bg-lemon/40 px-3 py-1 text-ink">
                    {formatNaira(state.priceMaxKobo)}
                  </span>
                </div>
              </div>
              <div className="px-2">
                <Slider
                  min={priceMinBoundKobo}
                  max={priceMaxBoundKobo}
                  step={100 * 100}
                  value={[state.priceMinKobo, state.priceMaxKobo]}
                  onValueChange={([min = priceMinBoundKobo, max = priceMaxBoundKobo]) =>
                    setState((s) => ({
                      ...s,
                      priceMinKobo: min,
                      priceMaxKobo: max,
                      page: 1,
                    }))
                  }
                  className="[&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:border-coral [&_[role=slider]]:bg-paper [&_[role=slider]]:shadow [&_[type=range]]:h-2"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-ink/40">
                <span>{formatNaira(priceMinBoundKobo)}</span>
                <span>{formatNaira(priceMaxBoundKobo)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                Partners
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {partners.map((partner) => (
                  <label
                    key={partner}
                    className="flex items-center gap-2.5 rounded-full bg-paper px-3 py-2 text-xs font-bold text-ink ring-1 ring-ink/10 cursor-pointer hover:bg-lilac/15"
                  >
                    <Checkbox
                      checked={state.partners.includes(partner)}
                      onCheckedChange={(checked) =>
                        setState((s) => {
                          const set = new Set(s.partners);
                          if (checked) set.add(partner);
                          else set.delete(partner);
                          return { ...s, partners: Array.from(set), page: 1 };
                        })
                      }
                      className="border-coral/50 data-[state=checked]:bg-coral data-[state=checked]:text-paper data-[state=checked]:border-coral"
                    />
                    {partner}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="h-7 rounded-full border-coral/20 bg-coral/10 px-3 text-[11px] font-extrabold text-coral"
          >
            Showing {filteredCount} of {totalCount} competitions
          </Badge>
          {activeCount > 0 && (
            <>
              {state.category !== "All" && (
                <button
                  type="button"
                  onClick={() =>
                    setState((s) => ({ ...s, category: "All", page: 1 }))
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-sky/15 px-3 py-1 text-[11px] font-extrabold text-ink ring-1 ring-ink/10 hover:bg-sky/25"
                >
                  ✕ {state.category}
                </button>
              )}
              {state.status !== "all" && (
                <button
                  type="button"
                  onClick={() => setState((s) => ({ ...s, status: "all", page: 1 }))}
                  className="inline-flex items-center gap-1.5 rounded-full bg-mint/25 px-3 py-1 text-[11px] font-extrabold text-ink ring-1 ring-ink/10 hover:bg-mint/40"
                >
                  ✕{" "}
                  {
                    {
                      live: "Live now",
                      "starting-soon": "Starting soon",
                      "ending-soon": "Ending soon",
                      completed: "Completed",
                      all: "All",
                    }[state.status]
                  }
                </button>
              )}
              {state.partners.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      partners: s.partners.filter((x) => x !== p),
                      page: 1,
                    }))
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-lemon/30 px-3 py-1 text-[11px] font-extrabold text-ink ring-1 ring-ink/10 hover:bg-lemon/50"
                >
                  ✕ {p}
                </button>
              ))}
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-[11px] font-extrabold text-ink/65 ring-1 ring-ink/10 hover:bg-cream hover:text-ink"
                >
                  Clear all
                </button>
              )}
            </>
          )}
        </div>
        <span className="hidden items-center gap-1.5 text-xs font-extrabold text-ink/50 sm:inline-flex">
          <Clock3 className="size-3.5" /> Updated for preview
        </span>
      </div>
    </div>
  );
}

export function CompetitionsPage() {
  const [state, setState] = useState<CompetitionsFilterState>({
    query: "",
    category: "All",
    sort: "ending-soon",
    status: "all",
    priceMinKobo: priceMinBoundKobo,
    priceMaxKobo: priceMaxBoundKobo,
    partners: [],
    view: "grid",
    page: 1,
  });
  const filtered = useMemo(() => {
    const q = state.query.trim().toLowerCase();
    const list = competitions.filter((c) => {
      if (state.category !== "All" && c.category !== state.category) return false;
      if (q) {
        const hay = `${c.title} ${c.description} ${c.partner} ${c.category} ${c.specs.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (c.entryPrice < state.priceMinKobo || c.entryPrice > state.priceMaxKobo) return false;
      if (state.partners.length > 0 && !state.partners.includes(c.partner)) return false;
      switch (state.status) {
        case "live":
          if (c.status !== "LIVE") return false;
          break;
        case "starting-soon":
          if (c.status !== "UPCOMING") return false;
          break;
        case "ending-soon":
          if (c.daysUntilClose > 7) return false;
          break;
        case "completed":
          if (c.status !== "COMPLETED") return false;
          break;
      }
      return true;
    });
    return applySort(list, state.sort);
  }, [state]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(state.page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
      <PageIntro
        eyebrow="The marketplace"
        title="Choose your next possibility."
        text="Premium prizes, straightforward entries, and a competition journey you can actually follow."
      />
      <CompetitionsFilterBar
        state={state}
        setState={setState}
        totalCount={competitions.length}
        filteredCount={filtered.length}
      />
      {filtered.length === 0 ? (
        <div className="mt-10">
          <Card className="overflow-hidden rounded-[28px] border-0 bg-paper p-8 text-center shadow-sm ring-1 ring-ink/5 sm:p-12">
            <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-lemon/40 text-coral">
              <Search className="size-7" />
            </div>
            <h2 className="mt-6 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              No competitions match your filters
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink/60">
              Try removing a category, widening the entry-price range, or clearing a partner filter.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
              <Button
                variant="primary"
                size="md"
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    query: "",
                    category: "All",
                    status: "all",
                    partners: [],
                    priceMinKobo: priceMinBoundKobo,
                    priceMaxKobo: priceMaxBoundKobo,
                    page: 1,
                  }))
                }
              >
                Clear filters
              </Button>
              <Button
                asChild
                variant="outline"
                size="md"
              >
                <Link to="/competitions">Reset page</Link>
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <>
          <div
            className={cn(
              "mt-8 gap-4",
              state.view === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3" : "flex flex-col",
            )}
          >
            {paged.map((competition) => (
              <CompetitionCard
                key={competition.slug}
                competition={competition}
                variant={state.view}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-10">
              <Pagination>
                <PaginationContent className="gap-1">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      size="sm"
                      onClick={(event) => {
                        event.preventDefault();
                        setState((s) => ({ ...s, page: Math.max(1, s.page - 1) }));
                      }}
                      className={cn(
                        "h-10 rounded-full text-xs font-extrabold",
                        safePage <= 1 ? "pointer-events-none opacity-40" : "",
                      )}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    const show = page === 1 || page === totalPages || Math.abs(page - safePage) <= 1;
                    const needsEllipsisBefore =
                      i > 0 && page === 2 && Math.abs(1 - safePage) > 1;
                    const needsEllipsisAfter =
                      page === totalPages - 1 && Math.abs(totalPages - safePage) > 1;
                    return (
                      <div key={page} className="contents">
                        {needsEllipsisBefore && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        {show && (
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              size="sm"
                              isActive={page === safePage}
                              onClick={(event) => {
                                event.preventDefault();
                                setState((s) => ({ ...s, page }));
                              }}
                              className="h-10 w-10 rounded-full text-xs font-extrabold"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )}
                        {needsEllipsisAfter && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                      </div>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      size="sm"
                      onClick={(event) => {
                        event.preventDefault();
                        setState((s) => ({ ...s, page: Math.min(totalPages, s.page + 1) }));
                      }}
                      className={cn(
                        "h-10 rounded-full text-xs font-extrabold",
                        safePage >= totalPages ? "pointer-events-none opacity-40" : "",
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  const str = value.toString().padStart(2, "0");
  return (
    <div className="grid place-items-center min-w-[52px]">
      <div className="rounded-xl bg-paper px-2.5 py-1.5 ring-1 ring-ink/10">
        <span className="font-display text-lg font-extrabold text-ink tabular-nums">{str}</span>
      </div>
      <span className="mt-1 text-[10px] font-extrabold uppercase tracking-wider text-ink/45">
        {label}
      </span>
    </div>
  );
}

function LiveCountdownPill({ competition }: { competition: Competition }) {
  const { d, h, m, s } = useCountdownDays(Math.max(1, competition.daysUntilClose));
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-coral/15 px-3 py-1.5 ring-1 ring-coral/25">
      <span className="relative flex size-2 items-center justify-center">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-coral/60 opacity-70" />
        <span className="relative inline-flex size-2 rounded-full bg-coral" />
      </span>
      <span className="text-[11px] font-extrabold text-ink">
        Live · {d}d {h.toString().padStart(2, "0")}:
        {m.toString().padStart(2, "0")}:{s.toString().padStart(2, "0")}
      </span>
    </div>
  );
}

export function CompetitionDetailPage() {
  const { slug } = useParams({ from: "/competitions/$slug" });
  const [modalOpen, setModalOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const competition = getCompetition(slug);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) setShowStickyBar(true);
          else setShowStickyBar(false);
        });
      },
      { root: null, threshold: 0, rootMargin: "-80px 0px 0px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [slug]);
  if (!competition)
    return (
      <MissingPage
        title="Competition unavailable"
        text="This competition may have moved or is not available in the current preview."
      />
    );
  const progress = getProgress(competition);
  const ticketsLeft = competition.totalEntries - competition.entriesSold;
  const cd = useCountdownDays(Math.max(1, competition.daysUntilClose));
  const related = useMemo(() => {
    return competitions
      .filter((c) => c.slug !== competition.slug)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
  }, [competition.slug]);
  const partnerCompetitions = useMemo(
    () => competitions.filter((c) => c.partner === competition.partner && c.slug !== competition.slug).slice(0, 3),
    [competition.partner, competition.slug],
  );
  const initials = competition.partner
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <>
      <div
        className={cn(
          "sticky top-[72px] md:top-[64px] z-40 w-full border-b border-ink/10 bg-cream/95 backdrop-blur transition-all duration-300",
          showStickyBar ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0 pointer-events-none",
        )}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-extrabold text-ink sm:text-base">
              {competition.title}
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              <LiveCountdownPill competition={competition} />
              <span className="hidden text-[11px] font-bold text-ink/55 sm:inline-flex">
                <Ticket className="mr-1 size-3" /> {ticketsLeft.toLocaleString("en-NG")} tickets left
              </span>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="shrink-0"
          >
            <Ticket className="size-3.5" /> Enter draw
          </Button>
        </div>
      </div>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
        <Breadcrumb className="whitespace-nowrap">
          <BreadcrumbList className="overflow-hidden">
            <BreadcrumbItem className="shrink-0">
              <BreadcrumbLink asChild>
                <Link to="/" className="text-xs font-bold text-ink/55 hover:text-ink">
                  <Home className="mr-1 inline size-3.5" />
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="size-3.5 text-ink/35" />
            </BreadcrumbSeparator>
            <BreadcrumbItem className="shrink-0">
              <BreadcrumbLink asChild>
                <Link to="/competitions" className="text-xs font-bold text-ink/55 hover:text-ink">
                  Competitions
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="size-3.5 text-ink/35" />
            </BreadcrumbSeparator>
            <BreadcrumbItem className="shrink-0">
              <span className="text-xs font-bold text-ink/55">{competition.category}</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="size-3.5 text-ink/35" />
            </BreadcrumbSeparator>
            <BreadcrumbItem className="min-w-0 max-w-[180px] sm:max-w-[320px]">
              <BreadcrumbPage className="block truncate whitespace-nowrap overflow-hidden text-ellipsis text-xs font-extrabold text-ink">
                {competition.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div ref={heroRef} className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="overflow-hidden rounded-[28px] bg-lilac/30 p-3 ring-1 ring-ink/5">
            <img
              src={competition.image}
              alt={`${competition.title} prize`}
              width={1200}
              height={760}
              className="aspect-[4/3] w-full rounded-[22px] object-cover"
            />
          </div>
          <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Pill {...(competition.accent === "coral" ? { tone: "coral" } : {})}>
                {competition.category}
              </Pill>
              <Badge className="h-6 rounded-full bg-mint/30 px-3 text-[11px] font-extrabold text-ink ring-0">
                {competition.status}
              </Badge>
              <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-extrabold text-ink/55">
                <BadgeCheck className="size-3.5 text-mint" /> By {competition.partner}
              </span>
            </div>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
              {competition.title}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-ink/60">{competition.description}</p>
            <div className="mt-7 grid grid-cols-2 gap-4 border-y border-ink/10 py-5">
              <div>
                <p className="text-xs font-bold text-ink/45">Entry price</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-ink">
                  {formatNaira(competition.entryPrice)}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-ink/45">Prize value</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-ink">
                  {formatNaira(competition.prizeValueKobo)}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="text-ink/55">
                  {competition.entriesSold.toLocaleString("en-NG")} of{" "}
                  {competition.totalEntries.toLocaleString("en-NG")} entries sold
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="mt-2 h-3 bg-ink/10 [&>div]:bg-coral" />
              <p className="mt-2 text-sm font-extrabold text-coral">
                {ticketsLeft.toLocaleString("en-NG")} entries remaining
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-cream p-3 ring-1 ring-ink/5">
                <div className="text-[10px] font-extrabold uppercase tracking-wide text-ink/45">
                  Ends in
                </div>
                <div className="mt-1.5 flex gap-1.5">
                  <div className="rounded-lg bg-paper px-2 py-1 text-xs font-extrabold tabular-nums ring-1 ring-ink/10">
                    {cd.d}d
                  </div>
                  <CountdownUnit value={cd.h} label="" />
                  <CountdownUnit value={cd.m} label="" />
                  <CountdownUnit value={cd.s} label="" />
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-lemon/30 p-3 ring-1 ring-ink/5">
                <CalendarDays className="size-5 text-coral shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-extrabold uppercase tracking-wide text-ink/45">
                    Closes
                  </p>
                  <p className="truncate text-xs font-extrabold text-ink">{competition.closes}</p>
                </div>
              </div>
            </div>
            <Button
              variant="primary"
              size="lg"
              className="mt-5 w-full"
              onClick={() => setModalOpen(true)}
            >
              <Ticket className="size-4" />
              Enter now <ArrowRight className="size-4" />
            </Button>
            <p className="mt-3 text-center text-xs font-bold text-ink/45">
              Tickets reserved for 5 minutes · Wallet &amp; Referrals only
            </p>
          </div>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl border-0 bg-paper p-5 shadow-sm ring-1 ring-ink/5">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-mint/30 text-ink">
                <ShieldCheck className="size-4" />
              </span>
              <span className="inline-flex h-6 items-center rounded-full bg-mint/25 px-2 text-[10px] font-extrabold text-ink">
                Verified
              </span>
            </div>
            <h3 className="mt-4 font-display text-base font-extrabold text-ink">
              Verified draw by Rafilla
            </h3>
            <p className="mt-1 text-xs font-bold leading-relaxed text-ink/55">
              Secure HMAC_DRBG algorithm, published seed &amp; frozen entry set.
            </p>
            <Link
              to="/draw-verification/$campaign"
              params={{ campaign: competition.slug }}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-coral hover:underline"
            >
              Draw verification <ExternalLink className="size-3.5" />
            </Link>
          </Card>
          <Card className="rounded-2xl border-0 bg-paper p-5 shadow-sm ring-1 ring-ink/5">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-sky/20 text-ink">
                <ShieldAlert className="size-4" />
              </span>
              <span className="inline-flex h-6 items-center rounded-full bg-sky/20 px-2 text-[10px] font-extrabold text-ink">
                Insured
              </span>
            </div>
            <h3 className="mt-4 font-display text-base font-extrabold text-ink">
              Insured prize value
            </h3>
            <p className="mt-1 text-xs font-bold leading-relaxed text-ink/55">
              {formatNaira(competition.prizeValueKobo)} policy backed A+ rated insurance.
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-ink/65">
              <Award className="size-3.5 text-sky" /> A+ rated Leadway Assurance
            </span>
          </Card>
          <Card className="rounded-2xl border-0 bg-paper p-5 shadow-sm ring-1 ring-ink/5">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-lemon/40 text-ink">
                <CalendarDays className="size-4" />
              </span>
              <span className="inline-flex h-6 items-center rounded-full bg-lemon/40 px-2 text-[10px] font-extrabold text-ink">
                Draw date
              </span>
            </div>
            <h3 className="mt-4 font-display text-base font-extrabold text-ink">
              Draw date &amp; time
            </h3>
            <p className="mt-1 text-xs font-bold leading-relaxed text-ink/55">
              {competition.drawDate}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-ink/65">
              <PlayCircle className="size-3.5 text-lemon" /> Live stream link published
            </span>
          </Card>
          <Card className="rounded-2xl border-0 bg-paper p-5 shadow-sm ring-1 ring-ink/5">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-lilac/30 text-ink">
                <Award className="size-4" />
              </span>
              <span className="inline-flex h-6 items-center rounded-full bg-lilac/25 px-2 text-[10px] font-extrabold text-ink">
                Prize
              </span>
            </div>
            <h3 className="mt-4 font-display text-base font-extrabold text-ink">Prize condition</h3>
            <p className="mt-1 text-xs font-bold leading-relaxed text-ink/55">
              {competition.prizeCondition}. {competition.warranty}.
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-ink/65">
              <Shield className="size-3.5 text-lilac" /> All prizes 100% verified sourced
            </span>
          </Card>
        </div>
        <section className="mt-10">
          <Tabs defaultValue="description" className="w-full">
            <div className="mb-5 overflow-x-auto rounded-full bg-cream px-2 py-2 ring-1 ring-ink/5">
              <TabsList className="h-auto w-max gap-1 bg-transparent p-0">
                {([
                  ["description", "Description"],
                  ["specs", "Prize specs"],
                  ["tickets", "Ticket info"],
                  ["rules", "Rules"],
                  ["faqs", "FAQs"],
                  ["partner", "About the partner"],
                ] as const).map(([value, label]) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="h-9 rounded-full px-3.5 text-xs font-extrabold data-[state=active]:bg-coral data-[state=active]:text-paper data-[state=active]:shadow-[0_6px_16px_-6px_var(--coral)]"
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <TabsContent value="description">
              <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 sm:p-8">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                  Full description
                </p>
                <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">
                  The complete story of this prize
                </h2>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink/65">
                  <p>{competition.description}</p>
                  <p>
                    Every Rafilla competition is curated to deliver a genuinely life-changing prize
                    that you would be proud to own. This listing has been through our full diligence
                    process: authenticity checks, partner verification, insurance confirmation, and
                    a handover plan that is reviewed before the draw ever takes place.
                  </p>
                  <p>
                    For this specific competition, the prize has been physically inspected where
                    applicable, photographed in our own studio, and all supporting documentation
                    (certificates, warranties, proof of ownership) is held safely with our legal
                    partners until the winner claim is complete.
                  </p>
                  <p>
                    Entering is simple: you buy tickets at the published price, every ticket gets a
                    unique entry number, and once the competition closes the full eligible set is
                    frozen, published, and the draw algorithm runs with full public transparency so
                    anyone — you included — can independently verify that the result was
                    fair.
                  </p>
                  <p>
                    If you win, our dedicated winners concierge will walk you through every step:
                    ID verification, optional public announcement, prize handover logistics, and any
                    documentation or registration required to make the prize truly yours.
                  </p>
                </div>
                <div className="mt-8">
                  <h3 className="font-display text-lg font-extrabold text-ink">
                    Why winners love this prize
                  </h3>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      "Authenticity verified before the draw",
                      "Insurance-backed prize value policy",
                      "Dedicated winner concierge team",
                      "Flexible delivery / collection options",
                      "Full documentation transfer included",
                      "No hidden winner fees or charges",
                      "Published verification record post-draw",
                    ].map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2 rounded-xl bg-cream px-3 py-2 text-xs font-bold text-ink/70 ring-1 ring-ink/5"
                      >
                        <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-mint/40 text-[10px] text-ink">
                          ✓
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="specs">
              <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 sm:p-8">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                  Prize specifications
                </p>
                <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">
                  Everything you need to know
                </h2>
                <div className="mt-6 grid gap-px overflow-hidden rounded-2xl bg-ink/10 ring-1 ring-ink/10 sm:grid-cols-2">
                  {[
                    ["Category", competition.category],
                    ["Condition", competition.prizeCondition],
                    ["Make / Brand", competition.make],
                    ["Model", competition.model],
                    ["Year", competition.year.toString()],
                    ["Serial No.", competition.serialNo],
                    ["Market value", formatNaira(competition.marketValueKobo)],
                    ["Dimensions", competition.dimensions],
                    ["Color", competition.color],
                    ["Warranty info", competition.warranty],
                    ["Inclusions", competition.inclusions.join(", ")],
                    ["Exclusions", competition.exclusions.join(", ")],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-start justify-between gap-4 bg-paper px-4 py-3 sm:flex-col"
                    >
                      <div className="w-28 shrink-0 text-[10px] font-extrabold uppercase tracking-wide text-ink/45 sm:w-full">
                        {k}
                      </div>
                      <div className="text-right text-xs font-bold leading-relaxed text-ink sm:text-left">
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="tickets">
              <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 sm:p-8">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                  Tickets &amp; draw
                </p>
                <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">
                  How entries and the draw work
                </h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {[
                    ["Ticket price", formatNaira(competition.entryPrice)],
                    ["Total tickets available", competition.totalEntries.toLocaleString("en-NG")],
                    ["Max tickets per user", competition.maxTicketsPerUser.toString()],
                    ["Tickets sold", `${competition.entriesSold.toLocaleString("en-NG")} (${progress}%)`],
                    ["Draw happens", competition.drawDate],
                    ["Draw method", "Cryptographic HMAC_DRBG (publicly verifiable)"],
                    ["Results published", "Email + SMS + Draw verification page"],
                    ["Claim window", "14 calendar days from draw date"],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="rounded-2xl bg-cream px-4 py-3 ring-1 ring-ink/5"
                    >
                      <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink/45">
                        {k}
                      </p>
                      <p className="mt-1 text-sm font-extrabold text-ink">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl bg-lilac/25 p-5 ring-1 ring-ink/5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-extrabold text-ink/55">Entries progress</p>
                      <p className="mt-1 font-display text-lg font-extrabold text-ink">
                        {progress}% sold
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-coral">
                        {ticketsLeft.toLocaleString("en-NG")} left
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={progress}
                    className="mt-3 h-3 bg-paper ring-1 ring-ink/10 [&>div]:bg-coral"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="rules">
              <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 sm:p-8">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                  Competition rules summary
                </p>
                <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">
                  The 12 rules that matter
                </h2>
                <ol className="mt-6 space-y-3">
                  {[
                    "Organized by Rafilla under the standard Competition Rules framework.",
                    "You must be 18+, a verified account holder, and resident in Nigeria to win.",
                    "Entry purchase is final once the Wallet debit completes; no refund unless the competition is cancelled by Rafilla.",
                    `Maximum ${competition.maxTicketsPerUser} tickets per verified account for this competition.`,
                    "Tickets are tied to the purchasing account and cannot be transferred or gifted to another account.",
                    "The competition closes strictly at the published date/time; any pending transactions that fail to confirm in time will be refunded.",
                    "After close, all eligible entries are frozen and a cryptographic seed is published before the draw runs.",
                    "Winners are selected by HMAC_DRBG; top 3 winning numbers are each drawn, with automatic redraw only for ineligible entries.",
                    "Winners are contacted by registered email/SMS within 48 hours; full name is published only after explicit written consent.",
                    "Winner claim window is 14 calendar days; failure to complete KYC/claim triggers a verified redraw.",
                    "Prizes are delivered/handled as described in the Prize specs tab; cash alternative is not offered unless specifically stated.",
                    "Final decisions on eligibility, draws, and claims rest with Rafilla; see Competition Rules page for full binding terms.",
                  ].map((rule, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-2xl bg-cream px-4 py-3 ring-1 ring-ink/5"
                    >
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-coral text-xs font-extrabold text-paper">
                        {i + 1}
                      </span>
                      <p className="text-xs font-bold leading-relaxed text-ink/70">{rule}</p>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 rounded-2xl bg-lemon/35 p-4 ring-1 ring-ink/5">
                  <Link
                    to="/competition-rules"
                    className="inline-flex items-center gap-2 text-sm font-extrabold text-ink underline decoration-coral decoration-2 underline-offset-4"
                  >
                    Read all full competition rules <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="faqs">
              <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 sm:p-8">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                  FAQs — tickets, draw, claims
                </p>
                <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">
                  Quick answers before you enter
                </h2>
                <Accordion type="single" collapsible className="mt-6 w-full">
                  {competitionFaqs.map((faq, i) => (
                    <AccordionItem
                      key={faq.q}
                      value={`faq-${i}`}
                      className="mb-3 border-0 rounded-2xl bg-cream ring-1 ring-ink/5 px-4 first:mt-0 data-[state=open]:bg-paper"
                    >
                      <AccordionTrigger className="py-4 text-left">
                        <span className="pr-4 text-sm font-extrabold text-ink">{faq.q}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed text-ink/65 pb-4 pr-8">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>
            <TabsContent value="partner">
              <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 sm:p-8">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                  About the prize partner
                </p>
                <div className="mt-3 flex flex-col items-start gap-4 border-y border-ink/10 py-6 sm:flex-row sm:items-center">
                  <div className="grid size-20 place-items-center rounded-3xl bg-lilac/35 font-display text-3xl font-extrabold text-ink ring-1 ring-ink/10">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-2xl font-extrabold text-ink">
                        {competition.partner}
                      </h2>
                      <Badge className="h-5 rounded-full bg-mint/30 px-2 text-[10px] font-extrabold text-ink ring-0">
                        <BadgeCheck className="mr-1 size-3" /> Approved
                      </Badge>
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ink/60">
                        <MapPin className="size-3.5 text-coral" /> Lagos, Nigeria
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ink/60">
                        <Phone className="size-3.5 text-coral" /> +234 800 000 0000
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ink/60">
                        <Mail className="size-3.5 text-coral" /> hello@{competition.partner.toLowerCase().replace(/\s+/g, "").replace(/[^a-z]/g, "")}.com
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ink/60">
                        <Globe className="size-3.5 text-coral" /> www.{competition.partner.toLowerCase().replace(/\s+/g, "").replace(/[^a-z]/g, "")}.com
                      </span>
                    </div>
                    <Button asChild variant="outline" size="sm" className="mt-4">
                      <Link to="/competitions">
                        View partner listings <ArrowUpRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <p className="mt-6 text-sm leading-relaxed text-ink/65">
                  {competition.partner} is a fully vetted Rafilla prize partner. Every listed asset
                  passes authenticity, ownership, and insurance checks before any entries go on
                  sale, and the partner has committed to a documented handover process in the event
                  of a win.
                </p>
                {partnerCompetitions.length > 0 && (
                  <>
                    <h3 className="mt-8 font-display text-xl font-extrabold text-ink">
                      Recent from this partner
                    </h3>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      {partnerCompetitions.map((c) => (
                        <Card
                          key={c.slug}
                          className="group overflow-hidden rounded-2xl border-0 bg-paper ring-1 ring-ink/5"
                        >
                          <Link to="/competitions/$slug" params={{ slug: c.slug }} className="block">
                            <CardContent className="p-3">
                              <img
                                src={c.image}
                                alt={`${c.title} prize`}
                                loading="lazy"
                                decoding="async"
                                className="aspect-[4/3] w-full rounded-xl object-cover"
                              />
                              <div className="mt-3 px-1">
                                <p className="truncate font-display text-sm font-extrabold text-ink group-hover:text-coral">
                                  {c.title}
                                </p>
                                <div className="mt-1 flex items-center justify-between text-[11px] font-bold">
                                  <span className="text-ink/55">{c.category}</span>
                                  <span className="text-ink">{formatNaira(c.entryPrice)}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Link>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>
        <section className="mt-14">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink/45">
                More where this came from
              </p>
              <h3 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                You may also like
              </h3>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/competitions">
                Browse all <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {related.map((c) => (
              <CompetitionCard key={c.slug} competition={c} />
            ))}
          </div>
        </section>
        <section className="mt-14">
          <div className="rounded-[28px] bg-cream p-6 ring-1 ring-ink/10 sm:p-10">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-coral/15 px-3 py-1 text-[11px] font-extrabold text-ink ring-1 ring-coral/25">
                <Sparkles className="size-3.5 text-coral" /> Only a few tickets left
              </span>
              <h3 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
                Feeling lucky?
              </h3>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink/65 sm:text-base">
                {ticketsLeft.toLocaleString("en-NG")} entries remain for this competition, and every
                ticket gets you one step closer to the draw.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setModalOpen(true)}
                className="mt-7 min-w-[220px] shadow-[0_12px_28px_-10px_var(--coral)]"
              >
                <Ticket className="size-4" /> Enter draw
              </Button>
            </div>
          </div>
        </section>
      </div>
      <TicketPurchaseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        competitionSlug={competition.slug}
      />
    </>
  );
}

export function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
      <PageIntro
        eyebrow="Simple by design"
        title="A clear path from prize to draw."
        text="Rafilla is built to make the important details easy to see, understand, and revisit."
      />
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          "Create your account",
          "Fund your Rafilla Wallet",
          "Choose a competition",
          "Purchase your entries",
          "Watch the draw",
          "You could be the winner",
        ].map((step, index) => (
          <div key={step} className="rounded-[22px] bg-paper p-5 ring-1 ring-ink/5">
            <span className="font-display text-4xl font-extrabold text-coral">{index + 1}</span>
            <h2 className="mt-5 font-display text-xl font-extrabold text-ink">{step}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/55">
              {step === "Watch the draw"
                ? "When the competition closes, follow the draw and its verification details."
                : "A straightforward step in your Rafilla journey, with the details you need in view."}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-[28px] bg-lilac/30 p-6 ring-1 ring-ink/5 sm:p-8">
        <div className="flex max-w-2xl items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-paper text-coral">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-extrabold text-ink">
              Trust belongs in the product.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">
              Competition status, entry availability, and draw information should never be hidden
              behind guesswork. That is the standard Rafilla is designed around.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WinnersPage() {
  return <WinnersPagePolished />;
}

function _LegacyWinnersPage_Unused() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
      <PageIntro
        eyebrow="Celebrate the journey"
        title="Winners, with the details that matter."
        text="Approved winner announcements will appear here as competitions are completed and claims are verified."
      />
      <div className="mt-10 rounded-[28px] bg-paper p-8 text-center ring-1 ring-ink/5 sm:p-12">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-lemon/50 text-coral">
          <Sparkles className="size-6" />
        </span>
        <h2 className="mt-5 font-display text-2xl font-extrabold text-ink">
          The first winner stories are on their way.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink/55">
          When a winner is approved for publication, we’ll share the prize, competition, and draw
          verification details here.
        </p>
        <Button asChild variant="primary" size="md" className="mt-6">
          <Link to="/competitions">
            Explore competitions <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function PartnerPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
      <PageIntro
        eyebrow="For asset owners"
        title="Put a premium asset in the spotlight."
        text="Rafilla gives approved partners a clear way to submit, monitor, and grow campaigns around exceptional products and experiences."
      />
      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {[
          {
            icon: <Ticket />,
            title: "Submit an asset",
            text: "Share the product, supporting details, images, and documentation for review.",
          },
          {
            icon: <Sparkles />,
            title: "Build a campaign",
            text: "Approved listings are shaped into a clear competition journey for entrants.",
          },
          {
            icon: <BadgeCheck />,
            title: "Track performance",
            text: "Monitor entries, campaign progress, and settlement information from your portal.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-[22px] bg-paper p-6 ring-1 ring-ink/5">
            <span className="grid size-11 place-items-center rounded-2xl bg-lilac/40 text-coral">
              {item.icon}
            </span>
            <h2 className="mt-5 font-display text-xl font-extrabold text-ink">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/55">{item.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-col gap-5 rounded-[28px] bg-ink p-6 text-cream sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-cream/50">
            Partner applications
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold">
            Bring your asset to Rafilla.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-cream/65">
            Partner onboarding will open with profile capture, asset review, and administrator
            approval.
          </p>
        </div>
        <Button asChild variant="primary" size="lg">
          <Link to="/contact">
            Start a conversation <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
      <PageIntro
        eyebrow="About Rafilla"
        title="A better way to discover what’s next."
        text="Rafilla is a Nigerian prize-competition platform designed around premium products, transparent journeys, and fair chances."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 sm:p-8">
          <p className="text-base leading-relaxed text-ink/65">
            We believe a competition experience should feel closer to a premium product marketplace
            than a betting website. That means clear pricing, visible availability, secure accounts,
            and draw information people can come back to.
          </p>
          <p className="mt-5 text-base leading-relaxed text-ink/65">
            Rafilla is being built incrementally, with the web platform first and a future backend
            architecture that can support mobile applications when that phase is commissioned.
          </p>
        </div>
        <div className="rounded-[28px] bg-lilac/30 p-6 ring-1 ring-ink/5 sm:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
            Our principles
          </p>
          <ul className="mt-5 space-y-4">
            {[
              "Transparency over noise",
              "Secure money movement",
              "Respect for every entrant",
              "Premium, approved prizes",
            ].map((principle) => (
              <li
                key={principle}
                className="flex items-center gap-3 font-display text-lg font-extrabold text-ink"
              >
                <span className="grid size-7 place-items-center rounded-full bg-paper text-sm text-coral">
                  ✓
                </span>
                {principle}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function FAQPage() {
  const faqs = [
    {
      q: "What is Rafilla?",
      a: "Rafilla is a platform for premium prize competitions. You choose a competition, purchase entries, and follow the journey to the draw.",
    },
    {
      q: "How do I enter a competition?",
      a: "Create an account, fund your Rafilla Wallet when wallet funding is available, choose a competition, and purchase entries.",
    },
    {
      q: "How are winners selected?",
      a: "After a competition closes, eligible entries are frozen and the draw is conducted through a secure, verifiable process.",
    },
    {
      q: "Can I withdraw my Rafilla Wallet balance?",
      a: "The standard Rafilla Wallet is spend-only. It is designed for funding competition entries, not cash withdrawals.",
    },
    {
      q: "What are referral earnings?",
      a: "Referral earnings are separate from the spend-only wallet. Eligible earnings may be used for entries or requested as a cash payout, subject to the applicable review process.",
    },
  ];
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
      <PageIntro
        eyebrow="Need to know"
        title="Frequently asked questions."
        text="The essentials, without the fine-print fog."
      />
      <div className="mt-10 space-y-3">
        {faqs.map((faq) => (
          <details key={faq.q} className="group rounded-[22px] bg-paper p-5 ring-1 ring-ink/5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-extrabold text-ink">
              <span>{faq.q}</span>
              <ChevronDown className="size-5 shrink-0 text-coral transition-transform group-open:rotate-180" />
            </summary>
            <p className="max-w-2xl pt-4 text-sm leading-relaxed text-ink/60">{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

function ContactInfoCard({
  icon,
  title,
  value,
  href,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href?: string;
  tone?: "coral" | "lemon" | "mint" | "lilac";
}) {
  const base =
    "rounded-[22px] bg-paper p-5 ring-1 ring-ink/5 transition-transform hover:-translate-y-0.5";
  const toneBg = {
    coral: "bg-coral/15",
    lemon: "bg-lemon/40",
    mint: "bg-mint/25",
    lilac: "bg-lilac/30",
  };
  const wrapper = href ? "a" : "div";
  const Comp = wrapper as any;
  return (
    <Comp {...(href ? { href } : {})} className={base}>
      <span
        className={`inline-flex size-11 items-center justify-center rounded-2xl ${toneBg[tone ?? "coral"]} text-coral`}
      >
        {icon}
      </span>
      <h3 className="mt-4 font-display text-lg font-extrabold text-ink">{title}</h3>
      <p className="mt-1 text-sm font-bold text-ink/55">{value}</p>
    </Comp>
  );
}

type ContactCategory =
  | "general"
  | "support"
  | "partner"
  | "press"
  | "prize-claim"
  | "bug-report";

type ContactFormState = {
  fullName: string;
  email: string;
  subject: string;
  category: ContactCategory | "";
  message: string;
};

type FormErrors = Partial<Record<keyof ContactFormState, string>>;

function generateRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function validateEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function validateForm(state: ContactFormState): FormErrors {
  const errors: FormErrors = {};
  if (!state.fullName.trim() || state.fullName.trim().length < 2)
    errors.fullName = "Please enter your full name (min 2 chars).";
  if (!state.email.trim() || !validateEmail(state.email))
    errors.email = "Please enter a valid email address.";
  if (!state.subject.trim() || state.subject.trim().length < 3)
    errors.subject = "Please add a subject (min 3 chars).";
  if (!state.category) errors.category = "Please select a category.";
  if (state.message.trim().length < 20)
    errors.message = "Message must be at least 20 characters.";
  if (state.message.length > 2000) errors.message = "Message cannot exceed 2000 characters.";
  return errors;
}

export function ContactPage() {
  const [form, setForm] = useState<ContactFormState>({
    fullName: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ContactFormState, boolean>>>({});
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [captchaVerifying, setCaptchaVerifying] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [showCopy, setShowCopy] = useState(false);

  const update = <K extends keyof ContactFormState>(key: K, value: ContactFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (touched[key]) setErrors(validateForm({ ...form, [key]: value }));
  };

  const blur = <K extends keyof ContactFormState>(key: K) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors(validateForm(form));
  };

  const onCaptchaToggle = () => {
    if (captchaVerifying) return;
    if (captchaVerified) {
      setCaptchaChecked(false);
      setCaptchaVerified(false);
      return;
    }
    setCaptchaChecked(true);
    setCaptchaVerifying(true);
    setTimeout(() => {
      setCaptchaVerifying(false);
      setCaptchaVerified(true);
    }, 1200);
  };

  const resetForm = () => {
    setForm({ fullName: "", email: "", subject: "", category: "", message: "" });
    setErrors({});
    setTouched({});
    setCaptchaChecked(false);
    setCaptchaVerified(false);
    setSuccessRef(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched: Record<keyof ContactFormState, boolean> = {
      fullName: true,
      email: true,
      subject: true,
      category: true,
      message: true,
    };
    setTouched(allTouched);
    const foundErrors = validateForm(form);
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length > 0) return;
    if (!captchaVerified) {
      toast.error("Please verify you're not a robot.", {
        style: {
          background: "var(--color-paper)",
          border: "1px solid var(--color-coral)",
          color: "var(--color-ink)",
          borderRadius: "9999px",
        },
      });
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    const ref = generateRef();
    setSuccessRef(ref);
    setSubmitting(false);
    toast.success(`Message sent! Ref: CT-${ref}. We'll reply within 48h.`, {
      style: {
        background: "var(--color-paper)",
        border: "1px solid var(--color-mint)",
        color: "var(--color-ink)",
        borderRadius: "9999px",
      },
    });
  };

  const copyRef = async () => {
    if (!successRef) return;
    try {
      await navigator.clipboard.writeText(`CT-${successRef}`);
      setShowCopy(true);
      setTimeout(() => setShowCopy(false), 1800);
    } catch {}
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
      <PageIntro
        eyebrow="Let’s talk"
        title="Questions, partnerships, or support."
        text="Tell us what you need and the Rafilla team will point you in the right direction."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <ContactInfoCard
              icon={<Mail className="size-5" />}
              title="Email us"
              value="hello@raffila.com"
              href="mailto:hello@raffila.com"
              tone="coral"
            />
            <ContactInfoCard
              icon={<Phone className="size-5" />}
              title="Phone support"
              value="+234 800 RAFFILA"
              href="tel:+2348007233452"
              tone="mint"
            />
            <ContactInfoCard
              icon={<MapPin className="size-5" />}
              title="HQ — Lagos, NG"
              value="Victoria Island, Lagos"
              tone="lemon"
            />
            <ContactInfoCard
              icon={<Clock3 className="size-5" />}
              title="Support hours"
              value="Mon–Sat · 9am–7pm WAT"
              tone="lilac"
            />
          </div>

          <div className="rounded-[28px] bg-ink p-6 text-cream ring-1 ring-ink/5 sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-cream/50">
              Stay in the loop
            </p>
            <h3 className="mt-2 font-display text-2xl font-extrabold">Follow our community</h3>
            <p className="mt-2 text-sm leading-relaxed text-cream/65">
              Winner announcements, new prize drops, and behind-the-scenes content.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href="https://instagram.com"
                className="inline-flex items-center gap-1.5 rounded-full bg-cream/10 px-4 py-2 text-xs font-extrabold text-cream ring-1 ring-cream/15 transition-colors hover:bg-cream/20"
              >
                <Instagram className="size-3.5" /> @raffila
              </a>
              <a
                href="mailto:hello@raffila.com"
                className="inline-flex items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-xs font-extrabold text-ink transition-colors hover:bg-cream/90"
              >
                <Mail className="size-3.5" /> Newsletter
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 sm:p-8">
          {successRef ? (
            <div className="text-center py-4">
              <div className="mx-auto grid size-20 place-items-center rounded-full bg-mint/25 text-ink">
                <BadgeCheck className="size-10 text-mint" />
              </div>
              <h2 className="mt-6 font-display text-3xl font-extrabold text-ink">
                Thanks, we got it! 🎉
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/60">
                Your message has been received. Our team will reply within 48 hours.
              </p>

              <div className="mt-7 inline-flex w-full max-w-md flex-col items-stretch gap-3 rounded-[22px] bg-cream p-5 ring-1 ring-ink/5">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                  Your reference
                </p>
                <div className="flex items-center gap-3">
                  <p className="font-mono text-lg font-extrabold tracking-wider text-ink">
                    CT-{successRef}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyRef}
                    className="ml-auto shrink-0"
                  >
                    {showCopy ? (
                      <>
                        <Check className="size-3.5" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" /> Copy ref
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button variant="primary" size="lg" onClick={resetForm}>
                  Send another message
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <Link to="/">
                    <ArrowRight className="size-4 rotate-180" /> Back to home
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-ink">
                    Send us a message
                  </h2>
                  <p className="mt-1 text-sm font-bold text-ink/55">
                    All fields are required unless stated otherwise.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="c-name" className="text-xs font-extrabold text-ink/70">
                    Full name
                  </Label>
                  <Input
                    id="c-name"
                    type="text"
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    onBlur={() => blur("fullName")}
                    placeholder="Adaeze Okafor"
                    className={cn(
                      "h-12 rounded-full border-0 bg-cream px-4 text-sm font-bold text-ink ring-1 focus-visible:ring-2 placeholder:text-ink/40 shadow-none",
                      errors.fullName
                        ? "ring-coral/60 focus-visible:ring-coral"
                        : "ring-ink/10 focus-visible:ring-coral/60",
                    )}
                  />
                  {errors.fullName && (
                    <p className="text-xs font-bold text-coral">{errors.fullName}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-email" className="text-xs font-extrabold text-ink/70">
                    Email
                  </Label>
                  <Input
                    id="c-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    onBlur={() => blur("email")}
                    placeholder="adaeze@example.com"
                    className={cn(
                      "h-12 rounded-full border-0 bg-cream px-4 text-sm font-bold text-ink ring-1 focus-visible:ring-2 placeholder:text-ink/40 shadow-none",
                      errors.email
                        ? "ring-coral/60 focus-visible:ring-coral"
                        : "ring-ink/10 focus-visible:ring-coral/60",
                    )}
                  />
                  {errors.email && (
                    <p className="text-xs font-bold text-coral">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="c-subject" className="text-xs font-extrabold text-ink/70">
                  Subject
                </Label>
                <Input
                  id="c-subject"
                  type="text"
                  value={form.subject}
                  onChange={(e) => update("subject", e.target.value)}
                  onBlur={() => blur("subject")}
                  placeholder="How to enter my first competition?"
                  className={cn(
                    "h-12 rounded-full border-0 bg-cream px-4 text-sm font-bold text-ink ring-1 focus-visible:ring-2 placeholder:text-ink/40 shadow-none",
                    errors.subject
                      ? "ring-coral/60 focus-visible:ring-coral"
                      : "ring-ink/10 focus-visible:ring-coral/60",
                  )}
                />
                {errors.subject && (
                  <p className="text-xs font-bold text-coral">{errors.subject}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="c-category" className="text-xs font-extrabold text-ink/70">
                  Category
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => {
                    update("category", v as ContactCategory);
                  }}
                  onOpenChange={() => setTouched((p) => ({ ...p, category: true }))}
                >
                  <SelectTrigger
                    id="c-category"
                    className={cn(
                      "h-12 rounded-full border-0 bg-cream px-4 text-sm font-bold text-ink ring-1 focus:ring-2 shadow-none",
                      errors.category
                        ? "ring-coral/60 focus:ring-coral"
                        : "ring-ink/10 focus:ring-coral/60",
                    )}
                  >
                    <SelectValue placeholder="Select a category…" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-0 bg-paper p-1 font-body shadow-lg ring-1 ring-ink/10">
                    <SelectItem value="general" className="rounded-xl text-sm font-bold">
                      General enquiry
                    </SelectItem>
                    <SelectItem value="support" className="rounded-xl text-sm font-bold">
                      Support (login / wallet / entries)
                    </SelectItem>
                    <SelectItem value="partner" className="rounded-xl text-sm font-bold">
                      Partner inquiry
                    </SelectItem>
                    <SelectItem value="press" className="rounded-xl text-sm font-bold">
                      Press / Media
                    </SelectItem>
                    <SelectItem value="prize-claim" className="rounded-xl text-sm font-bold">
                      Prize claim
                    </SelectItem>
                    <SelectItem value="bug-report" className="rounded-xl text-sm font-bold">
                      Report a bug
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs font-bold text-coral">{errors.category}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="c-message" className="text-xs font-extrabold text-ink/70">
                    Message
                  </Label>
                  <span
                    className={cn(
                      "text-[11px] font-extrabold",
                      form.message.length > 1900 ? "text-coral" : "text-ink/40",
                    )}
                  >
                    {form.message.length} / 2000
                  </span>
                </div>
                <Textarea
                  id="c-message"
                  rows={7}
                  maxLength={2000}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  onBlur={() => blur("message")}
                  placeholder="Tell us what you need — include any relevant details, dates, or competition IDs to help us respond faster."
                  style={{ minHeight: 200 }}
                  className={cn(
                    "rounded-[22px] border-0 bg-cream px-4 py-3 text-sm font-bold text-ink ring-1 focus-visible:ring-2 placeholder:text-ink/40 resize-y shadow-none",
                    errors.message
                      ? "ring-coral/60 focus-visible:ring-coral"
                      : "ring-ink/10 focus-visible:ring-coral/60",
                  )}
                />
                {errors.message && (
                  <p className="text-xs font-bold text-coral">{errors.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div
                  onClick={onCaptchaToggle}
                  className={cn(
                    "inline-flex w-full max-w-sm cursor-pointer items-center gap-3 rounded-2xl bg-paper px-4 py-3 ring-1 transition-colors",
                    captchaVerified
                      ? "ring-mint/50 bg-mint/15"
                      : "ring-ink/15 hover:bg-cream",
                  )}
                >
                  <div
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-lg border-2 transition-all",
                      captchaVerified
                        ? "border-mint bg-mint text-ink"
                        : captchaVerifying
                          ? "border-ink/25 bg-cream text-ink/55"
                          : "border-ink/25 bg-paper",
                    )}
                  >
                    {captchaVerified ? (
                      <Check className="size-4" />
                    ) : captchaVerifying ? (
                      <svg
                        className="size-4 animate-spin text-coral"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                    ) : (
                      <Checkbox
                        checked={captchaChecked}
                        onCheckedChange={() => {}}
                        className="border-transparent bg-transparent shadow-none data-[state=checked]:bg-transparent"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-ink">
                      {captchaVerified ? (
                        <span className="inline-flex items-center gap-1.5 text-ink">
                          <BadgeCheck className="size-4 text-mint" /> Verified
                        </span>
                      ) : captchaVerifying ? (
                        "Verifying…"
                      ) : (
                        "I'm not a robot"
                      )}
                    </p>
                    <p className="text-[11px] font-bold text-ink/40">
                      Privacy · Terms · reCAPTCHA stub
                    </p>
                  </div>
                  <span className="font-display text-2xl font-extrabold text-coral/60">🔒</span>
                </div>
              </div>

              <Separator className="bg-ink/10" />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <svg
                      className="size-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Sending…
                  </>
                ) : (
                  <>
                    <Mail className="size-4" /> Send message
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function DrawVerificationPage() {
  const { campaign } = useParams({ from: "/draw-verification/$campaign" });
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
      <PageIntro
        eyebrow="Public verification"
        title="Follow the draw record."
        text={`Verification information for ${campaign.replaceAll("-", " ")} will appear here once the competition has closed and the result is approved for publication.`}
      />
      <div className="mt-10 rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Campaign", campaign.replaceAll("-", " ")],
            ["Status", "Awaiting draw"],
            ["Algorithm", "Published with draw record"],
            ["Entry pool", "Available after close"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-cream p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
                {label}
              </p>
              <p className="mt-2 font-display text-lg font-extrabold capitalize text-ink">
                {value}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-mint/25 p-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-ink" />
          <p className="text-sm font-bold leading-relaxed text-ink/65">
            Rafilla’s verification surface is designed to publish the relevant draw data without
            exposing private entrant information.
          </p>
        </div>
      </div>
    </div>
  );
}

export function AuthPreviewPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:py-20">
      <div className="rounded-[28px] bg-paper p-6 text-center ring-1 ring-ink/5 sm:p-10">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-lilac font-display text-2xl font-extrabold text-ink">
          R
        </span>
        <h1 className="mt-5 font-display text-3xl font-extrabold text-ink">Join Rafilla</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/60">
          Secure account access, email and phone verification, and profile completion will be
          connected in the next Cloud-backed phase.
        </p>
        <Button asChild variant="dark" size="lg" className="mt-6">
          <Link to="/competitions">Browse competitions</Link>
        </Button>
      </div>
    </div>
  );
}

function HowItWorksPreview() {
  return (
    <section className="bg-lilac/20">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <SectionHeading
          eyebrow="No mystery steps"
          title="How Rafilla works"
          linkLabel="See the full guide"
          linkTo="/how-it-works"
        />
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            "Create your account",
            "Fund your wallet",
            "Choose a prize",
            "Buy entries",
            "Watch the draw",
            "You could win",
          ].map((step, index) => (
            <div key={step} className="rounded-[20px] bg-paper p-4 ring-1 ring-ink/5">
              <span className="font-display text-2xl font-extrabold text-coral">{index + 1}</span>
              <p className="mt-3 text-sm font-extrabold leading-snug text-ink">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function SectionHeading({
  eyebrow,
  title,
  linkLabel,
  linkTo,
}: {
  eyebrow: string;
  title: string;
  linkLabel: string;
  linkTo: "/competitions" | "/how-it-works";
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink/45">{eyebrow}</p>
        <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          {title}
        </h2>
      </div>
      <Link
        to={linkTo}
        className="hidden items-center gap-1 text-sm font-extrabold text-ink/60 hover:text-ink sm:inline-flex"
      >
        {linkLabel} <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
function PageIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <header className="max-w-3xl">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">{eyebrow}</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/60 sm:text-lg">{text}</p>
    </header>
  );
}
function Pill({ children, tone }: { children: React.ReactNode; tone?: "coral" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-xs font-extrabold text-ink ring-1 ring-ink/10 ${tone === "coral" ? "text-coral" : ""}`}
    >
      {children}
    </span>
  );
}
function TrustItem({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div>
      <span className="text-coral [&>svg]:size-5">{icon}</span>
      <h3 className="mt-2 font-display text-base font-extrabold text-ink">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-ink/55">{text}</p>
    </div>
  );
}
function MissingPage({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <CircleHelp className="mx-auto size-10 text-coral" />
      <h1 className="mt-5 font-display text-3xl font-extrabold text-ink">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink/60">{text}</p>
      <Button asChild variant="dark" size="md" className="mt-6">
        <Link to="/competitions">Back to competitions</Link>
      </Button>
    </div>
  );
}

const placeholderText = (label: string) => (
  <div className="rounded-[22px] bg-lilac/15 p-5 ring-1 ring-ink/5">
    <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-coral">
      PLACEHOLDER TEXT — PENDING LEGAL REVIEW
    </p>
    <p className="mt-3 text-sm leading-relaxed text-ink/60">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
      voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
      non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
    <p className="mt-4 text-sm leading-relaxed text-ink/60">
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
      laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto
      beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut
      odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
    </p>
  </div>
);

function LegalBanner() {
  return (
    <div className="mb-8 rounded-[22px] bg-coral px-5 py-4 text-cream shadow-[0_8px_20px_-8px_var(--coral)] ring-1 ring-coral/30">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-cream/90" />
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-cream/80">Notice</p>
          <p className="mt-1 text-sm font-bold leading-relaxed">
            This document is pending legal review. For the final binding version contact
            legal@rafilla.com.
          </p>
        </div>
      </div>
    </div>
  );
}

function LegalSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-3">
        <span className="font-display text-3xl font-extrabold text-coral">{number}</span>
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {title}
        </h2>
      </div>
      <div className="mt-5 pl-12 sm:pl-14">{children}</div>
    </section>
  );
}

export function TermsAndConditionsPage() {
  const sections = [
    { number: "1", title: "Acceptance of Terms", placeholderLabel: "acceptance-terms" },
    { number: "2", title: "Eligibility & Age Verification", placeholderLabel: "eligibility-age" },
    { number: "3", title: "Competition Rules & Play", placeholderLabel: "competition-rules-play" },
    {
      number: "4",
      title: "Entry Purchase, Payments & Wallet",
      placeholderLabel: "entry-payments-wallet",
    },
    {
      number: "5",
      title: "Draws, Winners & Prize Claims",
      placeholderLabel: "draws-winners-claims",
    },
    { number: "6", title: "Referral Program", placeholderLabel: "referral-program" },
    {
      number: "7",
      title: "Account Responsibilities",
      placeholderLabel: "account-responsibilities",
    },
    {
      number: "8",
      title: "Disclaimers & Limitation of Liability",
      placeholderLabel: "disclaimers-liability",
    },
    {
      number: "9",
      title: "Dispute Resolution & Governing Law (Nigeria)",
      placeholderLabel: "dispute-resolution-law",
    },
    { number: "10", title: "Amendments", placeholderLabel: "amendments" },
    { number: "11", title: "Contact", placeholderLabel: "contact-terms" },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
      <PageIntro
        eyebrow="Legal"
        title="Terms and Conditions"
        text="The agreement that covers your use of Rafilla, competition entries, draws, and related services."
      />
      <div className="mt-8">
        <LegalBanner />
        <div className="space-y-10">
          {sections.map((section) => (
            <LegalSection key={section.number} number={section.number} title={section.title}>
              {placeholderText(section.placeholderLabel)}
            </LegalSection>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PrivacyPolicyPage() {
  const sections = [
    { number: "1", title: "Information We Collect", placeholderLabel: "information-collect" },
    { number: "2", title: "How We Use Information", placeholderLabel: "how-we-use" },
    { number: "3", title: "Sharing & Disclosure", placeholderLabel: "sharing-disclosure" },
    { number: "4", title: "Cookies & Analytics", placeholderLabel: "cookies-analytics" },
    { number: "5", title: "Data Retention & Security", placeholderLabel: "retention-security" },
    { number: "6", title: "Your Rights & Choices", placeholderLabel: "rights-choices" },
    { number: "7", title: "International Transfers", placeholderLabel: "international-transfers" },
    { number: "8", title: "Children", placeholderLabel: "children-privacy" },
    { number: "9", title: "Changes to this Policy", placeholderLabel: "changes-policy" },
    { number: "10", title: "Contact", placeholderLabel: "contact-privacy" },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
      <PageIntro
        eyebrow="Legal"
        title="Privacy Policy"
        text="How Rafilla collects, uses, and protects personal information for competition entrants and account holders."
      />
      <div className="mt-8">
        <LegalBanner />
        <div className="space-y-10">
          {sections.map((section) => (
            <LegalSection key={section.number} number={section.number} title={section.title}>
              {placeholderText(section.placeholderLabel)}
            </LegalSection>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CompetitionRulesPage() {
  const sections = [
    { number: "1", title: "Organizer & Scope", placeholderLabel: "organizer-scope" },
    { number: "2", title: "Eligibility", placeholderLabel: "eligibility-rules" },
    { number: "3", title: "Entry", placeholderLabel: "entry-rules" },
    { number: "4", title: "Ticket Pricing & Limits", placeholderLabel: "pricing-limits" },
    { number: "5", title: "Competition Period", placeholderLabel: "competition-period" },
    { number: "6", title: "Draw Procedure & Verification", placeholderLabel: "draw-verification" },
    {
      number: "7",
      title: "Winner Selection & Notification",
      placeholderLabel: "winner-notification",
    },
    { number: "8", title: "Prizes, Claims & Delivery", placeholderLabel: "prizes-claims-delivery" },
    { number: "9", title: "Conduct & Cheating", placeholderLabel: "conduct-cheating" },
    { number: "10", title: "Refunds", placeholderLabel: "refunds-rules" },
    { number: "11", title: "Liability", placeholderLabel: "liability-rules" },
    { number: "12", title: "Final Decisions", placeholderLabel: "final-decisions" },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
      <PageIntro
        eyebrow="Legal"
        title="Competition Rules"
        text="The specific rules that apply to Rafilla prize competitions, including entries, draws, prizes, and claims."
      />
      <div className="mt-8">
        <LegalBanner />
        <div className="space-y-10">
          {sections.map((section) => (
            <LegalSection key={section.number} number={section.number} title={section.title}>
              {placeholderText(section.placeholderLabel)}
            </LegalSection>
          ))}
        </div>
      </div>
    </div>
  );
}
