import { describe, expect, it } from "vitest";
import { createEventSchema } from "./events.js";

const validEvent = {
  title: "Community meetup",
  description: "A public meetup",
  medium: "offline",
  location_name: "Kathmandu City Hall",
  latitude: "27.7172",
  longitude: "85.3240",
  start_date: "2026-08-01T10:00:00.000Z",
  end_date: "2026-08-01T12:00:00.000Z",
  category: "Community",
  privacy: "public",
  max_participants: 50,
};

describe("event creation API contract", () => {
  it("accepts a complete event and supplies creation defaults", () => {
    const result = createEventSchema.safeParse(validEvent);

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      title: "Community meetup",
      accepting_rsvp: true,
      accepting_attendance: false,
      require_approval: true,
      admission_mode: "capacity",
    });
  });

  it.each([
    ["title", { ...validEvent, title: "" }],
    ["start date", { ...validEvent, start_date: "" }],
    ["category", { ...validEvent, category: "" }],
    ["privacy", { ...validEvent, privacy: "friends-only" }],
    ["capacity", { ...validEvent, max_participants: -1 }],
  ])("rejects an event with an invalid %s", (_field, payload) => {
    expect(createEventSchema.safeParse(payload).success).toBe(false);
  });
});
