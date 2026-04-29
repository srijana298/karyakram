import {
  mysqlTable,
  int,
  varchar,
  text,
  boolean,
  decimal,
  timestamp,
} from "drizzle-orm/mysql-core";

// ── Users ────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int().primaryKey().autoincrement(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 20 }),
  role: varchar({ length: 30 }).default("attendee"), // admin | organizer | attendee
  avatar: varchar({ length: 500 }),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow().onUpdateNow(),
});

// ── Event Groups ─────────────────────────────────────────────────────
export const eventGroups = mysqlTable("event_groups", {
  id: int().primaryKey().autoincrement(),
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  cover_image: varchar({ length: 500 }),
  category: varchar({ length: 100 }),
  privacy: varchar({ length: 20 }).default("public"),
  created_by: int().notNull().references(() => users.id),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow().onUpdateNow(),
});

// ── Events ───────────────────────────────────────────────────────────
export const events = mysqlTable("events", {
  id: int().primaryKey().autoincrement(),
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  medium: varchar({ length: 20 }).default("offline"), // online | offline
  location_name: varchar({ length: 500 }),
  latitude: decimal({ precision: 10, scale: 7 }),
  longitude: decimal({ precision: 10, scale: 7 }),
  meet_link: varchar({ length: 500 }),
  meet_id: varchar({ length: 255 }),
  meet_password: varchar({ length: 255 }),
  start_date: timestamp(),
  end_date: timestamp(),
  duration: varchar({ length: 50 }),
  language: varchar({ length: 100 }),
  max_participants: int().default(0),
  category: varchar({ length: 100 }),
  privacy: varchar({ length: 20 }).default("public"), // public | private
  image: varchar({ length: 500 }),
  tnc: text(), // terms & conditions
  accepting_rsvp: boolean().default(true),
  accepting_attendance: boolean().default(false),
  group_id: int().references(() => eventGroups.id),
  check_in_code: varchar({ length: 50 }),
  created_by: int().notNull().references(() => users.id),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow().onUpdateNow(),
});

// ── RSVPs ────────────────────────────────────────────────────────────
export const rsvps = mysqlTable("rsvps", {
  id: int().primaryKey().autoincrement(),
  event_id: int().notNull().references(() => events.id),
  user_id: int().notNull().references(() => users.id),
  owner_user_id: int().notNull().references(() => users.id),
  approved: boolean().default(false),
  rejected: boolean().default(false),
  pending: boolean().default(true),
  membership_id: int(), // set when approved, references event_members.id
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow().onUpdateNow(),
});

// ── Event Members ────────────────────────────────────────────────────
export const eventMembers = mysqlTable("event_members", {
  id: int().primaryKey().autoincrement(),
  event_id: int().notNull().references(() => events.id),
  user_id: int().notNull().references(() => users.id),
  role: varchar({ length: 50 }).notNull(), // owner | collaborator | volunteer | attendee
  invited: boolean().default(false),
  joined: boolean().default(false),
  confirm: boolean().default(false),
  invite_token: varchar({ length: 255 }), // for accept-invite link
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow().onUpdateNow(),
});

// ── Attendance ───────────────────────────────────────────────────────
export const attendance = mysqlTable("attendance", {
  id: int().primaryKey().autoincrement(),
  event_id: int().notNull().references(() => events.id),
  user_id: int().notNull().references(() => users.id),
  checked_in: boolean().default(true),
  check_in_method: varchar({ length: 20 }).default("manual"), // manual | self
  checked_in_at: timestamp().defaultNow(),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow().onUpdateNow(),
});

// ── Notifications ────────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: int().primaryKey().autoincrement(),
  user_id: int().notNull().references(() => users.id),
  from_user_id: int().references(() => users.id),
  from_user_name: varchar({ length: 255 }),
  type: varchar({ length: 100 }),
  message: text(),
  link: varchar({ length: 500 }),
  read: boolean().default(false),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow().onUpdateNow(),
});

// ── Certificate Templates ───────────────────────────────────────────
export const certificateTemplates = mysqlTable("certificate_templates", {
  id: int().primaryKey().autoincrement(),
  name: varchar({ length: 120 }).notNull(),
  theme: varchar({ length: 40 }).default("classic"),
  background_url: text(),
  canvas_json: text(),
  canvas_width: int().default(1400),
  canvas_height: int().default(1000),
  created_by: int().references(() => users.id),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow().onUpdateNow(),
});

// ── Certificates ─────────────────────────────────────────────────────
export const certificates = mysqlTable("certificates", {
  id: int().primaryKey().autoincrement(),
  event_id: int().notNull().references(() => events.id),
  user_id: int().notNull().references(() => users.id),
  template_id: int().references(() => certificateTemplates.id),
  verification_code: varchar({ length: 40 }).notNull().unique(),
  image_data: text(),
  generated_at: timestamp().defaultNow(),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow().onUpdateNow(),
});
