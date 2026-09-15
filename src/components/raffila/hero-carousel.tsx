import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  featuredCompetitions as mockFeatured,
  formatNaira,
  getProgress,
  type Competition,
} from "@/lib/raffila-data";
import { useCompetitions } from "@/hooks/useCompetitions";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 30_000;

const accentStyles = {
  coral: { surface: "bg-rose/20", fill: "bg-coral", badge: "bg-coral/15 text-coral" },
  sky: { surface: "bg-sky/20", fill: "bg-sky", badge: "bg-sky/20 text-ink" },
  lemon: { surface: "bg-lemon/25", fill: "bg-lemon", badge: "bg-lemon/30 text-ink" },
  mint: { surface: "bg-mint/25", fill: "bg-mint", badge: "bg-mint/30 text-ink" },
  lilac: { surface: "bg-lilac/25", fill: "bg-lilac", badge: "bg-lilac/30 text-ink" },
} as const;

function ShieldIcon() {
  return (
    <span className="grid size-4 place-items-center rounded-full bg-mint/50 text-[10px] text-ink">
      ✓
    </span>
  );
}

function ProgressDetails({
  competition,
  progress,
}: {
  competition: Competition;
  progress: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs font-bold text-ink/55">
        <span>Sales progress</span>
        <span className="font-extrabold text-ink">{progress}%</span>
      </div>
      <Progress
        value={progress}
        className={cn(
          "h-2.5 rounded-full bg-ink/8 [&>div]:rounded-full",
          accentStyles[competition.accent].fill,
        )}
      />
      <div className="flex items-center justify-between gap-3 text-[11px] font-bold text-ink/50">
        <span>{progress}% of allocation sold</span>
        <span className="flex items-center gap-1">
          <ShieldAlert className="size-3 text-coral" /> Ends {competition.closes}
        </span>
      </div>
    </div>
  );
}

function FeaturedSlide({ competition }: { competition: Competition }) {
  const accent = accentStyles[competition.accent];
  const progress = getProgress(competition);
  return (
    <article
      className={cn("overflow-hidden rounded-[28px] p-3 ring-1 ring-ink/5 sm:p-4", accent.surface)}
    >
      <div className="overflow-hidden rounded-[22px] bg-paper p-3 shadow-sm ring-1 ring-ink/5 sm:p-4">
        <img
          src={competition.image}
          alt={`${competition.title} prize`}
          width={1200}
          height={760}
          loading="eager"
          fetchPriority="high"
          decoding="sync"
          className="aspect-[16/10] w-full rounded-[18px] object-cover"
        />
        <div className="space-y-3 pt-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="line-clamp-2 font-display text-xl font-extrabold leading-tight text-ink sm:text-2xl lg:text-3xl">
                {competition.title}
              </h2>
              <p className="mt-1 break-words text-xs font-bold leading-relaxed text-ink/50">
                {competition.category} · {formatNaira(competition.prizeValueKobo)} prize value ·{" "}
                {competition.partner}
              </p>
            </div>
            <span className="w-fit shrink-0 rounded-full bg-mint/30 px-2.5 py-1 text-[11px] font-extrabold text-ink">
              {competition.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="min-w-0">
              <p className="font-bold text-ink/55">Entry price</p>
              <p className="break-words font-display text-lg font-extrabold text-ink sm:text-xl">
                {formatNaira(competition.entryPrice)}
              </p>
            </div>
            <div className="min-w-0 text-right">
              <p className="font-bold text-ink/55">Draw date</p>
              <p className="break-words font-bold text-ink text-xs sm:text-sm">
                {competition.drawDate}
              </p>
            </div>
          </div>
          <ProgressDetails competition={competition} progress={progress} />
          <div className="flex items-center gap-2">
            <Button asChild variant="primary" size="lg" className="flex-1">
              <Link to="/competitions/$slug" params={{ slug: competition.slug }}>
                Explore competition
              </Link>
            </Button>
            <Button asChild variant="outline" size="icon" aria-label="See how Raffila works">
              <Link to="/how-it-works">
                <ArrowUpRight className="size-5" />
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-2 pt-1 text-[11px] font-bold text-ink/50">
            <ShieldIcon /> Every draw is publicly verifiable
          </div>
        </div>
      </div>
    </article>
  );
}

export function HeroFeaturedCarousel() {
  const [mounted, setMounted] = useState(false);
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const hoveredRef = useRef(false);
  const progressRafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(performance.now());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
      lastTickRef.current = performance.now();
      setProgressPct(0);
    };
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api || userPaused) return;
    if (progressRafRef.current !== null) cancelAnimationFrame(progressRafRef.current);
    lastTickRef.current = performance.now();
    const tick = () => {
      if (hoveredRef.current || userPaused) {
        lastTickRef.current = performance.now();
        progressRafRef.current = requestAnimationFrame(tick);
        return;
      }
      const now = performance.now();
      const elapsed = now - lastTickRef.current;
      const pct = Math.min(100, (elapsed / AUTOPLAY_MS) * 100);
      setProgressPct(pct);
      if (pct >= 100) {
        const isLast = current === count - 1;
        if (isLast) api.scrollTo(0);
        else api.scrollNext();
        setProgressPct(0);
        lastTickRef.current = performance.now();
      }
      progressRafRef.current = requestAnimationFrame(tick);
    };
    progressRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (progressRafRef.current !== null) cancelAnimationFrame(progressRafRef.current);
    };
  }, [api, current, count, userPaused]);

  const { competitions: liveCompetitions } = useCompetitions();
  const liveFeatured = liveCompetitions.filter((c) => c.featured);
  const slides =
    liveFeatured.length > 0
      ? liveFeatured
      : mockFeatured.length > 0
        ? mockFeatured
        : liveCompetitions.slice(0, 8);

  if (!mounted) {
    const c = slides[0]!;
    return (
      <div className="relative">
        <div className="flex items-center justify-between gap-3 pb-4 opacity-80">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-cream px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink/55 ring-1 ring-ink/5">
              {String(0 + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </span>
            <span className="hidden text-xs font-bold text-ink/45 sm:inline">
              Auto-rotates every 30s
            </span>
          </div>
          <div className="h-8 w-[160px] animate-pulse rounded-full bg-ink/5" />
        </div>
        <FeaturedSlide competition={c} />
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
        lastTickRef.current = performance.now();
      }}
      onFocus={() => {
        hoveredRef.current = true;
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          hoveredRef.current = false;
          lastTickRef.current = performance.now();
        }
      }}
    >
      <Carousel
        opts={{ align: "start", loop: true, skipSnaps: false, dragFree: false }}
        setApi={setApi}
        className="w-full"
      >
        <div className="flex items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-cream px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink/55 ring-1 ring-ink/5">
              {String(current + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <span className="hidden text-xs font-bold text-ink/45 sm:inline">
              Auto-rotates every 30s
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-full px-3 text-xs"
              onClick={() => setUserPaused((v) => !v)}
              aria-label={userPaused ? "Resume auto-rotate" : "Pause auto-rotate"}
            >
              {userPaused ? (
                <>
                  <Play className="size-3.5" /> Play
                </>
              ) : (
                <>
                  <Pause className="size-3.5" /> Pause
                </>
              )}
            </Button>
            <div className="hidden items-center gap-1.5 md:flex">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => {
                  lastTickRef.current = performance.now();
                  setProgressPct(0);
                  api?.scrollPrev();
                }}
                aria-label="Previous featured prize"
              >
                <ArrowLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => {
                  lastTickRef.current = performance.now();
                  setProgressPct(0);
                  api?.scrollNext();
                }}
                aria-label="Next featured prize"
              >
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <CarouselContent className="-ml-0">
          {slides.map((c) => (
            <CarouselItem key={c.slug} className="pl-0 basis-full">
              <FeaturedSlide competition={c} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="mt-4 space-y-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/8">
          <div
            role="progressbar"
            aria-label="Time until next featured prize"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressPct)}
            className={cn(
              "h-full rounded-full transition-[width] duration-150 ease-linear",
              accentStyles[slides[current]?.accent ?? "coral"].fill,
              userPaused ? "opacity-40" : "opacity-100",
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {slides.map((c, i) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => {
                  lastTickRef.current = performance.now();
                  setProgressPct(0);
                  api?.scrollTo(i);
                }}
                className={cn(
                  "group flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1 transition",
                  i === current
                    ? "bg-ink text-cream ring-ink"
                    : "bg-paper text-ink/60 ring-ink/10 hover:text-ink hover:ring-coral/30",
                )}
                aria-label={`Go to slide ${i + 1}: ${c.title}`}
                aria-current={i === current ? "true" : undefined}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full transition",
                    i === current ? "bg-coral" : "bg-ink/30 group-hover:bg-coral/60",
                  )}
                />
                <span className="hidden sm:inline">{c.category}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 md:hidden">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => {
                lastTickRef.current = performance.now();
                setProgressPct(0);
                api?.scrollPrev();
              }}
              aria-label="Previous featured prize"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => {
                lastTickRef.current = performance.now();
                setProgressPct(0);
                api?.scrollNext();
              }}
              aria-label="Next featured prize"
            >
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
