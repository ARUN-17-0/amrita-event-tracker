import type { AcademicEvent, EventType } from "../types/index.ts";

const CAPPED_TYPES: EventType[] = ["quiz", "assignment"];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function checkWeeklyLimit(
  events: AcademicEvent[],
  newEvent: { sectionId: string; eventDate: Date; type: EventType }
): { ok: boolean; message: string } {
  if (!CAPPED_TYPES.includes(newEvent.type)) return { ok: true, message: "" };
  const weekStart = getWeekStart(newEvent.eventDate);
  const weekEnd = getWeekEnd(newEvent.eventDate);
  const count = events.filter(
    e => e.sectionId === newEvent.sectionId && CAPPED_TYPES.includes(e.type) && e.eventDate >= weekStart && e.eventDate <= weekEnd && e.isActive
  ).length;
  if (count >= 3) {
    return { ok: false, message: `This section already has ${count} quiz/assignment events this week (Mon-Sun). Maximum is 3.` };
  }
  return { ok: true, message: "" };
}

export function checkTimeSpacing(
  events: AcademicEvent[],
  newEvent: { sectionId: string; eventDate: Date; eventTime: string }
): { ok: boolean; message: string } {
  const newMins = timeToMinutes(newEvent.eventTime);
  const sameDay = events.filter(
    e => e.sectionId === newEvent.sectionId && e.eventDate.toDateString() === newEvent.eventDate.toDateString() && e.isActive
  );
  for (const e of sameDay) {
    const diff = Math.abs(timeToMinutes(e.eventTime) - newMins);
    if (diff < 25) {
      return { ok: false, message: `"${e.title}" is at ${e.eventTime}. Events in the same section must be at least 25 minutes apart.` };
    }
  }
  return { ok: true, message: "" };
}

export function checkDeptQuizConflict(
  events: AcademicEvent[],
  newEvent: { departmentId: string; eventDate: Date; eventTime: string; type: EventType }
): { ok: boolean; message: string } {
  if (newEvent.type !== "quiz") return { ok: true, message: "" };
  const newMins = timeToMinutes(newEvent.eventTime);
  const deptQuizzesSameDay = events.filter(
    e => e.departmentId === newEvent.departmentId && e.type === "quiz" && e.eventDate.toDateString() === newEvent.eventDate.toDateString() && e.isActive
  );
  for (const e of deptQuizzesSameDay) {
    const diff = Math.abs(timeToMinutes(e.eventTime) - newMins);
    if (diff < 60) {
      return { ok: false, message: `"${e.title}" is a quiz in this department at ${e.eventTime}. Your quiz must be at least 1 hour apart from other department quizzes.` };
    }
  }
  return { ok: true, message: "" };
}
