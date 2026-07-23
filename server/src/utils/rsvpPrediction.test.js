import { describe, expect, it } from "vitest";
import { computeAttendanceScore, MIN_HISTORY, NEUTRAL_SCORE, WEIGHTS } from "./rsvpPrediction.js";

describe("RSVP attendance prediction", () => {
  it("returns a neutral low-confidence score for users below the history threshold (cold start)", () => {
    const result = computeAttendanceScore({
      pastApprovedRsvps: MIN_HISTORY - 1,
      pastAttended: 1,
      totalRsvps: 2,
      approvedRsvps: 2,
      categoryRsvps: 2,
      avgResponseHours: 1,
    });

    expect(result.score).toBe(NEUTRAL_SCORE);
    expect(result.confidence).toBe("low");
    expect(result.factors).toBeNull();
  });

  it("scores a perfectly reliable, fast-responding, on-category user at 100", () => {
    const result = computeAttendanceScore({
      pastApprovedRsvps: 10,
      pastAttended: 10, // always shows up
      totalRsvps: 10,
      approvedRsvps: 10, // every RSVP approved
      categoryRsvps: 10, // all in this category
      avgResponseHours: 0, // instant response
    });

    expect(result.score).toBe(100);
    expect(result.confidence).toBe("high");
    expect(result.factors).toMatchObject({
      previousAttendance: 100,
      acceptanceRate: 100,
      categoryInterest: 100,
      responseSpeed: 100,
    });
  });

  it("scores a user who never attends near zero, driven by the 40% attendance weight", () => {
    const result = computeAttendanceScore({
      pastApprovedRsvps: 8,
      pastAttended: 0, // never shows up
      totalRsvps: 8,
      approvedRsvps: 0, // and none approved
      categoryRsvps: 0,
      avgResponseHours: 96, // slow
    });

    expect(result.score).toBe(0);
    expect(result.confidence).toBe("high");
  });

  it("weights each factor per the documented formula", () => {
    // Only previous attendance is perfect; everything else is zero.
    const result = computeAttendanceScore({
      pastApprovedRsvps: 5,
      pastAttended: 5,
      totalRsvps: 5,
      approvedRsvps: 0,
      categoryRsvps: 0,
      avgResponseHours: 48, // -> responseSpeed 0
    });

    // Expected = previousAttendance(1.0) * 0.4 = 40
    expect(result.score).toBe(Math.round(WEIGHTS.previousAttendance * 100));
  });

  it("treats an unknown response time as neutral rather than penalizing it", () => {
    const withNull = computeAttendanceScore({
      pastApprovedRsvps: 5,
      pastAttended: 0,
      totalRsvps: 5,
      approvedRsvps: 0,
      categoryRsvps: 0,
      avgResponseHours: null,
    });

    // Only responseSpeed contributes: 0.5 * 0.1 = 0.05 -> 5
    expect(withNull.score).toBe(5);
  });

  it("clamps ratios so bad data can never push the score out of 0..100", () => {
    const result = computeAttendanceScore({
      pastApprovedRsvps: 5,
      pastAttended: 99, // more attendances than approvals (dirty data)
      totalRsvps: 5,
      approvedRsvps: 99,
      categoryRsvps: 99,
      avgResponseHours: -10, // negative time
    });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
