# RAFILLA — Phase 2–6 Implementation Tasks

Derived from [spec.md](./spec.md). Covers the 6-Phase sequence defined in the
master spec, mapped to implementation items. Each task carries its own
Test Requirements (TR) as either `rule` (binary) or `rubric` (scored).

Status field lifecycle: `pending` → `in_progress` → `completed` (evidence).
Blocked tasks get `Blocked By` + `Unblock Condition`.

---

## Phase T0 — Foundation (Backend wiring, Auth, DB Schema, Legal pages)

### Task 1: Connect Supabase backend + project config

**Scope**: Initialize Supabase project; expose anon/service_role via env;
wire Supabase client in a shared `@/lib/supabase` module (server + browser
clients); add `.env.example` with all required vars.

**Covers**: F-68, Assumptions in spec

**Priority**: high

**Status**: pending

**Test Requirements**

- TR-1.1 (rule): `SUPABASE_URL`, `SUPABASE_ANON_KEY` in .env and app can
  query the public schema from both client and server-side loader.
- TR-1.2 (rule): No secret key in client bundle; only anon key reaches the
  browser.
- TR-1.3 (rule): `.env.example` documents every required env var.

**Completion Evidence**: _(filled at completion)_

---

### Task 2: Database schema (all core entities, migrations, seed)

**Scope**: SQL migration(s) for §41 entities: users, user_profiles, roles,
permissions, user_roles, partners, partner_profiles, partner_assets,
campaigns (+ media, rules), tickets, ticket_reservations, orders,
order_items, payments, payment_webhooks, wallets, wallet_transactions,
ledger_entries, referrals, referral_relationships, commissions,
commission_transactions, payouts, payout_bank_accounts, draws, draw_results,
winner_claims, reward_pool / reward_pool_transactions, crm_*,
notifications, verification_records, fraud_events, risk_scores,
audit_logs, platform_config. Seed with clearly-marked DEMO competitions
(matching the existing 3 Mercedes/Nova/Apartment fixtures).

**Covers**: F-66, F-65 (money as integer kobo), F-01 (real data)

**Priority**: high

**Dependencies**: Task 1

**Test Requirements**

- TR-2.1 (rule): Migration runs cleanly on Supabase Postgres; no errors.
- TR-2.2 (rule): Seed data inserts 3 demo competitions and they appear in
  the public competitions page via real DB calls.
- TR-2.3 (rule): Every monetary column in the schema is bigint (kobo) and
  the seed uses kobo.
- TR-2.4 (rubric): Schema design quality (0-3; ≥2 required). Anchors: 3 =
  clean FKs, indexes on common lookups, no duplicated financial state,
  sensible enum/constraints; 2 = functional but light on indexes; 1 = data
  duplication or missing FKs.

**Completion Evidence**: _(filled at completion)_

---

### Task 3: Supabase Auth + full Register/Login pages (replace `/auth` stub)

**Scope**: Real `/auth` page with tabbed Login / Register. Register fields:
username, email, phone, password, confirm, address, DOB, **required Terms
checkbox** with links to /terms-and-conditions, /privacy-policy,
/competition-rules. Terms acceptance persisted (user_terms_acceptances).
Email verification (Supabase email confirm). Session via Supabase cookies.

**Covers**: F-08, F-09, F-10, F-12, F-14, F-15

**Priority**: high

**Dependencies**: Task 2

**Test Requirements**

- TR-3.1 (rule): Register form rejects submission if Terms checkbox is
  unchecked and shows an inline error.
- TR-3.2 (rule): Registering stores a terms_acceptance row with version,
  user_id, timestamp, IP (where possible).
- TR-3.3 (rule): New user cannot browse protected routes until email is
  verified (or verification status is surfaced).
- TR-3.4 (rule): Login works with email+password, sets session.

**Completion Evidence**: _(filled at completion)_

---

### Task 4: Google Sign-In + "Complete your Rafilla profile" gate

**Scope**: Enable Google OAuth in Supabase; add Google button to /auth.
After Google auth, if phone/address/DOB/etc are missing → route to a
"Complete your Rafilla profile" screen that blocks access to dashboard
until filled.

**Covers**: F-13

**Priority**: medium

**Dependencies**: Task 3

**Test Requirements**

- TR-4.1 (rule): User who signs in with Google with incomplete profile is
  redirected to profile-complete screen and cannot reach /dashboard.
- TR-4.2 (rule): Once profile complete, future Google logins go straight
  through.

**Completion Evidence**: _(filled at completion)_

---

### Task 5: Phone OTP verification

**Scope**: Send OTP via SMS (provider TBD, env-configurable; build
provider-agnostic SMS adapter). Verify OTP; write verification_records
row. Gate wallet funding / ticket purchase until phone is verified.

**Covers**: F-11

**Priority**: medium

**Dependencies**: Task 3

**Test Requirements**

- TR-5.1 (rule): Rate limit on OTP send/verify (per user / per phone).
- TR-5.2 (rule): User with unverified phone is blocked from funding and
  purchase flows with a clear CTA to verify.

**Completion Evidence**: _(filled at completion)_

---

### Task 6: Password reset flow

**Scope**: "Forgot password" → email link → new password form.

**Covers**: F-12

**Priority**: medium

**Dependencies**: Task 3

**Test Requirements**

- TR-6.1 (rule): Reset link with valid token resets password; invalid token
  rejected with human-readable error.

**Completion Evidence**: _(filled at completion)_

---

### Task 7: Legal placeholder pages + homepage missing blocks

**Scope**: Add routes `/terms-and-conditions`, `/privacy-policy`,
`/competition-rules` with prominent "PENDING LEGAL REVIEW" banner and
placeholder section headings. Also add the homepage missing sections
(Recent Winners, FAQ accordion, Final CTA "Your next big win could start
here") referenced in spec §4 that the current `HomePage` does not render.
Add sitemap.xml + robots.txt endpoints.

**Covers**: F-06, F-07, F-15, AC-21

**Priority**: low

**Test Requirements**

- TR-7.1 (rule): All three legal routes render; terms checkbox on register
  links to correct URLs.
- TR-7.2 (rule): `/sitemap.xml` lists competitions + public pages;
  `/robots.txt` disallows /dashboard, /admin, /partner.
- TR-7.3 (rule): Homepage visually includes the added sections without
  regressing existing Hero/Featured/HowItWorks/PartnerCTA.

**Completion Evidence**: _(filled at completion)_

---

## Phase 2 — User Dashboard, Wallet, Payment, Ticket Engine

### Task 8: Authenticated shell + RBAC middleware

**Scope**: TanStack protected routes under `/dashboard`, `/partner`,
`/admin`. Server-side route loaders verify session + role; redirect to
/auth if not logged in. Add mobile bottom nav for authenticated users
(Home, Competitions, Wallet, Entries, Account). Add AuthProvider +
useUser hook.

**Covers**: F-28, F-46 (RBAC foundation)

**Priority**: high

**Dependencies**: Task 3

**Test Requirements**

- TR-8.1 (rule): Browsing `/dashboard` without session redirects to /auth.
- TR-8.2 (rule): User role cannot reach `/admin/*`; Partner role cannot
  reach `/admin/*`; Admin can reach all. (Enforced server-side, not just
  UI.)

**Completion Evidence**: _(filled at completion)_

---

### Task 9: User Dashboard overview + Wallet page

**Scope**: `/dashboard` overview with welcome, wallet balance, referral
earnings (available/pending), active entries, competitions entered,
winnings, recent transactions, referral performance, verification
badges, quick actions. `/dashboard/wallet` with spend-only balance, FUND
WALLET, VIEW TRANSACTIONS, EXPLORE COMPETITIONS — **no withdrawal button
for standard wallet.**

**Covers**: F-16, F-17

**Priority**: high

**Dependencies**: Task 8

**Test Requirements**

- TR-9.1 (rule): /dashboard/wallet has NO "withdraw" action for the
  standard Rafilla Wallet.
- TR-9.2 (rule): All shown numbers match ledger sum (wallet balance =
  sum of ledger entries).
- TR-9.3 (rule): Empty states exist for no entries, no transactions.

**Completion Evidence**: _(filled at completion)_

---

### Task 10: Wallet funding (Paystack/Flutterwave) + webhook verification

**Scope**: Server-side funding initiation that creates a pending payment
record and returns gateway checkout URL/session. Webhook handler (Supabase
Edge Function or TanStart endpoint) that **verifies gateway signature**
before crediting wallet via a DB transaction (insert ledger + update
balance atomically). Payment states: PENDING/SUCCESSFUL/FAILED/REVERSED/
REFUNDED.

**Covers**: F-18, F-19, F-20, F-64

**Priority**: high

**Dependencies**: Task 9

**Test Requirements**

- TR-10.1 (rule): Webhook with invalid signature is rejected with 401 and
  does NOT credit wallet.
- TR-10.2 (rule): Same webhook event received twice (replay) does NOT
  double-credit wallet (idempotency by gateway reference).
- TR-10.3 (rule): Successful funding creates WALLET_FUNDING ledger entry
  (integer kobo) and payment row.
- TR-10.4 (rubric): Payment UX (0-3; ≥2 required). Anchors: 3 = clear
  loading/success/error, gateway fallback instructions, return URL
  behavior polished; 2 = functional but generic; 1 = confusing or leaves
  user stuck.

**Completion Evidence**: _(filled at completion)_

---

### Task 11: My Entries, Transactions, Profile, Security pages

**Scope**: `/dashboard/entries` (unique RF-YYYY-XXXXXXXX IDs, competition,
date, status, filterable). `/dashboard/transactions` (wallet + referral
ledger combined, search/filter). `/dashboard/profile` (edit, verification
status badges). `/dashboard/security` (password change, 2FA scaffolding,
active sessions).

**Covers**: F-22, F-23, F-26, F-27, F-31 (unique IDs)

**Priority**: high

**Dependencies**: Task 9

**Test Requirements**

- TR-11.1 (rule): Each purchased entry shows a globally-unique ID of the
  form RF-YYYY-XXXXXXXX.
- TR-11.2 (rule): Transactions list includes every ledger type; numbers
  reconcile with wallet balance.
- TR-11.3 (rule): Empty states rendered for each list page.

**Completion Evidence**: _(filled at completion)_

---

### Task 12: Ticket purchase flow (Wallet & Referral sources) + Oversell protection

**Scope**: On `/competitions/$slug`, make "Enter now" work: select entry
quantity, check availability server-side, choose source (Wallet / Referral
Earnings), confirm → server creates temporary `ticket_reservations` row
with short TTL, then within an atomic DB transaction: verify reservation
not expired, verify wallet/referral balance, create order/order_items,
create tickets rows (sold += qty atomically with row lock or UPDATE...WHERE
cap check), debit ledger. Never trust frontend quantity. Idempotency key.

**Covers**: F-29, F-30, F-32, AC-07

**Priority**: highest

**Dependencies**: Task 9, Task 10

**Test Requirements**

- TR-12.1 (rule): Setting `entriesSold = totalEntries - 1` in DB and
  attempting to buy 2 entries from client fails gracefully (1 would have
  been possible but 2 is rejected; never overshoots).
- TR-12.2 (rule): Run a simulated 1000-concurrent buy against last 50
  entries → exactly 50 tickets exist afterward (run this as a pSQL or
  Edge Function test, record output).
- TR-12.3 (rule): Abandoned reservation expires after TTL and releases
  capacity.
- TR-12.4 (rule): Referral-earnings purchase debits referral ledger and
  does not touch wallet.
- TR-12.5 (rule): Unauthenticated "Enter now" click routes to /auth with
  return redirect, not a purchase flow.

**Completion Evidence**: _(filled at completion)_

---

### Task 13: Competitions page filters, search, sort + detail page polish

**Scope**: Move from stub in-memory filter to server-driven queries with
real DB columns: filters (category, price range, status, closing-soon,
featured, newest), search, sort (featured, newest, closing-soon,
most-popular). Detail page: live countdown, real progress %, draw
verification link (only after draw), partner info (where public),
related/similar competitions, FAQs block, trust/fairness, competition
rules block.

**Covers**: F-01, F-02, F-03

**Priority**: medium

**Dependencies**: Task 2, Task 1

**Test Requirements**

- TR-13.1 (rule): Every filter + sort combination returns correct,
  server-validated results (can verify by setting up known seed and
  checking counts).
- TR-13.2 (rule): Countdown on detail page matches `closing_date` from DB
  and does not drift on tab switch for 60s.

**Completion Evidence**: _(filled at completion)_

---

## Phase 3 — Campaign management, Admin, Partner

### Task 14: Admin Dashboard overview + charts

**Scope**: `/admin` landing page with all KPIs from spec F-40 (Total Users,
Active Users, Partners, Active Competitions, Tickets Sold, Platform
Revenue, Wallet Funding, Referral Liability, Pending Payouts, Reward
Pool, Active Listings, Completed Competitions, Recent Winners, Fraud
Alerts) plus charts (revenue, ticket sales, user growth, competition
performance, referral activity, wallet activity, payouts).

**Covers**: F-40

**Priority**: high

**Dependencies**: Task 8

**Test Requirements**

- TR-14.1 (rule): Admin-only: role USER or PARTNER gets 403 (server-side,
  not hidden nav).
- TR-14.2 (rule): All KPIs match SQL aggregations over seeded data
  (spot-check 3 KPIs).

**Completion Evidence**: _(filled at completion)_

---

### Task 15: Admin User management + Partner management

**Scope**: User list with search/filters; user detail view showing
profile, wallet, referral activity, entries, transactions, verification
status, risk status; actions: suspend / restore; audit history view.
Partner applications queue + approve/reject; partner profile view.

**Covers**: F-41 (excl. financial adjustment), partial F-43

**Priority**: high

**Dependencies**: Task 14

**Test Requirements**

- TR-15.1 (rule): Suspended user cannot log in (server auth check, not
  just frontend banner).
- TR-15.2 (rule): Any wallet financial adjustment requires amount +
  reason + reference + admin ID + audit log row. Admin cannot silently
  edit a balance column.
- TR-15.3 (rule): Approving partner application creates partner role.

**Completion Evidence**: _(filled at completion)_

---

### Task 16: Admin Competition management (full 14-state lifecycle)

**Scope**: CRUD for competitions: upload images (Supabase Storage),
configure title/description/category/prize/value/ticket price/ticket
quantity/campaign dates/rules/status/partner/featured/reward pool/draw
settings. Actions: preview, approve, publish, pause, close, archive.
Full 14-state DRAFT→…→COMPLETED workflow.

**Covers**: F-42, F-27 (asset management entities)

**Priority**: highest

**Dependencies**: Task 14

**Test Requirements**

- TR-16.1 (rule): All 14 lifecycle statuses are reachable via correct
  action sequences; invalid transitions rejected.
- TR-16.2 (rule): Only LIVE competitions appear on the public site;
  DRAFT/PENDING REVIEW/SCHEDULED are hidden from unauthenticated users.
- TR-16.3 (rule): Only users with PARTNER + asset_owner can see their own
  listings; cannot see another partner's.

**Completion Evidence**: _(filled at completion)_

---

### Task 17: Admin Payout workflow + reports

**Scope**: Payout request list with statuses (PENDING/UNDER REVIEW/
APPROVED/PROCESSING/PAID/REJECTED/FAILED/CANCELLED). Detail view:
bank info, referral balance, risk status, history, actions. Reports
module covering users, campaigns, tickets, revenue, wallet funding,
referral commissions, payouts, reward pool, partners, winners, refunds,
fraud events; filters + CSV export.

**Covers**: F-44, F-45, F-40

**Priority**: high

**Dependencies**: Task 14

**Test Requirements**

- TR-17.1 (rule): Payout approval (PAID) triggers corresponding
  referral ledger debit + payout row update atomically; if debit fails
  the status stays and the TX rolls back.
- TR-17.2 (rule): CSV export of reports has correct UTF-8 BOM and
  correct number formatting (Naira, not floats).
- TR-17.3 (rule): Approving payout for a user whose available referral
  balance is less than requested amount fails server-side.

**Completion Evidence**: _(filled at completion)_

---

### Task 18: Admin Platform Configuration + audit trail

**Scope**: Config page for: 5 referral rates (default 8/5/4/2/1), reward
pool %, campaign/ticket/payout thresholds, notification settings, fraud
thresholds. Every config change writes immutable audit_logs row
(previous_value, new_value, admin, timestamp, reason).

**Covers**: F-47, AC-15

**Priority**: medium

**Dependencies**: Task 14

**Test Requirements**

- TR-18.1 (rule): Changing referral rate L1 from 8→9 produces an audit
  row with old=8, new=9, admin id; subsequent commission calculations
  use 9.
- TR-18.2 (rule): Config pages with non-admin role → 403.

**Completion Evidence**: _(filled at completion)_

---

### Task 19: Partner Portal (Apply / Dashboard / My Listings / Submit Asset / Analytics)

**Scope**: `/partner` overview (Active Listings, Pending Listings, Total
Entries, Total Revenue/Amount Generated, campaigns, performance, recent
activity). My Listings table/cards per spec. Submit-an-Asset form (title,
category, description, asset value, multiple images via Storage, specs,
supporting docs, proof of ownership, additional info) → status = PENDING
REVIEW. Partner analytics + settlement tracking.

**Covers**: F-33, F-34, F-35, F-36, F-37, F-38, F-39, F-54

**Priority**: high

**Dependencies**: Task 8, Task 18

**Test Requirements**

- TR-19.1 (rule): Partner submitting an asset cannot set its status LIVE
  (only ADMIN can approve → status change).
- TR-19.2 (rule): Partner analytics only aggregates their own listings
  (never sees other partners' data).
- TR-19.3 (rule): Asset images upload to Supabase Storage under
  `partner-assets/{partner_id}/` with appropriate RLS.

**Completion Evidence**: _(filled at completion)_

---

## Phase 4 — Referral, Reward Pool, Payout, CRM

### Task 20: Referral engine (5-level tree + commissions)

**Scope**: Persistent referral code per user. `/?ref=RAF123` stores
referrer on the new user's signup (cookie + DB). Build 5-level upline on
qualifying purchase. On ENTRY_PURCHASE that qualifies, compute 5
commissions server-side using admin-configured rates; insert rows with
status PENDING. After eligibility/refund window → AVAILABLE. On refund,
reverse commissions.

**Covers**: F-48, F-49, F-50, F-51, AC-10

**Priority**: high

**Dependencies**: Task 18 (config), Task 12 (purchase)

**Test Requirements**

- TR-20.1 (rule): Chain A→B→C→D→E→F; F buys ₦10,000 entry → separate
  commission rows for E (8%), D (5%), C (4%), B (2%), A (1%) in integer
  kobo (no rounding drift > 1 kobo total).
- TR-20.2 (rule): If F's purchase is refunded, all 5 commissions reverse
  correctly (ledger rows, status updates).
- TR-20.3 (rule): Setting referral rates in admin → next commissions
  use new rates (not hardcoded 8/5/4/2/1).

**Completion Evidence**: _(filled at completion)_

---

### Task 21: Referrals Dashboard + Payout requests + Use-for-entry

**Scope**: `/dashboard/referrals` page with referral link/share buttons,
5-level tree overview, total/pending/available earnings, shareable card
for mobile. "USE FOR ENTRY" button flow (Task 12 already supports as
source). "REQUEST CASH PAYOUT" → route `/dashboard/referrals/payout`
with amount/bank name/account name/account number, amount capped at
available balance; on submit → payout row PENDING + reserve amount.

**Covers**: F-24, F-25, F-11

**Priority**: high

**Dependencies**: Task 20, Task 11

**Test Requirements**

- TR-21.1 (rule): User with ₦50k available requesting ₦60k payout is
  rejected server-side.
- TR-21.2 (rule): Once payout is PENDING, the same amount cannot be
  spent for entry purchase (double-spend blocked).
- TR-21.3 (rule): Mobile share sheet opens with referral link.

**Completion Evidence**: _(filled at completion)_

---

### Task 22: Reward Pool engine + live counter

**Scope**: Configurable % from each qualifying entry → contribution
ledger. Homepage "Current reward pool" card and anywhere enabled reads
server-side SUM (not frontend fake). Admin contribution adjustments
leave audit trail.

**Covers**: F-52, F-53, AC-15

**Priority**: medium

**Dependencies**: Task 18

**Test Requirements**

- TR-22.1 (rule): Change reward % from 1→5, new purchases contribute
  5% (kobo-accurate); homepage counter reflects within one request.
- TR-22.2 (rule): Contribution ledger reconciles with pool total.

**Completion Evidence**: _(filled at completion)_

---

### Task 23: Admin CRM module

**Scope**: CRM contacts, lead/client classification (configurable),
activity (calls, meetings, follow-ups, attachments, staff, timestamps),
search/filter/CSV export.

**Covers**: F-59

**Priority**: low

**Dependencies**: Task 14

**Test Requirements**

- TR-23.1 (rule): Lead hot/warm/cold and client active/inactive/dormant
  classifications are admin-configurable.
- TR-23.2 (rule): CSV export includes all required columns.

**Completion Evidence**: _(filled at completion)_

---

## Phase 5 — Draw, Winners, Audit, Anti-Fraud, Notifications, Security

### Task 24: Cryptographically secure Draw engine + Draw verification page

**Scope**: Server-side draw (Supabase Edge Function or server RPC) using
Node.js `crypto` / pgcrypto. Flow per spec §29: close → freeze eligible
pool → validate → commit seed → secure random selection → winner →
immutable draw record → audit → publish verification data → notify
winner. `/draw-verification/$campaign` populated from draw record. NEVER
use `Math.random()`.

**Covers**: F-54, F-55, F-58, AC-16

**Priority**: highest

**Dependencies**: Task 16

**Test Requirements**

- TR-24.1 (rule): Draw code contains no `Math.random` call (grep audit;
  must use `crypto.randomInt` or `pgcrypto.gen_random_uuid`-tier).
- TR-24.2 (rule): After competition closes, no new tickets can be
  inserted and ticket pool is frozen for draw purposes (DB constraint
  test).
- TR-24.3 (rule): Running the same draw record twice produces the same
  winner (deterministic replay given seed + snapshot), proving
  verifiability.
- TR-24.4 (rule): `/draw-verification/$campaign` renders seed, algorithm,
  pool size, winner display name, draw record ID; page returns 404 for
  competitions that have not drawn.

**Completion Evidence**: _(filled at completion)_

---

### Task 25: Winner Management + Public Winners page

**Scope**: Admin winner status flow: SELECTED → CONTACTED → VERIFIED →
CLAIM IN PROGRESS → FULFILLED (also DISPUTED/CANCELLED). Record claim
status, communication, delivery/collection. Only FULFILLED + "approved
for publication" winners appear on `/winners`.

**Covers**: F-56, F-57

**Priority**: high

**Dependencies**: Task 24

**Test Requirements**

- TR-25.1 (rule): Winner in SELECTED state does not appear on public
  /winners until approved by admin.
- TR-25.2 (rule): Cancelled winner → replacement can be drawn (rollback
  path) and previous winner marked cancelled with reason.

**Completion Evidence**: _(filled at completion)_

---

### Task 26: Audit logging

**Scope**: Central audit logging module. Every sensitive event from §40
master spec produces an immutable `audit_logs` row (actor, action,
reference, timestamp, status, description, JSON metadata). Write helper
`logAudit()` + RPC/trigger where appropriate for DB-driven events
(wallet ledger, payouts, config changes, draws, campaign status).

**Covers**: F-61, AC-18

**Priority**: high

**Dependencies**: Task 2

**Test Requirements**

- TR-26.1 (rule): For each of: login/failed-login/register/OTP-send/
  password-reset/wallet-funding/wallet-debit/payment-webhook/ticket-
  purchase/referral-commission/payout/admin-adjustment/campaign-create/
  campaign-approve/campaign-publish/campaign-close/draw/winner/fraud-
  flag/account-suspend/config-change → produce a row. Spot-check 6 by
  actually performing the action.
- TR-26.2 (rule): `audit_logs` table is append-only (no UPDATE/DELETE
  from web API users; only insert via restricted role).

**Completion Evidence**: _(filled at completion)_

---

### Task 27: Rate limiting + Anti-Fraud scaffolding + Security

**Scope**: Server-side rate limits per §35 (login/register/OTP/password
reset/payment-init/wallet-fund/ticket-purchase/referral/payout/sensitive
account ops). Progressive: Normal → Throttled → Challenge → Temporary
Lock → Security flag. Anti-fraud §36/38/39: risk scores table, fraud
events table, patterns monitored. Security §34: passwords hashed,
session secure, input validation, output encoding, secure cookies, CSP,
X-Frame-Options, CORS, no frontend secrets, encryption in transit (SSL
already).

**Covers**: F-62, F-63, F-65, AC-19, AC-20

**Priority**: high

**Dependencies**: Task 3, Task 26

**Test Requirements**

- TR-27.1 (rule): 10 rapid logins with bad password from same IP trigger
  temporary lock (then succeeds after cooldown).
- TR-27.2 (rule): `grep -r "SUPABASE_SERVICE_ROLE_KEY\|PAYSTACK_SK\|
FLW_SECRET" .` (excluding .env) returns zero matches.
- TR-27.3 (rule): User flagged self-referral (same email/phone/bank)
  triggers a fraud event and moves to risk score ≥ HIGH; no auto-ban,
  but shows in admin fraud queue.

**Completion Evidence**: _(filled at completion)_

---

### Task 28: Notifications (Email + SMS + push-ready)

**Scope**: Notification module covering the events listed in §33:
Registration, email verification, phone verification, wallet funding,
entry purchase, competition updates, competition closing, draw
completed, winner, referral commission, payout status, security events,
admin announcements. Provider-agnostic Email/SMS adapters. Template
helpers. Admin announcement UI.

**Covers**: F-60

**Priority**: medium

**Dependencies**: Task 10, Task 24

**Test Requirements**

- TR-28.1 (rule): For 3 representative events (register, wallet funded,
  won), system inserts `notifications` row and invokes adapter call
  (test with a stub/spy or Dev log mode).
- TR-28.2 (rule): User can disable non-security notification categories
  in security/preferences.

**Completion Evidence**: _(filled at completion)_

---

## Phase 6 — Testing, Hardening, SEO, Performance, Production Deploy

### Task 29: Critical automated tests

**Scope**: Implement test harness (vitest + testcontainers or Supabase
schema test DB). Automated tests covering TR-12.2 (concurrency 1000 →
exactly 50), TR-20.1 (5-level commission calc), TR-24.3 (draw
determinism), financial consistency (wallet funding + purchase
reconciliation), referral payout (TR-21.1).

**Covers**: §59–65 master, AC-07

**Priority**: high

**Dependencies**: Tasks 12, 20, 24

**Test Requirements**

- TR-29.1 (rule): `npm run test` passes; all 5 scenario tests present.
- TR-29.2 (rule): A seeded financial consistency test (fund 50k, buy
  10k, check balance 40k with both ledger row types) passes.

**Completion Evidence**: _(filled at completion)_

---

### Task 30: SEO deep pass + Performance + Accessibility

**Scope**: SSR verify for all public pages; canonical URLs; structured
data for competitions (schema.org/Product where appropriate); optimized
images (next-gen + lazy); mobile 360px final pass on every new page;
Core Web Vitals sanity checks; a11y: semantic HTML, keyboard test 3
critical flows (register → fund → enter), focus rings, accessible
errors, ARIA on custom interactive widgets, prefers-reduced-motion
already handled in styles.

**Covers**: AC-22, AC-23, AC-24

**Priority**: medium

**Dependencies**: All earlier phases

**Test Requirements**

- TR-30.1 (rule): Lighthouse run on 3 public URLs (/, /competitions,
  /competitions/mercedes-benz-c-class) — Performance ≥ 85, Accessibility
  ≥ 90, SEO ≥ 90.
- TR-30.2 (rule): Tab-only traversal can register and enter a
  competition from the browser without pointer events.
- TR-30.3 (rubric): Mobile polish (0-3; ≥2 required). Assessed on 360px
  viewport on every Phase 2–5 screen.

**Completion Evidence**: _(filled at completion)_

---

### Task 31: Production deployment + handover checks

**Scope**: Configure Supabase per environment vars; payment gateway prod
keys, email/SMS production providers, custom domain raffila.com, SSL,
CDN for assets, storage CORS, CSP/security headers on Edge, database
backups, runbook README with credentials list (credentials kept in env
only, not repo).

**Covers**: §57–58

**Priority**: high

**Dependencies**: Task 30

**Test Requirements**

- TR-31.1 (rule): Production build `npm run build` succeeds.
- TR-31.2 (rule): Deployed site accessible on custom domain; no test
  mode warnings; demo-only seed route disabled on prod.

**Completion Evidence**: _(filled at completion)_

---

## AC coverage matrix

| AC                                                     | Tasks                         |
| ------------------------------------------------------ | ----------------------------- |
| AC-01 (public routes no regression)                    | T2, T7, T13                   |
| AC-02 (register + email/phone + login)                 | T3, T5                        |
| AC-03 (Google → complete profile)                      | T4                            |
| AC-04 (terms record)                                   | T3                            |
| AC-05 (spend-only wallet + verified webhook)           | T9, T10                       |
| AC-06 (ledger + kobo)                                  | T2, T9, T10, T11              |
| AC-07 (1000 → exactly 50 oversell test)                | T12, T29                      |
| AC-08 (unique entry IDs)                               | T11, T12                      |
| AC-09 (all /dashboard pages + auth-gated)              | T8, T9, T11, T21              |
| AC-10 (5-level referral + pending→available + reverse) | T20                           |
| AC-11 (use for entry + payout capped at available)     | T12, T21, T17                 |
| AC-12 (partner portal + submit + approval)             | T19                           |
| AC-13 (admin dashboard + RBAC + audit on adjust)       | T14, T15, T17, T18            |
| AC-14 (14 competition lifecycle states)                | T16                           |
| AC-15 (configurable rates + audit)                     | T18, T20, T22                 |
| AC-16 (draw secure + verification page)                | T24                           |
| AC-17 (winner status flow + public approval gate)      | T25                           |
| AC-18 (audit logs)                                     | T26                           |
| AC-19 (rate limit + anti-fraud)                        | T27                           |
| AC-20 (no frontend secrets)                            | T1, T27                       |
| AC-21 (sitemap/robots/SEO meta)                        | T7, T30                       |
| AC-22 (mobile UX rubric)                               | T30                           |
| AC-23 (design fidelity rubric)                         | All UI tasks, reviewed at T30 |
| AC-24 (trust/transparency rubric)                      | T13, T24, all dashboard tasks |
