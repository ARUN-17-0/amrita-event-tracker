import { useState, useEffect, useCallback } from 'react';
import { Department } from '../types';
import { departmentService } from '../services/departmentService';

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const depts = await departmentService.getAll();
      setDepartments(depts);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const addDepartment = async (d: any) => { await departmentService.create(d); await fetch(); };
  const updateDepartment = async (id: string, d: any) => { await departmentService.update(id, d); await fetch(); };
  const toggleDepartment = async (id: string) => { await departmentService.toggle(id); await fetch(); };

  return { departments, data: departments, loading, error, refresh: fetch, addDepartment, updateDepartment, toggleDepartment };
};
