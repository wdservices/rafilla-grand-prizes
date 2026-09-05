import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Clock3,
  Instagram,
  Mail,
  MapPin,
  Menu,
  ShieldCheck,
  Sparkles,
  Ticket,
  WalletCards,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";

import { CompetitionCard } from "@/components/rafilla/competition-card";
import { WinnerCard } from "@/components/rafilla/winner-card";
import { Button } from "@/components/ui/button";
import {
  competitions,
  featuredCompetition,
  formatNaira,
  getCompetition,
  getProgress,
  faqs,
  winnerCards,
} from "@/lib/rafilla-data";

export function HomePage() {
  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 sm:pt-12 lg:px-8 lg:pb-12">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="coral">
            <span className="size-2 rounded-full bg-coral" /> Featured prize
          </Pill>
          <Pill>
            <BadgeCheck className="size-3.5 text-mint" /> Verifiable draw
          </Pill>
        </div>
        <h1 className="raf-rise mt-5 max-w-3xl font-display text-[clamp(3rem,9vw,6.5rem)] font-extrabold leading-[0.92] tracking-tight text-ink">
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
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-center">
          <CompetitionCard competition={featuredCompetition} featured />
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
          <CompetitionCard competition={competitions[1]} />
          <CompetitionCard competition={competitions[2]} />
          <div className="hidden lg:block">
            <CompetitionCard competition={competitions[0]} />
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
    </main>
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

export function CompetitionsPage() {
  const [category, setCategory] = useState("All categories");
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      competitions.filter(
        (competition) =>
          (category === "All categories" || competition.category === category) &&
          competition.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [category, query],
  );
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
      <PageIntro
        eyebrow="The marketplace"
        title="Choose your next possibility."
        text="Premium prizes, straightforward entries, and a competition journey you can actually follow."
      />
      <div className="mt-8 flex flex-col gap-3 rounded-[22px] bg-paper p-3 ring-1 ring-ink/5 sm:flex-row">
        <label className="flex min-h-12 flex-1 items-center gap-3 rounded-full bg-cream px-4 text-sm font-bold text-ink/50">
          <span className="text-base">⌕</span>
          <span className="sr-only">Search competitions</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search competitions..."
            className="w-full bg-transparent text-ink outline-none placeholder:text-ink/40"
          />
        </label>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="min-h-12 rounded-full bg-lilac/20 px-4 text-sm font-extrabold text-ink outline-none"
        >
          <option>All categories</option>
          <option>Auto</option>
          <option>Tech</option>
          <option>Property</option>
        </select>
      </div>
      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm font-bold text-ink/50">{filtered.length} competitions</p>
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-ink/50">
          <Clock3 className="size-3.5" /> Updated for preview
        </span>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((competition) => (
          <CompetitionCard key={competition.slug} competition={competition} />
        ))}
      </div>
    </main>
  );
}

export function CompetitionDetailPage() {
  const { slug } = useParams({ from: "/competitions/$slug" });
  const competition = getCompetition(slug);
  if (!competition)
    return (
      <MissingPage
        title="Competition unavailable"
        text="This competition may have moved or is not available in the current preview."
      />
    );
  const progress = getProgress(competition);
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
      <Link to="/competitions" className="text-sm font-extrabold text-ink/50 hover:text-ink">
        ← All competitions
      </Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="overflow-hidden rounded-[28px] bg-lilac/30 p-3 ring-1 ring-ink/5">
          <img
            src={competition.image}
            alt={competition.imageAlt}
            width={1200}
            height={760}
            className="aspect-[4/3] w-full rounded-[22px] object-cover"
          />
        </div>
        <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <Pill tone={competition.accent === "coral" ? "coral" : undefined}>
              {competition.category}
            </Pill>
            <span className="rounded-full bg-mint/30 px-3 py-1.5 text-xs font-extrabold text-ink">
              {competition.status}
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
                {competition.prizeValue}
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
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-ink/10">
              <div className="h-full rounded-full bg-coral" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-sm font-extrabold text-coral">
              {(competition.totalEntries - competition.entriesSold).toLocaleString("en-NG")} entries
              remaining
            </p>
          </div>
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-cream p-4">
            <CalendarDays className="size-5 text-coral" />
            <div>
              <p className="text-xs font-bold text-ink/45">Competition closes</p>
              <p className="font-extrabold text-ink">{competition.closes}</p>
            </div>
          </div>
          <Button asChild variant="primary" size="lg" className="mt-5 w-full">
            <Link to="/auth">
              Enter now <ArrowRight className="size-4" />
            </Link>
          </Button>
          <p className="mt-3 text-center text-xs font-bold text-ink/45">
            You’ll need a Rafilla account before purchasing entries.
          </p>
        </div>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] bg-paper p-6 ring-1 ring-ink/5 sm:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
            Prize details
          </p>
          <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">What’s included</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {competition.specs.map((spec) => (
              <li key={spec} className="flex items-center gap-2 text-sm font-bold text-ink/65">
                <span className="grid size-5 place-items-center rounded-full bg-mint/40 text-xs text-ink">
                  ✓
                </span>
                {spec}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[28px] bg-lemon/35 p-6 ring-1 ring-ink/5 sm:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/45">
            Fairness note
          </p>
          <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">
            A draw you can follow.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/65">
            Entries are closed before the draw, the eligible pool is frozen, and verification
            details are published when available.
          </p>
          <Link
            to="/how-it-works"
            className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-ink underline decoration-coral decoration-2 underline-offset-4"
          >
            How it works <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}

export function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
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
    </main>
  );
}

export function WinnersPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
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
    </main>
  );
}

export function PartnerPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
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
    </main>
  );
}

export function AboutPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
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
    </main>
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
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
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
    </main>
  );
}

export function ContactPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
      <PageIntro
        eyebrow="Let’s talk"
        title="Questions, partnerships, or support."
        text="Tell us what you need and the Rafilla team will point you in the right direction."
      />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <a
          href="mailto:hello@raffila.com"
          className="rounded-[22px] bg-paper p-6 ring-1 ring-ink/5 hover:-translate-y-1"
        >
          <Mail className="size-6 text-coral" />
          <h2 className="mt-5 font-display text-xl font-extrabold text-ink">Email us</h2>
          <p className="mt-2 text-sm font-bold text-ink/55">hello@raffila.com</p>
        </a>
        <a
          href="https://instagram.com"
          className="rounded-[22px] bg-paper p-6 ring-1 ring-ink/5 hover:-translate-y-1"
        >
          <Instagram className="size-6 text-coral" />
          <h2 className="mt-5 font-display text-xl font-extrabold text-ink">Follow along</h2>
          <p className="mt-2 text-sm font-bold text-ink/55">@raffila</p>
        </a>
        <div className="rounded-[22px] bg-lilac/30 p-6 ring-1 ring-ink/5">
          <MapPin className="size-6 text-coral" />
          <h2 className="mt-5 font-display text-xl font-extrabold text-ink">Made for Nigeria</h2>
          <p className="mt-2 text-sm font-bold text-ink/55">Web platform · Nigerian naira</p>
        </div>
      </div>
    </main>
  );
}

export function DrawVerificationPage() {
  const { campaign } = useParams({ from: "/draw-verification/$campaign" });
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
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
    </main>
  );
}

export function AuthPreviewPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:py-20">
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
    </main>
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
      <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-6xl">
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
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <CircleHelp className="mx-auto size-10 text-coral" />
      <h1 className="mt-5 font-display text-3xl font-extrabold text-ink">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink/60">{text}</p>
      <Button asChild variant="dark" size="md" className="mt-6">
        <Link to="/competitions">Back to competitions</Link>
      </Button>
    </main>
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
    <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
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
    </main>
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
    <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
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
    </main>
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
    <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
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
    </main>
  );
}
