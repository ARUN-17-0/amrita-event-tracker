import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { facultyService } from '../services/facultyService';

export const useFaculty = () => {
  const [faculty, setFaculty] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setFaculty(await facultyService.getAll()); setError(null); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const addFaculty = async (d: any) => {
    await facultyService.create({ ...d, role: 'faculty', isActive: true });
    await fetch();
  };
  const updateFaculty = async (uid: string, d: any) => { await facultyService.update(uid, d); await fetch(); };

  return { faculty, data: faculty, loading, error, refresh: fetch, addFaculty, updateFaculty };
};
