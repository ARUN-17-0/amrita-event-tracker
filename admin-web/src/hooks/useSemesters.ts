import { useState, useEffect, useCallback } from 'react';
import { Semester } from '../types';
import { semesterService } from '../services/semesterService';

export const useSemesters = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setSemesters(await semesterService.getAll()); setError(null); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const addSemester = async (d: any) => { await semesterService.create(d); await fetch(); };
  const updateSemester = async (id: string, d: any) => { await semesterService.update(id, d); await fetch(); };
  const toggleSemester = async (id: string) => { await semesterService.toggle(id); await fetch(); };
  const setCurrentSemester = async (id: string) => { await semesterService.setCurrent(id); await fetch(); };

  return { semesters, data: semesters, loading, error, refresh: fetch, addSemester, updateSemester, toggleSemester, setCurrentSemester };
};
