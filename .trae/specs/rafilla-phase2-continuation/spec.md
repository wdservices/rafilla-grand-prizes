# RAFILLA — Phase 2 Continuation Specification

## Problem

The Rafilla project was initialized in Lovable with a completed **Phase 1 foundation**:
public marketing website (12 routes), design system, demo competition data, and
responsive layout shell. The codebase is currently a frontend-only preview:

- Authentication (`/auth`) is a placeholder with no real register/login flows.
- Competitions are static in-memory fixtures — no backend persistence or API.
- There is no User Dashboard, Wallet, Ticket purchase flow, Partner Portal,
  Admin Dashboard, Referral engine, Draw engine, or real backend.

The goal of this continuation is to incrementally build out the web platform
from this foundation using the approved **6-Phase sequence** defined in the
master spec, preserving the existing public UI shell and design language.

---

## Users

| Actor                  | Scope of this continuation                                                                                                                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Participant (User)** | Register, login, verify email/phone, complete profile, browse competitions, fund wallet, purchase entries, view entries, winners, referral link, referral earnings, transactions, account security |
| **Asset Partner**      | Apply to become partner, complete profile, submit assets, view listings, monitor performance, settlements                                                                                          |
| **Administrator**      | Manage users, partners, competitions, tickets, payments, wallets, referrals, payouts, draws, winners, reports, audit, fraud, configuration                                                         |
| **Public Visitor**     | All public pages remain exactly as currently built, with data now server-driven instead of hardcoded                                                                                               |

---

## Goals

1. **Preserve the existing public UI shell** — the homepage, competitions,
   detail page, winners, how-it-works, partner, about, FAQ, contact, draw
   verification, and the header/footer should look and behave identically;
   only the data source changes from fixtures to real data.
2. **Add real authentication + onboarding** — registration fields, terms
   acceptance checkbox, email + phone OTP verification, Google Sign-In with
   profile-completion gate.
3. **Build the User Dashboard + Wallet + Ticket purchase** — spend-only
   Rafilla Wallet, Paystack/Flutterwave funding with webhook verification,
   ledger architecture in integer kobo, atomic ticket reservations with
   oversell protection, entry purchase flow.
4. **Add Partner Portal** — partner applications, asset submission with images
   and docs, listing status, campaign analytics, settlement views.
5. **Add Admin Dashboard** — full CRUD for all core entities, RBAC, competition
   lifecycle management, payout review, user management, reports.
6. **Implement backend engines** — 5-level referral with configurable rates,
   reward pool, cryptographically secure draw engine, winner management, audit
   logging, anti-fraud scaffolding, rate limiting, notification infra.
7. **Maintain SEO + SSR** — TanStack Start SSR, meta tags, sitemap.xml,
   robots.txt, and all public pages render server-side with real data.

---

## Non-Goals (from master spec)

- ❌ Native Android / iOS applications in this phase.
- ❌ Mandatory BVN/NIN verification in this phase.
- ❌ Hardcoding commission rates, reward pool %, or other business parameters
  into the frontend (they must be admin-configurable).
- ❌ Math.random() for draws — cryptographically secure only, server-side.
- ❌ Frontend-only wallet balance, ticket inventory, referral calculations,
  or payment status.
- ❌ Fake production data in production.

---

## Functional Requirements

### A. Public Website (replace fixtures with real data)

- [F-01] All competition data on `/`, `/competitions`, `/competitions/$slug`
  loads from backend; demo fixtures are dev-only.
- [F-02] Competitions page supports filters (category, price range, status,
  closing soon, featured, newest), search, and sort (featured, newest,
  closing soon, most popular).
- [F-03] Competition detail page shows countdown, real progress, draw
  verification link, partner info (when public), FAQs, related competitions.
- [F-04] `/draw-verification/$campaign` renders actual draw record:
  campaign, draw date, winner (display name), draw record ID, seed/verification
  data, algorithm, entry pool size.
- [F-05] Winners page shows approved winner cards (prize, winner display
  name, competition, date, location if allowed) — empty state when none.
- [F-06] Homepage shows live reward pool counter (server-driven), recent
  winners, partner CTA, and final CTA section (previously missing some blocks
  in the stub).
- [F-07] `sitemap.xml` and `robots.txt` generated; /dashboard, /admin,
  /partner excluded from indexing.

### B. Authentication + Account Onboarding

- [F-08] Register page with fields: username, email, phone, password,
  confirm password, address, DOB/age, **mandatory Terms & Conditions +
  Privacy Policy + Competition Rules checkbox** (links to legal pages).
- [F-09] Records terms acceptance: version, user ID, timestamp, IP/device
  (where legally appropriate).
- [F-10] Email verification with confirmation link or code.
- [F-11] Phone verification via OTP (SMS).
- [F-12] Password reset flow (email-based).
- [F-13] Google Sign-In; if profile fields missing → force "Complete your
  Rafilla profile" screen (phone, address, DOB, etc.) before granting access.
- [F-14] Session management with secure, HttpOnly cookies where possible.
- [F-15] Legal pages: `/terms-and-conditions`, `/privacy-policy`,
  `/competition-rules` (placeholder content labeled "PENDING LEGAL REVIEW").

### C. User Dashboard

- [F-16] `/dashboard` overview: welcome message, wallet balance, referral
  earnings (available/pending), active entries, competitions entered,
  winnings, recent transactions, referral performance, verification status,
  quick-action buttons.
- [F-17] Wallet page (`/dashboard/wallet`): spend-only balance, FUND WALLET,
  VIEW TRANSACTIONS, EXPLORE COMPETITIONS. **No withdrawal button for the
  standard wallet.**
- [F-18] Wallet funding with Nigerian licensed gateway (Paystack/Flutterwave
  — configured by env vars). Supported methods: Card, Bank transfer, USSD
  (when available from the gateway).
- [F-19] All payments verified **server-side via webhook**; wallet never
  credited because frontend says success.
- [F-20] Proper ledger architecture: every wallet movement creates a
  `ledger_entries` record (WALLET_FUNDING, ENTRY_PURCHASE, REFUND, REVERSAL,
  ADMIN_ADJUSTMENT).
- [F-21] Money stored as **integer kobo** (₦10,000 = 1000000 kobo) in DB.
- [F-22] `/dashboard/entries` — list of purchased entries (unique RF-XXXX IDs,
  competition, date, status), empty state, filtering.
- [F-23] `/dashboard/transactions` — wallet + referral ledger list with
  filtering/search, empty state.
- [F-24] `/dashboard/referrals` — unique referral link/code, 5-level tree
  overview, total/pending/available earnings, "USE FOR ENTRY" + "REQUEST
  CASH PAYOUT" buttons.
- [F-25] `/dashboard/referrals/payout` — form with amount, bank name,
  account name, account number; amount capped at available balance.
- [F-26] `/dashboard/profile` — edit profile, verification badges.
- [F-27] `/dashboard/security` — password change, 2FA scaffolding, active
  sessions.
- [F-28] Mobile bottom nav for authenticated users: Home, Competitions,
  Wallet, Entries, Account.

### D. Ticket Purchase Experience

- [F-29] Flow: competition → select # of entries → check availability →
  select payment source (Wallet / Referral Earnings) → confirm → server
  validation → atomic ticket reservation → process → generate unique IDs
  (RF-YYYY-XXXXXXXX) → confirmation.
- [F-30] **Oversell protection**: atomic DB reservation, temporary
  reservation with expiration, idempotency keys, DB transactions; never
  allow tickets_sold > ticket_capacity.
- [F-31] "ENTER NOW" on competition detail triggers auth flow if not logged
  in (no anonymous purchases).
- [F-32] Referral-earnings-as-payment-source flow: validates available
  balance, debits referral ledger, generates entries.

### E. Partner Portal

- [F-33] Separate authenticated `/partner` dashboard.
- [F-34] Partner application (`/become-a-partner` already links; add real
  form): company/profile info, review by admin.
- [F-35] "Submit an Asset" form: title, category, description, asset value,
  multiple images, specifications, supporting docs, proof of ownership,
  additional info → submit for review.
- [F-36] Partner cannot publish; admin approval required.
- [F-37] Partner overview: active listings, pending listings, total entries,
  total revenue/amount generated, campaigns summary, performance, recent
  activity.
- [F-38] My Listings table/cards: image, title, category, status, campaign,
  ticket price, tickets sold/remaining, progress, closing, amount
  generated, performance.
- [F-39] Partner analytics + settlement tracking.

### F. Admin Dashboard

- [F-40] Separate `/admin` dashboard with platform overview (total users,
  active users, partners, active competitions, tickets sold, platform
  revenue, wallet funding, referral liability, pending payouts, reward
  pool, active listings, completed competitions, recent winners, fraud
  alerts) + charts (revenue, ticket sales, user growth, etc.).
- [F-41] User management: search/filter, profile view, wallet, referral
  activity, entries, transactions, verification, risk status, suspend /
  restore, audit history.
- [F-42] Competition management: CRUD, images, title/description/category/
  prize/value/ticket price/quantity/dates/rules/status/partner/featured/
  reward pool/draw settings, preview, approve, publish, pause, close,
  archive. Full lifecycle: DRAFT → PENDING REVIEW → APPROVED → SCHEDULED →
  LIVE → CLOSING → CLOSED → AWAITING DRAW → DRAWN → WINNER VERIFIED →
  CLAIM IN PROGRESS → DELIVERED → COMPLETED.
- [F-43] Partner management: review applications, approve/reject, view
  listings.
- [F-44] Payout workflow: review payout requests (PENDING → UNDER REVIEW →
  APPROVED → PROCESSING → PAID / REJECTED / FAILED / CANCELLED), risk
  checks, bank info, audit trail. Admin cannot silently modify balances
  — any adjustment requires reason, admin, timestamp, audit log.
- [F-45] Reports: users, campaigns, tickets, revenue, wallet funding,
  referral commissions, payouts, reward pool, partners, winners, refunds,
  fraud events. Filters + CSV export where appropriate.
- [F-46] RBAC: USER / PARTNER / ADMIN — every privileged operation
  authorized **server-side**, not just frontend.
- [F-47] Platform configuration: referral commission rates (5 levels,
  default 8/5/4/2/1), reward pool %, campaign/ticket/payout thresholds,
  notification settings, fraud thresholds. Every change → audit log
  (previous value, new value, admin, timestamp, reason).

### G. Referral Engine

- [F-48] 5-level referral tree. Referral link: `raffila.com/?ref=RAF123`.
- [F-49] Commissions calculated **server-side** on qualifying entry purchase,
  using admin-configured rates; 5 separate commission ledger records.
- [F-50] Commission lifecycle: PENDING → AVAILABLE after
  eligibility/refund window.
- [F-51] Referral earnings tracked separately from spend-only wallet. Can be
  (a) used for entry purchases, or (b) requested as cash payout (subject to
  review). Reversed if underlying purchase is refunded.

### H. Reward Pool

- [F-52] Configurable percentage of every qualifying entry fee contributes.
- [F-53] Contribution ledger. Public live counter on homepage (and wherever
  else enabled), server-side calculation.

### I. Draw Engine + Winner Management

- [F-54] Server-side only. Cryptographically secure random (never
  `Math.random()`).
- [F-55] Flow: competition closes → freeze eligible entries → validate
  pool → commit/verify draw seed → secure selection → generate winner →
  immutable draw record → audit info → publish verification data → notify
  winner.
- [F-56] Winner statuses: SELECTED → CONTACTED → VERIFIED → CLAIM IN
  PROGRESS → FULFILLED / DISPUTED / CANCELLED.
- [F-57] Admin records claim status, communication, delivery/collection;
  publishes approved winner info.
- [F-58] Draw results independently verifiable via
  `/draw-verification/$campaign`.

### J. CRM, Notifications, Audit, Anti-Fraud, Security

- [F-59] CRM module in Admin: lead/client classification (configurable),
  contact/source/activity/attachments/staff, search/filter/CSV export.
- [F-60] Notification infra: Email + SMS + push-ready. Events covered:
  registration, email verification, phone verification, wallet funding,
  entry purchase, competition updates, competition closing, draw completed,
  winner, referral commission, payout status, security events, admin
  announcements.
- [F-61] Immutable audit logging for all sensitive events listed in §40 of
  the master spec (login, failed login, registration, OTP, password reset,
  wallet funding/debit, payment webhook, ticket purchase, referral
  commission, payout, admin adjustment, campaign CRUD/approval/publish/close,
  draw, winner, fraud flag, account suspension, admin config changes).
- [F-62] Rate limiting (server-side): login, register, OTP, password reset,
  payment initiation, wallet funding, ticket purchase, referral ops, payout
  requests, sensitive account ops. Progressive protection: normal → throttled
  → challenge → temporary lock → security flag.
- [F-63] Anti-fraud scaffolding: multi-account patterns, rapid registrations,
  repeated failed login, OTP abuse, payment failures, unusual wallet/ticket
  activity, bot patterns, referral abuse (self/circular/artificial),
  suspicious payouts, repeated bank accounts. Risk levels: LOW/MEDIUM/HIGH/
  CRITICAL. Admin queue to review. **No auto-punishment from a single signal.**
- [F-64] Payment fraud protection: webhook signature verification,
  idempotency, duplicate transaction protection, reference validation,
  server-side verification, replay protection, atomic crediting,
  reconciliation. Never trust frontend payment status.
- [F-65] Security §34: password hashing, secure auth, session management,
  authorization, CSRF (where applicable), input validation, output
  encoding, SQL injection / XSS prevention, secure cookies, rate limiting,
  API authorization, webhook verification, audit logging, secret management,
  security headers, encryption in transit (and at rest where appropriate).
  Secrets never in frontend code.

### K. Data + API

- [F-66] Relational schema (PostgreSQL recommended) covering all entities
  listed in §41.
- [F-67] API organized per §43: `/auth`, `/users`, `/profile`, `/campaigns`,
  `/tickets`, `/orders`, `/payments`, `/wallet`, `/referrals`, `/commissions`,
  `/payouts`, `/partners`, `/admin`, `/draws`, `/winners`, `/crm`,
  `/notifications`, `/audit`, `/fraud`. API designed to be consumed by
  future native apps.
- [F-68] Environment-based configuration: Supabase or Firebase or direct DB
  via env vars. Payment gateway API keys via env only.

---

## Non-Functional Requirements

- **Mobile-first (360px+)** and responsive on every new page.
- **SSR/SSG for all public SEO pages** via TanStack Start.
- **Good Core Web Vitals**: lazy load images, code splitting, caching.
- **Accessible**: semantic HTML, keyboard nav, ARIA where appropriate,
  contrast, focus states, accessible errors, no hover-only actions.
- **Error handling**: professional error states, no stack traces exposed,
  clear human messages for: payment failed, insufficient balance, sold out,
  closed, reservation expired, network, invalid OTP, too many attempts,
  restricted, payout unavailable, fraud review.
- **Empty states** for: no competitions entered, no transactions, no
  referral earnings, no payout history, no partner listings, no
  notifications, no winners.
- **Design fidelity**: new pages match the existing premium, solid-color,
  no-gradient Rafilla design system (ink, cream, paper, coral, sky, mint,
  lemon, lilac; Baloo 2 display + Nunito body; rounded cards).

---

## Constraints

- Legal document takes priority over the PRD on conflicts (§0 of master).
- No BVN/NIN, no native apps, no unapproved scope expansion.
- Ambiguous parameters → admin-configurable, not hardcoded.
- Demo seed data must be clearly marked dev-only.
- Use the existing TanStack Start + Tailwind v4 + Radix UI stack; do not
  swap frameworks.
- Commit history preserved (no force-push of published Lovable branch).

---

## Dependencies / Assumptions

- Supabase will be used as the backend provider (Auth + PostgreSQL + Storage
  - Edge Functions). Confirmed by `supabase_get_project` availability.
- Payment gateway will be Paystack or Flutterwave — exact choice TBD via
  admin config + env vars.
- Email provider (e.g. Resend/Postmark/Supabase Auth email), SMS provider
  (Twilio/Termii) for OTPs — TBD via env.
- Actual legal text for Terms/Privacy/Rules will be supplied by Rafilla
  legal team; the shipped pages carry "PENDING LEGAL REVIEW" banners.

---

## Open Questions for User

1. Confirm Supabase as the backend (Auth, Postgres, Storage, Edge Functions)?
2. Preferred payment gateway: Paystack vs Flutterwave (or both)?
3. SMS provider for phone OTP?
4. Email provider for transactional email?
5. Do you want **Phase 2** (User Dashboard + Wallet + Payment + Ticket
   Engine) implemented first, or start with backend + auth foundational
   wiring first? (The task list below orders foundation → phase 2 → phase 3
   → phase 4 → phase 5 → phase 6 per the master spec's recommended
   sequence.)

---

## Acceptance Criteria

All ACs are typed as either `rule` (binary pass/fail) or `rubric` (scored).

| ID    | Type   | Criterion                                                                                                                                                                                                                                                                                      |
| ----- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-01 | rule   | Every current public route (`/`, `/competitions`, `/competitions/$slug`, `/how-it-works`, `/winners`, `/become-a-partner`, `/about`, `/faq`, `/contact`, `/auth`, `/draw-verification/$campaign`) still renders without visual regression; data simply comes from backend instead of fixtures. |
| AC-02 | rule   | User can register with full fields, check mandatory Terms checkbox, receive verification email + phone OTP, complete profile, and log in.                                                                                                                                                      |
| AC-03 | rule   | Google Sign-In cannot bypass missing required profile fields (forces "Complete your Rafilla profile" screen).                                                                                                                                                                                  |
| AC-04 | rule   | Terms acceptance record persisted (version, user id, timestamp, IP/device where allowed).                                                                                                                                                                                                      |
| AC-05 | rule   | Rafilla Wallet is SPEND-ONLY (no withdraw button). Funding works via a real NG gateway; credit only happens after verified server-side webhook.                                                                                                                                                |
| AC-06 | rule   | Every wallet movement creates a `ledger_entries` record. Money in DB is integer kobo. No float math.                                                                                                                                                                                           |
| AC-07 | rule   | Ticket purchase with 1,000 concurrent users attempting to buy the last 50 entries results in exactly 50 valid entries — never oversold, never negative inventory, never double-debited.                                                                                                        |
| AC-08 | rule   | Each entry has a unique identifier `RF-YYYY-XXXXXXXX` visible in My Entries.                                                                                                                                                                                                                   |
| AC-09 | rule   | `/dashboard/*` pages (overview, wallet, entries, transactions, referrals, payout, profile, security) exist, render, and are auth-protected.                                                                                                                                                    |
| AC-10 | rule   | Referral tree is 5-level, commissions calculated server-side at admin-configurable rates per level, commission status cycles PENDING → AVAILABLE, referrals reversed when underlying purchase refunds.                                                                                         |
| AC-11 | rule   | Referral earnings can be used for entry purchases OR cash payout (capped at available balance; payout goes through admin review statuses).                                                                                                                                                     |
| AC-12 | rule   | `/partner/*` portal exists with application flow, asset submission (images + docs), listings table, analytics + settlement views; partners cannot publish without admin approval.                                                                                                              |
| AC-13 | rule   | `/admin/*` dashboard exists with overview metrics + charts, user/partner/competition/payout management, reports export, RBAC-enforced server-side. Admin financial adjustments leave immutable audit trail.                                                                                    |
| AC-14 | rule   | Admin can control every lifecycle state of a competition through DRAFT → COMPLETED (14 states).                                                                                                                                                                                                |
| AC-15 | rule   | Competition rates, reward pool %, thresholds etc. are admin-configurable (NOT hardcoded frontend). Config changes produce audit logs.                                                                                                                                                          |
| AC-16 | rule   | Draw engine is server-side only, uses a cryptographically-secure RNG, produces immutable draw record, and `/draw-verification/$campaign` lets anyone independently verify.                                                                                                                     |
| AC-17 | rule   | Winner management supports SELECTED → FULFILLED/CANCELLED/DISPUTED states; only approved winners appear on public `/winners`.                                                                                                                                                                  |
| AC-18 | rule   | All sensitive events (per §40 master spec) produce immutable audit logs (actor, action, reference, timestamp, status, description, metadata).                                                                                                                                                  |
| AC-19 | rule   | Rate limiting + anti-fraud scaffolding are present server-side; no single signal auto-bans. Risk levels: L/M/H/CRITICAL with admin queue.                                                                                                                                                      |
| AC-20 | rule   | No secret or API key exists in frontend-visible code or client bundles.                                                                                                                                                                                                                        |
| AC-21 | rule   | Sitemap + robots exclude /dashboard, /admin, /partner, private APIs. All public SEO pages have title, description, canonical, OG, Twitter meta tags populated from backend data.                                                                                                               |
| AC-22 | rubric | Mobile UX quality (0-3). Anchors: 3 = 360px flawless, mobile bottom nav for auth users, one-handed ticket + funding; 2 = usable but minor layout glitches; 1 = broken on small screens.                                                                                                        |
| AC-23 | rubric | Design system fidelity (0-3). Anchors: 3 = new pages indistinguishable from existing premium shell palette, typography, spacing, card style, no gradients, no betting aesthetics; 2 = on-brand with minor inconsistencies; 1 = mismatched look and feel.                                       |
| AC-24 | rubric | Trust/transparency clarity (0-3). Anchors: 3 = user can instantly see prize, entry price, availability, close date, draw process, wallet state; 2 = mostly obvious, some hunting; 1 = answers hidden or ambiguous.                                                                             |
