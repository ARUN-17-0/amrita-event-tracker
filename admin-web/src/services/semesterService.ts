import { Semester } from '../types';
import { mockSemesters } from '../mock/data';
import { db } from '../config/firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, Timestamp, writeBatch } from 'firebase/firestore';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';
let memorySemesters = [...mockSemesters];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockService = {
  getAll: async (): Promise<Semester[]> => { await delay(100); return [...memorySemesters]; },
  getById: async (id: string): Promise<Semester | null> => { await delay(50); return memorySemesters.find(s => s.id === id) || null; },
  create: async (data: Omit<Semester, 'id' | 'createdAt' | 'updatedAt'>): Promise<Semester> => {
    await delay(100);
    const newSem: Semester = { ...data, id: `sem-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
    if (newSem.isCurrent) memorySemesters.forEach(s => s.isCurrent = false);
    memorySemesters.push(newSem);
    return newSem;
  },
  update: async (id: string, data: Partial<Omit<Semester, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    await delay(100);
    const index = memorySemesters.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Not found');
    if (data.isCurrent) memorySemesters.forEach(s => s.isCurrent = false);
    memorySemesters[index] = { ...memorySemesters[index], ...data, updatedAt: new Date() };
  },
  toggle: async (id: string): Promise<void> => {
    await delay(100);
    const index = memorySemesters.findIndex(s => s.id === id);
    if (index !== -1) memorySemesters[index] = { ...memorySemesters[index], isActive: !memorySemesters[index].isActive, updatedAt: new Date() };
  },
  setCurrent: async (id: string): Promise<void> => {
    await delay(100);
    memorySemesters.forEach(s => { s.isCurrent = s.id === id; s.updatedAt = new Date(); });
  },
  delete: async (id: string): Promise<void> => {
    await delay(100);
    memorySemesters = memorySemesters.filter(s => s.id !== id);
  }
};

const firebaseService = {
  getAll: async (): Promise<Semester[]> => {
    if (!db) throw new Error('No FB');
    const qs = await getDocs(collection(db, 'semesters'));
    return qs.docs.map(d => ({ ...d.data(), id: d.id, startDate: d.data().startDate?.toDate(), endDate: d.data().endDate?.toDate(), createdAt: d.data().createdAt?.toDate(), updatedAt: d.data().updatedAt?.toDate() } as Semester));
  },
  getById: async (id: string): Promise<Semester | null> => {
    if (!db) throw new Error('No FB');
    const snap = await getDoc(doc(db, 'semesters', id));
    return snap.exists() ? { ...snap.data(), id: snap.id, startDate: snap.data().startDate?.toDate(), endDate: snap.data().endDate?.toDate(), createdAt: snap.data().createdAt?.toDate(), updatedAt: snap.data().updatedAt?.toDate() } as Semester : null;
  },
  create: async (data: Omit<Semester, 'id' | 'createdAt' | 'updatedAt'>): Promise<Semester> => {
    if (!db) throw new Error('No FB');
    const ref = await addDoc(collection(db, 'semesters'), { ...data, startDate: Timestamp.fromDate(data.startDate), endDate: Timestamp.fromDate(data.endDate), createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
    return { ...data, id: ref.id, createdAt: new Date(), updatedAt: new Date() } as Semester;
  },
  update: async (id: string, data: Partial<Omit<Semester, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    if (!db) throw new Error('No FB');
    const updateData: any = { ...data, updatedAt: Timestamp.now() };
    if (data.startDate) updateData.startDate = Timestamp.fromDate(data.startDate);
    if (data.endDate) updateData.endDate = Timestamp.fromDate(data.endDate);
    await updateDoc(doc(db, 'semesters', id), updateData);
  },
  toggle: async (id: string): Promise<void> => {
    if (!db) throw new Error('No FB');
    const snap = await getDoc(doc(db, 'semesters', id));
    if (snap.exists()) await updateDoc(doc(db, 'semesters', id), { isActive: !snap.data().isActive, updatedAt: Timestamp.now() });
  },
  setCurrent: async (id: string): Promise<void> => {
    if (!db) throw new Error('No FB');
    const qs = await getDocs(collection(db, 'semesters'));
    const batch = writeBatch(db);
    qs.docs.forEach(d => { batch.update(d.ref, { isCurrent: d.id === id, updatedAt: Timestamp.now() }); });
    await batch.commit();
  },
  delete: async (id: string): Promise<void> => {
    if (!db) throw new Error('No FB');
    await deleteDoc(doc(db, 'semesters', id));
  }
};

export const semesterService = isMock ? mockService : firebaseService;
