import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { events, eventMembers } from "../db/schema.js";
import { Ok, Created, Forbidden, NotFound, BadRequest, InternalError } from "../utils/ApiResponse.js";

export const createEvent = async (req, res) => {
  const {
    title, description, medium, location_name, latitude, longitude,
    meet_link, meet_id, meet_password, start_date, end_date,
    duration, language, max_participants, category, privacy,
    tnc, accepting_rsvp, accepting_attendance,
  } = req.body;

  const result = await db.insert(events).values({
    title, description, medium, location_name, latitude, longitude,
    meet_link, meet_id, meet_password,
    start_date: new Date(start_date),
    end_date: end_date ? new Date(end_date) : null,
    duration, language, max_participants, category, privacy,
    tnc, accepting_rsvp, accepting_attendance,
    created_by: req.user.id,
  }).catch(() => null);

  if (!result) return InternalError("Failed to create event");

  const eventId = result[0].insertId;

  // Auto-add creator as owner
  const memberResult = await db.insert(eventMembers).values({
    event_id: eventId,
    user_id: req.user.id,
    role: "owner",
    invited: true,
    joined: true,
    confirm: true,
  }).catch(() => null);

  if (!memberResult) return InternalError("Failed to create event membership");

  const [event] = await db.select().from(events).where(eq(events.id, eventId)).catch(() => []);

  return Created(event, "Event created successfully");
};

export const listEvents = async (req, res) => {
  const { filter, category, mine } = req.query;

  const conditions = [];

  if (mine === "true") {
    conditions.push(eq(events.created_by, req.user.id));
  } else {
    conditions.push(eq(events.privacy, "public"));
  }

  if (category) conditions.push(eq(events.category, category));
  if (filter === "online" || filter === "offline") {
    conditions.push(eq(events.medium, filter));
  }

  const rows = await db.select().from(events).where(
    conditions.length > 0 ? and(...conditions) : undefined,
  ).catch(() => null);

  if (!rows) return InternalError("Failed to fetch events");

  return Ok(rows);
};

export const getEvent = async (req, res) => {
  const [event] = await db.select().from(events).where(
    eq(events.id, parseInt(req.params.id)),
  ).catch(() => []);

  if (!event) return NotFound("Event not found");

  return Ok(event);
};

export const updateEvent = async (req, res) => {
  const eventId = parseInt(req.params.id);

  const [existing] = await db.select().from(events).where(eq(events.id, eventId)).catch(() => []);
  if (!existing) return NotFound("Event not found");
  if (existing.created_by !== req.user.id) return Forbidden("Only the creator can update");

  const allowed = [
    "title", "description", "medium", "location_name", "latitude", "longitude",
    "meet_link", "meet_id", "meet_password", "start_date", "end_date",
    "duration", "language", "max_participants", "category", "privacy",
    "image", "tnc", "accepting_rsvp", "accepting_attendance",
  ];

  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates[key] = key === "start_date" || key === "end_date"
        ? req.body[key] ? new Date(req.body[key]) : null
        : req.body[key];
    }
  }

  if (Object.keys(updates).length === 0) return BadRequest("No valid fields to update");

  const updated = await db.update(events).set(updates).where(eq(events.id, eventId)).catch(() => null);
  if (!updated) return InternalError("Failed to update event");

  const [event] = await db.select().from(events).where(eq(events.id, eventId)).catch(() => []);

  return Ok(event, "Event updated successfully");
};

export const deleteEvent = async (req, res) => {
  const eventId = parseInt(req.params.id);

  const [existing] = await db.select().from(events).where(eq(events.id, eventId)).catch(() => []);
  if (!existing) return NotFound("Event not found");
  if (existing.created_by !== req.user.id) return Forbidden("Only the creator can delete");

  const deleted = await db.delete(events).where(eq(events.id, eventId)).catch(() => null);
  if (!deleted) return InternalError("Failed to delete event");

  return Ok(null, "Event deleted");
};

export const uploadEventImage = async (req, res) => {
  if (!req.file) return BadRequest("No image provided");

  const eventId = parseInt(req.params.id);

  const [existing] = await db.select().from(events).where(eq(events.id, eventId)).catch(() => []);
  if (!existing) return NotFound("Event not found");
  if (existing.created_by !== req.user.id) return Forbidden("Only the creator can upload images");

  const imageUrl = `/uploads/${req.file.filename}`;

  const updated = await db.update(events).set({ image: imageUrl }).where(eq(events.id, eventId)).catch(() => null);
  if (!updated) return InternalError("Failed to update event image");

  return Ok({ image: imageUrl }, "Image uploaded");
};
