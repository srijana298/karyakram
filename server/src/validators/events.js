import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  medium: z.enum(["online", "offline"]).default("offline"),
  location_name: z.string().nullable().optional(),
  latitude: z.string().nullable().optional(),
  longitude: z.string().nullable().optional(),
  meet_link: z.string().nullable().optional(),
  meet_id: z.string().nullable().optional(),
  meet_password: z.string().nullable().optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().nullable().optional(),
  duration: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  max_participants: z.coerce.number().int().min(0).default(0),
  category: z.string().min(1, "Category is required"),
  privacy: z.enum(["public", "private"]).default("public"),
  tnc: z.string().nullable().optional(),
  accepting_rsvp: z.boolean().default(true),
  accepting_attendance: z.boolean().default(false),
})

export const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  medium: z.enum(["online", "offline"]).optional(),
  location_name: z.string().nullable().optional(),
  latitude: z.string().nullable().optional(),
  longitude: z.string().nullable().optional(),
  meet_link: z.string().nullable().optional(),
  meet_id: z.string().nullable().optional(),
  meet_password: z.string().nullable().optional(),
  start_date: z.string().optional(),
  end_date: z.string().nullable().optional(),
  duration: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  max_participants: z.coerce.number().int().min(0).optional(),
  category: z.string().optional(),
  privacy: z.enum(["public", "private"]).optional(),
  image: z.string().nullable().optional(),
  tnc: z.string().nullable().optional(),
  accepting_rsvp: z.boolean().optional(),
  accepting_attendance: z.boolean().optional(),
});

export const eventQuerySchema = z.object({
  filter: z.enum(["online", "offline"]).optional(),
  category: z.string().optional(),
  mine: z.enum(["true", "false"]).optional(),
});
