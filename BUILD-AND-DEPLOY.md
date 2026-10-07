# Rafilla Grand Prizes — Build & Deploy Runbook

Frontend-only build & deploy guide. Stack: Vite 8 + TanStack Start/Router (Nitro preset) + Tailwind v4 + TypeScript.

---

## 0. Preflight

- **Node.js**: `v20.11+` (LTS recommended).
- **npm**: `v10+` (npm workspace & peer deps parity).
- **OS**: Works on macOS, Linux, and Windows PowerShell.

If you use `nvm`:

```bash
nvm install 20
nvm use 20
node -v   # → v20.x.y
npm -v    # → 10.x.y
```

---

## 1. Install

```bash
git clone <your-repo-url> rafilla-grand-prizes
cd rafilla-grand-prizes
npm install
```

Environment:

```bash
cp .env.example .env
# fill .env using the inline documentation comments
```

> Never commit `.env`. It is already listed in `.gitignore` by convention.

---

## 2. Local development

```bash
npm run dev
# → Vite + TanStack Start SSR dev server → http://localhost:8080
```

- Hot Module Replacement (HMR) is enabled for all TS/TSX/CSS.
- Route files live in `src/routes/` with TanStack Router file-based conventions.
- Public assets (images, favicon, robots): `public/` folder.

---

## 3. Lint & typecheck

Strict TypeScript (see `tsconfig.json` — `strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, etc.):

```bash
npx tsc --noEmit
# Exit 0 → OK
# Non-zero → pre-existing baseline errors only; NEW errors from the current
# batch of edits MUST be fixed before deploy.
```

Optional lint + format:

```bash
npm run lint            # eslint
npm run format          # prettier --write
```

---

## 4. Automated tests

### 4.1 Unit tests — Vitest + Testing Library

```bash
npm run test            # vitest run — CI-friendly (single run)
npm run test:watch      # vitest watch mode — local TDD
npm run test:ui         # vitest --ui — browser UI at http://localhost:51204/__vitest__/
```

Suites included (folder `tests/unit/`):

| Suite                   | File                        | Count   |
| ----------------------- | --------------------------- | ------- |
| `formatNaira` formatter | `utils.test.ts`             | 9       |
| `useCountdown` hook     | `countdown.test.ts`         | 4       |
| `applySort` helper      | `filter.test.ts`            | 11      |
| `getPasswordStrength`   | `password-strength.test.ts` | 9       |
| **Total**               |                             | **33+** |

### 4.2 E2E smoke — Playwright

First install Playwright browser binaries (one-time, ~200 MB for Chromium):

```bash
npx playwright install chromium
```

Then, in **terminal A** start the dev server:

```bash
npm run dev
```

In **terminal B**, run smoke suite against it:

```bash
npm run e2e             # headless Chromium, baseURL http://127.0.0.1:8080
npm run e2e:ui          # Playwright Inspector UI mode
```

Tests (`tests/e2e/smoke.spec.ts`):

1. Home page title + copy "Fair draws. Real prizes."
2. Navigate to `/competitions` — grid with ≥ 3 card View/Enter links.
3. Click 1st card → competition detail, `Enter draw` CTA visible.
4. Click `Enter draw` → ticket purchase modal dialog visible, qty controls present.

Screenshots on each step land in `tests/e2e/screenshots/`.

---

## 5. Production build

```bash
npm run build
```

Build output structure:

```
.output/
├── public/                       # Static: hashed JS/CSS, JPGs, favicon, robots
│   └── assets/                   #   → long-term Cache-Control (1 year)
└── server/
    ├── index.mjs                 # SSR entry (Vercel / Node runtime)
    ├── _ssr/                     # Route-level code-split chunks
    ├── _libs/                    # Vendor chunks
    ├── _runtime.mjs              # Nitro/TanStack runtime glue
    ├── wrangler.json             # Cloudflare alternative preset
    └── nitro.json
```

Route-level code-splitting is verified by the build log (one `.mjs` per route).
Total client bundles for the shared TanStack router stay below budget.

Preview the built output locally:

```bash
npx vite preview
# → browse preview server to verify production behavior.
```

---

## 6. Deploy targets

### 6.1 Vercel (recommended)

Install the Vercel CLI once globally (or use `npx vercel`):

```bash
npm i -g vercel
```

First-time project link (answer the prompts, **override** build command if asked):

```bash
vercel link
# → scope, project name, link to ./
vercel env add VITE_SITE_URL             # production
vercel env add VITE_SITE_NAME
vercel env add VITE_FIREBASE_API_KEY
# … repeat for every variable in .env.example
```

Production deploy:

```bash
vercel --prod
```

After the first deploy, every push to the default branch will auto-deploy
thanks to Vercel's GitHub/GitLab integration.

Key file: `vercel.json` at project root contains:

- `framework: null` (custom TanStack Start + Nitro, not the Next.js preset)
- `buildCommand: npm run build`
- `outputDirectory: .output`
- Security headers on all routes (X-Frame-Options, Referrer-Policy, etc.)
- Long-term immutable caching for `/assets/*`
- Universal rewrite to `/server/index.mjs` (SSR entry)

### 6.2 Shared cPanel / traditional Node host (Namecheap)

Split layout — static frontend in `public_html` (served by Apache), Node
backend in `~/backend` (mounted at `/api`), same build ID on both sides:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build-namecheap.ps1
# → deploy/namecheap/backend.zip + deploy/namecheap/frontend.zip
# (build ID shared: VITE_BUILD_ID baked into the HTML, build-info.json
#  surfaced by /api/health — the site banners instead of silently breaking
#  if the two sides ever drift apart)
```

Manual equivalent (only if the wrapper cannot run):

1. `powershell -ExecutionPolicy Bypass -File scripts/build-namecheap.ps1`
   (stamps, builds, prerenders 12 public pages against the fresh server,
   then packages — the script fails loudly if prerendered HTML references
   missing assets or the build stamp is absent).
2. **Frontend** — cPanel File Manager: open `public_html`. Upload
   `frontend.zip` INTO `public_html` and Extract here, so files land as
   `public_html/index.html`, `public_html/assets/...`,
   `public_html/.htaccess` (no extra subfolder level). If
   `public_html/.htaccess` ALREADY exists (cPanel rules, redirects): do NOT
   overwrite it — merge the "Raffila storefront" rewrite block into the
   existing file instead. (File Manager hides dotfiles unless "Show Hidden
   Files" is enabled in its Settings.) Leave any `public_html/api` folder
   cPanel created for the Node app mount alone.
3. **Backend** — File Manager: create `~/backend` (home dir, OUTSIDE
   `public_html`). Upload `backend.zip` INTO `~/backend` and Extract here,
   so files land as `~/backend/server/index.mjs` (no extra subfolder level).
4. **Secrets** — pre-installed: `backend.zip` ships a `~/backend/.env` FILE
   (inside `~/backend/`, next to `server/` — no new folder) baked from the
   release machine. Verify/rotate any time by editing it in File Manager
   ("Show Hidden Files" on), or override keys in the Node app's
   "Environment variables" section (real env vars always win). Restart the
   app after changing secrets. Needed: `PAYSTACK_SECRET_KEY` plus
   `FIREBASE_SERVICE_ACCOUNT_JSON` (or all three
   `FIREBASE_ADMIN_PROJECT_ID` / `_CLIENT_EMAIL` / `_PRIVATE_KEY`). Never
   `VITE_*` here. The zip contains live secrets — never share it.
5. cPanel → Setup Node.js App → Create Application: Node 20+, Production,
   Application root `backend`, **Application URL = the domain with path
   `api`** (e.g. `https://raffila.com/api`), Application startup file
   `server/index.mjs`. Click "Run NPM Install" (verifies/reconciles the
   shipped `backend/node_modules`: firebase-admin pinned exact + lockfile —
   ~1 minute), then Start (no compiler needed, pure-JS tree).
6. Save, Start (or Restart), wait 60-90 seconds (cold boot loads the Admin
   SDK — first requests during boot can fail transiently), then verify it
   is ONE matching build: `https://raffila.com/api` must return the JSON
   success document (`"ok": true, "message": "API running"` — served for
   the mount root in both Passenger modes), and
   `https://raffila.com/api/health` must say "API running successfully"
   with the build ID from step 1. View Source on `https://raffila.com/` →
   `<meta name="build-id">` must equal it. Also open
   `https://raffila.com/auth` directly (SSR via the backend) and check
   Admin → Settings → Payments & API status.
7. If the app won't start, read `~/backend/stderr.log` first — it holds the
   crash reason. If pages 404 but `/api/health` works, the `public_html`
   rewrite block (`.htaccess`) is missing or unmerged. If a page ever shows
   unstyled content or dead buttons after an upload, hard-refresh
   (`Ctrl+Shift+R`): the browser is replaying a cached older version. If it
   persists on fresh browsers, the two sides are from different builds —
   re-upload BOTH zips from one run.

How it fits together: Apache serves prerendered pages/assets straight from
`public_html`; the `.htaccess` forwards everything else (SSR pages, server
functions `/_serverFn/*`, `/sitemap.xml`) to the Node app at `/api`. The
server (`src/server.ts`) accepts backend paths both with and without the
`/api` mount prefix, so it works however Passenger maps the mount — no
per-host tuning needed. New `/api/*` routes must be added to
`BACKEND_API_ROUTES` in `src/lib/backend-mount.ts` or they will be
misrouted to pages.

### 6.3 Cloudflare Workers (Nitro default preset)

Build already emits a `wrangler.json` inside `.output/server` because the Nitro preset defaults to `cloudflare-module`. For a CF deploy:

```bash
npx wrangler deploy --minify .output/server/index.mjs
# — or wire directly to Nitro preset via:
# NITRO_PRESET=cloudflare npm run build
```

---

## 7. Environment variables summary

| Variable                 | Scope         | Purpose                               |
| ------------------------ | ------------- | ------------------------------------- |
| `VITE_SITE_URL`          | Client+Server | Canonical public URL                  |
| `VITE_SITE_NAME`         | Client+Server | Brand string                          |
| `VITE_FIREBASE_*`        | Client        | Firebase JS SDK config (Phase 2)      |
| `PAYSTACK_SECRET_KEY`    | Server only   | Wallet funding & ticket checkout      |
| `FLUTTERWAVE_SECRET_KEY` | Server only   | Fallback processor                    |
| `TERMII_API_KEY`         | Server only   | OTP SMS + winner alerts               |
| `SENDGRID_API_KEY`       | Server only   | Transactional email                   |
| `ADMIN_EMAILS`           | Server only   | Comma-separated super-admin whitelist |

---

## 8. Rollback procedure

Git-based (Vercel):

1. Locate the last passing SHA on the default branch: `git log --oneline -n 10`
2. Reset branch to the known-good commit:
   ```bash
   git reset --hard <GOOD_SHA>
   git push --force-with-lease origin <default-branch>
   ```
3. Vercel/GitHub auto-deploys the forced push. If it does not, run `vercel --prod` manually.
4. Validate: vitest, smoke Playwright, and manually click through a purchase flow.

UI-based (Vercel dashboard):

- Navigate to **Deployments → click the prior deployment → Promote to Production**.
- This is the zero-downtime option and is preferred when you already have a known-good previous deployment artifact.

---

## 9. Quick checklist per release

1. `npx tsc --noEmit` — no _new_ errors vs baseline.
2. `npm test` — 87/87 passing.
3. `npm run build` — exit 0.
4. (If E2E) `npm run dev` + `npm run e2e` — 7/7 smoke tests green.
5. Push → Vercel auto-deploy → manually open `/` + `/competitions` + `Enter draw` modal once.
6. Notify ops via the deploy checklist in Slack/Notion.
