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
  create: async (data: any): Promise<Semester> => {
    await delay(100);
    const year = parseInt(data.year);
    const name = data.name || `${year} Batch`;
    const startDate = data.startDate || new Date(`${year}-07-01`);
    const endDate = data.endDate || new Date(`${year + 1}-05-31`);
    const isCurrent = data.isCurrent ?? false;
    const isActive = data.isActive ?? true;

    const newSem: Semester = {
      ...data,
      name,
      year: data.year,
      startDate,
      endDate,
      isCurrent,
      isActive,
      id: `sem-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
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
    return qs.docs.map(d => ({
      ...d.data(),
      id: d.id,
      name: d.data().name || `${d.data().year} Batch`,
      isActive: d.data().isActive ?? true,
      isCurrent: d.data().isCurrent ?? false,
      startDate: d.data().startDate?.toDate() || new Date(`${d.data().year || 2024}-07-01`),
      endDate: d.data().endDate?.toDate() || new Date(`${(parseInt(d.data().year) || 2024) + 1}-05-31`),
      createdAt: d.data().createdAt?.toDate() || new Date(),
      updatedAt: d.data().updatedAt?.toDate() || new Date()
    } as Semester));
  },
  getById: async (id: string): Promise<Semester | null> => {
    if (!db) throw new Error('No FB');
    const snap = await getDoc(doc(db, 'semesters', id));
    return snap.exists() ? {
      ...snap.data(),
      id: snap.id,
      name: snap.data().name || `${snap.data().year} Batch`,
      isActive: snap.data().isActive ?? true,
      isCurrent: snap.data().isCurrent ?? false,
      startDate: snap.data().startDate?.toDate() || new Date(),
      endDate: snap.data().endDate?.toDate() || new Date(),
      createdAt: snap.data().createdAt?.toDate() || new Date(),
      updatedAt: snap.data().updatedAt?.toDate() || new Date()
    } as Semester : null;
  },
  create: async (data: any): Promise<Semester> => {
    if (!db) throw new Error('No FB');
    const year = parseInt(data.year);
    const name = data.name || `${year} Batch`;
    const startDate = data.startDate || new Date(`${year}-07-01`);
    const endDate = data.endDate || new Date(`${year + 1}-05-31`);
    const isCurrent = data.isCurrent ?? false;
    const isActive = data.isActive ?? true;

    const payload = {
      ...data,
      name,
      year: String(data.year),
      isCurrent,
      isActive,
      startDate: Timestamp.fromDate(startDate),
      endDate: Timestamp.fromDate(endDate),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const ref = await addDoc(collection(db, 'semesters'), payload);
    return { ...payload, id: ref.id, startDate, endDate, createdAt: new Date(), updatedAt: new Date() } as Semester;
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
    if (snap.exists()) await updateDoc(doc(db, 'semesters', id), { isActive: !(snap.data().isActive ?? true), updatedAt: Timestamp.now() });
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
