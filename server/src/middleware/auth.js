import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { verifyToken } from "../utils/auth.js";

// Loads the user referenced by a verified token. Returns null if the token's
// user no longer exists (e.g. the DB was reseeded and ids changed), so callers
// can reject stale tokens instead of failing later on a foreign key.
async function loadUser(token) {
  const decoded = verifyToken(token);
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, decoded.id))
    .catch(() => []);
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    try {
      const token = header.split(" ")[1];
      req.user = await loadUser(token); // null if the user is gone
    } catch {}
  }
  next();
}

export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const token = header.split(" ")[1];
    const user = await loadUser(token);
    if (!user) {
      return res.status(401).json({ error: "Session expired, please log in again" });
    }
    req.user = user; // { id, email, name, role }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
