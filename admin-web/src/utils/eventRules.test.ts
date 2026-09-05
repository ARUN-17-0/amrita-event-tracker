import test, { describe, it } from "node:test";
import assert from "node:assert";
import { checkWeeklyLimit, checkTimeSpacing, checkDeptQuizConflict } from "./eventRules.ts";
import type { AcademicEvent } from "../types/index.ts";

function createMockEvent(overrides: Partial<AcademicEvent>): AcademicEvent {
  return {
    id: `evt-${Math.random()}`,
    title: "Test Event",
    type: "quiz",
    eventDate: new Date("2026-09-07T10:00:00"), // Monday
    eventTime: "10:00",
    sectionId: "sec-1",
    departmentId: "dept-1",
    subjectId: "sub-1",
    createdBy: "fac-1",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

describe("Event Business Rules: checkWeeklyLimit", () => {
  it("should allow 3rd event when 2 exist in same week", () => {
    const existing = [
      createMockEvent({ type: "quiz", eventDate: new Date("2026-09-07T10:00:00") }),
      createMockEvent({ type: "assignment", eventDate: new Date("2026-09-08T10:00:00") })
    ];
    const result = checkWeeklyLimit(existing, {
      sectionId: "sec-1",
      eventDate: new Date("2026-09-09T10:00:00"),
      type: "quiz"
    });
    assert.strictEqual(result.ok, true);
  });

  it("should deny 4th capped event in same section and week", () => {
    const existing = [
      createMockEvent({ type: "quiz", eventDate: new Date("2026-09-07T10:00:00") }),
      createMockEvent({ type: "assignment", eventDate: new Date("2026-09-08T10:00:00") }),
      createMockEvent({ type: "quiz", eventDate: new Date("2026-09-09T10:00:00") })
    ];
    const result = checkWeeklyLimit(existing, {
      sectionId: "sec-1",
      eventDate: new Date("2026-09-10T10:00:00"),
      type: "quiz"
    });
    assert.strictEqual(result.ok, false);
    assert.match(result.message, /Maximum is 3/);
  });

  it("should not count non-capped events towards weekly limit", () => {
    const existing = [
      createMockEvent({ type: "announcement", eventDate: new Date("2026-09-07T10:00:00") }),
      createMockEvent({ type: "lab", eventDate: new Date("2026-09-08T10:00:00") }),
      createMockEvent({ type: "project", eventDate: new Date("2026-09-09T10:00:00") })
    ];
    const result = checkWeeklyLimit(existing, {
      sectionId: "sec-1",
      eventDate: new Date("2026-09-10T10:00:00"),
      type: "quiz"
    });
    assert.strictEqual(result.ok, true);
  });

  it("should allow events in a different section even if first section is capped", () => {
    const existing = [
      createMockEvent({ sectionId: "sec-1", type: "quiz", eventDate: new Date("2026-09-07T10:00:00") }),
      createMockEvent({ sectionId: "sec-1", type: "assignment", eventDate: new Date("2026-09-08T10:00:00") }),
      createMockEvent({ sectionId: "sec-1", type: "quiz", eventDate: new Date("2026-09-09T10:00:00") })
    ];
    const result = checkWeeklyLimit(existing, {
      sectionId: "sec-2",
      eventDate: new Date("2026-09-10T10:00:00"),
      type: "quiz"
    });
    assert.strictEqual(result.ok, true);
  });
});

describe("Event Business Rules: checkTimeSpacing", () => {
  it("should deny event within 25 minutes in same section", () => {
    const existing = [
      createMockEvent({ sectionId: "sec-1", eventDate: new Date("2026-09-07T10:00:00"), eventTime: "10:00" })
    ];
    const result = checkTimeSpacing(existing, {
      sectionId: "sec-1",
      eventDate: new Date("2026-09-07T10:00:00"),
      eventTime: "10:20"
    });
    assert.strictEqual(result.ok, false);
    assert.match(result.message, /at least 25 minutes apart/);
  });

  it("should allow event exactly 25 minutes apart", () => {
    const existing = [
      createMockEvent({ sectionId: "sec-1", eventDate: new Date("2026-09-07T10:00:00"), eventTime: "10:00" })
    ];
    const result = checkTimeSpacing(existing, {
      sectionId: "sec-1",
      eventDate: new Date("2026-09-07T10:00:00"),
      eventTime: "10:25"
    });
    assert.strictEqual(result.ok, true);
  });

  it("should allow event in a different section at the same time", () => {
    const existing = [
      createMockEvent({ sectionId: "sec-1", eventDate: new Date("2026-09-07T10:00:00"), eventTime: "10:00" })
    ];
    const result = checkTimeSpacing(existing, {
      sectionId: "sec-2",
      eventDate: new Date("2026-09-07T10:00:00"),
      eventTime: "10:10"
    });
    assert.strictEqual(result.ok, true);
  });
});

describe("Event Business Rules: checkDeptQuizConflict", () => {
  it("should deny department quiz within 60 minutes", () => {
    const existing = [
      createMockEvent({ departmentId: "dept-1", type: "quiz", eventDate: new Date("2026-09-07T10:00:00"), eventTime: "10:00" })
    ];
    const result = checkDeptQuizConflict(existing, {
      departmentId: "dept-1",
      type: "quiz",
      eventDate: new Date("2026-09-07T10:00:00"),
      eventTime: "10:55"
    });
    assert.strictEqual(result.ok, false);
    assert.match(result.message, /at least 1 hour apart/);
  });

  it("should allow department quiz 60 minutes or more apart", () => {
    const existing = [
      createMockEvent({ departmentId: "dept-1", type: "quiz", eventDate: new Date("2026-09-07T10:00:00"), eventTime: "10:00" })
    ];
    const result = checkDeptQuizConflict(existing, {
      departmentId: "dept-1",
      type: "quiz",
      eventDate: new Date("2026-09-07T10:00:00"),
      eventTime: "11:00"
    });
    assert.strictEqual(result.ok, true);
  });

  it("should always allow non-quiz event types regardless of spacing", () => {
    const existing = [
      createMockEvent({ departmentId: "dept-1", type: "quiz", eventDate: new Date("2026-09-07T10:00:00"), eventTime: "10:00" })
    ];
    const result = checkDeptQuizConflict(existing, {
      departmentId: "dept-1",
      type: "assignment",
      eventDate: new Date("2026-09-07T10:00:00"),
      eventTime: "10:15"
    });
    assert.strictEqual(result.ok, true);
  });
});
