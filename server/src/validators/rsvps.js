import { z } from "zod";

export const createRsvpSchema = z.object({
  // no body fields needed — user comes from JWT, event from URL param
});

export const rsvpQuerySchema = z.object({
  owner_user_id: z.coerce.number().int().optional(),
  pending: z.enum(["true", "false"]).optional(),
});
