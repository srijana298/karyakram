import { sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { Ok, InternalError } from "../utils/ApiResponse.js";

function rows(result) {
  if (!result) return [];
  if (Array.isArray(result) && Array.isArray(result[0])) return result[0];
  if (Array.isArray(result)) return result;
  return [];
}

// GET /api/categories
// Lists admin-managed categories with a live event count, for the
// Discover page's "Browse by Category" section.
export const listCategories = async (req, res) => {
  const result = await db.execute(sql`
    SELECT c.id, c.label, c.slug, c.icon, c.color,
      (SELECT COUNT(*) FROM events e
        WHERE e.category = c.label AND e.privacy = 'public') AS event_count
    FROM categories c
    ORDER BY event_count DESC, c.label ASC
  `).catch(() => null);

  if (!result) return InternalError("Failed to fetch categories");
  return Ok(rows(result));
};
