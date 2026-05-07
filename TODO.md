# Mahotsav — TODO

Status of all functional requirements from the PRD.
Last updated: April 30, 2026

---

## Legend

- ✅ Done
- 🔨 Partially done (needs work)
- ❌ Not started

---

## 1. Event Groups

| # | Requirement | Status | Notes |
|---|------------|--------|-------|
| 1 | Create event group | ✅ | Backend + frontend done (`CreateGroup.jsx`) |
| 2 | Add sub-events to a group | ✅ | Group selector in `Create.jsx`, `group_id` on events |
| 3 | Sub-events with independent date/time/location/medium | ✅ | Events schema supports all fields per sub-event |
| 4 | Overlap warning for sub-events sharing participants | ✅ | Conflict detection algorithm + UI in `GroupDetails.jsx` |
| 5 | Group-level stats | ✅ | `groupStats` API + stats cards in `GroupDetails.jsx` |
| 6 | Group landing page for students | 🔨 | `GroupDetails.jsx` exists but no public `/group/:id` route outside dashboard |
| 7 | RSVP to individual sub-events | ✅ | Each sub-event is a regular event, RSVP works per event |
| 8 | Bulk RSVP on behalf of student for all sub-events | ❌ | No bulk RSVP API or UI |

---

## 2. Attendance Tracking

| # | Requirement | Status | Notes |
|---|------------|--------|-------|
| 9 | Mark attendance per sub-event | ✅ | `EventAttendance.jsx` + `attendance` controller |
| 10 | Approved RSVP list with attended toggle | ✅ | `EventAttendance.jsx` |
| 11 | Self check-in via unique code | ✅ | `check_in_code` on events, `SelfCheckIn.jsx` page |
| 12 | Student attendance history | ❌ | No `/dashboard/my-attendance` page |
| 13 | Conflict report for double-booked students | ✅ | `groupConflicts` API + UI in `GroupDetails.jsx` |
| 14 | Export attendance as XLSX | ❌ | No XLSX export endpoint or frontend button |

---

## 3. Certificate Generation

| # | Requirement | Status | Notes |
|---|------------|--------|-------|
| 15 | Auto-generate PNG certificates for attended users | ✅ | `generateForEvent` controller + `EventCertificates.jsx` |
| 16 | Student downloads certificate from dashboard/event page | 🔨 | Download works on organizer side; no `My Certificates` attendee page |
| 17 | Choose from built-in + custom templates | ✅ | Template selector in `EventCertificates.jsx` |
| 18 | Design custom template via drag-and-drop editor | ✅ | `TemplateEditor.jsx` fully built |
| 19 | Reuse custom templates across multiple events | ✅ | Templates stored with `created_by`, visible in selector |
| 20 | Unique verification code per certificate | ✅ | `crypto.randomBytes(6)` generated |
| 21 | Public certificate verification | ✅ | `/certificates/verify/:code` + UI in `EventCertificates.jsx` |
| 22 | Group-level certificates (one cert listing all sub-events) | ❌ | No group certificate generation |

---

## 4. Role-Based Access Control

| # | Requirement | Status | Notes |
|---|------------|--------|-------|
| 23 | Admin sees all events across organizers | ❌ | No admin view; `listEvents` with `mine=true` only filters for current user |
| 24 | Admin Users page | ❌ | No `/dashboard/users` page |
| 25 | Admin platform-wide analytics | ❌ | No admin analytics page |
| 26 | Organizer sees only own events | ✅ | `mine=true` query param |
| 27 | Attendee clean dashboard | ❌ | Dashboard is organizer-only currently |
| 28 | Browse events without login, prompt on RSVP | 🔨 | Public pages work; redirect to login on RSVP exists but no `returnTo` param |
| 29 | Admin sidebar | ❌ | Sidebar is identical for all roles |
| 30 | Organizer sidebar | ❌ | Same — no role-based sidebar |
| 31 | Attendee sidebar | ❌ | Same — no role-based sidebar |

---

## 5. Auth — Role in API Responses

| # | Requirement | Status | Notes |
|---|------------|--------|-------|
| 32 | Return `role` in `POST /auth/login` | ❌ | Response omits `role` field |
| 33 | Return `role` in `GET /auth/me` | ❌ | Response omits `role` field |
| 34 | Return `role` in `POST /auth/signup` | ❌ | Response omits `role` field |
| 35 | Return `role` in `PATCH /auth/me` | ❌ | Response omits `role` field |
| 36 | Store `role` in localStorage on login/signup | ❌ | `userContext` doesn't handle role |
| 37 | `ProtectedRoute` checks role for route access | ❌ | Only checks token existence, no role-based redirect |

---

## 6. Dashboard & Navigation

| # | Requirement | Status | Notes |
|---|------------|--------|-------|
| 38 | Event detail page with tabs (RSVPs, Attendance, Certificates) | 🔨 | Separate pages exist; no tabbed interface on Event detail |
| 39 | Breadcrumb trail on nested pages | 🔨 | Only `GroupDetails` has a basic breadcrumb |
| 40 | Attendee "My Events" page | ❌ | No `/dashboard/my-events` page |
| 41 | Quick-action buttons on event cards | ❌ | `EventCard.jsx` has no action menu |
| 42 | Hide "Create Event" for admin | ❌ | Dashboard shows Create Event for everyone |
| 43 | Hide "Create Event" for attendee | ❌ | Same as above |

---

## 7. Recommendations & Search

| # | Requirement | Status | Notes |
|---|------------|--------|-------|
| 44 | Recommended events via Jaccard similarity | ✅ | `recommendedEvent.logic.jsx` |
| 45 | Multi-field search | ✅ | `Explore.jsx` |
| 46 | Filter by event groups | ❌ | No group filter on Explore page |

---

## 8. Payment Integration

| # | Requirement | Status | Notes |
|---|------------|--------|-------|
| 47 | `is_paid` + `entry_fee` fields on events schema | ❌ | Schema not updated |
| 48 | `payments` table | ❌ | Not created |
| 49 | `coupons` table | ❌ | Not created |
| 50 | Khalti sandbox integration (initiate + callback) | ❌ | Not started |
| 51 | eSewa sandbox integration (initiate + callback) | ❌ | Not started |
| 52 | `POST /api/payments/initiate` | ❌ | Not started |
| 53 | `GET /api/payments/khalti/callback` | ❌ | Not started |
| 54 | `GET /api/payments/esewa/callback` | ❌ | Not started |
| 55 | `GET /api/events/:id/payments` (ledger) | ❌ | Not started |
| 56 | `GET /api/events/:id/payments/summary` | ❌ | Not started |
| 57 | `POST /api/events/:id/coupons` (create coupon) | ❌ | Not started |
| 58 | `GET /api/events/:id/coupons` (list coupons) | ❌ | Not started |
| 59 | `PATCH /api/coupons/:id` (update coupon) | ❌ | Not started |
| 60 | `DELETE /api/coupons/:id` (delete coupon) | ❌ | Not started |
| 61 | `POST /api/coupons/validate` (validate code) | ❌ | Not started |
| 62 | Payment toggle + fee input in Create Event form | ❌ | `Create.jsx` has no payment fields |
| 63 | Payment flow on EventPage (gateway picker, coupon input) | ❌ | RSVP goes straight to `rsvpService.create`, no payment gate |
| 64 | Free RSVP when coupon makes total = 0 | ❌ | Not started |
| 65 | Organizer payment ledger UI | ❌ | Not started |
| 66 | Coupon management UI for organizers | ❌ | Not started |
| 67 | Payment per sub-event in groups | ❌ | Depends on base payment implementation |
| 68 | Pending payment cleanup cron (30 min) | ❌ | Nice-to-have, not started |

---

## 9. Email Notifications

| # | Requirement | Status | Notes |
|---|------------|--------|-------|
| 69 | Install + configure Resend SDK | ❌ | Not in `package.json` |
| 70 | `email_log` table in schema | ❌ | Not created |
| 71 | Shared `emailService` module | ❌ | Not started |
| 72 | Email: RSVP confirmed | ❌ | No email trigger in `approveRsvp` controller |
| 73 | Email: RSVP rejected | ❌ | No email trigger in `rejectRsvp` controller |
| 74 | Email: Invitation to collaborate | ❌ | No email trigger in `members` controller |
| 75 | Email: Certificate generated | ❌ | No email trigger in `generateForEvent` controller |
| 76 | Email: Event cancelled | ❌ | No email trigger in `deleteEvent` controller |
| 77 | Email: Event reminder 24h (cron) | ❌ | No cron job |
| 78 | Email: Event reminder 1h (cron) | ❌ | No cron job |
| 79 | Install `node-cron` | ❌ | Not in `package.json` |
| 80 | Email deduplication check before sending | ❌ | Depends on `email_log` table |

---

## 10. Frontend Service Layer for New Features

| # | Requirement | Status | Notes |
|---|------------|--------|-------|
| 81 | `src/services/payments.js` | ❌ | Not created |
| 82 | `src/services/coupons.js` | ❌ | Not created |
| 83 | `src/services/email.js` (if needed frontend-side) | ❌ | Not created |

---

## Summary

| Category | Done | Partial | Remaining |
|----------|------|---------|-----------|
| Event Groups | 7 | 1 | 1 |
| Attendance Tracking | 4 | 0 | 2 |
| Certificate Generation | 7 | 1 | 1 |
| Role-Based Access Control | 1 | 1 | 7 |
| Auth (Role in responses) | 0 | 0 | 6 |
| Dashboard & Navigation | 0 | 2 | 5 |
| Recommendations & Search | 2 | 0 | 1 |
| Payment Integration | 0 | 0 | 22 |
| Email Notifications | 0 | 0 | 12 |
| Frontend Services | 0 | 0 | 3 |
| **Total** | **21** | **5** | **60** |
