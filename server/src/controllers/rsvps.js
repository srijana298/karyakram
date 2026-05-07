import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { rsvps, events, eventMembers, notifications, users } from "../db/schema.js";
import { Ok, Created, BadRequest, Forbidden, NotFound, Conflict, InternalError } from "../utils/ApiResponse.js";

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

  const result = await db.insert(rsvps).values({
    event_id: eventId,
    user_id: userId,
    owner_user_id: event.created_by,
    approved: false,
    rejected: false,
    pending: true,
  }).catch(() => null);

  if (!result) return InternalError("Failed to create RSVP");

  // Notify event owner
  await db.insert(notifications).values({
    user_id: event.created_by,
    from_user_id: userId,
    from_user_name: req.user.name,
    type: "RSVP",
    message: `${req.user.name} has RSVP'd to your event ${event.title}`,
  }).catch(() => {});

  return Created(null, "RSVP sent to the event owner");
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
