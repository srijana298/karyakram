# Mahotsav — Product Requirements Document

| | |
|---|---|
| **Version** | 2.0 (full rewrite) |
| **Date** | 2026-07-13 |
| **Author** | Srijana Dahal |
| **Status** | Draft — approved for v1 build |
| **Product** | Mahotsav — a free event-management platform for organizers in Nepal |

---

## 1. Overview

Mahotsav is a free, full-stack event-management platform for **any event organizer in Nepal** — meetups, workshops, concerts, sports events, and community programs. Anyone can sign up, publish an event page, collect RSVPs, sell tickets through **local payment gateways (Khalti and eSewa)**, manage seat capacity with an automatic waitlist, check attendees in with QR codes, and keep everyone informed through automated email.

The platform is **free to use**; organizers keep 100% of their ticket revenue (Mahotsav takes no commission in v1).

---

## 2. Problem Statement

Event organizers in Nepal have no single tool that fits the local context. International platforms (Luma, Eventbrite) are polished but:

- **Don't support Nepali payment rails** — no Khalti or eSewa, so organizers fall back to manual bank transfers, eSewa screenshots in WhatsApp, and spreadsheets to reconcile who paid.
- Charge commissions or require international cards.
- Leave organizers to manage **capacity, waitlists, and no-shows** by hand — leading to overbooked venues, lost waitlist demand, and empty seats when confirmed guests don't show.

Attendees, in turn, have no reliable place to discover events, pay locally, get a seat (or a fair spot in line), and receive confirmations and reminders.

---

## 3. Positioning

> **Mahotsav is the local-first event platform for Nepal: everything Luma does for RSVPs and ticketing, but with Khalti/eSewa built in and free to use.**

**Primary differentiator:** native **Khalti + eSewa** payments.
**Supporting strengths:** automatic capacity + waitlist management, QR check-in, and (Phase 2) multi-day event groups with certificates — features tailored to fests and programs that generic tools handle poorly.

| Capability | Mahotsav | Luma / Eventbrite |
|---|---|---|
| Khalti / eSewa payments | ✅ | ❌ |
| Free (no commission) | ✅ | ❌ (fees) |
| Capacity + FCFS waitlist | ✅ | ✅ |
| QR check-in | ✅ | ✅ |
| Multi-day event groups + certificates | ✅ (Phase 2) | ⚠️ limited |

---

## 4. Target Users & Personas

- **Organizer (host):** any user. Creates and manages events, sets pricing and capacity, approves RSVPs (if enabled), checks attendees in, views analytics. There is no separate "organizer" account tier — every user can host.
- **Attendee:** any user. Discovers events, RSVPs, pays, joins waitlists, checks in.
- **Super-admin:** platform operator. Oversight across all users and events; can remove abusive content and users. Not an event-management role.

A single person is usually both organizer and attendee depending on context.

---

## 5. Goals & Non-Goals

### Goals (v1)
- Let any Nepali organizer publish an event and collect RSVPs in minutes.
- Accept payments for paid events via Khalti and eSewa (sandbox in v1).
- Enforce capacity automatically with a fair FIFO waitlist and auto-promotion.
- Keep attendees informed automatically (confirmations, reminders, waitlist offers).
- Correctly handle concurrency so an event is never overbooked.

### Non-Goals (v1)
- No commission/billing system (platform is free).
- No multiple ticket tiers (single flat fee only).
- No automated gateway refunds (refunds are handled offline in v1).
- No guest checkout (an account is required to RSVP).
- No SMS/phone-OTP or social login (email + password only).
- No overbooking (capacity is a hard cap).

---

## 6. Scope

### 6.1 In scope — v1
1. **Accounts & Auth** — email + password, email verification, self-serve hosting.
2. **Event creation & management** — single events; public / unlisted / private visibility.
3. **RSVP & approval** — per-event toggle: auto-confirm (FCFS) or require approval.
4. **Capacity & Waitlist** — hard cap, FIFO waitlist, notify + 24h claim-window promotion.
5. **Paid ticketing** — Khalti + eSewa (sandbox), single flat fee, pay-to-reserve, 15-min hold.
6. **Coupons** — flat or % discount, usage limits; Rs. 0 total → free RSVP.
7. **Email notifications** — confirmations, rejections, reminders (24h + 1h), waitlist offers, receipts, cancellations.
8. **QR check-in / attendance** — self check-in code + organizer scan.
9. **Recommendations** — Jaccard-similarity "recommended events" (existing).
10. **Analytics** — per-event organizer dashboards (existing, retained).

### 6.2 Phase 2 / Later (built or partially built — documented, not v1 focus)
- **Event Groups** — parent events with sub-events, group stats, conflict view.
- **Certificates** — auto-generated PNG certificates, template editor, public verification.
- Bulk RSVP, group-level certificates, group landing pages.

### 6.3 Out of scope (v1)
- Commission/payout system, ticket tiers, automated refunds, guest checkout, SMS/OTP, social login, overbooking, native mobile app.

---

## 7. User Roles & Permissions

| Action | Attendee (any user) | Organizer (event owner) | Super-admin |
|---|---|---|---|
| Browse / RSVP / pay | ✅ | ✅ | ✅ |
| Create & manage own events | ✅ (self-serve) | ✅ | ✅ |
| Approve/reject RSVPs, check-in, view analytics | — | ✅ (own events) | ✅ (all) |
| See all events/users, remove content | — | — | ✅ |

Ownership is per event (`events.created_by`). "Organizer" = the owner of the event being acted on.

---

## 8. Domain Model & Key Concepts

- **Event** — a single event with a date/time, location or online link, visibility, optional capacity, optional flat fee, and an approval toggle.
- **RSVP** — a user's request/reservation for an event. Moves through a well-defined lifecycle (§10).
- **Waitlist** — the ordered (FIFO) set of RSVPs beyond capacity for a given event.
- **Payment** — a Khalti/eSewa transaction tied to an RSVP.
- **Coupon** — an organizer-defined discount code for a paid event.

---

## 9. Feature Specifications

### 9.1 Accounts & Auth
- Sign up with **email + password**; verify email via link before hosting/paying.
- Any verified user can create events (self-serve). No organizer approval step.
- `role` returned in login/signup/`/me` responses (`user` | `admin`) and stored client-side for UI gating.

### 9.2 Event creation & management
- Fields: title, description, cover image, date/time, medium (online/offline), location or meet link, category, **visibility** (public/unlisted/private), **capacity** (optional, 0 = unlimited), **is_paid + entry_fee** (optional), **requires_approval** (toggle).
- **Visibility:**
  - **public** — listed in Explore, discoverable, indexable.
  - **unlisted** — accessible by direct link only; not in Explore.
  - **private** — invite-only; only invited users can view/RSVP.
- Organizer can edit, cancel (triggers cancellation emails), and close RSVPs.

### 9.3 RSVP & approval (per-event toggle)
Each event is either:
- **Auto-confirm (FCFS):** RSVPs are confirmed immediately while seats remain; overflow is waitlisted.
- **Require approval:** RSVPs enter `pending_approval`; the organizer approves (up to capacity) or rejects. Overflow (or approvals beyond capacity) is waitlisted.

Capacity is enforced on **confirmed** seats in both modes.

### 9.4 Capacity & Waitlist (FCFS) — flagship

**Rules**
- Capacity is a **hard cap** (`max_participants`); no overbooking.
- When confirmed seats = capacity, further RSVPs join a **FIFO waitlist** ordered by RSVP time.
- Joining a waitlist is always **free**, even for paid events (payment happens on promotion).

**Atomic seat allocation (correctness under concurrency)**
- The "check remaining capacity + create/confirm RSVP" step runs inside a **single database transaction** using row locking (`SELECT ... FOR UPDATE`) or an atomic conditional update (`UPDATE ... WHERE confirmed_count < capacity`).
- This prevents the classic **last-seat race condition** where two simultaneous requests both read "1 seat left" and both get confirmed.

**Promotion (notify + claim window)**
- When a confirmed seat frees up (cancellation, expiry, rejection), the system takes the **head of the waitlist** and moves them to `promotion_offered`.
- The offered user is emailed with a **24-hour claim window**:
  - **Free event:** clicking "Accept" confirms the seat.
  - **Paid event:** they must complete payment within the window (pay-to-reserve).
- If the window expires without claim/payment → the offer **expires**, and the seat is offered to the **next** person in line.
- Seats never sit dead: expiry immediately cascades to the next waitlisted user.

### 9.5 Paid ticketing (Khalti + eSewa, sandbox)

- Organizer sets **is_paid** + a **single flat fee** (NPR).
- **Pay-to-reserve:** a seat is only confirmed after a **successful** payment. A paid seat = a confirmed seat.
- **15-minute payment hold:** when a user initiates payment, their seat is held (`payment_pending`) for 15 minutes during the gateway round-trip. If payment isn't completed, a **cleanup job** releases the seat back to the pool (and promotes the next waitlisted user if applicable).
- **Gateways:** both **Khalti** and **eSewa** sandbox in v1; attendee picks one at checkout.
- **Flow:** initiate → redirect to gateway → callback → server-side verification → confirm RSVP + send receipt.

**Paid × approval combination**
- If a paid event also requires approval: **pay first → seat held/paid → organizer approves or rejects.**
- On **rejection**, the payment is marked **`refund_due`** and the user is notified; the organizer settles the refund **offline** (no automated gateway refund in v1).

### 9.6 Coupons (v1)
- Organizers create codes per event: **flat** (Rs. off) or **percent** (% off), with **usage limits** and optional expiry.
- Applied at checkout; if the discounted total is **Rs. 0**, the RSVP is confirmed **free** (no gateway call), still respecting capacity/hold rules.
- Usage is counted atomically to prevent over-redemption.

### 9.7 Email notifications (Resend)
v1 triggers:
- **RSVP confirmed** / **RSVP rejected**
- **Event reminders — 24h and 1h before** (scheduled via cron)
- **Waitlist promotion** ("A seat opened — claim within 24h" + link)
- **Payment receipt** (after successful payment)
- **Event cancellation** (organizer cancels)

An **`email_log`** table records each send (type, recipient, event) to **deduplicate** (e.g., never send two 24h reminders).

### 9.8 QR check-in / attendance (retained)
- Each event has a check-in code; attendees self-check-in via a unique link/QR, or organizers scan at the door.
- Attendance is recorded per event (`checked_in`, method: manual/self).

### 9.9 Recommendations (retained)
- "Recommended events" computed via **Jaccard similarity** over category/interest overlap.

### 9.10 Analytics (retained)
- Per-event organizer dashboards: RSVPs over time, confirmed vs waitlisted, check-in rate, revenue (for paid events), XLSX export of attendees.

---

## 10. RSVP Lifecycle (state machine)

`rsvps.status` enum:

```
requested          → initial state for approval-mode events
payment_pending    → seat held during payment (15-min TTL)
pending_approval   → paid/awaiting organizer decision (approval mode)
confirmed          → holds a seat (free-accepted or paid-success or approved)
waitlisted         → in the FIFO queue (over capacity)
promotion_offered  → head of waitlist, within 24-h claim window
rejected           → organizer rejected (payment → refund_due if paid)
cancelled          → attendee cancelled (frees a seat)
expired            → didn't pay/claim within window (frees the offer)
```

**Transitions (representative):**

| Scenario | Path |
|---|---|
| Free, auto-confirm, seat available | → `confirmed` |
| Free, auto-confirm, full | → `waitlisted` |
| Free, approval | `requested` → `confirmed` / `rejected` (or `waitlisted` if full) |
| Paid, auto-confirm | `payment_pending` → `confirmed` (success) / `expired` (timeout) |
| Paid, approval | `payment_pending` → `pending_approval` → `confirmed` / `rejected(refund_due)` |
| Waitlist promotion (free) | `waitlisted` → `promotion_offered` → `confirmed` / `expired` |
| Waitlist promotion (paid) | `waitlisted` → `promotion_offered` → `payment_pending` → `confirmed` / `expired` |
| Attendee cancels a confirmed seat | `confirmed` → `cancelled` → *(promote next)* |

Any transition **out of `confirmed`** (cancelled/rejected/expired) triggers **waitlist promotion** for that event.

---

## 11. Data Model (schema changes)

**`events`** — add:
- `is_paid` boolean default false
- `entry_fee` int (NPR) default 0
- `currency` varchar default `"NPR"`
- `requires_approval` boolean default false
- (existing `max_participants` becomes the enforced capacity; `0` = unlimited)
- `payment_hold_minutes` int default 15
- `claim_window_hours` int default 24

**`rsvps`** — migrate the old `approved/rejected/pending` booleans to:
- `status` varchar enum (see §10)
- `waitlist_position` int (nullable; FIFO order)
- `promotion_offered_at` timestamp (nullable)
- `claim_expires_at` timestamp (nullable)
- `payment_status` varchar (`none|initiated|success|failed|refund_due|refunded`)
- `amount_paid` int default 0

**`payments`** (new):
- `id`, `rsvp_id`, `event_id`, `user_id`, `gateway` (`khalti|esewa`), `amount`, `coupon_id` (nullable), `status` (`initiated|success|failed|refund_due|refunded`), `gateway_ref` / `pidx` / `token`, `created_at`, `updated_at`.

**`coupons`** (new):
- `id`, `event_id`, `code`, `type` (`flat|percent`), `value`, `max_uses`, `used_count`, `expires_at` (nullable), `active`, `created_by`, timestamps.

**`email_log`** (new):
- `id`, `user_id`, `event_id`, `type`, `to_email`, `status`, `sent_at` — used for dedup.

---

## 12. API Contracts (key endpoints)

**Auth** (existing, extended to return `role`)
- `POST /api/auth/signup` · `POST /api/auth/login` · `GET /api/auth/me` · `PATCH /api/auth/me`

**Events**
- `POST /api/events` (create) · `GET /api/events` (list/explore, respects visibility) · `GET /api/events/:id` · `PATCH /api/events/:id` · `DELETE /api/events/:id` (cancel + emails)

**RSVP & waitlist**
- `POST /api/events/:id/rsvp` — creates RSVP; server decides `confirmed` / `waitlisted` / `pending_approval` / `payment_pending` atomically.
- `POST /api/rsvps/:id/cancel` — attendee cancels; triggers promotion.
- `PATCH /api/rsvps/:id/approve` · `PATCH /api/rsvps/:id/reject` — organizer (approval mode).
- `POST /api/rsvps/:id/claim` — accept a `promotion_offered` seat (free) or begin payment (paid).
- `GET /api/events/:id/waitlist` — organizer view.

**Payments**
- `POST /api/payments/initiate` — `{ rsvpId, gateway, couponCode? }` → returns gateway redirect payload.
- `GET /api/payments/khalti/callback` · `GET /api/payments/esewa/callback` — verify + confirm.
- `GET /api/events/:id/payments` — organizer ledger · `GET /api/events/:id/payments/summary` — totals.

**Coupons**
- `POST /api/events/:id/coupons` · `GET /api/events/:id/coupons` · `PATCH /api/coupons/:id` · `DELETE /api/coupons/:id` · `POST /api/coupons/validate`.

**Attendance / check-in** (existing)
- self check-in + organizer scan endpoints retained.

---

## 13. Key Algorithms

1. **Atomic seat allocation** — transaction + row lock (`SELECT ... FOR UPDATE`) or conditional `UPDATE ... WHERE confirmed_count < capacity`. Guarantees no overbooking under concurrent RSVPs. *(This is the primary "beyond-CRUD" algorithmic contribution: correctness under concurrency.)*
2. **FCFS waitlist + promotion** — FIFO queue keyed by RSVP time; on any seat release, promote the head with a 24h claim window; cascade to next on expiry.
3. **Payment-hold cleanup** — scheduled job releases `payment_pending` seats older than 15 minutes and promotes the next waitlisted user.
4. **Coupon application** — validate code (active, unexpired, under `max_uses`), compute flat/percent discount, atomically increment `used_count`; Rs. 0 total → free-confirm path.
5. **Event reminders** — cron scans for events 24h / 1h out and sends reminders (deduped via `email_log`).
6. **Jaccard recommendations** (existing) — similarity over category/interest sets.

---

## 14. Non-Functional Requirements

- **Concurrency/correctness:** capacity enforcement must be race-free (transactions/locks).
- **Payment integrity:** always verify gateway callbacks **server-side** before confirming; never trust client-reported success.
- **Idempotency:** callbacks and claims must be idempotent (a retried callback must not double-confirm or double-charge).
- **Security:** JWT auth; ownership checks on all organizer actions; email verification before hosting/paying.
- **Reliability:** email sends are logged and deduped; failed sends are retryable.

---

## 15. Phase 2 / Later (documented, not v1)

- **Event Groups** — parent + sub-events, group stats, conflict view, group landing pages, bulk RSVP.
- **Certificates** — auto-generated PNG certificates, drag-and-drop template editor, unique verification codes, public verification page, group-level certificates.

These are built or partially built and must be preserved; they are simply not the v1 launch focus.

---

## 16. Open Questions / Risks

- **Refund automation:** v1 refunds are manual. If organizers demand automated refunds, prioritize Khalti/eSewa refund APIs in a later phase.
- **eSewa/Khalti sandbox parity:** confirm both sandboxes support the initiate + verify flow needed for pay-to-reserve.
- **RSVP schema migration:** moving from `approved/rejected/pending` booleans to a `status` enum needs a careful data migration for existing rows.
- **Email deliverability in Nepal:** validate Resend deliverability; SMS/OTP is a future option if email proves unreliable.

---

## 17. Tech Stack

- **Frontend:** React + Vite + TailwindCSS · React Router · react-hot-toast
- **Backend:** Node + Express · Drizzle ORM · MySQL
- **Payments:** Khalti + eSewa (sandbox)
- **Email:** Resend
- **Scheduling:** node-cron (payment cleanup, reminders)
