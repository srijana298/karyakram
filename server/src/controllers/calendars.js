import { eq, and, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { calendars, calendarFollows, events } from "../db/schema.js";
import { Ok, Created, NotFound, BadRequest, InternalError } from "../utils/ApiResponse.js";

function rows(result) {
  if (!result) return [];
  if (Array.isArray(result) && Array.isArray(result[0])) return result[0];
  if (Array.isArray(result)) return result;
  return [];
}

// GET /api/calendars?featured=true
// Powers the Discover page's "Featured Calendars" grid. Each row carries a
// follower count, an event count, and — when the request is authenticated —
// whether the current user already follows it.
export const listCalendars = async (req, res) => {
  const featuredOnly = req.query.featured === "true";
  const mineOnly = req.query.mine === "true" && req.user?.id;
  const followingOnly = req.query.following === "true" && req.user?.id;
  const uid = req.user?.id ?? 0;

  let where = sql``;
  if (mineOnly) where = sql`WHERE c.created_by = ${uid}`;
  else if (followingOnly) where = sql`WHERE EXISTS (
    SELECT 1 FROM calendar_follows mine WHERE mine.calendar_id = c.id AND mine.user_id = ${uid}
  )`;
  else if (featuredOnly) where = sql`WHERE c.featured = TRUE`;

  const result = await db.execute(sql`
    SELECT c.id, c.name, c.slug, c.description, c.avatar, c.cover_image,
      c.color, c.city, c.latitude, c.longitude, c.featured,
      (SELECT COUNT(*) FROM calendar_follows f WHERE f.calendar_id = c.id) AS follower_count,
      (SELECT COUNT(*) FROM events e WHERE e.calendar_id = c.id) AS event_count,
      EXISTS(SELECT 1 FROM calendar_follows f
        WHERE f.calendar_id = c.id AND f.user_id = ${uid}) AS is_following,
      (SELECT e.title FROM events e WHERE e.calendar_id = c.id
        AND (e.start_date IS NULL OR e.start_date >= NOW()) ORDER BY e.start_date ASC LIMIT 1) AS next_event_title,
      (SELECT e.start_date FROM events e WHERE e.calendar_id = c.id
        AND (e.start_date IS NULL OR e.start_date >= NOW()) ORDER BY e.start_date ASC LIMIT 1) AS next_event_date
    FROM calendars c
    ${where}
    ORDER BY c.featured DESC, follower_count DESC, c.name ASC
  `).catch(() => null);

  if (!result) return InternalError("Failed to fetch calendars");
  return Ok(rows(result).map((c) => ({ ...c, is_following: Boolean(c.is_following) })));
};

// POST /api/calendars (auth) — create a user-owned calendar.
export const createCalendar = async (req, res) => {
  const name = req.body.name?.trim();
  const description = req.body.description?.trim() || null;
  const city = req.body.city?.trim();
  const color = /^#[0-9a-f]{6}$/i.test(req.body.color || "") ? req.body.color : "#78716c";
  const latitude = Number(req.body.latitude);
  const longitude = Number(req.body.longitude);

  if (!name) return BadRequest("Calendar name is required");
  if (!city || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return BadRequest("Choose a city in Nepal");
  }

  const requested = (req.body.slug || name)
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!requested) return BadRequest("Enter a valid public URL");

  const [taken] = await db.select({ id: calendars.id }).from(calendars)
    .where(eq(calendars.slug, requested)).catch(() => []);
  if (taken) return BadRequest("That public URL is already taken");

  const avatar = req.files?.avatar?.[0] ? `/uploads/${req.files.avatar[0].filename}` : null;
  const cover_image = req.files?.cover?.[0] ? `/uploads/${req.files.cover[0].filename}` : null;
  const result = await db.insert(calendars).values({
    name, slug: requested, description, city, latitude, longitude, color,
    avatar, cover_image, featured: false, created_by: req.user.id,
  }).catch(() => null);
  if (!result) return InternalError("Failed to create calendar");

  return Created({ id: result[0].insertId, slug: requested }, "Calendar created");
};

// GET /api/calendars/:id — a calendar plus its upcoming public events.
export const getCalendar = async (req, res) => {
  const id = parseInt(req.params.id);
  const [cal] = await db.select().from(calendars).where(eq(calendars.id, id)).catch(() => []);
  if (!cal) return NotFound("Calendar not found");

  const calEvents = await db.select().from(events).where(eq(events.calendar_id, id)).catch(() => []);

  const [{ follower_count } = { follower_count: 0 }] = rows(
    await db.execute(sql`SELECT COUNT(*) AS follower_count FROM calendar_follows WHERE calendar_id = ${id}`).catch(() => null),
  );

  const uid = req.user?.id ?? 0;
  const following = rows(
    await db.execute(sql`SELECT 1 FROM calendar_follows WHERE calendar_id = ${id} AND user_id = ${uid} LIMIT 1`).catch(() => null),
  );

  return Ok({ ...cal, events: calEvents, follower_count, is_following: following.length > 0 });
};

// POST /api/calendars/:id/follow (auth)
export const followCalendar = async (req, res) => {
  const id = parseInt(req.params.id);
  const [cal] = await db.select().from(calendars).where(eq(calendars.id, id)).catch(() => []);
  if (!cal) return NotFound("Calendar not found");

  const [existing] = await db
    .select()
    .from(calendarFollows)
    .where(and(eq(calendarFollows.calendar_id, id), eq(calendarFollows.user_id, req.user.id)))
    .catch(() => []);

  if (!existing) {
    const ins = await db
      .insert(calendarFollows)
      .values({ calendar_id: id, user_id: req.user.id })
      .catch(() => null);
    if (!ins) return InternalError("Failed to follow calendar");
  }

  return Created({ calendar_id: id, is_following: true }, "Following calendar");
};

// DELETE /api/calendars/:id/follow (auth)
export const unfollowCalendar = async (req, res) => {
  const id = parseInt(req.params.id);
  const del = await db
    .delete(calendarFollows)
    .where(and(eq(calendarFollows.calendar_id, id), eq(calendarFollows.user_id, req.user.id)))
    .catch(() => null);
  if (!del) return InternalError("Failed to unfollow calendar");
  return Ok({ calendar_id: id, is_following: false }, "Unfollowed calendar");
};
