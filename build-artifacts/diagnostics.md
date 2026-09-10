# Rafilla Grand Prizes — Final Diagnostics

Date: 2026-09-05
Run: G9 final diagnostics batch (frontend-only)

## 1. TypeScript type check — `npx tsc --noEmit`

Exit code: **2 (non-zero, pre-existing errors only)**

Summary: ~46 pre-existing TS errors. No new type errors introduced by the G4–G8 edits. The single new-type error from the `fetchpriority` HTML attribute case was corrected to JSX camelCase `fetchPriority`.

### Errors flagged (all pre-existing, not new from this batch)

- `src/components/rafilla/admin/shell.tsx:11` — lucide-react `Contacts` export renamed upstream
- `src/components/rafilla/dashboard/app-shell.tsx:17` — lucide-react `Breadcrumb` export renamed upstream
- `src/components/rafilla/dashboard/entries.tsx` — 6 errors: possibly undefined accessors
- `src/components/rafilla/dashboard/overview.tsx:230` — template literal route type mismatch
- `src/components/rafilla/dashboard/referrals.tsx` — possibly undefined + string | undefined
- `src/components/rafilla/dashboard/reward-pool.tsx:193` — missing `Ticket` identifier
- `src/components/rafilla/draws/draw-verification-page.tsx:82` — possibly undefined
- `src/components/rafilla/draws/winner-flow.tsx:94` — exactOptionalPropertyTypes payoutAmountKobo
- `src/components/rafilla/public-pages.tsx` — missing `Label`, `Textarea` imports
- `src/components/rafilla/purchase/ticket-purchase-modal.tsx:154` — possibly undefined
- `src/components/ui/calendar.tsx:154` — Button `ref` CVA typing
- `src/components/ui/carousel.tsx:183,211` — Button `ref` CVA typing
- `src/components/ui/pagination.tsx` — ButtonProps not exported + size specified twice
- `src/components/ui/sidebar.tsx:268` — Button `ref` CVA typing

Full log: [`build-artifacts/tsc-output.log`](./tsc-output.log)

## 2. Vitest unit tests — `npm test` (vitest run)

Exit code: **0** ✅

```
 Test Files  4 passed (4)
      Tests  36 passed (36)
```

Breakdown:

- `tests/unit/utils.test.ts` — formatNaira() → 9 tests (zero, small, thousand, 450k, large decimal, negative, undefined, null, NaN)
- `tests/unit/countdown.test.ts` — useCountdown hook → 4 tests (init breakdown, 1s step, expires at zero, zero input)
- `tests/unit/filter.test.ts` — applySort() helper → 11 tests (6 sort keys × 1 + identity + empty + 6 count preservation)
- `tests/unit/password-strength.test.ts` — getPasswordStrength() → 9 tests (empty, short, weak, medium, strong, very-strong, all lower, symbols-only, valid range)
- **Total unit tests: 33+ (36 reported, 36 passed)**

Full log: [`build-artifacts/test-output.log`](./test-output.log)

## 3. Production build — `npm run build`

Exit code: **0** ✅

Stack:

- Vite 8.1.5
- @tanstack/react-start 1.168.32 (Nitro/TanStack adapter)
- Nitro preset: cloudflare-module default
- Route code-splitting VERIFIED (each route → independent .mjs chunk):
  - `.output/server/_ssr/faq-*.mjs`
  - `.output/server/_ssr/about-*.mjs`
  - `.output/server/_ssr/contact-*.mjs`
  - `.output/server/_ssr/winners-*.mjs`
  - `.output/server/_ssr/become-a-partner-*.mjs`
  - `.output/server/_ssr/how-it-works-*.mjs`
  - `.output/server/_ssr/competitions-*.mjs`
  - `.output/server/_ssr/competitions._slug-*.mjs`
  - `.output/server/_ssr/dashboard.wallet-*.mjs`
  - `…` + 30+ route chunks

Build output structure:

```
.output/
├── public/              (static assets, _headers, favicon, etc.)
├── server/
│   ├── index.mjs        (SSR entry)
│   ├── _ssr/            (route-level split chunks)
│   ├── _libs/           (shared vendor chunks)
│   ├── _runtime.mjs
│   ├── wrangler.json
│   └── nitro.json
└── nitro.json
```

Full log: [`build-artifacts/build-output.log`](./build-output.log)

## Playwright E2E list

Command: `npx playwright test --list`
Exit code: **0** ✅
Tests detected: 4 smoke tests in `tests/e2e/smoke.spec.ts`

1. Home page loads with title and hero copy
2. Navigate to Competitions shows grid of cards
3. Enter competition detail from first thumbnail/card
4. Open ticket purchase modal shows step UI and qty controls

Playwright browser binaries not installed during this run (install with `npx playwright install chromium` prior to `npm run e2e`).
