import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { crService } from '../services/crService';

export const useCRs = () => {
  const [crs, setCRs] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setCRs(await crService.getAll()); setError(null); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const assignCR = async (stuId: string, secId: string) => { await crService.assignCR(stuId, secId); await fetch(); };
  const removeCR = async (stuId: string, secId: string) => { await crService.removeCR(stuId, secId); await fetch(); };

  return { crs, data: crs, loading, error, refresh: fetch, assignCR, removeCR };
};
