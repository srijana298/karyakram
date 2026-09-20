// Seed a SPREAD of Smart RSVP prediction scores across REAL existing users.
//
//   Run from the server/ directory:  node scripts/seedPredictionSpread.js
//
// Unlike seedPredictions.js (which invents two users at 100% / 50%), this
// script picks the 5 most active EXISTING users and manufactures just enough
// past history for each to land near a different target score — so the guest
// list shows a believable spread instead of a wall of 50%.
//
// It does NOT hardcode histories. For each user it brute-forces a small plan
// (how many past RSVPs are approved / attended / on-category, and how fast
// they responded) and keeps the plan whose SIMULATED score — computed with the
// exact same functions the API uses, over the user's REAL rows plus the
// planned ones — comes closest to the target.
//
// Everything it creates is tagged with the SEEDX- short_code prefix, so the
// cleanup step only ever deletes its own rows. Pre-existing data is untouched.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { writeFileSync } from "fs";
import { and, eq, inArray, like, ne, sql } from "drizzle-orm";
import { db } from "../src/db/index.js";
import { users, events, rsvps, attendance } from "../src/db/schema.js";
import { buildUserStats, computeAttendanceScore } from "../src/utils/rsvpPrediction.js";

const PREFIX = "SEEDX-";
const ORGANIZER_EMAIL = "seedx.organizer@karyakram.test";
const PASSWORD = "Password123!";
const OUT_FILE = new URL("./prediction-seed-users.txt", import.meta.url).pathname;

// The scores we want to see on the guest list.
const TARGETS = [10, 20, 40, 60, 80];

const TARGET_CATEGORY = "Community";
const OTHER_CATEGORY = "Music";
const PAST_EVENTS = 14; // pool of past events per user the solver draws from

const HOUR = 36e5;
const DAY = 24 * HOUR;
const now = Date.now();
const d = (ms) => new Date(now + ms);

// ── Cleanup ──────────────────────────────────────────────────────────
// Scoped strictly to SEEDX- events, so real user data is never deleted.
async function cleanup() {
  const mine = await db.select({ id: events.id }).from(events).where(like(events.short_code, `${PREFIX}%`));
  const ids = mine.map((e) => e.id);
  if (ids.length) {
    await db.delete(attendance).where(inArray(attendance.event_id, ids));
    await db.delete(rsvps).where(inArray(rsvps.event_id, ids));
    await db.delete(events).where(inArray(events.id, ids));
  }
  await db.delete(users).where(eq(users.email, ORGANIZER_EMAIL));
  return ids.length;
}

// ── Pick the users to work with ──────────────────────────────────────
// Most-active real users first; excludes the *.karyakram.test seed accounts.
async function pickUsers(count) {
  const rows = await db
    .select({ id: users.id, name: users.name, email: users.email, rsvp_count: sql`count(${rsvps.id})` })
    .from(users)
    .leftJoin(rsvps, eq(rsvps.user_id, users.id))
    .where(sql`${users.email} not like '%@karyakram.test'`)
    .groupBy(users.id, users.name, users.email)
    .orderBy(sql`count(${rsvps.id}) desc, ${users.id} desc`)
    .limit(count);
  return rows;
}

// ── The solver ───────────────────────────────────────────────────────
// A plan describes the history we're about to manufacture for one user:
//   approved  — how many of the PAST_EVENTS RSVPs reached "approved"
//   attended  — how many of those they actually checked in to
//   onCategory— how many of the past events share the target's category
//   hours     — how long after event creation they RSVP'd
//
// Simulated with synthetic rows in the exact shape buildUserStats expects,
// concatenated onto the user's real history.
function simulate(plan, realRows, realAttended) {
  const rows = [];
  const attended = new Set(realAttended);
  for (let i = 0; i < PAST_EVENTS; i++) {
    const id = -(i + 1); // synthetic ids can't collide with real ones
    const endDate = d(-(55 - i * 3) * DAY);
    const createdAt = new Date(endDate.getTime() - 10 * DAY);
    rows.push({
      event_id: id,
      approved: i < plan.approved,
      rsvp_created_at: new Date(createdAt.getTime() + plan.hours * HOUR),
      event_category: i < plan.onCategory ? TARGET_CATEGORY : OTHER_CATEGORY,
      event_created_at: createdAt,
      event_end_date: endDate,
    });
    if (i < plan.attended) attended.add(id);
  }
  const stats = buildUserStats({
    userRsvps: [...realRows, ...rows],
    attendedEventIds: attended,
    targetCategory: TARGET_CATEGORY,
    now,
  });
  return { result: computeAttendanceScore(stats), rows };
}

const RESPONSE_HOURS = [1, 3, 6, 12, 18, 24, 30, 36, 44, 60, 120, 240];

function solve(target, realRows, realAttended) {
  let best = null;
  for (let approved = 3; approved <= PAST_EVENTS; approved++) {
    for (let attendedN = 0; attendedN <= approved; attendedN++) {
      for (let onCategory = 0; onCategory <= PAST_EVENTS; onCategory++) {
        for (const hours of RESPONSE_HOURS) {
          const plan = { approved, attended: attendedN, onCategory, hours };
          const { result } = simulate(plan, realRows, realAttended);
          const diff = Math.abs(result.score - target);
          if (!best || diff < best.diff) best = { diff, plan, result };
          if (diff === 0) return best; // exact hit, stop early
        }
      }
    }
  }
  return best;
}

// ── Inserts ──────────────────────────────────────────────────────────
async function createOrganizer() {
  const password = await bcrypt.hash(PASSWORD, 10);
  const [res] = await db.insert(users).values({
    name: "Spread Seed Organizer", email: ORGANIZER_EMAIL, password, role: "user",
  });
  return res.insertId;
}

async function createPastEvent(organizerId, code, category, endedDaysAgo) {
  const endDate = d(-endedDaysAgo * DAY);
  const createdAt = new Date(endDate.getTime() - 10 * DAY);
  const [res] = await db.insert(events).values({
    title: `Past ${category} Event (${code})`,
    description: "Seeded past event for the prediction spread demo",
    medium: "offline",
    location_name: "Kathmandu",
    category,
    start_date: new Date(endDate.getTime() - 2 * HOUR),
    end_date: endDate,
    max_participants: 100,
    accepting_rsvp: false,
    require_approval: true,
    short_code: `${PREFIX}${code}`,
    created_by: organizerId,
    created_at: createdAt,
  });
  return { id: res.insertId, createdAt };
}

// Read a user's REAL history exactly the way the API reads it (target excluded).
async function loadHistory(userId, targetId) {
  const realRows = await db
    .select({
      event_id: rsvps.event_id,
      approved: rsvps.approved,
      rsvp_created_at: rsvps.created_at,
      event_category: events.category,
      event_created_at: events.created_at,
      event_end_date: events.end_date,
    })
    .from(rsvps)
    .leftJoin(events, eq(rsvps.event_id, events.id))
    .where(and(eq(rsvps.user_id, userId), ne(rsvps.event_id, targetId)));
  const realAtt = await db
    .select({ event_id: attendance.event_id })
    .from(attendance)
    .where(eq(attendance.user_id, userId));
  return { realRows, realAttended: new Set(realAtt.map((r) => r.event_id)) };
}

async function main() {
  const wiped = await cleanup();
  if (wiped) console.log(`Cleared ${wiped} event(s) from a previous run.`);

  // `--clean` removes everything this script ever created and stops there.
  if (process.argv.includes("--clean")) {
    console.log("Cleanup only — nothing seeded.");
    process.exit(0);
  }

  const picked = await pickUsers(TARGETS.length);
  if (picked.length < TARGETS.length) {
    console.error(`Need ${TARGETS.length} non-seed users, found ${picked.length}. Aborting.`);
    process.exit(1);
  }

  const organizerId = await createOrganizer();

  // The TARGET event everyone will be pending on.
  const targetCreatedAt = d(-1 * DAY);
  const [targetRes] = await db.insert(events).values({
    title: "Prediction Spread Demo (open this one)",
    description: "Open as the organizer; the Pending tab shows a spread of prediction badges.",
    medium: "offline",
    location_name: "Kathmandu",
    category: TARGET_CATEGORY,
    start_date: d(7 * DAY),
    end_date: d(7 * DAY + 3 * HOUR),
    max_participants: 100,
    accepting_rsvp: true,
    require_approval: true,
    short_code: `${PREFIX}TARGET`,
    created_by: organizerId,
    created_at: targetCreatedAt,
  });
  const targetId = targetRes.insertId;

  // A user's real history puts a FLOOR under their reachable score: someone who
  // already attended every past event they were approved for can't be dragged
  // down to 10%. So measure each floor first and hand the lowest targets to the
  // users who can actually reach them.
  const histories = [];
  for (const user of picked) {
    const { realRows, realAttended } = await loadHistory(user.id, targetId);
    histories.push({ user, realRows, realAttended, floor: solve(0, realRows, realAttended).result.score });
  }
  histories.sort((a, b) => a.floor - b.floor);

  const report = [];

  for (let u = 0; u < histories.length; u++) {
    const { user, realRows, realAttended } = histories[u];
    const target = TARGETS[u];

    const best = solve(target, realRows, realAttended);
    const { plan } = best;

    // Materialise the winning plan.
    for (let i = 0; i < PAST_EVENTS; i++) {
      const category = i < plan.onCategory ? TARGET_CATEGORY : OTHER_CATEGORY;
      const ev = await createPastEvent(organizerId, `U${user.id}E${i + 1}`, category, 55 - i * 3);
      const approved = i < plan.approved;
      await db.insert(rsvps).values({
        event_id: ev.id,
        user_id: user.id,
        owner_user_id: organizerId,
        approved,
        rejected: false,
        pending: !approved,
        created_at: new Date(ev.createdAt.getTime() + plan.hours * HOUR),
      });
      if (i < plan.attended) {
        await db.insert(attendance).values({
          event_id: ev.id, user_id: user.id, checked_in: true, check_in_method: "manual",
        });
      }
    }

    // Pending RSVP on the target event, so the badge renders.
    await db.insert(rsvps).values({
      event_id: targetId,
      user_id: user.id,
      owner_user_id: organizerId,
      approved: false,
      rejected: false,
      pending: true,
      created_at: new Date(targetCreatedAt.getTime() + 2 * HOUR),
    });

    report.push({ user, target, plan, result: best.result });
    console.log(`  ${user.name} → target ${target}%, got ${best.result.score}%`);
  }

  // ── Debug file ─────────────────────────────────────────────────────
  const lines = [];
  lines.push("Smart RSVP Prediction — seeded score spread");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Script:    scripts/seedPredictionSpread.js`);
  lines.push("");
  lines.push(`ORGANIZER (log in as this to see the badges)`);
  lines.push(`  email:    ${ORGANIZER_EMAIL}`);
  lines.push(`  password: ${PASSWORD}`);
  lines.push("");
  lines.push(`TARGET EVENT`);
  lines.push(`  id:         ${targetId}`);
  lines.push(`  short_code: ${PREFIX}TARGET`);
  lines.push(`  title:      Prediction Spread Demo (open this one)`);
  lines.push(`  where:      Event page → Guests → Pending tab`);
  lines.push("");
  lines.push("PENDING GUESTS");
  lines.push("");
  for (const r of report) {
    const f = r.result.factors;
    lines.push(`  ${r.user.name}  (user id ${r.user.id})`);
    lines.push(`    email:        ${r.user.email}`);
    lines.push(`    target score: ${r.target}%`);
    lines.push(`    ACTUAL score: ${r.result.score}%   confidence: ${r.result.confidence}`);
    lines.push(`    factors:      past attendance ${f.previousAttendance}% | acceptance ${f.acceptanceRate}% | category ${f.categoryInterest}% | speed ${f.responseSpeed}%`);
    lines.push(`    seeded plan:  ${PAST_EVENTS} past events — ${r.plan.approved} approved, ${r.plan.attended} attended, ${r.plan.onCategory} on-category, RSVP'd ${r.plan.hours}h after creation`);
    lines.push(`    pre-existing: ${r.user.rsvp_count} real RSVP(s) already counted in the above`);
    lines.push("");
  }
  lines.push("NOTE  Passwords of the real users are unchanged — log in as the organizer above.");
  lines.push(`CLEANUP  Re-running this script wipes every ${PREFIX} event and its RSVPs/attendance first.`);
  lines.push("         Pre-existing rows are never touched.");
  writeFileSync(OUT_FILE, lines.join("\n") + "\n");

  console.log(`\n✅ Seed complete. Details written to:\n   ${OUT_FILE}\n`);
  console.log(`Log in as ${ORGANIZER_EMAIL} / ${PASSWORD}`);
  console.log(`Open event id ${targetId} → Guests → Pending\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
