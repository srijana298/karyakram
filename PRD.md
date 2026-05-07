# Mahotsav — Product Requirements Document

**Project:** Mahotsav — Campus Event Management Platform  
**Author:** Srijana Dahal  
**Date:** April 30, 2026  
**Status:** Draft  
**Mid-defense:** Week of May 5, 2026  
**Final defense:** July 2026  

---

## Problem Statement

College organizers in Nepal lack a unified platform to manage multi-day events like sports weeks, tech fests, and cultural programs. Existing tools either don't support **event grouping** (parent events with sub-events), lack **attendance tracking per sub-event**, and provide no way to **generate certificates** for participants. Organizers are forced to use spreadsheets, WhatsApp groups, and manual processes — leading to lost data, no-shows going untracked, and participants receiving no formal recognition.

Students (attendees) also lack a single place to discover campus events, RSVP, check in, and download their participation certificates.

From a technical perspective, the project needs to demonstrate non-trivial algorithms (conflict detection, attendance aggregation across grouped events, recommendation engine) beyond basic CRUD — as required by the TU BCA 8th Semester Project III guidelines.

---

## Solution

Mahotsav is a full-stack campus event management platform with:

1. **Event Groups** — A parent event (e.g., "Sports Week 2025") containing sub-events (e.g., "Futsal Day 1", "Cricket Finals"), each with independent RSVPs, attendance, and scheduling.
2. **Attendance Tracking** — Per-sub-event attendance with a **conflict detection algorithm** that flags scheduling overlaps and double-booked participants.
3. **Certificate Generation** — Auto-generated downloadable PNG certificates for attendees, with a drag-and-drop template editor that lets organizers upload custom backgrounds and place text fields.
4. **Role-Based Access** — Super Admin, Organizer, and Attendee roles with different permissions.
5. **Improved Dashboard Navigation** — Quick access to RSVPs, invites, attendance, and certificates from every context.
6. **Smart Search & Recommendations** — Multi-field search with relevance ranking and collaborative filtering-based event recommendations (already implemented).
7. **Payment Integration** — Khalti and eSewa gateway support for paid events. Organizers set a flat entry fee; attendees pay before RSVP. Coupon codes supported (flat or percentage discount, limited usage).
8. **Email Notifications** — Automated emails via Resend for RSVP confirmations/rejections, event reminders (24h and 1h before), collaboration invitations, certificate generation, and event cancellations.

---

## User Stories

### Event Groups

1. As an **organizer**, I want to create an **event group** (e.g., "Sports Week 2025"), so that I can organize a multi-day program under one umbrella.
2. As an **organizer**, I want to add **sub-events** to a group (e.g., "Futsal", "Cricket", "Table Tennis"), so that each activity has its own RSVP, schedule, and attendance.
3. As an **organizer**, I want sub-events to have their own **date, time, location, and medium** (online/offline), so that "Women's Basketball" and "Men's Basketball" can happen at the same time in different places.
4. As an **organizer**, I want to see a **warning** when two sub-events overlap in time and share participants, so that I can resolve scheduling conflicts.
5. As an **organizer**, I want to see **group-level stats** (e.g., "45/60 attendees attended at least one sub-event"), so that I can evaluate overall participation.
6. As a **student**, I want to browse an event group's **landing page** that lists all sub-events, so that I can see the full schedule at a glance.
7. As a **student**, I want to RSVP to **individual sub-events** within a group, so that I only commit to events I'll actually attend.
8. As an **organizer**, I want to RSVP on behalf of a student to all sub-events in a group (bulk RSVP), so that I can register entire teams at once.

### Attendance Tracking

9. As an **organizer**, I want to **mark attendance** for each sub-event individually, so that I know exactly who showed up for Futsal vs. Cricket.
10. As an **organizer**, I want to see a list of **approved RSVPs** for an event, with a toggle to mark each as "attended" or not, so that attendance recording is fast.
11. As an **organizer**, I want to mark attendance via a **unique check-in code** displayed at the venue that attendees can enter on their phone, so that self-check-in reduces my workload.
12. As a **student**, I want to see my **attendance history** (which events I attended, which I missed), so that I have a personal record.
13. As an **organizer**, I want to see a **conflict report** showing students who are double-booked across overlapping sub-events, so that I can resolve conflicts before the event.
14. As an **organizer**, I want to **export attendance** as an XLSX file per event or per group, so that I can submit records to the college administration.

### Certificate Generation

15. As an **organizer**, I want to click **"Generate Certificates"** on an event and have it auto-generate PNG certificates for all attendees who were marked present, so that I don't have to create them manually.
16. As a **student**, I want to **download my certificate** from the event page or my dashboard, so that I have proof of participation.
17. As an **organizer**, I want to **choose from a list of certificate templates** (built-in and custom), so that the design matches the event theme.
18. As an **organizer**, I want to **design my own template** using a drag-and-drop editor where I upload a background image and place text fields (participant name, event details), so that certificates have custom branding.
19. As an **organizer**, I want to **reuse my custom templates** across multiple events, so that I don't have to recreate the same design each time.
20. As an **organizer**, I want each certificate to have a **unique verification code**, so that anyone can verify its authenticity.
21. As a **student**, I want to enter a verification code on the platform and see if the certificate is valid, so that certificates can't be faked.
22. As an **organizer**, I want to generate certificates for an **entire event group** (one certificate per student listing all sub-events attended), so that Sports Week participants get a comprehensive certificate.

### Role-Based Access Control

23. As a **super admin**, I want to see **all events across all organizers** on my dashboard, so that I can moderate the platform.
24. As a **super admin**, I want a **Users** page listing every registered user with their role and activity, so that I can manage the platform.
25. As a **super admin**, I want to see **platform-wide analytics** (total events, total users, RSVP rates across all organizers), so that I understand platform usage.
26. As an **organizer**, I want to see only **my events** and my analytics, so that my dashboard is focused on my work.
27. As a **student (attendee)**, I want a clean dashboard showing my **upcoming events, RSVPs, attendance, and certificates**, so that I don't see organizer tools I don't need.
28. As an **attendee**, I want to **browse and explore events** on the landing pages without logging in, but be prompted to log in when I try to RSVP.
29. As an **admin**, I want my **sidebar** to show: Home | All Events | All Groups | Users | Analytics | Notifications, so that I have full platform oversight.
30. As an **organizer**, I want my **sidebar** to show: Home | My Events | Invites | Groups | Notifications, so that I can manage the events I organize.
31. As an **attendee**, I want my **sidebar** to show: Home | My Events | My Certificates | My Attendance | Notifications, so that I only see what's relevant to me.

### Dashboard & Navigation

32. As an **organizer**, I want to click on an event and **immediately see its RSVPs, invites, attendance, and certificates** on one page, so that I don't have to navigate through multiple screens.
33. As an **organizer**, I want a **breadcrumb trail** showing where I am (Dashboard > Events > Sports Week > Futsal), so that I can navigate back easily.
34. As an **attendee**, I want a **"My Events"** page showing events I've RSVP'd to, so that I can find them quickly.
35. As an **organizer**, I want quick-action buttons on each event card (RSVPs, Attendance, Edit, Delete, Certificates), so that common actions are one click away.
36. As an **admin**, I want the **"Create Event" button** to be hidden from my dashboard (admins moderate, they don't organize), so that the UI is clear about my role.
37. As an **attendee**, I want the **"Create Event" button** to be hidden, since I participate in events rather than organize them.

### Recommendations & Search (existing, to be enhanced)

38. As an **attendee**, I want to see **recommended events** based on my past RSVPs, so that I discover relevant events (already implemented via Jaccard similarity).
39. As an **attendee**, I want to **search events by title, category, location, and date range**, so that I can find exactly what I'm looking for (already implemented).
40. As an **attendee**, I want to filter events by **event groups**, so that I can discover multi-day programs like sports weeks.

### Payment Integration

41. As an **organizer**, I want to mark an event as **paid or free** during event creation, so that I can charge an entry fee when needed.
42. As an **organizer**, I want to set a **flat entry fee in NPR** for paid events, so that attendees know the cost upfront.
43. As an **attendee**, I want to see the **entry fee** on the event page before RSVPing, so that I know what I'm paying for.
44. As an **attendee**, I want to **choose between Khalti and eSewa** as my payment method, so that I can pay with my preferred gateway.
45. As an **attendee**, I want to be **redirected to the payment gateway**, complete payment, and have my RSVP automatically confirmed, so that the process is seamless.
46. As an **attendee**, if I **close the payment page or payment fails**, I want no RSVP to be created, so that I'm not charged without confirmation.
47. As an **organizer**, I want to see a **payment ledger** per event showing who paid, how much, which gateway, and when, so that I have a financial record.
48. As an **organizer**, I want to see the **total amount collected** per event, so that I know my revenue at a glance.
49. As an **organizer**, I want to create **coupon codes** per event (flat amount or percentage discount, limited to X uses), so that I can offer promotional discounts.
50. As an **attendee**, I want to **apply a coupon code** before payment and see the discounted price, so that I can use promotional offers.
51. As an **attendee**, if a coupon brings the total to **Rs. 0**, I want my RSVP confirmed without being redirected to a payment gateway, so that free promotions work smoothly.
52. As an **organizer**, coupon codes are **one per RSVP** (no stacking), so that discount abuse is prevented.
53. As an **organizer**, I want payment to work **per sub-event** within event groups, so that attendees pay for each activity they join separately.

### Email Notifications

54. As an **attendee**, I want to receive an **email when my RSVP is confirmed**, so that I have a record outside the app.
55. As an **attendee**, I want to receive an **email when my RSVP is rejected**, so that I'm informed promptly.
56. As an **attendee**, I want to receive an **email reminder 24 hours before** an event I have a confirmed RSVP for, so that I don't forget.
57. As an **attendee**, I want to receive an **email reminder 1 hour before** an event I have a confirmed RSVP for, so that I arrive on time.
58. As a **collaborator**, I want to receive an **email when I'm invited** to help organize an event, so that I don't miss the invitation.
59. As an **attendee**, I want to receive an **email when my certificate is generated**, so that I know to download it.
60. As an **attendee**, I want to receive an **email when an event I RSVP'd to is cancelled**, so that I'm not left in the dark.
61. As an **organizer**, I want event reminders to apply to **sub-events within groups** as well, so that attendees are reminded for each individual activity.

---

## Implementation Decisions

### Schema Changes

1. **New table: `event_groups`** (already implemented)
   - `id`, `title`, `description`, `cover_image`, `category`, `privacy`, `created_by` (FK → users), `created_at`, `updated_at`

2. **Alter table: `events`** (partially implemented, adding payment fields)
   - `group_id` (nullable FK → event_groups) — already exists
   - `check_in_code` (varchar, nullable) — already exists
   - `is_paid` (boolean, default false) — whether the event charges an entry fee
   - `entry_fee` (int, nullable) — flat fee in NPR (e.g., 500)
   - `discounted_fee` (int, nullable) — computed after coupon, stored for audit

3. **New table: `payments`**
   - `id`, `event_id` (FK → events), `user_id` (FK → users), `amount` (int, NPR), `discount_amount` (int, default 0), `coupon_id` (nullable FK → coupons), `gateway` (enum: "khalti", "esewa"), `gateway_transaction_id` (varchar), `gateway_ref_id` (varchar), `status` (enum: "pending", "success", "failed"), `paid_at` (timestamp, nullable), `created_at`, `updated_at`

4. **New table: `coupons`**
   - `id`, `event_id` (FK → events), `code` (varchar, unique per event), `discount_type` (enum: "flat", "percentage"), `discount_value` (int — flat amount in NPR or percentage number), `max_uses` (int), `used_count` (int, default 0), `created_by` (FK → users), `expires_at` (timestamp, nullable), `created_at`, `updated_at`

5. **New table: `attendance`** (already implemented)
   - `id`, `event_id`, `user_id`, `checked_in`, `check_in_method`, `checked_in_at`, `created_at`

6. **New table: `certificate_templates`** (already implemented)
   - `id`, `name`, `theme`, `background_url`, `canvas_json`, `canvas_width`, `canvas_height`, `created_by`, `created_at`, `updated_at`

7. **New table: `certificates`** (already implemented)
   - `id`, `event_id`, `user_id`, `template_id`, `verification_code`, `image_data`, `generated_at`, `created_at`, `updated_at`

8. **New table: `email_log`**
   - `id`, `user_id` (FK → users), `event_id` (nullable FK → events), `type` (varchar — e.g., "rsvp_confirmed", "rsvp_rejected", "event_reminder_24h", "event_reminder_1h", "invitation", "certificate_generated", "event_cancelled"), `email_to` (varchar), `subject` (varchar), `status` (enum: "queued", "sent", "failed"), `resend_id` (varchar, nullable — Resend message ID for tracking), `sent_at` (timestamp, nullable), `created_at`

9. **Alter table: `users`** (already implemented)
   - `role` (varchar: "admin", "organizer", "attendee", default: "attendee")
   - `avatar` (varchar, nullable URL)

### API Contracts

10. **Event Groups API** (already implemented)
    - `POST /api/groups` — Create a group
    - `GET /api/groups` — List groups
    - `GET /api/groups/:id` — Get group with sub-events
    - `PATCH /api/groups/:id` — Update group
    - `DELETE /api/groups/:id` — Delete group
    - `GET /api/groups/:id/stats` — Aggregated stats
    - `GET /api/groups/:id/conflicts` — Scheduling conflicts

11. **Attendance API** (already implemented)
    - `POST /api/events/:id/attendance` — Mark attendance
    - `POST /api/events/:id/attendance/bulk` — Bulk mark
    - `POST /api/events/:id/checkin` — Self check-in
    - `GET /api/events/:id/attendance` — List attendance
    - `GET /api/groups/:id/attendance` — Group attendance

12. **Certificates API** (already implemented)
    - `GET /api/certificates/templates` — List templates
    - `POST /api/certificates/templates` — Create template (with background upload)
    - `GET /api/certificates/templates/:id` — Get template
    - `PATCH /api/certificates/templates/:id` — Update template
    - `DELETE /api/certificates/templates/:id` — Delete template
    - `POST /api/certificates/events/:id/generate` — Generate certificates
    - `GET /api/certificates/events/:id` — List certificates for event
    - `GET /api/certificates/mine` — List current user's certificates
    - `GET /api/certificates/verify/:code` — Public verification

13. **Payments API** (new)
    - `POST /api/payments/initiate` — Initiate payment for an event RSVP. Body: `{ eventId, gateway: "khalti" | "esewa", couponCode?: string }`. Returns the gateway redirect URL (Khalti or eSewa). If a coupon is applied and the total becomes Rs. 0, immediately creates the RSVP and returns `{ free: true }` with no redirect.
    - `GET /api/payments/khalti/callback` — Khalti callback/return URL after payment completion. Verifies the transaction with Khalti's lookup API, creates RSVP on success.
    - `GET /api/payments/esewa/callback` — eSewa callback/return URL. Verifies via eSewa's verification API, creates RSVP on success.
    - `GET /api/events/:id/payments` — List payment ledger for an event (organizer/admin only). Returns: `{ user, amount, discountAmount, gateway, gatewayTransactionId, paidAt }[]`
    - `GET /api/events/:id/payments/summary` — Total collected, total discounts, number of paid RSVPs for an event.

14. **Coupons API** (new)
    - `POST /api/events/:id/coupons` — Create a coupon for an event. Body: `{ code, discountType: "flat" | "percentage", discountValue, maxUses, expiresAt? }`. Organizer only.
    - `GET /api/events/:id/coupons` — List coupons for an event. Organizer only.
    - `PATCH /api/coupons/:id` — Update a coupon (change max uses, expiry, disable).
    - `DELETE /api/coupons/:id` — Delete a coupon.
    - `POST /api/coupons/validate` — Validate a coupon code. Body: `{ eventId, code }`. Returns `{ valid, discountType, discountValue, discountedAmount, remainingUses }` or error.

15. **Admin API** (already implemented)
    - `GET /api/admin/users` — List all users
    - `PATCH /api/admin/users/:id` — Change role
    - `GET /api/admin/stats` — Platform-wide analytics

16. **Auth API** (partially implemented, needs role in responses)
    - `POST /api/auth/login` — Return `role` in the user object
    - `GET /api/auth/me` — Return `role` in the response
    - `POST /api/auth/signup` — Return `role` (default `"attendee"`)
    - `PATCH /api/auth/me` — Return `role` in updated user

### Payment Gateway Integration (Sandbox)

17. **Khalti Integration (Sandbox)**
    - Use Khalti's [ePayment API v2](https://docs.khalti.com/khalti-epayment/)
    - Initiation: `POST https://a.khalti.com/api/v2/epayment/initiate/` with `return_url` pointing to our callback
    - Lookup/Verification: `POST https://a.khalti.com/api/v2/epayment/lookup/` using `pidx`
    - Sandbox base URL: `https://a.khalti.com/api/v2/epayment/`
    - Sandbox keys from Khalti merchant dashboard (test mode)
    - Store Khalti `secret_key` in `.env` as `KHALTI_SECRET_KEY`
    - On success callback: verify `pidx` via lookup → create payment record → create RSVP → redirect to frontend success page

18. **eSewa Integration (Sandbox)**
    - Use eSewa's [ePay v2](https://esewa.com.np/epay/main)
    - Sandbox URL: `https://uat.esewa.com.np/epay/main`
    - Sandbox verification: `https://uat.esewa.com.np/epay/transstatus`
    - Required params: `amt`, `txAmt` (tax amount, 0), `psc` (service charge, 0), `pdc` (delivery charge, 0), `tAmt` (total = amt), `pid` (product ID = `paymentId`), `scd` (service code from `.env`)
    - Store eSewa `merchant_code` in `.env` as `ESEWA_MERCHANT_CODE`
    - On success callback: verify via eSewa's verification endpoint → create payment record → create RSVP → redirect to frontend success page

19. **Payment Flow**
    - Attendee clicks "RSVP" on a paid event → sees price and coupon code input
    - Optionally enters coupon code → frontend calls `POST /api/coupons/validate` → shows discounted price
    - Attendee picks gateway (Khalti or eSewa) → frontend calls `POST /api/payments/initiate`
    - If total > 0: backend creates a `payment` record (status: "pending") and returns the gateway redirect URL → frontend redirects attendee
    - If total = 0 (coupon covers full amount): backend creates RSVP immediately, marks payment as "success" with `gateway: "coupon"`, returns `{ free: true }`
    - Gateway callback handler verifies transaction → updates payment status to "success" → creates RSVP → redirects to frontend success page
    - If payment fails or attendee closes window: payment stays "pending" (no RSVP created). A cleanup cron can mark old pending payments as "failed" after 30 minutes.

### Coupon Code Logic

20. **Coupon Validation Rules**
    - Coupon code lookup is case-insensitive
    - A coupon belongs to a specific event (not global)
    - Validation checks: coupon exists for this event, `used_count < max_uses`, not expired (`expires_at` is null or in the future)
    - Discount calculation:
      - `flat`: subtract `discountValue` from `entry_fee`. Floor at 0.
      - `percentage`: `entry_fee * discountValue / 100`. Result is `entry_fee - (entry_fee * discountValue / 100)`.
    - After successful use: increment `used_count` by 1
    - One coupon per RSVP (frontend enforces single input, backend validates no duplicate coupon usage per user per event)

### Email Notification System

21. **Email Provider: Resend**
    - Install `resend` npm package on the backend
    - Store `RESEND_API_KEY` in `.env`
    - Create a shared `emailService` module that wraps the Resend SDK
    - All emails sent from a configured sender address (e.g., `Mahotsav <onboarding@resend.dev>` for sandbox, or a custom domain if verified)

22. **Email Templates**
    - Use Resend's React email templates (via `@react-email/components`) or simple HTML strings
    - Each email type has a subject, body template, and dynamic fields:
      - **RSVP Confirmed**: `subject: "Your RSVP is confirmed for {eventTitle}"`, body includes event title, date, location, and a link to the event page.
      - **RSVP Rejected**: `subject: "RSVP update for {eventTitle}"`, body informs the rejection politely.
      - **Event Reminder (24h)**: `subject: "Reminder: {eventTitle} is tomorrow"`, body includes event details and check-in info.
      - **Event Reminder (1h)**: `subject: "Starting soon: {eventTitle}"`, body includes urgent reminder with time and location.
      - **Invitation**: `subject: "You're invited to collaborate on {eventTitle}"`, body includes inviter name, event title, and accept-invite link.
      - **Certificate Generated**: `subject: "Your certificate for {eventTitle} is ready"`, body includes a link to download the certificate.
      - **Event Cancelled**: `subject: "Event cancelled: {eventTitle}"`, body informs cancellation and any next steps.

23. **Email Trigger Points (in existing controllers)**
    - After RSVP approval (`rsvps` controller): send "rsvp_confirmed" email
    - After RSVP rejection (`rsvps` controller): send "rsvp_rejected" email
    - After member invitation (`members` controller): send "invitation" email
    - After certificate generation (`certificates` controller): send "certificate_generated" email for each generated certificate
    - When event is deleted/cancelled (`events` controller): send "event_cancelled" to all confirmed RSVPs

24. **Cron Jobs for Event Reminders**
    - Use `node-cron` package to schedule two recurring jobs on the server
    - **24h reminder cron**: runs every hour. Queries events with `start_date` between 24h and 25h from now. For each event, finds confirmed RSVPs, sends "event_reminder_24h" email to each attendee.
    - **1h reminder cron**: runs every 15 minutes. Queries events with `start_date` between 1h and 1h15m from now. For each event, finds confirmed RSVPs, sends "event_reminder_1h" email to each attendee.
    - Both crons also check sub-events (events with a `group_id`)
    - Deduplication: check `email_log` table to avoid sending the same reminder type for the same event+user combination within the relevant window

25. **Email Logging**
    - Every email attempt is logged to the `email_log` table with `user_id`, `event_id`, `type`, `email_to`, `subject`, `status` ("queued"/"sent"/"failed"), and `resend_id`
    - On Resend API success: update status to "sent", store `resend_id`
    - On Resend API failure: update status to "failed", log error
    - This allows debugging and prevents duplicate sends

### Certificate Template Editor (already implemented, documenting for completeness)

26. **Template Editor** (`/template-editor` and `/template-editor/:id`)
    - Canvas-based drag-and-drop editor built with HTML5 Canvas API
    - Upload background image (PNG/JPG) as certificate background
    - Add text fields with font, size, color, alignment, bold/italic controls
    - Special `{{participant_name}}` placeholder that gets replaced with actual attendee name during generation
    - Undo/redo history, resize handles, rotation controls
    - Save creates/updates a `certificate_template` record with `background_url` (uploaded via multer), `canvas_json` (serialized text objects), and canvas dimensions

27. **Template Integration in Event Flow**
    - From the Event Certificates page (`/dashboard/event/:id/certificates`), organizers see a "Design New Template" button linking to the editor
    - Organizers pick from built-in templates (Classic, Modern, Sports) or their custom templates
    - Custom templates show a thumbnail preview and an "Edit in Designer" link
    - Templates are reusable across events (created by the organizer, visible in all their events)

### Role-Based UI Architecture

28. **Role detection in frontend**
    - On login/signup, store `role` in `localStorage` alongside the existing user object
    - `userContext` exposes `userInfo.role` to all components
    - `Sidebar`, `Dashboard`, and `ProtectedRoute` read `role` to conditionally render navigation and pages

29. **Sidebar per role**

    | Section | Admin | Organizer | Attendee |
    |---------|-------|-----------|----------|
    | Home | ✅ | ✅ | ✅ |
    | All Events (cross-org) | ✅ | — | — |
    | My Events | — | ✅ | ✅ |
    | Invites | — | ✅ | — |
    | Groups | ✅ | ✅ | — |
    | Users | ✅ | — | — |
    | Analytics | ✅ | — | — |
    | My Certificates | — | — | ✅ |
    | My Attendance | — | — | ✅ |
    | Notifications | ✅ | ✅ | ✅ |
    | Account | ✅ | ✅ | ✅ |

30. **Dashboard per role**
    - **Admin dashboard**: Platform-wide stats cards. Table of recent events across all organizers. No "Create Event" button.
    - **Organizer dashboard**: Own events, own analytics, RSVP donut, quick actions including "Create Event".
    - **Attendee dashboard**: Upcoming events they RSVP'd to, attendance summary, certificates with download links, recommended events.

31. **Route protection per role**
    - `/dashboard/create`, `/dashboard/event/:id/attendance`, `/dashboard/event/:id/certificates` → Organizer and Admin only
    - `/dashboard/groups`, `/dashboard/groups/create` → Organizer and Admin only
    - `/admin` → Admin only
    - `/dashboard/my-events`, `/dashboard/my-certificates`, `/dashboard/my-attendance` → Attendee accessible

### Core Algorithms

32. **Conflict Detection Algorithm** (already specified in previous PRD)
    - Interval overlap detection + set intersection for shared participants + location-aware severity classification
    - O(n²) for pairwise event comparison × O(m) for participant intersection

33. **Attendance Aggregation Algorithm** (already specified in previous PRD)
    - Per-user and group-level stats from attendance records across sub-events

34. **Certificate Eligibility Algorithm** (already specified in previous PRD)
    - Single event: `attendance.checked_in = true`
    - Group: `attendedCount >= minThreshold`

35. **Coupon Discount Calculation**
    - Input: `entry_fee` (int NPR), `coupon.discount_type`, `coupon.discount_value`
    - If `discount_type = "flat"`: `discounted = max(0, entry_fee - discount_value)`
    - If `discount_type = "percentage"`: `discounted = entry_fee - floor(entry_fee * discount_value / 100)`
    - Output: `discounted` (int NPR), floor at 0

### Frontend Modules

36. **Event Creation — Payment Fields** (modify existing Create.jsx)
    - Add a toggle "Is this a paid event?" (Yes/No)
    - When "Yes": show "Entry Fee (NPR)" input field
    - Fee stored as `is_paid` boolean and `entry_fee` integer on the event

37. **Event Page — Payment for Attendees** (modify existing EventPage.jsx)
    - For paid events: show entry fee badge on the event card/page
    - RSVP button triggers payment flow instead of direct RSVP
    - Payment modal/section: shows price, coupon code input, gateway picker (Khalti / eSewa buttons)
    - On gateway pick: call `POST /api/payments/initiate` → redirect to gateway URL
    - Success return: show confirmation with confetti/checkmark
    - Free event (or coupon makes it free): RSVP confirmed immediately

38. **Organizer Payment Ledger** (new page/section within Event detail)
    - Table: Attendee Name | Amount Paid | Discount | Gateway | Transaction ID | Paid At
    - Summary card: Total Collected, Total Discounts, Paid RSVPs count
    - Accessible from the event detail page (tab or section)

39. **Coupon Management** (new section within Event detail or Create/Edit)
    - Organizer can create coupon codes for their event
    - Fields: Code, Discount Type (Flat/Percentage), Discount Value, Max Uses, Expiry Date
    - List of existing coupons with usage stats (used/remaining)
    - Edit and delete coupons

40. **Event Group Landing Page** (`/group/:id`) — already partially implemented
    - Hero section with group cover image
    - Grid/list of sub-events with date, time, RSVP count, price (if paid)
    - Group-level stats (if organizer)
    - Conflict warnings (if organizer)

41. **Event Detail Page Enhancement** (`/dashboard/event/:id`) — already partially implemented
    - Tabbed interface: Overview | RSVPs | Attendance | Certificates | Payments
    - Quick-action bar at top with icons for common actions
    - If event belongs to a group, show breadcrumb link to group

42. **Attendee Dashboard** (`/dashboard` when role=attendee)
    - Hero section with attendance rate summary
    - Upcoming Events cards
    - My Certificates horizontal scroll
    - Recommended Events cards

43. **Role-Aware Sidebar** (`Sidebar.jsx`)
    - Reads `userInfo.role` from `userContext`
    - Conditionally renders navigation items based on role
    - Shows role badge in user profile section

### Environment Variables (new)

44. **Payment gateways**
    - `KHALTI_SECRET_KEY` — Khalti sandbox secret key
    - `ESEWA_MERCHANT_CODE` — eSewa sandbox service code

45. **Email**
    - `RESEND_API_KEY` — Resend API key
    - `EMAIL_FROM` — Sender email address (e.g., `Mahotsav <noreply@yourdomain.com>`)

46. **App**
    - `APP_URL` — Frontend base URL (e.g., `http://localhost:5173`) for constructing callback URLs and email links

---

## Testing Decisions

### What makes a good test

- Tests should verify **external behavior** (input → output), not implementation details.
- Each test should be independent and not rely on other tests' side effects.
- Use seed data that covers edge cases (overlapping events, empty groups, users with no RSVPs).

### Modules to test

1. **Conflict Detection Algorithm** — Highest priority, this is the headline algorithm for the defense.
   - Test: Two events with overlapping times → returns conflict
   - Test: Two events in different locations with overlap → warning, not critical
   - Test: Non-overlapping events → no conflict
   - Test: Shared participants across overlapping events → returned in sharedUsers
   - Test: Empty group → no conflicts

2. **Attendance Aggregation Algorithm**
   - Test: User attends 3/5 sub-events → attendanceRate = 60%
   - Test: User attends 0 sub-events → attendanceRate = 0%
   - Test: Group with no attendance records → empty stats
   - Test: Most/least attended sub-event calculation

3. **Certificate Eligibility Algorithm**
   - Test: Attended event → eligible
   - Test: RSVP'd but didn't attend → not eligible
   - Test: Group with threshold=2, user attended 1 → not eligible
   - Test: Group with threshold=2, user attended 3 → eligible

4. **Certificate Verification**
   - Test: Valid verification code → returns certificate data
   - Test: Invalid code → returns not found

5. **Coupon Discount Calculation**
   - Test: Flat coupon Rs. 200 off on Rs. 500 event → discounted = 300
   - Test: Flat coupon Rs. 600 off on Rs. 500 event → discounted = 0 (floored)
   - Test: Percentage coupon 20% off on Rs. 500 event → discounted = 400
   - Test: Percentage coupon 100% off → discounted = 0
   - Test: Expired coupon → validation fails
   - Test: Coupon at max uses → validation fails
   - Test: One coupon per RSVP → second coupon rejected

6. **Payment Flow Integration**
   - Test: Initiate payment for free event (after coupon) → RSVP created immediately
   - Test: Initiate payment for paid event → returns gateway redirect URL
   - Test: Khalti callback with valid transaction → payment marked success, RSVP created
   - Test: eSewa callback with valid transaction → payment marked success, RSVP created
   - Test: Failed callback → no RSVP created, payment marked failed

7. **API Endpoint Tests** (integration)
   - Create group → add sub-events → verify group stats
   - Mark attendance → generate certificates → download
   - Admin creates user → changes role → verify permissions
   - Create paid event → initiate payment → verify callback → check ledger

### Prior art

- The existing recommendation engine (`recommendedEvent.logic.jsx`) already has Jaccard similarity tests implicitly through its logic.
- The seed script pattern can be reused to create test fixtures for event groups with overlapping sub-events.

---

## Out of Scope

1. **Mobile app** — Web-only, mobile-responsive.
2. **Real-time WebSocket updates** — Continue using polling (30s interval) for notifications.
3. **Multi-tenant / multi-college** — Single college deployment.
4. **Social features** — No follower system, no chat, no event reviews/ratings.
5. **Refund automation** — Refunds are handled manually by the organizer offline. No auto-refund on event cancellation.
6. **Payment payout/withdrawal** — Money collected is shown as dashboard numbers. No bank transfer or payout flow.
7. **Admin payment analytics** — Payment data is visible only to the event organizer, not platform-wide to admins.
8. **Email unsubscribe/settings** — All notification emails are sent by default, no opt-out UI for the demo.
9. **Stackable coupons** — Only one coupon code per RSVP, no combining multiple coupons.

---

## Further Notes

### Priority for Mid-Defense (next week)

The following items should be demo-ready for mid-defense:

| Priority | Feature | Why |
|----------|---------|-----|
| **P0** | Event Groups + Sub-events | Core new feature |
| **P0** | Conflict Detection Algorithm | Headline algorithm |
| **P0** | Attendance Tracking (manual) | Completes the workflow |
| **P0** | Return `role` in auth API responses | Prerequisite for all role-based UI |
| **P0** | Role-aware Sidebar | Immediately shows the platform adapts per user type |
| **P0** | Role-aware Dashboard (Admin / Organizer / Attendee) | Core visual differentiator |
| **P1** | Attendance Aggregation Stats | Shows algorithm output |
| **P1** | Group Landing Page | Visual demo |
| **P1** | Attendee pages (My Events, My Certificates, My Attendance) | Completes the attendee experience |
| **P2** | Certificate Generation | Nice-to-have for mid |
| **P2** | Admin Users page | Admin-specific feature |

### Priority for Final Defense (July)

| Priority | Feature | Why |
|----------|---------|-----|
| **P0** | Payment Integration (Khalti + eSewa sandbox) | Major new feature, impressive for demo |
| **P0** | Coupon Codes | Completes the payment flow |
| **P0** | Email Notifications (Resend) | Professional touch, shows production readiness |
| **P0** | Event Reminder Crons (24h + 1h) | Demonstrates backend scheduling |
| **P0** | Payment Ledger for Organizers | Financial accountability |
| **P0** | Custom Certificate Template Editor adoption | Already built, needs integration polish |
| **P1** | Group-level certificates | One cert per student across sub-events |
| **P1** | Admin Analytics page | Platform-wide charts |
| **P1** | Export to XLSX | Admin convenience |
| **P2** | Breadcrumbs across all nested pages | Navigation polish |
| **P2** | Event card quick-action menus | UX polish |
| **P2** | Route protection (redirect restricted roles) | Security |

### Algorithm Presentation Tips

For the defense, present the **Conflict Detection Algorithm** as your main contribution:

1. **Input**: A set of sub-events with start/end times and participant lists
2. **Algorithm**: Interval overlap detection + set intersection for shared participants + location-aware severity classification
3. **Output**: Conflict report with severity levels and affected users
4. **Complexity**: O(n²) for pairwise event comparison × O(m) for participant intersection, where n = sub-events, m = participants per event
5. **Real-world value**: Prevents scheduling chaos in multi-day events

Additionally, for payments, present the **Coupon Discount Calculation** as a secondary algorithm — it handles edge cases (floor at 0, percentage vs flat, usage limits) that demonstrate non-trivial business logic.

### Tech Stack Reference

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Tailwind CSS 3, Vite |
| Backend | Node.js, Express 4 |
| Database | MySQL via Drizzle ORM |
| Auth | JWT |
| Certificate Generation | Canvas (server-side PNG rendering) |
| File Upload | Multer |
| Payments | Khalti ePayment API v2 (sandbox), eSewa ePay v2 (sandbox) |
| Email | Resend |
| Cron Jobs | node-cron |
| Testing | Node's built-in `assert` + manual API testing via seed data |
