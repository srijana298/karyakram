import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { events, eventMembers, rsvps, attendance } from "../db/schema.js";
import { Ok, Forbidden, NotFound, BadRequest, InternalError } from "../utils/ApiResponse.js";

export const listMembers = async (req, res) => {
  const eventId = parseInt(req.params.id);

  const rows = await db.select().from(eventMembers).where(
    eq(eventMembers.event_id, eventId),
  ).catch(() => null);

  if (!rows) return InternalError("Failed to fetch members");

  return Ok(rows);
};

export const removeMember = async (req, res) => {
  const eventId = parseInt(req.params.id);
  const memberId = parseInt(req.params.memberId);

  const [event] = await db.select().from(events).where(eq(events.id, eventId)).catch(() => []);
  if (!event) return NotFound("Event not found");
  if (event.created_by !== req.user.id) return Forbidden("Only the owner can remove members");

  const [member] = await db.select().from(eventMembers).where(eq(eventMembers.id, memberId)).catch(() => []);
  if (!member) return NotFound("Member not found");
  if (member.role === "owner") return BadRequest("Cannot remove the owner");

  const deleted = await db.delete(eventMembers).where(eq(eventMembers.id, memberId)).catch(() => null);
  if (!deleted) return InternalError("Failed to remove member");

  await db.delete(rsvps).where(
    and(eq(rsvps.event_id, eventId), eq(rsvps.user_id, member.user_id)),
  ).catch(() => {});

  return Ok(null, "Member removed");
};

export const markAttendance = async (req, res) => {
  const eventId = parseInt(req.params.id);
  const memberId = parseInt(req.params.memberId);

  const [event] = await db.select().from(events).where(eq(events.id, eventId)).catch(() => []);
  if (!event) return NotFound("Event not found");

  const [member] = await db.select().from(eventMembers).where(
    and(eq(eventMembers.event_id, eventId), eq(eventMembers.id, memberId)),
  ).catch(() => []);

  if (!member) return NotFound("Member not found");

  const [existingAttendance] = await db.select().from(attendance).where(
    and(eq(attendance.event_id, eventId), eq(attendance.user_id, member.user_id)),
  ).catch(() => []);

  if (existingAttendance?.checked_in) return BadRequest("Attendance already marked");

  if (existingAttendance) {
    const updatedAttendance = await db.update(attendance).set({
      checked_in: true,
      check_in_method: "scan",
      checked_in_at: new Date(),
    }).where(eq(attendance.id, existingAttendance.id)).catch(() => null);
    if (!updatedAttendance) return InternalError("Failed to mark attendance");
  } else {
    const createdAttendance = await db.insert(attendance).values({
      event_id: eventId,
      user_id: member.user_id,
      checked_in: true,
      check_in_method: "scan",
      checked_in_at: new Date(),
    }).catch(() => null);
    if (!createdAttendance) return InternalError("Failed to mark attendance");
  }

  if (!member.role.includes("attended")) {
    const updated = await db.update(eventMembers).set({ role: `${member.role},attended` }).where(
      eq(eventMembers.id, memberId),
    ).catch(() => null);

    if (!updated) return InternalError("Failed to update member attendance");
  }

  return Ok(null, "Attendance marked");
};
