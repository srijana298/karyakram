import { eq, sql, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { events, rsvps, eventMembers, notifications } from "../db/schema.js";
import { Ok, InternalError } from "../utils/ApiResponse.js";

/**
 * User-scoped analytics.
 * Always filters by the requesting user's events.
 * Admin analytics lives in controllers/admin.js → GET /api/admin/stats
 */
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

export const getAnalytics = async (req, res) => {
  const userId = req.user.id;

  try {
    console.log(`📊 Analytics for user ${userId}`);

    // Events by month (last 6 months)
    const eventsByMonth = await db.execute(sql`
      SELECT DATE_FORMAT(start_date, '%Y-%m') as month, COUNT(*) as count
      FROM events
      WHERE created_by = ${userId}
        AND start_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `).catch((e) => { console.error("eventsByMonth error:", e.message); return [[]]; });

    // Events by category
    const eventsByCategory = await db.execute(sql`
      SELECT category, COUNT(*) as count
      FROM events
      WHERE created_by = ${userId}
      GROUP BY category
      ORDER BY count DESC
      LIMIT 10
    `).catch((e) => { console.error("eventsByCategory error:", e.message); return [[]]; });

    // RSVP stats (approved vs pending vs rejected)
    const rsvpStats = await db.execute(sql`
      SELECT
        SUM(CASE WHEN approved = 1 THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN pending = 1 THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN rejected = 1 THEN 1 ELSE 0 END) as rejected
      FROM rsvps
      WHERE owner_user_id = ${userId}
    `).catch((e) => { console.error("rsvpStats error:", e.message); return [[{ approved: 0, pending: 0, rejected: 0 }]]; });

    // RSVP trend (last 6 months)
    const rsvpTrend = await db.execute(sql`
      SELECT DATE_FORMAT(r.created_at, '%Y-%m') as month, COUNT(*) as count
      FROM rsvps r
      JOIN events e ON r.event_id = e.id
      WHERE e.created_by = ${userId}
        AND r.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `).catch((e) => { console.error("rsvpTrend error:", e.message); return [[]]; });

    // Top events by RSVP count
    const topEvents = await db.execute(sql`
      SELECT e.id, e.title, e.category, e.start_date, e.image,
        (SELECT COUNT(*) FROM rsvps WHERE event_id = e.id AND approved = 1) as rsvp_count,
        (SELECT COUNT(*) FROM event_members WHERE event_id = e.id) as member_count
      FROM events e
      WHERE e.created_by = ${userId}
      ORDER BY rsvp_count DESC
      LIMIT 5
    `).catch((e) => { console.error("topEvents error:", e.message); return [[]]; });

    // Overview counts
    const totalEventsResult = await db.execute(sql`
      SELECT COUNT(*) as count FROM events WHERE created_by = ${userId}
    `).catch(() => [[{ count: 0 }]]);

    const totalRsvpsResult = await db.execute(sql`
      SELECT COUNT(*) as count FROM rsvps WHERE owner_user_id = ${userId}
    `).catch(() => [[{ count: 0 }]]);

    const totalMembersResult = await db.execute(sql`
      SELECT COUNT(DISTINCT em.user_id) as count FROM event_members em
      JOIN events e ON em.event_id = e.id
      WHERE e.created_by = ${userId} AND em.role != 'owner'
    `).catch(() => [[{ count: 0 }]]);

    const unreadNotifsResult = await db.execute(sql`
      SELECT COUNT(*) as count FROM notifications WHERE user_id = ${userId} AND \`read\` = 0
    `).catch(() => [[{ count: 0 }]]);

    // Events by medium
    const eventsByMedium = await db.execute(sql`
      SELECT medium, COUNT(*) as count FROM events WHERE created_by = ${userId} GROUP BY medium
    `).catch(() => [[]]);

    const data = {
      overview: {
        totalEvents: Number(firstRow(totalEventsResult)?.count ?? 0),
        totalRsvps: Number(firstRow(totalRsvpsResult)?.count ?? 0),
        totalMembers: Number(firstRow(totalMembersResult)?.count ?? 0),
        unreadNotifications: Number(firstRow(unreadNotifsResult)?.count ?? 0),
      },
      eventsByMonth: rows(eventsByMonth),
      eventsByCategory: rows(eventsByCategory),
      rsvpStats: firstRow(rsvpStats) || { approved: 0, pending: 0, rejected: 0 },
      rsvpTrend: rows(rsvpTrend),
      topEvents: rows(topEvents),
      eventsByMedium: rows(eventsByMedium),
    };

    console.log(`📊 Analytics result:`, JSON.stringify(data.overview));

    return Ok(data);
  } catch (err) {
    console.error("Analytics error:", err);
    return InternalError("Failed to fetch analytics");
  }
};
