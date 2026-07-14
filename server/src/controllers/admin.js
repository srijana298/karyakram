import { eq, sql, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, events, rsvps, eventMembers, eventGroups } from "../db/schema.js";
import { Ok, NotFound, BadRequest, InternalError } from "../utils/ApiResponse.js";

/* ── Helpers ────────────────────────────────────────────────── */
function rows(result) {
  if (!result) return [];
  if (Array.isArray(result) && Array.isArray(result[0])) return result[0];
  if (Array.isArray(result)) return result;
  return [];
}

function firstRow(result) {
  const r = rows(result);
  return r[0] || null;
}

/* ── Platform Analytics ─────────────────────────────────────── */
export const platformStats = async (req, res) => {
  try {
    const totalEventsResult = await db.execute(sql`SELECT COUNT(*) as count FROM events`).catch(() => [[{ count: 0 }]]);
    const totalUsersResult = await db.execute(sql`SELECT COUNT(*) as count FROM users`).catch(() => [[{ count: 0 }]]);
    const totalRsvpsResult = await db.execute(sql`SELECT COUNT(*) as count FROM rsvps`).catch(() => [[{ count: 0 }]]);
    const totalMembersResult = await db.execute(sql`
      SELECT COUNT(DISTINCT user_id) as count FROM event_members WHERE role != 'owner'
    `).catch(() => [[{ count: 0 }]]);
    const totalGroupsResult = await db.execute(sql`SELECT COUNT(*) as count FROM event_groups`).catch(() => [[{ count: 0 }]]);

    const rsvpStats = await db.execute(sql`
      SELECT
        SUM(CASE WHEN approved = 1 THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN pending = 1 THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN rejected = 1 THEN 1 ELSE 0 END) as rejected
      FROM rsvps
    `).catch(() => [[{ approved: 0, pending: 0, rejected: 0 }]]);

    const eventsByMonth = await db.execute(sql`
      SELECT DATE_FORMAT(start_date, '%Y-%m') as month, COUNT(*) as count
      FROM events
      WHERE start_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month ORDER BY month ASC
    `).catch(() => [[]]);

    const eventsByCategory = await db.execute(sql`
      SELECT category, COUNT(*) as count FROM events
      GROUP BY category ORDER BY count DESC LIMIT 10
    `).catch(() => [[]]);

    const rsvpTrend = await db.execute(sql`
      SELECT DATE_FORMAT(r.created_at, '%Y-%m') as month, COUNT(*) as count
      FROM rsvps r
      WHERE r.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month ORDER BY month ASC
    `).catch(() => [[]]);

    const topEvents = await db.execute(sql`
      SELECT e.id, e.title, e.category, e.start_date, e.image, e.created_by,
        (SELECT COUNT(*) FROM rsvps WHERE event_id = e.id AND approved = 1) as rsvp_count,
        (SELECT COUNT(*) FROM event_members WHERE event_id = e.id) as member_count
      FROM events e
      ORDER BY rsvp_count DESC LIMIT 5
    `).catch(() => [[]]);

    const eventsByMedium = await db.execute(sql`
      SELECT medium, COUNT(*) as count FROM events GROUP BY medium
    `).catch(() => [[]]);

    const usersByRole = await db.execute(sql`
      SELECT role, COUNT(*) as count FROM users GROUP BY role
    `).catch(() => [[]]);

    const data = {
      overview: {
        totalEvents: Number(firstRow(totalEventsResult)?.count ?? 0),
        totalUsers: Number(firstRow(totalUsersResult)?.count ?? 0),
        totalRsvps: Number(firstRow(totalRsvpsResult)?.count ?? 0),
        totalMembers: Number(firstRow(totalMembersResult)?.count ?? 0),
        totalGroups: Number(firstRow(totalGroupsResult)?.count ?? 0),
      },
      rsvpStats: firstRow(rsvpStats) || { approved: 0, pending: 0, rejected: 0 },
      eventsByMonth: rows(eventsByMonth),
      eventsByCategory: rows(eventsByCategory),
      rsvpTrend: rows(rsvpTrend),
      topEvents: rows(topEvents),
      eventsByMedium: rows(eventsByMedium),
      usersByRole: rows(usersByRole),
    };

    return Ok(data);
  } catch (err) {
    console.error("Admin analytics error:", err);
    return InternalError("Failed to fetch platform analytics");
  }
};

/* ── All Events (cross-organizer) ───────────────────────────── */
export const listAllEvents = async (req, res) => {
  const { category, medium, privacy, search } = req.query;

  const conditions = [];
  if (category) conditions.push(eq(events.category, category));
  if (medium === "online" || medium === "offline") conditions.push(eq(events.medium, medium));
  if (privacy === "public" || privacy === "private") conditions.push(eq(events.privacy, privacy));

  let rows = await db.select({
    id: events.id,
    title: events.title,
    description: events.description,
    medium: events.medium,
    location_name: events.location_name,
    latitude: events.latitude,
    longitude: events.longitude,
    meet_link: events.meet_link,
    start_date: events.start_date,
    end_date: events.end_date,
    duration: events.duration,
    language: events.language,
    max_participants: events.max_participants,
    category: events.category,
    privacy: events.privacy,
    image: events.image,
    tnc: events.tnc,
    accepting_rsvp: events.accepting_rsvp,
    accepting_attendance: events.accepting_attendance,
    group_id: events.group_id,
    check_in_code: events.check_in_code,
    created_by: events.created_by,
    created_at: events.created_at,
    updated_at: events.updated_at,
  }).from(events)
    .where(
      conditions.length > 0 ? and(...conditions) : undefined,
    )
    .catch(() => null);

  if (!rows) return InternalError("Failed to fetch events");

  // Attach organizer name for each event
  const enriched = await Promise.all(rows.map(async (e) => {
    if (!e.created_by) return e;
    const [org] = await db.select({ name: users.name }).from(users).where(eq(users.id, e.created_by)).catch(() => []);
    return { ...e, organizer_name: org?.name || null };
  }));

  rows = enriched;

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter((e) =>
      e.title?.toLowerCase().includes(q) ||
      e.organizer_name?.toLowerCase().includes(q) ||
      e.location_name?.toLowerCase().includes(q)
    );
  }

  return Ok(rows);
};

/* ── All Groups ─────────────────────────────────────────────── */
export const listAllGroups = async (req, res) => {
  let rows = await db.select().from(eventGroups).catch(() => null);
  if (!rows) return InternalError("Failed to fetch groups");

  // Attach organizer name for each group
  const enriched = await Promise.all(rows.map(async (g) => {
    if (!g.created_by) return g;
    const [org] = await db.select({ name: users.name }).from(users).where(eq(users.id, g.created_by)).catch(() => []);
    return { ...g, organizer_name: org?.name || null };
  }));

  return Ok(enriched);
};

/* ── User Management ────────────────────────────────────────── */
export const listUsers = async (req, res) => {
  const { role, search } = req.query;

  const conditions = [];
  if (role) conditions.push(eq(users.role, role));

  let rows = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    phone: users.phone,
    role: users.role,
    avatar: users.avatar,
    created_at: users.created_at,
  }).from(users).where(
    conditions.length > 0 ? and(...conditions) : undefined,
  ).catch(() => null);

  if (!rows) return InternalError("Failed to fetch users");

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter((u) =>
      u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }

  // Attach event/rsvp counts
  const enriched = [];
  for (const u of rows) {
    const [eventCount] = await db.execute(sql`
      SELECT COUNT(*) as count FROM events WHERE created_by = ${u.id}
    `).catch(() => [[{ count: 0 }]]);

    const [rsvpCount] = await db.execute(sql`
      SELECT COUNT(*) as count FROM rsvps WHERE user_id = ${u.id}
    `).catch(() => [[{ count: 0 }]]);

    enriched.push({
      ...u,
      eventsCreated: Number(firstRow(eventCount)?.count ?? 0),
      rsvpsCount: Number(firstRow(rsvpCount)?.count ?? 0),
    });
  }

  return Ok(enriched);
};

export const updateUserRole = async (req, res) => {
  const userId = parseInt(req.params.id);
  const { role } = req.body;

  const validRoles = ["admin", "user"];
  if (!validRoles.includes(role)) return BadRequest("Invalid role. Must be: admin or user");

  const [existing] = await db.select().from(users).where(eq(users.id, userId)).catch(() => []);
  if (!existing) return NotFound("User not found");

  await db.update(users).set({ role }).where(eq(users.id, userId)).catch(() => null);

  const [updated] = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
  }).from(users).where(eq(users.id, userId)).catch(() => []);

  return Ok(updated, "User role updated");
};

export const deleteUser = async (req, res) => {
  const userId = parseInt(req.params.id);

  const [existing] = await db.select().from(users).where(eq(users.id, userId)).catch(() => []);
  if (!existing) return NotFound("User not found");

  if (existing.id === req.user.id) return BadRequest("You cannot delete your own account");

  await db.delete(users).where(eq(users.id, userId)).catch(() => null);
  return Ok(null, "User deleted");
};
