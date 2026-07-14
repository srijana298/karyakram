# Mahotsav — Remaining Work

Last updated: July 14, 2026

## Legend

- 🔨 In progress or partially implemented
- ❌ Not started

---

## 1. Invitations

- 🔨 Complete the invitation acceptance flow using the unique invitation token.
- ❌ Validate invitation tokens on the backend before accepting an invitation.
- ❌ Require the signed-in user's email to match the invited email.
- ❌ Change an invitation's status from `sent` to `accepted` and store `accepted_by` and `accepted_at`.
- ❌ Create the attendee membership/RSVP after acceptance without creating duplicate records.
- ❌ Support declined, expired, revoked, and resent invitations.
- ❌ Let organizers revoke or resend invitations from the event dashboard.
- ❌ Display sent, accepted, declined, and expired invitation states in the Guests tab.
- ❌ Add invitation expiry and rate limiting to prevent abuse.

## 2. Sub-events

- ❌ Allow organizers to add multiple sub-events inside one parent event.
- ❌ Give each sub-event its own title, description, date, time, location, capacity, hosts, ticket price, and RSVP settings.
- ❌ Show the complete sub-event schedule on the parent event page.
- ❌ Let attendees RSVP or buy tickets for individual sub-events or select all eligible sub-events at once.
- ❌ Prevent attendees from registering for overlapping sub-events.
- ❌ Support shared or separate capacity and wishlist rules for each sub-event.
- ❌ Support parent-event passes as well as separately priced sub-event tickets.
- ❌ Track attendance and QR check-in independently for each sub-event.
- ❌ Let organizers duplicate, reorder, publish, unpublish, and cancel sub-events.
- ❌ Send notifications when a selected sub-event changes or is cancelled.
- ❌ Show parent-level totals and per-sub-event RSVP, revenue, attendance, and capacity analytics.
- ❌ Ensure permissions allow parent-event hosts to manage only the sub-events assigned to them when required.

## 3. Hosts

- ❌ Allow an event owner to invite additional hosts or co-hosts.
- ❌ Add host roles and permissions for editing events, managing guests, attendance, and communications.
- ❌ Add a host invitation and acceptance flow.
- ❌ Show all hosts on the public event page and organizer dashboard.
- ❌ Allow the owner to change permissions or remove a host.
- ❌ Prevent the last owner from removing themselves or losing ownership.

## 4. Wishlist

- ❌ Add a wishlist/waitlist mode for events that have reached capacity.
- ❌ Let attendees join or leave the wishlist.
- ❌ Show wishlist position and status on My RSVPs.
- ❌ Let organizers view and manage the wishlist.
- ❌ Promote people from the wishlist when a place becomes available.
- ❌ Notify promoted attendees by email and in-app notification.
- ❌ Add an optional time limit for promoted attendees to accept their place.

## 5. My RSVPs

- ❌ Improve action buttons on the My RSVPs page.
- ❌ Use status-aware buttons such as **View event**, **Accept invitation**, **Cancel RSVP**, **Join wishlist**, and **Download ticket**.
- ❌ Disable or hide actions that are unavailable for completed, cancelled, rejected, or closed events.
- ❌ Add clear states for invited, pending, approved, declined, wishlist, and attended events.
- ❌ Add confirmation dialogs for destructive actions such as cancelling an RSVP.

## 6. Event Date and Time

- ❌ Replace the current date/time input with a better accessible date and time picker.
- ❌ Support start and end date/time selection in one consistent flow.
- ❌ Prevent end times before start times.
- ❌ Display the selected timezone and default to the user's local timezone.
- ❌ Support all-day and multi-day events.
- ❌ Add useful duration shortcuts and validation for past dates.
- ❌ Ensure the picker works well on mobile and with keyboard navigation.

## 7. Capacity and Wishlist Options

- ❌ Add a clear event capacity choice during event creation: **Unlimited** or **Limited**.
- ❌ Show the maximum-participant input only when **Limited** is selected.
- ❌ Add a toggle to enable the wishlist when capacity is reached.
- ❌ Add optional wishlist capacity and promotion settings.
- ❌ Prevent approved RSVPs from exceeding maximum capacity, using a database-safe transaction.
- ❌ Show remaining places on event and organizer pages.

## 8. Ticket Pricing

- ❌ Add ticket type selection during event creation: **Free** or **Paid**.
- ❌ Add ticket price, currency, sales start/end time, and quantity fields.
- ❌ Validate ticket prices and availability on the backend; never trust frontend totals.
- ❌ Add payment status to RSVP and ticket records.
- ❌ Generate a ticket only after verified payment or a confirmed free RSVP.
- ❌ Show ticket price and payment requirements on the public event page.
- ❌ Add organizer payment summaries, transaction history, refunds, and exports.

## 9. Khalti Integration

- ❌ Add a server-side Khalti payment service.
- ❌ Create a backend endpoint to initiate payments.
- ❌ Redirect attendees to Khalti checkout from the event page.
- ❌ Add return and callback/webhook endpoints.
- ❌ Verify every payment with Khalti from the backend before marking it paid.
- ❌ Store Khalti transaction IDs, amounts, raw status, and verification timestamps.
- ❌ Make callback processing idempotent so repeated callbacks cannot create duplicate payments or tickets.
- ❌ Add sandbox and production configuration.

## 10. eSewa Integration

- ❌ Add a server-side eSewa payment service.
- ❌ Create a backend endpoint to initiate payments and generate signed requests.
- ❌ Redirect attendees to eSewa checkout from the event page.
- ❌ Add success, failure, and verification endpoints.
- ❌ Verify payment signatures and transaction status on the backend.
- ❌ Store eSewa transaction IDs, amounts, raw status, and verification timestamps.
- ❌ Make callback processing idempotent.
- ❌ Add sandbox and production configuration.

## 11. Luma-style Calendars

- ❌ Let organizers create a public calendar with a name, description, avatar, cover image, and custom URL slug.
- ❌ Allow one calendar to contain and publish multiple events.
- ❌ Add public calendar pages with upcoming and past event sections.
- ❌ Let attendees follow or subscribe to calendars.
- ❌ Show follower counts and notify followers when a new event is published.
- ❌ Add calendar membership roles such as owner, admin, editor, and viewer.
- ❌ Let calendar admins approve or reject events submitted by other organizers.
- ❌ Support public, private, and unlisted calendar visibility.
- ❌ Add calendar categories, location, social links, and organizer information.
- ❌ Add calendar-level attendee and event analytics.
- ❌ Allow organizers to duplicate events and move events between calendars.
- ❌ Add featured and pinned events to calendar pages.
- ❌ Add calendar search and discovery on the Explore page.
- ❌ Generate iCal subscription feeds so followers can sync events with Google Calendar, Apple Calendar, and Outlook.
- ❌ Add individual **Add to Calendar** actions for Google Calendar, Apple Calendar, Outlook, and downloadable `.ics` files.
- ❌ Handle event updates and cancellations correctly in subscribed calendars.
- ❌ Add recurring events with daily, weekly, monthly, custom, and end-date rules.
- ❌ Provide calendar branding controls while keeping event pages visually consistent with Mahotsav.
- ❌ Add calendar-level invitation lists and reusable contact audiences.
- ❌ Add moderation, rate limits, and permission checks for collaborative calendars.

## 12. Payment and Secret Security

- ❌ Keep Khalti, eSewa, Resend, database, and signing secrets only in backend environment variables or a managed secret store.
- ❌ Never include private API keys in frontend code, `VITE_*` variables, URLs, logs, API responses, or committed files.
- ❌ Add documented placeholders to `server/.env.example`; keep real `.env` files ignored by Git.
- ❌ Rotate any key that has been shared publicly, pasted into source control, or exposed to the browser.
- ❌ Use separate restricted credentials for development, staging, and production.
- ❌ Validate payment amount, currency, event, ticket availability, and authenticated user on the backend.
- ❌ Verify Khalti/eSewa callbacks and signatures before changing payment status.
- ❌ Use database transactions and unique constraints to prevent duplicate charges, overselling, and duplicate tickets.
- ❌ Store only necessary payment metadata; never store card, wallet PIN, OTP, or other sensitive payment credentials.
- ❌ Redact secrets and sensitive payment data from logs and error monitoring.
- ❌ Add request rate limits, audit logs, webhook replay protection, and idempotency keys.
- ❌ Restrict CORS in production and require HTTPS for payment and authentication traffic.
- ❌ Add automated tests for forged callbacks, modified prices, replayed requests, duplicate payments, and capacity races.

---

## Suggested Delivery Order

1. Finish secure invitation acceptance and host roles.
2. Complete public calendars, calendar roles, followers, and event publishing.
3. Add improved date/time and capacity controls.
4. Implement wishlist behavior and update My RSVPs actions.
5. Add calendar subscriptions, `.ics` feeds, and recurring events.
6. Add the payment database model and paid-ticket flow.
7. Integrate one sandbox gateway end-to-end, including verification and tests.
8. Integrate the second gateway using the same payment abstraction.
9. Complete production secret management, auditing, refunds, and operational monitoring.
