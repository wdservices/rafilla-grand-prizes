import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import {
  AlertTriangle,
  RefreshCw,
  Phone,
  ChevronDown,
  ChevronUp,
  Clock,
  FileCode,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/raffila/site-header";
import { SiteFooter } from "@/components/raffila/site-footer";

function generateRequestId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "REQ-";
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function ErrorPage({ error, reset }: { error?: Error; reset?: () => void }) {
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();

  const timestamp = new Date().toISOString();
  const requestId = generateRequestId();

  const mockStack = error
    ? error.stack
    : `Error: Render failure
  at PublicRoute._callee (src/routes/__root.tsx:142:19)
  at tryCatch (node_modules/@tanstack/router-core/dist/esm/index.mjs:2280:40)
  at invoke (node_modules/regenerator-runtime/runtime.js:63:22)
  at eval (node_modules/regenerator-runtime/runtime.js:293:20)
  at asyncGeneratorStep (node_modules/regenerator-runtime/runtime.js:244:24)
  at _next (node_modules/regenerator-runtime/runtime.js:265:9)
  at Promise.then (<anonymous>)
  at Object.eval (node_modules/@tanstack/react-router/dist/esm/index.js:112:11)`;

  return (
    <div className="min-h-screen bg-cream text-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto grid size-24 place-items-center rounded-[28px] bg-coral/15 text-coral">
            <AlertTriangle className="size-12" strokeWidth={1.8} />
          </div>
          <h1 className="mt-8 font-display text-[clamp(2.5rem,7vw,4.5rem)] font-extrabold leading-[1.05] tracking-tight text-ink">
            Something went wrong <span className="text-coral">😓</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink/65 sm:text-lg">
            Raffila hit a snag. The team has been notified — try again in a moment or reach support
            if it persists.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                reset?.();
                router.invalidate();
                if (typeof window !== "undefined") window.location.reload();
              }}
            >
              <RefreshCw className="size-4" /> Try again
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.navigate({ to: "/contact" })}>
              <Phone className="size-4" /> Contact support
            </Button>
          </div>

          <div className="mt-14 rounded-[28px] bg-paper p-6 text-left ring-1 ring-ink/5 sm:p-8">
            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3 text-left ring-1 ring-ink/5 transition-colors hover:bg-cream/80"
            >
              <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-ink/55">
                <FileCode className="size-4 text-coral" />
                Show technical details
              </span>
              {showDetails ? (
                <ChevronUp className="size-4 shrink-0 text-ink/55" />
              ) : (
                <ChevronDown className="size-4 shrink-0 text-ink/55" />
              )}
            </button>

            <div
              className={`grid overflow-hidden transition-all duration-200 ${showDetails ? "mt-5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="min-h-0 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-cream p-4 ring-1 ring-ink/5">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink/45">
                      <Clock className="mr-1 inline size-3" /> Timestamp
                    </p>
                    <p className="mt-1.5 font-mono text-xs font-bold text-ink">{timestamp}</p>
                  </div>
                  <div className="rounded-2xl bg-lilac/30 p-4 ring-1 ring-ink/5">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink/45">
                      <FileCode className="mr-1 inline size-3" /> Request ID
                    </p>
                    <p className="mt-1.5 font-mono text-xs font-bold text-ink break-all">
                      {requestId}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl bg-ink p-5 text-cream ring-1 ring-ink/5">
                  <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-cream/50">
                    Stack trace
                  </p>
                  <pre className="max-h-72 overflow-auto font-mono text-[11px] leading-relaxed text-cream/85">
                    {mockStack}
                  </pre>
                </div>
                <p className="text-center text-xs font-bold text-ink/45">
                  When contacting support, please include the Request ID above.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
