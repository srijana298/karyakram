import { describe, expect, it } from "vitest";
import { findEventConflicts } from "./eventConflicts.js";

const event = (id, start, end, location) => ({
  id,
  title: `Event ${id}`,
  start_date: start,
  end_date: end,
  location_name: location,
});

describe("event conflict behavior", () => {
  it("reports overlapping events at the same location as critical", () => {
    const events = [
      event(1, "2026-08-01T10:00:00Z", "2026-08-01T12:00:00Z", " City Hall "),
      event(2, "2026-08-01T11:00:00Z", "2026-08-01T13:00:00Z", "city hall"),
    ];

    const [conflict] = findEventConflicts(events, [
      { event_id: 1, user_id: 9 },
      { event_id: 2, user_id: 9 },
    ]);

    expect(conflict).toMatchObject({
      overlaps: true,
      severity: "critical",
      sharedUsersCount: 1,
      sharedUsers: [9],
    });
  });

  it("reports overlapping events at different locations as a warning", () => {
    const conflicts = findEventConflicts([
      event(1, "2026-08-01T10:00:00Z", "2026-08-01T12:00:00Z", "City Hall"),
      event(2, "2026-08-01T11:59:00Z", "2026-08-01T13:00:00Z", "Library"),
    ]);

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].severity).toBe("warning");
  });

  it("allows back-to-back events, including at the same location", () => {
    const conflicts = findEventConflicts([
      event(1, "2026-08-01T10:00:00Z", "2026-08-01T12:00:00Z", "City Hall"),
      event(2, "2026-08-01T12:00:00Z", "2026-08-01T13:00:00Z", "City Hall"),
    ]);

    expect(conflicts).toEqual([]);
  });

  it("does not report events at different times", () => {
    const conflicts = findEventConflicts([
      event(1, "2026-08-01T08:00:00Z", "2026-08-01T09:00:00Z", "City Hall"),
      event(2, "2026-08-01T10:00:00Z", "2026-08-01T11:00:00Z", "City Hall"),
    ]);

    expect(conflicts).toEqual([]);
  });
});
