# Rafilla Grand Prizes

============================================================

RAFILLA — MASTER PRODUCT BUILD SPECIFICATION

============================================================

Build a production-ready, premium prize-competition web platform called:

RAFILLA

Website:

https://raffila.com

IMPORTANT SOURCE-OF-TRUTH RULE:

There are two source documents for this project:

1. The FINAL LEGAL/COMMERCIAL AGREEMENT

2. The earlier RAFILLA PRODUCT REQUIREMENTS DOCUMENT (PRD)

The FINAL LEGAL/COMMERCIAL AGREEMENT takes priority over the earlier PRD.

The PRD was created before the legal agreement and contains some requirements that have subsequently been changed, rejected, deferred or removed.

Therefore:

- Follow the legal agreement wherever there is a conflict.

- Use the PRD only to supplement the legal agreement where the functionality remains valid.

- Do NOT implement requirements from the PRD that have subsequently been rejected or replaced.

- Do NOT implement mandatory BVN/NIN verification.

- Do NOT implement native Android/iOS applications in this phase.

- Do NOT invent functionality that is outside the agreed scope.

- If a requirement is ambiguous, structure the system so it can be configured later rather than hardcoding assumptions.

The current engagement is for the WEB PLATFORM.

Native Android and iOS applications are excluded/deferred and will use the same backend/API architecture when commissioned later.

============================================================

1. PRODUCT VISION

============================================================

Rafilla is a modern Nigerian prize-competition platform where users can participate in competitions featuring premium products/assets such as:

- Cars

- Electronics

- Properties

- Luxury items

- Experiences

- Other approved prizes

A product is listed as a competition.

Users purchase entries/tickets to participate.

Example:

Prize:

Car worth ₦10,000,000

Competition:

Entry price:

₦10,000

Users purchase entries.

When the competition closes, the system conducts a verifiable random draw and one eligible entrant wins the prize, subject to the applicable competition rules and regulatory requirements.

Rafilla should feel:

- Premium

- Trustworthy

- Modern

- Sleek

- Exciting

- Transparent

- Professional

- Mobile-first

- Fast

- Secure

Do NOT make the design look like a traditional betting/gambling website.

The visual language should resemble a premium technology/product marketplace.

============================================================

2. PRIMARY USER TYPES

============================================================

There are THREE primary platform experiences.

1. PARTICIPANT / USER

2. ASSET PARTNER

3. ADMINISTRATOR

Each must have a separate authenticated dashboard and permission model.

---

USER

---

Users can:

- Register

- Login

- Verify phone

- Verify email

- Complete profile

- Browse competitions

- View competition details

- Fund Rafilla Wallet

- Purchase entries

- View purchased entries

- Track competitions

- View winners

- Participate through referrals

- Earn referral commissions

- Use referral earnings for entries

- Request cash payout of eligible referral earnings

- Manage bank details for referral payouts

- View transactions

- Manage account/security

---

PARTNER

---

Partners can:

- Apply to become an asset partner

- Complete partner profile

- Submit assets/products

- Upload product images

- Upload supporting documentation

- View submitted listings

- Monitor listing status

- View active campaigns

- Monitor entries

- Monitor campaign performance

- View amounts generated

- View campaign analytics

- Track settlement information

Partners cannot independently publish campaigns without administrator approval.

---

ADMIN

---

Administrators have global platform access.

Admin can manage:

- Users

- Partners

- Products/assets

- Competitions

- Tickets

- Payments

- Wallets

- Referral system

- Referral commissions

- Payouts

- Draws

- Winners

- Reward pool

- CRM

- Notifications

- Reports

- Audit logs

- Fraud/risk flags

- Platform configuration

Use role-based access control.

Do not rely on frontend role checks alone.

Every privileged operation must be authorized server-side.

============================================================

3. PUBLIC WEBSITE

============================================================

Build the public-facing Rafilla marketplace.

Primary navigation:

HOME

COMPETITIONS

HOW IT WORKS

WINNERS

BECOME A PARTNER

ABOUT RAFILLA

FAQ

CONTACT

LOGIN

JOIN RAFILLA

The header should be responsive and transform appropriately on mobile.

============================================================

4. HOMEPAGE

============================================================

Create a premium, visually impressive homepage.

Hero section:

Headline:

"BIG PRIZES. FAIR CHANCES."

Supporting copy:

"Discover exciting competitions for premium prizes. Choose your competition, secure your entries and follow the journey to the draw."

Primary CTA:

"EXPLORE COMPETITIONS"

Secondary CTA:

"HOW IT WORKS"

Hero should include a premium featured competition visual.

Below the hero:

---

LIVE COMPETITIONS

---

Display competition cards.

Each card should contain:

- Prize image

- Competition title

- Category

- Entry price

- Number of entries

- Entries sold

- Remaining entries

- Progress indicator

- Closing date/countdown

- Competition status

- CTA

"VIEW COMPETITION"

All active listed products should be discoverable from the public marketplace.

---

FEATURED PRIZES

---

Large premium cards for selected competitions.

---

HOW RAFILLA WORKS

---

Step 1:

Create your account

Step 2:

Fund your Rafilla Wallet

Step 3:

Choose a competition

Step 4:

Purchase your entries

Step 5:

Watch the draw

Step 6:

You could be the winner

---

WHY RAFILLA

---

Highlight:

Transparency

Secure Payments

Verifiable Draws

Premium Prizes

Secure Accounts

Fair Competition

---

REWARD POOL

---

Display the live reward pool counter where configured.

Example:

"Current Reward Pool"

₦XX,XXX,XXX

Use a live server-driven value.

---

RECENT WINNERS

---

Display approved winner announcements.

Include:

- Prize

- Winner name/display name

- Competition

- Date

- Location where appropriate and legally permitted

---

BECOME A PARTNER

---

CTA for businesses/assets owners.

"Have a premium asset to list?"

"Partner with Rafilla."

---

FAQ

---

Include common questions.

---

FINAL CTA

---

"Your next big win could start here."

[EXPLORE COMPETITIONS]

============================================================

5. COMPETITIONS PAGE

============================================================

Create:

/competitions

Display all public competitions.

Filters:

- Category

- Price

- Status

- Closing soon

- Featured

- Newest

Search:

"Search competitions..."

Sorting:

- Featured

- Newest

- Closing Soon

- Most Popular

Cards must be visually consistent.

Each card displays:

Prize image

Title

Short description

Entry price

Progress

Tickets sold

Tickets remaining

Closing date

CTA:

"ENTER NOW"

============================================================

6. COMPETITION DETAIL PAGE

============================================================

Use SEO-friendly URLs.

Example:

/competitions/mercedes-benz-c-class

NOT:

/competition?id=123

The page should contain:

Hero/product gallery

Competition title

Prize description

Prize value where approved for publication

Entry price

Tickets available

Tickets sold

Progress bar

Closing date

Countdown

Competition status

"ENTER NOW"

Prize specifications

Description

What is included

Competition rules

How the draw works

Partner information where appropriate

FAQs

Related competitions

Trust/fairness information

Draw verification information where applicable.

IMPORTANT:

If a visitor clicks "ENTER NOW" without being authenticated:

Show the authentication/login flow.

Do not allow anonymous ticket purchase.

============================================================

7. TICKET PURCHASE EXPERIENCE

============================================================

User flow:

Competition

↓

Select number of entries

↓

Check ticket availability

↓

Select payment source

Possible payment sources:

RAFILLA WALLET

REFERRAL EARNINGS

↓

Confirm purchase

↓

Server-side validation

↓

Process transaction

↓

Generate unique entries

↓

Show confirmation

Every entry must have a unique identifier.

Example:

RF-2026-00012345

Users can view their entries from:

MY ENTRIES

============================================================

8. TICKET INVENTORY PROTECTION

============================================================

This is critical.

The system must prevent overselling.

Use a secure reservation/locking mechanism.

When multiple users attempt to purchase the remaining entries simultaneously:

The server must atomically reserve available inventory.

Never trust the frontend quantity.

Never allow:

tickets sold > ticket capacity.

Use:

- Database transactions

- Atomic operations

- Temporary reservations

- Expiration of abandoned reservations

- Idempotency keys

Example:

Only 10 entries remain.

1,000 users attempt to purchase simultaneously.

The system must sell exactly 10.

The remaining requests must fail gracefully.

============================================================

9. USER AUTHENTICATION

============================================================

Registration fields:

Username

Email

Phone Number

Password

Confirm Password

Address

Date of birth / age information where required

Terms acceptance

Support:

- Email verification

- Phone OTP

- Password reset

- Secure login

- Google Sign-In

Google Sign-In must NOT bypass required profile information.

If required information is missing:

show:

"COMPLETE YOUR RAFILLA PROFILE"

Request:

Phone

Address

Date of birth/age information

Other approved required information

============================================================

10. TERMS ACCEPTANCE

============================================================

Before account creation:

Required checkbox:

"I have read and agree to the Rafilla Terms & Conditions and Privacy Policy."

Links:

Terms & Conditions

Privacy Policy

Competition Rules

Users cannot register without accepting the required terms.

Record:

- Terms version

- User ID

- Timestamp

- IP/device information where legally appropriate

The legal team remains the source of truth for the actual legal wording.

Do not invent legal clauses.

============================================================

11. KYC / IDENTITY VERIFICATION

============================================================

DO NOT implement mandatory BVN/NIN verification in this phase.

The architecture should be KYC-ready and provider-agnostic.

Current implementation:

- Email verification

- Phone verification by OTP

The architecture should be capable of supporting later:

- Government ID verification

- Selfie verification

- Liveness

- Date-of-birth verification

- Address verification

- Payment-instrument verification

- Authorized third-party KYC provider

Any future BVN/NIN or regulated identity integration must be treated as a future integration/variation and must not be hardcoded into the current user flow.

============================================================

12. USER DASHBOARD

============================================================

Create:

/dashboard

Dashboard should show:

Welcome message

Rafilla Wallet

Referral Earnings

Active Entries

Competitions Entered

Winnings

Recent Transactions

Referral Performance

Verification status

Quick actions:

FUND WALLET

EXPLORE COMPETITIONS

MY ENTRIES

REFERRALS

TRANSACTIONS

PROFILE

SECURITY

============================================================

13. RAFILLA WALLET

============================================================

IMPORTANT:

The Rafilla Wallet is a SPEND-ONLY wallet.

Users can:

- Fund wallet

- Use wallet balance to purchase competition entries

Users cannot:

- Withdraw normal wallet balance

- Cash out normal wallet balance

- Transfer normal wallet balance to a bank account

DO NOT display a withdrawal button for the standard Rafilla Wallet.

Wallet page:

MY RAFILLA WALLET

Available Balance

₦125,000

[FUND WALLET]

[VIEW TRANSACTIONS]

[EXPLORE COMPETITIONS]

============================================================

14. WALLET FUNDING

============================================================

Support a Nigerian licensed payment gateway.

Potential gateway:

Paystack

Flutterwave

Monnify

The selected gateway must be configured according to the approved project setup.

Support where available:

- Card

- Bank transfer

- USSD

Payment must be verified server-side through webhook verification.

Never credit wallet solely because frontend says payment succeeded.

Payment transaction must contain:

Transaction ID

Reference

User

Amount

Gateway

Gateway reference

Status

Timestamp

Verification state

Possible states:

PENDING

SUCCESSFUL

FAILED

REVERSED

REFUNDED

============================================================

15. WALLET LEDGER

============================================================

Use a proper ledger architecture.

Do NOT simply modify wallet balances without corresponding transaction records.

Every wallet movement must create a ledger record.

Types:

WALLET_FUNDING

ENTRY_PURCHASE

REFUND

REVERSAL

ADMIN_ADJUSTMENT

Store monetary values as integer kobo.

Do not use floating-point money calculations.

============================================================

16. REFERRAL SYSTEM

============================================================

Rafilla has a five-level referral structure.

Level 1

Level 2

Level 3

Level 4

Level 5

Commission rates must be configurable from Admin.

Current agreed PRD reference rates:

Level 1 = 8%

Level 2 = 5%

Level 3 = 4%

Level 4 = 2%

Level 5 = 1%

Do not hardcode rates into the frontend.

The system should calculate commissions server-side.

Referral attribution should be persistent according to the approved business rules.

============================================================

17. REFERRAL FLOW

============================================================

User receives unique referral code/link.

Example:

raffila.com/?ref=RAF123

When a new user registers through the referral:

Record referral relationship.

Build the five-level upline.

When a qualifying competition entry purchase occurs:

Calculate eligible commissions.

Create commission ledger records.

Commission status:

PENDING

↓

AVAILABLE

after the applicable eligibility/refund period.

Do not create commissions based only on frontend events.

============================================================

18. REFERRAL EARNINGS

============================================================

IMPORTANT:

Referral earnings are separate from the normal Rafilla Wallet.

User dashboard:

REFERRAL EARNINGS

₦25,500

Available

₦15,000

Pending

₦10,500

Buttons:

USE FOR ENTRY

REQUEST CASH PAYOUT

============================================================

19. REFERRAL EARNINGS FOR ENTRIES

============================================================

A user can use eligible referral earnings to purchase competition entries.

Example:

Referral earnings:

₦30,000

Entry price:

₦10,000

User chooses:

"USE REFERRAL EARNINGS"

Server validates available balance.

Debit referral ledger.

Generate entry.

Create transaction.

============================================================

20. REFERRAL CASH PAYOUT

============================================================

Users may request cash payouts from eligible referral earnings.

Create:

/dashboard/referrals/payout

Fields:

Amount

Bank Name

Account Name

Account Number

CTA:

SUBMIT PAYOUT REQUEST

The user cannot request more than the available eligible referral balance.

============================================================

21. PAYOUT WORKFLOW

============================================================

Payout statuses:

PENDING

UNDER REVIEW

APPROVED

PROCESSING

PAID

REJECTED

FAILED

CANCELLED

Admin must be able to review and process payout requests.

Payout request must contain:

Payout ID

User

Amount

Bank details

Referral balance

Date

Status

Risk status

Audit trail

Do not automatically pay suspicious transactions.

============================================================

22. PARTNER PORTAL

============================================================

Create separate authenticated Partner Dashboard.

Partner homepage:

PARTNER OVERVIEW

Metrics:

Active Listings

Pending Listings

Total Entries

Total Revenue/Amount Generated

Campaigns

Performance

Recent Activity

---

MY LISTINGS

---

Each listing displays:

Product image

Product title

Category

Status

Campaign

Ticket price

Tickets sold

Tickets remaining

Progress

Closing date

Amount generated

Performance

---

SUBMIT AN ASSET

---

Fields:

Asset title

Category

Description

Asset value

Images

Specifications

Supporting documentation

Proof of ownership

Additional information

Submit for review.

Partner cannot directly publish without Admin approval.

============================================================

23. PARTNER ANALYTICS

============================================================

Partner can see:

Total listings

Active listings

Completed listings

Total entries

Entries per campaign

Amount generated

Conversion/performance

Campaign progress

Closing dates

Historical campaign performance

============================================================

24. ADMIN DASHBOARD

============================================================

Admin homepage should provide a complete platform overview.

Display:

TOTAL USERS

ACTIVE USERS

TOTAL PARTNERS

ACTIVE COMPETITIONS

TOTAL TICKETS SOLD

TOTAL PLATFORM REVENUE

WALLET FUNDING

REFERRAL LIABILITY

PENDING PAYOUTS

REWARD POOL

ACTIVE LISTINGS

COMPLETED COMPETITIONS

RECENT WINNERS

FRAUD ALERTS

Charts:

Revenue

Ticket sales

User growth

Competition performance

Referral activity

Wallet activity

Payouts

============================================================

25. ADMIN USER MANAGEMENT

============================================================

Admin can:

Search users

Filter users

View profile

View wallet

View referral activity

View competition entries

View transaction history

View verification status

View risk status

Suspend account

Restore account

View audit history

Admin must not be able to silently modify financial balances.

Any financial adjustment requires:

Amount

Reason

Reference

Admin

Timestamp

Audit log

============================================================

26. ADMIN COMPETITION MANAGEMENT

============================================================

Admin can:

Create competition

Edit competition

Upload images

Configure title

Description

Category

Prize

Prize value

Ticket price

Ticket quantity

Campaign dates

Rules

Status

Partner

Featured status

Reward pool configuration

Draw settings

Preview

Approve

Publish

Pause

Close

Archive

Competition lifecycle:

DRAFT

PENDING REVIEW

APPROVED

SCHEDULED

LIVE

CLOSING

CLOSED

AWAITING DRAW

DRAWN

WINNER VERIFIED

CLAIM IN PROGRESS

DELIVERED

COMPLETED

============================================================

27. PRIZE/ASSET MANAGEMENT

============================================================

Each competition must support:

Title

Slug

Description

Category

Prize image/gallery

Specifications

Prize value

Partner

Ticket price

Ticket capacity

Tickets sold

Tickets remaining

Opening date

Closing date

Status

Competition rules

Draw configuration

Reward pool contribution

============================================================

28. REWARD POOL

============================================================

Implement the rewards-pool logic defined in the agreed scope.

A configurable percentage of every qualifying entry fee contributes to the reward pool.

Admin controls the configured percentage.

Create a contribution ledger.

Display a public live counter where enabled.

The calculation must happen server-side.

============================================================

29. DRAW ENGINE

============================================================

The draw engine is a security-sensitive component.

DO NOT use basic frontend randomization.

DO NOT use Math.random().

The draw must be server-side and cryptographically secure.

Flow:

Competition closes

↓

Freeze eligible entries

↓

Validate ticket pool

↓

Commit/verify draw seed according to approved draw architecture

↓

Execute secure random selection

↓

Generate winner

↓

Generate immutable draw record

↓

Store audit information

↓

Publish verification data

↓

Notify winner

The draw result must be independently verifiable.

============================================================

30. PUBLIC DRAW VERIFICATION

============================================================

Create:

/draw-verification/[campaign]

Public page should display appropriate verification information such as:

Campaign

Draw date

Winner

Draw record

Random seed / verification data

Algorithm information

Ticket/entry pool information where appropriate

The purpose is to allow entrants to independently verify the fairness of the draw.

Do not expose private user information.

============================================================

31. WINNER MANAGEMENT

============================================================

Admin can:

View winner

Verify winner

Record claim status

Record communication

Record delivery/collection

Publish approved winner information

Winner statuses:

SELECTED

CONTACTED

VERIFIED

CLAIM IN PROGRESS

FULFILLED

DISPUTED

CANCELLED

Use the approved competition rules for final winner handling.

============================================================

32. CRM

============================================================

Implement the CRM module inside Admin.

Automatically classify contacts:

LEADS

Hot

Warm

Cold

CLIENTS

Active

Inactive

Dormant

Classification should be configurable.

CRM record should include:

Contact details

Source

Communication history

Calls

Meetings

Follow-ups

Attachments

Staff member

Timestamp

Search

Filter

CSV export

============================================================

33. NOTIFICATIONS

============================================================

Build notification infrastructure.

Support:

Email

SMS

Push-ready architecture

Notifications for:

Registration

Email verification

Phone verification

Wallet funding

Entry purchase

Competition updates

Competition closing

Draw completed

Winner notification

Referral commission

Payout status

Security events

Admin announcements

============================================================

34. SECURITY

============================================================

Security must be designed into the architecture.

Implement:

Password hashing

Secure authentication

Session management

Authorization

CSRF protection where applicable

Input validation

Output encoding

SQL injection prevention

XSS prevention

Secure cookies

Rate limiting

API authorization

Webhook verification

Audit logging

Secret management

Security headers

Encryption in transit

Encryption at rest where appropriate

Do not expose secrets in frontend code.

============================================================

35. RATE LIMITING

============================================================

Server-side rate limiting required for:

Login

Registration

OTP

Password reset

Payment initiation

Wallet funding

Ticket purchase

Referral operations

Payout requests

Sensitive account operations

Implement progressive protection:

Normal

Throttled

Challenge

Temporary lock

Security flag

Do not permanently block users based on a single signal.

============================================================

36. ANTI-FRAUD SYSTEM

============================================================

Build an anti-fraud/risk layer.

Monitor:

Multiple account patterns

Rapid registrations

Repeated failed login attempts

OTP abuse

Payment failures

Unusual wallet activity

Unusual ticket purchases

Bot behavior

Referral abuse

Self-referrals

Artificial referral networks

Suspicious payout activity

Repeated bank accounts

Suspicious device/IP behavior where legally appropriate

Create risk levels:

LOW

MEDIUM

HIGH

CRITICAL

Admin can review flagged accounts/events.

Do not automatically punish legitimate users solely because of one risk signal.

============================================================

37. PAYMENT FRAUD PROTECTION

============================================================

Implement:

Webhook signature verification

Idempotency

Duplicate transaction protection

Transaction reference validation

Server-side payment verification

Replay protection

Atomic wallet crediting

Payment reconciliation

Never trust frontend payment status.

============================================================

38. REFERRAL FRAUD PROTECTION

============================================================

Monitor:

Self-referrals

Circular referrals

Duplicate accounts

Artificial account creation

Suspicious conversion patterns

Repeated device/IP patterns where legally appropriate

Payment/refund abuse

Commission manipulation

Commission reversal after refunds

============================================================

39. PAYOUT FRAUD PROTECTION

============================================================

Before payout approval:

Check:

Available referral balance

Referral transaction history

User status

Verification status

Fraud/risk status

Previous payouts

Duplicate payout requests

Bank information

Admin review requirements

============================================================

40. AUDIT LOGGING

============================================================

Create immutable audit records for sensitive events.

Log:

Login

Failed login

Registration

OTP

Password reset

Wallet funding

Wallet debit

Payment webhook

Ticket purchase

Referral commission

Payout

Admin adjustment

Campaign creation

Campaign edit

Campaign approval

Campaign publication

Campaign closure

Draw

Winner

Fraud flag

Account suspension

Admin configuration changes

Each audit record:

Actor

Action

Reference

Timestamp

Status

Description

Relevant metadata

============================================================

41. DATABASE ARCHITECTURE

============================================================

Use a relational database architecture appropriate for transactional systems.

Recommended:

PostgreSQL

Core entities should include:

users

user_profiles

roles

permissions

user_roles

partners

partner_profiles

partner_assets

campaigns

campaign_media

campaign_rules

tickets

ticket_reservations

orders

order_items

payments

payment_webhooks

wallets

wallet_transactions

ledger_entries

referrals

referral_relationships

commissions

commission_transactions

payouts

payout_bank_accounts

draws

draw_results

winner_claims

reward_pool

reward_pool_transactions

crm_contacts

crm_segments

crm_activities

notifications

verification_records

fraud_events

risk_scores

audit_logs

Do not duplicate financial state unnecessarily.

============================================================

42. MONEY STORAGE

============================================================

All monetary amounts must be stored as integer kobo.

Example:

₦10,000

Stored:

1000000 kobo

Never use floating-point values for financial calculations.

============================================================

43. API ARCHITECTURE

============================================================

Build the backend as a secure API.

Organize APIs logically:

/auth

/users

/profile

/campaigns

/tickets

/orders

/payments

/wallet

/referrals

/commissions

/payouts

/partners

/admin

/draws

/winners

/crm

/notifications

/audit

/fraud

The future Android and iOS applications must be able to consume the same backend.

Do not put critical business logic exclusively inside the web frontend.

============================================================

44. ROLE-BASED ACCESS CONTROL

============================================================

USER:

Can access own:

Profile

Wallet

Entries

Orders

Referral earnings

Payouts

Transactions

Notifications

PARTNER:

Can access own:

Partner profile

Assets

Listings

Campaign performance

Settlement information

ADMIN:

Global authorized access.

Every API must verify ownership/permission server-side.

============================================================

45. SEO

============================================================

This is a major requirement.

Public pages must be server-side rendered, statically generated, or prerendered appropriately.

Do not rely entirely on client-side rendering for public SEO pages.

SEO pages:

/

/competitions

/competitions/[slug]

/winners

/how-it-works

/about

/partners

/faq

/trust

/terms-and-conditions

/privacy-policy

/competition-rules

/draw-verification

Each public competition page must have:

Unique title

Meta description

Canonical URL

OpenGraph metadata

Social metadata

Semantic headings

Optimized images

Structured data where appropriate

SEO-friendly URL

============================================================

46. SITEMAP

============================================================

Generate:

/sitemap.xml

/robots.txt

Include public competitions.

Do not index:

/dashboard

/admin

/partner

/private APIs

private user pages

============================================================

47. PERFORMANCE

============================================================

The product must be mobile-first.

Target:

360px and above

Fast loading

Good Core Web Vitals

Optimized images

Lazy loading

Code splitting

Caching

CDN

Optimized queries

SSR/prerendering

The platform must remain usable on slower Nigerian mobile connections.

============================================================

48. DESIGN SYSTEM

============================================================

Create a sophisticated design system.

Design direction:

Premium

Modern

Minimal

Elegant

High trust

Technology-forward

Avoid:

Cheap gambling aesthetics

Excessive gradients

Clutter

Over-animation

Casino-like visuals

Use strong:

Typography

Spacing

Cards

Visual hierarchy

Micro-interactions

Progress indicators

Countdowns

Prize imagery

Trust indicators

The interface must look like a serious technology company.

============================================================

49. MOBILE EXPERIENCE

============================================================

Design mobile-first.

Mobile navigation:

Home

Competitions

Wallet

Entries

Account

Use appropriate mobile bottom navigation for authenticated users.

Competition cards must work beautifully on small screens.

Ticket purchase must be extremely simple.

Wallet funding must be easy.

Referral sharing must support mobile sharing.

============================================================

50. ACCESSIBILITY

============================================================

Implement:

Semantic HTML

Keyboard navigation

Accessible forms

Proper labels

ARIA where needed

Readable contrast

Focus states

Accessible error messages

Do not make functionality dependent only on hover.

============================================================

51. ERROR HANDLING

============================================================

Create professional error states.

Examples:

Payment failed

Insufficient wallet balance

Competition sold out

Competition closed

Ticket reservation expired

Network error

Invalid OTP

Too many attempts

Account restricted

Payout unavailable

Fraud review

Use clear human-readable messages.

Never expose stack traces or sensitive backend information.

============================================================

52. EMPTY STATES

============================================================

Create beautiful empty states.

Examples:

No competitions entered

No wallet transactions

No referral earnings

No payout history

No partner listings

No notifications

No winners

============================================================

53. ADMIN REPORTING

============================================================

Admin reports should include:

Users

Campaigns

Tickets

Revenue

Wallet funding

Referral commissions

Payouts

Reward pool

Partners

Winners

Refunds

Fraud events

Reports should support filtering and CSV export where appropriate.

============================================================

54. PARTNER REPORTING

============================================================

Partner can view:

Listings

Entries

Revenue/amount generated

Performance

Campaign status

Historical performance

Settlement information

============================================================

55. CONFIGURATION

============================================================

Do not hardcode business parameters.

Admin-configurable settings should include where approved:

Referral commission rates

Reward pool percentage

Campaign limits

Ticket limits

Payout thresholds

Campaign statuses

Notification settings

Fraud thresholds

Other approved platform settings

============================================================

56. CONFIGURATION SAFETY

============================================================

Sensitive configuration changes should:

Require authorized admin access.

Create audit log.

Record:

Previous value

New value

Admin

Timestamp

Reason where appropriate

============================================================

57. INFRASTRUCTURE ACCOUNTS

============================================================

Project infrastructure must be configured so that Rafilla owns the relevant accounts.

Accounts include:

Domain

Hosting

Database

Storage

Email

SMS

Payment gateway

Repository

Other production services

Where possible, use Rafilla's official company details.

The final handover must include required ownership/admin credentials.

Do not make the platform dependent on a developer-owned account.

============================================================

58. SOURCE CODE / DEPLOYMENT

============================================================

Repository should be owned by Rafilla from project commencement where possible.

Maintain clean:

Git history

Environment configuration

README

Deployment documentation

Database migrations

API documentation

Architecture documentation

The system must not contain:

Kill switches

Time locks

Hidden dependencies

Unauthorized backdoors

============================================================

59. TESTING

============================================================

Create automated and manual tests for critical business flows.

Test:

Registration

Login

OTP

Google authentication

Wallet funding

Payment verification

Wallet debit

Ticket purchase

Concurrent ticket purchases

Ticket reservation expiry

Referral calculation

Five-level referral

Referral commission reversal

Referral entry purchase

Payout request

Payout approval

Partner submission

Admin approval

Campaign publication

Campaign closure

Draw

Winner selection

Draw verification

Fraud flags

Rate limiting

Audit logs

SEO

Mobile responsiveness

============================================================

60. CRITICAL CONCURRENCY TEST

============================================================

Example:

Competition has:

50 entries remaining.

1,000 users attempt to buy simultaneously.

Expected:

Exactly 50 valid entries.

No overselling.

No duplicate entry.

No negative inventory.

No wallet double-debit.

No orphan transaction.

============================================================

61. FINANCIAL CONSISTENCY TEST

============================================================

Every transaction must be traceable.

Example:

User funds:

₦50,000

Then buys:

₦10,000 entry.

System must show:

Wallet funding +₦50,000

Entry purchase -₦10,000

Balance ₦40,000

Every value must have corresponding ledger entries.

============================================================

62. REFERRAL TEST

============================================================

Example:

User A

↓

B

↓

C

↓

D

↓

E

↓

F

User F purchases an eligible ₦10,000 entry.

Calculate commissions according to configured rates:

Level 1

8%

Level 2

5%

Level 3

4%

Level 4

2%

Level 5

1%

Create separate ledger records.

Do not calculate the entire referral tree from frontend data.

============================================================

63. REFERRAL PAYOUT TEST

============================================================

User has:

Available referral earnings:

₦50,000

Requests:

₦20,000

System:

Checks balance

Checks eligibility

Checks risk

Checks bank details

Creates payout request

Locks/reserves the requested amount appropriately

Admin reviews

Admin approves/rejects

Payment is processed

Ledger updated

Audit record created

============================================================

64. DRAW TEST

============================================================

After campaign closure:

No new entries can be purchased.

Ticket pool becomes immutable for draw purposes.

Draw executes securely.

Winner generated.

Result stored.

Verification page created.

Winner notification generated.

All relevant actions logged.

============================================================

65. UAT

============================================================

Build the product so it can be tested against the agreed scope.

Acceptance should cover:

Functional requirements

Security

Payment

Wallet

Tickets

Referral

Partner

Admin

Draw

SEO

Performance

Mobile

Notifications

Auditability

============================================================

66. DEVELOPMENT APPROACH

============================================================

DO NOT attempt to build the entire platform in one uncontrolled generation.

Build incrementally.

Recommended sequence:

PHASE 1

Project architecture

Database schema

Authentication

Design system

Public website

SEO foundation

PHASE 2

User dashboard

Wallet

Payment gateway

Transactions

Ticket engine

PHASE 3

Campaign management

Admin dashboard

Partner portal

Asset management

PHASE 4

Referral engine

Referral earnings

Payout system

Reward pool

CRM

PHASE 5

Draw engine

Winner management

Draw verification

Anti-fraud

Audit system

PHASE 6

Testing

Security hardening

Performance testing

Mobile optimization

SEO verification

Production deployment

============================================================

67. IMPORTANT DEVELOPMENT RULE

============================================================

Do not generate fake production functionality.

Do not use fake wallet balances in production.

Do not use fake payment success.

Do not use frontend-only ticket inventory.

Do not use frontend-only referral calculations.

Do not use Math.random() for winner selection.

Do not allow frontend users to determine their own:

wallet balance

role

ticket price

commission

payment status

payout status

draw result

competition status

All critical business logic must be server-side.

============================================================

68. DEMO DATA

============================================================

During development, use clearly marked seed/demo data.

Example competitions:

Mercedes-Benz C-Class

Toyota Land Cruiser

Premium Smartphone Bundle

Luxury Apartment

Do not represent demo data as real competitions in production.

============================================================

69. FINAL PRODUCT EXPERIENCE

============================================================

The ideal user journey:

LAND ON RAFILLA

↓

See premium competitions

↓

Select a prize

↓

View competition details

↓

Create account / login

↓

Verify phone/email

↓

Complete profile

↓

Fund Rafilla Wallet

↓

Choose competition

↓

Select entries

↓

Purchase

↓

Receive unique entry numbers

↓

Track competition

↓

Competition closes

↓

Verifiable draw

↓

Winner selected

↓

Winner verification

↓

Winner announcement

At the same time:

USER

↓

Shares referral link

↓

New users register

↓

Qualifying activity occurs

↓

Referral commissions generated

↓

Commissions become available

↓

User either:

USE FOR ENTRY

OR

REQUEST CASH PAYOUT

============================================================

70. FINAL UI/UX STANDARD

============================================================

The final product must feel like a serious, well-funded African technology platform.

Think:

Premium marketplace

-

Fintech-grade transaction experience

-

Modern competition platform

-

Trust-first design

-

Enterprise-grade admin system

The user should immediately understand:

WHAT IS THE PRIZE?

HOW MUCH IS AN ENTRY?

HOW MANY ENTRIES ARE AVAILABLE?

WHEN DOES IT CLOSE?

HOW DOES THE DRAW WORK?

IS MY MONEY SAFE?

WHAT HAPPENS AFTER I ENTER?

The answer to these questions should always be visually obvious.

============================================================

71. FINAL IMPLEMENTATION INSTRUCTION

============================================================

Before implementing each major module:

1. Understand the existing architecture.

2. Check the database model.

3. Check existing API/business logic.

4. Do not duplicate functionality.

5. Maintain existing functionality.

6. Implement proper error handling.

7. Implement authorization.

8. Implement audit logging for sensitive actions.

9. Test the complete flow.

10. Ensure mobile responsiveness.

11. Ensure SEO for public pages.

12. Ensure the implementation does not conflict with the final legal agreement.

When there is a conflict between the earlier PRD and the final legal agreement:

THE FINAL LEGAL AGREEMENT WINS.

When there is a conflict between an old requirement and the explicitly updated product decisions:

THE LATEST APPROVED PRODUCT DECISION WINS.

Do not reintroduce rejected BVN/NIN requirements.

Do not build native mobile apps in this phase.

Do not add unapproved features that materially expand the agreed scope.

Build Rafilla as a secure, scalable, production-quality platform rather than a visual prototype.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f34cbeff-8db3-48b5-8a10-0a66a94b4a09).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
