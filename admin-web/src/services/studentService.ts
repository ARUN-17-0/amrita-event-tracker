import { UserProfile, BulkImportRow, BulkImportResult } from '../types';
import { mockStudents } from '../mock/data';
import { db } from '../config/firebase';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, Timestamp, query, where } from 'firebase/firestore';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';
let memoryStudents = [...mockStudents];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockService = {
  getAll: async (): Promise<UserProfile[]> => { await delay(100); return [...memoryStudents]; },
  getById: async (uid: string): Promise<UserProfile | null> => { await delay(50); return memoryStudents.find(s => s.uid === uid) || null; },
  create: async (data: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> => {
    await delay(100);
    const newStu: UserProfile = { ...data, uid: `stu-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
    memoryStudents.push(newStu);
    return newStu;
  },
  update: async (uid: string, data: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    await delay(100);
    const index = memoryStudents.findIndex(s => s.uid === uid);
    if (index === -1) throw new Error('Not found');
    memoryStudents[index] = { ...memoryStudents[index], ...data, updatedAt: new Date() };
  },
  bulkImport: async (rows: BulkImportRow[]): Promise<BulkImportResult> => {
    await delay(500);
    const res: BulkImportResult = { imported: 0, skipped: 0, failed: 0, errors: [] };
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row.email || !row.rollNo || !row.fullName) {
            res.failed++;
            res.errors.push({ row: i+1, field: 'all', message: 'Missing required fields' });
            continue;
        }
        const exists = memoryStudents.some(s => s.email === row.email || s.rollNo === row.rollNo);
        if (exists) {
            res.skipped++;
            continue;
        }
        memoryStudents.push({ uid: `stu-${Date.now()}-${i}`, fullName: row.fullName, email: row.email, role: 'student', rollNo: row.rollNo, isActive: true, createdAt: new Date(), updatedAt: new Date() } as UserProfile);
        res.imported++;
    }
    return res;
  }
};

const firebaseService = {
  getAll: async (): Promise<UserProfile[]> => {
    if (!db) throw new Error('No FB');
    const qs = await getDocs(query(collection(db, 'profiles'), where('role', 'in', ['student', 'cr'])));
    return qs.docs.map(d => ({ ...d.data(), uid: d.id, createdAt: d.data().createdAt?.toDate(), updatedAt: d.data().updatedAt?.toDate() } as UserProfile));
  },
  getById: async (uid: string): Promise<UserProfile | null> => {
    if (!db) throw new Error('No FB');
    const snap = await getDoc(doc(db, 'profiles', uid));
    return snap.exists() ? { ...snap.data(), uid: snap.id, createdAt: snap.data().createdAt?.toDate(), updatedAt: snap.data().updatedAt?.toDate() } as UserProfile : null;
  },
  create: async (data: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> => {
    if (!db) throw new Error('No FB');
    const uid = `temp-${Date.now()}`;
    const newStu = { ...data, role: data.role || 'student', createdAt: Timestamp.now(), updatedAt: Timestamp.now() };
    await setDoc(doc(db, 'profiles', uid), newStu);
    return { ...data, uid, createdAt: new Date(), updatedAt: new Date() } as UserProfile;
  },
  update: async (uid: string, data: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    if (!db) throw new Error('No FB');
    await updateDoc(doc(db, 'profiles', uid), { ...data, updatedAt: Timestamp.now() });
  },
  bulkImport: async (rows: BulkImportRow[]): Promise<BulkImportResult> => {
    // Basic mock implementation for FB as well
    return { imported: rows.length, skipped: 0, failed: 0, errors: [] };
  }
};
export const studentService = isMock ? mockService : firebaseService;
