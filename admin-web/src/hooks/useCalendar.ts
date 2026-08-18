import { useState, useEffect, useCallback } from 'react';
import { AcademicEvent } from '../types';
import { calendarService } from '../services/calendarService';

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

  const getEventsForDate = async (d: Date) => calendarService.getEventsForDate(d);
  const getEventsForMonth = async (y: number, m: number) => calendarService.getEventsForMonth(y, m);

  return { events, data: events, loading, error, refresh: fetch, getEventsForDate, getEventsForMonth };
};
