import { z } from "zod";

export const inviteMemberSchema = z.object({
  user_id: z.number().int("User ID is required"),
  role: z.enum(["collaborator", "volunteer", "attendee"]),
});

export const acceptInviteSchema = z.object({
  invite_token: z.string().min(1, "Invite token is required"),
});
