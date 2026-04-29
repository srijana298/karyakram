import crypto from "crypto";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { events, eventMembers, rsvps, notifications, users } from "../db/schema.js";
import { Ok, Created, Forbidden, NotFound, BadRequest, InternalError } from "../utils/ApiResponse.js";

export const inviteMember = async (req, res) => {
  const eventId = parseInt(req.params.id);
  const { user_id, role } = req.body;

  const [event] = await db.select().from(events).where(eq(events.id, eventId)).catch(() => []);
  if (!event) return NotFound("Event not found");
  if (event.created_by !== req.user.id) return Forbidden("Only the owner can invite");

  const [existing] = await db.select().from(eventMembers).where(
    and(eq(eventMembers.event_id, eventId), eq(eventMembers.user_id, user_id)),
  ).catch(() => []);

  if (existing) return BadRequest("User is already a member of this event");

  const inviteToken = crypto.randomBytes(32).toString("hex");

  const result = await db.insert(eventMembers).values({
    event_id: eventId,
    user_id,
    role,
    invited: true,
    joined: false,
    confirm: false,
    invite_token: inviteToken,
  }).catch(() => null);

  if (!result) return InternalError("Failed to invite member");

  // Notify user
  await db.insert(notifications).values({
    user_id,
    from_user_id: req.user.id,
    from_user_name: req.user.name,
    type: "INVITE",
    message: `You have been invited to join ${event.title} as ${role}`,
    link: `/accept-invite/${eventId}?memberId=${result[0].insertId}&token=${inviteToken}`,
  }).catch(() => {});

  return Created(null, "Invitation sent");
};

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

  // Clean up related RSVP
  await db.delete(rsvps).where(
    and(eq(rsvps.event_id, eventId), eq(rsvps.user_id, member.user_id)),
  ).catch(() => {});

  return Ok(null, "Member removed");
};

export const markAttendance = async (req, res) => {
  const eventId = parseInt(req.params.id);
  const memberId = parseInt(req.params.memberId);

  const [member] = await db.select().from(eventMembers).where(
    and(eq(eventMembers.event_id, eventId), eq(eventMembers.id, memberId)),
  ).catch(() => []);

  if (!member) return NotFound("Member not found");
  if (member.role.includes("attended")) return BadRequest("Attendance already marked");

  const newRole = `${member.role},attended`;

  const updated = await db.update(eventMembers).set({ role: newRole }).where(
    eq(eventMembers.id, memberId),
  ).catch(() => null);

  if (!updated) return InternalError("Failed to mark attendance");

  return Ok(null, "Attendance marked");
};

export const receivedInvites = async (req, res) => {
  const userId = req.user.id;

  const rows = await db.select().from(eventMembers).where(
    and(eq(eventMembers.user_id, userId), eq(eventMembers.joined, false), eq(eventMembers.confirm, false)),
  ).catch(() => null);

  if (!rows) return InternalError("Failed to fetch invites");

  const invites = [];
  for (const m of rows) {
    const [event] = await db.select().from(events).where(eq(events.id, m.event_id)).catch(() => []);
    const [owner] = await db.select().from(users).where(eq(users.id, event?.created_by ?? 0)).catch(() => []);
    invites.push({
      id: m.id,
      eventId: m.event_id,
      eventTitle: event?.title || "Unknown",
      eventImage: event?.image || null,
      role: m.role,
      invitedAt: m.created_at,
      inviteToken: m.invite_token,
      ownerName: owner?.name || "Unknown",
    });
  }

  return Ok(invites);
};

export const sentInvites = async (req, res) => {
  const userId = req.user.id;

  const myEvents = await db.select().from(events).where(eq(events.created_by, userId)).catch(() => null);
  if (!myEvents) return InternalError("Failed to fetch events");

  const result = [];
  for (const ev of myEvents) {
    const members = await db.select().from(eventMembers).where(
      and(eq(eventMembers.event_id, ev.id)),
    ).catch(() => []);

    const nonOwner = members.filter((m) => m.role !== "owner");
    if (nonOwner.length === 0) continue;

    const invitedUsers = [];
    for (const m of nonOwner) {
      const [u] = await db.select().from(users).where(eq(users.id, m.user_id)).catch(() => []);
      invitedUsers.push({
        memberId: m.id,
        userId: m.user_id,
        name: u?.name || `User #${m.user_id}`,
        email: u?.email || "",
        role: m.role,
        joined: m.joined,
        confirmed: m.confirm,
        status: m.joined ? "accepted" : m.invited ? "pending" : "rejected",
      });
    }

    const pending = invitedUsers.filter((u) => u.status === "pending").length;
    const accepted = invitedUsers.filter((u) => u.status === "accepted").length;
    const rejected = invitedUsers.filter((u) => u.status === "rejected").length;

    result.push({
      eventId: ev.id,
      eventTitle: ev.title,
      eventImage: ev.image,
      totalInvited: nonOwner.length,
      pending,
      accepted,
      rejected,
      invitedUsers,
    });
  }

  return Ok(result);
};

export const acceptInvite = async (req, res) => {
  const { invite_token } = req.body;

  const [member] = await db.select().from(eventMembers).where(
    and(eq(eventMembers.invite_token, invite_token), eq(eventMembers.user_id, req.user.id)),
  ).catch(() => []);

  if (!member) return NotFound("Invalid invite token");
  if (member.joined) return BadRequest("Invite already accepted");

  const updated = await db.update(eventMembers).set({
    joined: true,
    confirm: true,
    invite_token: null,
  }).where(eq(eventMembers.id, member.id)).catch(() => null);

  if (!updated) return InternalError("Failed to accept invite");

  // Notify event owner
  const [event] = await db.select().from(events).where(eq(events.id, member.event_id)).catch(() => []);
  if (event) {
    await db.insert(notifications).values({
      user_id: event.created_by,
      from_user_id: member.user_id,
      type: "INVITE_ACCEPTED",
      message: `A member accepted your invitation to ${event.title}`,
    }).catch(() => {});
  }

  return Ok(null, "Invitation accepted");
};
