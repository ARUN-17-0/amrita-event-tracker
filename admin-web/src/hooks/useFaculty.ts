import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { facultyService } from '../services/facultyService';
import { registerMockCredential } from '../services/authService';

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
    const { password, confirmPassword, ...profileData } = d;
    const newUser = await facultyService.create({ ...profileData, role: 'faculty', isActive: true });
    if (import.meta.env.VITE_USE_MOCK === 'true' && password) {
      registerMockCredential(newUser, password);
    }
    await fetch();
  };
  const updateFaculty = async (uid: string, d: any) => { await facultyService.update(uid, d); await fetch(); };
  const deleteFaculty = async (uid: string) => { await facultyService.delete(uid); await fetch(); };

  return { faculty, data: faculty, loading, error, refresh: fetch, addFaculty, updateFaculty, deleteFaculty };
};
