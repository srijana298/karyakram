import { z } from "zod";

export const createNotificationSchema = z.object({
  user_id: z.number().int("User ID is required"),
  from_user_id: z.number().int().optional(),
  from_user_name: z.string().optional(),
  type: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  link: z.string().optional(),
});
