import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { attendance, events, rsvps } from "../db/schema.js";
import { Ok, Created, NotFound, Forbidden, BadRequest, InternalError } from "../utils/ApiResponse.js";

async function canManageEvent(eventId, user) {
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).catch(() => []);
  if (!event) return { ok: false, error: NotFound("Event not found") };
  if (event.created_by !== user.id && user.role !== "admin") return { ok: false, error: Forbidden("Only owner/admin can manage attendance") };
  return { ok: true, event };
}

export const listAttendance = async (req, res) => {
  const eventId = parseInt(req.params.id);
  const check = await canManageEvent(eventId, req.user);
  if (!check.ok) return check.error;

  const rows = await db.select().from(attendance).where(eq(attendance.event_id, eventId)).catch(() => null);
  if (!rows) return InternalError("Failed to fetch attendance");
  return Ok(rows);
};

export const markAttendance = async (req, res) => {
  const eventId = parseInt(req.params.id);
  const { userId, checkedIn = true } = req.body;

  const check = await canManageEvent(eventId, req.user);
  if (!check.ok) return check.error;

  const [existingRsvp] = await db.select().from(rsvps).where(
    and(eq(rsvps.event_id, eventId), eq(rsvps.user_id, userId), eq(rsvps.approved, true)),
  ).catch(() => []);

  if (!existingRsvp) return BadRequest("User does not have approved RSVP");

  const [existing] = await db.select().from(attendance).where(
    and(eq(attendance.event_id, eventId), eq(attendance.user_id, userId)),
  ).catch(() => []);

  if (existing) {
    const updated = await db.update(attendance).set({
      checked_in: checkedIn,
      check_in_method: "manual",
      checked_in_at: new Date(),
    }).where(eq(attendance.id, existing.id)).catch(() => null);
    if (!updated) return InternalError("Failed to update attendance");
    return Ok(null, "Attendance updated");
  }

  const created = await db.insert(attendance).values({
    event_id: eventId,
    user_id: userId,
    checked_in: checkedIn,
    check_in_method: "manual",
    checked_in_at: new Date(),
  }).catch(() => null);

  if (!created) return InternalError("Failed to mark attendance");
  return Created(null, "Attendance marked");
};

export const bulkAttendance = async (req, res) => {
  const eventId = parseInt(req.params.id);
  const { attendees } = req.body; // [{ userId, checkedIn }]

  const check = await canManageEvent(eventId, req.user);
  if (!check.ok) return check.error;
  if (!Array.isArray(attendees) || attendees.length === 0) return BadRequest("attendees array is required");

  let updated = 0;
  for (const item of attendees) {
    const userId = item.userId;
    const checkedIn = item.checkedIn !== false;
    if (!userId) continue;

    const [existing] = await db.select().from(attendance).where(
      and(eq(attendance.event_id, eventId), eq(attendance.user_id, userId)),
    ).catch(() => []);

    if (existing) {
      await db.update(attendance).set({ checked_in: checkedIn, check_in_method: "manual", checked_in_at: new Date() }).where(eq(attendance.id, existing.id)).catch(() => null);
    } else {
      await db.insert(attendance).values({ event_id: eventId, user_id: userId, checked_in: checkedIn, check_in_method: "manual", checked_in_at: new Date() }).catch(() => null);
    }
    updated++;
  }

  return Ok({ updated }, "Bulk attendance updated");
};

export const generateCheckInCode = async (req, res) => {
  const eventId = parseInt(req.params.id);
  const check = await canManageEvent(eventId, req.user);
  if (!check.ok) return check.error;

  const code = crypto.randomBytes(3).toString("hex").toUpperCase();
  const updated = await db.update(events).set({ check_in_code: code }).where(eq(events.id, eventId)).catch(() => null);
  if (!updated) return InternalError("Failed to generate code");

  return Ok({ code }, "Check-in code generated");
};

export const selfCheckIn = async (req, res) => {
  const eventId = parseInt(req.params.id);
  const { code } = req.body;
  if (!code) return BadRequest("Code is required");

  const [event] = await db.select().from(events).where(eq(events.id, eventId)).catch(() => []);
  if (!event) return NotFound("Event not found");
  if (!event.check_in_code || event.check_in_code !== code) return BadRequest("Invalid check-in code");

  const [approved] = await db.select().from(rsvps).where(
    and(eq(rsvps.event_id, eventId), eq(rsvps.user_id, req.user.id), eq(rsvps.approved, true)),
  ).catch(() => []);
  if (!approved) return Forbidden("You are not an approved attendee");

  const [existing] = await db.select().from(attendance).where(
    and(eq(attendance.event_id, eventId), eq(attendance.user_id, req.user.id)),
  ).catch(() => []);

  if (existing) return Ok(null, "Already checked in");

  const created = await db.insert(attendance).values({
    event_id: eventId,
    user_id: req.user.id,
    checked_in: true,
    check_in_method: "self",
    checked_in_at: new Date(),
  }).catch(() => null);

  if (!created) return InternalError("Failed to check in");
  return Created(null, "Check-in successful");
};
