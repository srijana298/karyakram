import { eq, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { notifications } from "../db/schema.js";
import { Ok, Created, NotFound, InternalError } from "../utils/ApiResponse.js";

export const listNotifications = async (req, res) => {
  const rows = await db.select().from(notifications).where(
    eq(notifications.user_id, req.user.id),
  ).orderBy(desc(notifications.created_at)).catch(() => null);

  if (!rows) return InternalError("Failed to fetch notifications");

  return Ok(rows);
};

export const createNotification = async (req, res) => {
  const { user_id, from_user_id, from_user_name, type, message, link } = req.body;

  const result = await db.insert(notifications).values({
    user_id,
    from_user_id,
    from_user_name,
    type,
    message,
    link,
  }).catch(() => null);

  if (!result) return InternalError("Failed to create notification");

  return Created({ id: result[0].insertId }, "Notification created");
};

export const markRead = async (req, res) => {
  const notifId = parseInt(req.params.id);

  const [notif] = await db.select().from(notifications).where(eq(notifications.id, notifId)).catch(() => []);
  if (!notif) return NotFound("Notification not found");
  if (notif.user_id !== req.user.id) return NotFound("Notification not found");

  const updated = await db.update(notifications).set({ read: true }).where(
    eq(notifications.id, notifId),
  ).catch(() => null);

  if (!updated) return InternalError("Failed to mark notification as read");

  return Ok(null, "Marked as read");
};
