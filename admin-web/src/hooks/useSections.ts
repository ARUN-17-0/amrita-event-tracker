import { useState, useEffect, useCallback } from 'react';
import { Section } from '../types';
import { sectionService } from '../services/sectionService';

export const useSections = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setSections(await sectionService.getAll()); setError(null); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const addSection = async (d: any) => { await sectionService.create(d); await fetch(); };
  const updateSection = async (id: string, d: any) => { await sectionService.update(id, d); await fetch(); };
  const assignCR = async (sid: string, uid: string) => { await sectionService.assignCR(sid, uid); await fetch(); };
  const removeCR = async (sid: string) => { await sectionService.removeCR(sid); await fetch(); };
  const deleteSection = async (id: string) => { await sectionService.delete(id); await fetch(); };

  return { sections, data: sections, loading, error, refresh: fetch, addSection, updateSection, assignCR, removeCR, deleteSection };
};
