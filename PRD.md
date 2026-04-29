# Mahotsav — Product Requirements Document

**Project:** Mahotsav — Campus Event Management Platform  
**Author:** Srijana Dahal  
**Date:** April 29, 2026  
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
3. **Certificate Generation** — Auto-generated downloadable PNG certificates for attendees, with selectable templates and a unique verification code.
4. **Role-Based Access** — Super Admin, Organizer, and Attendee roles with different permissions.
5. **Improved Dashboard Navigation** — Quick access to RSVPs, invites, attendance, and certificates from every context.
6. **Smart Search & Recommendations** — Multi-field search with relevance ranking and collaborative filtering-based event recommendations (already implemented).

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
17. As an **organizer**, I want to **choose from a list of certificate templates** (e.g., "Classic", "Modern", "Sports"), so that the design matches the event theme.
18. As an **organizer**, I want to **customize the template** (change colors, organizer name, logo text), so that the certificate reflects our branding.
19. As an **organizer**, I want each certificate to have a **unique verification code**, so that anyone can verify its authenticity.
20. As a **student**, I want to enter a verification code on the platform and see if the certificate is valid, so that certificates can't be faked.
21. As an **organizer**, I want to generate certificates for an **entire event group** (one certificate per student listing all sub-events attended), so that Sports Week participants get a comprehensive certificate.

### Role-Based Access Control

22. As a **super admin**, I want to see **all events** across all organizers, so that I can moderate the platform.
23. As a **super admin**, I want to **manage users** (view, deactivate, change roles), so that I can control access.
24. As a **super admin**, I want to see **platform-wide analytics** (total events, total users, RSVP rates), so that I understand platform usage.
25. As an **organizer**, I want to see only **my events** and my analytics, so that my dashboard is focused on my work.
26. As a **student (attendee)**, I want a clean dashboard showing my **upcoming events, RSVPs, attendance, and certificates**, so that I don't see organizer tools I don't need.

### Dashboard & Navigation

27. As an **organizer**, I want to click on an event and **immediately see its RSVPs, invites, attendance, and certificates** on one page, so that I don't have to navigate through multiple screens.
28. As an **organizer**, I want a **breadcrumb trail** showing where I am (Dashboard > Events > Sports Week > Futsal), so that I can navigate back easily.
29. As a **student**, I want a **"My Events"** tab showing events I've RSVP'd to, so that I can find them quickly.
30. As an **organizer**, I want quick-action buttons on each event card (RSVPs, Attendance, Edit, Delete, Certificates), so that common actions are one click away.

### Recommendations & Search (existing, to be enhanced)

31. As a **student**, I want to see **recommended events** based on my past RSVPs, so that I discover relevant events (already implemented via Jaccard similarity).
32. As a **student**, I want to **search events by title, category, location, and date range**, so that I can find exactly what I'm looking for (already implemented).
33. As a **student**, I want to filter events by **event groups**, so that I can discover multi-day programs like sports weeks.

---

## Implementation Decisions

### Schema Changes

1. **New table: `event_groups`**
   - `id`, `title`, `description`, `cover_image`, `category`, `privacy`, `created_by` (FK → users), `created_at`, `updated_at`
   - An event group is the parent container (e.g., "Sports Week 2025").

2. **Alter table: `events`**
   - Add `group_id` (nullable FK → event_groups). When `group_id` is set, this event is a sub-event of that group.
   - Add `check_in_code` (varchar, nullable). A short unique code organizers can generate for self-check-in.

3. **New table: `attendance`**
   - `id`, `event_id` (FK → events), `user_id` (FK → users), `checked_in` (boolean), `check_in_method` (enum: "manual", "self"), `checked_in_at` (timestamp), `created_at`
   - This replaces the current approach of appending ",attended" to the role string in `event_members`.

4. **New table: `certificate_templates`**
   - `id`, `name` (e.g., "Classic", "Modern", "Sports"), `thumbnail` (image URL), `template_config` (JSON: font, colors, layout positions), `is_default` (boolean), `created_at`

5. **New table: `certificates`**
   - `id`, `event_id` (FK → events), `user_id` (FK → users), `template_id` (FK → certificate_templates), `verification_code` (unique varchar), `image_url` (path to generated PNG), `group_id` (nullable FK → event_groups, for group-level certificates), `generated_at` (timestamp)

6. **Alter table: `users`**
   - Add `role` (varchar: "admin", "organizer", "attendee", default: "attendee").
   - Add `avatar` (varchar, nullable URL).

### API Contracts

7. **Event Groups API**
   - `POST /api/groups` — Create a group
   - `GET /api/groups` — List groups (admin sees all, organizer sees own)
   - `GET /api/groups/:id` — Get group with sub-events
   - `PATCH /api/groups/:id` — Update group
   - `DELETE /api/groups/:id` — Delete group (cascades sub-events or unlinks them)
   - `GET /api/groups/:id/stats` — Aggregated attendance and RSVP stats across sub-events
   - `GET /api/groups/:id/conflicts` — Returns scheduling conflicts and double-booked participants

8. **Attendance API**
   - `POST /api/events/:id/attendance` — Mark attendance (body: `{ userId, checkedIn }`)
   - `POST /api/events/:id/attendance/bulk` — Bulk mark attendance (body: `{ attendees: [{ userId, checkedIn }] }`)
   - `POST /api/events/:id/checkin` — Self check-in (body: `{ code }`, student enters the code)
   - `GET /api/events/:id/attendance` — List attendance records for an event
   - `GET /api/groups/:id/attendance` — List attendance across all sub-events in a group

9. **Certificates API**
   - `POST /api/events/:id/certificates/generate` — Generate certificates for all attended users
   - `POST /api/groups/:id/certificates/generate` — Generate group-level certificates
   - `GET /api/certificates/mine` — List current user's certificates
   - `GET /api/certificates/:id/download` — Download certificate image
   - `GET /api/certificates/verify/:code` — Public verification endpoint
   - `GET /api/certificates/templates` — List available templates

10. **Admin API**
    - `GET /api/admin/users` — List all users with role, event count, RSVP count
    - `PATCH /api/admin/users/:id` — Change user role, deactivate
    - `GET /api/admin/stats` — Platform-wide analytics

### Core Algorithms

11. **Conflict Detection Algorithm**
    - For a given event group, fetch all sub-events with their `start_date` and `end_date`.
    - Detect **time overlaps**: if `eventA.start_date < eventB.end_date AND eventB.start_date < eventA.end_date`, they overlap.
    - For overlapping events, find **shared participants**: intersect the RSVP/user lists of overlapping events.
    - Return a conflict report: `{ overlappingEvents: [...], sharedUsers: [...], severity: "warning" | "critical" }`.
    - Severity: "warning" if events are in different locations (men's/women's basketball), "critical" if same location.

12. **Attendance Aggregation Algorithm**
    - For a group, collect all `attendance` records across sub-events.
    - Compute per-user stats: `{ userId, totalSubEvents, attendedCount, attendanceRate }`.
    - Compute group-level stats: `{ totalUniqueAttendees, averageAttendanceRate, mostAttendedSubEvent, leastAttendedSubEvent }`.
    - These power the group dashboard and certificate eligibility.

13. **Certificate Eligibility Algorithm**
    - For a single event: eligible if `attendance.checked_in = true`.
    - For a group: eligible if `attendedCount >= minThreshold` (configurable, default: 1 sub-event).
    - Generate a unique verification code using `crypto.randomBytes(8).toString("hex")`.
    - Render certificate PNG server-side using a canvas/image library.

14. **Certificate Rendering**
    - Use a server-side image generation approach (e.g., `canvas` npm package or HTML-to-image).
    - Template config JSON defines: background color, text positions (name, event, date, organizer, verification code), font sizes, logo placement.
    - 3 built-in templates: "Classic" (formal, serif fonts, navy/gold), "Modern" (sans-serif, emerald/white, clean), "Sports" (bold, dynamic layout, dark background).
    - Organizers can customize: organizer name text, accent color.

### Frontend Modules

15. **Event Group Landing Page** (`/group/:id`)
    - Hero section with group cover image
    - Grid/list of sub-events with date, time, RSVP count
    - Group-level stats (if organizer)
    - Conflict warnings (if organizer)

16. **Event Detail Page Enhancement** (`/dashboard/event/:id`)
    - Tabbed interface: Overview | RSVPs | Attendance | Certificates | Settings
    - Quick-action bar at top with icons for common actions
    - If event belongs to a group, show breadcrumb link to group

17. **Attendance Page** (`/dashboard/event/:id/attendance`)
    - Table of approved RSVPs with checkboxes for attended/not attended
    - Generate check-in code button (displays a short code like "ABC123")
    - Export to XLSX button

18. **Certificate Management** (`/dashboard/event/:id/certificates`)
    - Template selector with visual thumbnails
    - "Generate Certificates" button
    - List of generated certificates with download links
    - Verification search box

19. **Admin Panel** (`/admin`)
    - User management table
    - Platform-wide stats dashboard
    - Event moderation (view all events)

20. **Student Dashboard Enhancement** (`/dashboard`)
    - Tabs: My Events | My Certificates | My Attendance
    - Clean card-based layout for upcoming events

### Navigation Redesign

21. **Sidebar update**: Add sections for "Event Groups" and "Certificates"
22. **Breadcrumbs**: Add breadcrumb component to all nested pages
23. **Event cards**: Add quick-action menu (three-dot menu) with RSVPs, Attendance, Edit, Certificates

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

5. **API Endpoint Tests** (integration)
   - Create group → add sub-events → verify group stats
   - Mark attendance → generate certificates → download
   - Admin creates user → changes role → verify permissions

### Prior art

- The existing recommendation engine (`recommendedEvent.logic.jsx`) already has Jaccard similarity tests implicitly through its logic.
- The seed script pattern can be reused to create test fixtures for event groups with overlapping sub-events.

---

## Out of Scope

1. **Payment integration** — No Stripe/Khalti for paid events. All events are free or "paid offline."
2. **Email notifications** — All notifications are in-app only. No email sending.
3. **Mobile app** — Web-only, mobile-responsive.
4. **Real-time WebSocket updates** — Continue using polling (30s interval) for notifications.
5. **Custom certificate template upload** — Organizers choose from built-in templates and customize colors/text. No uploading their own background image.
6. **Multi-tenant / multi-college** — Single college deployment.
7. **Social features** — No follower system, no chat, no event reviews/ratings.

---

## Further Notes

### Priority for Mid-Defense (next week)

The following items should be demo-ready for mid-defense:

| Priority | Feature | Why |
|----------|---------|-----|
| **P0** | Event Groups + Sub-events | Core new feature |
| **P0** | Conflict Detection Algorithm | Headline algorithm |
| **P0** | Attendance Tracking (manual) | Completes the workflow |
| **P1** | Attendance Aggregation Stats | Shows algorithm output |
| **P1** | Group Landing Page | Visual demo |
| **P2** | Certificate Generation | Nice-to-have for mid |

### Priority for Final Defense (July)

- Certificate templates + generation
- Self check-in codes
- Admin panel
- Full navigation redesign
- Export to XLSX
- Group-level certificates

### Algorithm Presentation Tips

For the defense, present the **Conflict Detection Algorithm** as your main contribution:

1. **Input**: A set of sub-events with start/end times and participant lists
2. **Algorithm**: Interval overlap detection + set intersection for shared participants + location-aware severity classification
3. **Output**: Conflict report with severity levels and affected users
4. **Complexity**: O(n²) for pairwise event comparison × O(m) for participant intersection, where n = sub-events, m = participants per event
5. **Real-world value**: Prevents scheduling chaos in multi-day events

---

## Tech Stack Reference

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Tailwind CSS 3, Vite |
| Backend | Node.js, Express 4 |
| Database | MySQL via Drizzle ORM |
| Auth | JWT |
| Certificate Generation | Canvas (server-side PNG rendering) |
| File Upload | Multer |
| Testing | Node's built-in `assert` + manual API testing via seed data |
