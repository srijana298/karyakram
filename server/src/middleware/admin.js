import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { Unauthorized, Forbidden } from "../utils/ApiResponse.js";

/**
 * Admin middleware.
 * Must be used AFTER authMiddleware (so req.user.id exists).
 * Looks up the user's role from the DB and rejects non-admins.
 */
export async function adminMiddleware(req, res, next) {
  try {
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, req.user.id))
      .catch(() => []);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Admin access required" });
    }

    req.user.role = "admin"; // attach for downstream controllers
    next();
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to verify admin status" });
  }
}
