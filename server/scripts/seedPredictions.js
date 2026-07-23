// Seed data to demo the Smart RSVP attendance prediction.
//
//   Run from the server/ directory:  node scripts/seedPredictions.js
//
// Creates one organizer and two attendees with contrasting histories, so the
// organizer's target event shows a GREEN badge (reliable) and a RED badge
// (flaky) next to the pending RSVPs. Re-runnable: it wipes its own rows first.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { and, eq, inArray, or, like } from "drizzle-orm";
import { db } from "../src/db/index.js";
import { users, events, rsvps, attendance, eventMembers } from "../src/db/schema.js";

const ORGANIZER_EMAIL = "seed.organizer@karyakram.test";
const RELIABLE_EMAIL = "seed.reliable@karyakram.test";
const FLAKY_EMAIL = "seed.flaky@karyakram.test";
const SEED_EMAILS = [ORGANIZER_EMAIL, RELIABLE_EMAIL, FLAKY_EMAIL];
const SEED_PASSWORD = "Password123!";
const SEED_CODE_PREFIX = "SEED-";

const HOUR = 36e5;
const DAY = 24 * HOUR;
const now = Date.now();
const d = (msFromNow) => new Date(now + msFromNow);

async function cleanup() {
  const existingUsers = await db.select({ id: users.id }).from(users).where(inArray(users.email, SEED_EMAILS));
  const userIds = existingUsers.map((u) => u.id);
  const seedEvents = await db.select({ id: events.id }).from(events).where(like(events.short_code, `${SEED_CODE_PREFIX}%`));
  const eventIds = seedEvents.map((e) => e.id);

  if (eventIds.length || userIds.length) {
    const byUserOrEvent = (userCol, eventCol) => {
      const parts = [];
      if (userIds.length) parts.push(inArray(userCol, userIds));
      if (eventIds.length) parts.push(inArray(eventCol, eventIds));
      return parts.length > 1 ? or(...parts) : parts[0];
    };
    await db.delete(attendance).where(byUserOrEvent(attendance.user_id, attendance.event_id));
    await db.delete(rsvps).where(byUserOrEvent(rsvps.user_id, rsvps.event_id));
    await db.delete(eventMembers).where(byUserOrEvent(eventMembers.user_id, eventMembers.event_id));
  }
  if (eventIds.length) await db.delete(events).where(inArray(events.id, eventIds));
  if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
}

async function createUser(name, email) {
  const password = await bcrypt.hash(SEED_PASSWORD, 10);
  const [res] = await db.insert(users).values({ name, email, password, role: "user" });
  return res.insertId;
}

// A past event that already ended, created 10 days before it happened.
async function createPastEvent(organizerId, i, category, endedDaysAgo) {
  const endDate = d(-endedDaysAgo * DAY);
  const createdAt = new Date(endDate.getTime() - 10 * DAY);
  const [res] = await db.insert(events).values({
    title: `Past ${category} Event #${i}`,
    description: "Seeded past event for prediction demo",
    medium: "offline",
    location_name: "Kathmandu",
    category,
    start_date: new Date(endDate.getTime() - 2 * HOUR),
    end_date: endDate,
    max_participants: 100,
    accepting_rsvp: false,
    require_approval: true,
    short_code: `${SEED_CODE_PREFIX}P${i}`,
    created_by: organizerId,
    created_at: createdAt,
  });
  return { id: res.insertId, category, createdAt };
}

async function rsvpTo(event, userId, organizerId, { approved, responseHours }) {
  const [res] = await db.insert(rsvps).values({
    event_id: event.id,
    user_id: userId,
    owner_user_id: organizerId,
    approved,
    rejected: false,
    pending: !approved,
    created_at: new Date(event.createdAt.getTime() + responseHours * HOUR),
  });
  return res.insertId;
}

async function markAttended(eventId, userId) {
  await db.insert(attendance).values({ event_id: eventId, user_id: userId, checked_in: true, check_in_method: "manual" });
}

async function main() {
  await cleanup();

  const organizerId = await createUser("Seed Organizer", ORGANIZER_EMAIL);
  const reliableId = await createUser("Reliable Rita", RELIABLE_EMAIL);
  const flakyId = await createUser("Flaky Frank", FLAKY_EMAIL);

  // 5 past Community events. Reliable RSVPs fast + attends all; Flaky RSVPs
  // slow + attends none.
  const pastEvents = [];
  for (let i = 1; i <= 5; i++) {
    pastEvents.push(await createPastEvent(organizerId, i, "Community", 60 - i * 5));
  }
  for (const ev of pastEvents) {
    await rsvpTo(ev, reliableId, organizerId, { approved: true, responseHours: 2 });
    await markAttended(ev.id, reliableId);
    await rsvpTo(ev, flakyId, organizerId, { approved: true, responseHours: 120 });
    // Flaky never checks in — no attendance row.
  }

  // The TARGET event: upcoming, owned by organizer, both users pending.
  const [targetRes] = await db.insert(events).values({
    title: "Kathmandu Community Meetup (DEMO — open this one)",
    description: "Open this event as the organizer to see prediction badges.",
    medium: "offline",
    location_name: "Kathmandu",
    category: "Community",
    start_date: d(7 * DAY),
    end_date: d(7 * DAY + 3 * HOUR),
    max_participants: 100,
    accepting_rsvp: true,
    require_approval: true,
    short_code: `${SEED_CODE_PREFIX}TARGET`,
    created_by: organizerId,
    created_at: d(-1 * DAY),
  });
  const target = { id: targetRes.insertId, createdAt: d(-1 * DAY) };
  await rsvpTo(target, reliableId, organizerId, { approved: false, responseHours: 1 });
  await rsvpTo(target, flakyId, organizerId, { approved: false, responseHours: 20 });

  console.log("\n✅ Seed complete.\n");
  console.log("Log in as the ORGANIZER to see the badges:");
  console.log(`  email:    ${ORGANIZER_EMAIL}`);
  console.log(`  password: ${SEED_PASSWORD}`);
  console.log(`\nThen open the event:  "Kathmandu Community Meetup (DEMO — open this one)"  (id ${target.id})`);
  console.log("Pending guests:");
  console.log("  • Reliable Rita  → expect a GREEN, high-% badge (attends all, fast, on-category)");
  console.log("  • Flaky Frank    → expect a RED, low-% badge (never attends, slow)\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
