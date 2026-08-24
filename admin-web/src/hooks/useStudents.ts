import { useState, useEffect, useCallback } from 'react';
import { UserProfile, BulkImportRow, BulkImportResult } from '../types';
import { studentService } from '../services/studentService';
import { registerMockCredential } from '../services/authService';

export const useStudents = () => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setStudents(await studentService.getAll()); setError(null); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const addStudent = async (d: any) => {
    const { confirmPassword, changePassword, ...createData } = d;
    // Pass password inside createData so Firebase service uses it for Auth user creation
    const newUser = await studentService.create({ ...createData, role: createData.role || 'student', isActive: true });
    if (import.meta.env.VITE_USE_MOCK === 'true' && createData.password) {
      registerMockCredential(newUser, createData.password);
    }
    await fetch();
  };
  const updateStudent = async (uid: string, d: any) => { await studentService.update(uid, d); await fetch(); };
  const deleteStudent = async (uid: string) => { await studentService.delete(uid); await fetch(); };
  const bulkImportStudents = async (rows: BulkImportRow[]): Promise<BulkImportResult> => {
    const r = await studentService.bulkImport(rows);
    await fetch();
    return r;
  };

  return { students, data: students, loading, error, refresh: fetch, addStudent, updateStudent, deleteStudent, bulkImportStudents };
};
