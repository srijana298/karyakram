import { eq, and, or, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { rsvps, events, eventMembers, notifications, users } from "../db/schema.js";
import { Ok, Created, BadRequest, Forbidden, NotFound, Conflict, InternalError } from "../utils/ApiResponse.js";

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  if (!aStart || !bStart) return false;
  const aS = new Date(aStart).getTime();
  const bS = new Date(bStart).getTime();
  const aE = new Date(aEnd || aStart).getTime();
  const bE = new Date(bEnd || bStart).getTime();
  return aS < bE && bS < aE;
}

function toRad(value) {
  return (Number(value) * Math.PI) / 180;
}

function distanceKm(aLat, aLng, bLat, bLng) {
  if ([aLat, aLng, bLat, bLng].some((v) => v === null || v === undefined || Number.isNaN(Number(v)))) return null;
  const earthKm = 6371;
  const dLat = toRad(bLat) - toRad(aLat);
  const dLng = toRad(bLng) - toRad(aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthKm * Math.asin(Math.sqrt(h));
}

function sameLocalDay(a, b) {
  if (!a || !b) return false;
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function travelRisk(existing, target) {
  if (existing.medium !== "offline" || target.medium !== "offline") return null;
  if (!sameLocalDay(existing.start_date, target.start_date)) return null;
  if (rangesOverlap(existing.start_date, existing.end_date, target.start_date, target.end_date)) return null;

  const km = distanceKm(existing.latitude, existing.longitude, target.latitude, target.longitude);
  if (km === null || km < 40) return null;

  const existingStart = new Date(existing.start_date).getTime();
  const existingEnd = new Date(existing.end_date || existing.start_date).getTime();
  const targetStart = new Date(target.start_date).getTime();
  const targetEnd = new Date(target.end_date || target.start_date).getTime();
  const gapHours = targetStart >= existingEnd
    ? (targetStart - existingEnd) / 36e5
    : (existingStart - targetEnd) / 36e5;

  // Nepal road travel is rarely straight-line. Inflate haversine distance and add a safety buffer.
  const estimatedTravelHours = (km * 1.35) / 50 + 1;
  if (gapHours >= estimatedTravelHours) return null;

  return {
    event_id: existing.event_id,
    title: existing.title,
    distance_km: Math.round(km),
    gap_hours: Math.max(0, Number(gapHours.toFixed(1))),
    estimated_travel_hours: Number(estimatedTravelHours.toFixed(1)),
  };
}

async function findUserEventConflict(userId, targetEvent) {
  const rows = await db
    .select({
      rsvp_id: rsvps.id,
      event_id: events.id,
      title: events.title,
      medium: events.medium,
      location_name: events.location_name,
      latitude: events.latitude,
      longitude: events.longitude,
      start_date: events.start_date,
      end_date: events.end_date,
      approved: rsvps.approved,
      pending: rsvps.pending,
    })
    .from(rsvps)
    .leftJoin(events, eq(rsvps.event_id, events.id))
    .where(and(
      eq(rsvps.user_id, userId),
      or(eq(rsvps.approved, true), eq(rsvps.pending, true)),
    ))
    .catch(() => null);

  if (!rows) return { timeConflict: null, commuteRisk: null };
  const candidates = rows.filter((row) => row.event_id !== targetEvent.id);
  return {
    timeConflict: candidates.find((row) => rangesOverlap(row.start_date, row.end_date, targetEvent.start_date, targetEvent.end_date)) || null,
    commuteRisk: candidates.map((row) => travelRisk(row, targetEvent)).find(Boolean) || null,
  };
}

export const createRsvp = async (req, res) => {
  const eventId = parseInt(req.params.id);
  const userId = req.user.id;

  const [event] = await db.select().from(events).where(eq(events.id, eventId)).catch(() => []);
  if (!event) return NotFound("Event not found");
  if (event.created_by === userId) return BadRequest("You cannot RSVP to your own event");
  if (!event.accepting_rsvp) return BadRequest("RSVP is closed for this event");

  const [existing] = await db.select().from(rsvps).where(
    and(eq(rsvps.event_id, eventId), eq(rsvps.user_id, userId)),
  ).catch(() => []);

  if (existing) {
    if (existing.approved) return Conflict("Your RSVP has already been approved");
    return Conflict("You have already RSVP'd. Please wait for approval");
  }

  const { timeConflict, commuteRisk } = await findUserEventConflict(userId, event);
  if (timeConflict) {
    const start = timeConflict.start_date ? new Date(timeConflict.start_date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }) : "the same time";
    return Conflict(`This event overlaps with ${timeConflict.title} on ${start}`, {
      code: "TIME_CONFLICT",
      conflict: timeConflict,
    });
  }
  if (commuteRisk && req.body?.forceTravelRisk !== true) {
    return Conflict(
      `This event is about ${commuteRisk.distance_km} km away from ${commuteRisk.title}, with only ${commuteRisk.gap_hours}h between events. Are you sure you can commute?`,
      { code: "TRAVEL_RISK", conflict: commuteRisk },
    );
  }

  const usesWaitlist = event.admission_mode === "waitlist";
  if (!usesWaitlist && Number(event.max_participants) > 0) {
    const [count] = await db.select({ total: sql`count(*)` }).from(rsvps).where(
      and(eq(rsvps.event_id, eventId), eq(rsvps.approved, true)),
    ).catch(() => [{ total: 0 }]);
    if (Number(count?.total) >= Number(event.max_participants)) {
      return BadRequest("This event has reached capacity");
    }
  }

  // Candidate-list events always remain pending for organizer/algorithm review.
  const autoApprove = !usesWaitlist && (event.require_approval === false || event.require_approval === 0);

  let membershipId = null;
  if (autoApprove) {
    const memberResult = await db.insert(eventMembers).values({
      event_id: eventId,
      user_id: userId,
      role: "attendee",
      invited: true,
      joined: false,
      confirm: false,
    }).catch(() => null);
    if (!memberResult) return InternalError("Failed to create membership");
    membershipId = memberResult[0].insertId;
  }

  const result = await db.insert(rsvps).values({
    event_id: eventId,
    user_id: userId,
    owner_user_id: event.created_by,
    approved: autoApprove,
    rejected: false,
    pending: !autoApprove,
    membership_id: membershipId,
  }).catch(() => null);

  if (!result) return InternalError("Failed to create RSVP");

  // Notify event owner
  await db.insert(notifications).values({
    user_id: event.created_by,
    from_user_id: userId,
    from_user_name: req.user.name,
    type: "RSVP",
    message: autoApprove
      ? `${req.user.name} is attending your event ${event.title}`
      : usesWaitlist
        ? `${req.user.name} joined the candidate list for ${event.title}`
        : `${req.user.name} has RSVP'd to your event ${event.title}`,
  }).catch(() => {});

  return Created(
    { approved: autoApprove, waitlisted: usesWaitlist },
    autoApprove ? "You're confirmed for this event" : usesWaitlist ? "You joined the candidate list" : "RSVP sent to the event owner",
  );
};

export const listRsvpsForEvent = async (req, res) => {
  const eventId = parseInt(req.params.id);

  const [event] = await db.select().from(events).where(eq(events.id, eventId)).catch(() => []);
  if (!event) return NotFound("Event not found");
  if (event.created_by !== req.user.id) return Forbidden("Only the event owner can view RSVPs");

  const rows = await db
    .select({
      id: rsvps.id,
      event_id: rsvps.event_id,
      user_id: rsvps.user_id,
      user_name: users.name,
      user_email: users.email,
      approved: rsvps.approved,
      rejected: rsvps.rejected,
      pending: rsvps.pending,
      created_at: rsvps.created_at,
    })
    .from(rsvps)
    .leftJoin(users, eq(rsvps.user_id, users.id))
    .where(eq(rsvps.event_id, eventId))
    .catch(() => null);
  if (!rows) return InternalError("Failed to fetch RSVPs");

  return Ok(rows);
};

export const listMyRsvps = async (req, res) => {
  const { owner_user_id, pending } = req.query;

  const conditions = [];

  if (owner_user_id) conditions.push(eq(rsvps.owner_user_id, owner_user_id));
  else conditions.push(eq(rsvps.user_id, req.user.id));

  if (pending === "true") conditions.push(eq(rsvps.pending, true));

  const rows = await db
    .select({
      rsvp_id: rsvps.id,
      approved: rsvps.approved,
      rejected: rsvps.rejected,
      pending: rsvps.pending,
      rsvp_created_at: rsvps.created_at,
      event_id: events.id,
      event_short_code: events.short_code,
      event_title: events.title,
      event_description: events.description,
      event_image: events.image,
      event_category: events.category,
      event_medium: events.medium,
      event_start_date: events.start_date,
      event_end_date: events.end_date,
      event_location_name: events.location_name,
      event_language: events.language,
    })
    .from(rsvps)
    .leftJoin(events, eq(rsvps.event_id, events.id))
    .where(
      conditions.length > 0 ? and(...conditions) : undefined,
    )
    .catch(() => null);

  if (!rows) return InternalError("Failed to fetch RSVPs");

  return Ok(rows);
};

export const approveRsvp = async (req, res) => {
  const rsvpId = parseInt(req.params.id);

  const [rsvp] = await db.select().from(rsvps).where(eq(rsvps.id, rsvpId)).catch(() => []);
  if (!rsvp) return NotFound("RSVP not found");
  if (rsvp.approved) return Conflict("RSVP already approved");

  const [event] = await db.select().from(events).where(eq(events.id, rsvp.event_id)).catch(() => []);
  if (!event || event.created_by !== req.user.id) return Forbidden("Only the event owner can approve RSVPs");

  const memberResult = await db.insert(eventMembers).values({
    event_id: rsvp.event_id,
    user_id: rsvp.user_id,
    role: "attendee",
    invited: true,
    joined: false,
    confirm: false,
  }).catch(() => null);

  if (!memberResult) return InternalError("Failed to create membership");

  const membershipId = memberResult[0].insertId;

  const updated = await db.update(rsvps).set({
    approved: true,
    pending: false,
    membership_id: membershipId,
  }).where(eq(rsvps.id, rsvpId)).catch(() => null);

  if (!updated) return InternalError("Failed to update RSVP");

  // Notify user
  await db.insert(notifications).values({
    user_id: rsvp.user_id,
    from_user_id: req.user.id,
    from_user_name: req.user.name,
    type: "RSVP_APPROVED",
    message: `Your RSVP to ${event.title} has been approved`,
  }).catch(() => {});

  return Ok(null, "RSVP approved");
};

export const rejectRsvp = async (req, res) => {
  const rsvpId = parseInt(req.params.id);

  const [rsvp] = await db.select().from(rsvps).where(eq(rsvps.id, rsvpId)).catch(() => []);
  if (!rsvp) return NotFound("RSVP not found");

  const [event] = await db.select().from(events).where(eq(events.id, rsvp.event_id)).catch(() => []);
  if (!event || event.created_by !== req.user.id) return Forbidden("Only the event owner can reject RSVPs");

  if (rsvp.membership_id) {
    await db.delete(eventMembers).where(eq(eventMembers.id, rsvp.membership_id)).catch(() => {});
  }

  const deleted = await db.delete(rsvps).where(eq(rsvps.id, rsvpId)).catch(() => null);
  if (!deleted) return InternalError("Failed to delete RSVP");

  // Notify user
  await db.insert(notifications).values({
    user_id: rsvp.user_id,
    from_user_id: req.user.id,
    from_user_name: req.user.name,
    type: "RSVP_REJECTED",
    message: `Your RSVP to ${event.title} has been rejected`,
  }).catch(() => {});

  return Ok(null, "RSVP rejected");
};
