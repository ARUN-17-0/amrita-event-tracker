import { useState, useEffect, useCallback } from 'react';
import { AcademicEvent, EventType } from '../types';
import { calendarService } from '../services/calendarService';
import { checkWeeklyLimit, checkTimeSpacing, checkDeptQuizConflict } from '../utils/eventRules';

export const useCalendar = () => {
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setEvents(await calendarService.getEvents()); setError(null); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  // Synchronous filter from loaded state — no async re-fetch needed
  const getEventsForDate = (d: Date) =>
    events.filter(e => e.eventDate.toDateString() === d.toDateString());

  const getEventsForMonth = (y: number, m: number) =>
    events.filter(e => e.eventDate.getFullYear() === y && e.eventDate.getMonth() === m);

  const createEvent = async (
    data: Omit<AcademicEvent, 'id' | 'createdAt' | 'updatedAt'>,
    isMentor = false
  ): Promise<{ ok: boolean; message: string }> => {
    // Rule 1: weekly limit (quiz+assignment only)
    const weekly = checkWeeklyLimit(events, { sectionId: data.sectionId, eventDate: data.eventDate, type: data.type as EventType });
    if (!weekly.ok) return weekly;

    // Rule 2: 25-min spacing within same section + day
    const spacing = checkTimeSpacing(events, { sectionId: data.sectionId, eventDate: data.eventDate, eventTime: data.eventTime });
    if (!spacing.ok) return spacing;

    // Rule 3 (Course Mentor only): 1-hr dept quiz gap
    if (isMentor) {
      const deptConflict = checkDeptQuizConflict(events, {
        departmentId: data.departmentId,
        eventDate: data.eventDate,
        eventTime: data.eventTime,
        type: data.type as EventType
      });
      if (!deptConflict.ok) return deptConflict;
    }

    await calendarService.createEvent(data);
    await fetch();
    return { ok: true, message: '' };
  };

  const updateEvent = async (id: string, data: Partial<Omit<AcademicEvent, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    await calendarService.updateEvent(id, data);
    await fetch();
  };

  const deleteEvent = async (id: string): Promise<void> => {
    await calendarService.deleteEvent(id);
    await fetch();
  };

  return { events, data: events, loading, error, refresh: fetch, getEventsForDate, getEventsForMonth, createEvent, updateEvent, deleteEvent };
};
