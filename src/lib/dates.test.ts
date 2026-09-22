import { describe, expect, it } from "vitest";
import { dayLabel } from "./dates";

describe("dayLabel", () => {
  it('returns "Today" for a timestamp from right now', () => {
    expect(dayLabel(new Date().toISOString())).toBe("Today");
  });

  it('returns "Yesterday" for a timestamp 24h ago', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(dayLabel(yesterday.toISOString())).toBe("Yesterday");
  });

  it("returns a formatted date for anything older", () => {
    expect(dayLabel(new Date(2025, 0, 15).toISOString())).toBe("January 15, 2025");
  });
});
