import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "../db/index.js";
import { eventGroups, events, rsvps, attendance, users } from "../db/schema.js";
import { Ok, Created, NotFound, Forbidden, BadRequest, InternalError } from "../utils/ApiResponse.js";

export const createGroup = async (req, res) => {
  const { title, description, cover_image, category, privacy } = req.body;

  const result = await db.insert(eventGroups).values({
    title,
    description,
    cover_image,
    category,
    privacy,
    created_by: req.user.id,
  }).catch(() => null);

  if (!result) return InternalError("Failed to create event group");

  const [group] = await db.select().from(eventGroups).where(eq(eventGroups.id, result[0].insertId)).catch(() => []);
  return Created(group, "Group created successfully");
};

export const listGroups = async (req, res) => {
  const { mine } = req.query;

  const rows = await db.select().from(eventGroups).where(
    mine === "true" ? eq(eventGroups.created_by, req.user.id) : undefined,
  ).catch(() => null);

  if (!rows) return InternalError("Failed to fetch groups");
  return Ok(rows);
};

export const getGroup = async (req, res) => {
  const groupId = parseInt(req.params.id);

  const [group] = await db.select().from(eventGroups).where(eq(eventGroups.id, groupId)).catch(() => []);
  if (!group) return NotFound("Group not found");

  const subEvents = await db.select().from(events).where(eq(events.group_id, groupId)).catch(() => []);

  return Ok({ ...group, subEvents });
};

export const updateGroup = async (req, res) => {
  const groupId = parseInt(req.params.id);
  const [group] = await db.select().from(eventGroups).where(eq(eventGroups.id, groupId)).catch(() => []);
  if (!group) return NotFound("Group not found");
  if (group.created_by !== req.user.id && req.user.role !== "admin") return Forbidden("Not allowed");

  const updates = {};
  ["title", "description", "cover_image", "category", "privacy"].forEach((k) => {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  });

  if (!Object.keys(updates).length) return BadRequest("No valid fields to update");

  const updated = await db.update(eventGroups).set(updates).where(eq(eventGroups.id, groupId)).catch(() => null);
  if (!updated) return InternalError("Failed to update group");

  const [fresh] = await db.select().from(eventGroups).where(eq(eventGroups.id, groupId)).catch(() => []);
  return Ok(fresh, "Group updated");
};

export const deleteGroup = async (req, res) => {
  const groupId = parseInt(req.params.id);
  const [group] = await db.select().from(eventGroups).where(eq(eventGroups.id, groupId)).catch(() => []);
  if (!group) return NotFound("Group not found");
  if (group.created_by !== req.user.id && req.user.role !== "admin") return Forbidden("Not allowed");

  await db.update(events).set({ group_id: null }).where(eq(events.group_id, groupId)).catch(() => null);
  const deleted = await db.delete(eventGroups).where(eq(eventGroups.id, groupId)).catch(() => null);
  if (!deleted) return InternalError("Failed to delete group");

  return Ok(null, "Group deleted");
};

export const groupStats = async (req, res) => {
  const groupId = parseInt(req.params.id);
  const subEvents = await db.select().from(events).where(eq(events.group_id, groupId)).catch(() => null);
  if (!subEvents) return InternalError("Failed to fetch sub-events");

  const eventIds = subEvents.map((e) => e.id);
  if (!eventIds.length) return Ok({ totalSubEvents: 0, totalRsvps: 0, checkedIn: 0, attendanceRate: 0, eventBreakdown: [] });

  const eventBreakdown = [];
  let totalRsvps = 0;
  let checkedIn = 0;

  for (const ev of subEvents) {
    const evRsvps = await db.select().from(rsvps).where(eq(rsvps.event_id, ev.id)).catch(() => []);
    const evAttendance = await db.select().from(attendance).where(eq(attendance.event_id, ev.id)).catch(() => []);

    totalRsvps += evRsvps.length;
    checkedIn += evAttendance.length;

    eventBreakdown.push({
      eventId: ev.id,
      title: ev.title,
      rsvps: evRsvps.length,
      checkedIn: evAttendance.length,
      attendanceRate: evRsvps.length > 0 ? Number(((evAttendance.length / evRsvps.length) * 100).toFixed(1)) : 0,
    });
  }

  const attendanceRate = totalRsvps > 0 ? Number(((checkedIn / totalRsvps) * 100).toFixed(1)) : 0;

  return Ok({
    totalSubEvents: subEvents.length,
    totalRsvps,
    checkedIn,
    attendanceRate,
    eventBreakdown,
  });
};

export const groupAttendanceSummary = async (req, res) => {
  const groupId = parseInt(req.params.id);
  const subEvents = await db.select().from(events).where(eq(events.group_id, groupId)).catch(() => null);
  if (!subEvents) return InternalError("Failed to fetch sub-events");

  const eventIds = subEvents.map((e) => e.id);
  if (!eventIds.length) return Ok({ students: [] });

  const approvedByEvent = {};
  const checkedByEvent = {};

  for (const ev of subEvents) {
    const evRsvps = await db.select().from(rsvps).where(and(eq(rsvps.event_id, ev.id), eq(rsvps.approved, true))).catch(() => []);
    const evAttendance = await db.select().from(attendance).where(eq(attendance.event_id, ev.id)).catch(() => []);
    approvedByEvent[ev.id] = evRsvps.map((r) => r.user_id);
    checkedByEvent[ev.id] = new Set(evAttendance.map((a) => a.user_id));
  }

  const allUserIds = [...new Set(Object.values(approvedByEvent).flat())];
  const studentRows = [];

  for (const uid of allUserIds) {
    const [u] = await db.select().from(users).where(eq(users.id, uid)).catch(() => []);
    let totalSubEvents = 0;
    let attendedCount = 0;

    for (const ev of subEvents) {
      const isApproved = approvedByEvent[ev.id].includes(uid);
      if (!isApproved) continue;
      totalSubEvents++;
      if (checkedByEvent[ev.id].has(uid)) attendedCount++;
    }

    const attendanceRate = totalSubEvents > 0 ? Number(((attendedCount / totalSubEvents) * 100).toFixed(1)) : 0;
    studentRows.push({
      userId: uid,
      name: u?.name || `User #${uid}`,
      totalSubEvents,
      attendedCount,
      attendanceRate,
    });
  }

  studentRows.sort((a, b) => b.attendanceRate - a.attendanceRate);

  return Ok({ students: studentRows });
};

export const groupConflicts = async (req, res) => {
  const groupId = parseInt(req.params.id);
  const subEvents = await db.select().from(events).where(eq(events.group_id, groupId)).catch(() => null);
  if (!subEvents) return InternalError("Failed to fetch sub-events");

  const conflicts = [];

  for (let i = 0; i < subEvents.length; i++) {
    for (let j = i + 1; j < subEvents.length; j++) {
      const a = subEvents[i];
      const b = subEvents[j];
      if (!a.start_date || !a.end_date || !b.start_date || !b.end_date) continue;

      const aStart = new Date(a.start_date).getTime();
      const aEnd = new Date(a.end_date).getTime();
      const bStart = new Date(b.start_date).getTime();
      const bEnd = new Date(b.end_date).getTime();

      const overlaps = aStart < bEnd && bStart < aEnd;
      if (!overlaps) continue;

      const rA = await db.select().from(rsvps).where(eq(rsvps.event_id, a.id)).catch(() => []);
      const rB = await db.select().from(rsvps).where(eq(rsvps.event_id, b.id)).catch(() => []);
      const setA = new Set(rA.map((x) => x.user_id));
      const setB = new Set(rB.map((x) => x.user_id));
      const sharedUsers = [...setA].filter((u) => setB.has(u));

      conflicts.push({
        eventA: { id: a.id, title: a.title, start: a.start_date, end: a.end_date, location: a.location_name },
        eventB: { id: b.id, title: b.title, start: b.start_date, end: b.end_date, location: b.location_name },
        overlaps: true,
        sharedUsersCount: sharedUsers.length,
        sharedUsers,
        severity: a.location_name && b.location_name && a.location_name === b.location_name ? "critical" : "warning",
      });
    }
  }

  return Ok({ totalConflicts: conflicts.length, conflicts });
};
