import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { Ok, InternalError } from "../utils/ApiResponse.js";

export const listUsers = async (req, res) => {
  const all = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
  }).from(users).catch(() => null);

  if (!all) return InternalError("Failed to fetch users");

  const filtered = all.filter((u) => u.id !== req.user.id);
  return Ok(filtered);
};
