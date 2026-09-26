// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Public, auth-free routes to prerender to <route>/index.html at build time.
// NOTE: TanStack auto-collects every static route as a prerender candidate, so
// the filter below is what actually contains the pass to this list. Auth-gated
// (admin/*, dashboard/*, partner/*) and dynamic (competitions/$slug,
// draw-verification/*) routes stay SSR-only.
const PRERENDER_PATHS = [
  "/",
  "/competitions",
  "/winners",
  "/about",
  "/how-it-works",
  "/faq",
  "/contact",
  "/competition-rules",
  "/terms-and-conditions",
  "/privacy-policy",
  "/trust-safety",
  "/become-a-partner",
];

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Static prerendering: prerendered HTML is a build-time snapshot — the
    // client hydrates and refetches live Firestore data.
    prerender: {
      enabled: true,
      crawlLinks: false,
      autoSubfolderIndex: true,
      filter: (page: { path: string }) => {
        const p = page.path.replace(/\/+$/, "") || "/";
        return PRERENDER_PATHS.includes(p);
      },
    },
    pages: PRERENDER_PATHS.map((path) => ({ path, prerender: { enabled: true, crawlLinks: false } })),
  },
});
