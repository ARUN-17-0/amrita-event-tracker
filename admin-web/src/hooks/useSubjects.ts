import { useState, useEffect, useCallback } from 'react';
import { Subject } from '../types';
import { subjectService } from '../services/subjectService';

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setSubjects(await subjectService.getAll()); setError(null); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const addSubject = async (d: any) => { await subjectService.create(d); await fetch(); };
  const updateSubject = async (id: string, d: any) => { await subjectService.update(id, d); await fetch(); };

  return { subjects, data: subjects, loading, error, refresh: fetch, addSubject, updateSubject };
};
