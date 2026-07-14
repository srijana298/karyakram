import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  avatar: z.string().url("Invalid avatar URL").max(500).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const updateMeSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatar: z.string().url("Invalid avatar URL").max(500).optional(),
});
