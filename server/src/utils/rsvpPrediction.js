// ── Smart RSVP Attendance Prediction ─────────────────────────────────
// A transparent weighted heuristic (NOT a black-box ML model) that
// estimates how likely a user is to actually attend an event they've
// RSVP'd to. Every input is already stored, so no schema changes.
//
//   Attendance Score =
//       Previous Attendance   × 40%
//     + RSVP Acceptance Rate  × 30%
//     + Category Interest     × 20%
//     + Response Speed        × 10%
//
// Each sub-factor is a 0..1 ratio; the weighted sum is scaled to 0..100.

export const WEIGHTS = {
  previousAttendance: 0.4,
  acceptanceRate: 0.3,
  categoryInterest: 0.2,
  responseSpeed: 0.1,
};

// Users with fewer than this many past (approved) RSVPs don't have enough
// history for the ratios to mean anything — we return a neutral score.
export const MIN_HISTORY = 3;
export const NEUTRAL_SCORE = 50;

// A response is considered "fast" if the user RSVP'd within this many hours
// of the event being created. Faster response → stronger intent.
const FAST_RESPONSE_HOURS = 48;

function clamp01(value) {
  if (Number.isNaN(value) || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

// Pure, dependency-free scoring function — this is the unit-tested core.
//
// stats = {
//   pastApprovedRsvps: number,   // approved RSVPs on events that already ended
//   pastAttended: number,        // of those, how many the user checked in to
//   totalRsvps: number,          // every RSVP the user has ever made
//   approvedRsvps: number,       // of those, how many reached "approved"
//   categoryRsvps: number,       // user's RSVPs in THIS event's category
//   avgResponseHours: number|null, // avg hours between event creation & RSVP
// }
export function computeAttendanceScore(stats) {
  const {
    pastApprovedRsvps = 0,
    pastAttended = 0,
    totalRsvps = 0,
    approvedRsvps = 0,
    categoryRsvps = 0,
    avgResponseHours = null,
  } = stats || {};

  if (pastApprovedRsvps < MIN_HISTORY) {
    return { score: NEUTRAL_SCORE, confidence: "low", factors: null };
  }

  const previousAttendance = clamp01(pastAttended / pastApprovedRsvps);
  const acceptanceRate = totalRsvps > 0 ? clamp01(approvedRsvps / totalRsvps) : 0;
  const categoryInterest = totalRsvps > 0 ? clamp01(categoryRsvps / totalRsvps) : 0;
  // Linear decay: 0h → 1.0, FAST_RESPONSE_HOURS or slower → 0. Null = neutral 0.5.
  const responseSpeed = avgResponseHours === null
    ? 0.5
    : clamp01(1 - avgResponseHours / FAST_RESPONSE_HOURS);

  const weighted =
    previousAttendance * WEIGHTS.previousAttendance +
    acceptanceRate * WEIGHTS.acceptanceRate +
    categoryInterest * WEIGHTS.categoryInterest +
    responseSpeed * WEIGHTS.responseSpeed;

  return {
    score: Math.round(weighted * 100),
    confidence: pastApprovedRsvps >= MIN_HISTORY * 2 ? "high" : "medium",
    factors: {
      previousAttendance: Math.round(previousAttendance * 100),
      acceptanceRate: Math.round(acceptanceRate * 100),
      categoryInterest: Math.round(categoryInterest * 100),
      responseSpeed: Math.round(responseSpeed * 100),
    },
  };
}

// Turn a user's raw RSVP + attendance rows into the stats object consumed by
// computeAttendanceScore. Pure (no DB) so it stays unit-testable; the caller
// supplies the rows fetched from the database.
//
//   userRsvps: [{ event_id, approved, rsvp_created_at, event_category,
//                 event_created_at, event_end_date }]  // excludes target event
//   attendedEventIds: Set<number>  // past events this user checked in to
//   targetCategory: string|null    // the event being predicted
//   now: number                    // current epoch ms
export function buildUserStats({ userRsvps, attendedEventIds, targetCategory, now }) {
  const attended = attendedEventIds || new Set();
  const totalRsvps = userRsvps.length;
  const approvedRsvps = userRsvps.filter((r) => r.approved).length;
  const categoryRsvps = targetCategory
    ? userRsvps.filter((r) => r.event_category === targetCategory).length
    : 0;

  // Past = event already ended. Only these can be graded for attendance.
  const pastApproved = userRsvps.filter(
    (r) => r.approved && r.event_end_date && new Date(r.event_end_date).getTime() < now,
  );
  const pastApprovedRsvps = pastApproved.length;
  const pastAttended = pastApproved.filter((r) => attended.has(r.event_id)).length;

  // Average hours between event creation and the user's RSVP.
  const responseGaps = userRsvps
    .filter((r) => r.event_created_at && r.rsvp_created_at)
    .map((r) => (new Date(r.rsvp_created_at).getTime() - new Date(r.event_created_at).getTime()) / 36e5)
    .filter((h) => h >= 0);
  const avgResponseHours = responseGaps.length
    ? responseGaps.reduce((a, b) => a + b, 0) / responseGaps.length
    : null;

  return {
    pastApprovedRsvps,
    pastAttended,
    totalRsvps,
    approvedRsvps,
    categoryRsvps,
    avgResponseHours,
  };
}
