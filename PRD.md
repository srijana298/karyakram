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

22. As a **super admin**, I want to see **all events across all organizers** on my dashboard, so that I can moderate the platform.
23. As a **super admin**, I want a **Users** page listing every registered user with their role and activity, so that I can manage the platform.
24. As a **super admin**, I want to see **platform-wide analytics** (total events, total users, RSVP rates across all organizers), so that I understand platform usage.
25. As an **organizer**, I want to see only **my events** and my analytics, so that my dashboard is focused on my work.
26. As a **student (attendee)**, I want a clean dashboard showing my **upcoming events, RSVPs, attendance, and certificates**, so that I don't see organizer tools I don't need.
27. As an **attendee**, I want to **browse and explore events** on the landing pages without logging in, but be prompted to log in when I try to RSVP.
28. As an **admin**, I want my **sidebar** to show: Home | All Events | All Groups | Users | Analytics | Notifications, so that I have full platform oversight.
29. As an **organizer**, I want my **sidebar** to show: Home | My Events | Invites | Groups | Notifications, so that I can manage the events I organize.
30. As an **attendee**, I want my **sidebar** to show: Home | My Events | My Certificates | My Attendance | Notifications, so that I only see what's relevant to me.

### Dashboard & Navigation

31. As an **organizer**, I want to click on an event and **immediately see its RSVPs, invites, attendance, and certificates** on one page, so that I don't have to navigate through multiple screens.
32. As an **organizer**, I want a **breadcrumb trail** showing where I am (Dashboard > Events > Sports Week > Futsal), so that I can navigate back easily.
33. As an **attendee**, I want a **"My Events"** page showing events I've RSVP'd to, so that I can find them quickly.
34. As an **organizer**, I want quick-action buttons on each event card (RSVPs, Attendance, Edit, Delete, Certificates), so that common actions are one click away.
35. As an **admin**, I want the **"Create Event" button** to be hidden from my dashboard (admins moderate, they don't organize), so that the UI is clear about my role.
36. As an **attendee**, I want the **"Create Event" button** to be hidden, since I participate in events rather than organize them.

### Recommendations & Search (existing, to be enhanced)

37. As an **attendee**, I want to see **recommended events** based on my past RSVPs, so that I discover relevant events (already implemented via Jaccard similarity).
38. As an **attendee**, I want to **search events by title, category, location, and date range**, so that I can find exactly what I'm looking for (already implemented).
39. As an **attendee**, I want to filter events by **event groups**, so that I can discover multi-day programs like sports weeks.

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

### Backend: Return Role in Auth Responses

15. **Update `POST /api/auth/login`** — Return `role` in the user object alongside `id`, `name`, `email`, `phone`.
16. **Update `GET /api/auth/me`** — Return `role` in the response. Currently the `users` table has a `role` column but it is not included in the select.
17. **Update `POST /api/auth/signup`** — Return `role` in the user object (will be `"attendee"` by default).
18. **Update `PATCH /api/auth/me`** — Return `role` in the updated user object.

This is the **prerequisite** for all role-based UI — the frontend needs `role` from the very first auth response.

### Role-Based UI Architecture

19. **Role detection in frontend**
    - On login/signup, store `role` in `localStorage` alongside the existing user object.
    - `userContext` exposes `userInfo.role` to all components.
    - `Sidebar`, `Dashboard`, and `ProtectedRoute` read `role` to conditionally render navigation and pages.

20. **Sidebar per role**

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

21. **Dashboard per role**

    - **Admin dashboard**: Platform-wide stats cards (total users, total events, total RSVPs, total groups). Table of recent events across all organizers. Link to Users page. No "Create Event" button.
    - **Organizer dashboard**: Current dashboard (unchanged). Own events, own analytics, RSVP donut, quick actions including "Create Event".
    - **Attendee dashboard**: Upcoming events they RSVP'd to. Their attendance summary (X events attended out of Y RSVPs). Their certificates with download links. Recommended events section.

22. **Route protection per role**
    - `/dashboard/create`, `/dashboard/event/:id/attendance`, `/dashboard/event/:id/certificates` → Organizer and Admin only.
    - `/dashboard/groups`, `/dashboard/groups/create` → Organizer and Admin only.
    - `/admin` → Admin only.
    - `/dashboard/my-events`, `/dashboard/my-certificates`, `/dashboard/my-attendance` → Attendee only (also visible to organizers for their own participation).
    - Attempting to access a restricted route redirects to the role-appropriate home page.

23. **Attendee-specific pages**
    - **My Events** (`/dashboard/my-events`): Cards of events the attendee has RSVP'd to, grouped by upcoming/past. Each card shows RSVP status and attendance status.
    - **My Certificates** (`/dashboard/my-certificates`): List of all certificates earned, with preview and download. Verification code shown for each.
    - **My Attendance** (`/dashboard/my-attendance`): Table/list of all events with RSVP status and check-in status. Overall attendance rate displayed.

24. **Admin-specific pages**
    - **All Events** (`/dashboard/events?scope=all`): Reuse existing Events page but fetch all events (not just `mine`). Admin sees organizer name on each event card.
    - **Users** (`/dashboard/users`): Table with columns: Name, Email, Role, Events Created, RSVPs, Joined Date. Filter by role. Search by name/email.
    - **Analytics** (`/dashboard/analytics`): Platform-wide charts — events by month across all organizers, RSVP trends, user growth, top events platform-wide.

25. **Browse & RSVP flow (unauthenticated)**
    - Landing page (`/`), Explore (`/explore`), and Event Page (`/event/:id`) remain **publicly accessible** without login.
    - When an unauthenticated user clicks "RSVP" on any event, redirect to `/auth/login` with a `returnTo` query param.
    - After login, redirect back to the event page they were trying to RSVP to.

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

26. **Event Group Landing Page** (`/group/:id`)
    - Hero section with group cover image
    - Grid/list of sub-events with date, time, RSVP count
    - Group-level stats (if organizer)
    - Conflict warnings (if organizer)

27. **Event Detail Page Enhancement** (`/dashboard/event/:id`)
    - Tabbed interface: Overview | RSVPs | Attendance | Certificates | Settings
    - Quick-action bar at top with icons for common actions
    - If event belongs to a group, show breadcrumb link to group

28. **Attendance Page** (`/dashboard/event/:id/attendance`)
    - Table of approved RSVPs with checkboxes for attended/not attended
    - Generate check-in code button (displays a short code like "ABC123")
    - Export to XLSX button

29. **Certificate Management** (`/dashboard/event/:id/certificates`)
    - Template selector with visual thumbnails
    - "Generate Certificates" button
    - List of generated certificates with download links
    - Verification search box

30. **Admin Panel** (`/dashboard/users`)
    - User management table with Name, Email, Role, Events Created, RSVPs, Joined Date
    - Filter by role, search by name/email
    - Platform-wide stats (total users, events, RSVPs, groups) on admin dashboard
    - "All Events" view with organizer name on each card

31. **Attendee Dashboard** (`/dashboard` when role=attendee)
    - Hero section: "Welcome back, {name}!" with attendance rate summary
    - Upcoming Events: Cards of events the attendee RSVP'd to
    - My Certificates: Horizontal scroll of earned certificates with download
    - Recommended Events: Cards powered by Jaccard similarity
    - Quick actions: Browse Events, View My Attendance, Download Certificates

32. **Attendee Pages**
    - **My Events** (`/dashboard/my-events`): RSVP'd events grouped by upcoming/past, with RSVP status and check-in status on each card
    - **My Certificates** (`/dashboard/my-certificates`): List of all earned certificates, preview modal, download button, verification code
    - **My Attendance** (`/dashboard/my-attendance`): All events with RSVP and check-in status, overall attendance rate

33. **Role-Aware Sidebar** (`Sidebar.jsx`)
    - Reads `userInfo.role` from `userContext`
    - Conditionally renders navigation items based on role (see table in item 20)
    - Shows role badge in user profile section at bottom (e.g., "Admin", "Organizer", "Attendee")
    - "Create Event" button only visible for organizer role

### Navigation Redesign

34. **Sidebar update**: Role-aware sidebar (see item 33). Add sections for "Event Groups", "Users" (admin), "My Certificates" (attendee), "My Attendance" (attendee).
35. **Breadcrumbs**: Add breadcrumb component to all nested pages.
36. **Event cards**: Add quick-action menu (three-dot menu) with RSVPs, Attendance, Edit, Certificates.
37. **Role badge**: Display current role as a colored badge in sidebar user section and account page.

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
| **P0** | Return `role` in auth API responses | Prerequisite for all role-based UI |
| **P0** | Role-aware Sidebar | Immediately shows the platform adapts per user type |
| **P0** | Role-aware Dashboard (Admin / Organizer / Attendee) | Core visual differentiator |
| **P1** | Attendance Aggregation Stats | Shows algorithm output |
| **P1** | Group Landing Page | Visual demo |
| **P1** | Attendee pages (My Events, My Certificates, My Attendance) | Completes the attendee experience |
| **P2** | Certificate Generation | Nice-to-have for mid |
| **P2** | Admin Users page | Admin-specific feature |

### Priority for Final Defense (July)

- Group-level certificates (one cert per student listing all sub-events attended)
- Admin Analytics page (platform-wide charts)
- Export to XLSX
- Breadcrumbs across all nested pages
- Event card quick-action menus
- Route protection (redirect restricted roles)
- Polish attendee browse → RSVP → login redirect flow

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
